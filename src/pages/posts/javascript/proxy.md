---
title: 'JavaScrip Proxy Object'
layout: ../_MarkdownPostLayout.astro
pubDate: 2023-10-25
description: '자바스크립트의 Proxy 객체에 대해 알아보자.'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/3bd9a022-a82c-4df7-ad40-7a1430d43288/image.jpg'
    alt: ''
tags: ["JavaScript"]

---

> 본 글은 Chat GPT가 답변한 내용을 바탕으로 작성된 글입니다. 내용이 오래되거나 오류가 있을 수 있습니다.

## 📌 Proxy 객체는 무엇일까?

JavaScript에서의 Proxy 객체는 다른 객체를 감싸서 그 객체에 대한 접근을 제어하고, 사용자가 정의한 동작을 수행할 수 있게 해주는 객체입니다. 이것은 메타프로그래밍이라는 프로그래밍 패러다임을 지원합니다. 메타프로그래밍은 프로그램이 자기 자신을 조사하고 수정할 수 있는 능력을 가리킵니다.

Proxy 객체는 다음과 같은 상황에서 사용됩니다:

1. **프로퍼티 접근 제어**: Proxy를 사용하여 객체의 특정 프로퍼티에 접근하는 것을 가로챌 수 있습니다. 이를 이용해 읽기, 쓰기, 삭제 등의 동작을 변경할 수 있습니다.

2. **함수 호출 제어**: Proxy를 사용하여 함수 호출을 가로쳐서 함수 호출 전후에 특정 동작을 수행할 수 있습니다.

3. **Object 확장 (Extensibility) 제어**: Proxy를 사용하여 객체의 확장 가능성(Extensible)을 제어할 수 있습니다.

4. **배열에 대한 접근 제어**: Proxy를 사용하여 배열의 동작을 수정하거나 변경할 수 있습니다.

예를 들어, 객체에 대한 접근을 가로채서 특정 조건에 따라 동작을 수정하거나, 특정 프로퍼티에 대한 접근을 제한하는 등의 작업을 할 수 있습니다.

다음은 간단한 Proxy 예제입니다:

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

위 코드에서 `handler` 객체는 Proxy가 호출될 때 어떤 동작을 할지 정의합니다. 이 경우에는 `get` 메서드와 `set` 메서드를 정의하여, 프로퍼티의 값을 읽을 때와 쓸 때의 동작을 변경하고 있습니다.

### 프로퍼티 접근 제어

Proxy를 사용하여 객체의 프로퍼티 접근을 제어하는 예제를 제공하겠습니다.

```javascript
let target = {
  name: 'John',
  age: 30
};

let handler = {
  get: function(target, prop) {
    if (prop === 'age') {
      return target[prop] - 5; // 나이를 5세 줄입니다.
    } else {
      return target[prop];
    }
  }
};

let proxy = new Proxy(target, handler);

console.log(proxy.name); // "John"
console.log(proxy.age); // 25
```

위 예제에서 `handler` 객체에 `get` 메소드를 정의하여 프로퍼티 접근을 제어합니다. 만약 프로퍼티가 'age'인 경우, 실제 값에서 5를 뺀 값을 반환하도록 합니다.

따라서 `proxy.name`은 원래 값인 "John"을 반환하지만, `proxy.age`는 원래 값인 30에서 5를 뺀 25를 반환합니다.

이것은 간단한 예제일 뿐이며, 실제로는 프로퍼티에 접근할 때 다양한 동작을 수행할 수 있습니다. 예를 들어 특정 프로퍼티에 대한 접근을 제한하거나, 접근 로그를 남기거나, 프로퍼티 값을 변조하는 등의 작업을 할 수 있습니다.

### 함수 호출 제어

Proxy를 사용하여 함수 호출을 제어하는 예제를 제공하겠습니다.

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

console.log(proxyAdd(2, 3)); // 함수 호출: 2,3, 결과: 5
```

위 예제에서는 `handler` 객체에 `apply` 메소드를 정의하여 함수 호출을 제어합니다. 

- `apply` 메소드는 함수가 호출될 때 실행되며, 함수의 인자와 함께 호출되는 함수 객체와 this 값이 전달됩니다.
- 이 예제에서는 호출되는 함수에 대한 로그를 출력하고, 원래 함수를 호출합니다.

따라서 `proxyAdd`를 통해 `add` 함수를 호출하면 함수 호출이 로그로 남고 원래 함수가 실행됩니다.

이러한 방식으로 Proxy를 활용하면 함수 호출 전후에 원하는 동작을 수행할 수 있습니다.

### Object 확장 (Extensibility) 제어

객체의 확장 가능성(Extensibility)은 해당 객체에 새로운 프로퍼티를 추가할 수 있는지 여부를 나타내는 속성입니다.

JavaScript에서 기본적으로 객체는 확장 가능합니다. 이는 객체에 새로운 프로퍼티를 언제든지 추가할 수 있다는 것을 의미합니다. 예를 들어:

```javascript
let myObject = {};
myObject.newProperty = '새로운 값';
```

위 코드에서 `myObject`는 빈 객체에서 시작하여 `newProperty`라는 새로운 프로퍼티를 추가했습니다. 이것이 객체의 확장 가능성입니다.

하지만 때로는 객체의 구조를 더욱 견고하게 만들어야 할 필요가 있습니다. 예를 들어, 특정 객체에 대해 더 이상의 프로퍼티 추가를 허용하지 않고 싶을 수 있습니다. 이런 경우 객체의 확장 가능성을 막는 것이 유용합니다.

예를 들어, 다음과 같이 확장 가능성을 막을 수 있습니다:

```javascript
let myObject = {};
Object.preventExtensions(myObject);

