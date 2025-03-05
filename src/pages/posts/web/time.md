---
title: '날짜와 시간 형식에 관하여'
layout: ../_MarkdownPostLayout.astro
pubDate: 2025-3-5
description: '날짜와 시간 형식에 관하여'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["Web"]

---

## 개발에서 시간 개념이 중요한 이유

개발에서 시간 개념은 데이터의 일관성 유지, 글로벌 서비스 지원, 로그 및 트랜잭션 관리, 성능 최적화 등의 다양한 이유에 의해서 중요하다.

**1. 데이터의 일관성 유지**

시간을 다룰 때 서버, 클라이언트, 데이터베이스 간의 시간이 일관되게 관리되지 않으면 데이터의 정합성이 깨질 수 있다. 예를 들어, 사용자가 메시지를 보냈는데 시간대(time zone) 처리가 잘못되어 받는 사람이 과거의 시간으로 메시지를 받는 문제가 생길 수 있다. 이런 경우가 발생하지 않도록 시간을 UTC 기준으로 저장하고, 필요할 때 변환하는 방식을 사용한다.

📌 해결 방법

- 모든 서버와 데이터베이스는 UTC 기준으로 저장
- 클라이언트에서 사용자의 로컬 시간대로 변환하여 표시

```js
const serverTime = "2024-03-05T12:00:00Z"; // 서버에서 저장된 UTC 시간
console.log(new Date(serverTime).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }));
```

**2. 글로벌 서비스 지원**

만약 서비스가 특정 국가의 시간만 지원한다면 다른 국가 사용자는 다음과 같은 문제를 경험할 수 있다.

- 한국(UTC+9)에서 오후 3시에 예약을 했는데, 미국 뉴욕(UTC-5)에서는 새벽 1시로 보이는 문제 발생 가능
- 게시글이나 댓글을 작성한 시간이 사용자마다 다르게 보일 수 있음


📌 해결 방법

- 모든 시간을 UTC 기준으로 저장하고, 각 사용자의 시간대로 변환하여 표시
- Intl.DateTimeFormat()을 사용하여 사용자의 로컬 시간대에 맞게 변환

```js
const utcDate = new Date();
console.log(
  new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" }).format(
    utcDate
  )
);
```

**3. 로그 및 트랜잭션 관리**

애플리케이션에서 로그(log), 트랜잭션(transaction), 이벤트(event) 기록을 남길 때 시간이 매우 중요하다.

- 에러 발생 시점 파악: 에러 로그가 여러 서버에 분산되어 있을 때, 각 서버의 시간이 다르면 디버깅이 어려워짐.
- 금융 서비스: 은행 이체 기록이 시간대에 따라 다르게 저장되면 오류 발생 가능.
- 주문 처리 시스템: "결제 완료"가 "주문 생성"보다 먼저 발생하는 문제가 생길 수 있음.

📌 해결 방법

- 모든 로그를 UTC 기준으로 기록하고, 필요할 때 변환하여 확인
- 로그에 타임스탬프(timestamp) 포함하여 정렬

**4. 캐싱 및 성능 최적화**

시간을 제대로 관리하지 않으면 캐시(Cache) 관련 문제가 발생할 수 있다.

- 서버에서 데이터를 캐싱했는데, 클라이언트에서 요청하는 시간이 다르면 잘못된 데이터 제공 가능.
- API 응답을 캐싱할 때 "언제까지 유효한지"를 명확히 하지 않으면 오래된 데이터가 표시될 수 있음.

📌 해결 방법

- 캐시 만료 시간을 UTC 기준으로 설정하고, 클라이언트가 로컬 시간으로 변환해서 표시
- HTTP Expires 또는 Cache-Control 헤더에 명확한 만료 시간 설정

```js
res.setHeader("Cache-Control", "public, max-age=3600"); // 1시간 동안 캐싱
```

## 시간을 표현하는 방법

### 타임스탬프 (Timestamp)

타임스탬프는 특정 시점을 숫자로 표현한 값이다. 가장 많이 사용하는 형식은 **UNIX 타임스탬프**인데, 1970년 1월 1일 00:00:00 UTC(협정 세계시)부터 경과한 초(second) 또는 밀리초(milliseconds)를 나타낸다.

- `1709558400` → 2024년 3월 4일 00:00:00 UTC (초 단위)
- `1709558400000` → 2024년 3월 4일 00:00:00 UTC (밀리초 단위)

자바스크립트에서 타임스탬프 다루기

