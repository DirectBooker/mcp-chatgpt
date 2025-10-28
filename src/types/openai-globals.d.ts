export {};

declare global {
  interface Window {
    openai: Record<string, unknown>;
  }
}
