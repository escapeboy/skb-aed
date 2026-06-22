/* AED България (СКБ) — service worker: offline shell + data + map tiles */
const VERSION = "aed-v8";
const SHELL = "aed-shell-" + VERSION;
const DATA  = "aed-data-"  + VERSION;
const TILES = "aed-tiles-" + VERSION;
const TILE_MAX = 350; // keep the tile cache bounded

const SHELL_ASSETS = [
  "/", "/pomosht", "/manifest.webmanifest",
  "/favicon.svg", "/favicon-32.png", "/assets/skb-logo.png",
  "/img/compression.jpg", "/img/aed-pads.png", "/img/recovery.jpg",
  "/img/choke-backblows.jpg", "/img/choke-heimlich.jpg",
  "/icons/icon-192.png", "/icons/icon-512.png",
  "/icons/maskable-512.png", "/icons/apple-touch-icon.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", function(e){
  e.waitUntil((async function(){
    const c = await caches.open(SHELL);
    // allSettled: one cross-origin miss must not abort the whole install
    await Promise.allSettled(SHELL_ASSETS.map(function(u){
      return c.add(new Request(u, {cache:"reload"}));
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", function(e){
  e.waitUntil((async function(){
    const keep = [SHELL, DATA, TILES];
    const keys = await caches.keys();
    await Promise.all(keys.map(function(k){ return keep.indexOf(k)===-1 ? caches.delete(k) : null; }));
    await self.clients.claim();
  })());
});

function isTile(url){ return /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname); }

async function trim(name, max){
  const c = await caches.open(name);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", function(e){
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // GeoJSON data — network-first so edits show up, cache fallback when offline
  if (url.pathname.endsWith("defibrillators.geojson")) {
    e.respondWith((async function(){
      try {
        const fresh = await fetch(req);
        const c = await caches.open(DATA); c.put(req, fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  // OSM tiles — cache-first, runtime cached, bounded
  if (isTile(url)) {
    e.respondWith((async function(){
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        const c = await caches.open(TILES); c.put(req, fresh.clone());
        trim(TILES, TILE_MAX);
        return fresh;
      } catch (_) { return cached || Response.error(); }
    })());
    return;
  }

  // HTML document — network-first so edits are picked up immediately; cache fallback offline
  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith((async function(){
      try {
        const fresh = await fetch(req);
        const c = await caches.open(SHELL); c.put(req, fresh.clone()); // cache each page under its OWN url
        return fresh;
      } catch (_) {
        // offline: serve the same page from cache; only as a last resort fall back to the map
        return (await caches.match(req)) || (await caches.match("/")) || Response.error();
      }
    })());
    return;
  }

  // Static assets (icons, leaflet, css, js, manifest) — cache-first, runtime cached
  e.respondWith((async function(){
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (url.origin === location.origin || /unpkg\.com$/.test(url.hostname)) {
        const c = await caches.open(SHELL); c.put(req, fresh.clone());
      }
      return fresh;
    } catch (_) {
      return Response.error();
    }
  })());
});
