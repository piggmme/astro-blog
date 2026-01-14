---
title: 'k6를 사용한 TPS 테스트'
pubDate: 2025-3-18
description: 'k6로 TPS 테스트'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["FrontEnd"]

---

## 부하 테스트를 진행하는 이유

사내에서 기존 리액트 기반의 SPA 서비스를 아스트로를 활용한 SSR으로 마이그레이션 하는 작업이 진행되었다.
아스트로를 쿠버네티스 환경에 배포하다 보니 운영 환경에 배포하기 전에 서버 자원을 얼마만큼 할당해야할지 결정해야했다.
따라서 k6를 사용하여 실제 운영 환경과 비슷한 부하를 주면서 최소한의 자원으로 안정적으로 운영이 가능한 자원의 개수를 정하기로 하였다.

## K6란

K6는 Grafana Labs에서 개발한 오픈 소스 부하 테스트 도구이다.

1. **현대적인 JavaScript 기반**
   - ES6+ 문법 지원
   - 모듈 시스템 지원
   - npm 패키지 사용 가능

2. **가볍고 효율적**
   - Go로 작성되어 리소스 효율적
   - CLI 기반으로 간단한 실행
   - Docker 지원

위와 같은 특징과 더불어 가장 중요하게도 JavaScript 기반으로 테스트 코드를 작성할 수 있기 때문에 k6를 사용해서 사내 서비스의 부하 테스트를 진행하게 되었다.

## k6 에서 지원하는 기능

### HTTP 요청 테스트

아래와 같이 HTTP 요청을 보낼 수 있다. 요청의 헤더 값도 커스텀할 수 있다.

```js
import http from 'k6/http';

export default function() {
  const headers = {
    Cookie: cookieHeader,
    // ...
  }
  const res = http.get('https://test.k6.io', { headers });
}
```

### 다양한 테스트 시나리오

k6는 아래와 같이 다양한 테스트 시나리오를 제공한다.

1. VU (Virtual USers) 기반 테스트

- 동시 접속자 수 기준으로 테스트한다.
- 각 VU는 독립적으로 시나리오를 실행한다.
- 단계별로 사용자 수를 조절한다.
- 실제 사용자 행동 패턴과 유사하다.
- 실제 사용자 경험 시뮬레이션, 확장성 테스트, 장기간 부하 테스트에 적합하다.

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 200 }, // 1분 동안 200명의 사용자로 증가 => 램프업
    { duration: '2m', target: 200 }, // 2분 동안 200명의 사용자 유지 => 유지
    { duration: '1m', target: 500 }, // 1분 동안 500명의 사용자로 증가
    { duration: '2m', target: 500 }, // 2분 동안 500명의 사용자 유지
    { duration: '1m', target: 1000 }, // 1분 동안 1000명의 사용자로 증가
    { duration: '2m', target: 1000 }, // 2분 동안 1000명의 사용자 유지
    { duration: '1m', target: 500 }, // 1분 동안 500명의 사용자로 감소
    { duration: '2m', target: 0 }, // 2분 동안 0명으로 감소
  ],
}
```

2. RPS (Requests Per Second) 기반 테스트

- 초당 요청 수 기준으로 테스트한다.
- 일정한 요청 속도 유지한다.
- VU는 요청 처리를 위한 리소스로 동작한다.
- API 성능 측정, 시스템 처리량 한계, 일관된 부하 테스트에 적합하다.

```js
export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 7,           // 초당 요청 수
      timeUnit: '1s',    // 1초 단위
      duration: '1m',    // 1분 동안 테스트
      preAllocatedVUs: 50,
    }
  }
}
```

| 구분 | VU 기반 | RPS 기반 |
|------|---------|----------|
| 목적 | 동시 사용자 시뮬레이션 | 처리량 테스트 |
| 제어 대상 | 활성 사용자 수 | 초당 요청 수 |
| 부하 패턴 | 단계적 변화 | 일정 수준 유지 |
| 실제 요청 수 | 가변적 | 고정 |
| 시스템 영향 | 점진적 | 즉각적 |


### 테스트 검증

`check` 를 통해서 결과값이 테스트를 통과 하는지 여부를 지정해줄 수 있다.

```js
check(res, {
  'status is 200': (r) => r.status === 200,
  'response time < 500ms': (r) => r.timings.duration < 500,
  'body contains data': (r) => r.body.includes('expected-text'),
});
```

### 성능 측정 결과

k6 테스트 결과는 다음과 같은 형식으로 출력된다.

1. 기본 메트릭스 출력

```plaintext
     data_received..................: 1.2 MB 89 kB/s
     data_sent......................: 450 B  33 B/s
     http_req_blocked...............: avg=28.06ms min=0s      med=0s      max=561.24ms p(90)=0s      p(95)=0s     
     http_req_connecting............: avg=13.94ms min=0s      med=0s      max=278.6ms  p(90)=0s      p(95)=0s     
     http_req_duration..............: avg=189ms   min=150.8ms med=182.5ms max=234.1ms  p(90)=220.5ms p(95)=227.3ms
     http_req_receiving.............: avg=28.86ms min=21.4ms  med=27.9ms  max=37.3ms   p(90)=35.1ms  p(95)=36.2ms 
     http_req_sending...............: avg=0s      min=0s      med=0s      max=0s       p(90)=0s      p(95)=0s     
     http_req_tls_handshaking.......: avg=0s      min=0s      med=0s      max=0s       p(90)=0s      p(95)=0s     
     http_req_waiting...............: avg=160.1ms min=129.4ms med=154.6ms max=196.8ms  p(90)=185.4ms p(95)=191.1ms
     http_reqs......................: 14     1.02758/s
     iteration_duration.............: avg=1.21s   min=1.15s   med=1.18s   max=1.79s    p(90)=1.22s   p(95)=1.5s   
     iterations.....................: 14     1.02758/s
     vus............................: 1      min=1    max=1
     vus_max.......................: 1      min=1    max=1
