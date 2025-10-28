# Tools Directory

This directory contains MCP tool definitions for the server. Tools are automatically registered at startup via the `ToolRegistry`.

## 📁 Directory Structure

```
src/tools/
├── README.md              # This documentation
├── types.ts               # Tool definition interfaces
├── registry.ts            # ToolRegistry class for MCP registration
├── index.ts               # Tool exports and availableTools array
└── instances/
    └── hotel-search.ts    # Example: hotel search tool with hotel carousel
```

## Current Tools

- **hotel-search**: Searches for hotels by city with optional check-in/check-out dates. Returns structured hotel data and triggers carousel display via OpenAI output template.

## 🛠️ Adding a New Tool

Adding a new tool requires 2 steps:

### Step 1: Create Your Tool File

Create a new file `src/tools/instances/your-tool-name.ts`:

```typescript
import { z } from 'zod';
import { ToolDefinition } from './types.js';

// Define input schema (optional)
const inputSchema = {
  // Define your parameters here
  name: z.string().describe('A name parameter'),
  count: z.number().optional().describe('Optional count'),
};

// Define output schema (optional but recommended)
const outputSchema = {
  greeting: z.string().describe('The generated greeting message'),
  count: z.number().describe('The count value that was used'),
  timestamp: z.string().describe('When the greeting was generated'),
};

// Implement your tool logic
async function implementation(args: {
  name: string;
  count?: number | undefined;
}) {
  // Your tool logic here
  const result = {
    greeting: `Hello, ${args.name}!`,
    count: args.count || 1,
    timestamp: new Date().toISOString(),
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
export const yourTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  config: {
    name: 'your-tool-name',
    description: 'Description of what your tool does',
    inputSchema, // Optional - omit for tools with no parameters
    outputSchema, // Optional but recommended for documentation
  },
  implementation,
};
```

### Step 2: Register Your Tool

Add your tool to `src/tools/index.ts`:

```typescript
// Import your new tool
import { yourTool } from './instances/your-tool-name.js';

// Add it to the availableTools array
export const availableTools = [
  hotelSearchTool,
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

const outputSchema = {
  results: z.array(z.object({
    title: z.string().describe('Result title'),
    content: z.string().describe('Result content'),
    score: z.number().describe('Relevance score'),
  })).describe('Search results'),
  totalCount: z.number().describe('Total number of results found'),
  query: z.string().describe('The original search query'),
  executionTime: z.number().describe('Time taken to execute search in milliseconds'),
};

export const searchTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  config: {
    name: 'search-tool',
    description: 'Search for information with customizable options',
    inputSchema,
    outputSchema,
  },
  implementation: async (args) => {
    // args is fully typed based on your schema
    const startTime = Date.now();
    const results = await performSearch(args.query, args.limit);
    
    const response = {
      results,
      totalCount: results.length,
      query: args.query,
      executionTime: Date.now() - startTime,
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  },
};
```

## 🔧 Advanced Features

### Error Handling
The registry automatically wraps your tool implementations with error handling. If your tool throws an error, it will be caught and returned as an MCP error response.

### Output Schema Benefits
Defining output schemas provides several advantages:
- **Documentation**: Clear specification of what your tool returns
- **Validation**: MCP clients can validate responses against the schema  
- **Type Safety**: Better development experience with autocomplete
- **API Discovery**: Clients can understand your tool's output format

### Tool Annotations
Add metadata to your tools using annotations:

```typescript
export const annotatedTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  config: {
    name: 'annotated-tool',
    description: 'A tool with annotations and schemas',
    inputSchema,
    outputSchema,
    annotations: {
      category: 'utility',
      version: '1.0.0',
      author: 'Your Name',
      tags: ['example', 'demo'],
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
4. **Define output schemas**: Document your tool's return structure for better UX
5. **Handle errors gracefully**: Let the registry handle errors, but provide meaningful error messages
6. **Keep it focused**: Each tool should do one thing well
7. **Document parameters**: Use `.describe()` on your Zod schemas for better UX
8. **Use semantic versioning**: Update tool versions when changing schemas

## 🎉 Ready to Go!

Your new tool system is set up and ready. Just create new tool files and add them to the index - the server handles the rest automatically!