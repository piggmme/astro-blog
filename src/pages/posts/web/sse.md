---
title: '실시간 통신을 위한 SSE 아키텍처 설계: 3계층 구조로 구현한 확장 가능한 시스템'
layout: ../_MarkdownPostLayout.astro
pubDate: 2026-1-4
description: '실시간 통신을 위한 SSE 아키텍처 설계: 3계층 구조로 구현한 확장 가능한 시스템'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["Web"]

---

# 실시간 통신을 위한 SSE 아키텍처 설계: 3계층 구조로 구현한 확장 가능한 시스템

## 들어가며

현대 웹 애플리케이션에서 실시간 데이터 동기화는 필수적인 기능입니다. 사용자에게 즉각적인 피드백을 제공하고, 여러 클라이언트 간 상태를 동기화하기 위해 Server-Sent Events(SSE)를 활용한 아키텍처를 설계했습니다. 이 글에서는 확장 가능하고 유지보수하기 쉬운 SSE 시스템의 구조와 설계 철학을 공유합니다.

## 배경: 왜 SSE를 선택했나?

SSE는 WebSocket과 달리 서버에서 클라이언트로의 단방향 통신에 최적화되어 있습니다. 우리 프로젝트에서는 다음과 같은 요구사항이 있었습니다:

- **다양한 이벤트 타입**: 알림, 댓글, 리액션, 게시글 업데이트 등 10개 이상의 이벤트 타입
- **동적 구독 관리**: 페이지/컴포넌트별로 필요한 이벤트만 선택적으로 구독
- **자동 재연결**: 네트워크 불안정 상황에서도 안정적인 연결 유지
- **타입 안정성**: TypeScript 기반의 타입 안전한 이벤트 처리

이러한 요구사항을 만족하기 위해 **3계층 아키텍처**를 설계했습니다.

## 전체 아키텍처 개요

```
┌─────────────────────────────────────────┐
│   컴포넌트 레이어                           │
│   - 페이지/컴포넌트별 구독 컴포넌트             │
│   - 선언적 구독 관리                        │
└─────────────────────────────────────────┘
              ↓ 구독 요청
┌─────────────────────────────────────────┐
│   이벤트 핸들러 레이어                       │
│   - 이벤트별 독립적인 Store                  │
│   - 타입 정의 및 처리 로직                   │
│   - 연결 상태 기반 자동 등록                  │
└─────────────────────────────────────────┘
              ↓ 이벤트 수신
┌─────────────────────────────────────────┐
│   핵심 인프라 레이어                         │
│   - 연결 관리 (재연결, 생명주기)              │
│   - 연결 상태 관리                          │
│   - 구독 관리 및 자동 동기화                  │
└─────────────────────────────────────────┘
```

각 레이어는 명확한 책임을 가지며, 상위 레이어는 하위 레이어의 구현 세부사항을 알 필요가 없습니다.

## 레이어 1: 핵심 인프라 레이어

### SSE 연결 관리자: 재사용 가능한 연결 생명주기 관리