```

2. 주요 지표 설명

- 요청 관련 메트릭스
    - `http_req_duration`: 전체 요청 처리 시간
    - `http_req_waiting`: 서버 응답 대기 시간
    - `http_reqs`: 초당 요청 수

- 데이터 관련 메트릭스
    - `data_received`: 받은 데이터 양
    - `data_sent`: 보낸 데이터 양

- VU(Virtual User) 관련 메트릭스
    - `vus`: 현재 활성 사용자 수
    - `vus_max`: 최대 사용자 수

- 체크 결과
    ```plaintext
        ✓ status is 200................: 100.00% ✓ 14  ✗ 0
        ✓ content is html..............: 100.00% ✓ 14  ✗ 0
        ✓ response time < 500ms........:  95.00% ✓ 13  ✗ 1
        ✓ initial state has loaded.....: 100.00% ✓ 14  ✗ 0
    ```

3. 상세 통계 정보

각 메트릭에 대해:
- `avg`: 평균값
- `min`: 최소값
- `med`: 중간값
- `max`: 최대값
- `p(90)`: 90퍼센타일
- `p(95)`: 95퍼센타일

4. 시각화 옵션

더 자세한 분석을 위해 다음과 같은 명령어로 실행할 수 있다:

```bash
# JSON 형식으로 출력
k6 run --out json=test.json home.js

# CSV 형식으로 출력
k6 run --out csv=test.csv home.js

# InfluxDB로 데이터 전송
k6 run --out influxdb=http://localhost:8086/k6 home.js
```

## 인증 쿠키를 심어서 로컬에서 테스트하기

테스트할 서비스에서 요청 헤더에 인증 쿠키를 심어주어야 했다.
실제 웹앱으로 접속하여 브라우저의 개발자도구의 애플리케이션에서 쿠키 값을 추출하여 환경변수 `.env`에 저장하고, 테스트 때마다 헤더에 심어주는 방식으로 진행했다.

인증 정보가 유효한지 확인하기 위해 초기 테스트는 1번만 실행하도록 `options` 값을 1회 실행으로 지정해주었다.

```js
/* eslint-disable no-undef */
import http from 'k6/http'
import { check, sleep } from 'k6'

