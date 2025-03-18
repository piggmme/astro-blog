---
title: 'Astro 프레임워크에 대한 고찰'
layout: ../_MarkdownPostLayout.astro
pubDate: 2025-3-13
description: 'Astro 프레임워크에 대한 고찰'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["FrontEnd"]

---

> 해당 글은 astro `v5.4.1` 일 때 작성된 글입니다.

## 콘텐츠 중심 웹사이트 프레임워크 - Astro

Astro 공식 홈페이지에는 다음과 같이 프레임워크에대해서 설명한다.

>Astro는 블로그, 마케팅, 이커머스 등 콘텐츠 중심 웹사이트를 구축하기 위한 웹 프레임워크입니다. Astro는 JavaScript 오버헤드와 복잡성을 줄이기 위해 새로운 프런트엔드 아키텍처를 개척한 프레임워크로 가장 잘 알려져 있습니다. 빠른 로딩 속도와 뛰어난 SEO를 갖춘 웹사이트가 필요하다면 Astro가 해답입니다.

즉, **"콘텐츠 중심" 웹사이트를 구축하는데 적합한 프레임워크라**는 것이다.
콘텐츠는 보통 변하지 않는 데이터를 의미한다. 유저와 상호작용이 많고 데이터가 자주 변하는 그런 서비스와는 다르다.

아스트로는 웹 사이트 구축에 필요한 모든 것을 기본적으로 제공하긴 한다. 다만, 잘 변하지 않는 "콘텐츠 중심"인 서비스를 만드는 데에 적합하고, 상호작용이 많은 사이트의 경우엔 아스트로가 적합하지 않을 수도 있다.

## Astro의 특징

아스트로 프레임워크에서 제공하는 여러 기능들은 다음과 같다.

### 1. island

> 콘텐츠 중심 웹사이트에 최적화된 컴포넌트 기반 웹 아키텍처

아일랜드는 상호작용/개인화가 필요한 특정 컴포넌트만 클라이언트에서 동적으로 로드할 수 있도록 하는 부분적인 하이드레이션 기법이다. 즉, 아일랜드는 **정적으로 렌더링된 HTML + 상호 작용이나 개인화가 필요한 경우 추가된 JS**로 이루어진 컴포넌트를 말한다.

기본적으로 아일랜드는 정적인 HTML로 만들어진다. 만약 동적인 기능을 원한다면 `client:*` 지시어를 넘겨주어야 한다. 이를 클라이언트 아일랜드라고 한다.

**1. 클라이언트 아일랜드**

클라이언트 아일랜드는 HTML 페이지의 나머지 부분과 별도로 독립적으로 하이드레이션 된다. 클라이언트 아일랜드는 이미 서버에서 렌더링된 HTML 위에서 별도로 동작하는 대화형 위젯이라고 보면 된다.

기본적으로 아스트로는 `client:*` 지시어를 넘겨주지 않으면, 클라이언트 측 JS는 자동으로 제거된다. 아스트로는 기본적으로 클라이언트측에서 불필요한 자바스크립트 코드가 실행되는것을 줄여서 퍼포먼스를 향상시키는 것을 목표로 하기 때문에, 지시어를 꼭 명시해 주어야한다.

```jsx
<!-- 브라우저에서 동작하지 않음. HTML 은 잘 렌더링 됨. -->
<Counter />
```