가장 하위 레이어는 SSE 연결의 생명주기를 관리하는 유틸리티입니다. 팩토리 함수 패턴을 사용하여 재사용 가능한 연결 관리자를 생성합니다.
```ts
import { casetify } from './casetify'

const MAX_RECONNECT_ATTEMPTS = 5

// 커스텀 이벤트 타입 정의
export interface SseReconnectEvent extends CustomEvent {
  detail: {
    name: string
    url: string
    reconnectAttempts: number
  }
}

type SseManagerState = {
  eventSource: EventSource | null
  addEventListener: (event: string, handler: (result: any) => void) => void
}

type SseManagerOptions = {
  name: string
  url: string
  onOpen?: (params: SseManagerState & { isReconnect: boolean }) => void
  onError?: (params: SseManagerState & { error: Event }) => void
  onDisconnect?: (params: SseManagerState) => void
}

export const SSE_RECONNECT_EVENT = 'sse-reconnect'

// 전역 이벤트 타입 선언
declare global {
  interface DocumentEventMap {
    'sse-reconnect': SseReconnectEvent
  }
}

export default function createSseManager (options: SseManagerOptions) {
  let _eventSource: EventSource | null = null
  let _reconnectTimer: number | null = null
  let _reconnectAttempts: number = 0
  let _isDisconnected: boolean = false
  const _registeredEvents = new Set<string>()
  let isReconnect: boolean = false

  const dispatchSseReconnectEvent = () => {
    const sseReconnectEvent = new CustomEvent(SSE_RECONNECT_EVENT, {
      detail: {
        name: options.name,
        url: options.url,
        reconnectAttempts: _reconnectAttempts,
      },
    }) as SseReconnectEvent
    document.dispatchEvent(sseReconnectEvent)
  }

  const connect = () => {
    if (_eventSource || _isDisconnected) return

    const eventSource = new EventSource(options.url, { withCredentials: true } as any)
    _eventSource = eventSource

    eventSource.onopen = () => {
      options.onOpen?.({ eventSource, addEventListener, isReconnect })
      if (isReconnect) dispatchSseReconnectEvent()
      _reconnectAttempts = 0
      isReconnect = false
    }

    eventSource.onerror = (error) => {
      options.onError?.({ eventSource, addEventListener, error })
      eventSource.close()

      if (_reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !_isDisconnected) {
        isReconnect = true
        scheduleReconnect()
      }
    }
  }

  const scheduleReconnect = () => {
    if (_reconnectTimer || _isDisconnected) return

    _reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, _reconnectAttempts), 30000) // 지수적 백오프

    _reconnectTimer = window.setTimeout(() => {
      _reconnectTimer = null
      if (!_isDisconnected) {
        disconnect()
        connect()
      }
    }, delay)
  }

  const addEventListener = <T>(event: string, handler: (result: T) => void) => {
    // 이미 등록된 이벤트인지 확인
    if (_registeredEvents.has(event)) {
      // console.warn(`SSE 이벤트 리스너가 이미 등록되어 있습니다: ${event}`)
      return
    }

    // console.info(`SSE 이벤트 리스너 등록: ${event}`)
    _registeredEvents.add(event)
    _eventSource?.addEventListener(event, (event: MessageEvent) => {
      if (!event?.data) return
      const data = casetify(JSON.parse(event.data))
      handler(data)
    })
  }

  const disconnect = () => {
    if (_reconnectTimer) {
      clearTimeout(_reconnectTimer)
      _reconnectTimer = null
    }

    if (_eventSource) {
      _eventSource.close()
      _eventSource = null
    }

    _reconnectAttempts = 0
    _registeredEvents.clear() // 등록된 이벤트 목록 초기화
    options.onDisconnect?.({ eventSource: null, addEventListener })
  }

  const sseMananager = {
    connect,
    disconnect: () => {
      _isDisconnected = true
      disconnect()
    },
    addEventListener,
  }

  return sseMananager
}
```

**주요 특징:**

1. **지수적 백오프 재연결**: 네트워크 오류 시 점진적으로 재연결 시도 간격을 늘려 서버 부하를 최소화합니다.
2. **이벤트 리스너 중복 방지**: `Set`을 사용하여 동일한 이벤트 리스너가 중복 등록되는 것을 방지합니다.
3. **수동/자동 연결 구분**: `_isDisconnected` 플래그로 사용자가 명시적으로 연결을 끊은 경우와 네트워크 오류를 구분합니다.

### SSE 클라이언트 인스턴스: 싱글톤 패턴

연결 관리자를 사용하여 애플리케이션 전역에서 사용할 단일 SSE 클라이언트를 생성합니다.

```typescript
import { $connection, connectionActions } from './connection'

const sseClient = createSseManager({
  name: 'app-sse-client',
  url: '/api/sse',

  onOpen: ({ addEventListener }) => {
    addEventListener('connected', (connection: ConnectionInfo) => {
      connectionActions.update({
        connected: true,
        sessionId: connection.sessionId,
      })
    })
  },

  onError: () => {
    connectionActions.update({ connected: false, error: '연결 오류' })
  },

  onDisconnect: () => {
    connectionActions.update({ connected: false })
  },
})
```

