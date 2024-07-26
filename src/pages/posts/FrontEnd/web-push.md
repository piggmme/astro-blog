---
title: 'Web Push | React + FCM 구현하기 (feat. pwa, service worker)'
layout: ../_MarkdownPostLayout.astro
pubDate: 2022-12-2
description: 'Web Push | React + FCM 구현하기 (feat. pwa, service worker)'
author: 'dev_hee'
image:
    url: 'https://www.elemental.agency/cms/resources/ckuploads/8Dxe3Wm5QOKM.png'
    alt: ''
tags: ["FrontEnd"]

---

## 📩 Web Push

웹에서도 네이티브 앱처럼 푸시 알람을 받을 수 있습니다.
웹의 사용성을 네이티브 앱처럼 개선하기 위해서 나온 기술인 PWA(Progressive Web Application)을 활용하면 가능합니다.

### 🚀 PWA

PWA는 Progressive Web Application으로, 웹이 **웹의 장점과 네이티브 앱의 장점**을 모두 가질수 있도록 다양한 기술들과 표준 패턴을 사용해 개발된 웹 앱을 말합니다.

PWA 는 여러 가지의 기술의 집합체이며, 대표적인 기술에는 **오프라인에서 동작, 설치, 동기화, 푸시 알림 등**이 있습니다.

PWA을 개발하기 위해서는 **`Service Worker`** 와 **`Webp App Manifest`** 를 알아야 합니다.

### ⏱ 서비스워커 - Service Worker

#### 웹 푸시 알림 - Web Push Notification 

서비스워커는 자바스크립트 파일로 **브라우저가 백그라운드에서 실행시키는 스크립트**입니다. 브라우저가 focus 되어있지 않는 백그라운드 상태에서도 서비스워커 스크립트는 실행되고 있어서 네트워크에서 Push 방식으로 전달된 메시지를 받을 수 있습니다. 즉, PWA의 주된 기술 중 하나인 **"푸시 알림"** 을 서비스워커가 백그라운드에서 실행되기 때문에 구현할 수 있습니다.

#### 오프라인에서 동작 - Offline capabilities

서비스워커는 브라우저와 네트워크 사이에서 **`프록시 서버` 역할**을 수행합니다. 브라우저에서 `fetch` 요청을 보낼 때 서비스워커는 그 요청에 대한 캐시를 가지고 있는지 확인하고, 캐시가 있다면 브라우저에게 바로 그 캐시를 전달하여 불필요한 네트워크 요청을 방지할 수 있습니다. 또한 이 기술 덕분에 오프라인에서도 동작하는 웹을 만들 수 있습니다. 즉, PWA의 주된 기술 중 하나인 **"오프라인에서 동작"** 이 서비스워커의 프록시 서버 역할에 의해 가능합니다.

### 🔖 Web App Manifest

`Manifest` 는 JSON 파일로, 앱에 대한 옵션들을 명시할 수 있습니다. 앱의 이름, 아이콘, 색상값 등이 포함됩니다. `Manifest` 파일에 정의된 값들은 앱이 설치 되었을때 보여줄 앱의 아이콘이나 이름등을 나타내게 됩니다. 


## 🤓 Web Push의 동작 방식

웹 푸시는 이름 그대로 Push 방식으로 동작합니다. 

### Pull vs. Push

#### Pull

풀 방식은 우리가 일반적으로 서버에게 `fetch` 요청을 보내는 것을 예로 들 수 있습니다. 서버에게 데이터 요청을 보내면, 서버가 이에 대한 응답으로 데이터를 보내는 방식입니다. 즉 데이터가 필요한 측에서 서버에게 먼저 **요청을 보내는 동작이 반드시 선행**되어야 합니다.

#### Push

푸쉬 방식은 풀 방식과는 반대로 **데이터를 요청할 필요가 없습니다**. 그저 서버가 클라이언트에게 **데이터를 밀어 넣어주는(push) 방식**으로 동작합니다. 


### Web Push 서비스 (feat. 서비스워커)

웹 푸시를 구현하기 위해서는 **서버와 브라우저**만 필요한 `fetch` 방식과는 다르게, **"푸시 서비스"**를 필요로 합니다.

