---
title: 'Until We Tore Out the Transformers'
pubDate: 2026-10-22
description: 'A refactoring log of tearing the transformer layer I had introduced myself back out of the chat domain'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["React"]

---
# Until We Tore Out the Transformers

## So that reading a single handler shows where the state changes

In [my last post](/en/posts/react/redux-to-nanostore), I talked about replacing Redux with **axios + transformer + Nanostores**.
I wrote that pulling the data-shaping logic that was mixed into reducers out into **transformers (pure functions)** would make things easy to test and make the flow easy to see.

Nine months later, I **tore out every one of those transformers** from the chat domain.
The 938 lines of `chatTransformers.ts` and the 994 lines of `chatActions.ts` disappeared, and in their place were left **26 files where a single request function shows request → state change → failure rollback all at once**.

There was only one reason. **The unnecessary abstraction called transformer was hiding how the state changes.**

This post is a record of why I tore down a structure I built myself, and how I tore it down without changing a single behavior.

## Starting point: chat state management stacked three layers deep

The chat domain, freshly moved over from Redux, looked like this.

```
UI (MiniChat.tsx)
 └─ effect        postChatMessage()                 ← chatActions.ts (994 lines)
     ├─ handler   handlePostChatMessageRequest()    ← chatActions.ts (52 handle* functions)
     │   └─ transformer  messages.postRequest()     ← chatTransformers.ts (938 lines)
     ├─ handler   handlePostChatMessageSuccess()
     │   └─ transformer  messages.postSuccess() / messagePaginations.postSuccess() / ...
     └─ handler   handlePostChatMessageFailure()
         └─ transformer  messagePaginations.postFailure()
```

It's the shape you get from moving Redux's `REQUEST / SUCCESS / FAILURE` actions over as-is.
Each action became a handler, and each reducer case became a transformer.

The effect that sends one message looked like this.

```ts
// chatActions.ts — Before
export const postChatMessage = async (user, convoId, text, requestIdOnRetry?) => {
  const requestId = requestIdOnRetry || uuid()

  if (requestIdOnRetry) {
    handlePostChatMessageRetryRequest(convoId, requestId)
  } else {
    handlePostChatMessageRequest(user, convoId, text, requestId)
  }

  try {
    const data = await api.chat.$convoId.messages.post(convoId, { requestId, text })
    if (data.seq) {
      handlePostChatMessageSuccess(convoId, requestId, data.seq, data.sendTime ?? new Date().toISOString())
    }
    return data
  } catch (err) {
    handlePostChatMessageFailure(convoId, requestId)
    showCautionToast({ message: extractErrorMessage(err) ?? t('chat_input.send_error') })
    throw err
  }
}
```

Looks clean. But to find out **"if it fails, what on the screen gets rolled back, and how?"**, you had to follow it like this.

```ts
// chatActions.ts
export const handlePostChatMessageFailure = (convoId, requestId) => {
  $messagePaginations.set(chatTransformers.messagePaginations.postFailure({
    state: $messagePaginations.get(), convoId, requestId,
  }))
}

// chatTransformers.ts (somewhere 900 lines down)
const messagePaginationsTransformers = {
  postFailure: ({ state, convoId, requestId }) => { /* ... */ },
}
```

You have to cross two files and three functions to get a one-line answer.
On top of that, most transformers looked like this.

```ts
postRequest: ({ state, userId, convoId, text, requestId }: {
  state: Messages
  userId: number
  convoId: number
  text: string
  requestId: string
}): Messages => ({
  ...state,
  [requestId]: { userId, type: 'text', text, requestId, convoId } as Message,
}),
```

**All it does is a single spread, yet the argument type declaration is longer than the body.**

## What was the problem

### 1. Unnecessary abstraction hides state changes

The biggest problem was that **the unnecessary abstraction called transformer hid how the state changes**.

In the request function you only see the single line `handlePostChatMessageSuccess(...)`, and which store changes to which value inside it is hidden behind the name `chatTransformers.messages.postSuccess(...)`.
Someone reading the code either moves on thinking **"if it succeeds, the state will change correctly on its own"**, or has to hop between files to check for themselves.