myObject.newProperty = '새로운 값'; // 에러 발생
```

위 코드에서 `Object.preventExtensions()`를 사용하여 `myObject`의 확장 가능성을 막았습니다. 따라서 이제 새로운 프로퍼티를 추가할 수 없습니다.

확장 가능성을 막는 이유는 다음과 같습니다:

1. **구조의 안정성**: 특정 객체가 특정한 형태나 구조를 가져야 하는 경우, 더 이상의 프로퍼티 추가를 방지하여 객체의 안정성을 유지할 수 있습니다.

2. **보안**: 중요한 데이터나 함수를 담고 있는 객체의 구조를 고정시켜서 외부에서의 무단 접근을 막을 수 있습니다.

3. **디버깅**: 객체의 구조를 고정시켜서 예기치 않은 프로퍼티 추가로 인한 버그를 방지할 수 있습니다.

4. **의도한 사용범위 설정**: 특정 객체가 특정한 목적을 위해 사용되는 경우, 그 목적 이외의 프로퍼티가 추가되는 것을 방지할 수 있습니다.

요약적으로, 객체의 확장 가능성을 막는 것은 프로그램의 안정성과 예측 가능성을 높이는데 도움을 줍니다.

### 배열에 대한 접근 제어

Proxy를 사용하여 배열에 대한 접근을 제어하는 예제를 제공하겠습니다.

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

proxyArray[1] = 5; // 프로퍼티 값 수정
console.log(proxyArray); // [1, 5, 3]

proxyArray[3] = 4; // 오류: 잘못된 인덱스
```

위 예제에서는 배열에 대한 접근을 제어하기 위해 `handler` 객체에 `get`과 `set` 메소드를 정의합니다.

- `get` 메소드에서는 배열의 길이를 확인하고, 유효한 인덱스에 대해서만 값을 반환합니다.
- `set` 메소드에서는 유효한 인덱스에 대해서만 값을 설정하도록 합니다.

따라서 `proxyArray`를 통해 배열 요소에 접근할 때 유효하지 않은 인덱스를 사용하면 오류가 발생합니다.

이러한 방식으로 Proxy를 활용하면 배열에 대한 접근을 제어하고 원하는 동작을 정의할 수 있습니다.

## 📌 Proxy를 사용한 다양한 예시

Proxy는 다양한 상황에서 유용하게 사용될 수 있습니다. 아래에 몇 가지 사용 예시를 제공합니다:

1. **Validation (유효성 검사)**:
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
   person.age = 30; // 동작
   person.age = '삼십'; // 오류: 나이는 정수여야 합니다.
   ```

2. **Logging (로그 기록)**:
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
   proxiedData.count = 5; // 설정 중: count = 5
   console.log(proxiedData.count); // 읽는 중: count
   ```

3. **캐싱 (Caching)**:
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

   console.log(fibonacci[5]); // 5 (계산된 후에 캐싱됨)
   ```

4. **액세스 제어 (Access Control)**:
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
   console.log(securedData._private); // 오류: 허용되지 않은 접근: _private
   ```

5. **얕은 복사 (Shallow Cloning)**:
   ```javascript
   let original = { a: 1, b: 2 };
   let copy = new Proxy(original, {
     set: function(target, prop, value) {
       target[prop] = value;
       return true; // 항상 true를 반환하여 할당이 성공했음을 나타냄
     }
   });

   copy.c = 3; // 복사본에 새로운 프로퍼티를 추가
   console.log(original.c); // 3 (원본 객체도 업데이트 됨)
   ```

이러한 예시들은 Proxy의 다양한 활용을 보여줍니다. Proxy는 객체의 동작을 가로채고 수정할 수 있어서, 상황에 따라서는 강력한 도구로 활용될 수 있습니다.

### Reflect

`Reflect`는 JavaScript에서 동작을 수행하는 메타 프로그래밍을 위한 내장 객체입니다. `Reflect` 객체의 메소드들은 기본적으로 기존에 존재하던 몇 가지 작업을 간결하게 표현하고 에러 처리를 개선하기 위한 목적으로 도입되었습니다.

`Reflect` 객체는 명령형 작업(Imperative Operations)을 함수 호출로 대체하고, 에러 발생 시 예외를 던지는 대신 `false`나 `undefined`와 같은 값을 반환하여 더욱 명확한 제어 흐름을 가능하게 합니다.

