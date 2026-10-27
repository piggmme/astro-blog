---
title: 'TPS Testing with k6'
pubDate: 2025-3-18
description: 'TPS testing with k6'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["FrontEnd"]

---

## Why we ran load tests

At work, we were migrating an existing React-based SPA service to SSR using Astro.
Since we were deploying Astro to a Kubernetes environment, we had to decide how much server resources to allocate before deploying to production.
So we decided to use k6 to apply a load similar to the real production environment and determine the amount of resources that could run stably with the minimum resources.

## What is K6

K6 is an open-source load testing tool developed by Grafana Labs.

1. **Modern JavaScript-based**
   - Supports ES6+ syntax
   - Supports a module system
   - Can use npm packages

2. **Lightweight and efficient**
   - Written in Go, so it's resource-efficient
   - Simple to run via CLI
   - Docker support

Along with the features above, and most importantly, because test code can be written in JavaScript, we ended up using k6 to load test our internal service.

## Features supported by k6

### HTTP request testing

You can send HTTP requests as below. You can also customize the request header values.

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

### Various test scenarios

k6 provides various test scenarios, as below.

1. VU (Virtual USers) based testing

- Tests based on the number of concurrent users.
- Each VU runs the scenario independently.
- Adjusts the number of users in stages.
- Similar to real user behavior patterns.
- Suitable for simulating real user experience, scalability testing, and long-duration load testing.

```javascript
export const options = {
  stages: [
    { duration: '1m', target: 200 }, // ramp up to 200 users over 1 minute => ramp-up
    { duration: '2m', target: 200 }, // hold 200 users for 2 minutes => hold
    { duration: '1m', target: 500 }, // ramp up to 500 users over 1 minute
    { duration: '2m', target: 500 }, // hold 500 users for 2 minutes
    { duration: '1m', target: 1000 }, // ramp up to 1000 users over 1 minute
    { duration: '2m', target: 1000 }, // hold 1000 users for 2 minutes
    { duration: '1m', target: 500 }, // ramp down to 500 users over 1 minute
    { duration: '2m', target: 0 }, // ramp down to 0 over 2 minutes
  ],
}
```

2. RPS (Requests Per Second) based testing

- Tests based on the number of requests per second.
- Maintains a constant request rate.
- VUs act as resources for handling requests.
- Suitable for measuring API performance, system throughput limits, and consistent load testing.

```js
export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 7,           // requests per second
      timeUnit: '1s',    // per 1 second
      duration: '1m',    // test for 1 minute
      preAllocatedVUs: 50,
    }
  }
}
```

| Category | VU-based | RPS-based |
|------|---------|----------|
| Purpose | Simulating concurrent users | Throughput testing |
| What's controlled | Number of active users | Requests per second |
| Load pattern | Staged changes | Held at a constant level |
| Actual number of requests | Variable | Fixed |
| System impact | Gradual | Immediate |


### Test validation

With `check`, you can specify whether the result passes the test.

```js
check(res, {
  'status is 200': (r) => r.status === 200,
  'response time < 500ms': (r) => r.timings.duration < 500,
  'body contains data': (r) => r.body.includes('expected-text'),
});
```

### Performance measurement results

k6 test results are output in the following format.

1. Basic metrics output

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

2. Explanation of key metrics

- Request-related metrics
    - `http_req_duration`: total request processing time
    - `http_req_waiting`: time spent waiting for the server response
    - `http_reqs`: requests per second

- Data-related metrics
    - `data_received`: amount of data received
    - `data_sent`: amount of data sent

- VU (Virtual User) related metrics
    - `vus`: current number of active users
    - `vus_max`: maximum number of users

- Check results
    ```plaintext
        ✓ status is 200................: 100.00% ✓ 14  ✗ 0
        ✓ content is html..............: 100.00% ✓ 14  ✗ 0
        ✓ response time < 500ms........:  95.00% ✓ 13  ✗ 1
        ✓ initial state has loaded.....: 100.00% ✓ 14  ✗ 0
    ```