The purpose of state management is to **keep server data locally → draw it on screen → send changes to the server → do an optimistic update or revalidate**.
Transformers and handlers **each added one more layer** in between. The more layers there are, the higher the cost of finding "where and how does this store change?"
Abstraction exists to hide complexity, but what got hidden here wasn't complexity — it was **the state change itself, the thing that should be most visible**.

### 2. Failure rollback loses its owner

The thing most often missing from optimistic updates is **the code that rolls back on failure**.
When the request is in the effect, adding the temporary message is in the Request handler, and the rollback is in the Failure handler, an omission doesn't stand out.
**Only when it's gathered in one function can you see "the catch is empty".**

### 3. The benefit of being pure functions is smaller than you'd think

It's true that transformers are pure functions and therefore easy to test.
But what actually needed testing was real computation like **seq sorted merge and pinned conversation sorting**, and most transformers were a single spread.
For one spread, we were maintaining one more function, type, call site, and name each.

## Setting principles

Before starting, I aligned on principles with the team.

1. **The whole process must be visible in a single event handler (request function)** — request → state change → failure rollback
2. **If computing a value is complex, extract it into a pure function that doesn't reference the store** — and test only that
3. **Write `set` · `setKey` directly in the handler body** — don't create functions that wrap store changes, whether they're named `transformer`, `effect`, or `applyX`
4. **For logic, readability > DRY** — even if three similar lines appear in three places, allow the duplication as long as you can read and understand one place

A shared function seems like something you only need to fix once, but in reality it isn't.
If you change a shared function used in five places because of one screen, you have to check one by one that **the other four places still work correctly**. You even need to know what value each call site passes and what result it expects, so it's hard to judge and easy to miss.
On the other hand, if the same code sits as-is in four places, you just search for it and fix each one. Only the places you fixed are affected, so there's less to check.

Now that we work alongside AI agents, this gap has grown even bigger.
Writing the same code four times takes an agent a few seconds, so **the cost of writing code has nearly disappeared.**
What's still expensive is **a human reading the code and verifying it's correct**. So I decided that code you can read and verify at a glance is better, even if it creates a little duplication.

That doesn't mean it's okay to copy everything. I split things into **what's okay to duplicate and what isn't**.

- **Okay to duplicate — how to change the store after receiving a response.** It can differ a little per screen and per request, and it's easier to read when it's visible right there.
- **Not okay to duplicate — the contract with the server.** Things like the request URL, which fields go in the request body, and what shape the response comes in.

When the server changes the contract, we **must change all of it** to follow. If you copy this to several places, the moment you miss one, it becomes a bug.
So the message send request is **defined only once in the api layer**, like `api.chat.$convoId.messages.post(convoId, { requestId, text })`, and everywhere calls this function. If the server renames a field, you only need to fix this one place.

To sum up, **we only bundle things into functions in the api layer that touches the server, and we don't bundle between the store and the screen.**

## How it went

Chat is a domain where real-time sockets, optimistic sending, and pagination are tangled together, so we couldn't overhaul it all at once.
So I broke it into **small slices that keep "consumer diff 0 · type errors 0" for every single commit**.

### Step 0 — Separate the real computation first and wrap it in tests

First I pulled out the real computation that was buried inside the transformers.

- `mergeSeqsAsc` (seq string sorted merge), `mergeConversations`, `sortedUniqPairs`, `removePairs`, etc. into `src/utils`
- Also separated `compareSeqStr`, which compares integer strings in the BigInt range, removing the legacy Ramda dependency along the way
- Added **22 tests**

```ts
// src/utils/mergeSeqsAsc.ts
// Merge two seq lists, deduplicate, and sort in ascending order.
// Keep seq as a string — converting with Number() breaks precision beyond 2^53.
export const mergeSeqsAsc = (a: Array<string | number>, b: Array<string | number>): string[] => {
  const set = new Set<string>()
  for (const x of a) set.add(String(x))
  for (const x of b) set.add(String(x))
  return Array.from(set).sort(compareSeqStr)
}

// src/utils/mergeSeqsAsc.test.ts
it('2^53 을 넘는 seq 를 정밀도 손실 없이 정렬한다', () => {
  expect(mergeSeqsAsc(['9007199254740993'], ['9007199254740992'])).toEqual([
    '9007199254740992',
    '9007199254740993',
  ])
})
```

