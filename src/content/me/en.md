---
title: 'About Me'
---

# @dev_hee

**Kang Hee** · Jun 30, 1998

<img width="500" src="/images/me.jpeg" />

## About Me

I'm a frontend engineer who has **modernized a legacy React service with Astro and TypeScript**, working across state management, real-time communication, and deployment.<br/>
I care about **maintenance cost and operational stability**, and focus on building structures that are easy to debug.<br/>
With AI as a development tool, I can **take a product from planning to launch on my own, fast**, and I **design the UI, illustrations, and app assets myself**.

## Tech Stack

- **Frontend**: `React`, `TypeScript`, `Astro`
- **State / Data**: `Nanostore` (Astro), `Redux` (Legacy), `Tanstack Query`
- **Server**: `Node.js` (Astro SSR), `NestJS`
- **Infra / DevOps**: `Docker`, `Kubernetes`, `GitHub Actions`, `k6`
- **Real-time**: Server-Sent Events (SSE)
- **Test**: `Vitest`, `Storybook`, `Playwright`
- **AI**: `Claude Code`, `GitHub Copilot`, `OpenAI API`

## Strength Summary

- Improving legacy technology stacks with a focus on **maintenance costs and structural stability**, not just swapping tools.
- Understanding and explaining state, async, real-time, and deployment flows as **a single cohesive system**.
- Focusing on building **reliable, production-ready architectures** rather than just "working code."

## Projects

### [Kakao Agit](https://www.kakaocorp.com/page/service/service/Agit)

<img width="500" src="/images/agit-image.png" />

- **Period**: 2023.01 ~ Present
- **Overview**: An enterprise collaboration service featuring thread-based communication for specific topics.
- **Tech**: `Astro`, `React`, `TypeScript`, `Node.js`, `SCSS`, `pnpm`, `Axios`, `SSE`, `Radix UI`, `Redux`, `Nanostore`, `GitHub Actions`, `Claude Code`
- **Key Contributions**
  - **React Modernization**
    - When I joined (early 2023), the app was built on **React 16.6 with class components**, released in October 2018 — **two major versions and over four years behind** React 18 (March 2022)
    - As a pre-hooks (16.8) version, it couldn't use modern hook-based libraries, and even small changes had a wide blast radius, making **new feature development difficult**
    - Migrated all class components to function components and upgraded to React 18, **restoring a codebase that can use the hook-based ecosystem** ([Blog Post](/en/posts/react/class-to-function))
  - **Astro Migration (2024.07 ~ Present, co-lead developer on a 2-person team)**
    - Introduced the `Astro` (SSR) framework to turn a large, hard-to-maintain React project into one that can be updated incrementally ([Blog Post](/en/posts/FrontEnd/astrojs))
    - Extended the Astro server into a production-ready Node server with `Sentry` error tracking
    - Removed the complex `Redux` · `RxJS` state layer and migrated to `Nanostore` ([Blog Post 1](/en/posts/react/redux-to-nanostore), [Blog Post 2](/en/posts/react/remove-transformer))
    - Migrated from costly `Web Socket` (Phoenix) to `SSE` ([Blog Post](/en/posts/web/sse))
    - Built a deployment and operation environment for the Astro server with `Docker` and `k8s`, later moving CI/CD to `GitHub Actions` image builds ([Blog Post](/en/posts/web/setting-infra))
    - Conducted load testing with `k6` to allocate infrastructure resources efficiently ([Blog Post](/en/posts/FrontEnd/tps-k6))
    - Built a development environment where AI works by the team's rules, using `Claude Code` sub-agents, skills, and rule documents ([Blog Post](/en/posts/AI/web-astro-ai-setup))
  - **Features Built on the Modernized Foundation**
    - **Post & comment drafts**: Auto-save and restore for every writing form, with automatic retry of failed saves when coming back online (introduced `TanStack Query`)
    - **Received-requests Kanban board**: List / Kanban view toggle, with optimistic updates that move cards on screen before the server responds
    - **Away-on-vacation access alert**: A modal triggered by real-time `SSE` events, with the confirmation state synced across browser tabs
    - **Group join settings popup**: Set category and notifications while joining, with on-the-spot category creation

## Side Projects

### [Grameow](https://grameow-web.vercel.app)

