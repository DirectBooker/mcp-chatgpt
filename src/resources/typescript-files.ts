import { createTypeScriptResource } from './typescript-resource-factory.js';

// Export the resource definition using the factory
export const typescriptFilesResource = createTypeScriptResource({
  filename: 'sample',
  uriId: 'sample',
  name: 'Sample TypeScript File',
  description: 'Sample React component with TypeScript features including interfaces, generics, and classes'
});
