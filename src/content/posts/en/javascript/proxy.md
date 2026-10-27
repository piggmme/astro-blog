---
title: 'JavaScrip Proxy Object'
pubDate: 2023-10-25
description: "Let's learn about JavaScript's Proxy object."
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/3bd9a022-a82c-4df7-ad40-7a1430d43288/image.jpg'
    alt: ''
tags: ["JavaScript"]

---

> This post was written based on answers from Chat GPT. The content may be outdated or contain errors.

## 📌 What is a Proxy object?

In JavaScript, a Proxy object is an object that wraps another object, controls access to that object, and lets you perform user-defined behavior. It supports a programming paradigm called metaprogramming. Metaprogramming refers to the ability of a program to inspect and modify itself.

Proxy objects are used in situations like the following:

1. **Controlling property access**: Using a Proxy, you can intercept access to specific properties of an object. With this, you can change behaviors such as reading, writing, and deleting.

2. **Controlling function calls**: Using a Proxy, you can intercept function calls and perform specific behavior before and after the function call.

3. **Controlling Object Extensibility**: Using a Proxy, you can control the extensibility (Extensible) of an object.

4. **Controlling access to arrays**: Using a Proxy, you can modify or change the behavior of arrays.

For example, you can intercept access to an object and modify behavior based on specific conditions, or restrict access to specific properties.

Here's a simple Proxy example:

```javascript
let target = {
  value: 42
};

let handler = {
  get: function(target, prop) {
    console.log(`Getting property "${prop}"`);
    return target[prop];
  },
  set: function(target, prop, value) {
    console.log(`Setting property "${prop}" to ${value}`);
    target[prop] = value;
  }
};

let proxy = new Proxy(target, handler);

proxy.value; // "Getting property "value", 42"
proxy.value = 50; // "Setting property "value" to 50"

console.log(target.value); // 50
```

In the code above, the `handler` object defines what behavior to perform when the Proxy is invoked. In this case, it defines a `get` method and a `set` method, changing the behavior when reading and writing property values.

### Controlling property access

I'll provide an example of using a Proxy to control property access on an object.

```javascript
let target = {
  name: 'John',
  age: 30
};

let handler = {
  get: function(target, prop) {
    if (prop === 'age') {
      return target[prop] - 5; // Reduce the age by 5 years.
    } else {
      return target[prop];
    }
  }
};

let proxy = new Proxy(target, handler);

console.log(proxy.name); // "John"
console.log(proxy.age); // 25
```

In the example above, a `get` method is defined on the `handler` object to control property access. If the property is 'age', it returns the actual value minus 5.

So `proxy.name` returns the original value "John", but `proxy.age` returns 25, which is the original value 30 minus 5.

This is just a simple example; in practice, you can perform a variety of behaviors when a property is accessed. For example, you can restrict access to specific properties, log access, or tamper with property values.

### Controlling function calls

I'll provide an example of using a Proxy to control function calls.

```javascript
function add(x, y) {
  return x + y;
}

let handler = {
  apply: function(target, thisArg, args) {
    console.log(`함수 호출: ${args}`);
    return target(...args);
  }
};

let proxyAdd = new Proxy(add, handler);

console.log(proxyAdd(2, 3)); // Function call: 2,3, result: 5
```

In the example above, an `apply` method is defined on the `handler` object to control function calls. 

- The `apply` method runs when the function is called, and it receives the function object being called and the this value, along with the function's arguments.
- In this example, it logs the function being called and then calls the original function.

So when you call the `add` function through `proxyAdd`, the function call is logged and the original function is executed.

By using Proxy this way, you can perform the behavior you want before and after a function call.

### Controlling Object Extensibility

An object's extensibility (Extensibility) is an attribute that indicates whether new properties can be added to that object.

In JavaScript, objects are extensible by default. This means you can add new properties to an object at any time. For example:

```javascript
let myObject = {};
myObject.newProperty = '새로운 값';
```

In the code above, `myObject` starts as an empty object and a new property called `newProperty` is added. This is an object's extensibility.

But sometimes you need to make an object's structure more robust. For example, you might not want to allow any more properties to be added to a specific object. In such cases, preventing the object's extensibility is useful.

For example, you can prevent extensibility like this:

```javascript
let myObject = {};
Object.preventExtensions(myObject);

myObject.newProperty = '새로운 값'; // Throws an error
```

In the code above, `Object.preventExtensions()` is used to prevent `myObject`'s extensibility. So now new properties can't be added.