// ⭐️ 초기 실행 테스트
export const options = {
  vus: 1, // 1명의 가상 사용자
  iterations: 1, // 1회 실행
}

const U_TOKEN_VALUE = __ENV.U_TOKEN_VALUE
const U_TOKEN_EXP_VALUE = __ENV.U_TOKEN_EXP_VALUE

export default function home () {
  // ✅ 쿠키 헤더 만들기
  const cookieHeader = [
    `u_token=${U_TOKEN_VALUE}; Secure; HttpOnly`,
    `u_token_exp=${U_TOKEN_EXP_VALUE};`,
  ].join('; ')

  const headers = {
    Cookie: cookieHeader,
  }

  // ✅ 헤더에 쿠키를 심고 GET 요청 보내기
  const res = http.get('https://test.com', { headers })

  // ✅ 응답 상태 코드 확인 (200)
  check(res, {
    'status is 200': r => r.status === 200,
    'content is html': r => r.headers['Content-Type'].includes('text/html'),
    'response time < 500ms': r => r.timings.duration < 500,
  })

  // ✅ 응답에서 HTML의 일부 텍스트 확인
  check(res, {
    'body contents loaded': r => checkBody(r.body),
  })

  // 요청 간 대기 시간 (랜덤 대기)
  sleep(random())
}

// 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1 사이의 랜덤 숫자만들기
const random = () => Math.random() * 0.9 + 0.1
```

## 부하 테스트 진행하기

우리는 서버 사이드 렌더링을 지원할 아스트로 서비스의 부하 테스트를 진행하고자 하였다.

사내 서비스는 최대 부하가 10분당 8000번의 페이지뷰가 발생한다. 때문에 러프하게 생각하면 1분당 800번, 1초당 13.3번의 페이지뷰가 발생한다고 생각할 수 있다.

때문에 아래와 같이 초당 약 14번의 요청이 들어오도록 테스트를 진행하였다.
기본 파드 개수, cpu, memory 자원의 양을 조절해가면서 안정적으로 운영 가능한 자원의 양을 결정했다.
이렇게 테스트를 진행하니 파드3개, cpu는 500m, memory는 512Mi일 때가 안정적으로 지원 가능하였다.

- `14 RPS`
```js
export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 14, // 초당 14개의 요청 (13.33에 가까운 값, 반올림)
      timeUnit: '1s', // 1초 단위
      duration: '1m', // 1분 동안 테스트
      preAllocatedVUs: 50, // 미리 할당할 가상 유저 수
      maxVUs: 200, // 최대 가상 유저 수
    },
  },
}
```

갑작스럽게 트래픽이 몰릴 수 있는 경우를 대응하는 최소한의 파드의 갯수를 정하기 위하여 RPS를 더 올려서 테스트를 진행하기로 했다.

예를 들어, 멘션 알림 때문에 한번에 초당 150명의 유저가 몰리는 경우를 테스트 하기 위해서 아래와 같은 150 RPS 테스트 케이스를 작성했다.

- `150 RPS`
```js
export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 150,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 300,
      maxVUs: 2000,
    },
  },
}
```

하지만 테스트 환경에서 백엔드 서버의 자원이 운영 환경보다 현저히 부족한 관계로 `100 RPS` 부하 테스트에서 많은 요청들이 실패하였다. 때문에 1개의 파드가 최대한 버틸 수 있는 초당 요청 수를 먼저 구하고, 계산을 통해서 서버 자원을 정하기로 하였다. 결과는 다음과 같았다.

- `파드: 1, cpu: 500m, memory: 512Mi` 환경에서 RPS 테스트
    - `10 RPS`: 매우 안정적으로 100% 대응
    - `12 RPS`: 살짝 느려지지만 100% 대응 가능
    - `15 RPS`: 과부하 발생으로 실패율 증가

때문에 한 개의 파드는 `12 RPS` 를 안정적으로 수용할 수 있다고 판단하였고, **최대 `150 RPS` 를 감당하려면 `150/12 = 12.5`개, 즉 반올림하여 13개의 파드**가 필요하다고 결정할 수 있었다.
