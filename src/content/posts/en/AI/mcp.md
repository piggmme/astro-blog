---
title: "Let's build an MCP server. (with Typescript SDK)"
pubDate: 2025-5-19
description: 'An example of building an MCP server based on the Typescript SDK'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["AI"]

---

## The limitations of LLMs and Function Calling, and the birth of MCP (Model Context Protocl)

LLMs (large language models) are models optimized for generating unstructured text, such as natural language understanding and generation, but **they have limitations in performing explicit tasks (deterministic operations) like external API calls, file I/O, and state-based computation**.
To make up for this, OpenAI introduced the **Function Calling** feature, a mechanism where, if you define a function schema (schema) in JSON when making a Chat Completions API request, the model returns its intent to call it in the function_call field.

```json
// Function Calling example
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

However, the Function Calling approach

- Scalability: schema definitions and calling logic differ from one API provider to another
- Interoperability: the list of available functions can't be discovered automatically at runtime

had limitations in terms of scalability and interoperability (interoperability), as above.

### The birth of MCP

**Model Context Protocol (MCP)** is an open protocol based on JSON-RPC 2.0 that standardizes tool discovery (tools/list) and invocation (tools/call), error handling, and even authentication/authorization management, to overcome these limitations.

- Listing MCP tools

```json
// MCP example: listing tools
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

- Calling an MCP tool

```json
// MCP example: calling a tool
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

### Advantages of MCP

- Tool discovery and invocation are unified under a consistent interface
- Authentication/authorization, error and cancellation handling are supported at the protocol level
- Can be implemented over various transports (HTTP, WebSocket, etc.) and languages (Node.js, Python, etc.)
- Multiple microservices or external APIs can be integrated all at once with LLM agents
- Tool lists can be dynamically queried and called in automation pipelines

By adopting MCP like this, you can go beyond Function Calling's single function calls and build a scalable, standardized LLM tool integration environment.

## Understanding MCP's architecture

<img alt="MCP architecture" src="/images/mcp_example.png" />

> Source: https://modelcontextprotocol.io/introduction#general-architecture

This diagram shows an architecture where LLM tools like Claude Desktop or an IDE **act as MCP clients**, communicating with various MCP servers so they can make use of local or external data.

1. Host with MCP Client
- e.g.: Claude Desktop, VS Code plugins, AI-based tools
- Role: a client that understands the MCP protocol, and the user interface
- Characteristics:
    - Maintains 1:1 connections with one or more MCP servers
    - Requests the tool list from servers, or calls specific tools

2. MCP Server A, B, C
- Role: lightweight servers that provide specific functionality (tools, data access, etc.)
- Characteristics:
    - Each MCP server provides its own unique tools (tool)
    - Communicates via JSON-RPC methods like tools/list, tools/call
    - Connected to resources like the following:
        - Server A, B → local data (e.g.: files, SQLite, etc.)
        - Server C → external web APIs (e.g.: weather API, GPT, Google API, etc.)

3. Local Data Source A / B
- Local resources the MCP server can access
    - e.g.: the /Users/hee/documents/note.txt file
    - e.g.: the sqlite://chat-history.db database
- For security, accessible only within the computer the MCP server runs on

4. Remote Service C
- Internet-based APIs the MCP server accesses over the external network
    - e.g.: OpenWeather, GitHub, Notion, Slack
- MCP Server C proxies or wraps these external APIs and exposes them via the MCP protocol

### Example of how MCP works

When you ask Claude Desktop `"Summarize the contents of my recent note file"`

1. Claude Desktop (the host) acts as the MCP client

2. It requests the tool list from the local MCP Server A via tools/list
    → finds the "readFile" and "summarizeText" tools

3. It calls readFile(path: string) with a tools/call request
    → receives the note file's text as the result

4. If needed, Claude calls the summarizeText(text: string) tool on the same server or on another MCP Server B to do the summarization


### MCP Core

MCP (Model Context Protocol) is "a communication protocol that provides context (context) and functionality (functionality) to LLMs in a safe and structured way," and it provides the following features.

- `Tools`: operations that execute and cause side effects (similar to REST's POST) - e.g.: calculations, API calls
```ts
server.tool(
  "fetch-weather",
  { city: z.string() },
  async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    const data = await response.text();
    return {
      content: [{ type: "text", text: data }]
    };
  }
);
```

- `Resources`: provide static information (similar to REST's GET) - e.g.: files, profiles, DB schemas
```ts
server.resource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  async (uri, { userId }) => ({
    contents: [{
      uri: uri.href,
      text: `Profile data for user ${userId}`
    }]
  })
);
```

- `Prompts`: user-defined prompt templates - help the LLM interact effectively with the MCP server

```ts
server.prompt(
  "review-code",
  { code: z.string() },
  ({ code }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please review this code:\n\n${code}`
      }
    }]
  })
);
```


### Advantages of MCP

- Security: local file access is done by MCP Server A, and Claude doesn't see the files directly
- Flexibility: you can create as many MCP servers as you want and split them by feature
- Standardization: all communication is unified on JSON-RPC 2.0
- Scalability: anything—cloud APIs, local DBs, third-party tools, etc.—can be wrapped as an MCP server

## Building an MCP server with the TypeScript SDK

`modelcontextprotocol/typescript-sdk` is the official SDK made so you can easily use and implement the **Model Context Protocol (MCP)** in a TypeScript/JavaScript environment.

This SDK implements the full MCP specification in a TypeScript environment, and supports the following tasks.

- Building MCP servers: define tools (tools), resources (resources), and prompts (prompts), and handle client requests according to the MCP protocol
- Writing MCP clients: connect to MCP servers and perform interactions such as calling tools and requesting resources
- Support for various transports: local and network-based communication via stdio, streamable HTTP, SSE, etc.

1. First, create the MCP server project.

```sh
mkdir my-mcp-server
cd my-mcp-server
```

2. Initialize npm and install the required packages.

```sh
npm init
npm install @modelcontextprotocol/sdk zod
npm install --save-dev typescript @types/node ts-node-dev
```

3. Create a `src` folder and create an `index.ts` file.

```sh
mkdir src
touch src/index.ts
```

4. Modify the contents of `package.json` as below.

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

5. Add a `tsconfig.json` file.

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

6. Write the following code in `src/index.ts`.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create the MCP server
const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0"
});

