import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useClipboard } from "../hooks/useClipboard";
import PageHeader from "../components/PageHeader";
import CopyButton from "../components/CopyButton";
import type { Base64Result } from "../utils/types";

/** Base64 Encode/Decode Tool page. */
export default function Base64Page() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [result, setResult] = useState<Base64Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { copied, copy } = useClipboard();

  const process = useCallback(async () => {
    if (!input.trim()) {
      setError("Please enter some text");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await invoke<Base64Result>("cmd_base64", {
        input,
        mode,
      });
      setResult(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [input, mode]);

  /** Swap input/output for quick round-trip conversion. */
  const swap = useCallback(() => {
    if (result) {
      setInput(result.output);
      setMode(mode === "encode" ? "decode" : "encode");
      setResult(null);
    }
  }, [result, mode]);

  return (
    <div>
      <PageHeader
        icon="🔄"
        title="Base64 Tool"
        description="Encode text to Base64 or decode Base64 back to text with validation."
      />

      <div className="space-y-5">
        {/* Mode selector */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Mode</label>
          <div className="flex gap-2">
            {[
              { value: "encode" as const, label: "Encode → Base64" },
              { value: "decode" as const, label: "Decode → Text" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setMode(value);
                  setResult(null);
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  mode === value
                    ? "bg-accent/15 text-accent-hover border-accent/30"
                    : "bg-dark-900 text-dark-400 border-dark-700 hover:border-dark-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            {mode === "encode" ? "Plain Text" : "Base64 Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Enter text to encode..."
                : "Paste Base64 string to decode..."
            }
            rows={5}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-dark-100 placeholder-dark-500 font-mono resize-none"
          />
          <div className="text-xs text-dark-500 mt-1">{input.length} characters</div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={process}
            disabled={loading || !input.trim()}
            className="flex-1 py-2.5 bg-accent hover:bg-accent-dim text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : mode === "encode" ? "Encode" : "Decode"}
          </button>
          {result && (
            <button
              onClick={swap}
              className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-200 font-medium rounded-lg border border-dark-600 transition-colors"
            >
              ⇄ Swap
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-dark-900 border border-dark-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-dark-400">
                <span>Mode: <span className="text-dark-200">{result.mode}</span></span>
                <span>In: <span className="text-dark-200">{result.input_length} chars</span></span>
                <span>Out: <span className="text-dark-200">{result.output_length} chars</span></span>
              </div>
              <CopyButton text={result.output} copied={copied} onCopy={copy} />
            </div>
            <div className="bg-dark-950 border border-dark-600 rounded-lg px-4 py-3 font-mono text-sm text-dark-50 break-all select-all whitespace-pre-wrap">
              {result.output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
