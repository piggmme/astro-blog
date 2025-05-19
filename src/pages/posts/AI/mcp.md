---
title: 'MCP 서버를 만들어보자. (with Typescript SDK)'
layout: ../_MarkdownPostLayout.astro
pubDate: 2024-7-30
description: 'Typescript SDK를 기반으로 MCP 서버를 만드는 예제'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["AI"]

---

## LLM과 Function Calling의 한계점과 MCP(Model Context Protocl)의 탄생

LLM(대규모 언어 모델)은 자연어 이해·생성과 같은 비구조화된 텍스트 생성에 최적화된 모델이지만, **외부 API 호출이나 파일 I/O, 상태 기반 연산 등 명시적 작업(deterministic operation) 수행에는 제약**이 있다.
이를 보완하기 위해 OpenAI는 **Function Calling** 기능을 도입했는데, Chat Completions API 요청 시 함수 스키마(schema)를 JSON으로 정의하면 모델이 호출 의도를 function_call 필드로 반환하도록 하는 메커니즘이다.

```json
// Function Calling 예시
{
  "model": "gpt-4",
  "messages": [{ "role": "user", "content": "서울의 날씨 알려줘" }],
  "functions": [
    {
      "name": "getWeather",
      "description": "특정 도시의 현재 날씨를 반환",
      "parameters": {
        "type": "object",
        "properties": {
          "city": { "type": "string" }
        },
        "required": ["city"]
      }
    }
  ],
  "function_call": "auto"
}
```

하지만 Function Calling 방식은

- 확장성: 스키마 정의와 호출 로직이 API 제공사마다 제각각
- 상호 운용성: 런타임에 사용 가능한 함수 목록을 자동 탐색할 수 없음

위와 같이 확장성과 상호 운용성(interoperability) 측면에서 한계가 있었다.

### MCP틔 탄생

**Model Context Protocol(MCP)** 는 이런 한계를 극복하기 위해 JSON-RPC 2.0을 기반으로 도구 탐색 (tools/list)과 호출 (tools/call), 오류 처리, 인증·권한 관리까지 표준화한 오픈 프로토콜이다.

- MCP 도구 목록 조회

```json
// MCP 예시: 도구 목록 조회
// Request → POST /mcp
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      { "name": "readFile", "description": "파일 내용을 읽어옵니다" },
      { "name": "getWeather", "description": "도시별 날씨 조회" }
    ]
  }
}
```

- MCP 도구 호출

```json
// MCP 예시: 도구 호출
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "getWeather",
    "arguments": { "city": "서울" }
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": { "temperature": "22°C", "condition": "맑음" }
}

```

### MCP의 장점

- 도구 탐색·호출이 일관된 인터페이스로 통합
- 인증·권한, 오류·취소 처리까지 프로토콜 차원에서 지원
- 다양한 전송(HTTP, WebSocket 등)·언어(Node.js, Python 등)로 구현 가능
- 여러 마이크로서비스나 외부 API를 LLM 에이전트로 일괄 연동 가능
- 자동화 파이프라인에서 도구 목록을 동적으로 조회하고 호출 가능

이처럼 MCP를 도입하면 Function Calling의 단일 함수 호출을 넘어, 확장 가능하고 표준화된 LLM 도구 연동 환경을 구축할 수 있다.

## MCP의 구조 이해하기

<img alt="MCP 구조" src="/images/mcp_example.png" />

> 출처: https://modelcontextprotocol.io/introduction#general-architecture

이 다이어그램은 Claude Desktop이나 IDE 같은 LLM 도구가 **MCP 클라이언트 역할**을 하여 다양한 MCP 서버들과 통신하며 로컬 또는 외부 데이터를 활용할 수 있는 아키텍쳐를 보여준다.

1. Host with MCP Client
- 예: Claude Desktop, VS Code 플러그인, AI 기반 툴
- 역할: MCP 프로토콜을 이해하는 클라이언트이자 사용자 인터페이스
- 특징:
    - 하나 이상의 MCP 서버와 1:1 연결을 유지
    - 서버로부터 도구 목록을 요청하거나, 특정 도구를 호출

2. MCP Server A, B, C
- 역할: 특정 기능(도구, 데이터 접근 등)을 제공하는 경량 서버
- 특징:
    - 각 MCP 서버는 고유한 도구(tool)를 제공함
    - tools/list, tools/call 같은 JSON-RPC 메서드로 통신
    - 다음과 같은 리소스와 연결됨:
        - Server A, B → 로컬 데이터 (예: 파일, SQLite 등)
        - Server C → 외부 웹 API (예: 날씨 API, GPT, Google API 등)

3. Local Data Source A / B
- MCP 서버가 접근할 수 있는 로컬 자원
    - 예: /Users/hee/documents/note.txt 파일
    - 예: sqlite://chat-history.db 데이터베이스
- 보안상 MCP 서버가 동작하는 컴퓨터 안에서만 접근 가능

4. Remote Service C
- MCP 서버가 외부 네트워크를 통해 접근하는 인터넷 기반 API
    - 예: OpenWeather, GitHub, Notion, Slack
- MCP Server C는 이 외부 API를 프록시하거나 래핑하여 MCP 프로토콜로 노출

### MCP 작동 흐름 예시

