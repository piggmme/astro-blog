---
title: 'React 18 Concurrent Rendering'
pubDate: 2023-7-4
description: 'Concurrency, introduced in React 18, improved the performance of the rendering engine and enhanced the user experience. '
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/3584fec5-1cc6-46ed-8280-88a4c0506bba/image.jpg'
    alt: ''
tags: ["React"]

---

## React 18

Concurrency, introduced in React 18, improved the performance of the rendering engine and enhanced the user experience. 

## 📌 Concurrent Rendering

### Concurrency

In React, concurrency means **more than one task progressing at the same time**.
Concurrent tasks can overlap depending on which task is more **urgent**. 

Let's take the example of writing something while on a phone call. While the other person is talking, writing will have the higher priority, and when you need to answer the other person's question, answering will have a higher priority than writing. Like this, at many points during the process of speaking and writing, tasks are carried out based on which one is more urgent.

Because JavaScript is single-threaded, it can't perform other tasks at the same time while it's performing one task. Since React is also based on JavaScript, it's single-threaded too. However, **with the introduction of concurrency in React, it can handle multiple tasks at the same time**.

You might be thinking: if JavaScript is single-threaded, isn't concurrency impossible in React?
But concurrency here isn't multi-threading — **it splits multiple tasks into small units, sets priorities among those tasks, and alternates between them accordingly. Because switching between tasks happens very quickly, it looks as if multiple tasks are being performed at the same time.**

### Why introduce concurrency

Before React 18, **rendering was a single synchronous process that couldn't be interrupted**. So once rendering started, it couldn't be paused/resumed/discarded. Without concurrency support, **if rendering takes a long time, the next task to be performed gets blocked, causing the application to stutter**. 

Let's look at why concurrency is needed with concrete examples.

#### When the next task is delayed because of a heavy task in progress (limits of Debounce and Throttle)

You've probably had the bad experience of input stuttering when a heavy task runs every time the user types into an `input`. Things like waiting a long time for a network response, or creating a huge number of DOM elements, fall into this category. 

