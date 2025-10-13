#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { z } from 'zod';

// Define the input schema for our tool
const TheToolArgsSchema = z.object({
  message: z.string().describe('A message to process'),
  count: z.number().optional().describe('Optional count parameter'),
});

class MCPChatGPTServer {
  private readonly server: Server;
  private readonly app: express.Application;

  public constructor() {
    this.server = new Server(
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
    this.setupMCPHandlers();
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

  private setupMCPHandlers(): void {
    // Handle list tools requests
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'the-tool',
            description: 'A sample tool that processes messages and returns formatted output',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'A message to process',
                },
                count: {
                  type: 'number',
                  description: 'Optional count parameter',
                },
              },
              required: ['message'],
            },
          } as Tool,
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      if (name === 'the-tool') {
        try {
          const parsed = TheToolArgsSchema.parse(args);
          const result = await this.executeTheTool(parsed);

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

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  private async executeTheTool(args: z.infer<typeof TheToolArgsSchema>): Promise<object> {
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
    await this.server.connect(transport);
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