// Addition tool example
server.tool("add",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: `answer: ${String(a + b)}` }]
  })
);

// Age calculation tool example
server.tool("calculate-age",
  { birth: z.number() },
  async ({ birth }) => ({
    content: [{ type: "text", text: `answer: ${String(new Date().getFullYear() - birth)}` }]
  })
);

// dev_hee's age tool example
server.tool("age-of-dev-hee", "dev_hee의 나이", async () => ({
  content: [{ type: "text", text: `26` }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

7. Build the TypeScript code to generate `dist/index.js`.

```sh
npm run build
```

8. You can debug the MCP server under development with the MCP Inspector.

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

- Click the `Connect` button to connect the MCP server and the inspector.
- Clicking `List Tools` shows the list of tools you created. Clicking a tool name in the tool list lets you enter values and try running it.

<img alt="MCP inspector" src="/images/mcp_inspector.png" />

9. Shut down the inspector you ran.

10. After checking that Claude desktop is installed, open the config file with the following command and edit it. You need to write the absolute path of the built `dist/index.js` file.

```sh
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

```json
{
    "mcpServers": {
        "my-mcp-server": {
            "command": "node",
            "args": [
                "/ABSOLUTE/PATH/TO/PARENT/FOLDER/my-mcp-server/dist/index.js"
            ]
        }
    }
}
```

11. If you restart Claude desktop, you can see that the MCP is connected.

- The MCP server is connected

<img src="/images/mcp_connected.png" alt="mcp connection" />

- A confirmation modal appears before Claude Desktop accesses the MCP server

<img src="/images/mcp_connected2.png" alt="mcp connection" />

- It generates a response using the data received from the MCP server tool

<img src="/images/mcp_claude_example.png" alt="mcp example" />

### Troubleshooting

<img src="/images/mcp_error.png" alt="mcp error" />

The MCP server kept failing to connect. When I opened the log folder and checked the logs, I could see that a problem related to Node.js ES module syntax was occurring, as below.

```text
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
       ^

SyntaxError: Unexpected token {
    at Module._compile (internal/modules/cjs/loader.js:723:23)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:789:10)
    at Module.load (internal/modules/cjs/loader.js:653:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:593:12)
    at Function.Module._load (internal/modules/cjs/loader.js:585:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:831:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:623:3)
```

Referring to the [typescript-sdk issue: base mcp example weather doesn't work in my local machine](https://github.com/modelcontextprotocol/typescript-sdk/issues/375) issue, the problem was that Claude Desktop was using one of the old node versions installed locally rather than the latest version of node.

I'm using `nvm`, so after deleting the node versions 16 and below, I could confirm it worked properly.

```zsh
nvm uninstall 10.24.1 && nvm uninstall 12.22.12 && nvm uninstall 15.14.0 && nvm uninstall 16.15.1 && nvm uninstall 16.18.1
```

