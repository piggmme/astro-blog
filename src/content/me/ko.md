---
title: 'About Me'
---

# @dev_hee

**강희** · 1998.06.30

<img width="500" src="/images/me.jpeg" />

## About Me

레거시 React 서비스를 **Astro · TypeScript 기반으로 현대화**하며 상태 관리부터 실시간 통신 · 배포까지 다뤄 온 프론트엔드 엔지니어입니다.<br/>
**유지보수 비용과 운영 안정성**을 중요하게 생각하고, 디버깅하기 쉬운 구조를 만드는 데 집중합니다.<br/>
AI 를 활용해 **기획부터 출시까지 혼자 빠르게** 만들 수 있고, **UI 디자인과 일러스트 · 앱 에셋도 직접** 만듭니다.

## Tech Stack

- **Frontend**: `React`, `TypeScript`, `Astro`
- **State / Data**: `Nanostore` (Astro), `Redux` (Legacy), `Tanstack Query`
- **Server**: `Node.js` (Astro SSR), `NestJS`
- **Infra / DevOps**: `Docker`, `Kubernetes`, `GitHub Actions`, `k6`
- **Real-time**: Server-Sent Events (SSE)
- **Test**: `Vitest`, `Storybook`, `Playwright`
- **AI**: `Claude Code`, `GitHub Copilot`, `OpenAI API`

## Strength Summary

- 레거시 기술 스택을 **단순 교체가 아닌 유지보수 비용과 구조 안정성 관점에서 개선**합니다.
- 상태·비동기·실시간·배포 흐름을 **하나의 시스템으로 이해하고 설명**할 수 있습니다.
- 단순히 동작하는 코드보다 **안정적으로 운영 가능한 구조**를 만드는 데 집중합니다.

## Projects

### [Kakao Agit](https://www.kakaocorp.com/page/service/service/Agit)

<img width="500" src="/images/agit-image.png" />

- **기간**: 2023.01 ~ 현재
- **개요**: 기업용 협업 서비스. 게시판형 소통으로 특정 주제에 대해 글을 쓰고 댓글을 다는 쓰레드 방식.
- **기술**: `Astro`, `React`, `TypeScript`, `Node.js`, `SCSS`, `pnpm`, `Axios`, `SSE`, `Radix UI`, `Redux`, `Nanostore`, `GitHub Actions`, `Claude Code`
- **내용**
  - **React 현대화**
    - 합류 당시(2023 초)에는 2018년 10월에 나온 **React 16.6 · 클래스 컴포넌트** 기반으로, React 18(2022.03)보다 **메이저 버전 2단계, 4년 이상 뒤처진** 상태
    - hook(16.8) 이전 버전이라 hook 기반 최신 라이브러리를 쓸 수 없고, 작은 수정에도 영향 범위가 커서 **신규 기능 개발이 어려웠음**
    - 클래스 컴포넌트를 함수 컴포넌트로 전면 전환하고 React 18 로 업데이트해 **hook 기반 생태계를 쓸 수 있는 코드베이스로 복구** ([블로그 글 참고](/ko/posts/react/class-to-function))
  - **Astro 전환 (2024.07 ~ 현재, 2인 팀 공동 메인 개발)**
    - `Astro` (SSR) 프레임워크를 도입하여 리팩토링 및 유지보수가 어려운 커다란 리액트 프로젝트를 점진적으로 업데이트가 가능한 Astro 로 전환 ([블로그 글 참고](/ko/posts/FrontEnd/astrojs))
    - Astro 서버에 `Sentry` 에러 수집을 붙여 운영 가능한 Node 서버로 확장
    - 복잡한 상태관리 라이브러리 `Redux`·`RxJS`를 걷어내고 `Nanostore` 로 전환 ([블로그 글 참고 (1)](/ko/posts/react/redux-to-nanostore), [블로그 글 참고 (2)](/ko/posts/react/remove-transformer))
    - 기존 서버 비용이 컸던 `Web Socket`기반 `phoenix`를 `SSE`로 전환 ([블로그 글 참고](/ko/posts/web/sse))
    - `Docker`, `k8s` 를 사용하여 아스트로 서버를 배포하고 운영할 수 있는 환경 구축, 이후 `GitHub Actions` 기반 이미지 빌드로 CI/CD 이관 ([블로그 글 참고](/ko/posts/web/setting-infra))
    - `k6` 를 활용해 부하 테스트를 진행하여 인프라 자원을 효율적으로 할당 ([블로그 글 참고](/ko/posts/FrontEnd/tps-k6))
    - `Claude Code` 서브에이전트·스킬·규칙 문서로 AI 가 팀 규칙대로 일하는 개발 환경 구축 ([블로그 글 참고](/ko/posts/AI/web-astro-ai-setup))
  - **현대화한 기반 위에서 만든 기능**
    - **글 · 댓글 임시저장**: 모든 글쓰기 폼 자동 저장 · 복원, 오프라인에서 돌아오면 실패한 저장 자동 재시도 (`TanStack Query` 도입)
    - **받은 요청 칸반 보드**: 리스트 / 칸반 뷰 전환, 카드 이동 시 서버 응답 전에 화면부터 갱신하는 긍정적 업데이트
    - **휴가 중 접근 알림**: `SSE` 실시간 이벤트로 모달을 띄우고, 여러 탭에서 확인 상태를 동기화
    - **그룹 참여 설정 팝업**: 참여와 동시에 카테고리 · 알림 설정, 카테고리 즉석 생성

