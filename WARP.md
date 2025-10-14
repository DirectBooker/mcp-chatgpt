# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a TypeScript MCP (Model Context Protocol) server with Express integration. It provides both MCP tool capabilities via stdio transport and HTTP endpoints for health checks and service information. The server includes a sample tool called 'the-tool' that can be renamed and customized.

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- pnpm package manager
- TypeScript knowledge

### Installation
```bash
pnpm install
```

### Configuration
- Copy `.env.example` to `.env` and configure as needed
- Default HTTP server runs on port 3000 (configurable via PORT environment variable)

## Common Development Tasks

### Building the Project
```bash
pnpm run build
```

### Development Server
```bash
# Start in development mode with hot reload
pnpm run dev

# Start built version
pnpm start
```

### Linting and Formatting
```bash
# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format

# Check formatting
pnpm run format:check
```

### Other Useful Commands
```bash
# Clean build directory
pnpm run clean

# Build and prepare for distribution
pnpm run prepare
```

## Architecture Overview

### High-Level Structure
- **MCP Server**: Core Model Context Protocol server using stdio transport for tool communication
- **Express HTTP Server**: Provides REST endpoints for health checks and service information
- **Tool System**: Modular tool registration with Zod schema validation
- **Dual Transport**: Supports both MCP protocol (stdio) and HTTP REST endpoints simultaneously

### Key Components
- **MCPChatGPTServer class**: Main server class that orchestrates both MCP and Express servers
- **Tool Handlers**: MCP request handlers for `ListTools` and `CallTool` operations
- **Schema Validation**: Zod schemas for type-safe tool argument parsing
- **Express Middleware**: JSON parsing and basic route handling

### External Dependencies
- **@modelcontextprotocol/sdk**: Official MCP TypeScript SDK for server implementation
- **Express**: Web framework for HTTP endpoints
- **Zod**: Runtime type validation and schema definition

## Development Guidelines

### Code Organization
- All TypeScript source code goes in `src/`
- Tool schemas defined inline with Zod for type safety
- Each tool should have its own schema and execution method
- Use class-based architecture for server organization

### Code-submission guidelines
- Merging directly with `main` branch is not allowed.
- All changes should be merged via a github PR.
- All code should be formatted before commiting.
- All tests must pass before pushing a branch to github.

### Type Safety Guidelines
- **Strict TypeScript**: Project uses maximum strict type checking settings
- **No `any` allowed**: ESLint enforces error-level restrictions on `any` usage
- **Explicit types**: All function return types must be explicitly declared
- **Safe error handling**: Use `unknown` type for catch blocks, not `any`
- **Null safety**: Strict null checks enabled with optional chaining preferred
- **Modern ESLint**: Uses flat config format (eslint.config.js) with latest ESLint 9.x

### Adding New Tools
1. Define a Zod schema for tool arguments
2. Add tool definition to `ListToolsRequestSchema` handler
3. Add tool execution logic to `CallToolRequestSchema` handler
4. Create a private method for the tool's business logic

### HTTP Endpoints
- `/health`: Basic health check returning status and timestamp
- `/info`: Server information including available tools
- Port configurable via `PORT` environment variable (default: 3000)

### Error Handling
- Tool execution errors are caught and returned as MCP error responses
- Express server has graceful shutdown handling for SIGINT
- All async operations properly handle Promise rejections

### Debugging
- Server logs to stderr (MCP protocol uses stdout for communication)
- Express server logs include port information
- Tool execution results are JSON-formatted for easy inspection

## Adding TypeScript Files as MCP Resources

The project includes a framework for serving TypeScript files and their compiled JavaScript through MCP resources. This allows showcasing TypeScript features and compilation results.

**Factory Function**: The project uses `createTypeScriptResource()` to eliminate boilerplate code. Instead of writing 50+ lines of duplicate resource implementation code, you only need to provide 4 configuration parameters.

### Directory Structure
```
src/
├── ts-resources/              # TypeScript source files
│   ├── sample.tsx             # Basic TS features (classes, interfaces, generics)
│   └── sample2.tsx            # Advanced TS (async/await, enums, error classes)
└── resources/                 # MCP resource definitions
    └── typescript-auto-discovery.ts  # Auto-discovers TS files
```

### Adding New TypeScript Files (1 Step!)

**🎉 Auto-Discovery**: TypeScript files are now automatically discovered! Just add a `.ts` or `.tsx` file to `src/ts-resources/` and it will automatically become an MCP resource.

#### 1. Create TypeScript Source File (That's It!)
Create `src/ts-resources/yourfile.tsx` with TypeScript features:
```typescript
/**
 * Your TypeScript demonstration file
 * Showcase specific TS features you want to highlight
 * 
 * @mcp-name: "Your Display Name"
 * @mcp-description: "Detailed description of what this file demonstrates"
 * @mcp-uri: "custom-uri-id"
 */

export interface YourInterface {
  id: number;
  name: string;
}

export class YourClass {
  private data: YourInterface[];
  
  constructor() {
    this.data = [];
  }
  
  public addItem(item: YourInterface): void {
    this.data.push(item);
  }
}

export default YourClass;
```

