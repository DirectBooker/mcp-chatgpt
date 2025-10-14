import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceDefinition } from './types.js';

/**
 * Resource registry that manages resource registration with the MCP server
 */
export class ResourceRegistry {
  private readonly mcpServer: McpServer;
  private readonly registeredResources = new Map<string, ResourceDefinition>();

  constructor(mcpServer: McpServer) {
    this.mcpServer = mcpServer;
  }

  /**
   * Register a single resource with the MCP server
   */
  register(resource: ResourceDefinition): void {
    const { config, implementation } = resource;

    // Check for duplicate resource URIs
    if (this.registeredResources.has(config.uri)) {
      throw new Error(`Resource '${config.uri}' is already registered`);
    }

    // Register with MCP server using the registerResource method
    this.mcpServer.registerResource(
      config.name,
      config.uri,
      {
        name: config.name,
        description: config.description,
        mimeType: config.mimeType,
        ...config.annotations
      },
      async () => {
        try {
          const content = await implementation();
          
          // Create MCP-compliant content object
          const contentObj: any = {
            uri: config.uri,
            mimeType: config.mimeType
          };
          
          // Add either text or blob, ensuring one is present
          if (content.text !== undefined) {
            contentObj.text = content.text;
          } else if (content.blob !== undefined) {
            contentObj.blob = content.blob;
          } else {
            contentObj.text = ''; // Default to empty text if neither provided
          }
          
          return {
            contents: [contentObj]
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Error reading resource ${config.uri}: ${errorMessage}`);
        }
      }
    );

    // Track registered resources
    this.registeredResources.set(config.uri, resource);
    console.error(`✓ Registered resource: ${config.uri}`);
  }

  /**
   * Register multiple resources at once
   */
  registerMultiple(resources: ResourceDefinition[]): void {
    for (const resource of resources) {
      this.register(resource);
    }
  }

  /**
   * Get list of registered resource URIs
   */
  getRegisteredResourceUris(): string[] {
    return Array.from(this.registeredResources.keys());
  }

  /**
   * Get a registered resource by URI
   */
  getResource(uri: string): ResourceDefinition | undefined {
    return this.registeredResources.get(uri);
  }

  /**
   * Check if a resource is registered
   */
  isRegistered(uri: string): boolean {
    return this.registeredResources.has(uri);
  }

  /**
   * Get all registered resource configs for info display
   */
  getRegisteredResourceConfigs(): Array<{ uri: string; name: string; description: string; mimeType: string }> {
    return Array.from(this.registeredResources.values()).map(resource => ({
      uri: resource.config.uri,
      name: resource.config.name,
      description: resource.config.description,
      mimeType: resource.config.mimeType
    }));
  }
}