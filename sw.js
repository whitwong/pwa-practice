const staticCacheName = 'site-static-v2'; // This is the name of the cache that we can see in the browser
const dynamicCacheName = 'site-dynamic-v1';
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
  'https://fonts.gstatic.com/s/materialicons/v53/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/pages/fallback.html'
];

// Cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name)
    .then(cache => {
      cache.keys().then(keys => {   // cache.keys() will return an array of keys of the cache.
        if(keys.length > size) {    // Check to see if the length of the array is greater than the specified limit.
          cache.delete(keys[0])     // If the length exceeds the limit, then delete the key at the 0-index.
            .then(limitCacheSize(name, size))   // Repeat asset deletion until # of assets meet specified limit.
        }
      })
    })
}

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
            .filter(key => key !== staticCacheName && key !== dynamicCacheName)   // Take array of keys and filter out all staticCacheName's that are not the current staticCacheName and put into new array
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
        // If there is a match, then cached asset is returned. If not a match then an empty response is returned, so fetch request from the server.
        // Now go ahead and store the request/response from the server into a dynamic cache for user to access later.
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            // Use .put() method to add the req/res to dynamicCache. 
            // We use .put() method instead of .add() or .addAll() because those methods make request to the server to get those assets and then store in the cache. 
            // In our case, we already made a request to the server and got a response back, so instead we want to use .put() method to put req/res into the cache.
            // .put() takes in 2 arguments: request url and response. Cannot return fetchRes to browser and use it as an argument in .put() method, so store copy of fetchRes as the argument using .clone() method.
            cache.put(evt.request.url, fetchRes.clone());
            // Limit the cache size after putting new assets in dynamic cache
            limitCacheSize(dynamicCacheName, 15);
            return fetchRes;    // Return fetch response to browser.
          })
        });
      })
      .catch(() => {
        if(evt.request.url.indexOf('.html') > -1) {    // Added conditional here to only serve up this fallback page if the user is trying to access a page offline that they haven't visited before. Don't want to serve this page everytime an asset, such as an image or css, cannot be fetched. 
          return caches.match('/pages/fallback.html')  // If page asset is not found in any caches and the user is offline, then the Promise will fail and we'll handle this by serving up the fallback page to the user.
        }
      })  
  );
});