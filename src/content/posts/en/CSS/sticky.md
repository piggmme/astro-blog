---
title: "Let's Learn About CSS position: sticky."
pubDate: 2024-7-30
description: "Let's Learn About CSS position: sticky."
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["CSS"]

---

## CSS Position

The CSS `position` property indicates how an element will be positioned in the document. `position` can be set to one of 4 values: `static`, `relative`, `absolute`, `sticky`.

One thing to note is that even if you set one of the 4 values above, **the element's actual position** has to be specified with the `top`, `right`, `bottom`, and `left` properties.

## `position: sticky;`

`position: sticky;` can be seen as behaving like a mix of the `relative` and `fixed` approaches.

- **Before crossing the specified threshold**: The element is positioned according to the normal flow of the document. (Same as `relative`)
- **After crossing the specified threshold**: Its position is fixed based on the `top`, `right`, `bottom`, `left` values. (Same as `fixed`)
- However, `sticky` only applies within the parent container, and the parent container must be large enough to scroll.

Here, the specified threshold means the `top`, `right`, `bottom`, `left` position relative to **the nearest scrollable ancestor element**.

Usually, the scrollable ancestor element is the body, so using it as the reference, here's an example.

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

- Until the viewport is scrolled and the element reaches `10px` from the top: The element is positioned relatively. (`relative`)
- The viewport is scrolled and the element reaches `10px` from the top: The element is fixed at `10px` from the top. (`fixed`)

> **However, `position: sticky;` only applies within the boundaries of the parent container.** In the example above, the `.parent` element is the parent container and `.child` is only `sticky` within it, so once the parent container disappears from the viewport, it's no longer fixed at `top: 0`.

## A More Detailed Example

This time, let's take the case where the nearest ancestor element is a scrollable element as an example.

<iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/kheeyaa/embed/MWMJrWy?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kheeyaa/pen/MWMJrWy">
  Untitled</a> by Kang Hee (<a href="https://codepen.io/kheeyaa">@kheeyaa</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

In the example above, if you scroll up, down, left, and right in the blue box area, you can see that the light bulb doesn't go outside the gray area, as in the video below.

<video width="300" autoplay loop>
<source src="https://github.com/user-attachments/assets/0d53ca08-8939-4794-bdb3-afa319279645" type="video/mp4">
</video>

Looking at how it works, the `sticky` element seems unable to go outside the configured position area (the gray area). That's because once you scroll past the configured thresholds, it gets fixed so it can't go any further.

```css
.bulb {
  position: sticky;
  inset: 50px 100px 50px 100px;
  /* The value above is the same as the following.
   * top: 50px;
   * right: 100px;
   * bottom: 50px;
   * left: 100px;
   */
}
```

The `.bulb` element written in this example can only be positioned according to the document flow within the area `50px` up, `100px` to the right, `50px` down, and `100px` to the left, relative to the scrollable `div` element (sky-blue background), and beyond that area it takes on fixed values (the thresholds).

> In other words, it's `relative` only in the area `-50px <= y <= 50px, -100px <= x <= 100px`, and `fixed` beyond that.

To sum up, `position: sticky;` is like using `top`, `right`, `bottom`, `left` to specify the area where the element will be fixed like `fixed` and the area where it'll be part of the normal flow like `relative`.


<details>
<summary>Full CSS code</summary>

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

## Usage Example

<iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/kheeyaa/embed/abgpEyq?default-tab=css%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/kheeyaa/pen/abgpEyq">
  Untitled</a> by Kang Hee (<a href="https://codepen.io/kheeyaa">@kheeyaa</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

As in the example above, you can use `sticky` to make an element stay stuck within the `box` area.

- Before the top of the element touches the top of the viewport (body): positioned according to the document flow, `relative`
- The top of the element touches the top of the viewport (body): fixed at the top of the viewport, `fixed`

However, it only stays `sticky` within the element's parent container. So if you scroll further and the parent container disappears from the viewport, it loses the `stikcy` property and is no longer fixed at `top: 0`.

`position: sticky` is useful when building user interfaces, especially when you want things like navigation bars, titles, and subheaders to always stay visible while scrolling.

---


> Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/position