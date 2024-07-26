---
title: '🍒 체리보드: 화이트보드 프로젝트 회고'
layout: ../_MarkdownPostLayout.astro
pubDate: 2023-1-4
description: '🍒 체리보드: 화이트보드 프로젝트 회고'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/679b33fd-5ff5-448d-aaaa-392f455c51f6/image.png'
    alt: ''
tags: ["Review"]

---

# 🍒 Cherry Board 🍒

체리보드는 화이트보드 툴로, [피그잼](https://www.figma.com/@figjam)처럼 여러 유저들이 모여서 자유롭게 드로잉하고 소통할 수 있어요. UI는 최대한 귀엽고 아기자기하게 가져가고 싶었어요! 이모티콘을 도장처럼 찍을 수도 있고 텍스트를 입력하거나 사진을 올릴 수 있습니다. 또한 현재 캔버스를 이미지 파일로 내보내어 저장할 수도 있어요. 그리고 `/` 단축키를 통해 커서 옆에 메시지를 입력할 수 있어요.


# 어떻게 개발했을까?

## ⚡️ Svelte + Tailwind CSS

![](https://velog.velcdn.com/images/heelieben/post/454cab3c-8643-4a7f-bcf0-ff79102eb741/image.png)


체리보드는 **스벨트**를 사용해서 개발했습니다. 저는 이전까지 사용해본 프레임워크가 리액트 뿐이어서 새롭운 컨셉과 장점들을 가지고 있는 스벨트를 사용해 보고 싶었어요. React와 다른 프레임워크들과 차별점을 가진 스벨트는 가상 DOM을 사용하지 않아서 빠르고, 무엇보다도 퓨어한 JavaScript, HTML, CSS와 유사한 문법으로 개발 경험이 매우 편리했습니다. 

스타일은 utility-first 컨셉을 가진 Tailwind CSS를 선택하였습니다. CSS-in-JS 중 Styled-component와 Emotion으로 개발해본 경험으론, 시멘틱한 클래스 이름 짓기에 대한 기준이 사람마다 다르며, 심지어 한 사람이 작명하더라도 시간이 지남에 따라 다르게 짓기도 합니다. [Component Driven Development](https://yamoo9.github.io/react-master/lecture/sb-cdd.html#컴포넌트-주도-개발의-탄생)와 여러 프레임워크 등장으로 인해서 예전의 클래스 선택자로 스타일을 재사용하는 방법은 컴포넌트의 재사용으로 대체되었기 때문에, 이전처럼 클래스명을 시멘틱하게 지을 필요도 딱히 없어졌다고 생각합니다. 무엇보다도 스타일링을 위한 클래스명을 매번 작명하는 것이 너무나도 귀찮았습니다.

Tailwind CSS는 [utility-first](https://tailwindcss.com/docs/utility-first) 방식이 주는 이점을 다음과 같이 설명합니다.

1. **클래스 이름을 작성하는 데 에너지를 낭비하지 않습니다.** 
더 이상 스타일을 지정하기 위해 `sidebar-inner-wrapper`와 같은 ~~바보같은~~ 클래스 이름을 추가할 필요가 없으며, 실제로는 flex container와 같은 요소의 완전히 추상적인 클래스명에 대해 고민할 필요가 없습니다.

2. **CSS 파일의 크기가 더 이상 커지지 않습니다.** 전통적인 접근 방식을 사용하면 새로운 기능을 개발할 때 마다 CSS 파일이 커집니다. 유틸리티를 사용하면 모든 것을 재사용할 수 있으므로 새 CSS를 작성할 필요가 거의 없습니다.

3. **변화를 주는 것이 이전보다 더 안전하다고 느낍니다.** CSS는 전역 스코브이기 때문에 어떤 스타일을 변경할 때 다른 어떤것에서 문제가 생길지 알 수 없습니다. HTML의 클래스는 지역적으로 관리되므로 다른 문제에 대해 걱정하지 않고 변경할 수 있습니다.

때문에 utility-first 컨셉중에 이전에 익히 들었고 npm trends가 높은 TailwindCSS 를 선택하게 되었습니다. 


## 🧶 Fabric.js

![](https://velog.velcdn.com/images/heelieben/post/a940d76b-36de-44f1-b8df-e239854db926/image.png)

리얼타임 멀티유저 화이트보드를 개발하기 위해 HTML5 canvas 를 쉽게 다룰 수 있는 라이브러리를 리서칭하던중 [Fabric.js 를 사용해 화이트보드를 구현하는 예제](https://medium.com/@aydankirk92/building-a-real-time-multi-user-collaborative-whiteboard-using-fabric-js-part-i-23405823ee03) 글을 읽게 되었습니다.

**HTML5 canvas** 는 간단한 도형을 그리는 것은 어렵지 않지만, 그 도형을 선택하거나 이동하는등의 복잡한 작업을 위해 모든걸 직접 개발해야 한다는 단점이 있습니다.
특히 도형을 이동하기 위해서는 기존 도형을 객체로서 다루지 않기 때문에 **이전에 그린 내용을 지우고** 이동한 위치에 새롭게 다시 그려야합니다. 때문에 복잡하고 섬세한 작업에는 canvas 에서 제공하는 API 만으론 적합하지 않습니다.

```js
var canvasEl = document.getElementById('c');
var ctx = canvasEl.getContext('2d');
ctx.fillStyle = 'red';

ctx.translate(100, 100);
ctx.rotate(Math.PI / 180 * 45);
ctx.fillRect(-10, -10, 20, 20);

// 전체 캔버스를 지우고 다시 사각형을 그려야 한다.
ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
ctx.fillRect(20, 50, 20, 20);
```

**Fabric.js**는 도형을 객체로 관리하기 때문에 새롭게 캔버스를 지우는 과정이 필요 없습니다.
객체에 직접 접근해서 회전하거나 이동시키면 되기 때문에 매우 편리하죠!

```js
var canvas = new fabric.Canvas('c');

// 회전된 사각형
var rect = new fabric.Rect({
  left: 100,
  top: 100,
  fill: 'red',
  width: 20,
  height: 20,
  angle: 45 // 회전
});

// 캔버스에 사각형 추가
canvas.add(rect); 

// 사각형 위치 이동
rect.set({ left: 20, top: 50 });
canvas.renderAll();
```

이렇듯 [Fabric.js](http://fabricjs.com/)는 Vanilla Canvas API 기반으로 **Object 모델**을 제공하여 쉽지만 강력한 자바스크립트 라이브러리 입니다. Fabric.js는 **drawing mode**를 제공하며, 캔버스에 그려질 그림들을 Object로 생성하고 관리하기 때문에 간단하게 추가, 삭제 및 수정할 수 있습니다. 또한 캔버스에서 Object가 추가, 삭제 등의 이벤트를 감지하여 핸들러를 등록할 수 있습니다. 실시간으로 Object의 변경사항을 관리하기에도 적합하였습니다.

```js
canvas.on('object:added', function(options) {
  // do someting 
}
```


## 🔥 Firebase

![](https://velog.velcdn.com/images/heelieben/post/6788310b-3e2c-459e-8948-08e72b6d70d9/image.png)


실시간 데이터를 주고받을 수 있는 기술로 Firebase를 선택하였습니다. 파이어베이스는 구글이 소유하고있는 모바일 애플리케이션 개발 플랫폼으로 분석, 인증, 데이터베이스, 파일 저장, 푸시 메시지 등의 여러 서비스를 제공합니다. 

파이어베이스에서 제공하는 데이터베이스는 `Cloud Firestore` 과 `Realtime database` 두 가지가 있었는데, 서비스의 기능과 목적에 맞춰 선택하여 사용해야 합니다. [두 데이터베이스의 차이점](https://firebase.blog/posts/2017/10/cloud-firestore-for-rtdb-developers)은 여러가지가 있지만, 가장 큰 차이는 가격 정책과 지연시간 측면에서 뉴스앱 처럼 큰 단위의 데이터에 대한 요청이 종종 발생하는 앱을 개발하는 경우엔 Firestore가 적합하고, 반대로 **읽기/쓰기가 많이 발생하는 화이트보드 앱은 Realtime Database가 더 유리**하다고 합니다.

따라서 체리보드는 파이어베이스의 `Realtime database` 를 사용해서 캔버스의 변경사항을 저장하고 클라이언트들에게 실시간으로 변경사항을 전파할 수 있었습니다. 


# 아쉬웠던 점 😂

![](https://velog.velcdn.com/images/heelieben/post/26914acf-dcfd-4820-9b9d-c7388e5a61e0/image.png)


## 🏃🏻‍♀️ 동시성 제어와 CRDT

체리보드는 실시간 데이터 편집이 발생하지만 그에 대한 동시성 제어를 하지 못했습니다. 

`Realtime database`에서 캔버스 방 마다 객체 형태의 `CanvasObjects`를 저장하고 있습니다. 사용자가 그림을 그리면 그에 대한 `Object`가 `CanvasObjects`에 추가됩니다. 그리고 그에 대한 변경사항이 다른 클라이언트들에게 전파됩니다. 만약 두 유저가 동시에 하나의 `Object`를 수정/삭제 하는 경우에는 그에 대한 변경사항을 병합하여 적용하는 동시성 제어하지 않았습니다. 따라서 사용자가 많아지면 **데이터가 손실되거나 두 클라이언트가 같은 캔버스 화면을 보지 못하는 문제**가 생길 수 있습니다.

동시성 제어를 위한 여러가지 알고리즘들이 있습니다. 대표적으로 **OT(Operstional Transformation)와 CRDT(Confilct free Replicatied Data Types)** 가 있습니다. OT는 서버가 중간에서 데이터 변경에 대한 보정을 통해 동시성을 제어하고, CRDT는 고유 id를 부여하는 방식을 통해서 서버 없이 클라이언트끼리 변경사항을 전달받고 동기화할 수 있습니다. OT는 예전에 주로 사용된 기술이었고, 최근에는 CRDT가 인기를 얻고 있습니다.

> 이에 대한 자세한 설명은 [실시간 동시 편집: OT와 CRDT](https://velog.io/@heelieben/실시간-동시-편집-OT-와-CRDT)를 참고 해주세요. 

CRDT를 적용하기 위해서는 웹소켓과 유사하게 변경사항을 클라이언트에게 전파할 방법이 필요합니다. 파이어베이스는 데이터베이스의 변경사항을 전파할 수 있지만, 클라이언트의 변경사항을 어딘가에 저장하지 않고 전파하기엔 파이어베이스가 적합하지 않았습니다. 

따라서 CRDT 기능을 제공하는 [Automerge](https://automerge.org/) 또는 [Yjs](https://docs.yjs.dev/)라이브러리의 도입을 고려해보았습니다. 특히 Yjs는 npm trends 순위가 가장 높았고, 네트워크를 통해 클라이언트를 연결해주는 [y-websocket](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket)와 [y-webtc](https://github.com/yjs/y-webrtc) 라이브러리도 있기 때문에 체리보드에 도입하고 싶었습니다. 

![](https://velog.velcdn.com/images/heelieben/post/6a18bb19-21fb-4540-ab60-e054f44d1e24/image.png)


하지만 텍스트처럼 가볍고 간단한 데이터를 다루는 것이 아닌, **fabric.js의 복잡하고 무거운 `obejct`** 를 다루어야 했기 때문에 문제가 생겼습니다. CRDT의 단점중의 하나인 고유 id를 저장하고 이를 트리구조로 관리하기 위한 추가적인 메모리를 필요로 한다는 점 때문에 `object`의 변경사항은 더욱 무거워지게 되었습니다. 
사실 명확하게 원인을 파악한건 아니지만, 변경사항의 큰 용량과 저의 아직 미숙한 개발 실력 때문에 퍼포먼스가 매우 낮아지게 되었고 각각의 클라이언트에서 변경사항이 정말 느리게 동기화되는 문제가 있었기 때문에 끝내 동시성 제어를 하지 못하였습니다.



## 🧶 Fabric.js 라이브러리의 한계점

Fabric.js는 드로잉에 최적화된 라이브러리이기 때문에 텍스트를 에디팅 하는데는 적합하지 않았습니다. 피그잼처럼 포스트잇 기능을 추가하기 위해서 텍스트 객체를 다뤄야 했습니다. 하지만 **텍스트 객체**를 HTML 에서 CSS로 스타일링 하듯이 padding을 주거나 width height을 지정할 수 없었습니다. 때문에 종이 모양의 사각형 도형 객체와 텍스트 객체를 그룹화 하여 포스트잇 처럼 만들었습니다. 하지만 **그룹을 해제해야만 텍스트를 수정이 가능**했기 때문에 문제가 발생했습니다. 데이터베이스에 포스트잇 그룹 객체를 올려두었는데, 텍스트를 수정하기 위해 그룹을 해제하면 그룹 객체는 삭제되고 사각형 도형 객체와 텍스트 객체가 새롭게 생성되어서 포스트잇이 찢어지는(?) 버그가 발생했습니다. 

또한 마크다운처럼 `-` 로 리스트를 작성하면 자동으로 `●` 으로 바꿔주면서 글자가 들여쓰기되는 것과 같은  **텍스트 에디팅 기능**은 fabric.js 내에서 제공하지 않기 때문에 fabric의 텍스트 객체는 분명 한계점이 존재하였습니다. 

그래서 텍스트 에디팅은 HTML `textarea` 를 사용해서 포스트잇 위에 띄우도록 구현해 보았지만, zoom&panning시 `textarea` 영역에 커서가 들어가있으면 zoom&panning 기능이 작동하지 않았고, `pointer-events-none` 을 사용하면 `textarea` 내부에서 커서로 조작할때 정상적으로 커서 이동이 안되는등의 버그가 발생하였습니다. (덧붙이자면 복잡해진 코드 구조 탓에 버그에 대한 원인 파악이 어려웠고 정상적으로 동작하는 코드를 짜기 어려웠습니다. ㅠㅠ)



## 🤯 기능을 붙일수록 복잡해지는 코드

간단히 드로잉 기능만 구현했을 때는 코드가 그렇게 복잡해지지는 않았지만 동시성, 커서, 단축키, zoom & panning 등의 새로운 기능을 붙일 수록 코드가 정돈되지 않고 복잡해졌습니다. 때문에 코드를 수정할 때 마다 예측하지 못한 버그들이 생겨나게 되었습니다. 

![](https://velog.velcdn.com/images/heelieben/post/8118635e-8661-459b-94dc-930e2d8e542f/image.png)

[~~like 스파게티 코드..?~~](https://ko.wikipedia.org/wiki/%EC%8A%A4%ED%8C%8C%EA%B2%8C%ED%8B%B0_%EC%BD%94%EB%93%9C)

이전에 실무에서 개발을 할 때에도 시간이 지나 레거시가 된 코드에서 버그가 발견되면, 원래는 정상 동작 하였는데 나중에 부수효과로 인해 망가진건지, 아님 원래부터 그랬던건지, ~~도대체 언제 어디부터 문제였던건지~~ 파악하기 어려웠던 기억이 있습니다. 체리보드에서도 이와 유사한 경험을 하면서 기능이 많아지는 프로젝트에서는 **클린한 코드를 짜는 것**의 중요성과 **테스트코드를 통한 코드의 신뢰성**을 얻을 필요가 있다는 것을 피부로 알 게 되었습니다.

# 끝으로...

참 아쉬움이 많이 남은 프로젝트입니다. 그림 그리는걸 좋아해서 호기롭게 체리보드를 시작했지만, 기술 부채와 미숙한 개발 실력으로 기능을 완벽하게 마무리 하지 못하였습니다. 그래도 나의 개발 실력을 인지하였으며 더 좋고 신뢰할만한 코드를 짜기 위해서는 부지런하게 공부해야겠다는 교훈을 얻을 수 있었습니다. 

.
.
.

그리고 기록 남기는걸 참 좋아하는 편인데 워낙 말재주도 없고 ~~국어도 3등급을 넘지 못했던~~ 0개 국어 개발자이기 때문에 이번 포스트도 조리있게 잘 작성하지는 못한것 같네요. 글 쓰기에 관한 책도 읽어야겠습니다. 공부하고 싶은 욕심은 많은데 운동도 하고싶고 ~~놀고도 싶고~~ 해야 할 일을 우선순위를 두고 하나씩 해결해 나가는걸 연습할 필요를 느끼네요. 아무쪼록 앞으로 조금씩 꾸준히 성장해서 나중이 돌이켜봤을 때 이만큼이나 많이 늘었어! 하는 사람이 되고싶습니다. 

![](https://velog.velcdn.com/images/heelieben/post/57bf4eb9-084b-40ec-9fb9-3196dad42d26/image.png)