웹 푸시 서비스는 **서버가 보낸 푸시 알림을 받아서 브라우저에게 전달**하는 역할을 합니다. 그리고 웹 푸시 서비스는 앞에서 설명한 **서비스워커**를 통해서 구현할 수 있습니다. 즉, 서비스워커 스크립트에 서버에서 보낸 알림을 받아서 브라우저에게 전달하는 코드를 작성하면 됩니다.


## 🔥 FCM (Firebase Cloud Message)

서버에서 푸시 메시지를 클라이언트에게 보내기 위해서는 **"웹 푸시 프로토콜"** 방식에 따라 메시지를 전달해야합니다. 웹 푸시 프로토콜은 푸시 알림을 수신하는 브라우저와 발송하는 서버가 상호작용하기 위해 정해놓은 규약입니다. 보안을 위해서 VAPID 인증 방식을 사용해서 메시지를 암호화 해야합니다.

직접 웹 푸시 프로토콜 방식을 구현하는 것은 어렵습니다. 다행히 웹 푸시 프로토콜 표준에 맞게 구현되어 있는 여러 라이브러리들이 존재하며, 본문에서는 FCM을 소개하려고 합니다.

FCM은 Firebase Cloud Message로 파이어베이스 기반 웹 푸시 서비스입니다.
FCM은 [firebase documents](https://firebase.google.com/docs/cloud-messaging)에 자세히 설명되어 있다. 해당 문서의 내용을 기반으로 FCM 을 사용한 웹 푸시를 리액트에서 구현해봅시다.

> 앞으로 설명드릴 FCM + CRA 예제 코드 전문은 [깃허브 코드](https://github.com/kheeyaa/FCM-with-React/blob/main/src/firebase-messaging-sw.js)를 참고하시길 바랍니다.

### 초기 설정

#### CRA 설치

먼저 리액트를 create-react-app 으로 설치합니다.


```
npx create-react-app test-messaging
```

#### firebase 설치

FCM 을 사용하기 위해서는 파이어베이스를 설치해주어야 합니다.

```
npm install firebase
```

#### firebase 콘솔에서 프로젝트 생성

파이어베이스 콘솔에서 새로운 프로젝트를 생성해야합니다.

1. [firebase 콘솔](https://console.firebase.google.com/u/0/?hl=ko)에 접속하여 로그인합니다.

2. 프로젝트를 추가하기 버튼을 클릭합니다.

3. 프로젝트 이름 작성, 구글 애널리틱스(사용 안해도 됨) 사용, 구글 애널리틱스 구성에 계정을 선택(default account)한 뒤 프로젝트 만들기 버튼을 클릭합니다.

4. `</>` 모양 버튼을 클릭합니다.

![](https://velog.velcdn.com/images/heelieben/post/2f2ae784-1c04-49c3-b8a5-3f365bb5e01e/image.png)


5. 앱 이름을 등록합니다. (호스팅 설정 하지 않아도 됨)

6. Firebase SDK 추가에서 `npm 사용` 을 체크합니다. 그리고 firebase SDK 를 복사합니다.



### Firebase 메서드 설정

복사한 firebase SDK 를 붙여넣은 `firebase-messaging-sw.js` 파일을 생성합니다. 이 스크립트는 main.js 나 App.js 처럼 루트 컴포넌트에 import 해줍니다.

여기서 사용되는 `key` 값들은 외부로 노출되면 보안상 문제가 될 수 있으므로, 환경변수로 관리하시길 바랍니다.

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

#### VAPID 키 자격 증명 설정

앞에서 설명하였듯이 Web Push 프로토콜 표준은 VAPID 인증 방식을 사용해야합니다. FCM은 VAPID 인증을 쉽게 제공해줍니다. 따라서 VAPID 키를 발급 받아야 하며, 해당 키는 웹 푸시 메시지의 토큰을 발급 받는데 사용하게 됩니다.

따라서 VAPID 키를 발급받기 위해 다음을 이행합니다.

1. [firebase 콘솔](https://console.firebase.google.com/u/0/?hl=ko)에 접속하여 로그인합니다.

2. 프로젝트 개요 옆 관리 버튼 > 프로젝트 설정 > 클라우드 메시징으로 들어갑니다.

3. 웹 푸시 인증서 생성 버튼을 클릭합니다. (Generate Key Pair)
![](https://velog.velcdn.com/images/heelieben/post/fc1b98fc-3d1a-456d-b62a-b66dfef6a157/image.png)

4. 생성된 키를 복사합니다. VAPID 키 또한 보안을 위해 환경변수로 관리하는 것이 좋습니다.

#### 앱에서 웹 자격 증명 구성

발급 받은 VAPID 키를 `getToken` 메서드에게 전달하여 토큰을 발급받습니다.
VAPID 토큰은 백엔드 개발자가 필요로 할 수 있으므로 api로 전달하면 됩니다.

```js
import { getToken } from 'firebase/messaging';

const token = await getToken(messaging, {
  vapidKey: process.env.REACT_APP_VAPID_KEY,
});
```

### Notification 권한 설정

![](https://velog.velcdn.com/images/heelieben/post/76132d85-2dc8-4a5e-ae91-ff21a970f040/image.png)


브라우저에서 Notification [알림을 받을지 권한 설정](https://firebase.google.com/docs/cloud-messaging/js/client#access_the_registration_token)이 필요합니다.
`Notification.requestPermission` 으로 알림 권한 설정 팝업을 노출합니다. 만약 이미 권한이 허용된 경우엔 바로 permission에 "granted" 또는 "denied" 를 담아 보내줍니다. 아니라면 사용자가 권한을 허용/차단 한 뒤 그 결과("granted", "denied")를 담아 보내줍니다.

```js
function requestPermission() {
  console.log("권한 요청 중...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("알림 권한이 허용됨");

      // FCM 메세지 처리
    } else {
      console.log("알림 권한 허용 안됨");
    }
  });
}
```

주의해야 할 점은, 한번 `Notification.requestPermission` 로 노출한 팝업은 **[사용자가 허용/차단 하면 다시 프로그래밍 방식으로 팝업 노출이 불가능하다는 점](https://devjonas.medium.com/trigger-notification-popup-with-javascript-9f5849c2ee9c)**입니다.

만약 토글 버튼을 통해 사용자가 알림을 on/off 하고 싶다면 다음 방식으로만 가능합니다.

- 서버에서 알림을 보낼지 말지를 on/off 상태로 저장한다.
- 브라우저 알림 권한은 허용된 채, 서버측에 알림을 on/off 하는지 설정만 바꿔준다.

초기에 사용자가 알림을 차단했다면, 사용자가 직접 브라우저 설정으로 들어가 변경해주어야 합니다. 또한 **프로그래밍 방식으로 브라우저 설정 링크를 open 해주는 것은 보안상 금지**되어 있기 때문에, 브라우저 설정 가이드라인을 제시하는 방법을 택해야 합니다.


### Service Worker 설정

웹 푸시를 구현하기 위해서는 서비스 워커를 설정해야 합니다.
서비스워커 스크립트 파일은 `public` 폴더에 `firebase-message-sw.js` 라는 이름으로 따로 생성해주어야 합니다. 파일명이 반드시 `firebase-message-sw.js` 이어야 FCM 서비스를 이용할 수 있습니다.

![](https://velog.velcdn.com/images/heelieben/post/26df9474-73ca-45fa-ab2e-405ac446f1b5/image.png)

> [깃허브에서 서비스워커 코드 전문을 참고하세요.](https://github.com/kheeyaa/FCM-with-React/blob/main/public/firebase-messaging-sw.js)


#### Service Worker 설치 및 활성화

서비스워커 스크립트가 설치되고 활성화 되었는지 "install" 과 "activat" 이벤트로 확인할 수 있습니다.
`self` 는 `WorkerGlobalScope` 인터페이스의 읽기 전용 프로퍼티로, [`WorkerGlobalScope` 자체의 참조값 반환](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/self)합니다. 

```js
self.addEventListener("install", function (e) {
  console.log("fcm sw install..");
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  console.log("fcm sw activate..");
});
```
서비스워커 스크립트에 백그라운드일 때에도 알림을 받을 수 있도록 이벤트를 등록할 수 있습니다.

#### Web push 알림 노출

Web push 알림을 "push" 이벤트로 확인할 수 있습니다.
`e` 이벤트 객체의 `data` 프로퍼티에는 웹 푸시 알림에 대한 옵션들을 확인할 수 있습니다.

`self.registration.showNotification(title, options)` 메서드를 사용해서 직접 웹 푸시에 대한 알림을 노출할 수 있습니다. 서비스워커는 백그라운드 환경에서도 동작하므로 브라우저가 focus 되어 있는 상태가 아니더라도 알림이 노출됩니다.

만약 웹 푸시 알림에 이미지가 삽입되었으면 한다면, `options` 값에 `icon` 프로퍼티를 추가해야 합니다. 


```js
self.addEventListener("push", function (e) {
  if (!e.data.json()) return;

  const resultData = e.data.json().notification;
  const notificationTitle = resultData.title;
  const notificationOptions = {
    body: resultData.body,
    icon: resultData.image, // 웹 푸시 이미지는 icon
    tag: resultData.tag,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

#### Web push 알림 클릭 핸들러

만약 웹 푸시 알림을 클릭했을 때 어떤 URL 을 열어주는 등과 같은 추가적인 기능을 구현하고 싶다면 "notificationclick" 이벤트를 사용하면 됩니다.

```js
self.addEventListener("notificationclick", function (event) {
  console.log("notification click");
  const url = "/";
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
```

### Web Push 알림 보내기

이제 웹 푸시 알림을 테스트용으로 보내봅시다.

1. [firebase 콘솔](https://console.firebase.google.com/u/0/?hl=ko)에 접속하여 로그인합니다. 

2. 왼쪽 네비게이션 메뉴의 참여 > Messaging

![](https://velog.velcdn.com/images/heelieben/post/8716e30f-d60a-4413-8bea-070d6dbdccc8/image.png)

3. 메인 영역에서 오른쪽 상단에 "새 캠페인" > "알림" 생성

4. 알림 제목, 텍스트, 이미지, 이름을 작성한 뒤 "테스트 메시지 전송" 버튼 클릭

5. FCM 등록 토큰을 추가합니다. 해당 토큰은 `getToken` 을 통해 발급받은 토큰입니다. 추가 후 "테스트" 버튼을 클릭하면 알림이 보내집니다. 




## 😢 Web Push 디자인 & 한계점

Web push의 경우엔 Web API 의 Notification 를 사용해서 알림을 띄우는데,
이 api 는 컨텐츠 내용을 수정할 수만 있고, **스타일링이 불가능**합니다.
즉 OS 에서 제공하는 기본 스타일이 적용된 채로 알림이 보여질수밖에 없습니다.

그 외에도 다양한 한계점이 한계점이 다음과 같이 존재합니다.

- 제목, 내용의 글자수 제한/말줄임표 등의 스타일링을 할 수 없습니다.
- 알림에 표시되는 URL을 숨길 수 없습니다. (브라우저 정책에 의해서)
- 알림을 확장하는 기능을 커스텀할 수 없습니다.
- Web Push 는 이제 사파리에서 지원 가능하지만, FCM 이 아직 사파리에서 지원하지 않습니다.

## 📚 웹 푸시 개발시 참고하면 좋은 사이트

### Notification Examples

https://web-push-book.gauntface.com/demos/notification-examples/

푸시 알림에 대한 예제가 잘 나와있는 사이트입니다.
본문에서는 설명하지 않은 `Action Buttons` 등과 같은 여러 기능들에 대한 예제를 직접 확인할 수 있습니다.

### PWA articles

https://felixgerschau.com/tags/pwa/

웹 푸시 기능을 제공하는 PWA 기술에 대한 아티클을 볼 수 있습니다.

### 웹 푸시 알림에 대해 잘 설명된 글

https://geundung.dev/114

웹 푸시 알림에 대해서 그림과 예제를 통해서 잘 설명되어 있는 블로그 포스트입니다.


> 참고
- [웹 푸시 알림(Web Push Notification)](https://geundung.dev/114)
- [ervice Workers Explained - Introduction to the JavaScript API](https://felixgerschau.com/service-workers-explained-introduction-javascript-api/)
- [PWA에 대한 생각](https://mozi.vercel.app/blog/thinking-about-pwa) 
- [firebase documents](https://firebase.google.com/docs/cloud-messaging)