Since these functions know nothing about the store, the tests only need to look at input and output.

This step is the safety net. Even when transformers get inlined in later steps, the error-prone computations will call functions that are already tested.

### Step 1 — One store at a time, move transformer code into the request function

We went **one store at a time**, in this order: searched conversation list → recent conversation list → conversation list pagination → conversation room meta (name · notifications · pinned).
Delete the transformers and handlers attached to a store, and write the state changes they used to make directly inside the request function's `try / catch`.

In Before, to see the same state change you had to follow three layers down.

```ts
// Before ① request function (chatActions.ts) — only the handler names are visible
export const searchConversations = async (q, cursor) => {
  handleSearchConversationsRequest(q, cursor)
  try {
    const data = await api.chat.conversations.get({ q, cursor })
    handleSearchConversationsSuccess(data.conversations, data.cursor, data.limit)
  } catch (e) {
    handleSearchConversationsFailure()
  }
}
```

```ts
// Before ② handler (chatActions.ts) — just calls the transformer and puts the result in the store
export const handleSearchConversationsSuccess = (conversations, cursor, limit) => {
  $searchedConvoPagination.set(chatTransformers.searchedConvoPagination.success({
    state: $searchedConvoPagination.get(), conversations, cursor, limit,
  }))
}
```

```ts
// Before ③ transformer (chatTransformers.ts) — how the state actually changes lives only here
const searchedConvoPaginationTransformers = {
  success: ({ state, conversations, cursor, limit }: {
    state: SearchedConvoPaginationState
    conversations: Conversation[]
    cursor: string | null
    limit: number
  }): SearchedConvoPaginationState => {
    const idSet = new Set(state.ids)
    const newIds = [...state.ids]
    for (const conv of conversations) {
      if (!idSet.has(conv.id)) {
        idSet.add(conv.id)
        newIds.push(conv.id)
      }
    }
    return { ...state, ids: newIds, cursor, isLoading: false, hasMore: conversations.length === limit }
  },
  // request · failure · cancel also one each, in the same shape
}
```

The answer to "how does the list change when search results come in?" lives only in ③. You have to start at ①, go through ②, and get down to ③ to see it.

In After, I wrote the contents of ③ directly inside ①, and deleted ② and ③.

```ts
// After — how the state changes on start · success · failure is all visible inside this function
export const searchConversations = async (q, cursor) => {
  // Start: if it's a new search, clear the list; if it's "load more", keep it and show loading
  const prev = $searchedConvoPagination.get()
  $searchedConvoPagination.set({
    ...prev,
    q,
    cursor: cursor == null ? null : prev.cursor,
    ids: cursor == null ? [] : prev.ids,
    isLoading: true,
  })
  try {
    const data = await api.chat.conversations.get({ q, cursor })
    // Success: append only the new conversation rooms after the existing list
    const current = $searchedConvoPagination.get()
    const idSet = new Set(current.ids)
    const nextIds = [...current.ids]
    for (const conv of data.conversations) {
      if (!idSet.has(conv.id)) {
        idSet.add(conv.id)
        nextIds.push(conv.id)
      }
    }
    $searchedConvoPagination.set({
      ...current,
      ids: nextIds,
      cursor: data.cursor ?? null,
      isLoading: false,
      hasMore: data.conversations.length === data.limit,
    })
  } catch (e) {
    // Failure: just turn off loading
    $searchedConvoPagination.set({ ...$searchedConvoPagination.get(), isLoading: false })
  }
}
```

The 4 transformers (`request` · `success` · `failure` · `cancel`) and the 4 handlers that called them disappeared, and the state change code that was inside the transformers moved into this single function.

I moved the remaining stores the same way. State changes used by socket events (message received · read handling) were moved **into the socket callbacks** instead of request functions, and places that change multiple stores together were wrapped in `batch()`.
`batch()` was used so that nanostores listeners and `computed` **don't read a half-changed intermediate state**. When changing multiple stores together, it notifies subscribers only once after all the changes are done. React 18 already batches renders automatically, so improving render performance isn't the goal.

