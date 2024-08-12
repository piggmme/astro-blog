---
title: 'React | 클래스 컴포넌트를 함수 컴포넌트로 마이그레이션하기'
layout: ../_MarkdownPostLayout.astro
pubDate: 2024-8-12
description: 'React | 클래스 컴포넌트를 함수 컴포넌트로 마이그레이션하기'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["React"]

---
## 어쩌다 클래스에서 함수 컴포넌트로 마이그레이션을 하였는가

실무에서 5년간 업데이트를 하지 않은 프로젝트에 투입되었다.
해당 프로젝트는 react가 hook을 지원하기 이전인 `v16.6.0` 버전이었기 때문에,
앞으로의 유지 보수와 신규 개발 기능을 위해서는 hook을 사용할 수 있는 버전으로 업데이트가 필요했다.
동시에 클래스의 구조가 모두 구버전 클래스 컴포넌트로 이루어져있기 때문에 가독성과 재사용성이 떨어졌다.
최신 리액트에서는 제공되는 기능들을 직접 구현하여 대응하였기 때문에 이렇게 작성된 코드들을 걷어낼 필요가 있었다.

그래서 hook을 지원하는 리액트 `v16.8.6` 으로 버전 업데이트를 하고 구버전인 클래스 컴포넌트에서 hook을 사용한 함수 컴포넌트로 마이그레이션을 진행하였다.

## 클래스 컴포넌트와 hook을 사용할 수 있는 함수 컴포넌트의 차이점

### 1. 작성 방식

#### 클래스 컴포넌트

- 클래스 컴포넌트는 ES6 클래스 문법을 통해 작성된다.
- 클래스 컴포넌트는 `render()` 메서드를 통해서 `JSX` 를 반환한다.

```js
class MyComponent extends React.Component {
  render() {
    return <div>Hello, World!</div>;
  }
}
```

#### 함수 컴포넌트
- 자바스크립트 함수를 사용해 컴포넌트를 정의한다.
- 함수 컴포넌트는 JSX를 직접 반환한다.

```js
function MyComponent() {
  return <div>Hello, World!</div>;
}
```

### 2. 상태 관리

#### 클래스 컴포넌트

- 상태(state)를 관리하려면 클래스 내부에서 `this.state`를 사용하고, 상태 업데이트는 `this.setState()` 메서드를 사용한다.
- 상태 초기화는 클래스의 생성자(`constructor`)에서 이루어진다.

```js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

#### 함수 컴포넌트

- `useState` Hook을 사용하여 상태를 관리한다.
- 상태 초기화와 업데이트가 간결하게 이루어진다.

```js
function MyComponent() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

### 3. 라이프사이클 메서드

#### 클래스 컴포넌트

- 컴포넌트의 생애 주기(Lifecycle)를 관리하기 위해 여러 라이프사이클 메서드를 제공한다. `componentDidMount()`, `componentDidUpdate()`, `componentWillUnmount()` 등.

```js
class MyComponent extends React.Component {
  componentDidMount() {
    console.log('Component mounted');
  }

  componentDidUpdate() {
    console.log('Component updated');
  }

  componentWillUnmount() {
    console.log('Component will unmount');
  }

  render() {
    return <div>Hello, World!</div>;
  }
}
```

#### 함수 컴포넌트

- `useEffect` Hook을 사용하여 라이프사이클과 유사한 기능을 구현할 수 있다.
- `useEffect` 는 특정 조건에 따라 컴포넌트가 마운트, 업데이트, 언마운트될 때 코드를 실행할 수 있다.

```js
function MyComponent() {
  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component will unmount');
    };
  }, []); // 빈 배열은 오직 마운트와 언마운트시에만 실행되도록 함

  return <div>Hello, World!</div>;
}
```

### 🤔 클래스 vs 함수 총평

개인적인 사족을 붙이자면, 나에게는 클래스 컴포넌트는 `render` 메서드로 JSX를 반환하는 형태가 너무 익숙하지 않은 형태였다.

또한 클래스 컴포넌트는 로직을 재사용하기 위해서 메서드를 사용하였는데, 핸들러에 메서드를 연결하기 위해서는 `this.onClick.bind(this)`와 같이 `this`를 연결 해주어야 해서 너무 직관적이지 못하고 코드 길이가 길어진다.

그리고 상태를 업데이트 하기 위해서는 `this.setState({ open: true })` 와 같이 무조건 컴포넌트 내부의 모든 상태에 대해 `this.setState` 로 접근해야 하는것도 작성해야 하는 코드가 길어지게 된다. (훅처럼 컴포넌트에서 상태로직이 분리가 불가능하기 때문에 다른 컴포넌트에서 재사용도 물론 불가능!!!)

