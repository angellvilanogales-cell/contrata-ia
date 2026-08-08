export const PWA_MANIFEST = JSON.stringify({
  name: "Contrata-IA · Asistente de Contratación Pública",
  short_name: "Contrata-IA",
  description: "Preparación guiada, validación humana y generación documental de expedientes de contratación pública.",
  id: "/",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "any",
  background_color: "#f4f6f7",
  theme_color: "#176b45",
  lang: "es",
  categories: ["business", "productivity"],
  icons: [
    { src: "/icons/contrata-ia.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
  ]
}, null, 2);

export const PWA_ICON_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Contrata-IA">
  <rect width="512" height="512" rx="104" fill="#176b45"/>
  <path fill="#fff" d="M128 104h256c18 0 32 14 32 32v240c0 18-14 32-32 32H128c-18 0-32-14-32-32V136c0-18 14-32 32-32Zm40 72v40h176v-40H168Zm0 80v32h176v-32H168Zm0 72v32h112v-32H168Z"/>
  <circle cx="342" cy="344" r="54" fill="#fff"/>
  <path d="m320 344 15 15 31-34" fill="none" stroke="#176b45" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// La PWA solo conserva el shell público. Nunca cachea /api, expedientes, fichas ni documentos generados.
export const PWA_SERVICE_WORKER = `const CACHE='contrata-ia-shell-v1';
const SHELL=['/','/manifest.webmanifest','/icons/contrata-ia.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')) return;
  if(!SHELL.includes(url.pathname)) return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;})));
});`;
