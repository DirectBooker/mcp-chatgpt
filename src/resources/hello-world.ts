import { ResourceDefinition } from './types.js';

// Resource implementation function - just return the content
async function implementation(): Promise<{
  text: string;
}> {
  return {
    text: 'Hello, World from my MCP!!!'
  };
}

// Export the resource definition
export const helloWorldResource: ResourceDefinition = {
  config: {
    uri: 'dbk-text://hello',
    name: 'Hello World Resource',
    description: 'A simple hello world resource for testing',
    mimeType: 'text/plain'
  },
  implementation,
};