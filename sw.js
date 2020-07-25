// install service worker
self.addEventListener('install', evt => {
  console.log('service worker has been installed', evt);
});

// activate event
self.addEventListener('activate', evt => {
  console.log('service worker has been activated', evt);
});

// fetch event
self.addEventListener('fetch', evt => {
  console.log('fetch', evt);
});