**싱글톤 패턴**: 애플리케이션 전체에서 하나의 SSE 연결만 유지하여 리소스를 효율적으로 사용합니다.

### 연결 상태 관리: Nanostores를 활용한 반응형 상태 관리

Nanostores의 `map`을 사용하여 연결 상태를 반응형으로 관리합니다.

```typescript
import { map } from 'nanostores'

interface ConnectionState {
  connected?: boolean
  sessionId?: string
  lastEventId?: string
  error?: string
}

export const $connection = map<ConnectionState>({
  connected: false,
})

export const connectionActions = {
  update: (connection: ConnectionState) => {
    Object.entries(connection).forEach(([key, value]) => {
      $connection.setKey(key as keyof ConnectionState, value)
    })
  },
}
```

**반응형 상태**: Nanostores의 `map`을 사용하면 연결 상태가 변경되면 이를 구독하는 모든 컴포넌트가 자동으로 업데이트됩니다.

### 구독 관리: 동적 구독 및 자동 동기화

구독 정보를 관리하고, 연결 상태와 구독 정보가 모두 준비되면 서버에 자동으로 동기화합니다.

```typescript
import { map } from 'nanostores'

export const $subscriptions = map<SubscriptionState>({})

const subscribeEvents = (event: SubscriptionEvent) => {
  const events = typeof event === 'string'
    ? { ...$subscriptions.get(), [event]: true }
    : { ...$subscriptions.get(), ...event }
  $subscriptions.set(events)
}

// 연결 상태와 구독 정보 변화를 감지하여 자동 동기화
const syncSubscriptions = () => {
  const connection = $connection.get()
  const subscriptions = $subscriptions.get()

  if (connection.connected && connection.sessionId && Object.keys(subscriptions).length > 0) {
    // 디바운싱: 1초 내 여러 구독 요청이 있어도 마지막 요청만 실행
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      if (connection.sessionId) {
        syncWithServer(connection.sessionId, subscriptions)
      }
      debounceTimer = null
    }, DEBOUNCE_DELAY)
  }
}

// 연결 상태 변화 감지
$connection.listen(syncSubscriptions)
// 구독 정보 변화 감지
$subscriptions.listen(syncSubscriptions)
```

**핵심 아이디어:**

1. **디바운싱**: 여러 컴포넌트가 동시에 구독을 요청해도 일정 시간 내 마지막 요청만 서버에 전송하여 불필요한 API 호출을 줄입니다.
2. **자동 동기화**: 연결이 끊겼다가 다시 연결되면, 현재 구독 정보를 자동으로 서버에 동기화합니다.
3. **반응형 구독**: Nanostores의 `listen` 메서드를 사용하여 상태 변화를 자동으로 감지합니다.

## 레이어 2: 이벤트 핸들러 레이어

각 SSE 이벤트는 독립적인 파일로 관리되며, 일관된 패턴을 따릅니다.

### 이벤트 Store 패턴

각 이벤트는 독립적인 파일로 관리되며, 일관된 패턴을 따릅니다.

```typescript
// events/exampleEvent.ts
import { atom, onMount } from 'nanostores'
import { $connection } from '../connection'
import sseClient from '../client'

export type ExampleEvent = {
  type: 'example_event'
  id: number
  data: string
}

export const $exampleEvent = atom<ExampleEvent | null>(null)

export const resetExampleEvent = () => {
  $exampleEvent.set(null)
}

// Store가 마운트될 때 연결 상태를 감시하고 이벤트 리스너 등록
onMount($exampleEvent, () => {
  const unsubscribe = $connection.subscribe((connection) => {
    if (!connection.connected) {
      $exampleEvent.set(null)
      return
    }
    // 연결이 되면 이벤트 리스너 등록
    sseClient.addEventListener('example_event', (data: ExampleEvent) => {
      $exampleEvent.set(data)
    })
  })
  return unsubscribe
})
```

**패턴의 장점:**

1. **독립성**: 각 이벤트가 독립적으로 관리되어 서로 영향을 주지 않습니다.
2. **타입 안정성**: 각 이벤트마다 명확한 타입이 정의되어 있습니다.
3. **자동 정리**: `onMount`를 사용하여 store가 더 이상 사용되지 않으면 자동으로 정리됩니다.
4. **연결 상태 감지**: 연결이 끊기면 이벤트 데이터를 초기화하여 오래된 데이터가 표시되지 않도록 합니다.

