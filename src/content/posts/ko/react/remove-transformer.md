---
title: 'Transformer 를 걷어내기까지'
pubDate: 2026-10-22
description: '직접 도입했던 transformer 계층을 채팅 도메인에서 다시 걷어낸 리팩토링 기록'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["React"]

---
# Transformer 를 걷어내기까지

## 핸들러 하나만 읽어도 상태가 어디서 바뀌는지 보이게

[지난 글](/ko/posts/react/redux-to-nanostore)에서 Redux 를 **axios + transformer + Nanostores** 로 바꾼 이야기를 했습니다.
reducer 에 섞여 있던 데이터 가공 로직을 **transformer(순수 함수)** 로 떼어내면 테스트하기 쉽고 흐름도 잘 보일 거라고 썼었죠.

그로부터 9개월 뒤, 저는 채팅 도메인에서 그 transformer 를 **전부 걷어냈습니다.**
`chatTransformers.ts` 938줄과 `chatActions.ts` 994줄이 사라졌고, 그 자리에는 **요청 함수 하나에 요청 → 상태 변경 → 실패 복원이 모두 보이는 파일 26개**가 남았습니다.

이유는 하나였습니다. **transformer 라는 불필요한 추상화가 상태가 어떻게 바뀌는지를 가리고 있었기 때문입니다.**

이 글은 왜 직접 만든 구조를 다시 걷어냈는지, 그리고 동작을 하나도 바꾸지 않고 어떻게 걷어냈는지에 대한 기록입니다.

## 출발점: 3단으로 쌓인 채팅 상태 관리

Redux 에서 막 옮겨 온 채팅 도메인은 이렇게 생겨 있었습니다.

```
UI (MiniChat.tsx)
 └─ effect        postChatMessage()                 ← chatActions.ts (994줄)
     ├─ handler   handlePostChatMessageRequest()    ← chatActions.ts (handle* 52개)
     │   └─ transformer  messages.postRequest()     ← chatTransformers.ts (938줄)
     ├─ handler   handlePostChatMessageSuccess()
     │   └─ transformer  messages.postSuccess() / messagePaginations.postSuccess() / ...
     └─ handler   handlePostChatMessageFailure()
         └─ transformer  messagePaginations.postFailure()
```

Redux 의 `REQUEST / SUCCESS / FAILURE` 액션을 그대로 옮긴 모양입니다.
액션 하나가 handler 하나가 됐고, reducer 의 case 하나가 transformer 하나가 됐습니다.

메시지 하나를 보내는 effect 는 이랬습니다.

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

깔끔해 보입니다. 그런데 **"실패하면 화면에서 무엇이 어떻게 되돌아가는가?"** 를 알려면 이렇게 따라가야 했습니다.

```ts
// chatActions.ts
export const handlePostChatMessageFailure = (convoId, requestId) => {
  $messagePaginations.set(chatTransformers.messagePaginations.postFailure({
    state: $messagePaginations.get(), convoId, requestId,
  }))
}

// chatTransformers.ts (900줄 아래 어딘가)
const messagePaginationsTransformers = {
  postFailure: ({ state, convoId, requestId }) => { /* ... */ },
}
```

파일 두 개, 함수 세 개를 건너야 한 줄짜리 답이 나옵니다.
게다가 transformer 대부분은 이런 모양이었습니다.

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

**하는 일은 스프레드 한 번인데, 인자 타입 선언이 본문보다 깁니다.**

## 무엇이 문제였나

### 1. 불필요한 추상화가 상태 변화를 가린다

가장 큰 문제는 **transformer 라는 불필요한 추상화 때문에 상태가 어떻게 바뀌는지가 가려진다** 는 점이었습니다.

요청 함수에는 `handlePostChatMessageSuccess(...)` 한 줄만 보이고, 그 안에서 어떤 store 가 어떤 값으로 바뀌는지는 `chatTransformers.messages.postSuccess(...)` 라는 이름 뒤에 숨어 있습니다.
코드를 읽는 사람은 **"성공하면 상태가 알아서 맞게 바뀌겠지"** 하고 넘어가거나, 파일을 건너다니며 직접 확인해야 합니다.

