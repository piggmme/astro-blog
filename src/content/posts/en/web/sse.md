---
title: 'Designing an SSE Architecture for Real-Time Communication: A Scalable System Built on a 3-Layer Structure'
pubDate: 2026-1-4
description: 'Designing an SSE Architecture for Real-Time Communication: A Scalable System Built on a 3-Layer Structure'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["Web"]

---

# Designing an SSE Architecture for Real-Time Communication: A Scalable System Built on a 3-Layer Structure

## Introduction

In modern web applications, real-time data synchronization is an essential feature. To give users immediate feedback and to keep state in sync across multiple clients, I designed an architecture built on Server-Sent Events (SSE). In this post, I'll share the structure and design philosophy of an SSE system that is scalable and easy to maintain.

## Background: Why Did We Choose SSE?

Unlike WebSocket, SSE is optimized for one-way communication from the server to the client. Our project had the following requirements:

- **Various event types**: 10+ event types, including notifications, comments, reactions, post updates, and more
- **Dynamic subscription management**: Selectively subscribe only to the events each page/component needs
- **Automatic reconnection**: Keep a stable connection even when the network is unstable
- **Type safety**: Type-safe event handling based on TypeScript

To satisfy these requirements, I designed a **3-layer architecture**.

## Overall Architecture Overview

```
┌─────────────────────────────────────────┐
│   Component Layer                       │
│   - Subscription components per         │
│     page/component                      │
│   - Declarative subscription management │
└─────────────────────────────────────────┘
              ↓ Subscription request
┌─────────────────────────────────────────┐
│   Event Handler Layer                   │
│   - Independent Store per event         │
│   - Type definitions & handling logic   │
│   - Auto-registration based on          │
│     connection state                    │
└─────────────────────────────────────────┘
              ↓ Event received
┌─────────────────────────────────────────┐
│   Core Infrastructure Layer             │
│   - Connection management (reconnect,   │
│     lifecycle)                          │
│   - Connection state management         │
│   - Subscription management & auto sync │
└─────────────────────────────────────────┘
```

Each layer has a clear responsibility, and upper layers don't need to know the implementation details of lower layers.

## Layer 1: Core Infrastructure Layer

### SSE Connection Manager: Reusable Connection Lifecycle Management

The lowest layer is a utility that manages the lifecycle of the SSE connection. It uses the factory function pattern to create a reusable connection manager.
```ts
import { casetify } from './casetify'

const MAX_RECONNECT_ATTEMPTS = 5

// Define custom event type
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

// Global event type declaration
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
    const delay = Math.min(1000 * Math.pow(2, _reconnectAttempts), 30000) // Exponential backoff

    _reconnectTimer = window.setTimeout(() => {
      _reconnectTimer = null
      if (!_isDisconnected) {
        disconnect()
        connect()
      }
    }, delay)
  }

  const addEventListener = <T>(event: string, handler: (result: T) => void) => {
    // Check whether the event is already registered
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
    _registeredEvents.clear() // Reset the list of registered events
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

**Key features:**

1. **Exponential backoff reconnection**: On network errors, the interval between reconnection attempts is gradually increased to minimize server load.
2. **Preventing duplicate event listeners**: A `Set` is used to prevent the same event listener from being registered more than once.
3. **Distinguishing manual/automatic disconnection**: The `_isDisconnected` flag distinguishes between the user explicitly disconnecting and a network error.

### SSE Client Instance: Singleton Pattern

Using the connection manager, we create a single SSE client to be used across the entire application.

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

**Singleton pattern**: Only one SSE connection is maintained across the entire application, so resources are used efficiently.

### Connection State Management: Reactive State Management with Nanostores

We use Nanostores' `map` to manage the connection state reactively.

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

**Reactive state**: With Nanostores' `map`, whenever the connection state changes, every component subscribed to it is updated automatically.

### Subscription Management: Dynamic Subscriptions and Automatic Synchronization

We manage subscription info, and once both the connection state and the subscription info are ready, it's automatically synced to the server.

```typescript
import { map } from 'nanostores'

export const $subscriptions = map<SubscriptionState>({})

const subscribeEvents = (event: SubscriptionEvent) => {
  const events = typeof event === 'string'
    ? { ...$subscriptions.get(), [event]: true }
    : { ...$subscriptions.get(), ...event }
  $subscriptions.set(events)
}

