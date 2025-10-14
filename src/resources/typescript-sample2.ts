import { ResourceDefinition } from './types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Resource implementation function
async function implementation(): Promise<{ text: string }> {
  try {
    // Use process.cwd() to get the project root
    const projectRoot = process.cwd();
    
    // Path to the compiled JavaScript file
    const jsFilePath = join(projectRoot, 'dist/typescript-files/sample2.js');
    
    // Read the compiled JavaScript content
    const jsContent = await readFile(jsFilePath, 'utf-8');
    
    // Get the original TypeScript source for reference
    const tsFilePath = join(projectRoot, 'src/typescript-files/sample2.tsx');
    const tsContent = await readFile(tsFilePath, 'utf-8');
    
    // Create a formatted response with both source and compiled versions
    const response = {
      originalTypeScript: tsContent,
      compiledJavaScript: jsContent,
      info: {
        sourceFile: 'src/typescript-files/sample2.tsx',
        compiledFile: 'dist/typescript-files/sample2.js',
        compiledAt: new Date().toISOString(),
        description: 'Advanced TypeScript sample with async/await, enums, conditional types, error handling, and API client patterns'
      }
    };
    
    return {
      text: JSON.stringify(response, null, 2)
    };
    
  } catch (error) {
    // If files don't exist or can't be read, provide helpful error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const errorResponse = {
      error: 'Failed to read TypeScript/JavaScript files for sample2',
      message: errorMessage,
      hint: 'Make sure to run "pnpm run build" to compile TypeScript files',
      expectedPaths: [
        'src/typescript-files/sample2.tsx (source)',
        'dist/typescript-files/sample2.js (compiled)'
      ]
    };
    
    return {
      text: JSON.stringify(errorResponse, null, 2)
    };
  }
}

// Export the resource definition
export const typescriptSample2Resource: ResourceDefinition = {
  config: {
    uri: 'dbk-ts://sample2',
    name: 'Advanced TypeScript Sample',
    description: 'Compiled JavaScript from sample2.tsx with async/await, enums, conditional types, and advanced patterns',
    mimeType: 'application/json'
  },
  implementation,
};