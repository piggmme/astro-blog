---
title: 'Fixing the CORS Errors You Run Into All the Time'
pubDate: 2024-9-20
description: 'Fixing the CORS Errors You Run Into All the Time'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/55d79723-5c38-4013-a7b6-c113d9944bb2/image.png'
    alt: ''
tags: ["Web"]

---

## Introduction

You often run into CORS errors when hooking up server APIs to a frontend.
So let's look at what a CORS error is and how to fix it.

## Before CORS, You Need to Know the Same Origin Policy.

To protect user data, web browsers apply a security policy called the **Same Origin Policy (SOP)**. This policy restricts a web page loaded from one domain from accessing resources on another domain. Here, "Origin" means the domain, protocol, and port number are all the same. For example, `https://example.com:80` and `https://example.com:8080` have the same domain, but because their port numbers differ, they're considered different Origins.

**SOP** plays an important role in preventing malicious websites from stealing user information or data, but it also introduces the constraint that you can't fetch data or call APIs from other domains. That's where **Cross-Origin Resource Sharing (CORS)** comes in. CORS enables safe data sharing across multiple domains and allows cross-origin requests under certain conditions.

## CORS (Cross-Origin Resource Sharing)

**CORS (Cross-Origin Resource Sharing)** is a security feature that allows a web browser to access resources from a different origin. When the browser sends an API request from a web page to an external server, SOP blocks such requests by default, but the request can be allowed through the CORS policy. CORS lets the server signal to the browser that "this request is safe and allowed" in response to the client's request.

The CORS error is one of the most common security errors that occur in the browser. For example, if a frontend application requests data from https://api.example.com and CORS isn't set up properly on that server, the browser blocks the request and shows an error message like this:

```csharp
Access to XMLHttpRequest at 'https://api.example.com' from origin 'https://frontend.example.com' has been blocked by CORS policy.
```

In other words, a CORS error can be seen as a signal that the server isn't ready to provide resources to the browser.

## CORS Error Case

Here's a flowchart explaining the situation in which a CORS Error occurs.

<img alt="CORS error example" src="/images/web_cors_error.png" />

1. On the client side (`https://www.example.com`), App.js sends a `GET /todos` request to request data from the `https://api.example.com` server.

2. Because this request is a Cross-Origin Request under the browser's security policy, it's restricted by the `Same-Origin Policy`.

3. Before processing this request, the browser checks whether the server has **CORS allow headers**, but since the server hasn't set any CORS-related headers, a CORS error occurs.

This is the case where the browser restricts access to the data by blocking the cross-origin request.

## CORS Success Case

Here's the case where the CORS error is resolved by adding the Access-Control-Allow-Origin header.

<img alt="CORS success example" src="/images/web_cors_success.png" />

1. On the client side (`https://www.example.com`), App.js sends a `GET /todos` request to request data from the `https://api.example.com` server.

2. The server is ready to accept the client's request and adds the `Access-Control-Allow-Origin` header to the response headers. This header indicates that requests from the `https://www.example.com` domain are allowed.

3. When the response is delivered from the server, the browser checks the **CORS allow header** and allows the cross-origin request.

## Ways to Fix CORS

To fix CORS issues, appropriate measures need to be taken on both the server and client sides.

### 1. Fixing it on the server: Setting the Access-Control-Allow-Origin header

To fix CORS issues on the server, you need to set `Access-Control-Allow-Origin` in the HTTP response headers to allow requests from specific origins. For example, you can allow requests from **all domains** like this:

```http
Access-Control-Allow-Origin: *
```

However, if you allow requests from all domains like this, **you need to remove credential (`credentials`) related options when sending requests from the client.** In both `fetch` and `axios`, credential-related options are off by default, but if you remove them explicitly, it looks like this.

#### fetch

```js
// fetch's default credentials value is 'same-origin', which includes credentials for the same origin but is set not to include credentials for other origins.
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'same-origin' // or 'omit'
})
```

#### axios

```js
// axios's default withCredentials value is false, which is set not to include credentials.
axios.get('https://api.example.com/data', {
  withCredentials: false // this is the default value
})
```

