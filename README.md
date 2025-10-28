# mcp-chatgpt

TypeScript MCP server with an Express HTTP surface, auto-discovered React-based MCP resources, and a small tool system powered by Zod schemas. Ships JSON-RPC over HTTP (StreamableHTTP) for multi-client compatibility.

## Overview of the architecture
- MCP core: `src/index.ts` instantiates `McpServer` and exposes StreamableHTTP endpoints via Express.
- Tool system: Zod-typed tools are registered through a `ToolRegistry` abstraction.
- Resource system: Static resources plus auto-discovered TypeScript/React resources using a factory that bundles and serves HTML snippets.
- Front-end resources: React `.tsx` entries under `src/ts-resources/` are bundled with esbuild and returned as HTML via MCP resources. They read tool output using lightweight hooks.
- HTTP surface: `/mcp` (JSON-RPC, SSE), `/health`, `/info`, and static `/assets`.

## Runtime dependencies
- @modelcontextprotocol/sdk: MCP server, types, and StreamableHTTP transport
- express, cors: HTTP endpoints and CORS for web clients
- zod: schema validation for tool I/O
- react, react-dom: render interactive MCP resources
- embla-carousel-react: carousel UI for hotel cards
- mapbox-gl: interactive map MCP resource
- react-router-dom: client-side routing inside resources
- clsx: conditional class names

Dev/build tooling
- typescript, tsx: TS compilation and dev watch
- esbuild: bundles each `src/ts-resources/*.tsx` into `dist/ts-resources-bundles/*.js`
- tailwindcss, @tailwindcss/cli, postcss, autoprefixer: styles for resource UIs
- eslint (+ @typescript-eslint, prettier): linting/formatting
- concurrently: parallel dev processes (server, bundler, CSS watcher)

## How the MCP server is implemented
- `src/index.ts` constructs `new McpServer({ name, version }, { capabilities: { tools: {}, resources: {} }})`.
- Express sets up:
  - `/mcp` with `StreamableHTTPServerTransport` per request (POST for JSON-RPC; GET for SSE; DELETE to end sessions)
  - `/health` and `/info` for diagnostics
  - `/assets` to serve compiled CSS
- Tools and resources are registered through registries which wrap SDK `registerTool` and `registerResource`.

## Interaction with @modelcontextprotocol/sdk
- Tools: `mcpServer.registerTool(name, config, impl)` where config includes descriptions and optional `inputSchema`/`outputSchema` (Zod shapes). The `ToolRegistry` validates inputs with Zod and returns `CallToolResult`.
- Resources: `mcpServer.registerResource(name, uri, annotations, readImpl)`; the `ResourceRegistry` turns returned `text` or `blob` into MCP-compliant `contents`.
- Transport: `StreamableHTTPServerTransport` is created per request to avoid ID collisions across clients; `transport.handleRequest(req, res, body)` handles JSON-RPC and SSE.

## Adding a tool
1) Create a file under `src/tools/instances/` implementing `ToolDefinition` with Zod schemas.
2) Export the tool and add it to `availableTools` in `src/tools/index.ts`.
3) The server auto-registers all tools at startup.

Example skeleton:
```ts path=null start=null
import { z } from 'zod';
import { ToolDefinition } from '../types.js';

const inputSchema = { q: z.string().describe('query') };
const outputSchema = { ok: z.boolean() };

async function implementation(args: { q: string }) {
  return { content: [{ type: 'text', text: `You searched for: ${args.q}` }], structuredContent: { ok: true } };
}

export const myTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  config: {
    name: 'my-tool',
    description: 'Does a thing',
    inputSchema,
    outputSchema,
  },
  implementation,
};
```
Then add to `availableTools` in `src/tools/index.ts`.

## Adding a resource
There are two paths:

- Static resources
  - Create `src/resources/instances/your-resource.ts` that returns `{ text: string }` or `{ blob: base64 }`.
  - Add it to `getAvailableResources()` in `src/resources/index.ts` (the `staticResources` array).

- TypeScript/React resources (auto-discovered)
  - Drop a `.ts` or `.tsx` file in `src/ts-resources/`.
  - Optionally add metadata in a leading comment block:
    - `@mcp-name: "Display Name"`
    - `@mcp-description: "What it shows"`
    - `@mcp-uri: "custom-uri"`
  - It will be bundled and exposed automatically as `dbk-ts://<uriId>?salt=<salt>`.

## Auto-detection of React resources
- Discovery: `src/resources/typescript-auto-discovery.ts` scans `src/ts-resources/` for `.ts/.tsx`, reads optional `@mcp-*` metadata, and creates resources via the factory.
- Bundling: `scripts/build-ts-resources.mjs` uses esbuild to emit `dist/ts-resources-bundles/<name>.js` (one bundle per entry).
- Serving: `src/resources/typescript-resource-factory.ts` reads the bundle and inlines Tailwind CSS into minimal HTML returned as the resource body (`mimeType: 'text/html+skybridge'`).
- Cache-busting: Each URI includes a `salt` from `TS_SALT` or app start time (`createSaltedUri()`), ensuring fresh loads when output templates change.
- React hooks: `src/shared/open-ai-globals.ts` exposes `useToolOutput`, `useMaxHeight`, and `useDisplayMode` by reading a `window.openai` global updated by the host; components inside resources can render against live tool output.

