const staticISBNscanner = "ISBNscanner-v1";
const assets = [
    "/book-isbn-scanner/",
    "/book-isbn-scanner/index.html",
    "/book-isbn-scanner/style.css",
    "/book-isbn-scanner/script.js",
    "/book-isbn-scanner/isbn.min.js",
    "/book-isbn-scanner/manifest.json",
    "/book-isbn-scanner/assets/angry.png",
    "/book-isbn-scanner/assets/camera-icon.png",
    "/book-isbn-scanner/assets/exit-fullscreen-icon.png",
    "/book-isbn-scanner/assets/fullscreen-icon.png",
    "/book-isbn-scanner/assets/ok.png",
    "/book-isbn-scanner/assets/restart-icon.png",
    "/book-isbn-scanner/assets/site-icon.webp",
    "/book-isbn-scanner/assets/TankobonCoverMissing.webp",
    "/book-isbn-scanner/assets/app_icon/maskable_icon_x72.png",
    "/book-isbn-scanner/assets/app_icon/maskable_icon_x96.png",
    "/book-isbn-scanner/assets/app_icon/maskable_icon_x128.png",
    "/book-isbn-scanner/assets/app_icon/maskable_icon_x192.png",
    "/book-isbn-scanner/assets/app_icon/maskable_icon_x384.png",
    "/book-isbn-scanner/booksite_assets/amazon_logo.svg",
    "/book-isbn-scanner/booksite_assets/barnesandnoble_logo.svg",
    "/book-isbn-scanner/booksite_assets/goodreads_logo.svg",
    "/book-isbn-scanner/booksite_assets/google_logo.svg",
    "/book-isbn-scanner/booksite_assets/thestorygraph_icon.png",
    "/book-isbn-scanner/booksite_assets/worldcat_logo.svg",
    "/book-isbn-scanner/booksite_templates/booksites_us.js",
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticISBNscanner).then(cache => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener("fetch", fetchEvent => {
    if (fetchEvent.request.url.includes("book-isbn-scanner")) {
        fetchEvent.respondWith(
            caches.match(fetchEvent.request).then(cacheResponse => {
                return cacheResponse || fetch(fetchEvent.request);
            })
        );
    }
});