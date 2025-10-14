import { ResourceDefinition } from './types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Resource implementation function
async function implementation(): Promise<{ text: string }> {
  try {
    // Use process.cwd() to get the project root
    const projectRoot = process.cwd();
    
    // Path to the compiled JavaScript file
    const jsFilePath = join(projectRoot, 'dist/typescript-files/react-sample.js');
    
    // Read the compiled JavaScript content
    const jsContent = await readFile(jsFilePath, 'utf-8');
    
    // Get the original TypeScript source for reference
    const tsFilePath = join(projectRoot, 'src/typescript-files/react-sample.tsx');
    const tsContent = await readFile(tsFilePath, 'utf-8');
    
    // Create a formatted response with both source and compiled versions
    const response = {
      originalTypeScript: tsContent,
      compiledJavaScript: jsContent,
      info: {
        sourceFile: 'src/typescript-files/react-sample.tsx',
        compiledFile: 'dist/typescript-files/react-sample.js',
        compiledAt: new Date().toISOString(),
        description: 'React TypeScript component with JSX, hooks, event handling, and modern React patterns including useState, useCallback, useMemo, and custom hooks'
      }
    };
    
    return {
      text: JSON.stringify(response, null, 2)
    };
    
  } catch (error) {
    // If files don't exist or can't be read, provide helpful error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const errorResponse = {
      error: 'Failed to read TypeScript/JavaScript files for react-sample',
      message: errorMessage,
      hint: 'Make sure to run "pnpm run build" to compile TypeScript files',
      expectedPaths: [
        'src/typescript-files/react-sample.tsx (source)',
        'dist/typescript-files/react-sample.js (compiled)'
      ]
    };
    
    return {
      text: JSON.stringify(errorResponse, null, 2)
    };
  }
}

// Export the resource definition
export const typescriptReactSampleResource: ResourceDefinition = {
  config: {
    uri: 'dbk-ts://react-sample',
    name: 'React TypeScript Sample',
    description: 'React component with TypeScript demonstrating JSX, hooks, event handling, and Google search integration',
    mimeType: 'application/json'
  },
  implementation,
};