---
title: 'Building an Icon Component (with SVG stroke)'
pubDate: 2022-4-7
description: 'Building an Icon Component (with SVG stroke)'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/cloudflare/heelieben/13c2a338-1752-4697-b7ba-0ff34e03191e/change-color-svg-icon.png'
    alt: ''
tags: ["React"]

---

## Why an Icon component is needed

When there are a lot of icon SVG images, it's not easy to remember every SVG file, and passing styling and props around is a lot of hassle, so I decided to build an icon component.

## Using SVG images
With SVG, developers can change things like the color and size values themselves, so there's no need to store multiple image files.

In particular, since it's convenient for changing color values, it's good to make good use of SVG.

### Changing the color of an SVG image

An SVG image is made up of xml code like the following.

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20L12 4" stroke="#0A0400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 9.5L11.6464 3.85355C11.8417 3.65829 12.1583 3.65829 12.3536 3.85355L18 9.5" stroke="#0A0400" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Here, the attributes that represent the SVG's colors are as follows.

- `stroke` : usually means the color of a line
- `fill` : usually means the color inside some area, similar to background-color

There are three typical ways to change them, as below.
> 1. `current` or `stroke`, `fill` 
> 2. `currentColor`
> 3. Make a component that returns the SVG and receive color values as props

#### 1. `current` or `stroke`, `fill` 

If you set the value you want to change to `current` as below, you can change the color value with CSS.

In the image above, I changed `stroke="black"` -> `stroke="current"`. 

```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20L12 4" stroke="current" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 9.5L11.6464 3.85355C11.8417 3.65829 12.1583 3.65829 12.3536 3.85355L18 9.5" stroke="current" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Alternatively, you can set `stroke` to `stroke="stroke"` and fill to `fill="fill"`.

With React, you can import an SVG file as a component.
If you pass CSS styles to the imported SVG component as below, you can change those values.

```js
import { ReactComponent as Arrow } from './arrow.svg';

// ...
<Arrow
	css={{
         stroke: 'red', // change line color
         fill: 'blue', // change background color
         width: '20px'
         height: 'auto',
        }}
  />

```
 
 > But this method has a problem. stroke and fill can end up applied to parts of the SVG image you don't want. So the second method is usually used.
 
 #### 2. `currentColor`
 
 It's almost the same as the method above, but instead of `current`, you put `currentColor` in the sections you want to change.
 
 ```xml
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20L12 4" stroke="currentColo" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 9.5L11.6464 3.85355C11.8417 3.65829 12.1583 3.65829 12.3536 3.85355L18 9.5" stroke="currentColo" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

With `currentColor`, when you set a `color` value in css, that color value gets applied.

```js
import { ReactComponent as Arrow } from './arrow.svg';

// ...
<Arrow
	css={{
         color: 'red', // change the color of the sections where currentColor was set
         width: '20px'
         height: 'auto',
        }}
  />

```

> The advantage of this method is that it prevents unwanted stroke and fill from being applied. However, it's limited because you can only modify the single color you changed via color.


#### 3. Make a component that returns the SVG and receive color values as props

Unlike the two methods above, this method makes a component that returns the SVG.

Developers who use React will understand it right away when they see the code below.

> One thing to watch out for is that in `JSX`, props must be written in camel case. So I changed names like `stroke-width` -> `strokeWidth`.


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

> With this method you have to make a component for every single SVG image, so if there are a huge number of SVG images it can become quite a tedious job. So I recommend using the second method.


### Loading SVG images dynamically

As the number of image files grows, it's awkward to `Import` each one individually.
So here's how to `Import` images dynamically.

First, create an `index.ts` file in the `svg` folder and re-export the images.
```js
// svg/index.ts
export { ReactComponent as icon1 } from './icon1.svg';
export { ReactComponent as icon2 } from './icon2.svg';
export { ReactComponent as icon3 } from './icon3.svg';
/*
...
*/
```

In the file where you want to use the images, import them like below.
`icons` is an object with component names as `key`s and component JSX as `value`s, so you can access a component with bracket notation as below.

If you use method 2 and change the color with css, you can change the color of the SVG image.

```js
import * as icons from './svg';

const Icon1 = icons['icon1'];

//...
<Icon1 
	css={{
         color: 'red', // change color
         width: '20px'
         height: 'auto',
        }}
/>

```

## Building the Icon component

Using the second method for changing SVG colors and the method for loading image files dynamically, I was able to build an `Icon` component like the one below.

I set the Icon's `iconTypes` automatically from the SVG names.

With TypeScript, you get type suggestions from `iconTypes`, which makes it very convenient to use.

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
