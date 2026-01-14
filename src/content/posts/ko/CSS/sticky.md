---
title: 'CSS position: sticky에 대해 알아보자.'
pubDate: 2024-7-30
description: 'CSS position: sticky에 대해 알아보자.'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["CSS"]

---

## CSS Position

CSS의 `position` 프로퍼티는 요소가 document에서 어떻게 위치할 것인지를 나타낸다. `position`에는 `static`, `relative`, `absolute`, `sticky` 4가지 값중 하나를 지정할 수 있다.

유의해야 할 점은, 위의 4가지 값중 하나를 지정하더라도 **실질적인 요소의 위치**는 `top`, `right`, `bottom`, `left` 프로퍼티들로 지정해줘야 한다.

## `position: sticky;`

`position: sticky;`는 `relative` 방식과 `fixed` 방식의 혼합되어 동작한다고 볼 수 있다.

- **지정된 임계값을 넘기 이전**: 요소는 문서의 일반적인 흐름에 따라 배치된다. (`relative`와 동일)
- **지정된 임계값을 넘긴 이후**: `top`, `right`, `bottom`, `left` 값을 기준으로 위치가 고정된다. (`fixed`와 동일)
- 단, `sticky`는 부모 컨테이너 내부에서만 적용되며, 부모 컨테이너는 스크롤이 가능할 정도로 충분히 커야함.

여기서 지정된 임계값이란, **가장 가까운 스크롤 가능한 조상 요소**를 기준으로 `top`, `right`, `bottom`, `left` 위치를 의미한다.

일반적으론 스크롤 가능한 조상 요소가 body이기 때문에 이를 기준으로 예를들면 다음과 같다.

```css
.child {
  position: sticky;
  top: 10px;
}
```

<iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/kheeyaa/embed/BagpJRB?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kheeyaa/pen/BagpJRB">
  Untitled</a> by Kang Hee (<a href="https://codepen.io/kheeyaa">@kheeyaa</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

- 뷰포트가 스크롤되어 요소가 상단 `10px`에 도달하기 전 까지: 요소가 상대적으로 배치됨. (`relative`)
- 뷰포트가 스크롤되어 요소가 상단 `10px`에 도달함: 요소가 상단에서 `10px` 로 고정됨. (`fixed`)

> **단, 부모 컨테이너 경계 내에서만 `position: sticky;` 가 적용된다.** 위 예시에서 `.parent` 요소가 부모 컨테이너고 그 안에서만 `.child` 가 `sticky`하기 때문에, 부모 컨테이너가 뷰포트에서 사라지게되면 더 이상 `top: 0`에 고정되어 있지 않는다.

## 더 디테일한 예시

이번엔 가장 가까운 조상 요소가 스크롤 가능한 요소인 경우를 예로 들어보자.

<iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/kheeyaa/embed/MWMJrWy?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kheeyaa/pen/MWMJrWy">
  Untitled</a> by Kang Hee (<a href="https://codepen.io/kheeyaa">@kheeyaa</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

위 예시에서 파란색 박스 영역에서 상하좌우 스크롤을 해보면, 아래 영상처럼 전구가 회색영역 밖으로 나가지 않는것을 확인할 수 있다.

<video width="300" autoplay loop>
<source src="https://github.com/user-attachments/assets/0d53ca08-8939-4794-bdb3-afa319279645" type="video/mp4">
</video>

동작하는 방식을 보면 `sticky`요소가 설정한 위치 영역(회색 영역) 밖으로는 나가지 못하는 것처럼 보인다. 그 이유는 설정한 임계값들을 넘는 곳까지 스크롤 하게되면, 그 이상을 넘어가지 못하게 고정되어 버리기 때문이다.

```css
.bulb {
  position: sticky;
  inset: 50px 100px 50px 100px;
  /* 위의 값은 다음과 동일함.
   * top: 50px;
   * right: 100px;
   * bottom: 50px;
   * left: 100px;
   */
}
```

해당 예제에서 작성한 `.bulb` 요소는 스크롤 가능한 `div` 요소(하늘색 배경)를 기준으로, 위로 `50px`, 오른쪽으로 `100px`, 아래로 `50px`, 왼쪽으로 `100px` 영역 안에서만 문서 흐름대로 위치할 수 있으며, 그 이상의 영역은 고정된 값(임계값)을 가지게 된다.

> 즉 `-50px <= y <= 50px, -100px <= x <= 100px` 사이의 영역에서만 `relative`하고 그 이상의 영역은 `fixed`다.

정리하면, `position: sticky;`는 요소가 `fixed`처럼 고정될 영역과 `relative`처럼 일반적인 흐름에 포함될 영역을 `top`, `right`, `bottom`, `left`로 지정해주는 것과 같다.


<details>
<summary>css 전체 코드</summary>

```css
div {
  width: 400px;
  height: 200px;
  margin: 30px 0 0 20px;
  overflow: scroll;
  scrollbar-width: thin;
  font-size: 16px;
  font-family: verdana;
  border: 1px solid;
}

p {
  width: 600px;
  user-select: none;
  margin: 0;
  border: 110px solid transparent;
}

.bulb {
  position: sticky;
  inset: 50px 100px 50px 100px;
}

div {
  /* mark area defined by the inset boundaries using gray color */
  background: linear-gradient(#5c5c5c, #5c5c5c) skyblue 100px 50px / 200px 100px no-repeat;
}
```
</details>

## 사용 예시

<iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/kheeyaa/embed/abgpEyq?default-tab=css%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kheeyaa/pen/abgpEyq">
  Untitled</a> by Kang Hee (<a href="https://codepen.io/kheeyaa">@kheeyaa</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

위의 예시처럼 `sticky`를 사용하여 요소가 `box` 영역 안에 붙어서 위치하도록 구현할 수 있다.

- 요소의 상단이 뷰포트(body)상단에 닿기 전: 문서 흐름대로 위치 `relative`
- 요소의 상단이 뷰포트(body)상단에 닿음: 뷰포트 상단에 고정 `fixed`

단, 요소의 부모 컨테이너 내부에서만 `sticky`를 유지함. 따라서 더 스크롤하여 뷰포트에서 부모 컨테이너가 사라지면 `stikcy` 속성을 잃어서 `top: 0`에 고정되지 않는다.

`position: sticky`는 사용자 인터페이스를 만들 때, 특히 네비게이션 바, 제목, 서브헤더 등을 스크롤할 때 항상 보이게 하고 싶을 때 유용하게 사용할 수 있다.

---


> 참고: https://developer.mozilla.org/en-US/docs/Web/CSS/position