import { ResourceDefinition } from './types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Configuration for creating a TypeScript resource
 */
export interface TypeScriptResourceConfig {
  /** Filename without extension (e.g., 'sample', 'react-sample') */
  filename: string;
  /** URI identifier (e.g., 'sample', 'react-sample') */
  uriId: string;
  /** Display name for the resource */
  name: string;
  /** Description of what this TypeScript file demonstrates */
  description: string;
}

/**
 * Factory function to create TypeScript MCP resources with shared implementation
 * This eliminates boilerplate code duplication across TypeScript resource files
 */
export function createTypeScriptResource(config: TypeScriptResourceConfig): ResourceDefinition {
  // Create the implementation function with the provided configuration
  async function implementation(): Promise<{ text: string }> {
    try {
      // Use process.cwd() to get the project root
      const projectRoot = process.cwd();
      
      // Path to the compiled JavaScript file
      const jsFilePath = join(projectRoot, `dist/ts-resources/${config.filename}.js`);
      
      // Read the compiled JavaScript content
      const jsContent = await readFile(jsFilePath, 'utf-8');
      
      // Get the original TypeScript source for reference
      const tsFilePath = join(projectRoot, `src/ts-resources/${config.filename}.tsx`);
      const tsContent = await readFile(tsFilePath, 'utf-8');
      
      // Create a formatted response with both source and compiled versions
      const response = {
        originalTypeScript: tsContent,
        compiledJavaScript: jsContent,
        info: {
          sourceFile: `src/ts-resources/${config.filename}.tsx`,
          compiledFile: `dist/ts-resources/${config.filename}.js`,
          compiledAt: new Date().toISOString(),
          description: config.description
        }
      };
      
      return {
        text: JSON.stringify(response, null, 2)
      };
      
    } catch (error) {
      // If files don't exist or can't be read, provide helpful error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const errorResponse = {
        error: `Failed to read TypeScript/JavaScript files for ${config.filename}`,
        message: errorMessage,
        hint: 'Make sure to run "pnpm run build" to compile TypeScript files',
        expectedPaths: [
          `src/ts-resources/${config.filename}.tsx (source)`,
          `dist/ts-resources/${config.filename}.js (compiled)`
        ]
      };
      
      return {
        text: JSON.stringify(errorResponse, null, 2)
      };
    }
  }

  // Return the complete resource definition
  return {
    config: {
      uri: `dbk-ts://${config.uriId}`,
      name: config.name,
      description: config.description,
      mimeType: 'application/json'
    },
    implementation
  };
}