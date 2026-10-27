---
title: 'React | Migrating Class Components to Function Components'
pubDate: 2024-8-12
description: 'React | Migrating Class Components to Function Components'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["React"]

---
## How I ended up migrating from class to function components

At work, I was put on a project that hadn't been updated in 5 years.
That project was on react `v16.6.0`, a version from before react supported hooks,
so for future maintenance and new feature development, it needed to be updated to a version that could use hooks.
At the same time, the component structure was made up entirely of old-style class components, so readability and reusability were poor.

So I updated react to `v16.8.6`, which supports hooks, and migrated the old class components to function components using hooks.

## Differences between class components and function components that can use hooks

### 1. How they're written

#### Class components

- Class components are written using ES6 class syntax.
- Class components return `JSX` through the `render()` method.

```js
class MyComponent extends React.Component {
  render() {
    return <div>Hello, World!</div>;
  }
}
```

#### Function components
- Components are defined using JavaScript functions.
- Function components return JSX directly.

```js
function MyComponent() {
  return <div>Hello, World!</div>;
}
```

### 2. State management

#### Class components

- To manage state, you use `this.state` inside the class, and state updates use the `this.setState()` method.
- State initialization happens in the class constructor (`constructor`).

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

#### Function components

- State is managed using the `useState` Hook.
- State initialization and updates are done concisely.

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

### 3. Lifecycle methods

#### Class components

- They provide several lifecycle methods for managing the component's lifecycle. `componentDidMount()`, `componentDidUpdate()`, `componentWillUnmount()`, etc.

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

#### Function components

- You can implement lifecycle-like functionality using the `useEffect` Hook.
- `useEffect` can run code when a component mounts, updates, or unmounts, depending on specific conditions.

```js
function MyComponent() {
  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component will unmount');
    };
  }, []); // An empty array makes it run only on mount and unmount

  return <div>Hello, World!</div>;
}
```

### 🤔 Class vs function: overall thoughts

To add a personal aside, for me, the way class components return JSX via the `render` method was a really unfamiliar form.

Also, class components used methods to reuse logic, but to attach a method to a handler you have to bind `this`, like `this.onClick.bind(this)`, which is not intuitive at all and makes the code longer.

