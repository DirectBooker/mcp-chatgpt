# Tools Directory

This directory contains all MCP tools for the server. Each tool is implemented in its own file and automatically registered with the server.

## 📁 Directory Structure

```
src/tools/
├── README.md          # This documentation
├── types.ts           # Common interfaces and types
├── registry.ts        # Tool registration system
├── index.ts           # Tool exports and registry
├── the-tool.ts        # Example tool implementation
└── your-new-tool.ts   # Your new tools go here
```

## 🛠️ Adding a New Tool

Adding a new tool is simple and requires only 2 steps:

### Step 1: Create Your Tool File

Create a new file `src/tools/your-tool-name.ts`:

```typescript
import { z } from 'zod';
import { ToolDefinition } from './types.js';

// Define input schema (optional)
const inputSchema = {
  // Define your parameters here
  name: z.string().describe('A name parameter'),
  count: z.number().optional().describe('Optional count'),
};

// Implement your tool logic
async function implementation(args: {
  name: string;
  count?: number | undefined;
}) {
  // Your tool logic here
  const result = {
    message: `Hello, ${args.name}!`,
    count: args.count || 1,
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

// Export the tool definition
export const yourTool: ToolDefinition<typeof inputSchema> = {
  config: {
    name: 'your-tool-name',
    description: 'Description of what your tool does',
    inputSchema, // Optional - omit for tools with no parameters
  },
  implementation,
};
```

### Step 2: Register Your Tool

Add your tool to `src/tools/index.ts`:

```typescript
// Import your new tool
import { yourTool } from './your-tool-name.js';

// Add it to the availableTools array
export const availableTools = [
  theTool,
  yourTool,  // Add your tool here
];
```

**That's it!** Your tool will be automatically registered when the server starts.

## 🎯 Tool Examples

### Simple Tool (No Parameters)
```typescript
export const simpleTool: ToolDefinition = {
  config: {
    name: 'simple-tool',
    description: 'A tool that needs no parameters',
    // No inputSchema needed
  },
  implementation: async () => ({
    content: [{ type: 'text', text: 'Hello, world!' }],
  }),
};
```

### Complex Tool (Multiple Parameters)
```typescript
const inputSchema = {
  query: z.string().describe('Search query'),
  limit: z.number().min(1).max(100).default(10).describe('Number of results'),
  includeMetadata: z.boolean().optional().describe('Include metadata in results'),
};

export const searchTool: ToolDefinition<typeof inputSchema> = {
  config: {
    name: 'search-tool',
    description: 'Search for information with customizable options',
    inputSchema,
  },
  implementation: async (args) => {
    // args is fully typed based on your schema
    const results = await performSearch(args.query, args.limit);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
};
```

## 🔧 Advanced Features

### Error Handling
The registry automatically wraps your tool implementations with error handling. If your tool throws an error, it will be caught and returned as an MCP error response.

### Tool Annotations
Add metadata to your tools using annotations:

```typescript
export const annotatedTool: ToolDefinition<typeof inputSchema> = {
  config: {
    name: 'annotated-tool',
    description: 'A tool with annotations',
    inputSchema,
    annotations: {
      category: 'utility',
      version: '1.0.0',
      author: 'Your Name',
    },
  },
  implementation,
};
```

### Type Safety
The tool system is fully type-safe:
- Input parameters are validated against your Zod schema
- The `args` parameter in your implementation function is typed based on your schema
- TypeScript will catch type mismatches at compile time

## 🚀 Best Practices

1. **Use descriptive names**: Tool names should be kebab-case and descriptive
2. **Add good descriptions**: Help users understand what your tool does
3. **Validate inputs**: Use Zod schemas to validate and document parameters
4. **Handle errors gracefully**: Let the registry handle errors, but provide meaningful error messages
5. **Keep it focused**: Each tool should do one thing well
6. **Document parameters**: Use `.describe()` on your Zod schemas for better UX

## 🎉 Ready to Go!

Your new tool system is set up and ready. Just create new tool files and add them to the index - the server handles the rest automatically!