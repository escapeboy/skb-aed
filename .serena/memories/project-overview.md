# skb-aed — AED карта за Спасителен клуб за Бъдеще (СКБ)

Статичен сайт (Leaflet + OpenStreetMap), форк на `avd-karlovo`, брандиран за СКБ, **национален обхват (България)**.
GitHub: `git@github.com:escapeboy/skb-aed.git` (branch `main`). Домейн: `https://aed.spasitelen.club/`.
Хостинг по модела на оригинала: Cloudflare Pages, `git push` към `main` → auto deploy.

## Файлове
- `index.html` — картата, целият UI + CSS + JS inline
- `pomosht.html` — първа помощ + AED (ERC 2025); НЕ се пипа медицинското съдържание
- `data/defibrillators.geojson` — единственото, което се редактира редовно
- `assets/skb-logo.png` — логото (свалено, без hotlink)
- `og.svg`/`og.png` — социални картинки (рендирани с `rsvg-convert -w 1200 -h 630`)
- `manifest.webmanifest`, `sw.js` (VERSION `aed-v8`), `_headers`, `sitemap.xml`, `robots.txt`

## Бранд (извлечен, не познат)
- СКБ зелено `#009344` (логото-пръстен), червено `#ed1c24` (щит). Elementor на spasitelen.club е стандартен default → брандът е в логото.
- CSS променливи: `--brand`/`--brand-d` за обвивката (хедър, футър, splash, акценти, вторични бутони).
- ЗАПАЗВАТ семантика, НЕ се пипат: зелен AED пин `#008a3e` (межд. стандарт) + червена лента „112" `#d6201f`.

## Donor модел (дарени от СКБ)
- В `properties` се добавя `"donor": "skb"`. Маркиран: ПГ по ЖПТ „Христо Смирненски", Карлово (първият AED, дарен от СКБ).
- Рендиране: зелен AED пин, но логото на СКБ е **в центъра вместо сърцето** (вградено като `<image>` ВЪТРЕ в SVG-то, clip към кръг). HTML overlay/ъглов бадж НЕ работи — Leaflet дава на `svg` z-index, та overlay-ят винаги се крие зад пина/съседите. Същото и за пина в списъка.
- Popup + карта в списъка: ред „Дарен от Спасителен клуб за Бъдеще" (връзка към сайта). Легенда на картата разграничава „Дарен от СКБ".

## Mobile bottom sheet (index.html)
- <880px: картата е цял екран; панелът със списъка е плъзгащ се bottom sheet (дръжка `#sheetHandle`, свито = `--peek` ~210px, разгънато = `.expanded` 88dvh; tap toggle; drag mouse+touch). Футърът е ВЪТРЕ в панела.
- ≥880px: статичен sidebar 380px (десктоп media query нулира sheet стиловете).
- Легенда: горе-вдясно на телефон, долу-вляво на десктоп (`#map .legend` за специфичност, защото базовото правило е по-късно в CSS).
- `focusPoint` на мобилно свива sheet-а и центрира маркера над него (offsetY -40).

## Остава / бележки
- DNS: насочи `aed.spasitelen.club` към хостинга.
- Други дарени AED: добавяш `"donor":"skb"` към точката — автоматично получава лого-пин + popup ред + легенда.
- Footer: слоган „Вярваме, че заедно можем повече", връзки spasitelen.club + Facebook (id=61550562526461), „© Спасителен клуб за Бъдеще".

## Gotchas
- `curl` е aliased (bat) → ползвай `/usr/bin/curl`.
- geojson `coordinates` са `[lng, lat]`.
- Локална проверка: `python3 -m http.server`; `/pomosht` clean-URL работи в prod (Cloudflare), локално тествай `pomosht.html`.