## Side Projects

### [Grameow](https://grameow-web.vercel.app)

<div class="screenshots">
  <img loading="lazy" src="/images/grameow/grameow-1.png" alt="Grameow 시작 화면" />
  <img loading="lazy" src="/images/grameow/grameow-2.png" alt="Grameow 홈" />
  <img loading="lazy" src="/images/grameow/grameow-3.png" alt="Grameow 내 레슨" />
  <img loading="lazy" src="/images/grameow/grameow-4.png" alt="Grameow AI 해설" />
  <img loading="lazy" src="/images/grameow/grameow-5.png" alt="Grameow 레슨" />
  <img loading="lazy" src="/images/grameow/grameow-6.png" alt="Grameow 학습 분석" />
  <img loading="lazy" src="/images/grameow/grameow-7.png" alt="Grameow AI 약점 분석" />
  <img loading="lazy" src="/images/grameow/grameow-8.png" alt="Grameow 학습 캘린더" />
</div>

- **기간**: 2026.03 ~ 2026.09
- **개요**: 한국어 사용자를 위한 AI 영어 문법 학습 앱. 레벨 로드맵과 스와이프 레슨 카드로 문법을 배우고, 틀린 문제는 AI 가 해설해 준다. App Store · Google Play 출시, 가입자 1,102명
- **링크**: [App Store](https://apps.apple.com/kr/app/%EA%B7%B8%EB%9E%98%EB%AE%A4/id6761358823) · [Google Play](https://play.google.com/store/apps/details?id=com.grameow.app)
- **기술**: `React Native`, `TanStack Query`, `Zustand`, `NestJS`, `PostgreSQL`, `Astro`, `OpenAI API`, `Claude Code`
- **내용**:
  - 기획 · UI 디자인 · 앱 · API 서버 · 웹(랜딩 · 관리자)을 혼자 맡아 출시까지 운영, 개발은 `Claude Code` 로 AI 와 함께 진행
  - 오답 해설 · 약점 분석을 `gpt-4o-mini` 로 생성하고, 호출 조건과 등급별 한도로 비용 통제
  - 커리큘럼(18챕터 · 192레슨)을 마크다운 · YAML 파일로 관리하고, 다시 넣어도 사용자 진도가 유지되도록 갱신 스크립트 작성
  - 망각곡선 기반 복습 모드, Apple · Google · 카카오 로그인, 관리자 CMS(커리큘럼 편집, DAU · MAU 집계)

### Heymo

<div class="screenshots">
  <img loading="lazy" src="/images/heymo/heymo-1.png" alt="Heymo 스크린샷 1" />
  <img loading="lazy" src="/images/heymo/heymo-2.png" alt="Heymo 스크린샷 2" />
  <img loading="lazy" src="/images/heymo/heymo-3.png" alt="Heymo 스크린샷 3" />
  <img loading="lazy" src="/images/heymo/heymo-4.png" alt="Heymo 스크린샷 4" />
  <img loading="lazy" src="/images/heymo/heymo-5.png" alt="Heymo 스크린샷 5" />
  <img loading="lazy" src="/images/heymo/heymo-6.png" alt="Heymo 스크린샷 6" />
  <img loading="lazy" src="/images/heymo/heymo-7.png" alt="Heymo 스크린샷 7" />
</div>

- **기간**: 2026.05 ~ 2026.06
- **개요**: 커플이 서로의 잠금화면 위젯과 Live Activity 에 "한 마디" 카드를 띄우는 iOS 앱. App Store 출시
- **링크**: [App Store](https://apps.apple.com/kr/app/%ED%95%B4%EB%AA%A8/id6774156936)
- **기술**: `Swift`, `SwiftUI`, `WidgetKit`, `ActivityKit`, `Firebase`, `Cloud Functions`, `Claude Code`
- **내용**:
  - 기획 · UI 디자인 · 개발을 혼자 맡아 출시, 개발은 `Claude Code` 로 AI 와 함께 진행
  - 초대 코드로 커플을 연결하고 `Firestore` 로 양쪽 카드를 실시간 동기화
  - 푸시를 받으면 Notification Service Extension 이 위젯 데이터를 바로 갱신
  - `Cloud Functions` 에서 APNs 를 직접 호출해 잠금화면 Live Activity 를 원격 갱신
  - 사진 + 텍스트 카드, 폰트 · 색 꾸미기, 이모지 리액션

### [DevJeans](https://devjeans.dev-hee.com/)

<img width="500" src="/images/devjeans.png" />

- **기간**: 2023.3 ~ 2023.8
- **개요**: 뉴진스 버니 캐릭터를 자기만의 스타일로 꾸미고 공유할 수 있는 서비스로 최대 DAU 3만 5천을 달성한 토이프로젝트
- **기술**: `Svelte`, `Fabric.js`, `TypeScript`
- **내용**:
  - 캐릭터 · 의상 · 소품 일러스트와 UI 디자인을 직접 그려 제작
  - `Svelte`를 사용하여 빠르게 토이프로젝트 개발
  - `Canvas API` 기반의 `Fabric.js` 라이브러리를 사용하여 캐릭터의 의상 교체와 드로잉 등의 기능을 제공

---

## Core Experience

### 1. Frontend Architecture Modernization

> - [React | 클래스 컴포넌트를 함수 컴포넌트로 마이그레이션하기](/ko/posts/react/class-to-function)
> - [Astro 프레임워크에 대한 고찰](/ko/posts/FrontEnd/astrojs)

- **React v16.6 기반 레거시 프로젝트를 React 18 환경으로 업그레이드**하며 클래스 컴포넌트를 함수 컴포넌트로 전면 마이그레이션
- 다수의 React 의존 라이브러리를 사용하는 환경에서, **React 버전 제약으로 인해 버그 수정이나 라이브러리 스펙 변경 시 코드 수정 비용이 과도하게 증가하는 문제를 인식**
- deprecated API(string ref, legacy context 등)와 구버전 패턴(renderer method 패턴)을 정리하여 **유지보수 가능한 React 생태계로 전환**
- 클래스 컴포넌트의 renderer function 패턴이 함수 컴포넌트에서 유발하는 **불필요한 리렌더링 및 사이드 이펙트 문제를 분석**하고, 렌더러를 독립 컴포넌트로 분리
- React 단일 SPA 구조의 한계를 개선하기 위해 **Astro 기반 아키텍처로 마이그레이션**
  - 페이지 단위로 UI 프레임워크 선택 가능
  - React 의존도 감소 및 장기적인 기술 확장성 확보

### 2. State Management / 구조적 리팩토링

> - [복잡한 Redux에서 벗어나기 2026.01.04](/ko/posts/react/redux-to-nanostore)
> - [Transformer 를 걷어내기까지 2026.10.22](/ko/posts/react/remove-transformer)

- 비동기 로직이 Redux middleware에 집중되어 **어떤 액션이 어떤 상태를 변경하는지 추적하기 어려운 구조를 문제로 인식**
- 대규모 Redux 전역 상태 중 **개별 reducer를 하나씩 Nano Store로 점진적 마이그레이션**
- 비동기 API 호출, 데이터 변환, 상태 업데이트 로직을 분리한 **사이드 이펙트 없는 함수형 구조로 전환**
- API 응답 가공 로직을 reducer에서 제거하고 **transformer 순수 함수로 분리**
  - API 스펙 변경 시 영향 범위 최소화
- 이후 transformer 가 오히려 **상태가 어디서 바뀌는지를 가린다**는 문제를 확인하고 걷어냄
  - 요청 함수 하나에서 요청 → 상태 변경 → 실패 복원이 모두 보이도록 정리
- JavaScript 기반 상태 관리 코드를 **TypeScript + Nano Store 기반 구조로 전환**하여
  - 상태 의존성 명확화
  - 디버깅 난이도 및 유지보수 비용 감소

### 3. Real-time System / SSE Architecture

> [실시간 통신을 위한 SSE 아키텍처 설계: 3계층 구조로 구현한 확장 가능한 시스템](/ko/posts/web/sse)

- 실시간 알림 및 상태 동기화를 위해 **SSE 기반 실시간 통신 시스템을 3계층 구조로 설계**
  - 인프라 레이어: 연결 관리, 재연결, 구독 동기화
  - 이벤트 핸들러 레이어: 이벤트별 독립 Store 및 타입 정의
  - 컴포넌트 레이어: 선언적 구독/해제

### 4. Deployment / Infra / Load Testing

> - [사내 Docker hub와 k8s 기반 오케스트레이션 도구를 사용한 배포 환경 설정기](/ko/posts/web/setting-infra)
> - [ArgoCD Rollout로 Blue/Green 배포하기](/ko/posts/web/argo-blue-green)
> - [k6를 사용한 TPS 테스트](/ko/posts/FrontEnd/tps-k6)

- 사내 Docker Registry와 Kubernetes 기반 오케스트레이션 환경에서 **프론트엔드 서비스 배포 환경 구성**
- Docker 이미지 빌드 → Registry 업로드 → Kubernetes 배포로 이어지는 **자동화된 배포 플로우 구축**
- Astro SSR 서비스 운영을 위해 **k6 기반 부하 테스트 설계 및 수행**
  - 실제 트래픽을 RPS 단위로 환산해 테스트 시나리오 구성
  - 테스트 결과를 바탕으로 **최소 자원으로 안정적인 운영이 가능한 환경 구성**
- 사내 빌드 서비스 폐지에 맞춰 **GitHub Actions 기반 이미지 빌드 · 배포로 CI/CD 이관**
- SSR 서버 요청 로그를 **JSON 구조화 로그**로 바꾸고 사용자 · 브라우저 · IP 정보를 남겨, 에러가 난 요청을 사용자 단위로 추적할 수 있게 함

### 5. AI 개발 환경

> [AI 에이전트가 팀 규칙대로 일하게 만들기](/ko/posts/AI/web-astro-ai-setup)

- `CLAUDE.md` 를 목차로 줄이고 상세 규칙을 문서로 분리, **메인 세션은 조율만 하고 반복 작업은 서브에이전트가 맡는 구조** 설계
- 버그 진단 후 승인받고 수정하는 에이전트, 4개 로케일을 동시에 고치는 다국어 에이전트 등 **역할별 서브에이전트와 스킬** 작성
- 규칙마다 **"왜 생겼는지" 를 날짜와 함께 기록**해 사람과 AI 모두 규칙의 배경을 알 수 있게 함
- 같은 방식을 사이드 프로젝트(Grameow · Heymo)에 옮겨 1인 개발 속도를 냄 — Grameow 는 앱 · 서버 · 웹을 혼자 출시까지 진행


---

## Education

### 한국외국어대학교 (2018년 3월 ~ 2022년 8월)
- 전자공학 학사

## Language

- **영어**: 일상 회화 가능, 꾸준히 학습 중

## Hobby

- **그림 그리기**: 사이드 프로젝트의 UI 디자인도 직접 작업