// Detect changes in connection state and subscription info, and sync automatically
const syncSubscriptions = () => {
  const connection = $connection.get()
  const subscriptions = $subscriptions.get()

  if (connection.connected && connection.sessionId && Object.keys(subscriptions).length > 0) {
    // Debouncing: even if there are multiple subscription requests within 1 second, only the last one is executed
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

// Detect connection state changes
$connection.listen(syncSubscriptions)
// Detect subscription info changes
$subscriptions.listen(syncSubscriptions)
```

**Core ideas:**

1. **Debouncing**: Even if multiple components request subscriptions at the same time, only the last request within a certain time window is sent to the server, reducing unnecessary API calls.
2. **Automatic synchronization**: When the connection drops and then reconnects, the current subscription info is automatically synced to the server.
3. **Reactive subscriptions**: Nanostores' `listen` method is used to automatically detect state changes.

## Layer 2: Event Handler Layer

Each SSE event is managed in its own file and follows a consistent pattern.

### Event Store Pattern

Each event is managed in its own file and follows a consistent pattern.

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

// When the Store is mounted, watch the connection state and register the event listener
onMount($exampleEvent, () => {
  const unsubscribe = $connection.subscribe((connection) => {
    if (!connection.connected) {
      $exampleEvent.set(null)
      return
    }
    // Register the event listener once connected
    sseClient.addEventListener('example_event', (data: ExampleEvent) => {
      $exampleEvent.set(data)
    })
  })
  return unsubscribe
})
```

**Advantages of this pattern:**

1. **Independence**: Each event is managed independently, so they don't affect one another.
2. **Type safety**: Each event has a clearly defined type.
3. **Automatic cleanup**: Using `onMount`, the store is automatically cleaned up when it's no longer in use.
4. **Connection state detection**: When the connection drops, the event data is reset so that stale data isn't displayed.

## Layer 3: Component Layer

### Null Component Pattern: Declarative Subscription Management

In the component layer, we use Null components that subscribe to the events each page or component needs. These components render nothing and only manage subscriptions.

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

**Usage example:**

```typescript
// Resource detail page
function ResourceDetail({ resourceId }: { resourceId: number }) {
  return (
    <>
      <EventSubscriber resourceId={resourceId} />
      {/* Resource detail UI */}
    </>
  )
}
```

**Advantages:**

1. **Declarative subscriptions**: Just rendering the component subscribes automatically.
2. **Automatic cleanup**: When the component unmounts, the subscription is automatically removed.
3. **Conditional subscriptions**: When `resourceId` changes, it automatically switches to the new subscription.
4. **Separation of concerns**: UI logic and subscription logic are clearly separated.

### Global Connection Management: Initialization Hook

The SSE connection is initialized at the application root.

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
// App.tsx or RootLayout
function App() {
  useSseConnection() // Initialize the global SSE connection
  
  return (
    // ...
  )
}
```

This way, the SSE connection is automatically initialized when the application starts and automatically cleaned up when the application shuts down.

## Real-World Usage Scenario

### Scenario: Detail Page

On the detail page, we subscribe only to events related to a specific resource.

#### Implementing the ResourceSubscriber Component

```typescript
// components/ResourceSubscriber.tsx
import { useEffect } from 'react'
import { sseSubscriptionsActions } from '../nanostores/sse'

export default function ResourceSubscriber(
  { resourceId }: { resourceId: number }
) {
  useEffect(() => {
    if (!resourceId) return
    
    // Subscription request: ask the server to subscribe to events for this resourceId
    sseSubscriptionsActions.subscribe({ resourceId })
    
    // Unsubscribe when the component unmounts
    return () => {
      sseSubscriptionsActions.unsubscribe('resourceId')
    }
  }, [resourceId])
  
  // Null component: renders nothing and only manages the subscription
  return null
}
```

#### Defining the $resourceUpdate Store

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

// Create an atom to store the event data
export const $resourceUpdate = atom<ResourceUpdate | null>(null)

// Store reset function
export const resetResourceUpdate = () => {
  $resourceUpdate.set(null)
}

// Runs when the Store is mounted (on first use)
onMount($resourceUpdate, () => {
  // Subscribe to the SSE connection state
  const unsubscribe = $sseConnection.subscribe((connection) => {
    // Reset the data when the connection drops
    if (!connection.connected) {
      $resourceUpdate.set(null)
      return
    }
    
    // Register the SSE event listener once connected
    // When a 'resource_update' event arrives from the server, it's automatically stored in $resourceUpdate
    sseManager.addEventListener('resource_update', (data: ResourceUpdate) => {
      $resourceUpdate.set(data)
    })
  })
  
  // Return the cleanup function
  return unsubscribe
})
```

#### Full Flow: Usage on the Detail Page

```typescript
// pages/DetailPage.tsx
import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import ResourceSubscriber from '../components/ResourceSubscriber'
import { $resourceUpdate, resetResourceUpdate } from '../nanostores/sse'

function DetailPage({ resourceId }: { resourceId: number }) {
  return (
    <>
      {/* 1. Subscription component: start subscribing to events for this resourceId */}
      <ResourceSubscriber resourceId={resourceId} />

      {/* 2. Apply SSE state to the UI: detect changes in $resourceUpdate and update the UI */}
      <DetailContents resourceId={resourceId} />
    </>
  )
}

function DetailContents({ resourceId }: { resourceId: number }) {
  // Use the $resourceUpdate state with Nanostores' useStore hook
  const update = useStore($resourceUpdate)

  return (
    <div>{update.data}</div>
  )
}
```

#### Detailed Explanation of the Data Flow

1. **Subscription starts**: When `ResourceSubscriber` mounts, it calls `sseSubscriptionsActions.subscribe({ resourceId })`
   ```typescript
   // $sseSubscriptions gets updated
   $sseSubscriptions.set({ resourceId: 123 })
   ```

2. **Automatic synchronization**: The `syncSubscriptions` function in `sseSubscriptions.ts` runs and sends a subscription request to the server
   ```typescript
   // PUT request to the server after 1-second debouncing
   PUT /api/v3/sse/session/{sessionId}/option
   Body: { resource_id: 123 }
   ```

3. **Event received**: When a `resource_update` event arrives from the server, the `sseManager.addEventListener` callback runs
   ```typescript
   // The listener registered in onMount of events/resourceUpdate.ts runs
   sseManager.addEventListener('resource_update', (data) => {
     $resourceUpdate.set(data) // ← The Store is updated here!
   })
   ```

4. **UI reacts**: When `$resourceUpdate` is updated, components using `useStore($resourceUpdate)` automatically re-render
   ```typescript
   // The ResourceUpdateHandler component automatically re-renders
   const update = useStore($resourceUpdate) // ← Automatically updates when the value changes
   ```

5. **Unsubscribe**: When `ResourceSubscriber` unmounts, the subscription is automatically removed
   ```typescript
   // The cleanup function runs
   sseSubscriptionsActions.unsubscribe('resourceId')
   ```

With this pattern, each page subscribes only to the events it needs, and the subscription is automatically removed when you leave the page. Also, when an SSE event arrives from the server, the corresponding Store is automatically updated, and the components subscribed to it automatically re-render.

## Key Advantages of the Architecture

### 1. Separation of Concerns

Each layer has a clear responsibility, and upper layers don't need to know the implementation details of lower layers.

- **Infrastructure layer**: Connection management, reconnection, subscription sync
- **Event layer**: Type definitions and handling logic for each event
- **Component layer**: Integration with the UI

### 2. Scalability

Adding a new event type is very simple:

1. Create a new file in the events directory
2. Define the type and create the Store
3. Register the event listener when the Store mounts
4. Create a subscription component if needed

There's no need to modify existing code, which follows the Open-Closed Principle (OCP).

### 3. Type Safety

Every event has its type defined in TypeScript, so errors can be caught at compile time.

### 4. Performance Optimization

- **Debouncing**: Subscription requests are collected for 1 second and sent all at once
- **Preventing duplicate event listeners**: Prevents the same event listener from being registered multiple times
- **Conditional subscriptions**: Only the needed events are subscribed to, reducing unnecessary network traffic

### 5. Auto Recovery

- **Automatic reconnection**: Automatically reconnects with exponential backoff on network errors
- **Automatic subscription sync**: After reconnecting, the current subscription info is automatically synced to the server

### 6. Reactive State Management

Since state is managed with Nanostores, it can be used with any framework, such as React, Vue, or Svelte. Nanostores is a framework-agnostic state management library and can be integrated through per-framework adapters (`@nanostores/react`, `@nanostores/vue`, etc.).

## Design Principles

This architecture follows these design principles:

1. **Single Responsibility Principle (SRP)**: Each module has only one responsibility.
2. **Open-Closed Principle (OCP)**: Open for extension, closed for modification.
3. **Dependency Inversion Principle (DIP)**: Upper layers don't depend on the concrete implementations of lower layers.
4. **Separation of concerns**: Connection management, event handling, and UI integration are clearly separated.

## Conclusion

The SSE architecture designed with a 3-layer structure provides the following benefits:

- ✅ **Scalability**: Adding new event types is simple
- ✅ **Maintainability**: Each layer is managed independently
- ✅ **Reliability**: Automatic reconnection and subscription sync
- ✅ **Performance**: Optimized through debouncing and conditional subscriptions
- ✅ **Type safety**: Full type support with TypeScript
- ✅ **Framework independence**: Works independently of any framework thanks to Nanostores

This architecture can be applied to a variety of web applications that need real-time communication, and it's especially effective when there are many event types and subscriptions need to be managed dynamically.

## References

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Nanostores official docs](https://github.com/nanostores/nanostores)
- [Design Patterns: Factory Pattern](https://refactoring.guru/design-patterns/factory-method)

