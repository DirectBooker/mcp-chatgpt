import { readdir, readFile, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import {
  createTypeScriptResource,
  TypeScriptResourceConfig,
} from './typescript-resource-factory.js';
import { ResourceDefinition } from './types.js';
import { logger } from '../shared/logger.js';

/**
 * Metadata configuration for auto-discovered TypeScript files
 * Place this in a comment block at the top of your TypeScript files
 */
interface TypeScriptFileMetadata {
  name?: string;
  description?: string;
  uriId?: string;
}

/**
 * Default descriptions based on filename patterns
 */
const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  sample: 'Basic TypeScript features including classes, interfaces, generics, and utility types',
  sample2:
    'Advanced TypeScript patterns with async/await, enums, conditional types, and error handling',
  'react-sample':
    'React TypeScript component with JSX, hooks, event handling, and modern React patterns',
  basic: 'Basic TypeScript examples and fundamentals',
  advanced: 'Advanced TypeScript patterns and features',
  hooks: 'React hooks and TypeScript integration examples',
  components: 'TypeScript component examples and patterns',
};

/**
 * Extract metadata from TypeScript file comments
 * Looks for @mcp-name, @mcp-description, @mcp-uri patterns in comments
 */
async function extractFileMetadata(filePath: string): Promise<TypeScriptFileMetadata> {
  try {
    const content = await readFile(filePath, 'utf-8');

    // Look for metadata in the first 20 lines (likely in header comments)
    const lines = content.split('\n').slice(0, 20);
    const metadata: TypeScriptFileMetadata = {};

    for (const line of lines) {
      // Match @mcp-name: "Display Name"
      const nameMatch = line.match(/@mcp-name:\s*["']([^"']+)["']/);
      if (nameMatch && nameMatch[1]) {
        metadata.name = nameMatch[1];
      }

      // Match @mcp-description: "Description text"
      const descMatch = line.match(/@mcp-description:\s*["']([^"']+)["']/);
      if (descMatch && descMatch[1]) {
        metadata.description = descMatch[1];
      }

      // Match @mcp-uri: "custom-uri-id"
      const uriMatch = line.match(/@mcp-uri:\s*["']([^"']+)["']/);
      if (uriMatch && uriMatch[1]) {
        metadata.uriId = uriMatch[1];
      }
    }

    return metadata;
  } catch {
    // If we can't read the file, return empty metadata
    return {};
  }
}

/**
 * Generate a display name from filename
 */
function generateDisplayName(filename: string): string {
  // Convert kebab-case or snake_case to Title Case
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\b(Ts|Js|React|Api|Ui|Ux)\b/g, match => match.toUpperCase());
}

/**
 * Generate a description based on filename patterns or use default
 */
function generateDescription(filename: string): string {
  // Check for exact matches first
  if (DEFAULT_DESCRIPTIONS[filename]) {
    return DEFAULT_DESCRIPTIONS[filename];
  }

  // Check for partial matches
  for (const [pattern, description] of Object.entries(DEFAULT_DESCRIPTIONS)) {
    if (filename.includes(pattern)) {
      return description;
    }
  }

  // Default description
  return `TypeScript demonstration file showcasing various language features and patterns`;
}

/**
 * Auto-discover TypeScript files and create MCP resources
 */
export async function discoverTypeScriptResources(): Promise<ResourceDefinition[]> {
  const resources: ResourceDefinition[] = [];

  try {
    const projectRoot = process.cwd();
    const typescriptDir = join(projectRoot, 'src/ts-resources');

    // Check if directory exists
    try {
      await stat(typescriptDir);
    } catch {
      logger.warn('TypeScript resources directory not found:', typescriptDir);
      return resources;
    }

    // Read all files in the ts-resources directory
    const files = await readdir(typescriptDir);

    // Filter for TypeScript/TSX files
    const tsFiles = files.filter(
      file =>
        ['.ts', '.tsx'].includes(extname(file)) && !file.startsWith('.') && !file.endsWith('.d.ts')
    );

    logger.info(`🔍 Auto-discovering ${tsFiles.length} TypeScript files...`);

    // Create resources for each TypeScript file
    for (const file of tsFiles) {
      const filename = basename(file, extname(file));
      const filePath = join(typescriptDir, file);

      try {
        // Extract metadata from file comments
        const metadata = await extractFileMetadata(filePath);

        // Create resource configuration
        const config: TypeScriptResourceConfig = {
          filename,
          uriId: metadata.uriId || filename,
          name: metadata.name || generateDisplayName(filename),
          description: metadata.description || generateDescription(filename),
        };

        // Create the resource using the factory
        const resource = createTypeScriptResource(config);
        resources.push(resource);

        logger.info(
          `✓ Auto-discovered TypeScript resource: dbk-ts://${config.uriId} (${config.name})`
        );
      } catch (error) {
        logger.warn(`⚠️  Failed to create resource for ${file}:`, error);
      }
    }

    return resources;
  } catch (error) {
    logger.error('Failed to auto-discover TypeScript resources:', error);
    return resources;
  }
}

/**
 * Get a list of discovered TypeScript files for informational purposes
 */
export async function getDiscoveredTypeScriptFiles(): Promise<string[]> {
  try {
    const projectRoot = process.cwd();
    const typescriptDir = join(projectRoot, 'src/ts-resources');

    const files = await readdir(typescriptDir);
    return files.filter(
      file =>
        ['.ts', '.tsx'].includes(extname(file)) && !file.startsWith('.') && !file.endsWith('.d.ts')
    );
  } catch {
    return [];
  }
}
