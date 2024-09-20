---
title: '자주 만나는 CORS 에러 해결하기'
layout: ../_MarkdownPostLayout.astro
pubDate: 2024-9-20
description: '자주 만나는 CORS 에러 해결하기'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/55d79723-5c38-4013-a7b6-c113d9944bb2/image.png'
    alt: ''
tags: ["Web"]

---

## 서론

CORS 에러는 프론트엔드에 서버 API를 붙이는 작업을 할 때 자주 만나게 된다.
그렇다면 CORS 에러는 무엇이고 어떻게 해결할 수 있는지 알아보자.

## CORS 이전에 Same Origin Policy를 알아야 한다.

웹 브라우저는 사용자 데이터를 보호하기 위해 **Same Origin Policy(SOP)** 라는 보안 정책을 적용한다. 이 정책은 하나의 도메인에서 로드된 웹 페이지가 다른 도메인의 리소스에 접근하는 것을 제한한다. 여기서 "Origin"이란 도메인, 프로토콜, 포트 번호가 모두 동일한 것을 말한다. 예를 들어, `https://example.com:80`와 `https://example.com:8080`은 같은 도메인이지만 포트 번호가 다르기 때문에 서로 다른 Origin으로 간주된다.

**SOP**는 악의적인 웹 사이트가 사용자 정보나 데이터를 탈취하는 것을 방지하기 위해 중요한 역할을 하지만, 이를 통해 다른 도메인에서 데이터를 가져오거나 API를 호출할 수 없다는 제약이 생긴다. 그래서 등장한 것이 **Cross-Origin Resource Sharing(CORS)** 이다. CORS는 여러 도메인 간의 안전한 데이터 공유를 가능하게 하며, 특정한 조건 하에서 교차 출처 요청을 허용할 수 있게 한다.

## CORS (Cross-Origin Resource Sharing)

**CORS(Cross-Origin Resource Sharing)** 는 웹 브라우저에서 다른 출처의 리소스에 접근할 수 있도록 허용하는 보안 기능이다. 브라우저가 특정 웹 페이지에서 외부 서버에 API 요청을 보낼 때, SOP에 의해 기본적으로 이러한 요청이 차단되는데, 이때 CORS 정책을 통해 요청이 허용될 수 있다. CORS는 서버가 클라이언트의 요청에 대해 "이 요청은 안전하며 허용된다"는 신호를 브라우저에 전달할 수 있게 한다.

CORS 에러는 브라우저에서 발생하는 대표적인 보안 오류 중 하나이다. 예를 들어, 프론트엔드 애플리케이션이 https://api.example.com에 데이터를 요청하는데, 이 서버에서 CORS 설정이 제대로 되어 있지 않다면 브라우저는 해당 요청을 차단하고 다음과 같은 에러 메시지를 보여준다:

```csharp
Access to XMLHttpRequest at 'https://api.example.com' from origin 'https://frontend.example.com' has been blocked by CORS policy.
```

즉, CORS 에러는 서버가 브라우저에 리소스를 제공할 준비가 되지 않았다는 신호로 볼 수 있다.

## CORS Error 케이스

CORS Error 가 발생하는 상황을 순서도로 설명하면 다음과 같다.

<img alt="CORS 에러 예시" src="/images/web_cors_error.png" />

1. 클라이언트 측 (`https://www.example.com`)에서 App.js는 `https://api.example.com` 서버에 데이터를 요청하기 위해 `GET /todos` 요청을 보낸다.

2. 이 요청은 브라우저의 보안 정책에 의해 교차 출처 요청(Cross-Origin Request)이므로 `Same-Origin Policy`에 의해 제한된다.

3. 브라우저는 이 요청을 처리하기 전에 서버에서 **CORS 허용 헤더가 있는지** 확인하지만, 서버에서 CORS 관련 헤더가 설정되지 않아 CORS 에러가 발생한다.

브라우저가 교차 출처 요청을 차단함으로써 데이터의 접근을 제한하는 케이스이다.

## CORS Success 케이스

Access-Control-Allow-Origin 헤더를 추가해서 CORS 에러를 해결하는 경우는 다음과 같다.

<img alt="CORS 성공 예시" src="/images/web_cors_success.png" />

1. 클라이언트 측 (`https://www.example.com`)에서 App.js는 `https://api.example.com` 서버에 데이터를 요청하기 위해 `GET /todos` 요청을 보낸다.