<div class="screenshots">
  <img loading="lazy" src="/images/grameow/grameow-1.png" alt="Grameow start screen" />
  <img loading="lazy" src="/images/grameow/grameow-2.png" alt="Grameow home" />
  <img loading="lazy" src="/images/grameow/grameow-3.png" alt="Grameow my lessons" />
  <img loading="lazy" src="/images/grameow/grameow-4.png" alt="Grameow AI explanation" />
  <img loading="lazy" src="/images/grameow/grameow-5.png" alt="Grameow lesson" />
  <img loading="lazy" src="/images/grameow/grameow-6.png" alt="Grameow learning analytics" />
  <img loading="lazy" src="/images/grameow/grameow-7.png" alt="Grameow AI weakness analysis" />
  <img loading="lazy" src="/images/grameow/grameow-8.png" alt="Grameow learning calendar" />
</div>

- **Period**: 2026.03 ~ 2026.09
- **Overview**: An AI-powered English grammar app for Korean speakers. Users learn grammar through a level roadmap and swipeable lesson cards, and AI explains the questions they got wrong. Launched on the App Store and Google Play with 1,102 sign-ups.
- **Links**: [App Store](https://apps.apple.com/kr/app/%EA%B7%B8%EB%9E%98%EB%AE%A4/id6761358823) · [Google Play](https://play.google.com/store/apps/details?id=com.grameow.app)
- **Tech**: `React Native`, `TanStack Query`, `Zustand`, `NestJS`, `PostgreSQL`, `Astro`, `OpenAI API`, `Claude Code`
- **Key Contributions**:
  - Handled planning, UI design, the app, the API server, and the web (landing and admin) alone through launch and operation, developing with AI using `Claude Code`
  - Generated wrong-answer explanations and weakness analysis with `gpt-4o-mini`, controlling cost with call conditions and per-tier limits
  - Managed the curriculum (18 chapters, 192 lessons) as Markdown and YAML files, with an update script that keeps user progress intact on re-import
  - Spaced-repetition review mode, Apple · Google · Kakao login, and an admin CMS (curriculum editing, DAU · MAU stats)

### Heymo

<div class="screenshots">
  <img loading="lazy" src="/images/heymo/heymo-1.png" alt="Heymo screenshot 1" />
  <img loading="lazy" src="/images/heymo/heymo-2.png" alt="Heymo screenshot 2" />
  <img loading="lazy" src="/images/heymo/heymo-3.png" alt="Heymo screenshot 3" />
  <img loading="lazy" src="/images/heymo/heymo-4.png" alt="Heymo screenshot 4" />
  <img loading="lazy" src="/images/heymo/heymo-5.png" alt="Heymo screenshot 5" />
  <img loading="lazy" src="/images/heymo/heymo-6.png" alt="Heymo screenshot 6" />
  <img loading="lazy" src="/images/heymo/heymo-7.png" alt="Heymo screenshot 7" />
</div>

- **Period**: 2026.05 ~ 2026.06
- **Overview**: An iOS app that lets couples put a short "one-line" card on each other's lock-screen widget and Live Activity. Launched on the App Store.
- **Links**: [App Store](https://apps.apple.com/kr/app/%ED%95%B4%EB%AA%A8/id6774156936)
- **Tech**: `Swift`, `SwiftUI`, `WidgetKit`, `ActivityKit`, `Firebase`, `Cloud Functions`, `Claude Code`
- **Key Contributions**:
  - Handled planning, UI design, and development alone through launch, developing with AI using `Claude Code`
  - Connected couples with invite codes and synced both cards in real time with `Firestore`
  - Updated widget data immediately on push via a Notification Service Extension
  - Called APNs directly from `Cloud Functions` to update the lock-screen Live Activity remotely
  - Photo + text cards, font and color customization, emoji reactions

### [DevJeans](https://devjeans.dev-hee.com/)

<img width="500" src="/images/devjeans.png" />

- **Period**: 2023.03 ~ 2023.08
- **Overview**: A side project for dressing up and sharing your own NewJeans Bunny character, which reached a peak DAU of 35,000.
- **Tech**: `Svelte`, `Fabric.js`, `TypeScript`
- **Key Contributions**:
  - Drew the character, outfit, and accessory illustrations and designed the UI myself
  - Leveraged `Svelte` for rapid development
  - Implemented outfit swapping and drawing features using `Fabric.js` (Canvas API)

---

## Core Experience

### 1. Frontend Architecture Modernization

> - [React | Migrating Class Components to Functional Components](/en/posts/react/class-to-function)
> - [Reflections on the Astro Framework](/en/posts/FrontEnd/astrojs)

- **Upgraded legacy React 16.6 projects to React 18**, performing a full migration from class to functional components.
- Identified and resolved issues where **React version constraints led to excessive maintenance costs** when fixing bugs or updating library specs.
- Cleaned up deprecated APIs (string refs, legacy context) and outdated patterns (renderer method pattern) to **transition into a modern, maintainable React ecosystem**.
- Analyzed and resolved **unnecessary re-rendering and side-effect issues** caused by class component patterns by decoupling renderers into independent components.
- Migrated to an **Astro-based architecture** to overcome the limitations of a single React SPA:
  - Enabled per-page UI framework selection.
  - Reduced React dependency and secured long-term technical extensibility.

### 2. State Management & Structural Refactoring

> - [Moving Away from Complex Redux](/en/posts/react/redux-to-nanostore)
> - [Removing the Transformer Layer](/en/posts/react/remove-transformer)

- Recognized the difficulty in tracking state changes when **asynchronous logic was heavily concentrated in Redux middleware**.
- Performed an **incremental migration from large-scale Redux global state to Nano Store**.
- Transitioned to a **side-effect-free functional structure** by separating async API calls, data transformation, and state updates.
- Decoupled API response processing from reducers into **pure transformer functions**:
  - Minimized the impact of API specification changes.
- Later found that the transformers **hid where state actually changed**, and removed them:
  - Reorganized so that a single request function shows the request → state change → rollback on failure.
- Transitioned JavaScript-based state management to **TypeScript + Nano Store**:
  - Clarified state dependencies.
  - Reduced debugging difficulty and maintenance costs.

### 3. Real-time System / SSE Architecture

> [Designing an SSE Architecture for Real-time Communication: A Scalable 3-Layer System](/en/posts/web/sse)

- Designed a **3-layer SSE-based real-time communication system** for notifications and state synchronization:
  - **Infrastructure Layer**: Connection management, reconnection, and subscription synchronization.
  - **Event Handler Layer**: Independent stores and type definitions per event.
  - **Component Layer**: Declarative subscription and unsubscription.

### 4. Deployment / Infra / Load Testing

> - [Setting up Deployment with In-house Docker Hub and k8s Orchestration](/en/posts/web/setting-infra)
> - [Blue/Green Deployment with ArgoCD Rollouts](/en/posts/web/argo-blue-green)
> - [TPS Testing with k6](/en/posts/FrontEnd/tps-k6)

- Configured the **frontend service deployment environment** using in-house Docker Registry and Kubernetes orchestration.
- Built an **automated deployment flow**: Docker image build → Registry upload → Kubernetes deployment.
- Designed and executed **k6-based load tests** for Astro SSR service operations:
  - Constructed test scenarios by converting actual traffic into RPS units.
  - Configured an **environment capable of stable operation with minimal resources** based on test results.
- Moved **CI/CD to GitHub Actions-based image builds and deployment** when the in-house build service was retired.
- Switched SSR server request logs to **structured JSON logs** with user, browser, and IP information, so failing requests can be traced per user.

### 5. AI Development Environment

> [Making AI Agents Work by the Team's Rules](/en/posts/AI/web-astro-ai-setup)

- Reduced `CLAUDE.md` to a table of contents and split detailed rules into separate documents, designing a structure where **the main session only orchestrates and sub-agents handle repetitive work**.
- Wrote **role-specific sub-agents and skills**, such as an agent that diagnoses bugs and fixes them only after approval, and an i18n agent that updates all four locales at once.
- Recorded **why each rule exists, with dates**, so both people and AI understand the background of every rule.
- Applied the same approach to side projects (Grameow · Heymo) to speed up solo development — Grameow's app, server, and web were all built and launched alone.

---

## Education

### Hankuk University of Foreign Studies (Mar 2018 ~ Aug 2022)
- B.S. in Electronic Engineering

## Language

- **English**: Conversational for everyday situations, and studying consistently

## Hobby

- **Drawing**: I also design the UI for my side projects myself
