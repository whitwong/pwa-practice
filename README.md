# pwa-practice
PWA Tutorial by TheNetNinja on Youtube: https://www.youtube.com/channel/UCW5YeuERMmlnqo4oq8vwUpg

### **Android Emulator**
1. Open Android Studio
1. Open Chrome browser
1. Proxy to development server using `http://127.0.0.1:5500/`

### **iOS Notes**
Safari on iOS devices will use a screenshot of the web app as the icon image if the app is added to the Home Screen. To bypass this behavior, the following lines were added to each html page `<head>`:
```
  <link rel="apple-touch-icon" href="/img/icons/icon-96x96.png">
  <meta name="apple-mobile-web-app-status-bar" content="#aa7700">  
```