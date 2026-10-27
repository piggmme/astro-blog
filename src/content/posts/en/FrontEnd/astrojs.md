---
title: 'Reflections on the Astro Framework'
pubDate: 2025-3-13
description: 'Reflections on the Astro Framework'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["FrontEnd"]

---

> This post was written when astro was at `v5.4.1`.

## A framework for content-driven websites - Astro

The official Astro website describes the framework as follows.

>Astro is a web framework for building content-driven websites like blogs, marketing, and e-commerce. Astro is best known for pioneering a new frontend architecture to reduce JavaScript overhead and complexity. If you need a website that loads fast and has great SEO, then Astro is for you.

In other words, it's **a framework suited for building "content-driven" websites**.
Content usually means data that doesn't change. That's different from services with lots of user interaction and frequently changing data.

Astro does provide, by default, everything needed to build a website. However, it's suited to building "content-driven" services that rarely change, and for sites with lots of interaction, Astro may not be a good fit.

## Features of Astro

The various features provided by the Astro framework are as follows.

### 1. island

> A component-based web architecture optimized for content-driven websites

Islands are a partial hydration technique that lets only specific components that need interactivity/personalization be loaded dynamically on the client. In other words, an island is a component made up of **statically rendered HTML + JS added when interactivity or personalization is needed**.

By default, islands are made of static HTML. If you want dynamic functionality, you need to pass a `client:*` directive. This is called a client island.

**1. Client islands**

A client island is hydrated independently, separately from the rest of the HTML page. You can think of a client island as an interactive widget that runs on its own on top of HTML already rendered on the server.

By default, if you don't pass a `client:*` directive, Astro automatically strips out client-side JS. Since Astro's goal is to improve performance by reducing unnecessary JavaScript code running on the client side by default, you must specify the directive explicitly.

```jsx
<!-- Doesn't work in the browser. The HTML renders fine. -->
<Counter />
```

If you add the `client:load` directive as below, the component's JS is loaded and hydrated immediately on page load. Astro provides [various client directives](https://docs.astro.build/ko/reference/directives-reference/#%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8-%EC%A7%80%EC%8B%9C%EC%96%B4) so developers can specify the hydration timing whenever they want.

```jsx
<!-- Interactive on the page! -->
<Counter client:load />
```

And since client islands are loaded and hydrated independently on the page — that is, in parallel — users can interact right away without waiting for heavy components further down the page to load.
In the example below, even if `<NotImportantComponent />` is still loading, `<MainContents />` is interactive once it has finished loading.

```jsx
<!-- Loaded!: interactive right away -->
<MainContents client:load />

<!-- Loading... not interactive yet-->
<NotImportantComponent client:load />
```

Thanks to this flexibility of each island in the same page running independently and in isolation, Astro can use multiple UI frameworks (React, Vue, Svelte, ...). Because each island is independent, you can mix and use multiple frameworks. (React + Vue) As below, they operate as client islands via the `client:only=*` directive.

```jsx
<ReactComponent client:only="react" />

<VueComponent client:only="vue" />
```

However, using the `client:only=*` directive **skips HTML server rendering and renders only on the client**. It behaves similarly to `client:load` in that the component is loaded, rendered, and hydrated when the page loads. The difference is that with `client:load`, HTML rendering is done ahead of time on the server and only hydration happens on the client. (You can check this by disabling JavaScript in the developer tools.)

| Property            | `client:load` | `client:only=*` |
|----------------|--------------|----------------|
| **HTML rendering** | Server         | Client     |
| **Hydration** | Client   | Client     |

<!-- Needs verification -->
However, as below, an Astro island passed as a child of a client component does get rendered on the server first and sent down.

```jsx
---
import MyAstroIsand from './my-astro-isand.astro'
const data = fetchUserInfo()
---
<MyReactComponent client:only="react">
  {data.name}
  <MyAstroIsand />
</MyReactComponent>
```


Also, with client islands, **even if an island at the bottom of the page loads first, rendering is blocked if an island at the top of the page is still loading**. If you have many components with slow server-side logic and you don't want rendering blocking to happen because of them, it's better to use server islands.

