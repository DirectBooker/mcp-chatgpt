# MCP Resources Framework

This directory contains a framework for easily adding MCP resources with minimal boilerplate.

## Adding a New Resource

To add a new resource, follow these steps:

### 1. Create a new resource file

Create a file `src/resources/your-resource-name.ts` following this pattern:

```typescript
import { ResourceDefinition } from './types.js';

// Resource implementation function - just return the content
async function implementation(): Promise<{
  text?: string;
  blob?: Uint8Array;
}> {
  return {
    text: 'Your resource content here'
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
// In implementation function:
return {
  text: 'Your text content'
};
```

### JSON Resources
For structured data:
```typescript
// In implementation function:
return {
  text: JSON.stringify({ key: 'value' })
};
```

### Binary Resources
For binary content (base64-encoded):
```typescript
// In implementation function:
return {
  blob: 'base64-encoded-string-here'
};
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
async function implementation() {
  // You can still access the URI through the config if needed for dynamic content
  const currentTime = new Date().toISOString();
  
  // Return dynamic content
  return {
    text: `Dynamic content generated at: ${currentTime}`
  };
}
```
