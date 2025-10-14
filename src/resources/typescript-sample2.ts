import { createTypeScriptResource } from './typescript-resource-factory.js';

// Export the resource definition using the factory
export const typescriptSample2Resource = createTypeScriptResource({
  filename: 'sample2',
  uriId: 'sample2',
  name: 'Advanced TypeScript Sample',
  description: 'Advanced TypeScript sample with async/await, enums, conditional types, error handling, and API client patterns'
});
