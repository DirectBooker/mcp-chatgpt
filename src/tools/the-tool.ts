import { z } from 'zod';
import { ToolDefinition } from './types.js';

// Define the input schema for this tool
const inputSchema = {
  message: z.string().describe('A message to process'),
  count: z.number().optional().describe('Optional count parameter'),
};

// Define the output schema for this tool
const outputSchema = {
  originalMessage: z.string().describe('The original input message'),
  processedMessage: z.string().describe('The processed message (uppercased)'),
  count: z.number().describe('The count parameter used'),
  timestamp: z.string().describe('ISO timestamp when processing occurred'),
  success: z.boolean().describe('Whether the operation was successful'),
};

// Tool implementation
async function implementation(args: { message: string; count?: number | undefined }): Promise<{
  content: Array<{
    type: 'text';
    text: string;
  }>;
}> {
  const { message, count = 1 } = args;

  // Sample processing logic - replace this with your actual tool implementation
  const processedMessage = message.toUpperCase();
  const timestamp = new Date().toISOString();

  const result = {
    originalMessage: message,
    processedMessage,
    count,
    timestamp,
    success: true,
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

// Export the complete tool definition
export const theTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  config: {
    name: 'the-tool',
    description: 'A sample tool that processes messages and returns formatted output',
    inputSchema,
    outputSchema,
  },
  implementation,
};
