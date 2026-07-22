// D&R Rummy Wilds — offline cache (network-first, cache fallback)
var CACHE='rummy-wilds-v23';
var CORE=['.','index.html','apple-touch-icon.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var sameOrigin=e.request.url.indexOf(self.location.origin)===0;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(sameOrigin&&r&&r.ok){
        var cp=r.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,cp);}).catch(function(){});
      }
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){return m||caches.match('index.html');});
    })
  );
});
