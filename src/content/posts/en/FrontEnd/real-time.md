---
title: 'Real-Time Collaborative Editing: OT and CRDT'
pubDate: 2023-1-1
description: "Real-Time Collaborative Editing: Let's learn about OT and CRDT."
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/5adcc6e6-9cdb-4ea8-8e18-918a19259f21/image.png'
    alt: ''
tags: ["FrontEnd"]

---

## Real-Time Collaborative Editing

Google Docs, Figma, VSCode's LiveShare, and others let you edit a single document online at the same time, and multiple users' edits are reflected immediately on each person's editing screen in real time. Like this, more and more services are offering real-time collaborative editing technology.

However, unlike how intuitive collaborative editing looks to the human eye, in terms of implementation, concurrency in a distributed environment is a complex problem, and various technologies have emerged to resolve that ambiguity.

## OT (Operational Transformation)

OT is an approach where the server appropriately transforms inputs according to the order in which they were entered and then delivers them. OT assigns priority based on chronological order, and changes applied earlier are used as information to adjust the next-priority changes.

The server collects user1's change of typing 'C' at the very beginning and user2's change of deleting the first character, respectively. It then sorts the changes by the time they occurred. If inserting the character 'C' is the change that happened earlier in time, typing 'C' pushes the indexes of the subsequent characters back by 1. As a result, **the delete-first-character change is adjusted in index to a delete-second-character change and delivered**.

![](https://velog.velcdn.com/images/heelieben/post/5adcc6e6-9cdb-4ea8-8e18-918a19259f21/image.png)


If user1 and user2 delete the character at the exact same position, the adjusted result is delivered as no change.

![](https://velog.velcdn.com/images/heelieben/post/b439bc2b-d06d-47fc-9883-dd8b1a227f0f/image.png)


The OT approach is fairly intuitive, so it was widely used when collaborative editing features were first introduced. Google Docs and Microsoft Office still use the OT approach.

However, the biggest problem with the OT approach is that it's centralized processing. That is, you need a server in the center to adjust the changes. This has the downside that the server can get overloaded when traffic spikes. It's also bad in terms of cost, and from the user's perspective, usability suffers because it takes time to get a response after the server's computation.

## CRDT (Conflict free Replicated Data Types)

In the early days of collaborative editing technology, OT was mainstream, but now the CRDT approach is gaining popularity. The advantage of CRDT is that it doesn't need a central server, and since only the users editing the document need to exchange data with each other, it's fast and has the effect of reducing server load.

Unlike OT, which adjusts changes based on **edit time and index**, CRDT differs in that it assigns **a unique id to each character** in the stream and defines adjustments based on that.

With CRDT, changes are applied directly to other users' documents without needing adjustment. You can insert a character at the exact position without any priority based on chronological order. When user1 adds 'C', it assigns a new id and adds the character at the position of the character whose id is 1. Then, user2's environment can receive and apply the change. Likewise, user2's change of deleting the character whose id is 1 can be applied in user1's environment.


![](https://velog.velcdn.com/images/heelieben/post/6ef70f97-d710-4b3a-9244-f2ea2db2fb40/image.png)

Even if user1 and user2 delete the character at the same position, because it's based on ids rather than indexes, an id that's already been deleted no longer exists, so duplicate deletion isn't a problem either.


![](https://velog.velcdn.com/images/heelieben/post/2c58ff6e-383d-4294-924f-635a27358217/image.png)


Even CRDT has downsides compared to OT.

1. It uses more memory than OT. Because it requires memory to store unique id values and memory to manage them in a tree structure, it uses 2–3 times more memory than a regular document.

2. Peer-to-Peer communication isn't always possible.  

3. Since CRDT is based on ids rather than time, the notion of real-time becomes ambiguous, and synchronized strings can get mixed up, producing unintended results. 

However, these downsides are being improved now as various technologies come out. [Reference - I was wrong. CRDTs are the future](https://josephg.com/blog/crdts-are-the-future/)

- Speed: Modern CRDTs (Automerge / RGA or y.js / YATA) can do lookups at the log(n) level.
- Size: Martin's Columnar encoding can store things at around 1.5–2 times the document size.
- Features: In theory, rewinding and replaying are possible.
- Complexity: The implementation size of CRDT may be larger than OT's, but there isn't a big difference.

CRDT also clearly has its own advantages.

1. It doesn't need a central server, and users can exchange changes with each other, so it's fast.
2. You can edit documents even offline, and upload the changes later once you're back online. In other words, it isn't constrained by the network. (Can be used like git)

## OT, CRDT Libraries

Implementing OT or CRDT yourself is a very cumbersome job.
There are already many well-built libraries, so you just need to pick one that suits your purpose.

### OT

- Ot : https://github.com/Operational-Transformation/ot.js
- Gulf : https://github.com/gulf/gulf#readme


### CRDT

- Automerge : https://automerge.org/

Automerge is CRDT-based and network-agnostic, and can be used freely in client-server, Peer-to-peer, and local environments. It's built with JavaScript and Rust and can be used on multiple platforms, so it has good compatibility.

- Yjs : https://docs.yjs.dev/

Yjs is also built on CRDT, and its documentation is well written and intuitive. It shows the highest download count on npm trends. Because of that, there are lots of examples to reference, like [yjs-demo](https://github.com/yjs/yjs-demos). 
Since Yjs was born for shared editing of text, it has excellent compatibility with text-editing libraries like [Quill](https://docs.yjs.dev/ecosystem/editor-bindings/quill) and [TipTap](https://docs.yjs.dev/ecosystem/editor-bindings/tiptap2). There are also many related libraries, like [y-presence](https://github.com/nimeshnayaju/y-presence) and [y-websocket](https://github.com/yjs/y-websocket).





> References
> - https://velog.io/@parksil0/OT와-CRDT
> - https://s-core.co.kr/insight/view/새로운-업무환경의-대두-동시-편집-기술/
> - https://news.hada.io/topic?id=2962