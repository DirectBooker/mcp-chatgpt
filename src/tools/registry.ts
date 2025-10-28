import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z, ZodRawShape } from 'zod';
import { ToolDefinition } from './types.js';
import { logger } from '../shared/logger.js';

/**
 * Tool registry that manages tool registration with the MCP server
 */
export class ToolRegistry {
  private readonly mcpServer: McpServer;
  private readonly registeredTools = new Map<string, ToolDefinition<ZodRawShape, ZodRawShape>>();

  constructor(mcpServer: McpServer) {
    this.mcpServer = mcpServer;
  }

  /**
   * Register a single tool with the MCP server
   */
  register<TInputSchema extends ZodRawShape, TOutputSchema extends ZodRawShape>(
    tool: ToolDefinition<TInputSchema, TOutputSchema>
  ): void {
    const { config, implementation } = tool;

    // Check for duplicate tool names
    if (this.registeredTools.has(config.name)) {
      throw new Error(`Tool '${config.name}' is already registered`);
    }

    // Register with MCP server using the registerTool method
    const toolConfig: Record<string, unknown> = {
      description: config.description,
      annotations: config.annotations,
    };

    if (config._meta) {
      toolConfig['_meta'] = config._meta;
    }

    if (config.inputSchema) {
      toolConfig['inputSchema'] = config.inputSchema;
    }

    if (config.outputSchema) {
      toolConfig['outputSchema'] = config.outputSchema;
    }

    this.mcpServer.registerTool(config.name, toolConfig, async args => {
      // Log tool invocation (stderr)
      logger.mcp(`tools/call ${config.name}`);

      try {
        // Validate and parse input arguments using the tool's schema
        let parsedArgs: unknown = args;
        if (config.inputSchema && typeof args === 'object' && args !== null) {
          // Create a Zod object schema from the input schema
          const zodSchema = z.object(config.inputSchema);
          try {
            parsedArgs = zodSchema.parse(args);
          } catch (parseError: unknown) {
            const errorMessage = parseError instanceof Error ? parseError.message : 'Invalid input';
            return {
              content: [
                {
                  type: 'text',
                  text: `Input validation failed for ${config.name}: ${errorMessage}`,
                },
              ],
              isError: true,
            };
          }
        }

        return await implementation(parsedArgs as Parameters<typeof implementation>[0]);
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
    this.registeredTools.set(
      config.name,
      tool as unknown as ToolDefinition<ZodRawShape, ZodRawShape>
    );
    logger.info(`✓ Registered tool: ${config.name}`);
  }

  /**
   * Register multiple tools at once
   */
  registerMultiple<TInputSchema extends ZodRawShape, TOutputSchema extends ZodRawShape>(
    tools: ToolDefinition<TInputSchema, TOutputSchema>[]
  ): void {
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
  getTool(name: string): ToolDefinition<ZodRawShape, ZodRawShape> | undefined {
    return this.registeredTools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  isRegistered(name: string): boolean {
    return this.registeredTools.has(name);
  }
}