## 레이어 3: 컴포넌트 레이어

### Null 컴포넌트 패턴: 선언적 구독 관리

컴포넌트 레이어에서는 페이지나 컴포넌트별로 필요한 이벤트를 구독하는 Null 컴포넌트를 사용합니다. 이 컴포넌트는 아무것도 렌더링하지 않고 구독만 관리합니다.

```typescript
// components/EventSubscriber.tsx
export default function EventSubscriber(
  { resourceId }: { resourceId: number }
) {
  useEffect(() => {
    if (!resourceId) return
    subscriptionActions.subscribe({ resourceId })
    return () => {
      subscriptionActions.unsubscribe('resourceId')
    }
  }, [resourceId])
  return null
}
```

**사용 예시:**

```typescript
// 리소스 상세 페이지
function ResourceDetail({ resourceId }: { resourceId: number }) {
  return (
    <>
      <EventSubscriber resourceId={resourceId} />
      {/* 리소스 상세 UI */}
    </>
  )
}
```

**장점:**

1. **선언적 구독**: 컴포넌트를 렌더링하기만 하면 자동으로 구독됩니다.
2. **자동 정리**: 컴포넌트가 언마운트되면 자동으로 구독이 해제됩니다.
3. **조건부 구독**: `resourceId`가 변경되면 자동으로 새로운 구독으로 전환됩니다.
4. **관심사 분리**: UI 로직과 구독 로직이 명확히 분리됩니다.

### 전역 연결 관리: 초기화 훅

애플리케이션 루트에서 SSE 연결을 초기화합니다.

```typescript
// hooks/useSseConnection.ts
export function useSseConnection() {
  useEffect(() => {
    sseClient.connect()
    return () => {
      sseClient.disconnect()
    }
  }, [])
}
```

```typescript
// App.tsx 또는 RootLayout
function App() {
  useSseConnection() // 전역 SSE 연결 초기화
  
  return (
    // ...
  )
}
```

이렇게 하면 애플리케이션이 시작될 때 SSE 연결이 자동으로 초기화되고, 애플리케이션이 종료될 때 자동으로 정리됩니다.

## 실제 사용 시나리오

### 시나리오: 상세 페이지

상세 페이지에서는 특정 리소스와 관련된 이벤트만 구독합니다.

#### ResourceSubscriber 컴포넌트 구현

```typescript
// components/ResourceSubscriber.tsx
import { useEffect } from 'react'
import { sseSubscriptionsActions } from '../nanostores/sse'

export default function ResourceSubscriber(
  { resourceId }: { resourceId: number }
) {
  useEffect(() => {
    if (!resourceId) return
    
    // 구독 요청: 서버에 이 resourceId에 대한 이벤트를 구독하도록 요청
    sseSubscriptionsActions.subscribe({ resourceId })
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      sseSubscriptionsActions.unsubscribe('resourceId')
    }
  }, [resourceId])
  
  // Null 컴포넌트: 아무것도 렌더링하지 않고 구독만 관리
  return null
}
```

#### $resourceUpdate Store 정의

```typescript
// nanostores/sse/events/resourceUpdate.ts
import { atom, onMount } from 'nanostores'
import { $sseConnection } from '../sseConnection'
import sseManager from '../sseClient'

export type ResourceUpdate = {
  type: 'resource_update'
  resourceId: number
  groupId?: number
  userId?: number
  updatedAt: number
}

// 이벤트 데이터를 저장할 atom 생성
export const $resourceUpdate = atom<ResourceUpdate | null>(null)

// Store 초기화 함수
export const resetResourceUpdate = () => {
  $resourceUpdate.set(null)
}

// Store가 마운트될 때 (첫 사용 시) 실행
onMount($resourceUpdate, () => {
  // SSE 연결 상태를 구독
  const unsubscribe = $sseConnection.subscribe((connection) => {
    // 연결이 끊어지면 데이터 초기화
    if (!connection.connected) {
      $resourceUpdate.set(null)
      return
    }
    
    // 연결이 되면 SSE 이벤트 리스너 등록
    // 서버에서 'resource_update' 이벤트가 오면 자동으로 $resourceUpdate에 저장됨
    sseManager.addEventListener('resource_update', (data: ResourceUpdate) => {
      $resourceUpdate.set(data)
    })
  })
  
  // 정리 함수 반환
  return unsubscribe
})
```

