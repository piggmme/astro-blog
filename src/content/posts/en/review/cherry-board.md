---
title: '🍒 Cherry Board: Whiteboard Project Retrospective'
pubDate: 2023-1-4
description: '🍒 Cherry Board: Whiteboard Project Retrospective'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/679b33fd-5ff5-448d-aaaa-392f455c51f6/image.png'
    alt: ''
tags: ["Review"]

---

# 🍒 Cherry Board 🍒

Cherry Board is a whiteboard tool where, like [FigJam](https://www.figma.com/@figjam), multiple users can gather to draw freely and communicate. I wanted to make the UI as cute and charming as possible! You can stamp emoji like stamps, type text, or upload photos. You can also export the current canvas as an image file to save it. And with the `/` shortcut, you can type a message next to your cursor.


# How did I build it?

## ⚡️ Svelte + Tailwind CSS

![](https://velog.velcdn.com/images/heelieben/post/454cab3c-8643-4a7f-bcf0-ff79102eb741/image.png)


I built Cherry Board using **Svelte**. Up until then, React was the only framework I'd used, so I wanted to try Svelte, which has new concepts and advantages. Svelte, which sets itself apart from React and other frameworks, is fast because it doesn't use a virtual DOM, and above all, its syntax is similar to pure JavaScript, HTML, and CSS, which made the development experience really convenient. 

For styling, I chose Tailwind CSS, which has a utility-first concept. From my experience developing with Styled-component and Emotion among CSS-in-JS libraries, the criteria for naming semantic class names differ from person to person, and even a single person may name things differently as time goes on. With [Component Driven Development](https://yamoo9.github.io/react-master/lecture/sb-cdd.html#컴포넌트-주도-개발의-탄생) and the emergence of various frameworks, the old way of reusing styles via class selectors has been replaced by component reuse, so I think there's no longer much need to name classes semantically like before. Above all, coming up with class names for styling every single time was just way too tedious.

Tailwind CSS explains the benefits of the [utility-first](https://tailwindcss.com/docs/utility-first) approach as follows.

1. **You aren't wasting energy inventing class names.** 
No more adding ~~silly~~ class names like `sidebar-inner-wrapper` just to be able to style something, and no more agonizing over the perfect abstract name for something that's really just a flex container.

2. **Your CSS stops growing.** Using a traditional approach, your CSS files get bigger every time you add a new feature. With utilities, everything is reusable so you rarely need to write new CSS.

3. **Making changes feels safer than before.** Because CSS is global scope, when you change some style you never know what else might break. Classes in your HTML are local, so you can change them without worrying about other problems.

So, among utility-first options, I ended up choosing TailwindCSS, which I'd heard a lot about before and which ranked high on npm trends. 


## 🧶 Fabric.js

![](https://velog.velcdn.com/images/heelieben/post/a940d76b-36de-44f1-b8df-e239854db926/image.png)

While researching libraries that make it easy to work with HTML5 canvas in order to build a real-time multi-user whiteboard, I came across a post with [an example of implementing a whiteboard using Fabric.js](https://medium.com/@aydankirk92/building-a-real-time-multi-user-collaborative-whiteboard-using-fabric-js-part-i-23405823ee03).

With **HTML5 canvas**, drawing simple shapes isn't hard, but the downside is that you have to build everything yourself for complex tasks like selecting or moving those shapes.
In particular, to move a shape, since existing shapes aren't handled as objects, you have to **erase what you previously drew** and draw it again at the new position. So the API provided by canvas alone isn't suitable for complex, delicate work.

```js
var canvasEl = document.getElementById('c');
var ctx = canvasEl.getContext('2d');
ctx.fillStyle = 'red';

ctx.translate(100, 100);
ctx.rotate(Math.PI / 180 * 45);
ctx.fillRect(-10, -10, 20, 20);

// You have to clear the whole canvas and draw the rectangle again.
ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
ctx.fillRect(20, 50, 20, 20);
```

**Fabric.js** manages shapes as objects, so there's no need to clear the canvas again.
You can just access the object directly and rotate or move it, which is super convenient!

```js
var canvas = new fabric.Canvas('c');

// Rotated rectangle
var rect = new fabric.Rect({
  left: 100,
  top: 100,
  fill: 'red',
  width: 20,
  height: 20,
  angle: 45 // rotation
});

// Add the rectangle to the canvas
canvas.add(rect); 

// Move the rectangle's position
rect.set({ left: 20, top: 50 });
canvas.renderAll();
```

Like this, [Fabric.js](http://fabricjs.com/) is an easy yet powerful JavaScript library that provides an **Object model** on top of the Vanilla Canvas API. Fabric.js provides a **drawing mode**, and since it creates and manages the drawings on the canvas as Objects, you can easily add, delete, and modify them. You can also detect events like Objects being added or deleted on the canvas and register handlers. It was also well suited for managing changes to Objects in real time.

```js
canvas.on('object:added', function(options) {
  // do someting 
}
```


## 🔥 Firebase

![](https://velog.velcdn.com/images/heelieben/post/6788310b-3e2c-459e-8948-08e72b6d70d9/image.png)


I chose Firebase as the technology for sending and receiving real-time data. Firebase is a mobile application development platform owned by Google that provides a range of services such as analytics, authentication, databases, file storage, and push messaging. 

Firebase offers two databases, `Cloud Firestore` and `Realtime database`, and you need to choose between them based on your service's features and purpose. There are various [differences between the two databases](https://firebase.blog/posts/2017/10/cloud-firestore-for-rtdb-developers), but the biggest ones are in pricing policy and latency: Firestore is suitable when building an app like a news app where requests for large chunks of data happen occasionally, while conversely, **for a whiteboard app with lots of reads/writes, Realtime Database is said to be more advantageous**.

So Cherry Board was able to use Firebase's `Realtime database` to store canvas changes and propagate those changes to clients in real time. 


# What I wish had gone better 😂

![](https://velog.velcdn.com/images/heelieben/post/26914acf-dcfd-4820-9b9d-c7388e5a61e0/image.png)


## 🏃🏻‍♀️ Concurrency control and CRDT

Cherry Board involves real-time data editing, but I wasn't able to implement concurrency control for it. 

In the `Realtime database`, each canvas room stores `CanvasObjects` in object form. When a user draws something, an `Object` for it is added to `CanvasObjects`. Then those changes are propagated to the other clients. If two users modify/delete a single `Object` at the same time, I didn't implement concurrency control to merge and apply those changes. So as the number of users grows, **data could be lost, or two clients might not see the same canvas screen**.

There are various algorithms for concurrency control. The most representative ones are **OT (Operstional Transformation) and CRDT (Confilct free Replicatied Data Types)**. OT controls concurrency by having a server in the middle adjust data changes, while CRDT lets clients receive and synchronize changes among themselves without a server by assigning unique ids. OT was the technology mainly used in the past, and recently CRDT has been gaining popularity.

> For a detailed explanation of this, please refer to [Real-Time Collaborative Editing: OT and CRDT](https://velog.io/@heelieben/실시간-동시-편집-OT-와-CRDT). 

To apply CRDT, you need a way to propagate changes to clients, similar to WebSockets. Firebase can propagate database changes, but it wasn't suitable for propagating clients' changes without storing them somewhere. 

So I considered adopting the [Automerge](https://automerge.org/) or [Yjs](https://docs.yjs.dev/) library, which provide CRDT functionality. Yjs in particular ranked highest on npm trends, and there are also the [y-websocket](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket) and [y-webtc](https://github.com/yjs/y-webrtc) libraries that connect clients over the network, so I wanted to bring it into Cherry Board. 

![](https://velog.velcdn.com/images/heelieben/post/6a18bb19-21fb-4540-ab60-e054f44d1e24/image.png)


But problems arose because, rather than handling lightweight, simple data like text, I had to handle **fabric.js's complex and heavy `obejct`**. Because one of CRDT's downsides is that it requires extra memory to store unique ids and manage them in a tree structure, the changes to `object`s became even heavier. 
Honestly, I didn't clearly pin down the cause, but due to the large size of the changes and my still-immature development skills, performance dropped dramatically, and there was a problem where changes synchronized really slowly across clients, so in the end I wasn't able to implement concurrency control.



## 🧶 Limitations of the Fabric.js library

Since Fabric.js is a library optimized for drawing, it wasn't suitable for editing text. To add a sticky-note feature like FigJam's, I had to deal with text objects. But I couldn't give a **text object** padding or specify width and height the way you style things with CSS in HTML. So I grouped a paper-shaped rectangle object and a text object together to make something like a sticky note. But a problem arose because **the text could only be edited after ungrouping**. I had put the sticky-note group object in the database, and when you ungrouped it to edit the text, the group object got deleted and a new rectangle object and text object were created, causing a bug where the sticky note got torn apart(?). 

Also, **text editing features**, like automatically turning a list written with `-` into `●` and indenting the text the way Markdown does, aren't provided within fabric.js, so fabric's text object definitely had its limitations. 

So I tried implementing text editing by using an HTML `textarea` floated over the sticky note, but when the cursor was inside the `textarea` area during zoom&panning, the zoom&panning feature didn't work, and if I used `pointer-events-none`, bugs occurred such as the cursor not moving properly when manipulating it inside the `textarea`. (I'll add that due to the complicated code structure, it was hard to figure out the causes of the bugs and hard to write code that worked properly. ㅠㅠ)



## 🤯 Code that gets more complicated the more features you add

When I had only implemented the simple drawing feature, the code didn't get that complicated, but the more new features I added, like concurrency, cursors, shortcuts, and zoom & panning, the messier and more complicated the code became. Because of this, unexpected bugs kept popping up every time I modified the code. 

![](https://velog.velcdn.com/images/heelieben/post/8118635e-8661-459b-94dc-930e2d8e542f/image.png)

[~~like spaghetti code..?~~](https://ko.wikipedia.org/wiki/%EC%8A%A4%ED%8C%8C%EA%B2%8C%ED%8B%B0_%EC%BD%94%EB%93%9C)

I remember that back when I was developing at work, too, when a bug was found in code that had become legacy over time, it was hard to figure out whether it originally worked fine and later broke due to side effects, or whether it had been like that from the start, ~~or when and where on earth the problem even began~~. Having a similar experience with Cherry Board, I came to feel firsthand that in projects with growing features, it's important to **write clean code** and that you need to gain **confidence in your code through test code**.

# In closing...

This is a project that left me with a lot of regrets. I love drawing, so I boldly started Cherry Board, but due to technical debt and my immature development skills, I couldn't finish the features perfectly. Still, I became aware of my development skill level and learned the lesson that I need to study diligently to write better, more reliable code. 

.
.
.

Also, I really like keeping records, but since I'm not great with words and am a developer fluent in zero languages ~~who never even got above a grade 3 in Korean class~~, I don't think I wrote this post very coherently either. I should read some books on writing too. I have a lot of things I want to study, but I also want to work out and ~~want to play too~~, so I feel I need to practice prioritizing what I need to do and tackling things one by one. Anyway, I want to become someone who grows little by little, steadily, so that when I look back later I can say, I've improved this much! 

![](https://velog.velcdn.com/images/heelieben/post/57bf4eb9-084b-40ec-9fb9-3196dad42d26/image.png)