## TypeScript resource salt (cache-busting)
The “salt” is appended to TypeScript resource URIs as a query param, for example: `dbk-ts://carousel?salt=<value>`. Changing the salt forces clients to reload the HTML/JS so you don’t serve stale bundles.

- Source of truth: `initializeUrlSalt()` in `src/resources/typescript-resource-factory.ts`.
  - If `TS_SALT` is set, that value is used.
  - Otherwise, the salt defaults to the server start timestamp.
- Where it’s used: `createSaltedUri(id)` generates salted URIs for resources and output templates (e.g., a tool can return `dbk-ts://carousel?...`).
- Why set `TS_SALT`:
  - Deterministic URIs per release (stable across restarts).
  - Consistent URIs across multiple replicas behind a load balancer.
  - Intentional cache busts when you deploy new UI bundles.
- Recommended values: a deploy/version identifier such as a Git SHA, release tag, or a timestamp you control.

Examples
```sh path=null start=null
# Stable per-deploy using the short Git SHA
TS_SALT=$(git rev-parse --short HEAD) pnpm start

# Explicit version string
TS_SALT=v1.2.3 pnpm start

# One-off cache bust
TS_SALT=$(date +%s) pnpm start
```
Notes
- If `TS_SALT` is unset, restarting the server changes the salt (new URIs), which is convenient in local dev.
- In multi-instance deployments, set the same `TS_SALT` on all instances to avoid mismatched URIs being advertised.

## Build process
- `pnpm build` runs:
  - `tsc` to `dist/`
  - `node scripts/build-ts-resources.mjs` to create `dist/ts-resources-bundles/*.js`
  - Tailwind CLI to produce `dist/assets/tailwind.css`
- `pnpm dev` runs server (tsx watch), esbuild watch for `src/ts-resources`, and Tailwind watcher in parallel.

Useful scripts:
```sh path=null start=null
pnpm install
pnpm run dev         # dev server + ts-resource bundler + css watcher
pnpm run build       # tsc + bundle ts-resources + build CSS
pnpm start           # run built server (dist/index.js)
pnpm run lint        # lint
pnpm run lint:fix    # auto-fix
pnpm run format      # format code
pnpm run format:check
```

## Deployment
- Build once: `pnpm run build`.
- Run the server: `PORT=3000 TS_SALT=$(date +%s) pnpm start`.
- Expose `/mcp` (POST for JSON-RPC, GET for SSE, DELETE to end sessions), `/health`, `/info`, and `/assets`.
- Set `TS_SALT` to a stable value per release if you want deterministic resource URIs across restarts.
- Production hardening: restrict CORS, run behind a reverse proxy, manage logs on stderr, and secure any third‑party API tokens (e.g., Mapbox) via environment variables.

## How resources and tools connect
- Tools can hint a display template via OpenAI `_meta`. Example: `openai/outputTemplate` returns a salted `dbk-ts://carousel` URI, prompting compatible clients to render the React resource using the tool’s `structuredContent`.
- React resources use `useToolOutput()` to read tool output and render UI (carousels, maps, etc.).

## HTTP endpoints
- `GET /health` → `{ status, timestamp }`
- `GET /info` → `{ name, version, tools, resources, transport, endpoints }`
- `/mcp` → StreamableHTTP JSON-RPC endpoint
  - `POST /mcp` JSON-RPC
  - `GET /mcp` Server‑Sent Events
  - `DELETE /mcp` session termination

## Directory layout
```text path=null start=null
src/
  index.ts                        # MCP + Express server
  tools/                          # Tool types, registry, instances
  resources/                      # Resource types, registry, factory, discovery
    typescript-resource-factory.ts
    typescript-auto-discovery.ts
    instances/hello-world.ts
  ts-resources/                   # React/TS entries (auto-discovered)
    carousel.tsx
    map.tsx
  components/, shared/, directbooker/
scripts/
  build-ts-resources.mjs          # esbuild bundler
  watch-ts-resources.mjs          # esbuild watch for dev
dist/
  ts-resources-bundles/*.js       # built bundles (generated)
  assets/tailwind.css             # built CSS (generated)
```

## Configuration and environment
- `PORT`: HTTP port (default 3000)
- `TS_SALT`: cache-busting salt for TypeScript resource URIs; optional but recommended for stable releases
- Third‑party API keys: configure via env vars; do not hard‑code tokens in source

## Notes worth calling out
- Logging goes to stderr to avoid MCP stdout interference.
- Per-request transports enable multiple concurrent clients without JSON-RPC ID collisions.
- Zod schemas document and validate tool inputs/outputs, returning clear error content on validation failure.