#### 전체 흐름: 상세 페이지에서의 사용

```typescript
// pages/DetailPage.tsx
import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import ResourceSubscriber from '../components/ResourceSubscriber'
import { $resourceUpdate, resetResourceUpdate } from '../nanostores/sse'

function DetailPage({ resourceId }: { resourceId: number }) {
  return (
    <>
      {/* 1. 구독 컴포넌트: 이 resourceId에 대한 이벤트 구독 시작 */}
      <ResourceSubscriber resourceId={resourceId} />

      {/* 2. SSE 상태 UI 적용: $resourceUpdate의 변화를 감지하여 UI 업데이트 */}
      <DetailContents resourceId={resourceId} />
    </>
  )
}

function DetailContents({ resourceId }: { resourceId: number }) {
  // Nanostores의 useStore 훅으로 $resourceUpdate 상태 사용
  const update = useStore($resourceUpdate)

  return (
    <div>{update.data}</div>
  )
}
```

#### 데이터 흐름 상세 설명

1. **구독 시작**: `ResourceSubscriber`가 마운트되면 `sseSubscriptionsActions.subscribe({ resourceId })` 호출
   ```typescript
   // $sseSubscriptions가 업데이트됨
   $sseSubscriptions.set({ resourceId: 123 })
   ```

2. **자동 동기화**: `sseSubscriptions.ts`의 `syncSubscriptions` 함수가 실행되어 서버에 구독 요청
   ```typescript
   // 1초 디바운싱 후 서버에 PUT 요청
   PUT /api/v3/sse/session/{sessionId}/option
   Body: { resource_id: 123 }
   ```

3. **이벤트 수신**: 서버에서 `resource_update` 이벤트가 오면 `sseManager.addEventListener`의 콜백 실행
   ```typescript
   // events/resourceUpdate.ts의 onMount에서 등록한 리스너가 실행
   sseManager.addEventListener('resource_update', (data) => {
     $resourceUpdate.set(data) // ← 여기서 Store 업데이트!
   })
   ```

4. **UI 반응**: `$resourceUpdate`가 업데이트되면 `useStore($resourceUpdate)`를 사용하는 컴포넌트가 자동으로 리렌더링
   ```typescript
   // ResourceUpdateHandler 컴포넌트가 자동으로 리렌더링됨
   const update = useStore($resourceUpdate) // ← 값이 변경되면 자동 업데이트
   ```

5. **구독 해제**: `ResourceSubscriber`가 언마운트되면 자동으로 구독 해제
   ```typescript
   // cleanup 함수 실행
   sseSubscriptionsActions.unsubscribe('resourceId')
   ```

이러한 패턴을 통해 각 페이지는 필요한 이벤트만 구독하고, 페이지를 벗어나면 자동으로 구독이 해제됩니다. 또한 SSE 이벤트가 서버에서 오면 자동으로 해당 Store가 업데이트되고, 이를 구독하는 컴포넌트가 자동으로 리렌더링됩니다.

## 아키텍처의 주요 장점

### 1. 관심사 분리 (Separation of Concerns)

각 레이어가 명확한 책임을 가지며, 상위 레이어는 하위 레이어의 구현 세부사항을 알 필요가 없습니다.

- **인프라 레이어**: 연결 관리, 재연결, 구독 동기화
- **이벤트 레이어**: 각 이벤트의 타입 정의 및 처리 로직
- **컴포넌트 레이어**: UI와의 통합

### 2. 확장성 (Scalability)

새로운 이벤트 타입을 추가하는 것이 매우 간단합니다:

1. 이벤트 디렉토리에 새 파일 생성
2. 타입 정의 및 Store 생성
3. Store 마운트 시 이벤트 리스너 등록
4. 필요시 구독 컴포넌트 생성

