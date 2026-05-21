const CACHE='devindra-mart-v1';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/style.css','/shared/core.js','/assets/logo-premium.png','/assets/app-icon.jpg','/assets/banner-main.jpg']))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