> This is an example that creates 10000 DOM elements on every user input. 
> You can see that even though text is typed quickly, the input goes in slowly.
> https://playcode.io/1523275
> ![](https://velog.velcdn.com/images/heelieben/post/a070756b-6b36-4263-b9c5-d59d03acdd8d/image.gif)


This kind of problem could be solved with **Debounce and Throttle**, but they had limitations.

- Debounce
The heavy task is performed after a certain amount of time has passed since the user's last input. Because of this, **no matter how powerful the computer you're using is, you always have to wait a certain amount of time.** Wasting a fixed amount of time like this just to run the next heavy task is a clear limitation.

- Throttle
It solves debounce's drawback that heavy processing doesn't happen while the user is typing, because it periodically performs the heavy task during input. However, this too can cause the problem that **the shorter you make the throttle interval, the more it stutters on low-performance devices**.

> Concurrency can solve the limitations of Debounce and Throttle, because tasks can be performed at the same time without waiting a fixed amount of time. So the heavy computation for UI rendering and other tasks can proceed at the same time.


## 🌟 Concurrent Mode 

To set up Concurrent Mode, just use `createRoot` instead of the old `render`.
Once set to Concurrent Mode, you can use the **improved features** and the `startTransition`, `useTransition`, and `useDeferredValue` hooks for **concurrent processing**.

- Old React 17
```ts
import ReactDOM from 'react-dom';
import App from 'App';

const container = document.getElementById('app'); 

ReactDOM.render(<App />, container);
```

- React 18
```ts
import ReactDOM from 'react-dom';
import App from 'App'; 

const container = document.getElementById('app'); 

// Create a root.
const root = ReactDOM.createRoot(container); 

// Render the app through the root.
root.render(<App />);
```

## 🔥 Automatic Batching

When updating multiple pieces of state that change the UI, if they're handled separately, the UI will change multiple times. If the state is updated all at once, the UI only needs to change once, so the number of renders can be reduced. Handling state updates in a batch like this is called `Automatic Batching`.

`Automatic Batching` was applied even before React 18. However, it only handled state changes **inside event handlers** all at once.

```ts
const handleClick = () => {
  setCounter(prev => prev + 1);
  setActive();
  setValue();
  setCounter(prev => prev + 1);
};

// Updates the state all at once at the end. As a result, it re-rendered only once.
// So counter only increases by 1.
```

However, updates made outside event handlers were not batched.
In the context of making network calls, state updates weren't batched but handled separately, causing **multiple re-renders**.

```ts
fetch('/network').then(() => {
  setCounter(prev => prev + 1); // re-render 1
  setActive(); // re-render 2
  setValue(); // re-render 3
  setCounter(prev => prev + 1); // re-render 4
});

// Re-rendered 4 times in total.
```

> In React 18, `Automatic Batching` was introduced so that all state updates are batched. Now every state update in promises, setTimeouts, and event callbacks is batched without exception.



## 🚦 Transitions

> Using Transition for **low-priority work where heavy UI tasks don't need to be handled urgently right away** can improve usability. These heavy UI tasks can include adding/removing/modifying a large number of DOM nodes, applying a network response to the UI, and so on. 
> Like this, **by processing the heavy computation later, you can provide a user experience as if other tasks are being performed at the same time without UI blocking**.

For example, while typing into an input with autocomplete, two things happen.

1. The cursor blinks and feedback for the search term occurs
2. A search is performed for the entered data 

The visual feedback of the blinking cursor is important for usability, so its priority is high. But the search isn't a problem even if it's delayed a little, so its priority is low. 

If you use `Transitions` in the part that handles non-urgent, low-priority work like this, React can proceed with updates according to priority.

### 🚦 startTransition

https://react.dev/reference/react/startTransition

With `startTransition`, you can update state without blocking the UI.
By using `startTransition` on non-urgent work, you can lower its priority and intentionally delay the UI update.

```ts
import { startTransition } from 'react';

// 1. Update the input in the input field
setInputValue(input);

// Put it inside Transitions to lower the priority. 
startTransition(() => {
  // 2. Perform a search for the entered data.
  setSearchQuery(input);
});
```

> This is an example that creates 10000 DOM elements on every user input. 
> You can see that the stuttering is reduced compared to the example shown at the beginning of the post.
> https://playcode.io/1524395
> ![](https://velog.velcdn.com/images/heelieben/post/e3800507-f311-44de-b0e6-8ced2ba13e52/image.gif)


### 🚦 useTransition

https://react.dev/reference/react/useTransition

`useTransition` is a React Hook that lets you update state without blocking the UI. It performs the same function as `startTransition`. Additionally, it provides an `isPending` state that tells you whether there's a pending Transition.

```ts
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }
```
An example of using `useTransition` is as follows.



#### [You can prevent unwanted loading indicators from being shown.](https://react.dev/reference/react/useTransition#preventing-unwanted-loading-indicators)

- Bad
![](https://velog.velcdn.com/images/heelieben/post/f585b229-f140-48e8-9aa7-489fc5f3faf9/image.gif)

- Good
![](https://velog.velcdn.com/images/heelieben/post/96e2b98a-3355-4155-822c-a2da9f1b6d54/image.gif)

More varied and detailed usage examples are well covered in the [official docs](https://react.dev/reference/react/useTransition), so please refer to them.


### 🚦 useDeferredValue

https://react.dev/reference/react/useDeferredValue

`useDeferredValue` is a React Hook that lets you defer updating part of the UI.

```ts
import { useState, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  // ...
}
```

`useDeferredValue` and `useTransition` perform the same job of deferring UI updates. So there's no need to use the two together.

The difference between the two is that `useTransition` wraps the code that updates state, while `useDeferredValue` wraps a value affected by the state change.

Because of this, the cases where each can be used may differ.
> Use `useTransition` when you have access to the state update code and need to handle a low-priority state update.
If you don't have access to the state update code, use `useDeferredValue`.


## 🌀 Suspense

https://react.dev/reference/react/Suspense

With `<Suspense>`, you can display a `fallback` UI until child components finish loading.
`Suspense`, which was added as an experimental feature in React 16.6, became an official feature in React 18.

> With `Suspense`, you can declaratively separate handling for when async data is loading and when it's available. 
By separating components declaratively rather than imperatively, you can achieve separation of concerns and write more concise code.

### Without Suspense

Without Suspense, you have to **branch imperatively** as below.
This way, the component's main purpose of showing "the information the user needs" isn't separated from "when the data is still being requested or has failed."

```tsx
function MyPage() {
  const info = useUserInfo();
 
  if (info.error) return <div>문제가 발생하였습니다.</div>
  if (!info.data) return <div>로딩중...</div>
  return <div>{info.data.name}님 안녕하세요.</div>
}
```

### With Suspense

```tsx
// MyPage.tsx
function MyPage() {
  const info = useUserInfo();

  return <div>{info.data.name}님 안녕하세요.</div>
}
```

```tsx
// App.tsx
<ErrorBoundary fallback={<MyErrorPage />}> // error handling
  <Suspense fallback={<Loader />}> // loading handling
    <MyPage />
  </Suspense>
</ErrorBoundary>
```

With Suspense, MyPage only needs to show "the information the user needs," which is the component's main purpose.
The data's loading and error states can be handled with `fallback` in the parent component that uses the MyPage component.
Like this, using `Suspense` and `ErrorBoundary` lets you **handle things based on data request state declaratively, along with separation of concerns**.

### Nesting Suspense

https://react.dev/reference/react/Suspense#revealing-nested-content-as-it-loads

Suspense can be nested. When a component suspends, the closest Suspense component displays its fallback. 

```tsx
      <Suspense fallback={<Spinner1 />}> // Suspense 1
        <ComponentA />
        <Suspense fallback={<Spinner2 />}> // Suspense 2
          <ComponentB />
        </Suspense>
      </Suspense>
```

Let's think about a case where Suspense is nested, like in the example above.

- When ComponentA isn't ready
In this case, `Spinner1` is shown, because it's the closest parent Suspense of ComponentA. And `Spinner2` isn't shown.

- When ComponentA is ready but ComponentB isn't
In this case, `Spinner2` is shown, because it's the closest parent Suspense of ComponentB. ComponentA renders and is shown normally.

If `Suspense 2` were missing, then even if ComponentA were ready, if ComponentB weren't ready, the topmost `Spinner1` would be shown. So you need to be careful, since an unwanted top-level loading indicator may appear and hurt usability.

### TanStack Query and Suspense

However, you need to be careful, because using Suspense indiscriminately can cause **network bottlenecks**.

If you send two useQuery requests inside a component wrapped in Suspense, the api requests are made one after another, causing a bottleneck. 

So when a single component performs multiple api requests, you can solve the network bottleneck by using `useQueries` in an environment with TanStack Query v4.15 or higher.

> Reference: https://happysisyphe.tistory.com/54

### Server Suspense

When using server rendering, before React 18, **even if only a specific component in the app was slow and the other components were fast, the whole page load became slow**.

> ![](https://velog.velcdn.com/images/heelieben/post/d5db1c2c-3d6a-4e48-bb1e-f7ebd1ef4889/image.png)
Source: https://www.youtube.com/watch?v=pj5N-Khihgc


In React 18, Suspense can now be used on the server. Thanks to this, you can wrap slow components of the app in Suspense to defer loading that part. **Before the slow component is ready, a loading state is displayed and all the other components are rendered, so the whole page load can be done quickly.** Once the slow component is fully ready, the content can be filled in progressively. 

All of this **happens before the JS is loaded on the page**, so it can improve the user experience and the latency users perceive.




> References
> - https://www.freecodecamp.org/news/react-18-new-features/
> - https://tecoble.techcourse.co.kr/post/2021-07-24-concurrent-mode/
> - https://happysisyphe.tistory.com/54
> - https://blog.openreplay.com/usetransition-vs-usedeferredvalue-in-react-18/
> - https://tech.kakaopay.com/post/react-query-2/
