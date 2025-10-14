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
 * Salt value for cache busting, set at startup
 */
let urlSalt: string | null = null;

/**
 * Initialize the URL salt for cache busting
 */
export function initializeUrlSalt(): void {
  urlSalt = Date.now().toString();
  console.error(`✓ TypeScript resource URL salt initialized: ${urlSalt}`);
}

/**
 * Get the current URL salt
 */
export function getUrlSalt(): string {
  if (!urlSalt) {
    throw new Error('URL salt not initialized. Call initializeUrlSalt() first.');
  }
  return urlSalt;
}

/**
 * Create a salted URI for a TypeScript resource
 */
export function createSaltedUri(uriId: string): string {
  return `dbk-ts://${uriId}?salt=${getUrlSalt()}`;
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

      // Create import map for React and other dependencies
      const importMap = {
        imports: {
          'react': 'https://esm.sh/react@18',
          'react/jsx-runtime': 'https://esm.sh/react@18/jsx-runtime',
          'react-dom': 'https://esm.sh/react-dom@18',
          'react-dom/client': 'https://esm.sh/react-dom@18/client'
        }
      };

      // Return HTML with import map and compiled JavaScript
      return {
        text: `<script type="importmap">${JSON.stringify(importMap, null, 2)}</script>
<div style="color: blue; background-color: white; padding: 1em; border: 1px solid black;">George can hack, tonsils.</div>
<script type="module">${jsContent}</script>`,
      };
    } catch (error) {
      // If files don't exist or can't be read, provide helpful error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const errorText = `// Error: Failed to read compiled JavaScript for ${config.filename}
// ${errorMessage}
// Hint: Make sure to run "pnpm run build" to compile TypeScript files
// Expected file: dist/ts-resources/${config.filename}.js`;

      return {
        text: errorText,
      };
    }
  }

  // Return the complete resource definition
  return {
    config: {
      uri: createSaltedUri(config.uriId),
      name: config.name,
      description: config.description,
      mimeType: 'text/html+skybridge',
    },
    implementation,
  };
}
