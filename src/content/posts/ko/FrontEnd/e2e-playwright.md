---
title: 'E2E 테스트 : Playwright'
pubDate: 2023-2-8
description: 'E2E 테스트 : Playwright'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/bee2c4bf-6e06-4ccc-98ac-ed7e3a54bf68/image.png'
    alt: ''
tags: ["FrontEnd"]

---

## 🧪 E2E Test 는 무엇일까요?

E2E(End to End) 테스트는 **애플리케이션 흐름이 예상대로 동작하는지 확인**하기위해 처음부터 끝까지 소프트웨어 제품을 테스트하는 기술입니다. 따라서 E2E 테스트의 주된 목적은 **실제 사용자 시나리오를 시뮬레이션하여 최종 사용자 경험에서 테스트** 하는 것입니다.

### 프론트엔드에서 E2E 테스트

프론트엔드에서 E2E 테스트는 사용자가 애플리케이션을 사용할 때 텍스트가 정상적으로 나오는지, 버튼을 클릭하였을 때 기대하는 동작을 하는지, 인풋에 값을 입력하였을 때 정상 동작하는지 등을 테스트합니다. 

특히 프론트엔드에서 OS와 브라우저엔진 환경이 달라서 발생하는 **크로스 브라우징 이슈**를 E2E 테스트를 통해 미리 방지할 수 있습니다. 앞으로 소개해드릴 PlayWright는 크롬, 웹킷, 파이어폭스 등의 다양한 브라우저와 모바일 환경까지 테스트를 진행할 수 있습니다. 