기존 코드를 수정할 필요가 없으며, 개방-폐쇄 원칙(OCP)을 따릅니다.

### 3. 타입 안정성 (Type Safety)

모든 이벤트가 TypeScript로 타입이 정의되어 있어, 컴파일 타임에 오류를 발견할 수 있습니다.

### 4. 성능 최적화

- **디바운싱**: 구독 요청을 1초 동안 모아서 한 번에 전송
- **이벤트 리스너 중복 방지**: 동일한 이벤트 리스너가 여러 번 등록되는 것을 방지
- **조건부 구독**: 필요한 이벤트만 구독하여 불필요한 네트워크 트래픽 감소

### 5. 자동 복구 (Auto Recovery)

- **자동 재연결**: 네트워크 오류 시 지수적 백오프로 자동 재연결
- **구독 자동 동기화**: 재연결 후 현재 구독 정보를 자동으로 서버에 동기화

### 6. 반응형 상태 관리

Nanostores를 사용하여 상태를 관리하므로, React, Vue, Svelte 등 어떤 프레임워크에서도 사용할 수 있습니다. Nanostores는 프레임워크에 독립적인 상태 관리 라이브러리로, 각 프레임워크별 어댑터(`@nanostores/react`, `@nanostores/vue` 등)를 통해 통합할 수 있습니다.

## 설계 원칙

이 아키텍처는 다음과 같은 설계 원칙을 따릅니다:

1. **단일 책임 원칙 (SRP)**: 각 모듈은 하나의 책임만 가집니다.
2. **개방-폐쇄 원칙 (OCP)**: 확장에는 열려있고 수정에는 닫혀있습니다.
3. **의존성 역전 원칙 (DIP)**: 상위 레이어가 하위 레이어의 구체적인 구현에 의존하지 않습니다.
4. **관심사 분리**: 연결 관리, 이벤트 처리, UI 통합이 명확히 분리되어 있습니다.

## 결론

3계층 구조로 설계한 SSE 아키텍처는 다음과 같은 이점을 제공합니다:

- ✅ **확장성**: 새로운 이벤트 타입 추가가 간단함
- ✅ **유지보수성**: 각 레이어가 독립적으로 관리됨
- ✅ **안정성**: 자동 재연결 및 구독 동기화
- ✅ **성능**: 디바운싱 및 조건부 구독으로 최적화
- ✅ **타입 안정성**: TypeScript로 완전한 타입 지원
- ✅ **프레임워크 독립성**: Nanostores를 사용하여 프레임워크에 독립적으로 동작

이 아키텍처는 실시간 통신이 필요한 다양한 웹 애플리케이션에 적용할 수 있으며, 특히 이벤트 타입이 많고 동적으로 구독을 관리해야 하는 경우에 효과적입니다.

## 마무리

이 글에서는 3계층 구조로 설계한 SSE 아키텍처의 핵심 아이디어를 공유했습니다. 구체적인 구현 세부사항보다는 아키텍처 패턴과 설계 원칙에 집중하여, 다양한 프로젝트에 적용할 수 있는 일반적인 구조를 제시했습니다.

실제 프로젝트에 적용할 때는 다음과 같은 사항을 고려해보세요:

- **Nanostores 활용**: `map`, `atom`, `computed`, `onMount` 등의 Nanostores API를 적절히 활용하세요
- **재연결 전략 조정**: 네트워크 환경에 맞게 재연결 시도 횟수와 백오프 전략을 조정하세요
- **디바운싱 시간 조정**: 구독 요청 빈도에 맞게 디바운싱 시간을 조정하세요
- **에러 처리 강화**: 재연결 실패 시 사용자에게 알림을 제공하는 등의 에러 처리를 추가하세요
- **프레임워크 통합**: React를 사용한다면 `@nanostores/react`의 `useStore` 훅을 활용하세요

## 참고 자료

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Nanostores 공식 문서](https://github.com/nanostores/nanostores)
- [Design Patterns: Factory Pattern](https://refactoring.guru/design-patterns/factory-method)

