#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry, availableTools } from './tools/index.js';

class MCPChatGPTServer {
  private readonly mcpServer: McpServer;
  private readonly app: express.Application;
  private readonly toolRegistry: ToolRegistry;

  public constructor() {
    this.mcpServer = new McpServer(
      {
        name: 'mcp-chatgpt',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.toolRegistry = new ToolRegistry(this.mcpServer);
    this.app = express();
    this.setupExpress();
    this.setupMCPTools();
  }

  private setupExpress(): void {
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
      });
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


  public async start(): Promise<void> {
    // Start Express server for HTTP endpoints
    const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;
    const httpServer = this.app.listen(port, () => {
      console.error(`HTTP server running on port ${port}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully...');
      httpServer.close(() => {
        process.exit(0);
      });
    });

    // Start MCP server with stdio transport
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.error('MCP server started with stdio transport');
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
