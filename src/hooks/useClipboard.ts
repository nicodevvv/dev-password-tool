import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook for clipboard operations with a temporary "Copied!" notification.
 * Uses Tauri clipboard plugin for secure clipboard access.
 */
export function useClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        // Try Tauri clipboard plugin first, fall back to navigator
        const { writeText } = await import(
          "@tauri-apps/plugin-clipboard-manager"
        );
        await writeText(text);
      } catch {
        // Fallback for development in browser
        await navigator.clipboard.writeText(text);
      }

      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), duration);
    },
    [duration]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { copied, copy };
}