The reasons for preventing extensibility are as follows:

1. **Structural stability**: When a specific object must have a specific shape or structure, you can maintain the object's stability by preventing further properties from being added.

2. **Security**: By fixing the structure of an object that holds important data or functions, you can block unauthorized access from outside.

3. **Debugging**: By fixing the object's structure, you can prevent bugs caused by unexpected property additions.

4. **Setting the intended scope of use**: When a specific object is used for a specific purpose, you can prevent properties outside that purpose from being added.

In summary, preventing an object's extensibility helps increase a program's stability and predictability.

### Controlling access to arrays

I'll provide an example of using a Proxy to control access to an array.

```javascript
let targetArray = [1, 2, 3];

let handler = {
  get: function(target, prop) {
    if (prop === 'length') {
      return target.length;
    } else {
      let index = Number(prop);
      if (isNaN(index) || index < 0 || index >= target.length) {
        throw new Error('잘못된 인덱스');
      }
      return target[index];
    }
  },
  set: function(target, prop, value) {
    let index = Number(prop);
    if (isNaN(index) || index < 0 || index >= target.length) {
      throw new Error('잘못된 인덱스');
    }
    target[index] = value;
    return true;
  }
};

let proxyArray = new Proxy(targetArray, handler);

console.log(proxyArray[0]); // 1
console.log(proxyArray[1]); // 2

proxyArray[1] = 5; // Modify property value
console.log(proxyArray); // [1, 5, 3]

proxyArray[3] = 4; // Error: invalid index
```

In the example above, `get` and `set` methods are defined on the `handler` object to control access to the array.

- The `get` method checks the array's length and returns values only for valid indexes.
- The `set` method only sets values for valid indexes.

So when you access array elements through `proxyArray` using an invalid index, an error occurs.

By using Proxy this way, you can control access to arrays and define the behavior you want.

## 📌 Various examples using Proxy

Proxy can be useful in a variety of situations. Here are a few usage examples:

1. **Validation**:
   ```javascript
   let validator = {
     set: function(target, prop, value) {
       if (prop === 'age') {
         if (!Number.isInteger(value)) {
           throw new TypeError('나이는 정수여야 합니다.');
         }
       }
       target[prop] = value;
     }
   };

   let person = new Proxy({}, validator);
   person.age = 30; // Works
   person.age = '삼십'; // Error: age must be an integer.
   ```

2. **Logging**:
   ```javascript
   let loggingHandler = {
     get: function(target, prop) {
       console.log(`읽는 중: ${prop}`);
       return target[prop];
     },
     set: function(target, prop, value) {
       console.log(`설정 중: ${prop} = ${value}`);
       target[prop] = value;
     }
   };

   let data = { count: 0 };
   let proxiedData = new Proxy(data, loggingHandler);
   proxiedData.count = 5; // Setting: count = 5
   console.log(proxiedData.count); // Reading: count
   ```

3. **Caching**:
   ```javascript
   let fibonacci = new Proxy({}, {
     get: function(target, n) {
       if (n in target) {
         return target[n];
       }
       if (n === 0 || n === 1) {
         return n;
       }
       target[n] = fibonacci[n - 1] + fibonacci[n - 2];
       return target[n];
     }
   });

   console.log(fibonacci[5]); // 5 (cached after being computed)
   ```

4. **Access Control**:
   ```javascript
   let accessControl = {
     get: function(target, prop, receiver) {
       if (prop.startsWith('_')) {
         throw new Error(`허용되지 않은 접근: ${prop}`);
       }
       return Reflect.get(target, prop, receiver);
     }
   };

   let securedData = new Proxy({ _private: '비밀 정보' }, accessControl);
   console.log(securedData._private); // Error: unauthorized access: _private
   ```

5. **Shallow Cloning**:
   ```javascript
   let original = { a: 1, b: 2 };
   let copy = new Proxy(original, {
     set: function(target, prop, value) {
       target[prop] = value;
       return true; // Always return true to indicate the assignment succeeded
     }
   });

   copy.c = 3; // Add a new property to the copy
   console.log(original.c); // 3 (the original object is updated too)
   ```

These examples show the various uses of Proxy. Since Proxy can intercept and modify an object's behavior, it can be used as a powerful tool depending on the situation.

### Reflect

`Reflect` is a built-in object in JavaScript for metaprogramming that performs operations. The methods of the `Reflect` object were introduced mainly to express some previously existing operations concisely and to improve error handling.