라이플사이클도 마찬가지이다. 개발자가 직접적으로 컴포넌트의 라이프사이크를 명령형으로 제어할 수 있음은 좋을 수 있다. 다만 클래스의 구조적 문제로 모든 마운트에 해당하는 이펙트들을 `componentDidMount` 안에 작성해야한다. 이는 관심사의 분리를 어렵게 한다.

```js
class MyComponent extends React.Component {
  componentDidMount() {
    // 관심사의 분리가 전혀 되지 않음.
    effect1()
    effect2()
    effect3()
  }
  render() {
    return <div>Hello, World!</div>
  }
}
```

함수 컴포넌트에서는 다음처럼 목적에 맞는 이펙트별로 끊어서 작성할 수 있으며, 필요에 따라서 훅으로 따로 분리해서 재사용할 수도 있다.

```js
const useEffect3 = () => {
  useEffect(effect3, [])
}
function MyComponent() {
  // 목적에 맞게 분리해서 작성 가능
  useEffect(effect1, [])
  useEffect(effect2, [])

  // 훅으로 분리 가능
  useEffect3()

  return <div>Hello, World!</div>;
}
```

## 구버전에서 deprecated 된 스펙들

구버전 클래스 컴포넌트에서는 사용되던 여러 스펙들은 이제 더 이상 지원되지 않는 것들도 많았다.

### [string `ref`](https://ko.legacy.reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs)

기존 클래스 컴포넌트에서는 `string ref`를 사용하고 있었다. 즉 자식 컴포넌트의 dom 노드에 접근하기 위해서 현재는 `forwardRef` 를 사용하지만, 예전엔 `string Ref` 를 사용했다. string ref는 아래 처럼 자식 컴포넌트의 `ref` props에 string(`"attachmentBox"`)값을 내려준다. 부모에서 자식 ref에 접근하고 싶다면 `this.refs.attachmentBox` 와 같은 방식으로 접근 가능하다.

```jsx
// 부모 컴포넌트
handleClickAttachment() {
  this.refs.attachmentBox.attachFile();
}
<AttachmentsBoxForm
  ref="attachmentBox"
  // ...
/>
```

```jsx
// 자식 컴포넌트
class AttachmentsBoxForm {
  attachFile() {
    this.refs.fileInput.click();
  }

  render() {
    return <input ref="fileInput"/>
  }
}
```

클래스 컴포넌트를 함수 컴포넌트로 마이그레이션 하는 작업중에 다음과 같은 에러가 발생하였다. 함수 컴포넌트에서는 `string ref` 를 사용할 수 없어서 아래와 같은 에러가 발생하였던 것이라 `forwardRef` 로 변경해 해결할 수 있었다.