## Result: a flow that ends in one file

The same message send now looks like this.

```ts
// postChatMessage.ts — After (partially omitted)
export const postChatMessage = async (user, convoId, text, requestIdOnRetry?) => {
  const requestId = requestIdOnRetry || uuid()

  // 1. Optimistic update: temporary message keyed by requestId + add requestId to pagination
  batch(() => {
    $messages.set({
      ...$messages.get(),
      [requestId]: { userId: user.id, type: 'text', text, requestId, convoId } as Message,
    })
    const pag = $messagePaginations.get()
    const item = pag[convoId] ?? INITIAL_MESSAGE_PAGINATION_ITEM
    $messagePaginations.set({
      ...pag,
      [convoId]: { ...item, requestIds: [...item.requestIds, requestId] },
    })
  })

  try {
    const data = await api.chat.$convoId.messages.post(convoId, { requestId, text })

    // 2. Confirm success: replace the temporary message with the server seq key
    //    (if the socket arrived before the API response and already cleaned up, do nothing)
    batch(() => {
      const current = $messages.get()
      const tempMsg = current[requestId]
      if (tempMsg) {
        const next = { ...current }
        delete next[requestId]
        next[data.seq] = { ...tempMsg, seq: data.seq }
        $messages.set(next)
      }
      // ... merge pagination seqs (mergeSeqsAsc), update the conversation room's lastMessageSeq
    })
    return data
  } catch (err) {
    // 3. Failure rollback: remove from requestIds and move to failedRequestIds → show resend / delete buttons
    const pag = $messagePaginations.get()
    const item = pag[convoId]
    if (item) {
      $messagePaginations.set({
        ...pag,
        [convoId]: {
          ...item,
          requestIds: item.requestIds.filter(id => id !== requestId),
          failedRequestIds: [...item.failedRequestIds, requestId],
        },
      })
    }
    showCautionToast({ message: extractErrorMessage(err) ?? t('chat_input.send_error') })
    throw err
  }
}
```

The line count actually went up. But **just by opening this one file**, you can immediately answer the following questions.

- When you press the send button, what appears on screen first? → Step 1
- Is it okay whichever of the socket and the API response arrives first? → the `if (tempMsg)` in Step 2
- If it fails, what gets rolled back? → Step 3

In Before, answering the same questions meant crossing two files and five functions.

Finally, the request functions were split into **one file per function**, so you can find the flow you want just by looking at the file name.

| | Before | After |
| --- | --- | --- |
| `chatTransformers.ts` | 938 lines | Deleted |
| `chatActions.ts` | 994 lines | Deleted (one file per request function. e.g. `postChatMessage.ts`) |
| `handle*` functions | 52 | 0 |
| Files you need to open to find a state change | 2–3 | 1 |
| Tests | Per transformer | 22 pure computation + request functions · socket callbacks |

## What we kept to avoid changing behavior

The scariest thing in a refactor is **behavior changing without anyone noticing**. So for every commit, I checked the following.

- **Consumer diff 0** — I didn't change a single line of components. Since store names and shapes are the same, screen behavior should be the same too.
- **Type errors 0** — I ran `astro check` on every commit to confirm the total error count for the whole repository didn't go up.
- **Per-path tests** — I tested socket message receipt (others · self), refetch after reconnect, and synchronization of 6 stores using the real store singletons. For socket callbacks, I mocked phoenix and called the callbacks directly.
- **Updating spec docs at the same time** — I fixed the flow descriptions and change history in each store's `.spec.md` in the same commit.

## Wrapping up

I don't think the decision to introduce transformers in my last post was wrong.
As an **intermediate step** for pulling apart the logic tangled in Redux reducers, it did its job well enough. Thanks to it, I could tell what was real computation and what was a single spread.

But when an intermediate step hardens into the final structure, it becomes a layer.
The criterion I got out of this work is just one.

> **When you open a single event handler, can you see request → state change → failure rollback all together?**

If you can't, whatever function sits in between is worth doubting at least once.
