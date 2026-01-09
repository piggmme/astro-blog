---
title: '복잡한 Redux에서 벗어나기'
layout: ../_MarkdownPostLayout.astro
pubDate: 2026-1-4
description: '복잡한 Redux에서 벗어나기'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["React"]

---
# Redux에서 벗어나기

## Redux → axios + transformer + Nanostores로 점진적 마이그레이션한 이유와 전체 과정

프론트엔드 개발을 하다 보면 Redux는 점점 **상태 관리 라이브러리**가 아니라
**비동기 처리, 데이터 가공, 비즈니스 로직까지 모두 몰아넣는 장소**가 되는 순간이 옵니다.

저 역시 그런 프로젝트를 경험했습니다.

이 글은 실제 레거시 프로젝트에서
**Redux 중심 구조를 axios + transformer + Nanostores 구조로 점진적으로 전환한 경험**을 정리한 기록입니다.

## 💣 기존 Redux 구조의 전체 그림

### 전형적인 Redux + Thunk 구조

#### Action (Thunk)

```ts
// actions/messages.ts
export const fetchMessages = () => async (dispatch) => {
  dispatch({ type: 'FETCH_MESSAGES_REQUEST' })

  try {
    const response = await axios.get('/api/messages')

    dispatch({
      type: 'FETCH_MESSAGES_SUCCESS',
      payload: response.data,
    })
  } catch (error) {
    dispatch({
      type: 'FETCH_MESSAGES_FAILURE',
      error,
    })
  }
}
```

이 코드만 보면 “나쁘지 않아 보이는” 구조입니다.
하지만 실제 문제는 **reducer에서 발생**했습니다.

### 전형적인 Redux Reducer (문제의 핵심)

```ts
// reducers/messages.ts
const initialState = {
  list: [],
  loading: false,
  error: null,
  currentUserId: 10,
}

export default function messagesReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_MESSAGES_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      }

    case 'FETCH_MESSAGES_SUCCESS': {
      const rawMessages = action.payload.messages

      // ❗ reducer 안에서 로직 가공 시작
      const parsedMessages = rawMessages
        .filter((m) => m.is_deleted !== true)
        .map((m) => ({
          id: m.id,
          text: m.content,
          authorId: m.user_id,
          createdAt: new Date(m.created_at),
          isMine: m.user_id === state.currentUserId,
        }))
        .sort((a, b) => b.createdAt - a.createdAt)

      return {
        ...state,
        list: parsedMessages,
        loading: false,
      }
    }

    case 'FETCH_MESSAGES_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.error,
      }

    default:
      return state
  }
}
```

## 이 reducer가 실제로 하고 있던 일들

이 reducer는 단순히 “상태를 업데이트”하고 있지 않았습니다.

### reducer에서 처리되고있는 것들

1. **API 스펙 의존**
   * `content`, `user_id`, `created_at`, `is_deleted` 등 서버 필드 구조를 직접 알고 있음
2. **데이터 필터링**
3. **데이터 변환**
4. **비즈니스 규칙 처리**

   * `isMine` 계산
5. **정렬 로직**
6. **상태 업데이트**

즉, reducer 하나가 **너무 많은 맥락과 책임**을 가지고 있었습니다.

## 이 구조가 실제로 만든 문제들

### 1. 디버깅 난이도 폭증

UI에서 메시지 순서가 이상하면:

* API 문제인지
* reducer의 정렬 로직 문제인지
* 날짜 파싱 문제인지
  한 번에 판단하기 어려웠습니다.

### 2. API 스펙 변경에 취약

서버에서 `created_at → createdAt`으로 변경되면
런타임 에러가 reducer에서 바로 발생했습니다.

### 3. 테스트가 사실상 불가능

reducer 테스트 하나에

- API payload mocking
- state 구성
- 날짜/정렬/비즈니스 규칙 검증

이 모두가 필요했습니다.

## 🔎 복잡한 Reducer 를 분해하자 

문제의 원인 **Redux의 Reducer가 너무 많은 역할을 맡고 있던 구조**였습니다.

따라서 이 문제를 해결하기 위해서 다음과 같은 원칙을 세웠습니다.

### 핵심 설계 원칙

