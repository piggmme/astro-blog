---
title: 'Icon 컴포넌트 만들기 (with SVG stroke)'
layout: ../_MarkdownPostLayout.astro
pubDate: 2022-4-7
description: 'Icon 컴포넌트 만들기 (with SVG stroke)'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/cloudflare/heelieben/13c2a338-1752-4697-b7ba-0ff34e03191e/change-color-svg-icon.png'
    alt: ''
tags: ["React"]

---

## Icon 컴포넌트의 필요성

아이콘 SVG 이미지의 수가 많은 경우에 모든 SVG 파일을 기억하기도 쉽지 않고, 스타일링과 props를 전달하기에 번거로움이 많기 때문에 아이콘 컴포넌트를 만들기로 했다.

## SVG 이미지를 활용하기
SVG는 개발자가 직접 색상값과 크기 값등을 변경할 수 있기 때문에 여러개의 이미지 파일을 저장할 필요가 없다.

특히 색상값을 변경하기 편리하다는 점에서 SVG를 잘 활용하는것이 좋다.

### SVG 이미지의 색상 변경

SVG 이미지는 아래와 같이 xml 코드로 이루어져있다.

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20L12 4" stroke="#0A0400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 9.5L11.6464 3.85355C11.8417 3.65829 12.1583 3.65829 12.3536 3.85355L18 9.5" stroke="#0A0400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

여기서 SVG의 색상을 의미하는 속성값들은 다음과 같다.

- `stroke` : 보통 선의 색상을 의미함
- `fill` : 보통 어떤 영역 안의 색상을 의미하며 background-color 와 유사함

변경하는 방법은 대표적으로 아래와 같이 세 개가 있다.
> 1. `current` 또는 `stroke`, `fill` 
> 2. `currentColor`
> 3. SVG를 반환하는 컴포넌트를 만들어 props로 색상 값 받기

#### 1. `current` 또는 `stroke`, `fill` 

변경하고 싶은 값을 아래와 같이 `current` 로 지정해주면 CSS로 색상 값을 변경할 수 있다.

위의 이미지에서 `stroke="black"` -> `stroke="current"` 로 변경해주었다. 

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20L12 4" stroke="current" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 9.5L11.6464 3.85355C11.8417 3.65829 12.1583 3.65829 12.3536 3.85355L18 9.5" stroke="current" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

또는 `stroke` 는 `stroke="stroke"` 로, `fill="fill"` 로 설정해주어도 된다.

리액트를 사용하면 SVG파일을 컴포넌트로 import할 수 있다.
가져온 SVG 컴포넌트에게 CSS 스타일을 아래와 같이 넣어주면 해당 값을 변경할 수 있다.

```js
import { ReactComponent as Arrow } from './arrow.svg';

// ...
<Arrow
	css={{
         stroke: 'red', // 라인 색상 변경
         fill: 'blue', // 배경 색상 변경
         width: '20px'
         height: 'auto',
        }}
  />

```
 
 > 하지만 이 방법은 문제가 존재한다. SVG 이미지가 원하지 않는 부분에 stroke, fill이 적용될 수 있기 때문이다. 따라서 보통 두번째 방법을 사용한다.
 
 #### 2. `currentColor`
 
 위의 방법과 거의 유사하지만, `current` 대신에 `currentColor` 을 변경하고 싶은 구간에 넣어준다.
 
 ```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20L12 4" stroke="currentColo" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 9.5L11.6464 3.85355C11.8417 3.65829 12.1583 3.65829 12.3536 3.85355L18 9.5" stroke="currentColo" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

`currentColor` 는 css로 `color` 값을 설정 했을 경우 그 색상 값이 적용된다.

```js
import { ReactComponent as Arrow } from './arrow.svg';

// ...
<Arrow
	css={{
         color: 'red', // currentColor을 넣은 구간의 색상 변경
         width: '20px'
         height: 'auto',
        }}
  />

