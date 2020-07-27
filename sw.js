const staticCacheName = 'site-static-v2'; // This is the name of the cache that we can see in the browser
const assets = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v53/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];

// install service worker
self.addEventListener('install', evt => {
  // console.log('service worker has been installed', evt);
  // Opening/storing caches is asynchronous, so we add waitUntil() method to returned evt object parameter to prevent browser from exiting install event without caching assets.
  evt.waitUntil(  
    caches.open(staticCacheName)
      .then(cache => {
        console.log('caching shell assets');
        cache.addAll(assets); // Note: could use .add() that takes in a single parameter, but .addAll() makes sense here because I want to store a bunch of assets. The parameter for .addAll() is an array of assets.
      })
  );
});

// activate event
self.addEventListener('activate', evt => {
  // console.log('service worker has been activated', evt);
  // In order to properly implement cache versioning, we need to remove old caches from the browser. When a new instance of the app is opened, then the latest changes to service worker (and potentially updated static assets) are ready to be activated.
  evt.waitUntil(
    caches.keys()   // This returns array of keys cache storage, which are the cacheStaticNames
      .then(keys => {
        return Promise.all(   // waitUntil() method expects a single promise response, but we expect multiple keys in cache storage to check/delete. Use Promise.all() to achieve desired single promise response.
          keys
            .filter(key => key !== staticCacheName)   // Take array of keys and filter out all staticCacheName's that are not the current staticCacheName and put into new array
            .map(key => caches.delete(key))           // Map through array of old staticCacheName's and delete each key
        )
      })
  );
});

// fetch event
self.addEventListener('fetch', evt => {
  // console.log('fetch', evt);
  // resondWith() method allows us to pause fetch event and respond with a custom event.
  evt.respondWith(
    caches.match(evt.request)  // Check to see if there's a resource in the app cache that matches event object (evt) request.
      .then(cacheRes => {
        // If there is a match, then asset is returned. If not a match, then an empty response is returned so fetch request from the server.
        return cacheRes || fetch(evt.request);
      })
  )
});