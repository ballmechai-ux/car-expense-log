const CACHE = "car-log-v2";
const CORE = ["./", "./index.html", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// network-first: ได้หน้าเวอร์ชันล่าสุดเสมอ ถ้าออฟไลน์ค่อยใช้ที่แคชไว้
// ข้อมูล Firestore/Auth ไม่ผ่านตรงนี้ (ไม่ดักคำขอข้ามโดเมนนอกจาก gstatic/fonts)
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const ok = url.origin === location.origin ||
             url.hostname === "www.gstatic.com" ||
             url.hostname === "fonts.googleapis.com" ||
             url.hostname === "fonts.gstatic.com";
  if (!ok) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
