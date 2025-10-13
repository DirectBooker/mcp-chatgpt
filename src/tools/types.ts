import { z, ZodRawShape } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Configuration for registering a tool with the MCP server
 */
export interface ToolConfig<TInputSchema extends ZodRawShape = ZodRawShape> {
  /** Tool name (must be unique) */
  name: string;
  /** Tool description for clients */
  description: string;
  /** Zod schema object for input validation */
  inputSchema?: TInputSchema;
  /** Optional tool annotations for additional metadata */
  annotations?: {
    [key: string]: unknown;
  };
}

/**
 * Tool implementation function signature
 */
export type ToolImplementation<TInputSchema extends ZodRawShape = ZodRawShape> = (
  args: TInputSchema extends ZodRawShape
    ? { [K in keyof TInputSchema]: z.infer<TInputSchema[K]> }
    : Record<string, unknown>
) => Promise<CallToolResult>;

/**
 * Complete tool definition including configuration and implementation
 */
export interface ToolDefinition<TInputSchema extends ZodRawShape = ZodRawShape> {
  config: ToolConfig<TInputSchema>;
  implementation: ToolImplementation<TInputSchema>;
}

/**
 * Helper type for tools with no input parameters
 */
export type SimpleToolImplementation = () => Promise<CallToolResult>;
