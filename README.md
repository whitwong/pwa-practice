# pwa-practice
PWA Tutorial by The Net Ninja on Youtube: https://www.youtube.com/channel/UCW5YeuERMmlnqo4oq8vwUpg

---

This README is a container for the notes I'm keeping while going through the video tutorials.

### **manifest.json**
Requirement for PWA. Object contains essential information about PWA.
- `name`: App name that will appear on splash screen
- `short_name`: App name that will appear on device Home Screen
- `start_url`: Route that app will initialize at
- `display`: Set to standalone. This will enable app to appear without the browser bar and look more like a native app
- `background_color`: Color of splash screen
- `theme_color`: Tints UI elements with this color
- `orientation`: Orientation app initially opens to, in this case it's portrait
- `icons`: Array of objects pointing to image assets. Used for Home Screen and splash screen icons.

### **Android Emulator**
1. Open Android Studio
1. Open Chrome browser
1. Proxy to development server using: `http://127.0.0.1:5500/`
1. After requirements for 'Add Home Screen Banner' are met ([see criteria here](https://web.dev/install-criteria/)), proxy address `http://127.0.0.1:5500/` will not be enough to check that the banner feature works on the emulator. Do the following to address this issue:
    - Service workers require `https` protocol to run, and the development proxy does not provide this protocol.
    - To fix this so that we can use the service worker, go to three dots in Chrome Dev Tools (next to settings gear) and go down to 'More Tools' --> 'Remote Devices' or go to [chrome://inspect/#devices](chrome://inspect/#devices). Chrome should already have detected the emulator.
    - Enable 'Port Forwarding' and add rule (Port: `5500`, IP address and port: `localhost:5500`)
    - Go back to the device emulator and delete any instances of the app and close all browser window/tabs with the app. Re-open Chrome in the emulator. For the web address, replace `http://127.0.0.1:5500/` with `localhost:5500` and the banner should 

### **iOS Notes**
Safari on iOS devices will use a screenshot of the web app as the icon image if the app is added to the Home Screen. To bypass this behavior, the following lines were added to each html page `<head>`:
```
  <link rel="apple-touch-icon" href="/img/icons/icon-96x96.png">
  <meta name="apple-mobile-web-app-status-bar" content="#aa7700">  
```

### **Service Workers**
Super important in making a PWA behave like a native app. They do this by performing the following:
- Load content offline. Allows users to access the app without an internet connection and interact with the app using cached assets and data.
- Use background sync. Allows users to perform actions that usually require a network connection (e.g. post a status update) and will perform an action in the background once the connection is re-established.
- Use push notifications. App can notify users of something like changes, reminders, updates, etc.

The main app js is tightly coupled with the DOM content. Service workers are js files that run on a separate thread from normal js files. They run in another part of the browser and are *isolated* from the html. Service workers do not interact directly with the DOM. They run in the background (*a background process*) and even run when the app is closed. They listen and react to different events in the browser.

### **Service Worker Lifecycle**
You want to place your service worker js file in the root directory of your project so that it can access all the files in your project. If placed in a subdirectory, the service worker scope is only within that subdirectory (so...not good). Events include: `install, activate, fetch`.
1. Register the service worker (sw.js) with the browser. You do this by registering service worker in the main app js file (app.js). This tells the browser that sw.js is a service worker and needs to run on the separate thread from the rest of the app.
1. The browser fires the `install event` (a lifecycle event), which installs the service worker. This install event only fires once, when the service worker is registered.
    - We can listen for the `install event` in the service worker itself and perform an action (e.g. cache available assets for potential offline use later).
    - Generally want to cache the core resources that make up the user interface. These are static assets like the core html, static images, logo, core/static css, etc. This is also called the 'app shell'.
    - Shell model approach to PWAs: Where the shell is the core layout and styling. 
    - A good place to pre-cache these assets is at the `install event`.
    - Assets are requests (aka urls) made to the server.
    - What is stored in the cache? Keys = requests & Values = responses from the server.
1. After the service worker is registered, the service worker becomes active and the browser will fire an `activate event`. The service worker can listen for this event as well.
    - Once the service worker is active, it can access all the files within its scope and listen for events. This includes fetch/http requests.
    - Use the `activate event` to verson control static assets.
        - Changing cache name (staticCacheName in project) can be used to version control static assets. This is because changes to service worker will trigger `install event` and force caching of any potential new changes to static assets.
        - The .open() method during the `install event` only creates or opens caches. Doesn't check versioning/changes of the cache name, so several caches can be made and then the browser has a hard time knowing which cache to reference for requests (aka won't know to use the cache version with the latest changes). Caches persist in the browser, so may never see latest changes to static assets unless old caches are removed.
        - To fix this, add functionality to `activate event` in order to remove old cache(s). Old version of cache(s) will persist until user closes all instances of app. When app is reopened, new version of service worker (which was **in waiting** status) is activated and latest version of cached assets will be used because old caches will be deleted. 
1. When page is reloaded/refreshed, the service worker is still registered and won't re-install. But if changes have been made to service worker file since the last page load, then the service worker will be re-installed. However, the old service worker will remain active (the new service worker remains **in waiting** status) until all instances of the app are closed (e.g. app is closed or all tabs are closed in the browser). At that point, the new service worker will become active at the next app open.
1. `Fetch event` is another type of event that the service worker can listen for. The service worker is another layer between the app and the server. This is useful when data is cached in the browser to provide a quicker experience for the user, instead of waiting for a request to come back from the server the app can used cached assets/data. This is also useful for when the app is opened offline, to provide (some) usability when not connected to the network.
1. Caching
    1. Fetch cached static assets (app shell):
        - Intercept fetch requests to the server and check to see if there are pre-cached assets in the `fetch event` that match the requst. 
        - If there is a match, pause request to the server and return the cached resource instead. 
        - If there isn't a match, resume request to server.
    2. Dynamic Caching
        - Don't want to add every page/asset in app to static assets cache on initial load of app. This can increase load time and slow down response to user (bad user experience). Also doesn't makes sense to load every asset because user may never navigate or use particular features and it's a waste of resources to have assets cached that the user may never see. 
        - But if a user does navigate to a page outside of the cached static assets while online, it's beneficial to dynamically add those assets. That way they can have access to the assets if they were to ever go offline.
        - We want to store these dynamic assets in a different cache than our static assets. This way we keep our app shell separate from any other dynamic assets.
        - We can dynamically cache assets in the `fetch event` and can build off the resumed fetch request/response from the server. Use the .put() method to store request/response as key/value pair and return the initial fetch response back to the browser.
        - Make sure to check on versioning of dynamic cache in `activate event` and make sure to include condition to prevent dynamic cache from being filtered as a cache to delete from cache storage.
    3. Offline Fallback Page
        - If user tries to access a page asset offline that is not cached already, then the default is get an error page from the browser. This looks terrible and makes the app look like it's crashed.
        - Instead, make a fallback offline page that can be served up for this scenario. Much better user experience.
        - Include fallback page as part of the app shell to be precached on initial load of app.
    4. Conditional Fallbacks
        - There a lot of strategies on how to handle offline behavior of an app. 
        - In this project, went over one scenario on returning a fallback html page if user tries to specifically navigate to an html page offline that was not previously cached. The behavior before adding this condition would cause the fallback page to be returned even if an asset that couldn't be retrieved offline was an image or css. Additional conditions could be made to handle these scenarios as well (e.g. send back dummy/default image as fallback).
    5. Limit Chaching Size
        - Dynamic caching can get bloated if assets are constantly being added and not removed. 
        - One example of how to handle this bloating is to create a function to remove old assets to a certain limit after a new asset is added to the cache.


### **Service Worker Dev Options in Chrome**
- In Chrome Dev Tools, under Application tab: enabled "Update on Reload" option for Service Worker changes. This is to help streamline development and prevent having to close application every time a change is made to sw.js to implement changes.
- Chrome Lighthouse Audit: Audit/Lighthouse option in Chrome Dev Tools. Check 'Progressive Web App' and 'Generate Report' and Chrome will perform audit of application 🎉
    - Useful tool to use as a checklist to make sure app meets PWA requirements
    - Good practice to audit app periodically 
- To develop caching with service workers and test 'offline' in browser:
    - Set network offline by doing either of the following:
        - Application tab --> Service Workers --> check 'Offline' 
        - Network tab --> set 'Online' to 'Offline'.
    - Check 'Disable cache' in browser (which is not directly controlled by devs and manages itself) under the 'Network' tab. Want to develop cache storage by using service workers.
- While developing for cache versioning, disable/uncheck 'Update on reload' option in Application --> Service Workers.

### **Firebase**
Using Firebase Firestore as the db for this project. Opened project under dev account. Provisioned db and registered the app. Added scripts for accessing Firebase db to index.html.

Storing documents in `recipes` collection. Document ids are auto-generated. Documents have fields for:
- title
- ingredients

When first adding and testing db with real-time data, comment out `fetch event` actions in service worker. Don't want to cache data transactions with db. We'll handle browser data storage via IndexedDB (see section below).

onSnapshot() is a method we can use on a Firebase collection to listen for any changes to that collection. This serves as a way for us to track db changes in real-time and then update the UI accordingly (keep UI and backend in sync). 

### **IndexedDB**
While offline or not connected to a network, we can't reach Firebase to serve up data. We don't want to cache data like with our html and static assets because we could be constantly sending old/outdated information.

Instead we can use a modern web browser feature called `IndexedDB`, which is basically a db within the browser. When we're online and getting data from our db, we can store this data (if we want to) in `IndexedDB` so that if we're offline in the future we have data we can use.

If we're offline and want to add data (or perform other CRUD actions), then that data can be stored in IndexedDB. Changes in IndexedDB can then be pushed up to our Firebase db upon a re-established network connection. Likewise, any data changed in our Firebase db can then be sent to IndexedDB and update the app accordingly. Everything is synced back up.

If we used a different db than Firebase Firestore, then we would need to access IndexedDB manually and communicate with IndexedDB directly. However, since we're using Firestore it already has tools built into the library that make it simple to interact with IndexedDB (e.g. store data from db into IndexedDB and sync up automatically with Firestore on re-connection).

With data persistence enabled (see db.js) with IndexedDB, add back in caching in the `fetch event` with an added condition. Only cache assets as long as they are not data transactions with Firestore.