And to update state, you always have to go through `this.setState` for every piece of state inside the component, like `this.setState({ open: true })`, which also makes the code you have to write longer. (And since state logic can't be separated out of the component like with hooks, reusing it in other components is of course impossible!!!)

The same goes for lifecycles. Being able to imperatively control the component's lifecycle directly as a developer can be nice. But because of the structural issues of classes, all effects related to mounting have to be written inside `componentDidMount`. This makes separation of concerns difficult.

```js
class MyComponent extends React.Component {
  componentDidMount() {
    // No separation of concerns at all.
    effect1()
    effect2()
    effect3()
  }
  render() {
    return <div>Hello, World!</div>
  }
}
```

In function components, you can split effects up by purpose like below, and if needed, you can extract them into a separate hook and reuse them.

```js
const useEffect3 = () => {
  useEffect(effect3, [])
}
function MyComponent() {
  // Can be written separately by purpose
  useEffect(effect1, [])
  useEffect(effect2, [])

  // Can be extracted into a hook
  useEffect3()

  return <div>Hello, World!</div>;
}
```

## Specs deprecated from older versions

Many of the specs that were used in old-version class components are no longer supported.

### [string `ref`](https://ko.legacy.reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs)

The existing class components were using `string ref`. In other words, these days you use `forwardRef` to access a child component's dom node, but back then you used `string Ref`. With a string ref, you pass a string (`"attachmentBox"`) value down to the child component's `ref` props, like below. If the parent wants to access the child ref, it can do so like `this.refs.attachmentBox`.

```jsx
// Parent component
handleClickAttachment() {
  this.refs.attachmentBox.attachFile();
}
<AttachmentsBoxForm
  ref="attachmentBox"
  // ...
/>
```

```jsx
// Child component
class AttachmentsBoxForm {
  attachFile() {
    this.refs.fileInput.click();
  }

  render() {
    return <input ref="fileInput"/>
  }
}
```

While migrating class components to function components, the following error occurred. It happened because `string ref` can't be used in function components, and I was able to fix it by changing it to `forwardRef`.

```
Error: Function components cannot have string refs. We recommend using useRef() instead. Learn more about using refs safely here:
```

![](https://private-user-images.githubusercontent.com/76723666/356958132-869b004e-0952-4863-bea0-1229146a541d.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjM0NDYyMzgsIm5iZiI6MTcyMzQ0NTkzOCwicGF0aCI6Ii83NjcyMzY2Ni8zNTY5NTgxMzItODY5YjAwNGUtMDk1Mi00ODYzLWJlYTAtMTIyOTE0NmE1NDFkLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA4MTIlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwODEyVDA2NTg1OFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWI3OWQ2NDQyYjllYTAzNWM2ZjIxN2I1YzdmYzQ1MDhiMDEwM2Y3YmFkNWY5Mjk4NDJhYjIyMTMxZDlhYjRkODcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.aSNq_nhF2a8rSpguo4sEwfNcObiQp_c3NoKOW-0lZJo)

### [Legacy Context](https://legacy.reactjs.org/docs/legacy-context.html)

Legacy context is used like below.
First, a child component can access the context provided by the parent through `this.context`.
The parent passes context to the child via `getChildContext`.

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

This is where the problem comes in. If a child uses `this.context.color`,
**it's hard to tell explicitly from the code which parent passed down that context.**
In other words, you have to search for `getChildContext` in the ide and manually find which parent is passing down color.
So depending on which parent it's a child of, it gets strongly tangled up with the parent, but in the code it's hard to see at a glance which parent it's tangled up with.
It seems like readability would drop enormously even if you used just a few legacy contexts.

That's why, in the [Context API](https://react.dev/reference/react/createContext) that was made later, you can see it was changed so that, with Context.Provider and `Context.Consumer` / `usecontext(Context)` etc., you can clearly see who provides which Context and where it's used.

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

## Problems caused by the class Renderer function pattern

**While migrating from class components to function components, a problem came up with the `renderer function` form.**

In class components, you typically declare renderer functions (`renderContent`) as methods like below,
and call them from the `render` function.

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

If you convert this to a function component while changing the shape as little as possible, you get the following.

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

That is, the renderer function `renderContent` is declared inside the component.
The renderer function, which wasn't a problem in the class component, starts causing problems once it's converted to a function component.

The reason is as follows.

In a class component, when the component is first created, its methods and fields are created along with it and it's rendered.
After that, it re-renders when the state the class holds changes, or when its parent component changes.
On re-render, only the class's render method and the functions called within it are executed.
In other words, **even when a re-render happens, the methods and fields are not newly created.**

But function components are different.
When a function component is first created, the functions declared inside it are newly created, and as the JSX returned as the return value is parsed, the renderer functions are also called.
After that, it re-renders when the function component's state changes, or when its parent component changes.
On re-render, **the function itself runs again, and at that time the functions declared inside it are also newly created,
and the computations and variables written in the function component body are all newly created/executed again too. (State or refs written with hooks are the exception)**
In other words, when a re-render happens, **the renderer functions inside the function component are newly created,
which means the renderer component itself is unmounted and disappears, then is newly created and mounted.**
So if **the renderer function holds state internally, or has side effects that depend on mount/unmount events, unwanted behavior can occur**.
If it fetches data on mount, unnecessary async requests can keep happening,
and if there's state inside the renderer function, the internal state gets reset every time the parent re-renders, so the state can't be kept.

Because problems that never happened with class components can occur, in function components it was necessary to always separate renderer functions into independent components.

```jsx
function ClassComponent (props) {
  return (
    <div>
      <Content />
    </div>
   );
}
// ✅ Separate the renderer into an independent component!
function Content() {
  return (
    <div>
      Body
    </div>
  );
}
```

In the process of separating it into a component like above, you must carefully make sure to explicitly pass the variables that were being implicitly referenced as props. For example:

```jsx
// ☑️ before
function ClassComponent (props) {
  const content = 'hello world'; // Implicitly referenced by the renderer.
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
      <Content content={content} /> // Pass it explicitly as props.
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

Our project is a JavaScript environment. There were a lot of cases of destructuring props like above, and in JavaScript rather than TypeScript, if you pass all the props down like this,
it becomes really, really hard to debug where the values you're using came from.
Passing them down one by one may be annoying during development, but it's essential later on for figuring out dependencies.

## How To Refactor Component Class to Function

Finally, here's a brief summary of the steps I followed to migrate from class components to function components.

1. Change Class > function

2. this.state => useState

3. Change things accessed via this.props to props object destructuring, like below

```jsx
// ☑️ before
this.props.show
this.props.onClick

// ✅ after
const { Show, onClick } = props;
```

4. Be careful with logic that used to update via `this.setState({ show })`.

You need to carefully consider the scope of variable names.

- Class component
```jsx
// ☑️ before
const show = isShow()
this.setState({ show })
console.log(this.state.show) // When accessing state, access it via this.state.
```

- Function component
```jsx
const [show, setShow] = useState(false)

// ❌ error
const show = isShow() // Setting a new value with the same variable name as the current state can cause unexpected bugs.
setShow(show)

// ✅ after
const newShow = isShow() // Prefix the new value with new so it has a different variable name from the state.
setShow(newShow)
```

5. Separate the `render` functions into independent `Component`s. At this point, the variables that were implicitly shared should be passed as props.

6. If you're using Redux, remove `connect` and switch to `useDispatch`, `useSelector`.

## Conclusion 

While migrating class components to function components, I got to feel in class components the inconveniences I'd never noticed when I only used function components. Thanks to that, I was able to understand why React came up with `hook` to create simpler and more intuitive component structures, and why the trend shifted to function components.
