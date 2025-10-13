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

## Troubleshooting

### Common Issues
- **Port conflicts**: Change PORT environment variable if 3000 is in use
- **MCP communication**: Ensure stdio transport is not interrupted by stdout logging
- **Type errors**: Run `pnpm run lint` to catch TypeScript issues early

### Useful Commands
```bash
# Test HTTP endpoints
curl http://localhost:3000/health
curl http://localhost:3000/info

# Watch for TypeScript errors
pnpm run dev

# Check for linting issues
pnpm run lint
```