```jsx
<!-- Loading... not interactive yet-->
<MainContents client:load />

<!-- Loaded! But not rendered because MainContents is still loading-->
<NotImportantComponent client:load />
```


**2. Server islands**

Server islands separate expensive or slow server-side code from the main rendering process.
That is, **you can render dynamic or personalized islands individually on request without sacrificing the performance of the rest of the page**. Even if there's a slower island at the top of the page, rendering isn't blocked.

```jsx
<!-- Loading... not interactive yet-->
<NotImporant server:defer>
  <div slot='fallback'>
    NotImporant 로드중 ...
  </div>
</NotImporant>

<!-- Loaded! Interactive even though NotImporant is still loading.-->
<Counter server:defer>
  <div slot='fallback'>
    Counter 로드중 ...
  </div>
</Counter>
```

You can turn an Astro component into a server island by adding the `server:defer` directive. To use this directive, you absolutely need a dedicated Astro server. So you need to add a server adapter and change `astro.config.js` to `output: 'server'`.

If you write a server island like this

```html
<ServerIsland server:defer />
```

you can see that an `inline script` has been added to the document, as below.
This script asynchronously `fetch`es the server island and adds it to the DOM once it receives it.

<img alt="CORS error example" src="/images/astrojs_server-island.png" />

Because server islands are rendered on the server and delivered asynchronously, if you disable JavaScript in the developer tools, the server island isn't rendered on the client.

### 2. UI-agnostic

> Supports React, Preact, Svelte, Vue, Solid, HTMX, web components, and more

Astro isn't tied to any particular UI framework. That is, developers can freely choose whichever UI framework they want to build Astro islands. This is where a big difference between NextJS and Astro lies, because NextJS is an SSR framework built on top of React.

```jsx
---
import MyReactComponent from '../components/MyReactComponent.jsx';
import MySvelteComponent from '../components/MySvelteComponent.svelte';
import MyVueComponent from '../components/MyVueComponent.vue';
---
<div>
  <MySvelteComponent />
  <MyReactComponent />
  <MyVueComponent />
</div>
```

However, while you can import UI framework components inside an Astro island, you can't import islands inside a UI framework component. In a way that's obvious, since React or Vue wouldn't support Astro islands.

```jsx
import MyAstroIsland from './astro-island.astro'

export default function MyReactComponent () {
  return (
    <div>
      {/* Not supported! */}
      <MyAstroIsland />
    </div>
  )
}

```

But passing an Astro component as a child to a React component, as below, is possible.

```jsx
<MyReactButton>
  <MyAstroTitle />
</MyReactButton>
```

### 3. Server-first

> Removes expensive rendering work from visitors' devices

Astro tries to make server rendering the top priority over rendering in the browser. That's because that's Astro's philosophy. Loading and rendering content with JavaScript on the client is inevitably slower than rendering it on the server. That's why Astro is designed to render on the server first by default, and you have to explicitly mark a client island with the `client:only=*` directive to switch to client rendering.

This structure contrasts with other frameworks like Next.js. You could say Astro is an MPA (Multi Page Application), and Next.js is an SPA (Single Page Application) that provides some server-side rendering. (Or so the official Astro docs say)

> Personal opinion: I feel like there's a point where Astro's server-first principle conflicts with the concept of managing state on the client. As a client developer, I want to avoid unnecessarily requesting data I've already fetched once every time I navigate pages, but in Astro, which is based on MPA, the server has no way of knowing whether this is data the same client requested before, so it has no choice but to keep fetching duplicate data on every request and rendering it again. **Astro seems to intend: "I'm not interested in sending the minimum number of requests to the backend server, and any server load or side effects from that aren't my responsibility from Astro's point of view, so FE developers, figure it out yourselves — switch to client islands or whatever and improve it."** Since Astro supports `View Transaction`, even though it's an MPA it re-renders only the changed areas smoothly like an SPA, as if it were one app, so there's no problem in usability, but efficiently reducing api requests is something FE developers have to judge for themselves and structure well. So **it seems you need to make the effort to perform SSR only for the truly "content" areas, and cleanly separate "user data or data that doesn't need to be requested repeatedly" into client islands to prevent unnecessary re-requests.**


