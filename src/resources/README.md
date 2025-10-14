# MCP Resources Framework

This directory contains a framework for easily adding MCP resources with minimal boilerplate.

## Adding a New Resource

To add a new resource, follow these steps:

### 1. Create a new resource file

Create a file `src/resources/your-resource-name.ts` following this pattern:

```typescript
import { ResourceDefinition } from './types.js';

// Resource implementation function
async function implementation(uri: string): Promise<{
  contents: Array<{
    uri: string;
    mimeType: string;
    text?: string;
    blob?: Uint8Array;
  }>;
}> {
  return {
    contents: [
      {
        uri: 'your-scheme://your-path',
        mimeType: 'text/plain', // or 'application/json', 'image/png', etc.
        text: 'Your resource content here'
      }
    ]
  };
}

// Export the resource definition
export const yourResourceName: ResourceDefinition = {
  config: {
    uri: 'your-scheme://your-path',
    name: 'Your Resource Name',
    description: 'A description of what this resource provides',
    mimeType: 'text/plain'
  },
  implementation,
};
```

### 2. Add to the resources index

In `src/resources/index.ts`, add your resource:

```typescript
// Import your new resource
import { yourResourceName } from './your-resource-name.js';

// Add to the availableResources array
export const availableResources = [
  helloWorldResource,
  yourResourceName, // <-- Add this line
];

// Re-export for direct import
export { helloWorldResource, yourResourceName };
```

### 3. That's it!

Your resource will be automatically registered when the server starts. No additional configuration needed!

## Resource Types

### Text Resources
For simple text content:
```typescript
{
  uri: 'dbk-text://example',
  mimeType: 'text/plain',
  text: 'Your text content'
}
```

### JSON Resources
For structured data:
```typescript
{
  uri: 'dbk-data://config',
  mimeType: 'application/json',
  text: JSON.stringify({ key: 'value' })
}
```

### Binary Resources
For binary content:
```typescript
{
  uri: 'dbk-file://image.png',
  mimeType: 'image/png',
  blob: new Uint8Array([...])
}
```

## URI Schemes

You can use any URI scheme that makes sense for your resource:
- `dbk-text://` - For text content
- `dbk-data://` - For structured data  
- `dbk-file://` - For file-like resources
- `dbk-api://` - For API responses
- Or any custom scheme that fits your use case

## Error Handling

The framework automatically handles errors and provides meaningful error messages to MCP clients. Just throw an error in your implementation if something goes wrong:

```typescript
async function implementation(uri: string) {
  if (someCondition) {
    throw new Error('Resource not available');
  }
  // ... rest of implementation
}
```

## Dynamic Resources

Resources can be dynamic and change based on parameters or external data:

```typescript
async function implementation(uri: string) {
  // Parse URI parameters
  const url = new URL(uri);
  const param = url.searchParams.get('param');
  
  // Return dynamic content
  return {
    contents: [
      {
        uri,
        mimeType: 'text/plain',
        text: `Dynamic content for param: ${param}`
      }
    ]
  };
}
```