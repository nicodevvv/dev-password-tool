import { useState, useCallback, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useClipboard } from "../hooks/useClipboard";
import PageHeader from "../components/PageHeader";
import CopyButton from "../components/CopyButton";
import type { HashResult } from "../utils/types";

/** Hash Generator page with live hashing. */
export default function HashPage() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [result, setResult] = useState<HashResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { copied, copy } = useClipboard();

  const computeHash = useCallback(
    async (text: string, algo: string) => {
      if (!text) {
        setResult(null);
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const res = await invoke<HashResult>("cmd_generate_hash", {
          input: text,
          algorithm: algo,
        });
        setResult(res);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Live hashing with debounce (bcrypt is slow, so use longer debounce)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = algorithm === "bcrypt" ? 500 : 150;
    debounceRef.current = setTimeout(() => {
      computeHash(input, algorithm);
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, algorithm, computeHash]);

  return (
    <div>
      <PageHeader
        icon="#️⃣"
        title="Hash Generator"
        description="Hash text using SHA-256, SHA-512, or bcrypt. Results update live as you type."
      />

      <div className="space-y-5">
        {/* Algorithm selector */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Algorithm</label>
          <div className="flex gap-2">
            {[
              { value: "sha256", label: "SHA-256" },
              { value: "sha512", label: "SHA-512" },
              { value: "bcrypt", label: "bcrypt" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setAlgorithm(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  algorithm === value
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
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to hash..."
            rows={4}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-dark-100 placeholder-dark-500 resize-none"
          />
          <div className="text-xs text-dark-500 mt-1">
            {input.length} characters • Live hashing {algorithm === "bcrypt" ? "(bcrypt is slower)" : ""}
          </div>
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
              <div className="flex items-center gap-3 text-xs text-dark-400">
                <span>Algorithm: <span className="text-dark-200 font-medium">{result.algorithm}</span></span>
                <span>Input: <span className="text-dark-200">{result.input_length} chars</span></span>
                {loading && <span className="text-accent-hover animate-pulse">Computing...</span>}
              </div>
              <CopyButton text={result.hash} copied={copied} onCopy={copy} />
            </div>
            <div className="bg-dark-950 border border-dark-600 rounded-lg px-4 py-3 font-mono text-sm text-dark-50 break-all select-all">
              {result.hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
