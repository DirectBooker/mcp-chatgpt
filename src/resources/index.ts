// Export resource types and registry
export * from './types.js';
export * from './registry.js';

// Import static resources
import { helloWorldResource } from './instances/hello-world.js';

// Import auto-discovery function
import { discoverTypeScriptResources } from './typescript-auto-discovery.js';
import { ResourceDefinition } from './types.js';

/**
 * Get all available resources including auto-discovered TypeScript resources
 */
export async function getAvailableResources(): Promise<ResourceDefinition[]> {
  const staticResources = [helloWorldResource];

  // Auto-discover TypeScript resources
  const typescriptResources = await discoverTypeScriptResources();

  return [...staticResources, ...typescriptResources];
}

/**
 * Legacy synchronous export for backwards compatibility
 * Note: This will be empty until auto-discovery runs
 */
export const availableResources: ResourceDefinition[] = [
  helloWorldResource,
  // TypeScript resources are now auto-discovered at runtime
];

// Re-export individual static resources
export { helloWorldResource };

// Re-export auto-discovery utilities
export {
  discoverTypeScriptResources,
  getDiscoveredTypeScriptFiles,
} from './typescript-auto-discovery.js';
