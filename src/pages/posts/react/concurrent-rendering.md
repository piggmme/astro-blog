---
title: 'React 18 Concurrent Rendering'
layout: ../_MarkdownPostLayout.astro
pubDate: 2023-7-4
description: 'React 18 에서 도입된 동시성(Concurrency)은 렌더링 엔진의 성능을 개선시키고, 사용자 경험을 향상시켰습니다. '
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/3584fec5-1cc6-46ed-8280-88a4c0506bba/image.jpg'
    alt: ''
tags: ["React"]

---

## React 18

React 18 에서 도입된 동시성(Concurrency)은 렌더링 엔진의 성능을 개선시키고, 사용자 경험을 향상시켰습니다. 

## 📌 Concurrent Rendering - 동시성 렌더링

### 동시성(Concurrency)

리액트에서 동시성이란 **한번에 둘 이상의 작업이 동시에 진행되는 것**을 의미합니다.
어떤 작업이 더 **긴급(urgent)**한지에 따라 동시 작업이 겹칠 수 있습니다. 

만약 전화를 받으면서 동시에 글을 작성하는 경우를 예로 들어보겠습니다. 상대방이 말을 할 때에는 글을 작성하는게 더 우선순위가 높을 것이며, 상대방의 질문에 대답해야 하는 경우에는 글을 쓰는 것 보단 답변 하는 것이 우선순위가 더 높을 것입니다. 이렇듯 말하기와 글쓰기 과정에 여러 지점에서 어떤것이 더 급한지 기준에 따라 작업을 수행하게 됩니다.

자바스크립트는 싱글 스레드이기 때문에 하나의 작업을 수행할 때 다른 작업을 동시에 수행할 수 없습니다. 리액트도 자바스크립트를 기반으로 하기 때문에 싱글 스레드입니다. 하지만 **리액트에서 동시성을 도입하면서 여러 작업을 동시에 처리**할 수 있습니다.

자바스크립트가 싱글 스레드라면, 리액트에서 동시성이 불가능한 것이 아닐까? 생각이 들 수 있습니다.
하지만 여기서 동시성은 멀티 스레드인 것이 아니라, **여러 작업을 작은 단위로 나눈 뒤 그 작업들 간의 우선순위를 정하고 그에 따라 작업을 번갈아 수행합니다. 작업간의 전환이 매우 빠르게 이루어 지기 때문에 동시에 여러 작업이 수행되는 것 처럼 보이게 됩니다.**

### 동시성을 도입하는 이유

리액트 18 이전에는 **렌더링은 개입할 수 없는 하나의 동기적인 처리**였습니다. 그래서 한번 렌더링이 시작되면 렌더링을 중단/재개/폐기할 수 없었습니다. 만약 동시성이 지원되지 않을 경우엔 **렌더링이 오래 걸린다면 다음에 수행해야 하는 작업은 블록킹되어 애플리케이션이 버벅이는 현상**이 발생할 수 있습니다. 

구체적인 예시를 들어 동시성이 필요한 이유를 알아보겠습니다.

#### 현재 진행중인 무거운 작업 때문에 다음 작업이 늦어지는 경우 (Debounce와 Throttle의 한계)

사용자가 `input`을 입력할 때마다 무거운 작업을 수행하는 경우에 입력이 버벅이는 나쁜 경험을 해본적이 있을것입니다. 네트워크 응답을 받는데 오래 걸리거나, 수많은 DOM elemet를 생성하는 등의 작업이 이에 해당합니다. 

