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

      // Path to the bundled JavaScript file
      const jsFilePath = join(projectRoot, `dist/ts-resources-bundles/${config.filename}.js`);

      // Read the bundled JavaScript content
      const jsContent = await readFile(jsFilePath, 'utf-8');

      // Return minimal HTML that mounts a root div and executes the bundle
      return {
        text: `<div id="ts-resource-${config.uriId}"
                style="background: #ddd; padding: 1em"></div>
<script type="module">
${jsContent}
</script>`,
      };
    } catch (error) {
      // If files don't exist or can't be read, provide helpful error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const errorText = `// Error: Failed to read bundled JavaScript for ${config.filename}
// ${errorMessage}
// Hint: Run "pnpm run build:ts-resources" or "pnpm run build" to create bundles
// Expected file: dist/ts-resources-bundles/${config.filename}.js`;

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