예를 들어, 객체에 대한 프로퍼티 읽기(`get`), 프로퍼티 쓰기(`set`), 함수 호출(`apply`) 등의 작업을 `Reflect`를 사용하여 수행할 수 있습니다.

예시:

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

위 예제에서 `Reflect.get()` 메소드는 `target` 객체의 프로퍼티를 읽습니다. 이것은 `target[prop]`와 동일한 동작을 합니다.

`Reflect`를 사용하면 Proxy 핸들러 내에서 기본 동작을 호출할 수 있어, 프로퍼티 접근이나 함수 호출을 가로채고 원하는 동작을 추가할 수 있습니다.

단순히 말해서 `Reflect`는 Proxy와 함께 사용되어 기본 동작을 호출하는 데 사용됩니다.

## 📌 Vue의 Reactivity와 Proxy

Vue.js에서 데이터를 Proxy로 관리하는 것은 기본적으로 Vue의 반응성(Reactivity) 시스템을 활용하는 것입니다. Vue는 기본적으로 JavaScript의 `Object.defineProperty`나 ES6의 `Proxy`를 사용하여 데이터를 감시하고 업데이트합니다.

아래에 간단한 예시를 제공합니다:

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

이 예제에서 `new Vue({...})`로 Vue 인스턴스를 생성하고, `data()` 메소드에서 `message` 프로퍼티를 반환합니다. 이 프로퍼티는 Vue에 의해 감시되어 변경될 때 화면이 자동으로 업데이트됩니다.

위 코드에서 `data()` 메소드에서 반환된 객체가 Proxy로 감싸지며, 이를 통해 Vue는 데이터의 변화를 감지하고 화면을 업데이트합니다.

이와 같은 방식으로 Vue는 내부적으로 데이터를 Proxy로 다루어 반응성을 구현하고 있습니다. Vue의 반응성 시스템은 데이터의 변화를 감지하고 이에 따라 UI를 업데이트하는 핵심 메커니즘입니다.

## 📌 Proxy를 사용해 양방향 바인딩 구현하기

!codepen[kheeyaa/embed/PoVqWbg?default-tab=js%2Cresult]

순수 자바스크립트로 양방향 데이터 바인딩을 구현한 예제입니다. 폼 데이터 객체 `formData`를 생성하고 이를 Proxy로 감싸어 데이터 변경을 감지하며 화면을 업데이트합니다. `set` 메소드에서 폼 데이터가 변경될 때마다 화면을 업데이트하도록 설정하였습니다.


## 📌 실제 Proxy가 사용된 라이브러리 예제

실제 라이브러리에서 Proxy를 사용하는 많은 예시가 있습니다. 이를 통해 라이브러리는 객체나 데이터에 접근하거나 조작할 때 추가적인 동작을 수행할 수 있습니다. 여기에는 몇 가지 대표적인 라이브러리들과 그들이 Proxy를 사용하는 예시를 소개합니다:

1. **Vue.js (반응성 시스템)**:
   Vue.js는 자체적인 반응성 시스템을 구축하기 위해 Proxy를 사용합니다. 이를 통해 Vue는 데이터의 변경을 감지하고 자동으로 UI를 업데이트합니다.

   예시:
   ```javascript
   let reactiveData = { count: 0 };
   let proxy = new Proxy(reactiveData, {
     set: function(target, prop, value) {
       console.log(`프로퍼티 "${prop}"가 변경되었습니다.`);
       target[prop] = value;
     }
   });
   proxy.count = 5; // 프로퍼티 "count"가 변경되었습니다.
   ```

2. **MobX**:
   MobX는 상태 관리 라이브러리로, Observable 데이터를 사용하여 상태 변경을 추적하고 필요한 곳에서 자동으로 업데이트됩니다. 이를 위해 Proxy를 활용합니다.

   예시:
   ```javascript
   import { observable } from 'mobx';

   const user = observable({
     name: 'John',
     age: 30
   });

   user.name = 'Jane'; // MobX는 변경을 감지하고 자동으로 업데이트합니다.
   ```

3. **Redux Toolkit (immer)**:
   Redux Toolkit은 Redux를 더욱 간편하게 사용할 수 있게 만든 라이브러리입니다. Immer 라이브러리는 불변성을 유지하면서도 쉽게 상태를 업데이트할 수 있도록 Proxy를 사용합니다.

   예시:
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
   MobX-State-Tree은 MobX를 사용한 상태 관리 라이브러리로, 복잡한 애플리케이션의 상태를 효과적으로 관리합니다. 내부적으로 Proxy를 활용하여 상태를 추적하고 업데이트합니다.

   예시:
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

이러한 라이브러리들은 Proxy를 사용하여 데이터의 상태를 관리하고 업데이트하는데에 활용합니다. 이를 통해 개발자는 데이터의 변경을 더욱 편리하게 다룰 수 있습니다.