Claude Desktop에서 `"최근 노트 파일 내용 요약해줘"`라고 요청한 경우

1. Claude Desktop(호스트)는 MCP 클라이언트 역할

2. 로컬의 MCP Server A에 tools/list를 통해 도구 목록을 요청
    → "readFile", "summarizeText" 도구 확인

3. tools/call 요청으로 readFile(path: string)을 호출
    → 결과로 노트 파일의 텍스트를 받음

4. 필요하다면 Claude가 summarizeText(text: string) 도구를 같은 서버나 다른 MCP Server B에 호출하여 요약 진행


### MCP의 구성요소

MCP(Model Context Protocol)는 "LLM에게 문맥(context)과 기능(functionality)을 안전하고 구조화된 방식으로 제공하는 통신 프로토콜"로, 다음과 같은 구성 요소로 이루어져야한다.

- `Resources`: 정적인 정보 제공 (REST의 GET 유사) - 예: 파일, 프로필, DB 스키마
- `Tools`: 실행 및 부작용 유발 작업 (REST의 POST 유사) - 예: 계산, API 호출
- `Prompts`: 사용자 정의 프롬프트 템플릿 - LLM에게 작업 문맥을 주는 고급 구성요소

### MCP의 장점

- 보안성: 로컬 파일 접근은 MCP Server A가 하고, Claude는 직접 파일을 보지 않음
- 유연성: MCP 서버를 원하는 만큼 만들고, 기능 단위로 나눌 수 있음
- 표준화: 모든 통신이 JSON-RPC 2.0 기반으로 통일되어 있음
- 확장성: 클라우드 API, 로컬 DB, 서드파티 도구 등 어떤 것도 MCP 서버로 래핑 가능

## TypeScript SDK 를 사용한 MCP 서버 구축하기

`modelcontextprotocol/typescript-sdk`는 **Model Context Protocol (MCP)** 를 TypeScript/JavaScript 환경에서 쉽게 사용하고 구현할 수 있도록 만들어진 공식 SDK이다.

이 SDK는 MCP의 전체 사양을 TypeScript 환경에서 구현하며, 다음과 같은 작업을 지원한다.

- MCP 서버 구축: 도구(tools), 리소스(resources), 프롬프트(prompts)를 정의하고 MCP 프로토콜에 따라 클라이언트 요청을 처리
- MCP 클라이언트 작성: MCP 서버에 연결하고, 도구 호출 및 리소스 요청 등의 상호작용 수행
- 다양한 트랜스포트 지원: stdio, streamable HTTP, SSE 등을 통해 로컬 및 네트워크 기반 통신

1. 먼저 MCP 서버 프로젝트를 생성한다.

```sh
mkdir my-mcp-server
cd my-mcp-server
```

2. npm을 초기화하고 필요한 패키지들을 설치한다.

```sh
npm init
npm install @modelcontextprotocol/sdk zod
npm install --save-dev typescript @types/node ts-node-dev
```

3. `src` 폴더를 만들고, `index.ts` 파일을 생성한다.

```sh
mkdir src
touch src/index.ts
```

4. `package.json` 의 내용을 아래과 같이 수정한다.

```json
{
  // ...
  "main": "dist/index.js",
  "type": "module",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev --esm --respawn src/index.ts",
    "build": "tsc",
  },
  // ...
}
```

5. `tsconfig.json` 파일을 추가한다.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

6. `src/index.ts` 에 아래와 같은 코드를 작성한다.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// MCP 서버 생성
const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0"
});

// 덧셈 도구 예제
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: `answer: ${String(a + b)}` }]
  })
);

// 나이 계산 도구 예제
server.tool("calculate-age",
  { birth: z.number() },
  async ({ birth }) => ({
    content: [{ type: "text", text: `answer: ${String(new Date().getFullYear() - birth)}` }]
  })
);

// dev_hee의 나이 도구 예제
server.tool("age-of-dev-hee", "dev_hee의 나이", async () => ({
  content: [{ type: "text", text: `26` }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

7. 타입스크립트 코드를 빌드하여 `dist/index.js`를 생성한다.

```sh
npm run build
```

8. MCP Inspector 를 통해 개발 중인 MCP 서버를 디버깅할 수 있다.

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

- `Connect` 버튼을 클릭해 MCP 서버와 인스펙터를 연결한다.
- `List Tools`를 클릭하면 생성한 도구 리스트를 볼 수 있다. 도구 목록 중에 도구 이름을 클릭하면 값을 입력하여 실행해 볼 수 있다.

<img alt="MCP inspector" src="/images/mcp_inspector.png" />

9. 실행한 인스펙터를 종료한 한다.

10. Claude 데스크탑이 설치되어 있는지 확인 한 뒤, 다음과 같은 명령어로 설정파일을 열어서 수정한다. 빌드된 `dist/index.js` 파일의 절대 주소를 작성해야 한다.

```sh
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

```json
{
    "mcpServers": {
        "my-mcp-server": {
            "command": "node",
            "args": [
                "/ABSOLUTE/PATH/TO/PARENT/FOLDER/weather/build/index.js"
            ]
        }
    }
}
```

11. Claude 데스크탑을 재실행하면 MCP가 연결된 것을 확인할 수 있다. 

<img src="/images/mcp_claude_example" alt="mcp 예시" />