![](https://private-user-images.githubusercontent.com/76723666/356958132-869b004e-0952-4863-bea0-1229146a541d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjM0NDYyMzgsIm5iZiI6MTcyMzQ0NTkzOCwicGF0aCI6Ii83NjcyMzY2Ni8zNTY5NTgxMzItODY5YjAwNGUtMDk1Mi00ODYzLWJlYTAtMTIyOTE0NmE1NDFkLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA4MTIlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwODEyVDA2NTg1OFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWI3OWQ2NDQyYjllYTAzNWM2ZjIxN2I1YzdmYzQ1MDhiMDEwM2Y3YmFkNWY5Mjk4NDJhYjIyMTMxZDlhYjRkODcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.aSNq_nhF2a8rSpguo4sEwfNcObiQp_c3NoKOW-0lZJo)

### [Legacy Context](https://legacy.reactjs.org/docs/legacy-context.html)

레거시 컨텍스트는 아래와 같이 사용된다.
먼저 자식 컴포넌트에서 `this.context` 로 부모에서 제공해준 컨텍스트에 접근할 수 있다.
부모는 `getChildContext` 으로 자식에게 컨텍스트를 전달한다.

```jsx
import PropTypes from 'prop-types';

class Button extends React.Component {
  render() {
    return (
      <button style={{background: this.context.color}}>
        {this.props.children}
      </button>
    );
  }
}

Button.contextTypes = {
  color: PropTypes.string
};
class Message extends React.Component {
  render() {
    return (
      <div>
        {this.props.text} <Button>Delete</Button>
      </div>
    );
  }
}

class MessageList extends React.Component {
  getChildContext() {
    return {color: "purple"};
  }
  render() {
    const children = this.props.messages.map((message) =>
      <Message text={message.text} />
    );
    return <div>{children}</div>;
  }
}

MessageList.childContextTypes = {
  color: PropTypes.string
};
```

문제는 여기서 발생한다. 만약 자식이 `this.context.color` 을 사용하는 경우에
**어떤 부모에서 해당 컨텍스트를 내려주었는지 코드에서 명시적으로 알기 어렵다.**
즉, `getChildContext`를 ide에서 검색해서 어떤 부모에서 color을 내려주는지 직접 찾아봐야한다.
때문에 자신이 어떤 부모의 자식인지에 따라서 강력하게 부모와 얽히게 되지만, 코드상에서는 어떤 부모와 얽혀있는지 한눈에 알기가 어렵다.
레거시 컨텍스트를 조금만 여러개 사용하더라도 엄청나게 가독성이 떨어질 듯 하다.

때문에 이후에 만들어진 [Context API](https://react.dev/reference/react/createContext) 에서는 Context.Provider 와 `Context.Consumer`  / `usecontext(Context)` 등으로 어떤 Context를 누가 제공하고 어디서 사용되는지 명확하게 확인할 수 있도록 수정된 것을 확인할 수 있다.

```jsx
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}

function Button() {
  // 🟡 Legacy way (not recommended)
  return (
    <ThemeContext.Consumer>
      {theme => (
        <button className={theme} />
      )}
    </ThemeContext.Consumer>
  );
}

function Button() {
  // ✅ Recommended way
  const theme = useContext(ThemeContext);
  return <button className={theme} />;
}
```

## 클래스의 Renderer function 패턴으로 인한 문제 발생

**클래스 컴포넌트에서 함수 컴포넌트로 마이그레이션 작업을 하면서, `renderer function` 형태에서 문제가 발생했다.**

클래스 컴포넌트의 경우엔 일반적으로 다음처럼 메서드로 렌더러 함수(`renderContent`)들을 선언하고,
이를 `render` 함수에서 호출해서 사용한다.

```jsx
class ClassComponent extends PureComponent {
  render() {
    return (
      <div> {renderContent()}</div>
    );
  }

  renderContent() {
    return (
      <div>Body</div>
    );
  }
}
```

이를 함수 컴포넌트로 최대한 형태를 바꾸지 않고 변경하면 아래와 같이 된다.

```jsx
function ClassComponent (props) {
  return (
    <div>
      {renderContent()}
    </div>
   );

  function renderContent() {
    return (
      <div>
        Body
      </div>
    );
  }
}
```

즉, 컴포넌트 안에 렌더러 함수 `renderContent` 가 선언된 형태다.
클래스 컴포넌트에서는 문제가 되지 않았던 렌더러 함수가 함수 컴포넌트로 바꾸고 나서 부터 문제가 발생한다.

그 이유는 다음과 같다.

클래스 컴포넌트는 컴포넌트가 초기에 생성 될 때 메서드와 필드들이 같이 생성되며 렌더링 된다.
이후에는 클래스가 가지고 있는 상태가 변화했을 때나, 자신의 부모 컴포넌트가 변화 했을 때 리렌더링 된다.
리렌더링시에는 클래스의 렌더러 메서드와 그 안에서 호출된 함수들만 실행된다.
즉, **리렌더링이 발생해도 메서드와 필드들이 새로 생성되지는 않는다.**

하지만 함수 컴포넌트는 다르다.
함수 컴포넌트는 초기애 생성될 때 내부에 선언된 함수들은 새로 생성되며 리턴 값으로 반환된 JSX가 파싱되며 렌더러 함수들도 호출된다.
이후에 함수 컴포넌트의 상태가 변화했을 때, 자신의 부모 컴포넌트가 변화했을 때 리렌더링 된다.
리렌더링때에는 **함수 자체가 다시 실행되고, 그 때 내부에 선언된 함수들 또한 새롭게 생성되며
함수 컴포넌트 몸체에 작성된 계산이나 변수들도 다시 다 새롭게 생성/실행된다. (훅으로 작성된 상태나 ref는 예외)**
즉, 리렌더링이 발생하면 **함수 컴포넌트 내부에 있는 렌더러 함수들은 새롭게 생성되며
이 말은 렌더러 컴포넌트 자체가 unmounted 되어 사라진 다음, 새롭게 생성되어 mount된다는 의미다.**
때문에 만약 **렌더러 함수가 내부에서 상태를 가지거나 마운트/언마운트 이벤트에 의존적인 사이드이펙트가 존재한다면, 원치않은 현상이 발생할 수 있다는 의미**이다.
마운트 시에 데이터를 fetch한다면 불필요한 비동기 요청이 계속해서 발생할 수 있으며,
렌더러 함수 내부에 상태가 있다면 부모가 리렌더링 될 때 마다 내부 상태는 초기화 되어 상태를 유지할 수 없게 된다.

때문에 클래스 컴포넌트때는 발생하지 않았던 문제들이 발생할 수 있으므로, 함수 컴포넌트에서는 렌더러 함수를 반드시 독립적인 컴포넌트로 분리하는 작업이 필요했다.

```jsx
function ClassComponent (props) {
  return (
    <div>
      <Content />
    </div>
   );
}
// ✅ renderer 를 독립된 컴포넌트로 분리하세요!
function Content() {
  return (
    <div>
      Body
    </div>
  );
}
```

위와 같이 컴포넌트로 분리하는 과정에서 꼭 암묵적으로 참조되고 있던 변수들을 props로 명시적으로 전달하는 과정을 잘 수행해야한다. 예를 들면 다음과 같다.

```jsx
// ☑️ before
function ClassComponent (props) {
  const content = 'hello world'; // 렌더러에서 암묵적으로 참조하고 있음.
  return (
    <div>
      {renderContent()}
    </div>
   );

  function renderContent() {
    return (
      <div>
        {content}
      </div>
    );
  }
}

// ✅ after
function ClassComponent (props) {
  const content = 'hello world';
  return (
    <div>
      <Content content={content} /> // 명시적으로 props로 전달하자.
    </div>
   );
}
function Content({content}) {
  return (
    <div>
      {content}
    </div>
  );
}
```

## ☠️ Destructuring Props

```jsx
// ❌ DO NOT DESTRUCTRING PROPS
<Components {...restProps} />

// ✅ SEND PROPS STEP BY STEP
<Components propA={propA} propB={propB} propC={propC} />
```

우리 프로젝트는 자바스크립트 환경이다. 위와 같이 props를 구조분해 할당하는 경우가 많았는데, 타입스크립트가 아닌 자바스크립트에서 이렇게 프롭스를 다 내려주면
어디서 받아온 값을 쓰고있는지 디버깅 하기가 매우 매우 어려워진다.
하나 하나 내려주는게 개발할 때는 귀찮더라도 나중에 의존성을 파악하는 데에 있어서는 필수적이다.

## How To Refactor Component Class to Function

마지막으로 간략하게 클래스 컴포넌트에서 함수 컴포넌트로 마이그레이션 했던 순서를 정리하면 다음과 같다.

1. Class > function 으로 변경

2. this.state => useState

3. this.props 로 접근하는 것들 아래와 같이 props 객체 디스트럭쳐링으로 수정

```jsx
// ☑️ before
this.props.show
this.props.onClick

// ✅ after
const { Show, onClick } = props;
```

4. 이전에 `this.setState({ show })` 로 업데이트 하던 로직은 조심해야한다.

변수명의 범위를 잘 고려해야한다.

- 클래스 컴포넌트
```jsx
// ☑️ before
const show = isShow()
this.setState({ show })
console.log(this.state.show) // 상태에 접근할 땐 this.state 로 접근함.
```

- 함수 컴포넌트
```jsx
const [show, setShow] = useState(false)

// ❌ error
const show = isShow() // 새로운 값을 현재 상태와 같은 변수명으로 설정하면 예기치 못한 버그가 발생할 수 있다.
setShow(show)

// ✅ after
const newShow = isShow() // 새로운 값은 new를 붙여주어 상태와는 다른 변수명을 갖도록 해야함.
setShow(newShow)
```

5. `render` 함수를 독립된 `Component` 로 분리. 이때 암묵적으로 공유되던 변수들은 props로 전달해주도록 해야한다.

6. Redux를 사용하는 경우엔 `connect` 걷어내고 `useDispatch`, `useSelector`로 바꿔준다.

## 결론 

클래스 컴포넌트를 함수 컴포넌트로 마이그레이션 하면서, 이전에 함수 컴포넌트만 사용했을 때 느끼지 못했던 불편함을 클래스 컴포넌트에서 느낄 수 있었다. 덕분에 리액트에서 보다 간단하고 직관적인 컴포넌트 구조를 만들기 위해 `hook`을 고안하고 함수 컴포넌트로 대세가 바뀌었는지 이해할 수 있었다.