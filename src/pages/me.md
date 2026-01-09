---
layout: ./posts/_MeLayout.astro
title: 'About Me'
---

# @dev_hee

## About Me

레거시 React 기반 프론트엔드 서비스를 **React 18 · Astro · TypeScript 중심으로 현대화**하고,<br/>
상태 관리·실시간 통신·배포/운영 환경까지 고려해 **확장 가능하고 디버깅이 쉬운 구조**로 개선해 온 프론트엔드 엔지니어입니다.<br/>
UI 구현을 넘어 **유지보수 비용, 운영 안정성, 장기적인 기술 확장성**을 중요하게 생각합니다.

## Tech Stack

- **Frontend**: `React`, `TypeScript`, `Astro`
- **State / Data**: `Nanostore` (Astro), `Redux` (Legacy), `Tanstack Query`
- **Infra / DevOps**: `Docker`, `Kubernetes`, `k6`
- **Real-time**: Server-Sent Events (SSE)
- **Test**: `Playwright`

## Strength Summary

- 레거시 기술 스택을 **단순 교체가 아닌 유지보수 비용과 구조 안정성 관점에서 개선**합니다.
- 상태·비동기·실시간·배포 흐름을 **하나의 시스템으로 이해하고 설명**할 수 있습니다.
- 단순히 동작하는 코드보다 **안정적으로 운영 가능한 구조**를 만드는 데 집중합니다.

## Projects

### [Kakao Agit](https://www.kakaocorp.com/page/service/service/Agit)

<img width="500" src="/images/agit-image.png" />

- **기간**: 2023.01 ~ 현재
- **개요**: 기업용 협업 서비스. 게시판형 소통으로 특정 주제에 대해 글을 쓰고 댓글을 다는 쓰레드 방식.
- **기술**: `Astro`, `React`, `TypeScript`, `SCSS`, `pnpm`, `Axios`, `SSE`, `Radix UI`, `Redux`, `Nanostore`
- **내용**
  - `Class Component`로 작성된 구 버전 React 16을 `Function Component`로 코드 리팩토링 및 React 18로 업데이트 ([블로그 글 참고](/posts/react/class-to-function))
  - 복잡한 상태관리 라이브러리 `Redux`를 가독성을 개선하고 디버깅이 편리한 함수형 구조의 `API` + `Transformer` + `Store` 구조로 대규모 리팩토링 ([블로그 글 참고](/posts/react/redux-to-nanostore))
  - `Astro` (SSR) 프레임워크를 도입하여 리팩토링 및 유지보수가 어려운 커다란 리액트 프로젝트를 점진적으로 업데이트가 가능한 Astro 로 전환 ([블로그 글 참고](/posts/FrontEnd/astrojs))
  - `Docker`, `k8s` 를 사용하여 아스트로 서버를 배포하고 운영할 수 있는 환경 구축 ([블로그 글 참고](/posts/web/setting-infra))
  - `k6` 를 활용해 부하 테스트를 진행하여 인프라 자원을 효율적으로 할당 ([블로그 글 참고](/posts/FrontEnd/tps-k6))
  - 기존 서버 비용이 컸던 `Web Socket`기반 `phoenix`를 `SSE`로 전환 ([블로그 글 참고](/posts/web/sse))

## Side Projects

### [DevJeans](https://devjeans.dev-hee.com/)

<img width="500" src="/images/devjeans.png" />

- **기간**: 2023.3 ~ 2023.8
- **개요**: 뉴진스 버니 캐릭터를 자기만의 스타일로 꾸미고 공유할 수 있는 서비스로 최대 DAU 3만 5천을 달성한 토이프로젝트
- **기술**: `Svelte`, `Fabric.js`, `TypeScript`
- **내용**:
  - `Svelte`를 사용하여 빠르게 토이프로젝트 개발
  - `Canvas API` 기반의 `Fabric.js` 라이브러리를 사용하여 캐릭터의 의상 교체와 드로잉 등의 기능을 제공

---

## Core Experience