2. 서버는 클라이언트의 요청을 수락할 준비가 되어 있으며, 응답 헤더에 `Access-Control-Allow-Origin` 헤더를 추가한다. 이 헤더는 `https://www.example.com` 도메인에서의 요청을 허용한다는 것을 나타낸다.

3. 서버에서 응답이 전달될 때 브라우저는 **CORS 허용 헤더**를 확인하고, 교차 출처 요청을 허용하게 된다.

## CORS를 해결하기 위한 방법

CORS 문제를 해결하기 위해서는 서버와 클라이언트 측에서 각각 적절한 조치를 취해야 한다.

### 1. 서버에서 해결: Access-Control-Allow-Origin 헤더 설정

서버에서 CORS 문제를 해결하려면, HTTP 응답 헤더에 `Access-Control-Allow-Origin` 을 설정해 특정 출처의 요청을 허용해야 한다. 예를 들어, 다음과 같이 **모든 도메인**에서의 요청을 허용할 수 있다:

```http
Access-Control-Allow-Origin: *
```

단, 이렇게 모든 도메인에서 요청을 허용하게 된다면, **클라이언트에서 요청을 보낼 때 자격 증명(`credentials`) 관련 옵션을 제거해주어야 한다.** `fetch`, `axios` 둘 다 자격 증명에 관한 옵션들은 기본값이 off 이지만, 명시적으로 제거해준다면 다음과 같다.

#### fetch

```js
// fetch의 credentials 기본값은 'same-origin'으로, 같은 origin에선 credentials을 포함하지만 다른 origin에 대해선 credentials이 포함되지 않도록 설정되어 있음.
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'same-origin' // 또는 'omit'
})
```

#### axios

```js
// axios의 withCredentials 기본값은 false로, credentials이 포함되지 않도록 설정되어 있음.
axios.get('https://api.example.com/data', {
  withCredentials: false // 기본 값임
})
```

그렇다면 자격 증명(`credentials`)이란 무엇일까? 자격 증명은 쿠키, 인증 정보, 세션 정보등을 말하며 클라이언트에서 서버로 요청을 보낼 때 해당 정보들을 함께 전송할지를 결정하는 속성이다. 예를 들어, API 요청 시 사용자 로그인 정보를 포함하거나, 세션 기반 인증을 사용해야할 때 이 옵션이 필요하다.

