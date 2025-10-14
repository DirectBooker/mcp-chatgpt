#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { ToolRegistry, availableTools } from './tools/index.js';
import { ResourceRegistry, getAvailableResources } from './resources/index.js';
import { initializeUrlSalt } from './resources/typescript-resource-factory.js';

class MCPChatGPTServer {
  private readonly mcpServer: McpServer;
  private readonly app: express.Application;
  private readonly toolRegistry: ToolRegistry;
  private readonly resourceRegistry: ResourceRegistry;

  public constructor() {
    this.mcpServer = new McpServer(
      {
        name: 'mcp-chatgpt',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.toolRegistry = new ToolRegistry(this.mcpServer);
    this.resourceRegistry = new ResourceRegistry(this.mcpServer);
    this.app = express();
    this.setupExpress();
    this.setupMCPTools();
    // Resources setup is async and happens in start()
  }

  private setupExpress(): void {
    // Enable CORS for MCP Inspector and other web clients
    this.app.use(
      cors({
        origin: true, // Allow all origins in development
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
      })
    );

    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Basic info endpoint
    this.app.get('/info', (_req, res) => {
      res.json({
        name: 'mcp-chatgpt',
        version: '1.0.0',
        tools: this.toolRegistry.getRegisteredToolNames(),
        resources: this.resourceRegistry.getRegisteredResourceUris(),
        transport: 'StreamableHTTP',
        endpoints: {
          mcp: 'POST /mcp (JSON-RPC over HTTP)',
          sse: 'GET /mcp (Server-Sent Events)',
          session: 'DELETE /mcp (Session termination)',
        },
      });
    });

    // MCP StreamableHTTP endpoints - create new transport per request for multi-client support
    this.app.all('/mcp', async (req, res) => {
      try {
        // Create a new transport for each request to prevent request ID collisions
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });

        res.on('close', () => {
          transport.close();
        });

        await this.mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('MCP request error:', errorMessage);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  }

  private setupMCPTools(): void {
    // Register all available tools automatically
    this.toolRegistry.registerMultiple(availableTools);

    // That's it! To add a new tool:
    // 1. Create a new file in src/tools/your-tool-name.ts following the same pattern
    // 2. Add your tool to the availableTools array in src/tools/index.ts
    // 3. The tool will be automatically registered here
  }

  private async setupMCPResources(): Promise<void> {
    // Register all available resources automatically, including auto-discovered TypeScript files
    await this.resourceRegistry.registerMultipleAsync(getAvailableResources());

    // That's it! To add a new resource:
    // For static resources:
    //   1. Create a new file in src/resources/your-resource-name.ts following the same pattern
    //   2. Add your resource to the static resources list in src/resources/index.ts
    // For TypeScript files:
    //   1. Just add a .ts or .tsx file to src/ts-resources/
    //   2. It will be automatically discovered and registered as an MCP resource!
  }

  public async start(): Promise<void> {
    // Initialize URL salt for cache busting
    initializeUrlSalt();
    
    // Setup resources with auto-discovery
    await this.setupMCPResources();

    console.error('✓ MCP server ready for multi-client connections');

    // Start Express server for HTTP endpoints
    const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;
    const httpServer = this.app.listen(port, () => {
      console.error(`✓ HTTP server running on port ${port}`);
      console.error(`✓ MCP endpoints available at:`);
      console.error(`  - POST http://localhost:${port}/mcp (JSON-RPC)`);
      console.error(`  - GET http://localhost:${port}/mcp (Server-Sent Events)`);
      console.error(`  - DELETE http://localhost:${port}/mcp (Session termination)`);
      console.error(`✓ Info endpoint: http://localhost:${port}/info`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('Received SIGINT, shutting down gracefully...');

      // Close HTTP server (transports are closed per-request)
      httpServer.close(() => {
        process.exit(0);
      });
    });
  }
}

// Start the server
async function main(): Promise<void> {
  const server = new MCPChatGPTServer();
  await server.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { MCPChatGPTServer };
