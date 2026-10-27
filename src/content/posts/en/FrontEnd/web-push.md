---
title: 'Web Push | Implementing React + FCM (feat. pwa, service worker)'
pubDate: 2022-12-2
description: 'Web Push | Implementing React + FCM (feat. pwa, service worker)'
author: 'dev_hee'
image:
    url: 'https://www.elemental.agency/cms/resources/ckuploads/8Dxe3Wm5QOKM.png'
    alt: ''
tags: ["FrontEnd"]

---

## 📩 Web Push

On the web, too, you can receive push notifications just like a native app.
It's possible by using PWA (Progressive Web Application), a technology that came out to improve the usability of the web to be like native apps.

### 🚀 PWA

PWA stands for Progressive Web Application, and refers to a web app developed using various technologies and standard patterns so that the web can have **both the advantages of the web and the advantages of native apps**.

PWA is a collection of several technologies, and the representative ones include **working offline, installation, sync, push notifications, etc.**

To develop a PWA, you need to know about **`Service Worker`** and **`Webp App Manifest`**.

### ⏱ Service Worker

#### Web Push Notification 

A service worker is a JavaScript file, a **script that the browser runs in the background**. Even in the background state where the browser isn't focused, the service worker script keeps running, so it can receive messages delivered from the network via Push. In other words, because the service worker runs in the background, **"push notifications"**, one of the main technologies of PWA, can be implemented.

#### Offline capabilities

A service worker plays the **role of a `proxy server`** between the browser and the network. When the browser sends a `fetch` request, the service worker checks whether it has a cache for that request, and if there is a cache, it can deliver that cache to the browser right away, preventing unnecessary network requests. Also, thanks to this technology, you can build a web that works even offline. In other words, **"working offline"**, one of the main technologies of PWA, is made possible by the service worker's role as a proxy server.

### 🔖 Web App Manifest

`Manifest` is a JSON file where you can specify options for the app. It includes the app's name, icon, color values, etc. The values defined in the `Manifest` file represent things like the app icon and name to be shown when the app is installed. 


## 🤓 How Web Push works

As the name says, web push works in a Push manner. 

### Pull vs. Push

#### Pull

An example of the pull method is how we normally send `fetch` requests to the server. When you send a data request to the server, the server sends data in response. In other words, the side that needs the data **must first send a request to the server**.

#### Push

The push method, in contrast to the pull method, **doesn't need to request data**. It simply works by the server **pushing data to the client**. 


### Web Push service (feat. service worker)

To implement web push, unlike the `fetch` method which only needs **a server and a browser**, you need a **"push service"**.

The web push service plays the role of **receiving push notifications sent by the server and delivering them to the browser**. And the web push service can be implemented via the **service worker** explained earlier. That is, you just need to write code in the service worker script that receives notifications sent from the server and delivers them to the browser.


## 🔥 FCM (Firebase Cloud Message)

To send push messages from the server to the client, you have to deliver messages according to the **"Web Push Protocol"**. The Web Push Protocol is a set of rules defined so that the browser receiving push notifications and the server sending them can interact. For security, messages must be encrypted using the VAPID authentication method.

Implementing the Web Push Protocol yourself is difficult. Fortunately, there are several libraries implemented according to the Web Push Protocol standard, and in this post I'd like to introduce FCM.

