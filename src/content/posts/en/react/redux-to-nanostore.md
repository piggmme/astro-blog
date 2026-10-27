---
title: 'Breaking Free from Complex Redux'
pubDate: 2026-1-4
description: 'Breaking Free from Complex Redux'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["React"]

---
# Breaking Free from Redux

## Why and how we gradually migrated from Redux → axios + transformer + Nanostores

As you do frontend development, there comes a moment when Redux stops being a **state management library**
and becomes **the place where everything gets dumped — async handling, data processing, and even business logic**.

I've been through a project like that myself.

This post is a record of my experience
**gradually converting a Redux-centric structure into an axios + transformer + Nanostores structure** in a real legacy project.

## 💣 The big picture of the old Redux structure

### A typical Redux + Thunk structure

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

Looking at just this code, it's a structure that "doesn't seem too bad."
But the real problem **arose in the reducer**.

### A typical Redux Reducer (the heart of the problem)

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

      // ❗ Logic processing starts inside the reducer
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

## What this reducer was actually doing

This reducer wasn't simply "updating state."

### Things being handled in the reducer

1. **Dependence on the API spec**
   * Directly knows the server field structure, such as `content`, `user_id`, `created_at`, `is_deleted`
2. **Data filtering**
3. **Data transformation**
4. **Business rule handling**

   * Computing `isMine`
5. **Sorting logic**
6. **State updates**

In other words, a single reducer was carrying **far too much context and responsibility**.

## The problems this structure actually caused

### 1. Debugging difficulty skyrocketed

When the message order looked wrong in the UI:

* Was it an API problem?
* Was it a problem with the reducer's sorting logic?
* Was it a date parsing problem?
  It was hard to tell at a glance.

### 2. Fragile against API spec changes

When the server changed `created_at → createdAt`,
a runtime error was thrown right in the reducer.

### 3. Testing was practically impossible

A single reducer test required

- mocking the API payload
- setting up state
- verifying dates/sorting/business rules

all of these.

## 🔎 Let's break down the complex Reducer 

The cause of the problem was **a structure where Redux's Reducer was taking on too many roles**.

So to solve this problem, I set the following principles.

### Core design principles

1. API calls happen **only in the API layer**
2. Data processing/business logic happens **only in transformers (pure functions)**
3. State management happens **only in the store**
4. Connecting them together happens **only in the UI**

In other words,

> What Redux alone used to do is split up and handled by `axios + transformer + store`.

## Overall architecture of the new structure

```
┌─────────────┐
│     UI      │  ← Combines the flow to use data
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
Here, the data is never processed.

### Transformer: logic processing pulled out of the reducer

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

The characteristics of a Transformer are as follows.

- **Pure function**
- No side effects
- Easy to test
- Clear place to fix when the API spec changes

### Store: splitting state into small pieces with Nanostores

```ts
// stores/messages.ts
import { atom } from 'nanostores'
import type { Message } from '../transformer/messages'

export const $messages = atom<Message[]>([])
```

The Store has a simple structure and does nothing but state management.

- No async
- No logic
- Manages state only

### UI: combining API + Transformer + Store

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

In the UI, you combine `API`, `Transformer`, and `Store` directly, so you can see the whole flow at a glance — where the data comes from, where it's processed, and where it's used. Thanks to this structure, if any problem comes up, debugging is very convenient.

## Gradual migration strategy

Because Redux in this project was so large, we couldn't remove it all at once.
We decided to migrate gradually, one reducer at a time, as follows.

### Order of application

1. Pick one reducer
2. Analyze that reducer's responsibilities
3. Implement the same functionality in the new structure
4. Connect the UI to the new store
5. Remove the old Redux code

We made the transition while keeping Redux and Nanostores in a **state where they could coexist**.

## Conclusion

With a large-scale Redux, it was very hard to figure out where state was changing and where problems had come from, but 
by improving things with the structure described in this post, we were able to lower the difficulty of debugging and gradually transition to more readable code.