1. API 호출은 **API 레이어에서만**
2. 데이터 가공/비즈니스 로직은 **transformer(순수 함수)에서만**
3. 상태 관리는 **store에서만**
4. 이들을 연결하는 역할은 **UI 에서만**

즉,

> Redux 하나가 하던 일을 `axios + transformer + store` 로 나누어 처리합니다.

## 새 구조의 전체 아키텍처

```
┌─────────────┐
│     UI      │  ← 흐름을 조합하여 데이터 사용
└─────┬───────┘
      │
┌─────▼───────┐
│   API       │  ← axios
└─────┬───────┘
      │
┌─────▼───────┐
│ Transformer │  ← Pure Function
└─────┬───────┘
      │
┌─────▼───────┐
│   Store     │  ← Nanostores
└─────────────┘
```

### 1. API

```ts
// api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 5000,
})
```

```ts
// api/messages.ts
import { apiClient } from './client'

export async function fetchMessages() {
  const res = await apiClient.get('/messages')
  return res.data
}
```
여기서는 데이터를 절대 가공하지 않습니다.

### Transformer: reducer에서 떼어낸 로직 가공

```ts
// transformer/messages.ts
export type ApiMessage = {
  id: number
  content: string
  user_id: number
  created_at: number
  is_deleted: boolean
}

export type Message = {
  id: number
  text: string
  authorId: number
  createdAt: number
  isMine: boolean
}

export function transformerFetchMessages(
  response: { messages: ApiMessage[] },
  currentUserId: number
): Message[] {
  return response.messages
    .filter((m) => m.is_deleted !== true)
    .map((m) => ({
      id: m.id,
      text: m.content,
      authorId: m.user_id,
      createdAt: m.created_at,
      isMine: m.user_id === currentUserId,
    }))
    .sort((a, b) => b.createdAt - a.createdAt)
}
```

Transformer의 특징은 다음과 같습니다.

- **순수 함수**
- side effect 없음
- 테스트 용이
- API 스펙 변경 시 수정 지점 명확

### Store: Nanostores로 상태를 작게 쪼개기

```ts
// stores/messages.ts
import { atom } from 'nanostores'
import type { Message } from '../transformer/messages'

export const $messages = atom<Message[]>([])
```

Store는 단순한 구조로 오직 상태 관리만 수행합니다.

- 비동기 없음
- 로직 없음
- 상태만 관리

### UI: API + Transformer + Store 조합

```tsx
import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $messages } from '../stores/messages'

export function MessageList() {
  const messages = useStore($messages)

  useEffect(() => {
    const response = await fetchMessages()
    const userId = $currentUserId.get()

    const transformedMessages = transformerFetchMessages(
      response,
      userId
    )

    $messages.set(transformedMessages)
  }, [])

  return (
    <ul>
      {messages.map((m) => (
        <li key={m.id}>
          {m.text}
        </li>
      ))}
    </ul>
  )
}
```

UI에서는 `API`, `Transformer`, `Store` 를 직접 조합하여 데이터를 어디서 가져오고, 어디서 가공하고, 어디서 사용하는지 한 눈에 흐름을 파악할 수 있습니다. 이러한 구조 덕분에 어떠한 문제가 생긴다면 디버깅하기가 매우 편리합니다.

## 점진적 마이그레이션 전략

해당 프로젝트에서 Redux의 규모가 너무 컸기 때문에 Redux를 한 번에 제거할 수 없었습니다.
다음과 같이 reducer 하나씩 점진적으로 마이그레이션하기로 결정하였습니다.

### 적용 순서

1. reducer 하나 선택
2. 해당 reducer의 책임 분석
3. 동일 기능을 신규 구조로 구현
4. UI를 신규 store로 연결
5. 기존 Redux 코드 제거

Redux와 Nanostores가 **공존 가능한 상태**를 유지하며 전환했습니다.

## 결론

대규모 Redux 에서 상태가 어디서 변화하고 문제가 생겼던 건지 확인하기가 매우 어려웠지만, 
본 글에서 설명한 구조로 개선하면서 디버깅 난이도를 낮추고 가독성이 좋은 코드로 점진적으로 전환할 수 있었습니다.