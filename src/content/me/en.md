---
title: 'About Me'
---

# @dev_hee

## About Me

I am a frontend engineer specializing in **modernizing legacy React-based services using React 18, Astro, and TypeScript**. I focus on building **scalable and debuggable architectures** by optimizing state management, real-time communication, and deployment environments. Beyond UI implementation, I prioritize **maintenance costs, operational stability, and long-term technical extensibility**.

## Tech Stack

- **Frontend**: `React`, `TypeScript`, `Astro`
- **State / Data**: `Nanostore` (Astro), `Redux` (Legacy), `Tanstack Query`
- **Infra / DevOps**: `Docker`, `Kubernetes`, `k6`
- **Real-time**: Server-Sent Events (SSE)
- **Test**: `Playwright`

## Strength Summary

- Improving legacy technology stacks with a focus on **maintenance costs and structural stability**.
- Understanding and explaining state, async, real-time, and deployment flows as **a single cohesive system**.
- Focusing on building **reliable, production-ready architectures** rather than just "working code."

## Projects

### [Kakao Agit](https://www.kakaocorp.com/page/service/service/Agit)

<img width="500" src="/images/agit-image.png" />

- **Period**: 2023.01 ~ Present
- **Overview**: An enterprise collaboration service featuring thread-based communication for specific topics.
- **Tech**: `Astro`, `React`, `TypeScript`, `SCSS`, `pnpm`, `Axios`, `SSE`, `Radix UI`, `Redux`, `Nanostore`
- **Key Contributions**
  - Refactored legacy React 16 (Class Components) to React 18 (Functional Components) ([Blog Post](/en/posts/react/class-to-function))
  - Led a large-scale refactoring of complex `Redux` state into a functional `API` + `Transformer` + `Store` structure for improved readability and debugging ([Blog Post](/en/posts/react/redux-to-nanostore))
  - Introduced the `Astro` (SSR) framework to enable incremental updates for a large-scale project ([Blog Post](/en/posts/FrontEnd/astrojs))
  - Established a deployment and operation environment for Astro servers using `Docker` and `k8s` ([Blog Post](/en/posts/web/setting-infra))
  - Conducted load testing with `k6` to optimize infrastructure resource allocation ([Blog Post](/en/posts/FrontEnd/tps-k6))
  - Migrated from `Web Socket` (Phoenix) to `SSE` to significantly reduce server costs ([Blog Post](/en/posts/web/sse))

## Side Projects

### [DevJeans](https://devjeans.dev-hee.com/)

<img width="500" src="/images/devjeans.png" />

- **Period**: 2023.03 ~ 2023.08
- **Overview**: A character customization service (NewJeans Bunnies) that reached a peak DAU of 35,000.
- **Tech**: `Svelte`, `Fabric.js`, `TypeScript`
- **Key Contributions**:
  - Leveraged `Svelte` for rapid development and high performance.
  - Implemented character styling and drawing features using `Fabric.js` (Canvas API).

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

> [Moving Away from Complex Redux](/en/posts/react/redux-to-nanostore)

- Recognized the difficulty in tracking state changes when **asynchronous logic was heavily concentrated in Redux middleware**.
- Performed an **incremental migration from large-scale Redux global state to Nano Store**.
- Transitioned to a **side-effect-free functional structure** by separating async API calls, data transformation, and state updates.
- Decoupled API response processing from reducers into **pure transformer functions**:
  - Minimized the impact of API specification changes.
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

---

## Education

### Hankuk University of Foreign Studies (Mar 2018 ~ Aug 2022)
- B.S. in Electronic Engineering
