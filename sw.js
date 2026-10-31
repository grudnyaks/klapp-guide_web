// KLAPP Гид — офлайн-кэш для установки на iPhone и Android с сайта
const V='klapp-guide-v' + '4.3';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
// с 3.9 фото препаратов — отдельные файлы: заранее кладём их в кэш, чтобы всё работало без интернета
async function precache(){const c=await caches.open(V);await c.addAll(FILES);
  try{const m=await (await fetch('./content/manifest.json',{cache:'no-store'})).json();
    const ph=[...new Set(Object.values(m.ph||{}))].map(h=>'./content/ph/'+h+'.webp');
    for(let i=0;i<ph.length;i+=12){await Promise.allSettled(ph.slice(i,i+12).map(u=>c.add(u)));}}catch(e){}}
self.addEventListener('install',e=>{e.waitUntil(precache().then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// фото по отпечатку не меняются — сразу из кэша; остальное — сначала сеть, без сети — кэш
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=e.request.url;
  if(/\/content\/ph\/[0-9a-f]{16}\.webp$/.test(u)){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const cp=x.clone();caches.open(V).then(c=>c.put(e.request,cp));return x;})));return;}
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
