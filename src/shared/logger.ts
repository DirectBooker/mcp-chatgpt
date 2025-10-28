// Simple stderr-first logger to avoid MCP stdout interference
// In Node, console.error and console.warn write to stderr
// In browsers, these map to standard console methods; this wrapper also allows gating debug logs.

/* eslint-disable no-console */
function isDebugEnabled(): boolean {
  try {
    const g = globalThis as unknown as {
      process?: { env?: Record<string, string | undefined> };
    };
    const dbg = g.process?.env?.DEBUG;
    return typeof dbg === 'string' && dbg.length > 0;
  } catch {
    return false;
  }
}

export const logger = {
  http: (...args: unknown[]): void => {
    console.error('[HTTP]', ...args);
  },
  mcp: (...args: unknown[]): void => {
    console.error('[MCP]', ...args);
  },
  info: (...args: unknown[]): void => {
    console.error(...args);
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
  debug: (...args: unknown[]): void => {
    if (isDebugEnabled()) console.error('[DEBUG]', ...args);
  },
};