The `Reflect` object replaces imperative operations (Imperative Operations) with function calls, and when an error occurs, instead of throwing an exception, it returns values like `false` or `undefined`, enabling clearer control flow.

For example, you can use `Reflect` to perform operations on an object such as reading a property (`get`), writing a property (`set`), and calling a function (`apply`).

Example:

```javascript
let target = {
  name: 'John',
  age: 30
};

let handler = {
  get: function(target, prop, receiver) {
    console.log(`Getting property "${prop}"`);
    return Reflect.get(target, prop, receiver);
  }
};

let proxy = new Proxy(target, handler);

console.log(proxy.name); // "Getting property "name", "John"
```

In the example above, the `Reflect.get()` method reads a property of the `target` object. This does the same thing as `target[prop]`.

Using `Reflect` lets you call the default behavior inside a Proxy handler, so you can intercept property access or function calls and add the behavior you want.

Simply put, `Reflect` is used together with Proxy to call the default behavior.

## 📌 Vue's Reactivity and Proxy

Managing data with Proxy in Vue.js is basically making use of Vue's reactivity (Reactivity) system. Vue basically uses JavaScript's `Object.defineProperty` or ES6's `Proxy` to watch and update data.

Here's a simple example:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Vue Proxy 예제</title>
  <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
</head>
<body>
  <div id="app">
    <p>{{ message }}</p>
    <button @click="changeMessage">메시지 변경</button>
  </div>

  <script>
    new Vue({
      el: '#app',
      data() {
        return {
          message: '안녕하세요!'
        };
      },
      methods: {
        changeMessage() {
          this.message = '새로운 메시지입니다!';
        }
      }
    });
  </script>
</body>
</html>
```

In this example, a Vue instance is created with `new Vue({...})`, and the `data()` method returns a `message` property. This property is watched by Vue, and when it changes, the screen is updated automatically.

In the code above, the object returned from the `data()` method is wrapped in a Proxy, and through this Vue detects changes to the data and updates the screen.

In this way, Vue internally handles data with Proxy to implement reactivity. Vue's reactivity system is the core mechanism that detects changes in data and updates the UI accordingly.

## 📌 Implementing two-way binding with Proxy

!codepen[kheeyaa/embed/PoVqWbg?default-tab=js%2Cresult]

This is an example of implementing two-way data binding in plain JavaScript. It creates a form data object `formData` and wraps it in a Proxy to detect data changes and update the screen. The `set` method is set up to update the screen whenever the form data changes.


## 📌 Examples of libraries that actually use Proxy

There are many examples of real libraries using Proxy. Through it, libraries can perform additional behavior when accessing or manipulating objects or data. Here are a few representative libraries and examples of how they use Proxy:

1. **Vue.js (reactivity system)**:
   Vue.js uses Proxy to build its own reactivity system. Through this, Vue detects data changes and automatically updates the UI.

   Example:
   ```javascript
   let reactiveData = { count: 0 };
   let proxy = new Proxy(reactiveData, {
     set: function(target, prop, value) {
       console.log(`프로퍼티 "${prop}"가 변경되었습니다.`);
       target[prop] = value;
     }
   });
   proxy.count = 5; // Property "count" has changed.
   ```

2. **MobX**:
   MobX is a state management library that uses Observable data to track state changes and automatically update wherever needed. It uses Proxy for this.

   Example:
   ```javascript
   import { observable } from 'mobx';

   const user = observable({
     name: 'John',
     age: 30
   });

   user.name = 'Jane'; // MobX detects the change and updates automatically.
   ```

3. **Redux Toolkit (immer)**:
   Redux Toolkit is a library that makes Redux easier to use. The Immer library uses Proxy so you can easily update state while maintaining immutability.

   Example:
   ```javascript
   import produce from 'immer';

   const initialState = {
     todos: []
   };

   const nextState = produce(initialState, draftState => {
     draftState.todos.push({ text: 'Learn Proxy' });
   });
   ```

4. **MobX-State-Tree**:
   MobX-State-Tree is a state management library using MobX that effectively manages the state of complex applications. Internally, it uses Proxy to track and update state.

   Example:
   ```javascript
   import { types } from 'mobx-state-tree';

   const Todo = types.model({
     text: types.string,
     completed: false
   });

   const TodoStore = types.model({
     todos: types.array(Todo)
   });

   const store = TodoStore.create({ todos: [] });
   store.todos.push({ text: 'Learn Proxy' });
   ```

These libraries use Proxy to manage and update the state of data. Through this, developers can handle data changes more conveniently.