### 4. Minimal JavaScript

> Minimizes client-side JavaScript that slows down your site

Since Astro by default fetches content (`GET`) on the server side and pre-renders it, the logic for loading content on the client side can be removed. That is, the client only needs the scripts actually used for interacting with the user (`POST`, `DELETE`, ...). So the code gets shorter and content can be shown on screen faster.

An Astro island (`.astro`) has the following structure. 

```jsx
---
// Component script (JavaScript)
---
<!-- Component template (HTML + JS expressions) -->
```

- Component script
  - A script that runs on the server and does not run on the client. (So functions for interacting with the user can't be written here. Interaction scripts have to be written in a `<script>` in the component template. This is the inconvenient part...)
  - You can `import` other components.
  - You can fetch content via APIs.
  - You can declare variables to be referenced in the template. (Not functions.)
- Component template
  - Determines the HTML to be output.
  - You can specify rendering timing via special Astro directives (`client:`, `server:`).
  - `<style>`: you can specify local styles or global styles.
  - `<script>`: to add interactivity to a component, you must use this script tag. By default it's bundled at build time and generated as a separate module; if you want to prevent that, add the `is:inline` directive.

What I find disappointing while using Astro is that for event handling you have to write scripts the old-fashioned way, as below. Because of this, it seems better to use external libraries like React or Vue for areas with a lot of interaction.

```jsx
<button class="alert">Click me!</button>

<script>
  // Find all buttons on the page that have the `alert` class.
  const buttons = document.querySelectorAll('button.alert');

  // Handle clicks on each button.
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      alert('Button was clicked!');
    });
  });
</script>
```


### 5. Content collections

> Organizes and validates Markdown content and provides TypeScript type safety

Content collections are an Astro feature for organizing and validating Markdown/MDX content

### Features of content collections

1. **Grouping content**
- Gathers and manages related content under the `src/content/` directory
- e.g. organizing blog posts, product pages, etc. into their own collections

2. **Schema-based validation**
```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    tags: z.array(z.string())
  })
});

export const collections = {
  'blog': blogCollection
};
```

3. **TypeScript type safety**
- Defining a schema automatically generates TypeScript types
- Guarantees type safety when querying content

4. **Content query API**
```typescript
// Query all entries in the collection
const allPosts = await getCollection('blog');

// Query with filtering
const featuredPosts = await getCollection('blog', ({ data }) => {
  return data.featured === true;
});
```

5. **Automatic slug generation**
- Automatically generates URL slugs based on file names
- Custom slugs can also be defined

6. **Markdown/MDX optimization**
- Frontmatter data validation
- Optimized markdown parsing and rendering
- MDX support lets you use components inside markdown

Using content collections, you can manage markdown-based content systematically and secure type safety.

## Summary of Astro framework features

1. Optimized for content-driven websites

- Suited for **websites with a lot of static content** such as blogs, marketing, and e-commerce
- Not suited for services where data changes frequently or there's a lot of user interaction

2. Key features

- Island architecture
  - Renders **static HTML by default**
  - Selectively runs client JS only where needed (`client:*` directive)
  - Heavy server logic can be separated out with server islands (`server:defer`)

- UI framework independence
  - Can mix various UI frameworks such as React, Vue, and Svelte
  - Each island runs independently, so there are no framework conflicts

- Server-first rendering
  - Renders HTML on the server by default
  - Issue of unnecessary API re-requests due to the MPA structure
  - Provides SPA-like UX with View Transitions

- Minimal JavaScript
  - Optimizes performance by minimizing client JS
  - Selectively runs JS only where interaction is needed
  - Limitation of having to handle events with plain JS

## Conclusion

Astro is a framework that's very well suited for building **content-driven static websites**. With features like server-rendering-first and minimal JavaScript, it provides fast loading speed and good SEO.

However, careful consideration is needed in the following situations.
1. Web applications with a lot of user interaction
2. Services with frequent real-time data updates
3. Cases where client state management is important

In these cases, Next.js or another SPA framework may be a better fit.
