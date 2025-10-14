import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Configuration for registering a resource with the MCP server
 */
export interface ResourceConfig {
  /** Resource URI (must be unique) */
  uri: string;
  /** Human-readable resource name */
  name: string;
  /** Resource description for clients */
  description: string;
  /** MIME type of the resource content */
  mimeType: string;
  /** Optional resource annotations for additional metadata */
  annotations?: {
    [key: string]: unknown;
  };
}

/**
 * Resource implementation function signature
 */
export type ResourceImplementation = (
  uri: string
) => Promise<ReadResourceResult>;

/**
 * Complete resource definition including configuration and implementation
 */
export interface ResourceDefinition {
  config: ResourceConfig;
  implementation: ResourceImplementation;
}

/**
 * Helper type for simple text resources
 */
export type SimpleTextResourceImplementation = () => Promise<string>;