```

> 이 방법의 장점은 원치 않는 stroke와 fill이 적용되는 것을 막을 수 있다는 점이다. 하지만 color 로 변경한 단 한가지 색상만 수정할 수 있기 때문에 제약이 있다.


#### 3. SVG를 반환하는 컴포넌트를 만들어 props로 색상 값 받기

이 방법은 위의 두 개의 방법과는 다르게 SVG를 반환하는 컴포넌트를 만든다.

리액트를 사용하는 개발자들은 아래의 코드를 보면 한번에 이해가 될 것이다.

> 주의할 점은 `JSX` 는 props를 반드시 camel case 로 작성해주어야 한다. 따라서 `stroke-width` -> `strokeWidth` 처럼 네임을 변경해 주었다.


```js
import { ReactElement } from 'react';

interface ArrowProps {
  stroke: string;
  fill: string;
}

export default function Arrow({ stroke, fill }: ArrowProps): ReactElement {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20L12 4"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9.5L11.6464 3.85355C11.8417 3.65829 12.1583 3.65829 12.3536 3.85355L18 9.5"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

> 이 방법은 SVG 이미지 마다 컴포넌트를 하나하나 만들어 주어야 해서, SVG 이미지가 엄청나게 많다면 상당히 번거로운 작업이 될 수 있다. 따라서 두 번째 방법을 사용하는 것을 추천한다.


### SVG 이미지 동적으로 꺼내오기

이미지 파일의 수가 많아지만 하나하나 `Import` 해서 꺼내오기 곤란하다.
따라서 동적으로 이미지를 `Import` 하는 방법은 다음과 같다.

먼저 `svg` 폴더의 `index.ts` 파일을 만들어 이미지들을 다시 내보내기 한다.
```js
// svg/index.ts
export { ReactComponent as icon1 } from './icon1.svg';
export { ReactComponent as icon2 } from './icon2.svg';
export { ReactComponent as icon3 } from './icon3.svg';
/*
...
*/
```

이미지를 사용하고 싶은 파일에서 아래처럼 import 한다.
`icons` 는 컴포넌트 이름을 `key`로, 컴포넌트 JSX를 `value` 로 가진 객체이므로 아래처럼 대괄호 표기법으로 컴포넌트에 접근할 수 있다.

2번 방식을 사용해서 css로 color을 변경해주면 SVG 이미지의 색상을 변경 가능하다.

```js
import * as icons from './svg';

const Icon1 = icons['icon1'];

//...
<Icon1 
	css={{
         color: 'red', // 색상 변경
         width: '20px'
         height: 'auto',
        }}
/>

```

## Icon 컴포넌트 만들기

SVG 색상을 바꾸는 두 번째 방법과, 이미지 파일을 동적으로 꺼내오는 방법을 활용하여 아래와 같이 `Icon` 컴포넌트를 만들 수 있었다.

Icon의 `iconTypes` 을 SVG 이름으로 자동으로 지정하였다.

타입스크립트를 사용하면 `iconTypes` 로 타입을 추천 받을 수 있어서 매우 편리하게 사용할 수 있다.

```ts
import { ReactElement } from 'react';

import * as icons from './svg';

export type IconType = keyof typeof icons;
export const iconTypes: IconType[] = Object.keys(icons) as IconType[];

export interface IconProps {
  icon: IconType;
  color?: string;
  stroke?: string;
  size?: string | number;
  onClick?: () => void;
}

const NORMAL_STROKE_COLOR = '#0A0400';

function Icon({
  icon,
  stroke,
  size,
  onClick,
}: IconProps): ReactElement {
  const SVGIcon = icons[icon];
  const strokeColor = stroke || NORMAL_STROKE_COLOR;
  const widthPx =
    size &&
    (typeof size === 'number' ? `${size}px` : `${size.replace('px', '')}px`);

  return (
    <SVGIcon
      onClick={onClick}
      css={{
        color: strokeColor,
        width: widthPx,
        height: 'auto',
      }}
    />
  );
}

export default Icon;


```
