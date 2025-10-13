#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { z } from 'zod';

// Define the input schema for our tool
const TheToolArgsSchema = {
  message: z.string().describe('A message to process'),
  count: z.number().optional().describe('Optional count parameter'),
};

class MCPChatGPTServer {
  private readonly mcpServer: McpServer;
  private readonly app: express.Application;

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
        tools: ['the-tool'],
      });
    });
  }

  private setupMCPTools(): void {
    // Register the tool using the McpServer's registerTool method
    this.mcpServer.registerTool(
      'the-tool',
      {
        description: 'A sample tool that processes messages and returns formatted output',
        inputSchema: TheToolArgsSchema,
      },
      async args => {
        try {
          const result = await this.executeTheTool(args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return {
            content: [
              {
                type: 'text',
                text: `Error executing the-tool: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private async executeTheTool(args: {
    message: string;
    count?: number | undefined;
  }): Promise<object> {
    const { message, count = 1 } = args;

    // Sample processing logic - replace this with your actual tool implementation
    const processedMessage = message.toUpperCase();
    const timestamp = new Date().toISOString();

    return {
      originalMessage: message,
      processedMessage,
      count,
      timestamp,
      success: true,
    };
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
