// Export tool types and registry
export * from './types.js';
export * from './registry.js';

// Import all available tools
import { theTool } from './the-tool.js';
import { hotelSearchTool } from './hotel-search.js';

// Export all tools in a convenient array
export const availableTools = [
  theTool,
  hotelSearchTool,
  // Add new tools here as you create them
  // Example:
  // import { myNewTool } from './my-new-tool.js';
  // myNewTool,
];

// Re-export individual tools for direct import if needed
export { theTool, hotelSearchTool };
