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
 * Resource implementation function signature - returns just the content
 * URI and mimeType are automatically handled by the framework
 * For binary data, return base64-encoded string in blob field
 */
export type ResourceImplementation = () => Promise<{
  text?: string;
  blob?: string; // Base64-encoded binary data
}>;

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