상태 관리의 목적은 **서버 데이터를 로컬에 두고 → 화면에 그리고 → 변경을 서버에 보내고 → 긍정적 업데이트 또는 재검증** 하는 것입니다.
transformer 와 handler 는 이 사이에 **겹을 하나씩 더 만들었습니다.** 겹이 늘어날수록 "이 store 가 어디서, 어떻게 바뀌는가" 를 찾는 비용이 커집니다.
추상화는 복잡함을 숨기라고 있는 것인데, 여기서 숨겨진 건 복잡함이 아니라 **가장 잘 보여야 할 상태 변화 그 자체** 였습니다.

### 2. 실패 복원이 소유자를 잃는다

긍정적 업데이트에서 가장 자주 빠지는 건 **실패했을 때 되돌리는 코드** 입니다.
요청은 effect 에, 임시 메시지 추가는 Request handler 에, 되돌리기는 Failure handler 에 흩어져 있으면 누락이 눈에 띄지 않습니다.
**한 함수 안에 모여 있어야 "catch 가 비어 있다" 가 보입니다.**

### 3. 순수 함수라는 장점이 생각보다 작다

transformer 가 순수 함수라 테스트하기 쉽다는 건 맞습니다.
하지만 실제로 테스트가 필요한 건 **seq 정렬 병합, 고정 대화방 정렬** 같은 진짜 계산이었고, 대부분의 transformer 는 스프레드 한 번이었습니다.
스프레드 한 번을 위해 함수 · 타입 · 호출부 · 이름을 하나씩 더 유지하고 있었던 겁니다.

## 원칙 세우기

작업 전에 팀과 원칙을 맞췄습니다.

1. **이벤트 핸들러(요청 함수) 하나에서 처리 과정 전체가 보여야 한다** — 요청 → 상태 변경 → 실패 복원
2. **값 계산이 복잡하면 store 를 참조하지 않는 순수 함수로 뽑는다** — 그리고 그것만 테스트한다
3. **`set` · `setKey` 는 핸들러 본문에 직접 쓴다** — store 변경을 감싼 함수는 이름이 `transformer` 든 `effect` 든 `applyX` 든 만들지 않는다
4. **로직은 가독성 > DRY** — 비슷한 세 줄이 세 곳에 있어도, 한 곳을 읽고 이해할 수 있으면 중복을 허용한다

공용 함수는 한 번만 고치면 될 것 같지만, 실제로는 그렇지 않습니다.
다섯 곳에서 쓰는 공용 함수를 한 화면 때문에 고치면, **나머지 네 곳이 여전히 제대로 동작하는지** 하나하나 확인해야 합니다. 각 호출부가 어떤 값을 넘기고 어떤 결과를 기대하는지까지 알아야 하니, 판단하기 어렵고 놓치기도 쉽습니다.
반면 같은 코드가 네 곳에 그대로 있다면, 검색해서 찾은 뒤 하나씩 고치면 됩니다. 고친 곳에만 영향이 가니 확인할 것도 적습니다.

AI 에이전트와 함께 일하는 지금은 이 차이가 더 커졌습니다.
같은 코드를 네 번 쓰는 건 에이전트에게 몇 초면 끝나는 일이라, **코드를 쓰는 비용은 거의 사라졌습니다.**
여전히 비싼 건 **그 코드가 맞는지 사람이 읽고 확인하는 일** 입니다. 그래서 중복이 조금 생기더라도, 한눈에 읽고 확인할 수 있는 코드가 더 낫다고 판단했습니다.

그렇다고 모든 걸 복사해도 된다는 뜻은 아닙니다. **중복해도 되는 것과 안 되는 것** 을 나눴습니다.

- **중복해도 되는 것 — 응답을 받아서 store 를 어떻게 바꿀지.** 화면마다, 요청마다 조금씩 다를 수 있고, 그 자리에서 보여야 읽기 쉽습니다.
- **중복하면 안 되는 것 — 서버와 주고받는 약속.** 요청 URL, 요청 body 에 어떤 필드를 담는지, 응답이 어떤 모양으로 오는지 같은 것들입니다.

서버와의 약속은 서버가 바꾸면 우리도 **반드시 전부** 따라 바꿔야 합니다. 이걸 여러 곳에 복사해 두면 한 곳을 빠뜨리는 순간 버그가 됩니다.
그래서 메시지 전송 요청은 `api.chat.$convoId.messages.post(convoId, { requestId, text })` 처럼 **api 계층에 한 번만 정의** 하고, 모든 곳에서 이 함수를 부릅니다. 서버가 필드 이름을 바꾸면 이 한 곳만 고치면 됩니다.

