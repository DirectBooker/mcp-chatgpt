import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ZodRawShape } from 'zod';
import { ToolDefinition } from './types.js';

/**
 * Tool registry that manages tool registration with the MCP server
 */
export class ToolRegistry {
  private readonly mcpServer: McpServer;
  private readonly registeredTools = new Map<string, ToolDefinition<any>>();

  constructor(mcpServer: McpServer) {
    this.mcpServer = mcpServer;
  }

  /**
   * Register a single tool with the MCP server
   */
  register<TInputSchema extends ZodRawShape>(tool: ToolDefinition<TInputSchema>): void {
    const { config, implementation } = tool;

    // Check for duplicate tool names
    if (this.registeredTools.has(config.name)) {
      throw new Error(`Tool '${config.name}' is already registered`);
    }

    // Register with MCP server using the registerTool method
    const toolConfig: any = {
      description: config.description,
      annotations: config.annotations,
    };

    if (config.inputSchema) {
      toolConfig.inputSchema = config.inputSchema;
    }

    this.mcpServer.registerTool(config.name, toolConfig, async args => {
      try {
        return await implementation(args as any);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${config.name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Track registered tools
    this.registeredTools.set(config.name, tool as ToolDefinition<any>);
    console.error(`✓ Registered tool: ${config.name}`);
  }

  /**
   * Register multiple tools at once
   */
  registerMultiple(tools: ToolDefinition<any>[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Get list of registered tool names
   */
  getRegisteredToolNames(): string[] {
    return Array.from(this.registeredTools.keys());
  }

  /**
   * Get a registered tool by name
   */
  getTool(name: string): ToolDefinition<any> | undefined {
    return this.registeredTools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  isRegistered(name: string): boolean {
    return this.registeredTools.has(name);
  }
}