![](https://velog.velcdn.com/images/heelieben/post/c2a67bf4-efca-4219-b275-5264fb097ade/image.png)

### 우리 모두 사실은 E2E 테스트를 하고있다

사실 개발자들은 모두 E2E 테스트를 하고있습니다. **손가락과 `console.log` 로요!**
기능 개발을 완료하고 나서 정상적으로 동작하는지 확인하는 과정이 모두 테스트입니다.
하지만 **다양한 환경(크롬, 사파리, 파이어폭스, MacOS, Windows, IOS, AOS ...)** 에서 모든 테스트 과정을 수행하기 어렵습니다. 그리고 코드 한 줄을 수정하고 나서 어떤 사이드 이펙트가 생길지 모르기 때문에 이를 모두 정상 동작하는지 확인 하기위해선... 또 다시 많은 환경에서 **테스트를 직접(!!) 진행**해야합니다. (~~like 장인 정신~~)

이런 **번거로운 과정을 자동화**하기 위한 여러가지 테스트 도구들이 존재합니다. Playwright, Cypress는 그중에서도 E2E 테스트를 위한 도구들입니다.


## 🥊 Playwright와 Cypress

Playwright와 Cypress는 E2E 테스트 기능을 제공하는 도구입니다. 둘 다 다양한 브라우저에서 테스트를 진행할 수 있으며, 이를 GUI 로 확인하고, CI 에 붙일 수 있습니다. 하지만 구체적인 스펙과 사용법들은 다릅니다.

### 1. 지원 브라우저

#### Cypress

**크로미움** 기반의 브라우저와 **파이어폭스** 두 브라우저를 지원합니다.

#### Playwright

크로미움 기반의 브라우저, 파이어폭스, **사파리같은 WebKit기반 브라우저**를 지원합니다.
**모바일 브라우저** 환경 또한 제공합니다. 안드로이드 크롬과 안드로이드 웹뷰를 실험 모드로 제공하고 있습니다. (Cypress는 모바일 환경을 제공하지 않습니다)


### 2. 테스트 속도

**Cypress**는 모든 테스트가 **직렬**로 실행됩니다. 따라서 테스트(spec 파일)의 갯수가 증가할수록 시간이 오래 걸립니다.
하지만 **Playwright는** 동시에 수행할 수 있는 테스트는 **병렬**로 실행됩니다. 따라서 테스트(spec 파일)의 갯수가 증가해도 Cypress보다 훨씬 빠르게 진행됩니다. (Cypress는 유료 플랜을 가입해야 CI/CD 환경에서 병렬로 테스트를 수행할 수 있습니다.)

### 3. 문법

#### Cypress

```js
beforeEach(() => {
  cy.visit('https://todomvc.com/examples/vanillajs/');
});

it('입력창에 값을 입력한 뒤 엔터를 누르면 할일이 추가된다.', () => {
  cy.get('.header input').click().type('todo 1').type('{enter}');
  cy.get('.todo-list li').should('have.length', 1).should('have.text', 'todo 1');
});
```

Cypress는 자체적으로 제공하는 API와 문법을 사용해야합니다. (여기서 러닝커브가 존재합니다.)
`cy`의 체이닝을 통해 한 줄로 간결하게 작업할 수 있습니다. 위의 예제에선 `should` 를 사용해 갯수와 텍스트를 비교하였습니다.

#### Playwright

```js
import { test, expect } from '@playwright/test';

const url = 'https://todomvc.com/examples/vanillajs/';

test.beforeEach(async ({ page }) => {
  await page.goto(url);
});

test('입력창에 값을 입력한 뒤 엔터를 누르면 할일이 추가된다.', async ({ page }) => {
  await page.click('.header input');
  await page.keyboard.type('todo 1');
  await page.keyboard.press('Enter');
  await page.keyboard.type('todo 2');
  await page.keyboard.press('Enter');

  // https://playwright.dev/docs/locators#locate-by-css-or-xpath
  const list = page.locator('css=.todo-list li');
  await expect(list).toHaveCount(2);
  await expect(list.first()).toHaveText('todo 1');
});
```

Playwright는 Cypress와는 다르게 자바스크립트 코드를 짜는 느낌을 받을 수 있습니다. `async`, `await`을 사용하여 비동기를 제어할 수 있기 때문에 실행 순서가 보장되고, 체이닝이 없이 코드를 쭉 나열해 가며 작성할 수 있습니다. 

반드시 필요한 selector([Locator](https://playwright.dev/docs/locators))와 expect([Assertions](https://playwright.dev/docs/test-assertions))만 알고 있으면 자바스크립트 코드를 작성하듯 테스트 코드를 작성할 수 있습니다.

### 4. hover와 drag

**Cypress는 hover와 drag와 같은 이벤트를 공식적으로 제공하지 않습니다.** 만약 Cypress를 사용하여 테스트를 진행하고 싶다면 [cypress-real-events](https://github.com/dmtrKovalenko/cypress-real-events)를 사용해 임시로 구현할 수 있습니다. 하지만 공식적인 방법은 아닙니다.

그러나 **Playwright는 hover와 drag 이벤트를 공식 API로 제공하며 쉽게 테스트 할 수 있습니다.**


### 5. 공식 문서

둘 다 문서는 잘 제공되어있습니다.

- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)

### 6. 사용자 규모

아무래도 Cypress가 더 빠르게 나오기도 하였고, Playwright가 태생이 E2E 테스트를 위해 만들어진 것이 아니기 때문에 사용자는 Cypress가 더 많습니다.

https://npmtrends.com/@playwright/test-vs-cypress

![](https://velog.velcdn.com/images/heelieben/post/2c33f741-4d45-4288-a2c0-4b63d657eccd/image.png)



## 🎭 Playwright를 알아보아요!

Playwright의 사용법은 공식문서에 자세히 정리되어 있습니다. 본문에선 간략히 훑어보며 설치부터 테스트까지 진행해보겠습니다.

Playwright는 MS에서 만든 오픈소스 웹 테스트 및 자동화 라이브러리입니다. Playwright는 태생이 E2E 테스트 프레임워크가 아닙니다. [Puppeteer](https://pptr.dev/)처럼 브라우저를 컨트롤할 수 있는 API를 제공하는 프로그램입니다. 따라서 테스트를 위해 사용하고자 한다면, [@playwright/test](https://github.com/microsoft/playwright/tree/main/packages/playwright-test)를 같이 사용해야 합니다. 

Playwright는 다음과 같은 장점을 가지고 있습니다.

### 장점

#### 1. 다양한 브라우저, OS, 언어를 지원합니다.

Playwright는 Chromium, WebKit, Firefox 를 포함한 모든 최신 렌더링 엔진을 지원합니다.
Windows, Linux, macOS에서 테스트 가능하며, headless/headed 모드, 로컬 또는 CI에서 테스트할 수 있습니다. 
또한 모바일 웹 또한 테스트 가능합니다. Android와 모바일 Safari 환경도 테스트 할 수 있습니다.

#### 2. 탄력적이며 안전한 테스트가 가능합니다.

Playwright는 작업을 수행하기 전에 요소가 실행 가능할 때까지 **자동으로 기다립니다**. 예를 들어 버튼을 클릭하면 주어진 선택자가 DOM에 나타날 때까지 기다리고, visible할 때 까지 기다리거나, 애니메이션이 멈출 때 까지 기다립니다. 따라서 요소가 실행 가능할 때 까지 대기하는 코드가 필요하지 않아 편리합니다. 

Playwright는 **동적 웹**을 위해 생성됩니다. 필요한 조건이 충족될 때까지 검사가 자동으로 재시도됩니다.

**테스트 재시도 전략**을 구성하고 **실행 추적, 비디오, 스크린샷**을 저장합니다.

#### 3. 환경에 제한 없이 테스트가 가능합니다.

**여러 탭과 여러 출처, 여러 사용자**에 걸친 시나리오를 테스트할 수 있습니다. 하나의 테스트 안에서 여러 사용자가 서로 다른 컨텍스트를 가진 시나리오를 작성할 수 있습니다.

**Hover, 동적 컨트롤과 상호작용에 대한 신뢰할 수 있는 이벤트**를 제공합니다. Playwright는 실제 사용자와 구별할 수 없는 실제 브라우저 입력 파이프라인을 사용합니다.


#### 4. 완전히 독립된 환경에서 빠르게 실행할 수 있습니다.

Playwright는 각 테스트에서 브라우저 컨텍스트를 생성하므로 각각의 테스트는 완전 독립된 환경에서 실행됩니다. 
인증 상태를 컨텍스트에 저장하며 이는 모든 테스트에서 재사용되어 반복적인 로그인 작업을 줄일 수 있습니다.

### 시작하기

#### 설치 및 초기화

```shell
npm init playwright@latest
```

playwright를 설치하면서 TS, JS 를 선택할 수 있고 Github Action workflow 또한 추가할 수 있습니다.

![](https://velog.velcdn.com/images/heelieben/post/e178e1a9-bc39-455b-ab00-cf0d845861d9/image.png)

설치가 완료되면 다음과 같은 디렉토리가 생성됩니다. 예제 테스트코드 `example.spec.ts` 가 추가되어 있으며, `tests-examples` 디렉토리 또한 확인할 수 있습니다. 다만 `tests` 디렉토리 아래에 있는 테스트 파일들만 실행됩니다. 

![](https://velog.velcdn.com/images/heelieben/post/d8d341de-8bf3-46fa-b53a-5d5c3763c337/image.png)



### 테스트 실행

#### CLI로 테스트하기

디렉토리에 있는 모든 테스트를 실행합니다.

```
npx playwright test
```

단일 테스트 파일을 실행합니다.

```
npx playwright test file-name
```

테스트를 수행하고 나면 `npx playwright show-report`로 테스트 결과를 레포트로 확인해 볼 수 있습니다. 테스트에 오류가 있었다면 레포트는 자동으로 열립니다. 

![](https://velog.velcdn.com/images/heelieben/post/b60f03a6-0d46-4dd7-b93b-193df13544f1/image.png)



#### VSCode 플러그인으로 테스트하기

![](https://velog.velcdn.com/images/heelieben/post/1e5afb62-7500-48f2-ace7-b32d692e5366/image.png)

Playwright Test for VSCode를 설치하면 다음과 같이 왼쪽 네비게이션바에 테스트 아이콘이 추가됩니다. 여기에서도 테스트를 실행할 수 있으며, 파일보다 더 작은 단위의 테스트도 쉽게 실행할 수 있어서 편리합니다.

![](https://velog.velcdn.com/images/heelieben/post/4e3067a3-f71d-4fcb-ad74-8063128af9fb/image.png)

또한 테스트 디버깅도 간편합니다. 중단점을 찍고 코드를 한 줄 씩 실행해가며 브라우저에서 테스트가 진행되는 것을 시각적으로 확인할 수 있습니다.

!youtube[luQ1ExDJROM]

그리고 `Pick locator` 기능을 사용해서 요소 선택자를 빠르게 알 수 있습니다. `Pick locator` 는 텍스트를 기반으로 요소를 가져오기 때문에 일반적인 경우는 해당하지 않지만, 테스트에 익숙하지 않은 개발자에게는 큰 도움이 될 수 있습니다.

!youtube[rZDifXantAU]

## 🏃🏻‍♀️ Playwright 문법을 알아봅시다!

### 선택자 Selector

테스트 작업은 요소를 찾는 것으로 시작합니다. Playwright는 다양한 선택자를 제공하여 간편하게 요소를 검색할 수 있습니다. 다양한 선택자가 있지만 그 중 개인적으로 많이 사용한 선택자를 소개하고자 합니다.

![](https://velog.velcdn.com/images/heelieben/post/8d3bb937-993b-4545-91cb-2f5cfcde38b1/image.png)


#### 1. [`page.locator`](https://playwright.dev/docs/api/class-page#page-locator)

css 선택자로 요소를 선택할 수 있습니다.
[css나 XPath로 요소를 검색하는 내용은 공식문서](https://playwright.dev/docs/locators#locate-by-css-or-xpath)에 자세히 나와있습니다.

```ts
await page.locator('css=button').click(); // css
await page.locator('.className').click(); // class
await page.locator('#id').click(); // id
```

#### 2. [`page.getByTestId`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id)

`dataset`를 기반으로 요소를 검색할 수 있습니다. 다만 반드시 `data-testid` 이여야 합니다.

```html
<button data-testid="login-button">로그인</button>
```

```ts
await page.getByTestId('login-button').click();
```


#### 3. [`page.getByRole`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-role)

ARIA role, ARIA attributes, 접근가능한 이름으로 요소를 찾을 수 있습니다.

```html
<h3>회원가입</h3>
<label>
  <input type="checkbox" /> 구독
</label>
<br/>
<button>제출</button>
```

```ts
await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();

await page.getByRole('checkbox', { name: /구독/ }).check();

await page.getByRole('button', { name: '제출', exact: true }).click(); // exact:true - 정확히 매칭되는 요소만 가져온다.
```

#### 4. [`page.getByText`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-text)

텍스트가 포함되어 있는 요소를 찾을 수 있습니다.
여러 요소가 텍스트를 가지고 있다면 [`locator.filter`](https://playwright.dev/docs/api/class-locator#locator-filter) 를 사용해서 원하는 요소만 필터링할 수 있습니다.

```html
<div>Hello <span>world</span></div>
<div>Hello</div>
```

```ts
// Matches <span>
page.getByText('world')

// Matches first <div>
page.getByText('Hello world')

// Matches second <div>
page.getByText('Hello', { exact: true })

// Matches both <div>s
page.getByText(/Hello/)

// Matches second <div>
page.getByText(/^hello$/i)
```

#### 5. [`page.getByPlaceholder`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-placeholder)

input 요소를 placeholder 텍스트를 기반으로 찾을 수 있습니다.

```html
<input type="email" placeholder="name@example.com" />
```

```ts
await page
    .getByPlaceholder("name@example.com")
    .fill("playwright@microsoft.com");
```

#### 6. [locator.filter](https://playwright.dev/docs/api/class-locator#locator-filter)

여러개의 선택자들 중 원하는 요소를 필터링 할 수 있습니다.
`option`값으로 조건을 걸 수 있는데, `hasText` 는 텍스트를 가지고 있는지를 기반으로 필터링하며 `has`는 특정 선택자를 가지고 있는지를 기반으로 필터링 합니다.

```ts
const rowLocator = page.locator('tr');
// ...
await rowLocator
    .filter({ hasText: 'text in column 1' })
    .filter({ has: page.getByRole('button', { name: 'column 2 button' }) })
    .screenshot();
```

### 페이지 Pages

페이지는 각각의 컨텍스트를 가지고있어서 여러개의 페이지를 만들면 제각기 다른 탭에서 작업하는 것처럼 작업할 수 있습니다.

```ts
// 페이지1, 페이지2 생성
const page1 = await context.newPage();
const page2 = await context.newPage();

// 페이지1에서 작업
await page1.goto('http://example1.com');
await page1.getByRole('button', { name: '참여하기' }).click();

// 페이지2에서 작업
await page2.goto('http://example2.com');
await page2.getByRole('button', { name: '모아보기' }).click();
```

### 자동 대기 Auto-Wait

작업들은 요소가 보여지고 실행 가능해질 때까지 자동으로 기다린 후 수행됩니다.
예를들어 버튼을 클릭하면 다음과 같이 기다립니다.

- 주어진 선택자가 DOM에 나타날때 까지 기다린다.
- visible할 때까지 기다립니다.
- 애니메이션이 멈출 때까지 기다립니다.

자동 대기 덕분에 요소를 가져오기위해 대기하는 코드를 작성하지 않아도 됩니다. 그저 요소를 가져와 입력하는 등의 동작을 수행하면 됩니다.

#### [waitForSelector](https://playwright.dev/docs/api/class-frame#frame-wait-for-selector)

요소가 나타날때 까지 명시적으로 기다릴 수도 있습니다. 사실 필자는 자동 대기 기능이 서비스마다 기대하는 바가 달라질 수 있기 때문에, 명시적으로 기다리는 코드를 사용하였습니다.

```ts
await page.waitForSelector('#login-button');
```

또한 반대로 요소가 사라지거나 DOM에서 제거될 때 까지 기다릴 수도 있습니다.

```ts
await page.waitForSelector('#login-button', { state: 'hidden' });
```

#### [waitForLoadState](https://playwright.dev/docs/api/class-frame#frame-wait-for-load-state)

필요한 로드 상태에 도달할 때까지 기다립니다.

```ts
await frame.click('button'); // Click triggers navigation.
await frame.waitForLoadState(); // Waits for 'load' state by default.
```

매개변수로 `state`를 전달할 수 있습니다. 어떤 로드 상태일 때까지를 기다리는지 명시합니다.

- "load" : `load` 이벤트가 실행될 때까지 기다립니다. 기본값입니다.
- "domcontentloaded": `DOMContentLoaded` 이벤트가 실행될 때까지 기다립니다.
- "networkidle": 최소 500ms동안 네트워크 연결이 없을 때까지 기다립니다.



#### [waitForTimeout](https://playwright.dev/docs/api/class-frame#frame-wait-for-timeout)

입력받은 ms 만큼 대기합니다. 공식문서에서는 waitForTimeout의 사용은 신뢰할 수 없는(항상 통과하지는 않는) 테스트코드를 만들어낼 수 있으므로, 네트워크 이벤트나 selector가 visible할 때를 기다리는 다른 메서드를 사용하기를 권장합니다.

```ts
await frame.waitForTimeout(timeout);
```




## 🚧 Playwright로 테스트코드를 작성해봅시다!

Playwright 를 사용해서 세 명의 사용자가 초대장을 보내고 수락/거절하는 시나리오를 작성해봅시다.

먼저 이번 초대장 테스트 예제는 테스트가 작성된 순서대로 실행되었으면 하므로 병렬이 아닌 직렬로 테스트를 실행합니다. 테스트 모드를 `serial`로 설정합니다.

```ts
test.describe.configure({ mode: 'serial' });
```

또한 우리 서비스는 한국어가 주된 사용자 층이고 개발자도 한국어를 사용하므로 언어를 한국어로 설정합니다. 기본 언어는 영어입니다.

```ts
test.use({
  locale: 'ko-kr',
});
```

`test.describe`로 같은 종류의 테스트는 묶어줍니다.
3명의 페이지와 각 테스트가 수행되면서 기억되어야 할 상태를 선언합니다.

```ts
test.describe('[초대장 테스트]', () => {
  let page1: Page;
  let page2: Page;
  let page3: Page;

  const state = {
    boardName: '',
    timeStamp: getTimeStamp(),
  };
  //  앞으로 진행할 테스트들 ...
});
```

모든 테스트가 수행되기 전에 초기에 한번 실행해야하는 작업을 `test.beforeAll`로 실행합니다. 3개의 페이지를 생성하고 각 페이지에 로그인을 수행합니다.

```ts
  test.beforeAll(async ({ browser }) => {
    state.boardName = `[e2e] ${state.timeStamp} 테스트 보드`;

    page1 = await browser.newPage();
    page2 = await browser.newPage();
    page3 = await browser.newPage();

    await login({ page: page3, buttonText: 'e2e - A로그인' });
    await login({ page: page2, buttonText: 'e2e - B로그인' });
    await login({ page: page1, buttonText: 'e2e - C로그인' });
  });
```

그리고 모든 테스트가 종료된 후에 실행되어야 하는 작업을 `test.afterAll`로 실행합니다. 테스트과정에서 새로 생성한 보드를 삭제하고 페이지를 닫습니다.

```ts
  test.afterAll(async () => {
    // 새로 생성한 보드 삭제
    await deleteBoard({ page: page1, boardName: state.boardName });

    page1.close();
    page2.close();
    page3.close();
  });
```

이제 테스트를 위한 준비는 끝이 났습니다. 기대하는 시나리오 대로 테스트를 `test`를 사용해서 작성해줍니다.

```ts
   test('1. "[e2e] 테스트 보드 {timestamp}" 이름의 새로운 비공개 보드를 생성합니다.', async () => {
    await createBoard({ page: page1, boardName: state.boardName, type: '비공개' });
    await expect(page1).toHaveURL(/invitation/);
  });

  test('2. 비공개 보드에서 "A", "B" 멤버를 초대합니다. ', async () => {
    await page1.getByRole('button', { name: '멤버 초대하기' }).click();

    await page1.getByPlaceholder('이름, 닉네임, 조직명으로 검색').fill('A');
    await page1.keyboard.down('Enter');
    await page1.locator('label').filter({ hasText: 'A' }).first().click();

    await page1.getByPlaceholder('이름, 닉네임, 조직명으로 검색').fill('B');
    await page1.keyboard.down('Enter');
    await page1.locator('label').filter({ hasText: 'B' }).click();

    await page1.getByRole('button', { name: '초대', exact: true }).click();

    await expect(page1.getByTestId('invited-members').filter({ hasText: /A|B/ })).toBeVisible();
  });

  test('3. "A"로 로그인하여 초대를 수락합니다. ', async () => {
    await page2.goto('http://localhost:3000');  // 새로고침
    await page2.getByTestId('invitation-button').click();
    await page2.getByRole('listitem').filter({ hasText: state.boardName }).first().getByText('수락').click();
    await page2.waitForLoadState('networkidle');

    await expect(
      page2
        .getByTestId('invitation-item')
        .filter({ hasText: `${state.timeStamp}` })
        .first(),
    ).toHaveText(/C님의 초대를 수락했습니다./);
  });

  test('4. "B"로 로그인하여 초대를 거절합니다. ', async () => {
    await page3.goto('http://localhost:3000'); // 새로고침
    await page3.getByTestId('invitation-button').click();
    await page3.getByRole('listitem').filter({ hasText: state.boardName }).first().getByText('거절').click();
    await page2.waitForLoadState('networkidle');

    await expect(
      page3
        .getByTestId('invitation-item')
        .filter({ hasText: `${state.timeStamp}` })
        .first(),
    ).toHaveText(/C님의 초대를 거절했습니다./);
  });
```


## ⚡️ Playwright와 Github Actions를 사용해 CI로 테스트 자동화해요!

Github Actions는 개발 라이프사이클 안에서 PR, Push 등의 이벤트가 발생할 때 자동화된 작업을 수행할 수 있게 도와주는 기능입니다. CI/CD 는 Github Actions로 구축할 수 있으며, 이벤트 발생에 따라 자동으로 테스트 와 빌드 및 배포하는 스크립트를 실행할 수 있습니다. 

`.github/workflows` 폴더 안에 `e2e-test.yml` 파일을 생성해서 테스트 환경 구축 및 테스트 실행하는 명령어를 저장할 수 있습니다. 

[Playwright 공식문서에서 CI Github Actions](https://playwright.dev/docs/ci-intro) 에 대한 내용이 잘 정리되어 있습니다. 

yml 에서 사용하는 각각의 용어를 간략하게 설명하면 다음과 같습니다.

```yml
name: workboard FE - E2E CI


on: 
  # 원하는 브랜치/태그에서 PR과 Push 이벤트가 발생하면 테스트를 자동으로 실행합니다.
  push:
    branches:
      - cbt
      - prod
  pull_request:
    branches:
      - cbt
      - prod
      - 'major-v[0-9]+.[0-9]+.[0-9]+'

jobs:
  test:
    timeout-minutes: 60
    # 실행할 환경입니다. 
    runs-on: k8s
    # 다음의 단계를 수행합니다.
    steps:
      - uses: actions/checkout@v2
      
      - name: 노드 환경 사용
        uses: actions/setup-node@v2
        with:
          node-version: 16.x

      - name: npm 패키지 설치
        run: npm ci

      - name: env 파일 생성
        env:
          CI: true

      # 프록시 서버 패키지를 설치합니다.
      - name: dev proxy server npm 패키지 설치
        run: cd proxy-server && npm ci

      # Playwright e2e테스트에서 사용할 브라우저를 설치합니다.
      - name: Playwright Browsers 설치
        run: cd .. && npx playwright install --with-deps

      - name: Playwright 테스트 실행
        run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

그리고 `playwright.config.ts`에서 테스트를 실행하기 전에 실행시켜야할 웹 서버들을 설정하면 자동으로 테스트 전에 웹서버를 실행시켜줍니다. 저는 개발환경에서는 직접 웹 서버를 실행시킨 상태에서 테스트를 수행하고 싶었고, CI 에서만 자동으로 웹서버를 실행되었으면 하여 `process.env.CI` 를 통해 분기처리를 해주었습니다.

```ts
  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? [
        { // 웹 서버
          command: 'npm run dev',
          port: 3000,
        },
        { // 프록시 서버
          command: 'cd proxy-server && npm run dev',
          port: 8080,
        },
      ]
    : undefined,
```

위의 환경 설정을 원격저장소에 올리고 나면 지정해준 브랜치/태그에 대한 PR, Push 이벤트가 발생했을 때 테스트를 실행합니다. 테스트가 정상적으로 통과하면 다음과 같이 successful check를 확인할 수 있습니다.

![](https://velog.velcdn.com/images/heelieben/post/a7762232-7cd2-4800-8d15-3a731b34bee1/image.png)

Github > Actions 로 들어가 테스트가 실행된 디테일을 확인할 수 있습니다.

![](https://velog.velcdn.com/images/heelieben/post/05dfcbbc-c7d2-4780-b5e8-465fb73158ca/image.06)

Airtifacts에 `playwright-report`를 다운로드 받으면 다음과 같은 결과 레포트를 받아볼 수 있습니다.

![](https://velog.velcdn.com/images/heelieben/post/1839cac1-0446-4982-b9f0-490a0d368fd0/image.20)

또한 yml파일에 있는 명령어를 실행하며 남은 로그 또한 자세하게 확인 가능합니다.
![](https://velog.velcdn.com/images/heelieben/post/d1fc9046-6204-4aeb-92e5-f2c2721827e8/image.30)

---

## 마치며...

![](https://velog.velcdn.com/images/heelieben/post/db225f3a-255e-4f0a-a9e9-08859952b0bf/image.PNG)

> 그림 출처는 본인입니다. [@dev_hee](https://www.instagram.com/dev_hee/) 최근에는 그림을 못 올렸지만 여유로워지면 다시 업로드할 예정입니다 🥹

항상 테스트 코드에 대해 목말라있었지만 실제로 테스트 코드를 작성해보진 않았던(?) 주니어 개발자에서, 실무 프로젝트에 E2E 테스트를 CI로 구축하며 많은 것을 배울 수 있었습니다. **테스트 라이브러리에도 다양한 취향과 가치가 존재한다는 것**을 알게되었으며, **자동화에 대한 두려움을 타파하고 편리함을 맛보게** 되어서 뿌듯하였습니다. ~~TDD가 탄수화물(?)에서 테스트로 진화하는 날까지, 화이팅!!~~





### 참고

>
- https://playwright.dev/
- https://junghan92.medium.com/playwright-test%EB%A1%9C-e2e-%ED%85%8C%EC%8A%A4%ED%8A%B8-%ED%95%98%EA%B8%B0-vs-cypress-473948d3b697
- https://hyperconnect.github.io/2022/01/28/e2e-test-with-playwright.html
- https://emewjin.github.io/playwright-vs-cypress/