```js
const now = Date.now(); // 현재 시간 (밀리초 단위)
console.log(now);

const date = new Date(now);
console.log(date.toISOString()); // 2024-03-04T00:00:00.000Z
```

### UTC (협정 세계시, Coordinated Universal Time)

UTC는 전 세계에서 공통적으로 기준이 되는 표준 시간대예요. 영국의 그리니치 천문대를 기준으로 하는 GMT(Greenwich Mean Time)와 거의 같다.

- `2024-03-04T00:00:00Z` → UTC 기준 날짜 및 시간
    - `Z`를 붙이는 이유는 [ISO 8601 날짜 표준](#iso-8601-날짜-표준) 형식을 맞추기 위함이다.

|형식	|설명	|예시 |
|----------------|--------------|----------------|
|YYYY-MM-DDTHH:mm:ss.sssZ	|UTC 기준 시간 (Z는 UTC 의미)	|2024-03-04T00:00:00Z|
|YYYY-MM-DDTHH:mm:ss.sss±HH:MM	|특정 시간대 포함	|2024-03-04T09:00:00+09:00 (KST)|
|YYYY-MM-DDTHH:mm:ss.sss	|시간대 정보 없이 표현	|2024-03-04T09:00:00.000|

### KST (Korea Standard Time, 한국 표준시)

KST는 한국 표준시로, UTC보다 9시간 빠른 시간대이다. 즉, `UTC +9`를 의미한다.

- `2024-03-04T09:00:00+09:00` → 한국 시간 기준

UTC → KST 변환 (자바스크립트)

```js
const utcDate = new Date();
const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
console.log(kstDate.toISOString()); // 9시간 추가된 ISO 형식
```

### 타임존(Time Zone)

세계 각국은 시간대를 다르게 사용한다. 한국(KST, UTC+9), 일본(JST, UTC+9), 미국 뉴욕(EST, UTC-5) 등 다양한 시간대가 있다.

- KST (한국, UTC+9)
- PST (미국 태평양 표준시, UTC-8)
- EST (미국 동부 표준시, UTC-5)
- IST (인도 표준시, UTC+5:30)

### ISO 8601 날짜 표준

ISO 8601은 국제 표준 날짜 및 시간 형식이다.

- `YYYY-MM-DDTHH:mm:ss.sssZ` 형식 사용
- `Z`는 UTC 시간을 의미
- 예시:
    - `2024-03-04T00:00:00Z` → UTC
    - `2024-03-04T09:00:00+09:00` → KST (UTC+9)

## JavaScript에서 시간 변환 방법

**1. 현재 시간 구하기**

```js
const now = new Date();
console.log(now); // 현재 로컬 시간
console.log(now.toISOString()); // ISO 8601 형식 (UTC 기준)
console.log(now.toUTCString()); // UTC 기준 문자열
console.log(now.toLocaleString()); // 사용자의 로컬 시간 기준
```

**2. UTC ↔ KST 변환**

- UTC → KST 변환
```js
const utcDate = new Date();
const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

console.log(utcDate.toISOString()); // UTC 기준
console.log(kstDate.toISOString()); // KST 기준
console.log(kstDate.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })); // 한국 시간
```

- KST → UTC 변환

```js
const kstToUtc = (kstDateString) => {
  const kstDate = new Date(kstDateString);
  return new Date(kstDate.getTime() - 9 * 60 * 60 * 1000);
};

console.log(kstToUtc("2024-03-04T09:00:00+09:00")); // UTC 변환
```

**3. 특정 시간대를 적용한 변환**

`Intl.DateTimeFormat`은 JavaScript에서 날짜와 시간을 특정한 형식과 시간대로 변환하는 표준 객체이다.

```js
const date = new Date();

// 현재 시간을 사용자의 로컬 시간대로 표시
console.log(new Intl.DateTimeFormat().format(now)); // 예: 3/5/2024 (MM/DD/YYYY, 지역 설정에 따라 다름)

// UTC → 한국 시간 변환
console.log(
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "full", timeStyle: "long" }).format(date)
);

// UTC → 뉴욕 시간 변환 (EST)
console.log(
  new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" }).format(date)
);
```

**4. Unix Timestamp 변환**

- Timestamp → Date 변환

```js
const timestamp = 1709558400000; // 밀리초 단위
const dateFromTimestamp = new Date(timestamp);
console.log(dateFromTimestamp.toISOString()); // ISO 형식 변환
```

- Date → Timestamp 변환

```js
const date = new Date();
console.log(date.getTime()); // 밀리초 단위 타임스탬프
console.log(Math.floor(date.getTime() / 1000)); // 초 단위 타임스탬프
```

