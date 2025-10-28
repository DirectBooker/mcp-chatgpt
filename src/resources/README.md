# MCP Resources Framework

This directory manages static and auto-discovered MCP resources. Resources can be either:

1. **Static resources** - Defined in `instances/` and manually registered
2. **TypeScript/React resources** - Automatically discovered from `src/ts-resources/` and served as HTML via MCP

## Auto-Discovered TypeScript Resources

The recommended approach. Drop a `.ts` or `.tsx` file in `src/ts-resources/` with optional metadata:

```typescript
/**
 * @mcp-name: "Display Name"
 * @mcp-description: "What this resource shows"
 * @mcp-uri: "custom-uri-id"
 */
// Your React/TypeScript component here
```

It will be bundled, inlined with Tailwind CSS, and served automatically as `dbk-ts://filename?salt=<version>`.

## Adding a Static Resource

For non-TypeScript resources, follow these steps:

### 1. Create a resource file

Create a file `src/resources/instances/your-resource-name.ts` following this pattern:

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

In `src/resources/index.ts`, add your resource to the `staticResources` array:

```typescript
// Import your new resource
import { yourResourceName } from './instances/your-resource-name.js';

// In getAvailableResources():
const staticResources = [
  helloWorldResource,
  yourResourceName, // <-- Add this line
];
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
