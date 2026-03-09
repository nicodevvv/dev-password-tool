import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useClipboard } from "../hooks/useClipboard";
import PageHeader from "../components/PageHeader";
import CopyButton from "../components/CopyButton";
import type { TokenResult } from "../utils/types";

/** Token Generator page. */
export default function TokenPage() {
  const [byteLength, setByteLength] = useState(32);
  const [format, setFormat] = useState("hex");
  const [result, setResult] = useState<TokenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { copied, copy } = useClipboard();

  const generate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await invoke<TokenResult>("cmd_generate_token", {
        byteLength,
        format,
      });
      setResult(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [byteLength, format]);

  return (
    <div>
      <PageHeader
        icon="🎫"
        title="Token Generator"
        description="Generate cryptographically secure random tokens for API keys, sessions, and secrets."
      />

      <div className="space-y-5">
        {/* Byte length */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-dark-300">Token Size (bytes)</label>
            <span className="text-sm font-mono text-accent-hover bg-dark-800 px-2 py-0.5 rounded">
              {byteLength}
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={128}
            value={byteLength}
            onChange={(e) => setByteLength(Number(e.target.value))}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>8 bytes</span>
            <span>128 bytes</span>
          </div>
        </div>

        {/* Format selector */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Output Format</label>
          <div className="flex gap-2">
            {[
              { value: "hex", label: "Hex" },
              { value: "base64", label: "Base64" },
              { value: "url-safe", label: "URL-Safe" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFormat(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  format === value
                    ? "bg-accent/15 text-accent-hover border-accent/30"
                    : "bg-dark-900 text-dark-400 border-dark-700 hover:border-dark-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2.5 bg-accent hover:bg-accent-dim text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Token"}
        </button>

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
                <span>Format: <span className="text-dark-200">{result.format}</span></span>
                <span>Bytes: <span className="text-dark-200">{result.byte_length}</span></span>
                <span>Chars: <span className="text-dark-200">{result.char_length}</span></span>
              </div>
              <CopyButton text={result.token} copied={copied} onCopy={copy} />
            </div>
            <div className="bg-dark-950 border border-dark-600 rounded-lg px-4 py-3 font-mono text-sm text-dark-50 break-all select-all">
              {result.token}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
