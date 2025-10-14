import { ResourceDefinition } from './types.js';

// Resource implementation function
async function implementation(): Promise<{
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
}> {
  return {
    contents: [
      {
        uri: 'dbk-text://hello',
        mimeType: 'text/plain',
        text: 'Hello, World from my MCP!!!'
      }
    ]
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