아래와 같이 `client:load` 지시어를 추가하면 페이지 로드시 컴포넌트 JS를 즉시 로드하고 하이드레이션한다. 아스트로는 하이드레이션 시점을 개발자가 원할 때 지정할 수 있도록 [다양한 클라이언트 지시어](https://docs.astro.build/ko/reference/directives-reference/#%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8-%EC%A7%80%EC%8B%9C%EC%96%B4)들을 제공한다.

```jsx
<!-- 페이지에서 상호 작용이 가능함! -->
<Counter client:load />
```

그리고 클라이언트 아일랜드는 페이지에서 독립적으로, 즉 병렬로 로드 되어 하이드레이션 되므로 페이지 아래쪽에 있는 무거운 컴포넌트가 로드 되기 전 까지 사용자가 대기할 필요 없이 바로 상호 작용이 가능하다.
아래의 예제에서 `<NotImportantComponent />` 가 아직 로드 중이더라도 `<MainContents />` 가 로드 완료되었다면 상호작용 가능하다.

```jsx
<!-- 로드 완료!: 바로 상호 작용 가능 -->
<MainContents client:load />

<!-- 로드 중... 아직 상호작용 안됨-->
<NotImportantComponent client:load />
```

이렇게 같은 페이지 내의 각각의 아일랜드들이 독립적으로 격리되어 실행되는 유연성 덕분에 아스트로는 여러 UI 프레임워크(React, Vue, Svelte, ...)를 사용할 수 있다. 각 아일랜드가 독립적이기 때문에 여러 프레임워크를 혼합하여 사용 가능하다. (React + Vue) 아래 처럼 `client:only=*` 지시어를 통해서 클라이언트 아일랜드로 동작하게 된다.

```jsx
<ReactComponent client:only="react" />

<VueComponent client:only="vue" />
```

단, `client:only=*` 지시어를 사용하면 **HTML 서버 렌더링을 건너뛰고 클라이언트에서만 렌더링** 한다. 페이지를 로드할 때 컴포넌트를 로드하여 렌더링 및 하이드레이션 한다는 점에서 `client:load` 와 유사하게 동작한다. 하지만 `client:load`는 HTML 렌더링은 서버에서 미리 수행하고, 하이드레이션만 클라이언트에서 이뤄진다는 점은 다르다. (확인하는 방법은 개발자 도구에서 JavaScript를 비활성화 하면 된다.)

| 속성            | `client:load` | `client:only=*` |
|----------------|--------------|----------------|
| **HTML 렌더링** | 서버         | 클라이언트     |
| **하이드레이션** | 클라이언트   | 클라이언트     |

<!-- 검증 필요 -->
하지만 아래처럼 클라이언트 컴포넌트 자식으로 넘겨준 아스트로 아일랜드는 서버에서 먼저 렌더링해서 내려주긴 한다.

```jsx
---
import MyAstroIsand from './my-astro-isand.astro'
const data = fetchUserInfo()
---
<MyReactComponent client:only="react">
  {data.name}
  <MyAstroIsand />
</MyReactComponent>
```


그리고 클라이언트 아일랜드는 **페이지 하단의 아일랜드가 먼저 로드 되더라도 페이지 상단의 아일랜드가 아직 로드중이라면 렌더링이 블락**된다. 만약 서버측 로직이 오래걸리는 컴포넌트들이 많고 이 때문에 렌더링 블라킹이 발생하지 않길 원한다면 서버 아일랜드를 사용하는 것이 좋다.

```jsx
<!-- 로드 중... 아직 상호작용 안됨-->
<MainContents client:load />

<!-- 로드 완료! 하지만 MainContents가 아직 로드중이므로 렌더링 되지 않음-->
<NotImportantComponent client:load />
```


**2. 서버 아일랜드**

서버 아일랜드는 비용이 많이 들거나 느린 서버 측 코드를 주요 렌더링 프로세스에서 분리하는 기능을 한다.
즉, **페이지의 나머지 부분의 성능을 희생하지 않고 동적이거나 개인화된 아일랜드를 개별적으로 요청시 렌더링**할 수 있다. 만약 페이지의 상단에 더 느린 아일랜드가 있더라도 렌더링이 블라킹되지 않는다.

```jsx
<!-- 로드 중... 아직 상호작용 안됨-->
<NotImporant server:defer>
  <div slot='fallback'>
    NotImporant 로드중 ...
  </div>
</NotImporant>

<!-- 로드 완료! NotImporant가 아직 로드중이여도 상호작용 가능.-->
<Counter server:defer>
  <div slot='fallback'>
    Counter 로드중 ...
  </div>
</Counter>
```

아스트로 컴포넌트에 `server:defer` 지시어를 추가하면 서버 아일랜드로 전환할 수 있다. 이 지시어를 사용하기 위해서는 반드시 아스트로 전용 서버가 필요하다. 따라서 서버 어댑터를 추가하고 `astro.config.js`에서 `output: 'server'` 로 수정해야한다.

다음과 같이 서버 아일랜드를 작성하면

```html
<ServerIsland server:defer />
```

아래처럼 document에 `inline script` 가 추가된 모습을 확인할 수 있다.
이 스크립트는 서버 아이랜드를 비동기적으로 `fetch` 하여 서버 아일랜드를 받으면 DOM에 추가한다.

<img alt="CORS 에러 예시" src="/images/astrojs_server-island.png" />

서버 아일랜드는 서버에서 렌더링해서 비동기로 전달받기 때문에 개발자 도구에서 JavaScript를 비활성화 하면 클라이언트에서 서버 아일랜드가 렌더링되지 않는다.

### 2. UI 독립적

> React, Preact, Svelte, Vue, Solid, HTMX, 웹 컴포넌트 등 지원

아스트로는 특정 UI 프레임워크에 종속되어 있지않다. 즉 개발자가 원하는 UI 프레임워크를 자유롭게 선택해서 아스트로 아일랜드를 만들 수 있다. NextJS 와 아스트로의 큰 차이점이 여기에 존재한다. NextJS는 리액트를 기반으로 만들어진 SSR 프레임워크이기 때문이다.

```jsx
---
import MyReactComponent from '../components/MyReactComponent.jsx';
import MySvelteComponent from '../components/MySvelteComponent.svelte';
import MyVueComponent from '../components/MyVueComponent.vue';
---
<div>
  <MySvelteComponent />
  <MyReactComponent />
  <MyVueComponent />
</div>
```

단, 아스트로 아일랜드 안에서 UI 프레임워크 컴포넌트를 가져오는 것은 가능하지만, UI 프레임워크 컴포넌트 내부에서 아일랜드를 가져오는 것은 불가능하다. 어떻게 보면 당연한게, 리액트나 뷰에서 아스트로 아일랜드를 지원하지 않을 것이기 때문이다.

```jsx
import MyAstroIsland from './astro-island.astro'

export default function MyReactComponent () {
  return (
    <div>
      {/* 지원 안함! */}
      <MyAstroIsland />
    </div>
  )
}

```

하지만 아래처럼 리액트 컴포넌트에게 자식으로 아스트로 컴포넌트를 넘겨주는것은 가능하다.

```jsx
<MyReactButton>
  <MyAstroTitle />
</MyReactButton>
```

### 3. 서버 우선

> 비용이 많이 드는 렌더링 작업을 방문자의 장치에서 제거

아스트로는 브라우저에서 렌더링 하는 것 보다 서버 렌더링을 최우선으로 활용하려고 한다. 아스트로의 철학이 그러하기 때문이다. 클라이언트에서 자바스크립트를 통해 컨텐츠를 불러와 렌더링하는 것은, 서버에서 렌더링하는 것에 비하면 느릴 수 밖에 없다. 때문에 아스트로는 기본값으로 서버에서 우선적으로 렌더링하도록 설계되어 있으며 `client:only=*` 지시어를 통해 클라이언트 아일랜드를 명시해주어야 클라이언트 렌더링으로 전환할 수 있다.

이러한 구조는 Next.js 와 같은 다른 프레임워크와는 대조적이다. 아스트로는 MPA(Multi Page Application)이고 Next.js는 일부 서버측 렌더링을 지공하는 SPA(Single Page Application)이라고 볼 수 있다. (라고 아스트로 공식문서에 쓰여있음)

> 개인적인 생각: 클라이언트에서 상태를 관리하는 개념과는 아스트로의 서버 우선 원칙이 충돌되는 지점이 있는 것 같다. 클라이언트 개발자 입장에서는 이미 한번 가져온 데이터를 페이지를 이동할 때 마다 불필요하게 또 요청하는 것을 방지하고 싶지만, MPA이 기반인 아스트로에서는 서버 입장에서는 이게 이전에 같은 클라이언트에서 요청했던 데이터인지 알 방법이 없으므로 요청 때 마다 계속 중복된 데이터를 가져와서 또 렌더링하는 수 밖에 없다. **아스트로에서는 백엔드 서버로 최소한의 요청을 보내는 것에는 관심이 없고 이로 인한 서버 부하나 사이드 이펙트는 아스트로 입장에선 내 책임은 아니기 때문에 FE개발자가 요령것 클라이언트 아일랜드로 바꾸든 해서 개선해라.** 라는 의도로 보인다. 아스트로가 `View Transaction` 을 지원해서 MPA이지만 SPA처럼 매끄럽게 하나의 앱 처럼 변경되는 영역만 리렌더링 하여 사용성에선 문제가 없지만, api 요청을 효율적으로 줄이는 것은 FE 개발자가 스스로 판단하여 잘 구조화 해야한다. 그래서 **정말 "컨텐츠" 영역만 SSR을 수행하고 "사용자 데이터나 중복되어 요청할 필요가 없는 데이터"는 클라이언트 아일랜드로 잘 분리하여 불필요한 재요청을 방지하는 노력이 필요해보인다.**


### 4. JavaScript 최소화

> 사이트 속도를 저하시키는 클라이언트 측 JavaScript 최소화

아스트로는 서버단에서 컨텐츠를 가져와(`GET`) 미리 렌더링을 수행하는 것을 기본으로 하기 때문에, 클라이언트측에서 컨텐츠를 로드하는 로직이 제거될 수 있다. 즉 클라이언트에서는 정말 유저와의 상호작용(`POST`, `DELETE`, ...)에 사용되는 스크립트만 필요하다. 때문에 코드는 짧아지고 더 빠르게 화면에 컨텐츠를 보여줄 수 있다.

아스트로 아일랜드(`.astro`)는 다음과 같은 구조를 가지고 있다. 

```jsx
---
// 컴포넌트 스크립트 (JavaScript)
---
<!-- 컴포넌트 템플릿 (HTML + JS 표현식) -->
```

- 컴포넌트 스크립트
  - 서버에서 실행되는 스크립트로, 클라이언트에서는 실행되지 않는다. (때문에 유저와 상호작용하기 위한 함수는 여기에 작성될 수 없다. 상호작용 스크립트는 컴포넌트 템플릿에 `<script>`에 작성해주어야 한다. 이게 불편한 포인트...)
  - 다른 컴포넌트를 `import` 하여 가져올 수 있다.
  - API로 컨텐츠를 가져올 수 있다.
  - 템플릿에서 참조할 변수를 선언할 수 있다. (함수는 안됨.)
- 컴포넌트 템플릿
  - 출력될 HTML을 결정한다.
  - 특수 아스트로 지시어(`client:`, `server:`)를 통해서 렌더링 시점을 지정할 수 있다.
  - `<style>`: 지역 스타일 또는 global 스타일을 지정할 수 있다.
  - `<script>`: 컴포넌트에 상호작용을 추가하기 위해서는 반드시 이 스크립트 태그를 사용해야 한다. 기본적으론 빌드시 번들링되어 별도의 모듈로 생성되는데, 이를 막고싶다면 `is:inline` 지시어를 추가하면 된다.

아스트로를 사용하면서 아쉬운 지점은 이벤트 처리를 위해서는 아래 처럼 옛날 방식으로 스크립트를 작성해주어야만 한다는 점이다. 이 때문에 상호작용이 많은 영역은 React나 Vue 같은 외부 라이브러리를 사용하는 것이 좋아보인다.

```jsx
<button class="alert">Click me!</button>

<script>
  // 페이지에서 `alert` 클래스가 포함된 모든 버튼을 찾습니다.
  const buttons = document.querySelectorAll('button.alert');

  // 각 버튼의 클릭을 처리합니다.
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      alert('Button was clicked!');
    });
  });
</script>
```


### 5. 콘텐츠 컬렉션

> Markdown 콘텐츠를 구성하고, 검증하며, TypeScript 타입 안정성을 제공

콘텐츠 컬렉션은 Astro에서 마크다운/MDX 콘텐츠를 구성하고 유효성을 검사하는 기능이다

### 콘텐츠 컬렉션의 특징

1. **콘텐츠 그룹화**
- `src/content/` 디렉토리 아래에 관련된 콘텐츠들을 모아서 관리
- 예: 블로그 포스트, 제품 페이지 등을 각각의 컬렉션으로 구성

2. **스키마 기반 유효성 검사**
```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    tags: z.array(z.string())
  })
});

export const collections = {
  'blog': blogCollection
};
```

3. **TypeScript 타입 안정성**
- 스키마를 정의하면 자동으로 TypeScript 타입이 생성됨
- 콘텐츠를 조회할 때 타입 안정성 보장

4. **콘텐츠 조회 API**
```typescript
// 컬렉션의 모든 항목 조회
const allPosts = await getCollection('blog');

// 필터링해서 조회
const featuredPosts = await getCollection('blog', ({ data }) => {
  return data.featured === true;
});
```

5. **자동 slug 생성**
- 파일 이름 기반으로 URL slug 자동 생성
- 커스텀 slug도 정의 가능

6. **Markdown/MDX 최적화**
- frontmatter 데이터 검증
- 마크다운 파싱 및 렌더링 최적화
- MDX 지원으로 마크다운 내 컴포넌트 사용 가능

콘텐츠 컬렉션을 사용하면 마크다운 기반 콘텐츠를 체계적으로 관리하고 타입 안정성을 확보할 수 있다.

## Astro 프레임워크 특징 요약

1. 콘텐츠 중심 웹사이트에 최적화

- 블로그, 마케팅, 이커머스 등 **정적 콘텐츠가 많은 웹사이트**에 적합
- 데이터가 자주 변경되거나 사용자 상호작용이 많은 서비스에는 부적합

2. 주요 특징

- 아일랜드 아키텍처
  - **기본적으로 정적 HTML** 렌더링
  - 필요한 부분만 선택적으로 클라이언트 JS 실행 (`client:*` 지시어)
  - 서버 아일랜드(`server:defer`)로 무거운 서버 로직 분리 가능

- UI 프레임워크 독립성
  - React, Vue, Svelte 등 다양한 UI 프레임워크 혼용 가능
  - 각 아일랜드가 독립적으로 실행되어 프레임워크 충돌 없음

- 서버 우선 렌더링
  - 기본적으로 서버에서 HTML 렌더링
  - MPA 구조로 인한 불필요한 API 재요청 이슈 존재
  - View Transitions으로 SPA같은 UX 제공

- JavaScript 최소화
  - 클라이언트 JS를 최소화하여 성능 최적화
  - 상호작용이 필요한 부분만 선택적으로 JS 실행
  - 순수 JS로 이벤트 처리해야하는 한계 존재

## 결론

Astro는 **콘텐츠 중심의 정적 웹사이트**를 만드는데 매우 적합한 프레임워크이다. 서버 렌더링 우선, JavaScript 최소화 등의 특징으로 빠른 로딩 속도와 좋은 SEO를 제공한다.

다만 다음과 같은 상황에서는 신중한 선택이 필요하다.
1. 사용자 상호작용이 많은 웹 애플리케이션
2. 실시간 데이터 업데이트가 잦은 서비스
3. 클라이언트 상태 관리가 중요한 경우

이러한 경우에는 Next.js나 다른 SPA 프레임워크가 더 적합할 수 있다.