정리하면, **함수로 묶는 건 서버와 맞닿는 api 계층에서만 하고, store 와 화면 사이에서는 묶지 않습니다.**

## 진행 과정

채팅은 실시간 소켓 · 낙관적 전송 · 페이지네이션이 얽힌 도메인이라 한 번에 갈아엎을 수 없었습니다.
그래서 **커밋 하나마다 "소비처 diff 0 · 타입 에러 0" 을 지키는 작은 슬라이스**로 쪼갰습니다.

### 0단계 — 진짜 계산부터 분리하고 테스트로 묶기

transformer 안에 묻혀 있던 진짜 계산을 먼저 꺼냈습니다.

- `mergeSeqsAsc` (seq 문자열 정렬 병합), `mergeConversations`, `sortedUniqPairs`, `removePairs` 등을 `src/utils` 로
- BigInt 범위의 정수 문자열을 비교하는 `compareSeqStr` 도 분리하며 레거시 Ramda 의존 제거
- **테스트 22개** 추가

```ts
// src/utils/mergeSeqsAsc.ts
// 두 seq 목록을 합쳐 중복 제거 후 오름차순 정렬.
// seq 는 문자열로 유지한다 — Number() 로 바꾸면 2^53 초과에서 정밀도가 깨진다.
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

store 를 전혀 모르는 함수라 테스트도 입력과 출력만 보면 됩니다.

이 단계가 안전망입니다. 이후 단계에서 transformer 를 인라인하더라도, 틀리기 쉬운 계산은 이미 테스트된 함수를 호출하게 됩니다.

### 1단계 — store 하나씩, transformer 코드를 요청 함수 안으로 옮기기

검색 대화 목록 → 최근 대화 목록 → 대화 목록 페이지네이션 → 대화방 메타(이름 · 알림 · 고정) 순서로, **store 하나씩** 진행했습니다.
store 하나에 딸린 transformer 와 handler 를 지우고, 그 안에서 하던 상태 변경을 요청 함수의 `try / catch` 안에 직접 씁니다.

Before 에서는 같은 상태 변경을 보려면 세 겹을 따라 내려가야 했습니다.

```ts
// Before ① 요청 함수 (chatActions.ts) — handler 이름만 보인다
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
// Before ② handler (chatActions.ts) — transformer 를 불러 store 에 넣기만 한다
export const handleSearchConversationsSuccess = (conversations, cursor, limit) => {
  $searchedConvoPagination.set(chatTransformers.searchedConvoPagination.success({
    state: $searchedConvoPagination.get(), conversations, cursor, limit,
  }))
}
```

```ts
// Before ③ transformer (chatTransformers.ts) — 실제로 상태를 어떻게 바꾸는지는 여기에만 있다
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
  // request · failure · cancel 도 같은 모양으로 하나씩
}
```

"검색 결과를 받으면 목록이 어떻게 바뀌지?" 에 대한 답은 ③ 에만 있습니다. ① 에서 시작해 ② 를 거쳐 ③ 까지 내려가야 보입니다.

After 에서는 ③ 의 내용을 ① 안에 직접 쓰고, ② 와 ③ 을 지웠습니다.

```ts
// After — 시작 · 성공 · 실패 때 상태가 어떻게 바뀌는지 이 함수 안에서 다 보인다
export const searchConversations = async (q, cursor) => {
  // 시작: 새 검색이면 목록을 비우고, 더보기면 유지한 채 로딩 표시
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
    // 성공: 기존 목록 뒤에 새 대화방만 이어 붙인다
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
    // 실패: 로딩만 끈다
    $searchedConvoPagination.set({ ...$searchedConvoPagination.get(), isLoading: false })
  }
}
```

transformer 4개(`request` · `success` · `failure` · `cancel`)와 그걸 부르던 handler 4개가 사라지고, transformer 안에 있던 상태 변경 코드가 이 함수 하나로 들어왔습니다.

나머지 store 도 같은 방식으로 옮겼습니다. 소켓 이벤트(메시지 수신 · 읽음 처리)에서 쓰던 상태 변경은 요청 함수 대신 **소켓 콜백 안으로** 옮겼고, 여러 store 를 함께 바꾸는 곳은 `batch()` 로 묶었습니다.
`batch()` 는 nanostores 의 리스너와 `computed` 가 **반쯤 바뀐 중간 상태를 읽지 않도록** 쓰였습니다. 여러 store 를 함께 바꿀 때, 모든 변경이 끝난 뒤에 구독자에게 한 번만 알리게 하는 겁니다. 렌더는 React 18 이 이미 자동으로 묶어 주기 때문에, 렌더 성능 개선이 목적은 아닙니다.

## 결과: 한 파일에서 끝나는 흐름

같은 메시지 전송이 이제 이렇게 생겼습니다.

```ts
// postChatMessage.ts — After (일부 생략)
export const postChatMessage = async (user, convoId, text, requestIdOnRetry?) => {
  const requestId = requestIdOnRetry || uuid()

  // 1. 긍정적 업데이트: requestId 키로 임시 메시지 + 페이지네이션에 requestId 추가
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

    // 2. 성공 확정: 임시 메시지를 서버 seq 키로 교체
    //    (소켓이 API 응답보다 먼저 와서 이미 정리했다면 아무것도 하지 않음)
    batch(() => {
      const current = $messages.get()
      const tempMsg = current[requestId]
      if (tempMsg) {
        const next = { ...current }
        delete next[requestId]
        next[data.seq] = { ...tempMsg, seq: data.seq }
        $messages.set(next)
      }
      // ... 페이지네이션 seqs 병합(mergeSeqsAsc), 대화방 lastMessageSeq 갱신
    })
    return data
  } catch (err) {
    // 3. 실패 복원: requestIds 에서 빼고 failedRequestIds 로 → 재전송 / 삭제 버튼 노출
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

코드 줄 수는 오히려 늘었습니다. 하지만 **이 파일 하나만 열면** 다음 질문에 바로 답할 수 있습니다.

- 전송 버튼을 누르면 화면에 무엇이 먼저 생기는가? → 1번
- 소켓과 API 응답 중 무엇이 먼저 와도 괜찮은가? → 2번의 `if (tempMsg)`
- 실패하면 무엇이 되돌아가는가? → 3번

Before 에서는 같은 질문에 답하려면 파일 두 개와 함수 다섯 개를 건너야 했습니다.

마지막으로 요청 함수는 **함수 하나당 파일 하나** 로 나눠, 파일 이름만 보고 원하는 흐름을 바로 찾을 수 있게 했습니다.

| | Before | After |
| --- | --- | --- |
| `chatTransformers.ts` | 938줄 | 삭제 |
| `chatActions.ts` | 994줄 | 삭제 (요청 함수당 파일 하나로. 예: `postChatMessage.ts`) |
| `handle*` 함수 | 52개 | 0개 |
| 상태 변경을 찾는 데 열어야 하는 파일 | 2~3개 | 1개 |
| 테스트 | transformer 단위 | 순수 계산 22개 + 요청 함수 · 소켓 콜백 |

## 동작을 바꾸지 않기 위해 지킨 것

리팩토링에서 가장 무서운 건 **아무도 모르게 동작이 바뀌는 것** 입니다. 그래서 매 커밋마다 이렇게 확인했습니다.

- **소비처 diff 0** — 컴포넌트는 한 줄도 바꾸지 않았습니다. store 이름과 모양이 그대로이니 화면 동작도 그대로여야 합니다.
- **타입 에러 0** — 커밋마다 `astro check` 를 돌려 저장소 전체 에러 수가 늘지 않는지 확인했습니다.
- **경로별 테스트** — 소켓 메시지 수신(타인 · 본인), 재연결 후 재조회, 6개 store 동기화를 실제 store 싱글턴으로 테스트했습니다. 소켓 콜백은 phoenix 를 mock 해서 콜백을 직접 호출했습니다.
- **spec 문서 동시 갱신** — store 마다 있는 `.spec.md` 의 흐름 설명과 변경 이력을 같은 커밋에서 고쳤습니다.

## 마치며

지난 글에서 transformer 를 도입한 판단이 틀렸다고 생각하지는 않습니다.
Redux reducer 에 뒤엉킨 로직을 떼어내는 **중간 단계** 로서는 충분히 역할을 했습니다. 덕분에 무엇이 진짜 계산이고 무엇이 스프레드 한 번인지 구분할 수 있었으니까요.

다만 중간 단계가 최종 구조로 굳으면 겹이 됩니다.
이번 작업으로 얻은 기준은 하나입니다.

> **이벤트 핸들러 하나를 열었을 때, 요청 → 상태 변경 → 실패 복원이 모두 보이는가?**

보이지 않는다면, 그 사이에 있는 함수가 무엇이든 한 번쯤 의심해 볼 만합니다.
