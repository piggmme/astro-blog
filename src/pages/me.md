---
layout: ./posts/_MarkdownPostLayout.astro
title: 'About Me'
---

# DevHee

## About Me

레거시 React 기반 프론트엔드 서비스를 **React 18 · Astro · TypeScript 중심으로 현대화**하고,
상태 관리·실시간 통신·배포/운영 환경까지 고려해 **확장 가능하고 디버깅이 쉬운 구조**로 개선해 온 프론트엔드 엔지니어입니다.
UI 구현을 넘어 **유지보수 비용, 운영 안정성, 장기적인 기술 확장성**을 중요하게 생각합니다.

## Core Experience

### 1. Frontend Architecture Modernization

* **React v16.6 기반 레거시 프로젝트를 React 18 환경으로 업그레이드**하며 클래스 컴포넌트를 함수 컴포넌트로 전면 마이그레이션
* 다수의 React 의존 라이브러리를 사용하는 환경에서, **React 버전 제약으로 인해 버그 수정이나 라이브러리 스펙 변경 시 코드 수정 비용이 과도하게 증가하는 문제를 인식**
* deprecated API(string ref, legacy context 등)와 구버전 패턴(renderer method 패턴)을 정리하여 **유지보수 가능한 React 생태계로 전환**
* 클래스 컴포넌트의 renderer function 패턴이 함수 컴포넌트에서 유발하는 **불필요한 리렌더링 및 사이드 이펙트 문제를 분석**하고, 렌더러를 독립 컴포넌트로 분리
* React 단일 SPA 구조의 한계를 개선하기 위해 **Astro 기반 아키텍처로 마이그레이션**

  * 페이지 단위로 UI 프레임워크 선택 가능
  * React 의존도 감소 및 장기적인 기술 확장성 확보
* client-only 분리를 통해 **레거시 React 코드와 SSR 환경이 안정적으로 공존**하도록 구조 정리

### 2. State Management / 구조적 리팩토링

* 비동기 로직이 Redux middleware에 집중되어 **어떤 액션이 어떤 상태를 변경하는지 추적하기 어려운 구조를 문제로 인식**
* 대규모 Redux 전역 상태 중 **개별 reducer를 하나씩 Nano Store로 점진적 마이그레이션**
* 비동기 API 호출, 데이터 변환, 상태 업데이트 로직을 분리한 **사이드 이펙트 없는 함수형 구조로 전환**
* API 응답 가공 로직을 reducer에서 제거하고 **transformer 순수 함수로 분리**

  * API 스펙 변경 시 영향 범위 최소화
  * 테스트 및 재사용성 향상
* JavaScript 기반 상태 관리 코드를 **TypeScript + Nano Store 기반 구조로 전환**하여

  * 상태 의존성 명확화
  * 디버깅 난이도 및 유지보수 비용 감소

### 3. Real-time System / SSE Architecture

* 실시간 알림 및 상태 동기화를 위해 **SSE 기반 실시간 통신 시스템을 3계층 구조로 설계**

  * 인프라 레이어: 연결 관리, 재연결, 구독 동기화
  * 이벤트 핸들러 레이어: 이벤트별 독립 Store 및 타입 정의
  * 컴포넌트 레이어: 선언적 구독/해제
* 지수적 백오프 기반 자동 재연결, 이벤트 리스너 중복 방지, 수동/자동 disconnect 구분 등 **연결 생명주기 안정화**
* Nanostores 기반 동적 구독 관리 및 **연결 상태 변화에 따른 구독 자동 동기화 + 디바운싱 적용**
* 다수 이벤트 타입을 **TypeScript 타입 안정성 하에 확장 가능하도록 설계**
* Null 컴포넌트 패턴을 활용해 UI와 구독 로직을 분리하고, 페이지 단위로 필요한 이벤트만 구독하도록 구성

### 4. Deployment / Infra / Load Testing

* 사내 Docker Registry와 Kubernetes 기반 오케스트레이션 환경에서 **프론트엔드 서비스 배포 환경 구성**
* Docker 이미지 빌드 → Registry 업로드 → Kubernetes 배포로 이어지는 **자동화된 배포 플로우 구축**
* Deployment / Service / Ingress / VIP 설정을 통해 **외부 트래픽 → 서비스 → 파드 접근 경로 설계**
* Astro SSR 서비스 운영을 위해 **k6 기반 부하 테스트 설계 및 수행**
  * 실제 트래픽을 RPS 단위로 환산해 테스트 시나리오 구성
* 테스트 결과를 바탕으로 **최소 자원으로 안정적인 운영이 가능한 환경 구성**

## Tech Stack

* **Frontend**: React, TypeScript, Astro
* **State / Data**: Nano Stores, Redux (Legacy)
* **Infra / DevOps**: Docker, Kubernetes, k6
* **Real-time**: Server-Sent Events (SSE)
* **Others**: Architecture Refactoring, Load Testing

## Technical Writing

* React 클래스 컴포넌트 → 함수 컴포넌트 마이그레이션 경험 정리
* 사내 Docker + Kubernetes 기반 배포 환경 구축기
* k6 기반 부하 테스트 및 자원 산정 과정 정리
* SSE 3계층 아키텍처 설계 및 실시간 시스템 구조 정리

## Strength Summary

* 레거시 기술 스택을 **단순 교체가 아닌 유지보수 비용과 구조 안정성 관점에서 개선**
* 상태·비동기·실시간·배포 흐름을 **하나의 시스템으로 이해하고 설명 가능**
* 단순히 “동작하는 코드”보다 안정적으로 **운영 가능한 구조**를 만드는 데 집중

