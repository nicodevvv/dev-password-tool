import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useClipboard } from "../hooks/useClipboard";
import PageHeader from "../components/PageHeader";
import CopyButton from "../components/CopyButton";
import StrengthMeter from "../components/StrengthMeter";
import type { PasswordResult } from "../utils/types";

/** Password Generator page. */
export default function PasswordPage() {
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [special, setSpecial] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { copied, copy } = useClipboard();

  const generate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await invoke<PasswordResult>("cmd_generate_password", {
        length,
        uppercase,
        lowercase,
        numbers,
        special,
        excludeAmbiguous,
      });
      setResult(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [length, uppercase, lowercase, numbers, special, excludeAmbiguous]);

  const toggleOption = (
    setter: (v: boolean) => void,
    current: boolean
  ) => {
    // Ensure at least one option remains enabled
    const activeCount = [uppercase, lowercase, numbers, special].filter(Boolean).length;
    if (current && activeCount <= 1) return;
    setter(!current);
  };

  return (
    <div>
      <PageHeader
        icon="🔐"
        title="Password Generator"
        description="Generate cryptographically secure passwords with customizable options."
      />

      <div className="space-y-5">
        {/* Length slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-dark-300">Password Length</label>
            <span className="text-sm font-mono text-accent-hover bg-dark-800 px-2 py-0.5 rounded">
              {length}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Character set options */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Uppercase (A-Z)", value: uppercase, setter: setUppercase },
            { label: "Lowercase (a-z)", value: lowercase, setter: setLowercase },
            { label: "Numbers (0-9)", value: numbers, setter: setNumbers },
            { label: "Special (!@#$...)", value: special, setter: setSpecial },
          ].map(({ label, value, setter }) => (
            <label
              key={label}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                value
                  ? "bg-accent/10 border-accent/30 text-dark-100"
                  : "bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-500"
              }`}
            >
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleOption(setter, value)}
                className="hidden"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  value ? "bg-accent border-accent" : "border-dark-500"
                }`}
              >
                {value && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>

        {/* Exclude ambiguous */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={() => setExcludeAmbiguous(!excludeAmbiguous)}
            className="hidden"
          />
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              excludeAmbiguous ? "bg-accent border-accent" : "border-dark-500"
            }`}
          >
            {excludeAmbiguous && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-dark-300">
            Exclude ambiguous characters (O, 0, l, I, 1, |)
          </span>
        </label>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2.5 bg-accent hover:bg-accent-dim text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Password"}
        </button>

        {/* Error display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 bg-dark-900 border border-dark-700 rounded-lg p-4">
            {/* Password output */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-dark-950 border border-dark-600 rounded-lg px-4 py-3 font-mono text-sm text-dark-50 break-all select-all">
                {result.password}
              </div>
              <CopyButton text={result.password} copied={copied} onCopy={copy} />
            </div>

            {/* Strength meter */}
            <StrengthMeter
              strength={result.strength}
              entropy={result.entropy}
              crackTime={result.crack_time}
            />
          </div>
        )}
      </div>
    </div>
  );
}
