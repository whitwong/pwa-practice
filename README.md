# pwa-practice
PWA Tutorial by The Net Ninja on Youtube: https://www.youtube.com/channel/UCW5YeuERMmlnqo4oq8vwUpg

---

This README is a container for the notes I'm keeping while going through the video tutorials.

### **Android Emulator**
1. Open Android Studio
1. Open Chrome browser
1. Proxy to development server using: `http://127.0.0.1:5500/`

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
You want to place your service worker js file in the root directory of your project so that it can access all the files in your project. If placed in a subdirectory, the service worker scope is only within that subdirectory (so...not good). 
1. Register the service worker (sw.js) with the browser. You do this by registering service worker in the main app js file (app.js). This tells the browser that sw.js is a service worker and needs to run on the separate thread from the rest of the app.
1. The browser fires the *install event* (a lifecycle event), which installs the service worker. This install event only fires once, when the service worker is registered.
    - We can listen for the *install event* in the service worker itself and perform an action (e.g. cache available assets for potential offline use later).
1. After the service worker is registered, the service worker becomes active and the browser will fire an *active event*. The service worker can listen for this event as well.
    - Once the service worker is active, it can access all the files within its scope and listen for events. This includes fetch/http requests.
1. When page is reloaded/refreshed, the service worker is still registered and won't re-install. But if changes have been made to service worker file since the last page load, then the service worker will be re-installed. However, the old service worker will remain active (the new service worker remains *in waiting* status) until all instances of the app are closed (e.g. app is closed or all tabs are closed in the browser). At that point, the new service worker will become active at the next app open.

### **Service Worker Dev Options**
In Chrome Inspector, under Application tab: enabled "Update on Reload" option for Service Worker changes. This is to help streamline development and prevent having to close application every time a change is made to sw.js to implement changes.