### 1. Frontend Architecture Modernization

> - [React | 클래스 컴포넌트를 함수 컴포넌트로 마이그레이션하기](/posts/react/class-to-function)
> - [Astro 프레임워크에 대한 고찰](/posts/FrontEnd/astrojs)

- **React v16.6 기반 레거시 프로젝트를 React 18 환경으로 업그레이드**하며 클래스 컴포넌트를 함수 컴포넌트로 전면 마이그레이션
- 다수의 React 의존 라이브러리를 사용하는 환경에서, **React 버전 제약으로 인해 버그 수정이나 라이브러리 스펙 변경 시 코드 수정 비용이 과도하게 증가하는 문제를 인식**
- deprecated API(string ref, legacy context 등)와 구버전 패턴(renderer method 패턴)을 정리하여 **유지보수 가능한 React 생태계로 전환**
- 클래스 컴포넌트의 renderer function 패턴이 함수 컴포넌트에서 유발하는 **불필요한 리렌더링 및 사이드 이펙트 문제를 분석**하고, 렌더러를 독립 컴포넌트로 분리
- React 단일 SPA 구조의 한계를 개선하기 위해 **Astro 기반 아키텍처로 마이그레이션**
  - 페이지 단위로 UI 프레임워크 선택 가능
  - React 의존도 감소 및 장기적인 기술 확장성 확보

### 2. State Management / 구조적 리팩토링

> [복잡한 Redux에서 벗어나기 2026.01.04](/posts/react/redux-to-nanostore)

- 비동기 로직이 Redux middleware에 집중되어 **어떤 액션이 어떤 상태를 변경하는지 추적하기 어려운 구조를 문제로 인식**
- 대규모 Redux 전역 상태 중 **개별 reducer를 하나씩 Nano Store로 점진적 마이그레이션**
- 비동기 API 호출, 데이터 변환, 상태 업데이트 로직을 분리한 **사이드 이펙트 없는 함수형 구조로 전환**
- API 응답 가공 로직을 reducer에서 제거하고 **transformer 순수 함수로 분리**
  - API 스펙 변경 시 영향 범위 최소화
- JavaScript 기반 상태 관리 코드를 **TypeScript + Nano Store 기반 구조로 전환**하여
  - 상태 의존성 명확화
  - 디버깅 난이도 및 유지보수 비용 감소

### 3. Real-time System / SSE Architecture

> [실시간 통신을 위한 SSE 아키텍처 설계: 3계층 구조로 구현한 확장 가능한 시스템](/posts/web/sse)

- 실시간 알림 및 상태 동기화를 위해 **SSE 기반 실시간 통신 시스템을 3계층 구조로 설계**
  - 인프라 레이어: 연결 관리, 재연결, 구독 동기화
  - 이벤트 핸들러 레이어: 이벤트별 독립 Store 및 타입 정의
  - 컴포넌트 레이어: 선언적 구독/해제

### 4. Deployment / Infra / Load Testing

> - [사내 Docker hub와 k8s 기반 오케스트레이션 도구를 사용한 배포 환경 설정기](/posts/web/setting-infra)
> - [ArgoCD Rollout로 Blue/Green 배포하기](/posts/web/argo-blue-green)
> - [k6를 사용한 TPS 테스트](/posts/FrontEnd/tps-k6)

- 사내 Docker Registry와 Kubernetes 기반 오케스트레이션 환경에서 **프론트엔드 서비스 배포 환경 구성**
- Docker 이미지 빌드 → Registry 업로드 → Kubernetes 배포로 이어지는 **자동화된 배포 플로우 구축**
- Astro SSR 서비스 운영을 위해 **k6 기반 부하 테스트 설계 및 수행**
  - 실제 트래픽을 RPS 단위로 환산해 테스트 시나리오 구성
  - 테스트 결과를 바탕으로 **최소 자원으로 안정적인 운영이 가능한 환경 구성**


---

## Education

### 한국외국어대학교 (2018년 3월 ~ 2022년 8월)
- 전자공학 학사
