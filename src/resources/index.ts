// Export resource types and registry
export * from './types.js';
export * from './registry.js';

// Import all available resources
import { helloWorldResource } from './hello-world.js';

// Export all resources in a convenient array
export const availableResources = [
  helloWorldResource,
  // Add new resources here as you create them
  // Example:
  // import { myNewResource } from './my-new-resource.js';
  // myNewResource,
];

// Re-export individual resources for direct import if needed
export { helloWorldResource };
