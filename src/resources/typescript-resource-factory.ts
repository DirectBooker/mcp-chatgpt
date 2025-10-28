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
  const envSalt = process.env['TS_SALT'];
  if (envSalt && envSalt.length > 0) {
    urlSalt = envSalt;
    console.error(`✓ TypeScript resource URL salt initialized from TS_SALT env var`);
  } else {
    urlSalt = Date.now().toString();
    console.error(`✓ TypeScript resource URL salt initialized from app start time: ${urlSalt}`);
  }
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
      // TODO(george): Cache bundled JS and Tailwind CSS contents per filename and invalidate on file mtime to avoid per-request disk reads.
      const jsContent = await readFile(jsFilePath, 'utf-8');

      // Inline Tailwind CSS (no external references)
      // TODO(george): Generate and inline per-resource Tailwind CSS (e.g., dist/assets/ts-resources/${config.filename}.css)
      //               by running Tailwind with a narrowed content set for this entry to reduce CSS size.
      const cssFilePath = join(projectRoot, 'dist/assets/tailwind.css');
      let cssContent = '';
      try {
        cssContent = await readFile(cssFilePath, 'utf-8');
      } catch {
        cssContent = '/* tailwind.css not found; run "pnpm run build:css" to generate */';
      }

      // Return minimal HTML with inlined CSS, root div, and bundled module
      // Inject Mapbox token from environment if provided
      const token = process.env['MAPBOX_TOKEN'];
      const injectTokenScript = token
        ? `<script>window.DBK_MAPBOX_TOKEN = ${JSON.stringify(token)};</script>`
        : '';

      return {
        text: `<style>${cssContent}</style>
        <div id="ts-resource-${config.uriId}"
                style="background: #ddd; padding: 1em">Developer preview</div>
${injectTokenScript}
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
