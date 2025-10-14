// Export resource types and registry
export * from './types.js';
export * from './registry.js';

// Import all available resources
import { helloWorldResource } from './hello-world.js';
import { typescriptFilesResource } from './typescript-files.js';
import { typescriptSample2Resource } from './typescript-sample2.js';
import { typescriptReactSampleResource } from './typescript-react-sample.js';

// Export all resources in a convenient array
export const availableResources = [
  helloWorldResource,
  typescriptFilesResource,
  typescriptSample2Resource,
  typescriptReactSampleResource,
  // Add new resources here as you create them
  // Example:
  // import { myNewResource } from './my-new-resource.js';
  // myNewResource,
];

// Re-export individual resources for direct import if needed
export { helloWorldResource, typescriptFilesResource, typescriptSample2Resource, typescriptReactSampleResource };