3. Detailed statistics

For each metric:
- `avg`: average
- `min`: minimum
- `med`: median
- `max`: maximum
- `p(90)`: 90th percentile
- `p(95)`: 95th percentile

4. Visualization options

For more detailed analysis, you can run it with commands like the following:

```bash
# Output in JSON format
k6 run --out json=test.json home.js

# Output in CSV format
k6 run --out csv=test.csv home.js

# Send data to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 home.js
```

## Testing locally by injecting an auth cookie

We had to inject an auth cookie into the request headers for the service under test.
We did this by logging into the actual web app, extracting the cookie values from the Application tab of the browser's developer tools, storing them in the `.env` environment variables, and injecting them into the headers on every test.

To verify the auth info was valid, the initial test was set to run only once by setting the `options` value to a single run.

```js
/* eslint-disable no-undef */
import http from 'k6/http'
import { check, sleep } from 'k6'

// ⭐️ Initial run test
export const options = {
  vus: 1, // 1 virtual user
  iterations: 1, // run once
}

const U_TOKEN_VALUE = __ENV.U_TOKEN_VALUE
const U_TOKEN_EXP_VALUE = __ENV.U_TOKEN_EXP_VALUE

export default function home () {
  // ✅ Build the cookie header
  const cookieHeader = [
    `u_token=${U_TOKEN_VALUE}; Secure; HttpOnly`,
    `u_token_exp=${U_TOKEN_EXP_VALUE};`,
  ].join('; ')

  const headers = {
    Cookie: cookieHeader,
  }

  // ✅ Inject the cookie into the header and send a GET request
  const res = http.get('https://test.com', { headers })

  // ✅ Check the response status code (200)
  check(res, {
    'status is 200': r => r.status === 200,
    'content is html': r => r.headers['Content-Type'].includes('text/html'),
    'response time < 500ms': r => r.timings.duration < 500,
  })

  // ✅ Check some text of the HTML in the response
  check(res, {
    'body contents loaded': r => checkBody(r.body),
  })

  // Wait time between requests (random wait)
  sleep(random())
}

// Generate a random number between 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1
const random = () => Math.random() * 0.9 + 0.1
```

## Running the load test

We wanted to load test the Astro service that would support server-side rendering.

Our internal service's peak load is 8000 page views per 10 minutes. So roughly speaking, you can think of it as 800 page views per minute, or 13.3 page views per second.

So we ran the test with about 14 requests per second coming in, as below.
We determined the amount of resources that could run stably by adjusting the default number of pods and the amount of cpu and memory resources.
Running the test this way, it could be supported stably with 3 pods, 500m cpu, and 512Mi memory.

- `14 RPS`
```js
export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 14, // 14 requests per second (a value close to 13.33, rounded)
      timeUnit: '1s', // per 1 second
      duration: '1m', // test for 1 minute
      preAllocatedVUs: 50, // number of virtual users to pre-allocate
      maxVUs: 200, // maximum number of virtual users
    },
  },
}
```

To determine the minimum number of pods to handle cases where traffic could suddenly spike, we decided to raise the RPS further and run more tests.

For example, to test a case where 150 users per second rush in at once because of a mention notification, we wrote a 150 RPS test case like the one below.

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

However, because the backend server resources in the test environment were significantly lower than in production, many requests failed in the `100 RPS` load test. So we decided to first find the maximum requests per second a single pod could withstand, and then determine the server resources by calculation. The results were as follows.

- RPS tests in a `pods: 1, cpu: 500m, memory: 512Mi` environment
    - `10 RPS`: very stable, handled 100%
    - `12 RPS`: slightly slower but can handle 100%
    - `15 RPS`: failure rate increased due to overload

So we judged that a single pod could stably handle `12 RPS`, and were able to decide that **to handle up to `150 RPS`, we need `150/12 = 12.5` pods, i.e. 13 pods when rounded up**.