아래와 같이 요청을 보낸다면 해당 요청은 쿠키나 세션 정보를 포함하게 된다. 단, 서버 응답 헤더에 `Access-Control-Allow-Origin: *` 로 설정된 경우엔 자격 증명 정보를 포함하여 요청을 보낼 수 없다([참고로 브라우저가 중간에서 `Preflight Request` 메커니즘을 통해 요청 전송이 가능한지 확인한다.](https://developer.mozilla.org/ko/docs/Glossary/Preflight_request)):

```js
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include', // 자격 증명 포함하여 요청 전송
});

axios.get('https://api.example.com/data', {
  withCredentials: true  // 자격 증명 포함하여 요청 전송
})
```

인증이 필요한 요청을 하는 경우엔 모든 도메인이 허용되는 경우는 제한되며, 보안상으로도 모든 도메인을 허용하는 것은 권장되지 않기 때문에 다음과 같이 특정 도메인만 허용하는 것이 좋다:

```http
Access-Control-Allow-Origin: https://frontend.example.com
```

또한 서버는 어떤 HTTP 메서드가 허용되는지 지정할 수 있다. 예를 들어, GET과 POST 요청만 허용하려면 다음과 같이 입력하면 된다.:

```http
Access-Control-Allow-Methods: GET, POST
```

추가로 클라이언트에서 보낼 수 있는 특정 헤더를 지정할 수도 있다:

```http
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. 프론트엔드 개발 환경에서 해결: 프록시 서버

만약 개발 환경에서 CORS를 해결하고 싶다면 프록시 서버를 설정하여 해결할 수 있다.

프록시 서버는 클라이언트와 API 서버 사이에 위치해 요청을 중계함으로써 CORS 문제를 회피할 수 있다. 예를 들어, React 애플리케이션에서는 package.json에 프록시 설정을 추가할 수 있다:

```json
"proxy": "https://api.example.com"
```

만약 `Vite` 개발 환경이라면 아래와 같이 `vite.config.js` 파일에서 프록시 설정을 추가할 수 있다.

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'로 시작하는 요청을 https://api.example.com으로 프록시
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,   // 타겟 서버의 Origin을 변경
        rewrite: (path) => path.replace(/^\/api/, ''),  // 경로에서 /api를 제거
        secure: false         // https 환경에서 self-signed certificate 문제 해결
      },
    },
  },
});
```

- proxy 속성: Vite 개발 서버는 특정 경로로 들어오는 요청을 타겟 서버로 프록시할 수 있다. 위 예시에서는 /api로 시작하는 모든 요청을 https://api.example.com으로 프록시한다.
- target: 프록시할 타겟 서버의 주소를 지정한다. 이 예시에서는 https://api.example.com이 됩니다.
- changeOrigin: true: 원래 요청의 호스트(Origin)를 타겟 서버로 변경한다. 이 설정은 대부분의 CORS 문제를 해결한다.
- rewrite: (path) => path.replace(/^\/api/, ''): 경로 재작성 기능으로, /api로 시작하는 경로를 타겟 서버로 보낼 때 /api 부분을 제거한다. 예를 들어, /api/todos는 https://api.example.com/todos로 변환된다.
- secure: false: HTTPS 환경에서 자체 서명된 인증서를 사용하는 경우 설정하는 옵션이다. 실제 프로덕션 환경에서는 secure: true로 설정하는 것이 권장된다.

이렇게 프론트엔드 개발 환경에서 프록시 서버를 설정하게 되면, 브라우저 개발자 도구의 네트워크 탭에서 요청을 확인하면 요청 URL이 localhost로 표시된다.

<img alt="네트워크탭 예시" src="/images/web_cors_example.png" />

#### 프록시 서버의 역할

프록시 서버는 클라이언트와 실제 서버 사이에 위치하여 클라이언트의 요청을 받아, 대신 외부 서버에 전달하고 그 응답을 다시 클라이언트에 전달하는 역할을 한다. Vite 개발 서버는 이 프록시 기능을 통해, 클라이언트에서 요청한 API 호출을 처리하고, 이를 외부 서버로 프록시한다.

#### 요청이 `localhost`로 표시되는 이유

프록시 서버를 설정한 경우, 브라우저는 클라이언트(프론트엔드)가 Vite 개발 서버(즉, `localhost`)에 직접 요청을 보내는 것으로 인식한다. 실제로 API 요청은 브라우저에서 `localhost` (예: `http://localhost:3000/v1/user/myProfile`)로 전송되며, 이 요청을 Vite 개발 서버가 받아서 지정한 외부 서버(예: `https://api.example.com/v1/user/myProfile`)로 전달한다.

따라서 브라우저 관점에서 보면 요청은 `localhost`로 보내졌고, 응답도 `localhost`에서 받은 것처럼 보이기 때문에, 개발자 도구의 네트워크 탭에는 요청 URL이 `localhost`로 표시된다.

즉, **프론트엔드 개발환경에서의 프록시 서버는 서버에서 CORS설정을 해주지 않았을 경우, 브라우저에서 CORS 에러가 발생하지 않고 정상적으로 응답을 받아서 처리하기 위한 우회 방법이다.** 브라우저 입장에서는 `localhost`로 두 origin이 동일하기 때문에 CORS 에러를 발생시키지 않는다. 이는 실제 배포 환경에서와는 관계가 없는 설정이기 때문에 운영환경에 대한 설정 및 테스트는 앞에서 언급한 **`방법 1.서버에서 해결: Access-Control-Allow-Origin 헤더 설정`** 을 통해 해결해야 한다.

## 결론

CORS는 웹 보안의 중요한 부분으로, 웹 애플리케이션이 여러 도메인 간에 안전하게 데이터를 주고받을 수 있도록 보장한다. 하지만 설정이 적절히 이루어지지 않으면 브라우저에서 CORS 에러가 발생할 수 있으며, 이를 해결하기 위해서는 서버에서 필요한 헤더를 설정하거나, 개발 환경에서는 프록시 서버를 사용하는 방법 등을 고려해야 한다. 이를 통해 교차 출처 요청을 안전하게 처리하고, 애플리케이션의 동작을 원활하게 유지할 수 있다.