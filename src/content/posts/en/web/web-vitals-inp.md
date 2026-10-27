---
title: 'Web Vitals | Interaction to Next Paint (INP) Translation'
pubDate: 2022-12-13
description: 'This post is a translation of Interaction to Next Paint (INP), written by Jeremy Wagner.'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/d30f763c-7f67-4421-81c9-14b2f684bb9d/image.png'
    alt: ''
tags: ["Web"]

---

> This post is a translation of [Interaction to Next Paint (INP)](https://web.dev/inp/), written by Jeremy Wagner.

## INP (Interaction to Next Paint)

![](https://velog.velcdn.com/images/heelieben/post/d30f763c-7f67-4421-81c9-14b2f684bb9d/image.png)

INP (Interaction to Next Paint) is an experimental metric that assesses [responsiveness](https://web.dev/user-centric-performance-metrics/#types-of-metrics). When a page becomes unresponsive due to interactions with it, the user experience is poor. INP observes the latency of all interactions a user has made with the page, and aggregates the values from nearly all of those interactions to report a single value. **A low INP means the page was consistently able to respond quickly to all or most user interactions.**

According to Chrome usage data, **90% of a user's time on a page is spent after it loads**. So it's important to carefully measure responsiveness throughout the entire page lifecycle. This is what the INP metric aims to assess.

Good responsiveness means a page **responds quickly to interactions**. A page responding to an interaction is the **visual feedback** of the browser rendering the next frame. Visual feedback tells you, for example, whether an item you added to an online shopping cart is actually being added, whether a mobile navigation menu has opened, or whether the contents of a login form are being authenticated by the server.

Some interactions will naturally take longer than others. Especially for complex interactions, it's important to quickly present some **initial visual feedback** as a **signal to the user that something is happening**. The time until the next paint is an appropriate point to present that initial visual feedback. So the purpose of INP is not to measure all the eventual effects of an interaction (e.g., network fetches and UI updates from other asynchronous operations), but to measure **the time the next paint is being blocked**. **Delaying visual feedback can give users the impression that the page isn't responding to their actions.**

The goal of INP is, for most of the interactions a user makes, to **reduce the time interval from when the user starts an interaction to when the next frame is painted, as much as possible**.

In the following video, the example on the right provides **immediate visual feedback that the accordion is opening**. It shows how poor responsiveness makes for a bad user experience and can lead to multiple unintended responses to input.

![](https://velog.velcdn.com/images/heelieben/post/b10f5a4c-a032-4970-aa3e-daa0caad91e8/image.gif)

These are examples of a bad case and a good case.
On the left, a long task prevents the accordion from opening. This causes the user to click multiple times, thinking the user experience is bad. When the main thread catches up, it processes the delayed inputs, causing the accordion to open and close unexpectedly.

## What is INP?

INP aims to **represent the overall responsiveness of a page** by measuring all click, tap, and keyboard interactions that occur on the page. When the user finishes with the page, the longest of the observed interactions (with some exceptions mentioned below) is chosen as the page's INP value.

### Interaction

An **interaction** is a **group of event handlers** invoked by the same logical user gesture. For example, a "tap" interaction on a touchscreen device includes multiple events such as `pointerup`, `pointerdown`, and `click`. Interactions can be driven by JavaScript, CSS, built-in browser controls (e.g., `form` elements), or a combination of these.

An **interaction's latency** consists of the single longest duration of the group of event handlers driving the interaction, from the time the user starts the interaction to the moment the next frame is presented with visual feedback.

> For details on how INP is measured, refer to the "What's in an interaction?" section.

## What's a good INP value?

It's difficult to pin labels like "good" or "poor" on responsiveness metrics. On one hand, you want to encourage a development culture that prioritizes good responsiveness. On the other hand, to set achievable development expectations, you have to take into account the fact that there's considerable variance in the capabilities of the devices people use.

To provide a user experience with good responsiveness, a good threshold to measure is the 75th percentile of page loads recorded in the field, segmented across mobile and desktop devices.

- An INP at or below 200 milliseconds means the page has good responsiveness
- An INP above 200 milliseconds and below 500 milliseconds means the page's responsiveness needs improvement
- An INP above 500 milliseconds means the page has poor responsiveness.

> INP is still experimental, and guidance on its thresholds may change over time as it's fine-tuned. The [CHANGELOG](https://web.dev/inp/#changelog) at the end of this document will be updated to reflect any changes.

## What is an interaction?

![](https://velog.velcdn.com/images/heelieben/post/e7e226ed-48c0-4605-bd03-5ef08ff5a145/image.svg)

The diagram above illustrates an interaction well.
`input delay` occurs until event handlers start running, and it can grow longer when the main thread is busy with long tasks. After that, event handlers are called during `processing time`, and during `presentation delay`, there's a delay before the next frame is presented.

The main driver of interactivity is often JavaScript, but interactions can be triggered even when they're not driven by JavaScript, such as with checkboxes, radio buttons, and things controlled by CSS.

INP only observes the following types of interactions.

- Clicking with a mouse
- Tapping on a device with a touchscreen
- Pressing a key on either a physical or onscreen keyboard

> Mouse hover and scrolling don't affect INP. However, scrolling with the keyboard (space bar, page up, page down, etc.) may involve keystrokes, which can trigger other events that INP measures. The resulting scrolling itself is not included in how INP is calculated.

An interaction can consist of two parts, each made up of multiple events.
For example, a keystroke consists of `keydown`, `keypress`, and `keyup` events.
A tap interaction consists of `pointerup` and `pointerdown` events.
The **event with the longest duration** within the interaction becomes the **interaction's latency**.

![](https://velog.velcdn.com/images/heelieben/post/d68ec2e0-88a9-4ea8-a646-175fcb6674eb/image.svg)

The diagram above illustrates an interaction with multiple event handlers.
In the first part of the interaction (`mousedown`), input is received when the user clicks the button. But a frame is presented before the mouse button is released. When the user releases the mouse button, another series of event handlers (`pointup`, `click`) must run before the next frame is presented.

INP is calculated when the user leaves the page, resulting in a single value that represents the page's overall responsiveness throughout the entire page lifecycle. **A low INP means the page reliably responds to user input.**

## How INP differs from FID (First Input Delay)

INP considers all page interactions, whereas FID (First Input Delay) only considers the first interaction. Also, FID only measures the input delay of the first interaction, not the time it takes to run event handlers or the delay in presenting the next frame.

With FID, if the first interaction made with the page during the loading phase has little to no input delay, it means the page made a good first impression.

INP goes beyond first impressions. By sampling all interactions, it can comprehensively assess responsiveness, making **INP a more reliable indicator of overall responsiveness than FID**.

## What if no INP value is reported?

A page may not return an INP value. This can happen for reasons like the following.

- The page loaded, but the user never clicked, tapped, or pressed a key on the keyboard.
- The page loaded, but the user interacted with the page using gestures that didn't involve clicking, tapping, or using the keyboard. For example, scrolling or hovering over elements doesn't calculate INP.
- The page is being accessed by a bot, such as a search crawler or headless browser, that hasn't been scripted to interact with the page.

## How to measure INP

NP can be measured both [in the field (real users) and in the lab (Lighthouse, etc.)](https://web.dev/lab-and-field-data-differences) through a variety of tools.

> The best way to measure your website's INP is by collecting metrics from actual users in the field. If you're accustomed to relying on lab data for assessing performance, take some time to read [Why lab and field data can be different (and what to do about it)](https://web.dev/lab-and-field-data-differences).

### Field measurement tools

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome User Experience Report (CrUX)](https://developer.chrome.com/docs/crux/)
- [web-vitals JavaScript library](https://github.com/GoogleChrome/web-vitals)

```js
// web-vitals JavaScript library
import {onINP} from 'web-vitals';

onINP(({value}) => {
  // Log the value to the console, or send it to your analytics provider.
  console.log(value);
});
```

### Lab measurement tools

- Lighthouse Panel in DevTools, available in "Timespan Mode".
- [Lighthouse npm module](https://www.npmjs.com/package/lighthouse).
- [Lighthouse User Flows](https://web.dev/lighthouse-user-flows/)
- [Web Vitals extension for Chrome](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)


## How to improve INP

[A complete guide to optimizing INP](https://web.dev/optimize-inp/) walks you through the process of identifying slow interactions in the field and using lab data to drill down and optimize them.

---

### Thoughts while reading...

At work, when a user clicked a toggle button that changes a state value,
I implemented it so the toggle would switch on/off when the response arrived from the server.
That made the user experience really bad, so I switched the toggle button's state on/off in advance before the server response arrived, but that turned into a UX where the user could try interacting before the server had properly finished the operation, which could trigger bugs.

So as the best option, I changed the toggle button's state so visual feedback happened immediately, `disable`d the button to prevent further interactions, and showed a loading spinner to indicate the operation was in progress. Afterward, a toast message notified the user that the operation had completed successfully.

While doing this work, I started thinking about what ways there might be to improve the UX that actual users experience, and learning about the newly released `INP` felt like it gave me an answer to that question.

While working on the toggle button, I actually thought it would be nice to have a toggle button design that shows a loading state, so I looked around and was able to find material like this.

!youtube[0ZXkFKlS47I]

At work, the design system was already set, so I didn't apply a toggle button that shows a loading state, but it was a chance to think once more about user experience.
