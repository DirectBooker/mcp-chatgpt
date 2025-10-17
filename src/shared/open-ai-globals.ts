// openai-hooks.ts
import { useSyncExternalStore } from 'react';

const SET_GLOBALS_EVENT_TYPE = 'openai:set_globals' as const;

function useOpenAiGlobal<K extends string>(key: K): unknown {
  return useSyncExternalStore(
    (onChange: () => void) => {
      const handler = (e: CustomEvent<{ globals: Partial<Record<string, unknown>> }>): void => {
        // Only re-render when the updated key is present (host may patch multiple keys)
        if (e.detail.globals[key] !== undefined) onChange();
      };
      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handler as EventListener, { passive: true });
      return (): void =>
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handler as EventListener);
    },
    // Snapshot: always read through the proxy (correct source of truth)
    (): unknown => (window as unknown as { openai: Record<string, unknown> }).openai[key]
  );
}

export function useToolOutput<T = unknown>(): T | null {
  return useOpenAiGlobal('toolOutput') as T | null;
}

export const useMaxHeight = (): number | undefined => {
  return useOpenAiGlobal('maxHeight') as number | undefined;
};

export const useDisplayMode = (): string => {
  return useOpenAiGlobal('displayMode') as string;
}