So what are credentials (`credentials`)? Credentials refer to cookies, authentication info, session info, etc., and this is the property that determines whether that information is sent along when the client sends a request to the server. For example, you need this option when including the user's login info in an API request, or when you need to use session-based authentication.

If you send a request like the one below, the request will include cookies or session info. However, if the server response header is set to `Access-Control-Allow-Origin: *`, you can't send a request that includes credentials ([for reference, the browser checks in between whether the request can be sent via the `Preflight Request` mechanism.](https://developer.mozilla.org/ko/docs/Glossary/Preflight_request)):

```js
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include', // send the request with credentials included
});

axios.get('https://api.example.com/data', {
  withCredentials: true  // send the request with credentials included
})
```

When making requests that require authentication, allowing all domains is restricted, and allowing all domains isn't recommended from a security standpoint either, so it's better to allow only specific domains like this:

```http
Access-Control-Allow-Origin: https://frontend.example.com
```

The server can also specify which HTTP methods are allowed. For example, to allow only GET and POST requests, you can enter the following.:

```http
Access-Control-Allow-Methods: GET, POST
```

You can also specify particular headers the client is allowed to send:

```http
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. Fixing it in the frontend development environment: Proxy server

If you want to resolve CORS in the development environment, you can do so by setting up a proxy server.

A proxy server sits between the client and the API server and relays requests, which lets you sidestep CORS issues. For example, in a React application, you can add a proxy setting to package.json:

```json
"proxy": "https://api.example.com"
```

If you're in a `Vite` development environment, you can add the proxy setting in the `vite.config.js` file like below.

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests starting with '/api' to https://api.example.com
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,   // change the Origin to the target server's
        rewrite: (path) => path.replace(/^\/api/, ''),  // remove /api from the path
        secure: false         // work around self-signed certificate issues in https environments
      },
    },
  },
});
```

- proxy property: The Vite dev server can proxy requests coming in on specific paths to a target server. In the example above, all requests starting with /api are proxied to https://api.example.com.
- target: Specifies the address of the target server to proxy to. In this example, it's https://api.example.com.
- changeOrigin: true: Changes the host (Origin) of the original request to the target server. This setting resolves most CORS issues.
- rewrite: (path) => path.replace(/^\/api/, ''): A path-rewriting feature that removes the /api part when sending paths starting with /api to the target server. For example, /api/todos is converted to https://api.example.com/todos.
- secure: false: An option you set when using a self-signed certificate in an HTTPS environment. In an actual production environment, setting it to secure: true is recommended.

Once you set up a proxy server in the frontend development environment like this, if you check the request in the Network tab of the browser's developer tools, the request URL is shown as localhost.

<img alt="Network tab example" src="/images/web_cors_example.png" />

#### The role of the proxy server

A proxy server sits between the client and the actual server, receives the client's request, forwards it to the external server on the client's behalf, and then passes that response back to the client. Through this proxy feature, the Vite dev server handles API calls requested by the client and proxies them to the external server.

#### Why requests show up as `localhost`

When a proxy server is set up, the browser perceives the client (frontend) as sending requests directly to the Vite dev server (i.e., `localhost`). In reality, the API request is sent from the browser to `localhost` (e.g., `http://localhost:3000/v1/user/myProfile`), and the Vite dev server receives this request and forwards it to the specified external server (e.g., `https://api.example.com/v1/user/myProfile`).

So from the browser's point of view, the request was sent to `localhost` and the response also appears to have been received from `localhost`, which is why the request URL is shown as `localhost` in the Network tab of the developer tools.

In other words, **a proxy server in the frontend development environment is a workaround that lets the browser receive and handle responses normally, without a CORS error, when the server hasn't configured CORS.** From the browser's perspective, both origins are the same `localhost`, so it doesn't raise a CORS error. Since this setting has nothing to do with the actual deployment environment, configuration and testing for the production environment should be handled through **`Method 1. Fixing it on the server: Setting the Access-Control-Allow-Origin header`** mentioned earlier.

## Conclusion

CORS is an important part of web security that ensures web applications can safely exchange data across multiple domains. However, if it isn't configured properly, CORS errors can occur in the browser, and to fix them you should consider methods such as setting the necessary headers on the server or using a proxy server in the development environment. This way, you can handle cross-origin requests safely and keep your application running smoothly.
