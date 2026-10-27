---
title: 'E2E Testing : Playwright'
pubDate: 2023-2-8
description: 'E2E Testing : Playwright'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/bee2c4bf-6e06-4ccc-98ac-ed7e3a54bf68/image.png'
    alt: ''
tags: ["FrontEnd"]

---

## 🧪 What Is an E2E Test?

E2E (End to End) testing is a technique for testing a software product from start to finish to **verify that the application flow works as expected**. So the main purpose of E2E testing is to **test from the end-user experience by simulating real user scenarios**.

### E2E Testing on the Frontend

On the frontend, E2E tests check things like whether text shows up correctly when a user uses the application, whether a button does what you expect when clicked, and whether an input works properly when you type a value into it. 

In particular, E2E tests can help prevent **cross-browsing issues** on the frontend that arise from differences in OS and browser engine environments. Playwright, which I'll introduce shortly, can run tests on various browsers such as Chrome, WebKit, and Firefox, and even in mobile environments. 

![](https://velog.velcdn.com/images/heelieben/post/c2a67bf4-efca-4219-b275-5264fb097ade/image.png)

### Actually, We're All Doing E2E Testing Already

Truth is, every developer is already doing E2E testing. **With their fingers and `console.log`!**
The whole process of checking that a feature works properly after you finish developing it is testing.
But it's hard to run through every test in **various environments (Chrome, Safari, Firefox, MacOS, Windows, IOS, AOS ...)**. And since you never know what side effects a single changed line of code might cause, to make sure everything still works... you have to **run the tests by hand (!!)** across lots of environments all over again. (~~like true craftsmanship~~)

There are various testing tools out there for **automating this tedious process**. Playwright and Cypress are, among them, tools for E2E testing.


## 🥊 Playwright and Cypress

Playwright and Cypress are tools that provide E2E testing features. Both can run tests in various browsers, let you check them via a GUI, and can be hooked up to CI. However, their specific specs and usage differ.

### 1. Supported Browsers

#### Cypress

Supports two kinds of browsers: **Chromium**-based browsers and **Firefox**.

#### Playwright

Supports Chromium-based browsers, Firefox, and **WebKit-based browsers like Safari**.
It also provides **mobile browser** environments. Android Chrome and Android WebView are offered in experimental mode. (Cypress does not provide mobile environments.)


### 2. Test Speed

In **Cypress**, all tests run **serially**. So the more tests (spec files) you have, the longer it takes.
But in **Playwright**, tests that can run at the same time are run in **parallel**. So even as the number of tests (spec files) grows, it runs much faster than Cypress. (With Cypress, you have to sign up for a paid plan to run tests in parallel in a CI/CD environment.)

### 3. Syntax

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

Cypress requires you to use its own API and syntax. (This is where the learning curve comes in.)
Through `cy` chaining, you can do things concisely in a single line. In the example above, `should` is used to compare the count and the text.

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

Unlike Cypress, Playwright feels like writing JavaScript code. Since you can control async behavior with `async` and `await`, the execution order is guaranteed, and you can write code by simply listing it out line by line without chaining. 

As long as you know the essential selectors ([Locator](https://playwright.dev/docs/locators)) and expects ([Assertions](https://playwright.dev/docs/test-assertions)), you can write test code just like you'd write JavaScript code.

### 4. hover and drag

**Cypress does not officially provide events like hover and drag.** If you want to test them with Cypress, you can implement them as a workaround using [cypress-real-events](https://github.com/dmtrKovalenko/cypress-real-events). But it's not an official approach.

However, **Playwright provides hover and drag events as official APIs, making them easy to test.**


### 5. Official Docs

Both are well documented.

- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)

### 6. User Base

Since Cypress came out earlier, and since Playwright wasn't originally built for E2E testing, Cypress has more users.

https://npmtrends.com/@playwright/test-vs-cypress

![](https://velog.velcdn.com/images/heelieben/post/2c33f741-4d45-4288-a2c0-4b63d657eccd/image.png)



## 🎭 Let's Get to Know Playwright!

How to use Playwright is covered in detail in the official docs. In this post, I'll skim through it briefly and go from installation all the way to testing.

Playwright is an open-source web testing and automation library made by MS. Playwright was not originally an E2E testing framework. Like [Puppeteer](https://pptr.dev/), it's a program that provides APIs for controlling the browser. So if you want to use it for testing, you need to use it together with [@playwright/test](https://github.com/microsoft/playwright/tree/main/packages/playwright-test). 

Playwright has the following advantages.

### Advantages

#### 1. Supports various browsers, OSes, and languages.

Playwright supports all modern rendering engines, including Chromium, WebKit, and Firefox.
You can test on Windows, Linux, and macOS, in headless/headed mode, locally or in CI. 
Mobile web can also be tested. You can test Android and mobile Safari environments too.

#### 2. Enables resilient and reliable tests.

Playwright **automatically waits** until elements are actionable before performing actions. For example, when you click a button, it waits until the given selector appears in the DOM, waits until it's visible, or waits until animations stop. So it's convenient because you don't need code that waits for elements to become actionable. 

Playwright is built for the **dynamic web**. Checks are automatically retried until the required conditions are met.

You can configure a **test retry strategy** and save **execution traces, videos, and screenshots**.

#### 3. Lets you test without environment limitations.

You can test scenarios that span **multiple tabs, multiple origins, and multiple users**. Within a single test, you can write scenarios where multiple users have different contexts.

It provides **trusted events for hover and interactions with dynamic controls**. Playwright uses a real browser input pipeline that's indistinguishable from a real user.


#### 4. Runs fast in fully isolated environments.

Playwright creates a browser context for each test, so each test runs in a fully isolated environment. 
Authentication state is saved in the context and reused across all tests, which cuts down on repetitive login work.

### Getting Started

#### Installation and Initialization

```shell
npm init playwright@latest
```

While installing Playwright, you can choose TS or JS, and you can also add a Github Action workflow.

![](https://velog.velcdn.com/images/heelieben/post/e178e1a9-bc39-455b-ab00-cf0d845861d9/image.png)

Once installation is complete, the following directories are created. An example test file `example.spec.ts` is added, and you can also see a `tests-examples` directory. However, only the test files under the `tests` directory are run. 

![](https://velog.velcdn.com/images/heelieben/post/d8d341de-8bf3-46fa-b53a-5d5c3763c337/image.png)



### Running Tests

#### Testing via the CLI

Runs all the tests in the directory.

```
npx playwright test
```

Runs a single test file.

```
npx playwright test file-name
```

After running the tests, you can view the test results as a report with `npx playwright show-report`. If any test failed, the report opens automatically. 

![](https://velog.velcdn.com/images/heelieben/post/b60f03a6-0d46-4dd7-b93b-193df13544f1/image.png)



#### Testing with the VSCode Plugin

![](https://velog.velcdn.com/images/heelieben/post/1e5afb62-7500-48f2-ace7-b32d692e5366/image.png)

If you install Playwright Test for VSCode, a test icon is added to the left navigation bar as shown. You can run tests from here too, and it's handy because you can easily run tests at units smaller than a file.

![](https://velog.velcdn.com/images/heelieben/post/4e3067a3-f71d-4fcb-ad74-8063128af9fb/image.png)

Debugging tests is easy too. You can set breakpoints and step through the code line by line, visually watching the test progress in the browser.

!youtube[luQ1ExDJROM]

And with the `Pick locator` feature, you can quickly find out an element's selector. Since `Pick locator` grabs elements based on their text, it doesn't fit general cases, but it can be a big help for developers who aren't used to testing.

!youtube[rZDifXantAU]

## 🏃🏻‍♀️ Let's Learn Playwright Syntax!

### Selectors

Testing starts with finding elements. Playwright provides various selectors so you can search for elements easily. There are many selectors, but I'd like to introduce the ones I personally used a lot.

![](https://velog.velcdn.com/images/heelieben/post/8d3bb937-993b-4545-91cb-2f5cfcde38b1/image.png)


#### 1. [`page.locator`](https://playwright.dev/docs/api/class-page#page-locator)

You can select elements with css selectors.
[Searching for elements with css or XPath is covered in detail in the official docs](https://playwright.dev/docs/locators#locate-by-css-or-xpath).

```ts
await page.locator('css=button').click(); // css
await page.locator('.className').click(); // class
await page.locator('#id').click(); // id
```

#### 2. [`page.getByTestId`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-test-id)

You can search for elements based on `dataset`. However, it must be `data-testid`.

```html
<button data-testid="login-button">로그인</button>
```

```ts
await page.getByTestId('login-button').click();
```


#### 3. [`page.getByRole`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-role)

You can find elements by ARIA role, ARIA attributes, and accessible name.

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

await page.getByRole('button', { name: '제출', exact: true }).click(); // exact:true - only gets elements that match exactly.
```

#### 4. [`page.getByText`](https://playwright.dev/docs/api/class-framelocator#frame-locator-get-by-text)

You can find elements that contain text.
If multiple elements have the text, you can use [`locator.filter`](https://playwright.dev/docs/api/class-locator#locator-filter) to filter down to just the element you want.

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

You can find input elements based on their placeholder text.

```html
<input type="email" placeholder="name@example.com" />
```

```ts
await page
    .getByPlaceholder("name@example.com")
    .fill("playwright@microsoft.com");
```

#### 6. [locator.filter](https://playwright.dev/docs/api/class-locator#locator-filter)

You can filter the element you want out of multiple selectors.
You can set conditions with the `option` value: `hasText` filters based on whether it contains the text, and `has` filters based on whether it contains a specific selector.

```ts
const rowLocator = page.locator('tr');
// ...
await rowLocator
    .filter({ hasText: 'text in column 1' })
    .filter({ has: page.getByRole('button', { name: 'column 2 button' }) })
    .screenshot();
```

### Pages

Each page has its own context, so if you create multiple pages, you can work with them as if you were working in separate tabs.

```ts
// Create page1 and page2
const page1 = await context.newPage();
const page2 = await context.newPage();

// Work on page1
await page1.goto('http://example1.com');
await page1.getByRole('button', { name: '참여하기' }).click();

// Work on page2
await page2.goto('http://example2.com');
await page2.getByRole('button', { name: '모아보기' }).click();
```

### Auto-Wait

Actions are performed after automatically waiting until the element is visible and actionable.
For example, when you click a button, it waits as follows.

- Waits until the given selector appears in the DOM.
- Waits until it's visible.
- Waits until animations stop.

Thanks to auto-waiting, you don't have to write code that waits to get elements. You just get the element and perform actions like typing.

#### [waitForSelector](https://playwright.dev/docs/api/class-frame#frame-wait-for-selector)

You can also explicitly wait until an element appears. Actually, since what you expect from auto-waiting can vary from service to service, I used code that waits explicitly.

```ts
await page.waitForSelector('#login-button');
```

Conversely, you can also wait until an element disappears or is removed from the DOM.

```ts
await page.waitForSelector('#login-button', { state: 'hidden' });
```

#### [waitForLoadState](https://playwright.dev/docs/api/class-frame#frame-wait-for-load-state)

Waits until the required load state is reached.

```ts
await frame.click('button'); // Click triggers navigation.
await frame.waitForLoadState(); // Waits for 'load' state by default.
```

You can pass `state` as a parameter. It specifies which load state to wait for.

- "load" : Waits until the `load` event fires. This is the default.
- "domcontentloaded": Waits until the `DOMContentLoaded` event fires.
- "networkidle": Waits until there are no network connections for at least 500ms.



#### [waitForTimeout](https://playwright.dev/docs/api/class-frame#frame-wait-for-timeout)

Waits for the given number of ms. The official docs say that using waitForTimeout can produce unreliable (not always passing) test code, so they recommend using other methods that wait for network events or for a selector to be visible.

```ts
await frame.waitForTimeout(timeout);
```




## 🚧 Let's Write Test Code with Playwright!

Let's use Playwright to write a scenario where three users send an invitation and accept/decline it.

First, for this invitation test example, we want the tests to run in the order they're written, so we run them serially rather than in parallel. We set the test mode to `serial`.

```ts
test.describe.configure({ mode: 'serial' });
```

Also, since our service's main user base is Korean and the developers use Korean too, we set the language to Korean. The default language is English.

```ts
test.use({
  locale: 'ko-kr',
});
```

Group tests of the same kind together with `test.describe`.
Declare pages for the 3 users and the state that needs to be remembered as each test runs.

```ts
test.describe('[초대장 테스트]', () => {
  let page1: Page;
  let page2: Page;
  let page3: Page;

  const state = {
    boardName: '',
    timeStamp: getTimeStamp(),
  };
  //  Tests to be run going forward ...
});
```

Work that needs to run once at the start, before all tests run, goes in `test.beforeAll`. We create 3 pages and log in on each page.

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

And work that needs to run after all tests have finished goes in `test.afterAll`. We delete the board newly created during testing and close the pages.

```ts
  test.afterAll(async () => {
    // Delete the newly created board
    await deleteBoard({ page: page1, boardName: state.boardName });

    page1.close();
    page2.close();
    page3.close();
  });
```

Now the preparation for testing is done. Write the tests with `test`, following the expected scenario.

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
    await page2.goto('http://localhost:3000');  // Refresh
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
    await page3.goto('http://localhost:3000'); // Refresh
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


## ⚡️ Let's Automate Tests in CI with Playwright and Github Actions!

Github Actions is a feature that helps you run automated tasks when events like PRs and Pushes happen within the development lifecycle. You can build CI/CD with Github Actions, and run scripts that automatically test, build, and deploy depending on the events that occur. 

You can create an `e2e-test.yml` file inside the `.github/workflows` folder to store the commands for setting up the test environment and running the tests. 

[The Playwright official docs on CI Github Actions](https://playwright.dev/docs/ci-intro) cover this nicely. 

Here's a brief explanation of each term used in the yml.

```yml
name: workboard FE - E2E CI


on: 
  # Automatically runs the tests when PR and Push events occur on the desired branches/tags.
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
    # The environment to run on. 
    runs-on: k8s
    # Performs the following steps.
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

      # Installs the proxy server packages.
      - name: dev proxy server npm 패키지 설치
        run: cd proxy-server && npm ci

      # Installs the browsers to be used in the Playwright e2e tests.
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

Then, if you configure in `playwright.config.ts` the web servers that need to be running before the tests, it automatically starts those web servers before testing. In the dev environment I wanted to run tests while running the web server myself, and I wanted the web server to start automatically only in CI, so I branched on `process.env.CI`.

```ts
  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? [
        { // Web server
          command: 'npm run dev',
          port: 3000,
        },
        { // Proxy server
          command: 'cd proxy-server && npm run dev',
          port: 8080,
        },
      ]
    : undefined,
```

Once you push the above configuration to the remote repository, tests run whenever PR or Push events occur for the specified branches/tags. If the tests pass, you can see a successful check like this.

![](https://velog.velcdn.com/images/heelieben/post/a7762232-7cd2-4800-8d15-3a731b34bee1/image.png)

You can go to Github > Actions to see the details of the test run.

![](https://velog.velcdn.com/images/heelieben/post/05dfcbbc-c7d2-4780-b5e8-465fb73158ca/image.06)

If you download `playwright-report` from Airtifacts, you get a result report like this.

![](https://velog.velcdn.com/images/heelieben/post/1839cac1-0446-4982-b9f0-490a0d368fd0/image.20)

You can also check the detailed logs left while running the commands in the yml file.
![](https://velog.velcdn.com/images/heelieben/post/d1fc9046-6204-4aeb-92e5-f2c2721827e8/image.30)

---

## Wrapping Up...

![](https://velog.velcdn.com/images/heelieben/post/db225f3a-255e-4f0a-a9e9-08859952b0bf/image.PNG)

> The drawing is by me. [@dev_hee](https://www.instagram.com/dev_hee/) I haven't been able to post drawings lately, but I plan to start uploading again once things calm down 🥹

As a junior developer who'd always been thirsty for test code but had never actually written any (?), I learned a lot by building E2E tests into CI on a real work project. I came to realize that **test libraries come with all sorts of different tastes and values**, and I felt proud to have **broken through my fear of automation and gotten a taste of its convenience**. ~~Until the day TDD evolves from carbs(?) into tests, fighting!!~~





### References

>
- https://playwright.dev/
- https://junghan92.medium.com/playwright-test%EB%A1%9C-e2e-%ED%85%8C%EC%8A%A4%ED%8A%B8-%ED%95%98%EA%B8%B0-vs-cypress-473948d3b697
- https://hyperconnect.github.io/2022/01/28/e2e-test-with-playwright.html
- https://emewjin.github.io/playwright-vs-cypress/