FCM is Firebase Cloud Message, a Firebase-based web push service.
FCM is explained in detail in the [firebase documents](https://firebase.google.com/docs/cloud-messaging). Based on the content of that documentation, let's implement web push using FCM in React.

> For the full FCM + CRA example code I'll be explaining, please refer to the [GitHub code](https://github.com/kheeyaa/FCM-with-React/blob/main/src/firebase-messaging-sw.js).

### Initial setup

#### Install CRA

First, install React with create-react-app.


```
npx create-react-app test-messaging
```

#### Install firebase

To use FCM, you need to install Firebase.

```
npm install firebase
```

#### Create a project in the firebase console

You need to create a new project in the Firebase console.

1. Go to the [firebase console](https://console.firebase.google.com/u/0/?hl=ko) and log in.

2. Click the Add project button.

3. Enter the project name, use Google Analytics (you don't have to), select an account in the Google Analytics configuration (default account), and then click the Create project button.

4. Click the `</>` shaped button.

![](https://velog.velcdn.com/images/heelieben/post/2f2ae784-1c04-49c3-b8a5-3f365bb5e01e/image.png)


5. Register the app name. (You don't need to set up hosting)

6. In Add Firebase SDK, check `npm 사용`. Then copy the firebase SDK.



### Setting up Firebase methods

Create a `firebase-messaging-sw.js` file with the copied firebase SDK pasted in. Import this script into the root component, like main.js or App.js.

The `key` values used here can be a security problem if exposed externally, so please manage them as environment variables.

```js
// firebase-messaging-sw.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: <user-api-key>,
  authDomain: <user-auth-domain>,
  projectId: <user-project-id>,
  storageBucket:  <user-storage-bucket>,
  messagingSenderId:  <user-messaging-sender-id>,
  appId: <user-app-id>,
  measurementId: <user-measurement-id>,
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

#### Setting up VAPID key credentials

As explained earlier, the Web Push protocol standard must use the VAPID authentication method. FCM makes VAPID authentication easy. So you need to get a VAPID key issued, and that key is used to get the token for web push messages.

So, to get a VAPID key issued, do the following.

1. Go to the [firebase console](https://console.firebase.google.com/u/0/?hl=ko) and log in.

2. Go to the settings button next to Project Overview > Project settings > Cloud Messaging.

3. Click the generate web push certificate button. (Generate Key Pair)
![](https://velog.velcdn.com/images/heelieben/post/fc1b98fc-3d1a-456d-b62a-b66dfef6a157/image.png)

4. Copy the generated key. It's also a good idea to manage the VAPID key as an environment variable for security.

#### Configuring web credentials in the app

Pass the issued VAPID key to the `getToken` method to get a token.
The backend developer may need the VAPID token, so you can send it via an api.

```js
import { getToken } from 'firebase/messaging';

const token = await getToken(messaging, {
  vapidKey: process.env.REACT_APP_VAPID_KEY,
});
```

### Setting Notification permission

![](https://velog.velcdn.com/images/heelieben/post/76132d85-2dc8-4a5e-ae91-ff21a970f040/image.png)


The browser needs a [permission setting for whether to receive Notification alerts](https://firebase.google.com/docs/cloud-messaging/js/client#access_the_registration_token).
Show the notification permission popup with `Notification.requestPermission`. If permission has already been granted, it immediately sends back "granted" or "denied" in permission. Otherwise, after the user allows/blocks the permission, it sends back the result ("granted", "denied").

```js
function requestPermission() {
  console.log("권한 요청 중...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("알림 권한이 허용됨");

      // Handle FCM messages
    } else {
      console.log("알림 권한 허용 안됨");
    }
  });
}
```

One thing to be careful about is that, for a popup shown once with `Notification.requestPermission`, **[once the user allows/blocks it, the popup can't be shown again programmatically](https://devjonas.medium.com/trigger-notification-popup-with-javascript-9f5849c2ee9c)**.

If you want users to turn notifications on/off through a toggle button, it's only possible in the following way.

- Store on the server, as an on/off state, whether to send notifications.
- Keep the browser notification permission allowed, and only change the server-side setting for whether notifications are on/off.

If the user blocked notifications initially, the user has to go into the browser settings themselves and change it. Also, since **opening the browser settings link programmatically is forbidden for security reasons**, you have to choose the approach of presenting browser settings guidelines.


### Service Worker setup

To implement web push, you need to set up a service worker.
The service worker script file has to be created separately in the `public` folder with the name `firebase-message-sw.js`. The file name must be `firebase-message-sw.js` for you to be able to use the FCM service.

![](https://velog.velcdn.com/images/heelieben/post/26df9474-73ca-45fa-ab2e-405ac446f1b5/image.png)

> [See the full service worker code on GitHub.](https://github.com/kheeyaa/FCM-with-React/blob/main/public/firebase-messaging-sw.js)


#### Installing and activating the Service Worker

You can check whether the service worker script has been installed and activated with the "install" and "activat" events.
`self` is a read-only property of the `WorkerGlobalScope` interface that [returns a reference to the `WorkerGlobalScope` itself](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/self). 

```js
self.addEventListener("install", function (e) {
  console.log("fcm sw install..");
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  console.log("fcm sw activate..");
});
```
You can register events in the service worker script so that notifications can be received even in the background.

#### Showing Web push notifications

You can check Web push notifications with the "push" event.
In the `data` property of the `e` event object, you can find the options for the web push notification.

You can show the notification for a web push yourself using the `self.registration.showNotification(title, options)` method. Since the service worker runs even in a background environment, the notification is shown even when the browser isn't focused.

If you want an image to be included in the web push notification, you need to add the `icon` property to the `options` value. 


```js
self.addEventListener("push", function (e) {
  if (!e.data.json()) return;

  const resultData = e.data.json().notification;
  const notificationTitle = resultData.title;
  const notificationOptions = {
    body: resultData.body,
    icon: resultData.image, // The web push image is icon
    tag: resultData.tag,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

#### Web push notification click handler

If you want to implement additional functionality, such as opening some URL when the web push notification is clicked, you can use the "notificationclick" event.

```js
self.addEventListener("notificationclick", function (event) {
  console.log("notification click");
  const url = "/";
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
```

### Sending Web Push notifications

Now let's send a web push notification for testing.

1. Go to the [firebase console](https://console.firebase.google.com/u/0/?hl=ko) and log in. 

2. In the left navigation menu, Engage > Messaging

![](https://velog.velcdn.com/images/heelieben/post/8716e30f-d60a-4413-8bea-070d6dbdccc8/image.png)

3. In the top right of the main area, create "New campaign" > "Notifications"

4. Write the notification title, text, image, and name, then click the "Send test message" button

5. Add the FCM registration token. This token is the one issued via `getToken`. After adding it, click the "Test" button and the notification is sent. 




## 😢 Web Push design & limitations

In the case of Web push, notifications are shown using the Web API's Notification,
and this api only lets you modify the content, **styling is not possible**.
That is, notifications can only be shown with the default style provided by the OS applied.

Besides that, there are various limitations, limitations as follows.

- You can't do styling like character limits/ellipsis for the title and content.
- You can't hide the URL displayed in the notification. (Due to browser policy)
- You can't customize the feature for expanding notifications.
- Web Push is now supported in Safari, but FCM doesn't support Safari yet.

## 📚 Useful sites to refer to when developing web push

### Notification Examples

https://web-push-book.gauntface.com/demos/notification-examples/

A site with good examples of push notifications.
You can directly check examples of various features not explained in this post, such as `Action Buttons`.

### PWA articles

https://felixgerschau.com/tags/pwa/

You can read articles on PWA technology, which provides the web push feature.

### A well-explained post on web push notifications

https://geundung.dev/114

A blog post that explains web push notifications well through diagrams and examples.


> References
- [Web Push Notification](https://geundung.dev/114)
- [ervice Workers Explained - Introduction to the JavaScript API](https://felixgerschau.com/service-workers-explained-introduction-javascript-api/)
- [Thoughts on PWA](https://mozi.vercel.app/blog/thinking-about-pwa) 
- [firebase documents](https://firebase.google.com/docs/cloud-messaging)




