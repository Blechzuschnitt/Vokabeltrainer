/* Service Worker: macht die App installierbar und ohne Internet startbar.
   - Seite, Programm und Aussehen: zuerst aus dem Netz (damit Updates sofort ankommen), ohne Netz aus dem Zwischenspeicher.
   - Bilder, Schriften, 3D-Bibliothek: zuerst aus dem Zwischenspeicher.
   - Anfragen an Supabase oder andere Server fasst er nicht an. */
const CACHE = "vokabel-klasse-v1";
const SHELL = ["./", "index.html", "styles.css", "app.js", "datenschutz.html", "manifest.webmanifest",
  "assets/fox.webp", "assets/turtle.webp", "assets/owl.webp", "assets/dragon.webp", "assets/joker.webp", "assets/double.webp", "assets/shield.webp",
  "assets/fonts/lilita-one-latin.woff2", "assets/fonts/lilita-one-latin-ext.woff2", "assets/fonts/nunito-latin.woff2", "assets/fonts/nunito-latin-ext.woff2",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "vendor/three.min.js"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  const fresh = req.mode === "navigate" || /\.(html|js|css|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
  const store = res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  e.respondWith(fresh
    ? fetch(req).then(store).catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match("index.html")))
    : caches.match(req).then(r => r || fetch(req).then(store)));
});