**Optional Metadata**: Add `@mcp-name`, `@mcp-description`, and `@mcp-uri` in comments to customize the MCP resource. If omitted, sensible defaults are generated from the filename.

#### 2. Build and Test (Optional)
```bash
# Compile TypeScript files
pnpm run build

# Start/restart server
pnpm start

# The new TypeScript file is automatically discovered and available!
# Check available resources:
curl -s http://localhost:3000/info | jq '.resources'
```

**🎉 That's it!** Your TypeScript file is now automatically available as an MCP resource at `dbk-ts://yourfile` (or your custom URI if specified).

### Auto-Discovered TypeScript Resources
All `.ts` and `.tsx` files in `src/ts-resources/` are automatically discovered:

- **`dbk-ts://sample`** - Basic TypeScript features (classes, interfaces, generics, utility types)
- **`dbk-ts://sample2`** - Advanced patterns (async/await, enums, error classes, conditional types)
- **`dbk-ts://react-sample`** - React TypeScript component with JSX, hooks, and modern patterns
- **`dbk-ts://yourfile`** - Any TypeScript file you add is automatically available!

**Custom URIs**: If a file includes `@mcp-uri: "custom-name"` in its header comments, it will be available at `dbk-ts://custom-name` instead of the filename.

### Resource Response Format
```json
{
  "originalTypeScript": "// Full TypeScript source code...",
  "compiledJavaScript": "// Compiled JavaScript output...", 
  "info": {
    "sourceFile": "src/ts-resources/yourfile.tsx",
    "compiledFile": "dist/ts-resources/yourfile.js",
    "compiledAt": "2025-10-14T03:08:20.105Z",
    "description": "Features demonstrated in this file"
  }
}
```

### TypeScript Features to Showcase
- **Basic**: Interfaces, classes, enums, generics, union types
- **Advanced**: Conditional types, mapped types, template literals
- **Async**: Promises, async/await, generators, async iterators
- **Patterns**: Error handling, API clients, data structures
- **Modern**: Optional chaining, nullish coalescing, decorators

## MCP Resource Framework

The project includes a comprehensive framework for adding MCP resources with minimal boilerplate. Resources are automatically registered and served through the MCP protocol.

### Adding General MCP Resources

#### 1. Create Resource File
Create `src/resources/your-resource-name.ts`:
```typescript
import { ResourceDefinition } from './types.js';

// Resource implementation - return just the content
async function implementation(): Promise<{
  text?: string;
  blob?: string; // Base64-encoded binary data
}> {
  return {
    text: 'Your resource content here'
  };
}

// Export the resource definition
export const yourResourceName: ResourceDefinition = {
  config: {
    uri: 'your-scheme://your-path',
    name: 'Your Resource Name',
    description: 'What this resource provides',
    mimeType: 'text/plain' // or 'application/json', etc.
  },
  implementation,
};
```

#### 2. Register in Index
Add to `src/resources/index.ts`:
```typescript
// Import your resource
import { yourResourceName } from './your-resource-name.js';

// Add to availableResources array
export const availableResources = [
  helloWorldResource,
  yourResourceName, // <-- Add this line
  // ...
];

// Re-export for direct import
export { helloWorldResource, yourResourceName };
```

#### 3. Build and Test
```bash
pnpm run build
# Restart server to register new resource
```

### Resource Types

#### Text Resources
```typescript
return { text: 'Your text content' };
```

#### JSON Resources
```typescript
return { text: JSON.stringify({ key: 'value' }) };
```

#### Binary Resources (Base64)
```typescript
return { blob: 'base64-encoded-string-here' };
```

### URI Schemes
- `dbk-text://` - For text content
- `dbk-data://` - For structured data  
- `dbk-file://` - For file-like resources
- `dbk-api://` - For API responses
- `dbk-ts://` - For TypeScript files
- Custom schemes as needed

### Available Resources
- **`dbk-text://hello`** - Simple hello world text
- **`dbk-ts://sample`** - Basic TypeScript features
- **`dbk-ts://sample2`** - Advanced TypeScript patterns

## Troubleshooting

### Common Issues
- **Port conflicts**: Change PORT environment variable if 3000 is in use
- **MCP communication**: Ensure stdio transport is not interrupted by stdout logging
- **Type errors**: Run `pnpm run lint` to catch TypeScript issues early
- **Avoid redirection**: User prefers to run the server inside tmux and explicitly does not want to redirect the output when running the server. Redirecting the output causes runtime issues.
- **TypeScript compilation**: Run `pnpm run build` after adding new TypeScript files
- **Resource not found**: Check file paths and ensure files exist in both src/ and dist/ directories

### Useful Commands
```bash
# Test HTTP endpoints
curl http://localhost:3000/health
curl http://localhost:3000/info

# Watch for TypeScript errors
pnpm run dev

# Check for linting issues
pnpm run lint

# List all available resources
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"resources/list"}' | jq '.result.resources'

# Test TypeScript resource
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"dbk-ts://sample"}}' | jq '.result.contents[0].text | fromjson | keys'
```