> 사용자 입력마다 10000개의 DOM element를 생성하는 예제입니다. 
> 텍스트를 빠르게 입력하지만 입력이 느리게 들어가는 것을 확인할 수 있습니다.
> https://playcode.io/1523275
> ![](https://velog.velcdn.com/images/heelieben/post/a070756b-6b36-4263-b9c5-d59d03acdd8d/image.gif)


이런 문제는 **Debounce와 Throttle**로 해결할 수 있었습니다만, 한계점이 존재했습니다.

- Debounce
사용자의 마지막 입력이 끝나고 일정 시간이 지나서 무거운 작업을 수행하게 됩니다. 이 때문에 **아무리 성능이 좋은 컴퓨터를 사용하더라도 무조건 일정 시간을 기다려야합니다.** 이렇듯 다음 무거운 작업을 위해서 일정 시간을 낭비하는 것은 분명한 한계점입니다.

- Throttle
디바운스에서 사용자 입력 중에 무거운 처리가 이뤄지지 않는 단점을 해결합니다. 입력 중에 주기적으로 무거운 작업을 수행하는 방식이기 때문입니다. 하지만 이 또한 **쓰로틀 주기를 짧게 가져갈수록 성능이 나쁜 기기에서는 버벅거리는 문제**를 야기할 수 있습니다.

> 동시성은 Debounce와 Throttle의 한계점을 해결할 수 있습니다. 일정 시간을 대기하지 않고 동시에 작업을 수행할 수 있기 때문입니다. 따라서 UI 렌더링 작업을 위한 무거운 계산 과정과 다른 작업을 동시에 진행할 수 있습니다.


## 🌟 Concurrent Mode 

Concurrent Mode로 설정하기 위해서는 기존의 `render` 대신 `createRoot`를 사용하면 됩니다.
Concurrent Mode로 설정하면 **개선된 기능**들과 **동시 처리**를 위한 `startTransition`, `useTransition`, `useDeferredValue` 훅들을 사용할 수 있습니다.

- 기존 리액트 17
```ts
import ReactDOM from 'react-dom';
import App from 'App';

const container = document.getElementById('app'); 

ReactDOM.render(<App />, container);
```

- 리액트 18
```ts
import ReactDOM from 'react-dom';
import App from 'App'; 

const container = document.getElementById('app'); 

// 루트를 생성합니다.
const root = ReactDOM.createRoot(container); 

// 루트를 통해 앱을 렌더 합니다.
root.render(<App />);
```

## 🔥 Automatic Batching

UI를 변경시키는 여러개의 상태를 업데이트 할 경우, 나눠서 처리하는 경우엔 UI 변경이 여러번 발생할 것입니다. 만약 한번에 상태를 업데이트 하면 단 한번만 UI를 변경하면 되므로 렌더링 횟수를 줄일 수 있습니다. 이렇게 상태 업데이트를 일괄로 처리하는 것을 `Automatic Batching`이라고 합니다.

리액트 18 이전에도 `Automatic Batching`가 적용 되어 있었습니다. 다만 **이벤트 핸들러 내부**에서 상태 변화만 한번에 처리하였습니다.

```ts
const handleClick = () => {
  setCounter(prev => prev + 1);
  setActive();
  setValue();
  setCounter(prev => prev + 1);
};

// 마지막에 한 번에 상태를 업데이트 해준다. 이로서 한 번만 리렌더링 되었다.
// 따라서 counter는 1만 증가한다.
```

하지만 이벤트 핸들러 바깥에서 진행된 업데이트는 일괄로 처리되지 않았습니다.
네트워크 호출을 하는 맥락에서는 상태 업데이트가 일괄 처리 되지 않고 나눠서 처리하여 **여러번 리렌더링**이 발생했습니다.

```ts
fetch('/network').then(() => {
  setCounter(prev => prev + 1); // 리렌더링 1
  setActive(); // 리렌더링 2
  setValue(); // 리렌더링 3
  setCounter(prev => prev + 1); // 리렌더링 4
});

// 총 4 번 리렌더링 됨.
```

> 리액트 18에선 `Automatic Batching`를 도입해서 모든 상태 업데이트에서 일괄로 처리되도록 변경되었습니다. 이제 promise, setTimeouts, 이벤트 콜백에서 모든 상태 업데이트가 빠짐없이 일괄로 처리됩니다.



## 🚦 Transitions

> **무거운 UI 작업을 바로 급하게 처리하지 않아도 되는 우선순위가 낮은 작업을**에 Transition을 사용하면 사용성을 개선할 수 있습니다. 이 무거운 UI 작업에는 수 많은 DOM을 추가/삭제/수정하는 경우와 네트워크 응답을 UI에 적용하는 경우 등이 있을 수 있습니다. 
> 이렇듯 **무거운 계산 과정을 나중에 처리함으로 UI blocking 없이 동시에 다른 작업이 수행되는 것과 같은 사용자 경험**을 제공할 수 있습니다.

예를 들어, 자동 완성 기능이 제공되는 입력창에 입력하는 동안 두 가지 일이 발생합니다.

1. 커서가 깜빡이며 검색어에 대한 피드백이 발생
2. 입력된 데이터에 대한 검색이 진행됨 

커서가 깜빡이는 시각적인 피드백은 사용성에서 중요하므로 우선순위가 높습니다. 하지만 검색은 조금 지연되더라도 문제되지 않으니 우선순위가 낮습니다. 

이렇게 긴급하지 않는, 우선순위가 낮은 작업을 처리하는 부분에서 `Transitions`를 사용하면 리액트는 우선순위에 따라 업데이트를 진행할 수 있습니다.

### 🚦 startTransition

https://react.dev/reference/react/startTransition

`startTransition`을 사용하면 UI를 차단하지 않고 상태를 업데이트할 수 있습니다.
긴급하지 않은 작업에 `startTransition`를 사용하여 우선순위를 낮추어 UI 업데이트를 의도적으로 지연할 수 있습니다.

```ts
import { startTransition } from 'react';

// 1. 입력창에 입력을 업데이트 합니다
setInputValue(input);

// Transitions안에 두어 우선순위를 낮춥니다. 
startTransition(() => {
  // 2. 입력된 데이터에 대한 검색을 진행합니다.
  setSearchQuery(input);
});
```

> 사용자 입력마다 10000개의 DOM element를 생성하는 예제입니다. 
> 본문 초반에 보여드린 예제보다 버벅이는 현상이 줄어든 것을 확인할 수 있습니다.
> https://playcode.io/1524395
> ![](https://velog.velcdn.com/images/heelieben/post/e3800507-f311-44de-b0e6-8ced2ba13e52/image.gif)


### 🚦 useTransition

https://react.dev/reference/react/useTransition

`useTransition`은 UI를 차단하지 않고 상태를 업데이트할 수 있는 React Hook입니다. `startTransition`과 동일한 기능을 수행합니다. 추가적으로 지연된 Transition이 있는지 여부를 알려주는 `isPending` 상태를 제공합니다.

```ts
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }
```
`useTransition` 을 사용하는 예시는 다음과 같습니다.



#### [원치 않는 loading indicator가 보여지는 것을 방지할 수 있습니다.](https://react.dev/reference/react/useTransition#preventing-unwanted-loading-indicators)

- Bad
![](https://velog.velcdn.com/images/heelieben/post/f585b229-f140-48e8-9aa7-489fc5f3faf9/image.gif)

- Good
![](https://velog.velcdn.com/images/heelieben/post/96e2b98a-3355-4155-822c-a2da9f1b6d54/image.gif)

더 다양하고 자세한 사용 예시는 [공식문서](https://react.dev/reference/react/useTransition)에 잘 나와있으니 참고하시길 바랍니다.


### 🚦 useDeferredValue

https://react.dev/reference/react/useDeferredValue

`useDeferredValue`는 UI의 일부 업데이트를 지연시킬 수 있는 React Hook입니다.

```ts
import { useState, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  // ...
}
```

`useDeferredValue`와 `useTransition`는 UI 업데이트를 지연한다는 동일한 작업을 수행합니다. 따라서 두 함수를 같이 사용할 필요가 없습니다.

두 함수의 차이점은 `useTransition`는 상태를 업데이트 하는 코드를 래핑하고, `useDeferredValue`는 상태 변경의 영향을 받는 값을 래핑합니다.

때문에 두 함수를 사용할 수 있는 경우가 달라질 수 있습니다.
> `useTransition`는 상태 업데이트 코드에 접근할 수 있고, 우선순위가 낮은 상태 업데이트를 처리해야 하는 경우에 사용하면 됩니다.
만약 상태 업데이트 코드에 접근할 수 없다면 `useDeferredValue`를 사용하세요.


## 🌀 Suspense

https://react.dev/reference/react/Suspense

`<Suspense>`를 사용하면 자식 컴포넌트가 로딩이 완료될 때까지 `fallback` UI를 표시할 수 있습니다.
리액트 16.6에서 실험적인 기능으로 추가되었던 `Suspense`가 리액트 18에서 정식 기능이 되었습니다.

> `Suspense`를 사용하면 비동기 데이터가 로딩중일 때와 사용 가능할 때를 선언적으로 분리해서 처리할 수 있습니다. 
명령형 방식이 아닌 선언적으로 컴포넌트를 분리하여 처리함으로 관심사의 분리와 더욱 간결한 코드를 작성할 수 있게 되었습니다.

### Suspense를 사용하지 않는 경우

Suspense를 사용하지 않는 경우엔 아래와 같이 **명령형으로 분기 처리**를 해야 합니다.
이렇게 되면 컴포넌트의 주된 목적인 "사용자가 필요한 정보"를 보여주는 것과 "데이터가 아직 요청중이거나 실패한 경우"를 분리되지 않습니다.

```tsx
function MyPage() {
  const info = useUserInfo();
 
  if (info.error) return <div>문제가 발생하였습니다.</div>
  if (!info.data) return <div>로딩중...</div>
  return <div>{info.data.name}님 안녕하세요.</div>
}
```

### Suspense를 사용한 경우

```tsx
// MyPage.tsx
function MyPage() {
  const info = useUserInfo();

  return <div>{info.data.name}님 안녕하세요.</div>
}
```

```tsx
// App.tsx
<ErrorBoundary fallback={<MyErrorPage />}> // 에러 처리
  <Suspense fallback={<Loader />}> // 로딩 처리
    <MyPage />
  </Suspense>
</ErrorBoundary>
```

Suspense를 사용한 경우엔 MyPage에서는 컴포넌트의 주된 목적인 "사용자가 필요한 정보"를 보여주기만 하면 됩니다.
데이터의 로딩과 에러 상태는 MyPage 컴포넌트를 사용하는 상위 컴포넌트에서 `fallback` 으로 처리할 수 있습니다.
이렇듯 `Suspense`, `ErrorBoundary` 를 사용하면 **데이터 요청 상태에 따른 처리를 관심사의 분리와 함께 선언적으로 처리**할 수 있습니다.

### Suspense의 중첩

https://react.dev/reference/react/Suspense#revealing-nested-content-as-it-loads

Suspense는 중첩해서 사용할 수 있습니다. 컴포넌트가 일시 중단되면, 가장 가까운 Suspense 컴포넌트라 fallback을 표시합니다. 

```tsx
      <Suspense fallback={<Spinner1 />}> // Suspense 1
        <ComponentA />
        <Suspense fallback={<Spinner2 />}> // Suspense 2
          <ComponentB />
        </Suspense>
      </Suspense>
```

위 예제처럼 Suspense가 중첩된 경우를 생각해봅시다.

- ComponentA가 준비가 안된 경우
이 경우엔 `Spinner1`이 보여지게 됩니다. ComponentA의 가장 가까운 상위 Suspense이기 때문입니다. 그리고 `Spinner2`는 보이지 않습니다.

- ComponentA는 준비 되고, ComponentB가 준비가 안된 경우
이 경우엔 `Spinner2`이 보입니다. ComponentB의 가장 가까운 상위 Suspense이기 때문입니다. ComponentA는 정상적으로 렌더링되어 보여집니다.

만약 `Suspense 2`가 누락되었다면 ComponentA가 준비 되었더라도, ComponentB가 준비 안되었다면 가장 상위 `Spinner1`를 보여지게 됩니다. 따라서 원치 않은 최상위 로딩 indicator가 나타나서 사용성을 해치는 경우가 있을 수 있으니 조심해야 합니다.

### TanStack Query와 Suspense

하지만 무분별하게 Suspense를 사용하면 **네트워크 병목 현상**이 발생할 수 있으므로 조심해야합니다.

Suspense로 감싸준 컴포넌트 안에서 두 개의 useQuery 요청을 보낸다면, api 요청이 하나씩 차례로 요청되어 병목현상이 발생합니다. 

때문에 하나의 컴포넌트에서 여러 개의 api 요청을 수행하는 경우엔 TanStack Query v4.15이상의 환경에서 `useQueries`를 사용하여 네트워크 병목 현상을 해결할 수 있습니다.

> 참고: https://happysisyphe.tistory.com/54

### Server Suspense

서버 렌더링을 사용하는 경우에 React 18 이전엔 **앱에서 특정 컴포넌트만 느리고 다른 컴포넌트들은 빠르더라도 전체 페이지 로드가 느려지게** 되었습니다.

> ![](https://velog.velcdn.com/images/heelieben/post/d5db1c2c-3d6a-4e48-bb1e-f7ebd1ef4889/image.png)
출처: https://www.youtube.com/watch?v=pj5N-Khihgc


리액트 18에서는 서버에서 Suspense를 사용할 수 있게되었습니다. 덕분에 앱의 느린 컴포넌트를 Suspense로 감싸서 해당 부분의 로딩을 지연시킬 수 있게 되었습니다. **느린 컴포넌트가 준비되기 이전엔 loading 상태를 표시하고 다른 컴포넌트들을 전부 렌더링하여 전체 페이지 로드를 빠르게 수행할 수 있습니다.** 느린 컴포넌트가 준비가 다 되었다면 점진적으로 컨텐츠를 채워갈 수 있습니다. 

이 모든 과정이 페이지에서 **JS가 로드되기 이전에 일어나므로** 사용자 경험과 사용자가 체감하는 지연시간을 개선할 수 있습니다.




> 참고
> - https://www.freecodecamp.org/news/react-18-new-features/
> - https://tecoble.techcourse.co.kr/post/2021-07-24-concurrent-mode/
> - https://happysisyphe.tistory.com/54
> - https://blog.openreplay.com/usetransition-vs-usedeferredvalue-in-react-18/
> - https://tech.kakaopay.com/post/react-query-2/