import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useClipboard } from "../hooks/useClipboard";
import PageHeader from "../components/PageHeader";
import CopyButton from "../components/CopyButton";
import OutputBox from "../components/OutputBox";
import type { SshKeyResult } from "../utils/types";

/** SSH Key Generator page. */
export default function SshPage() {
  const [keyType, setKeyType] = useState("ed25519");
  const [comment, setComment] = useState("user@devtool");
  const [passphrase, setPassphrase] = useState("");
  const [result, setResult] = useState<SshKeyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { copied: copiedPublic, copy: copyPublic } = useClipboard();
  const { copied: copiedPrivate, copy: copyPrivate } = useClipboard();

  const generate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await invoke<SshKeyResult>("cmd_generate_ssh_key", {
        keyType,
        comment,
        passphrase: passphrase || null,
      });
      setResult(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [keyType, comment, passphrase]);

  return (
    <div>
      <PageHeader
        icon="🔑"
        title="SSH Key Generator"
        description="Generate Ed25519 or RSA SSH key pairs with optional passphrase encryption."
      />

      <div className="space-y-5">
        {/* Key type selector */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Key Type</label>
          <div className="flex gap-2">
            {[
              { value: "ed25519", label: "Ed25519" },
              { value: "rsa2048", label: "RSA 2048" },
              { value: "rsa4096", label: "RSA 4096" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setKeyType(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  keyType === value
                    ? "bg-accent/15 text-accent-hover border-accent/30"
                    : "bg-dark-900 text-dark-400 border-dark-700 hover:border-dark-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            Comment / Key Name
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="user@hostname"
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-dark-100 placeholder-dark-500"
          />
        </div>

        {/* Passphrase */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            Passphrase <span className="text-dark-500">(optional)</span>
          </label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter passphrase to encrypt private key"
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-dark-100 placeholder-dark-500"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2.5 bg-accent hover:bg-accent-dim text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate SSH Key Pair"}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Key info */}
            <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 flex items-center gap-4 text-sm">
              <span className="text-dark-400">Type:</span>
              <span className="text-dark-100 font-medium">{result.key_type}</span>
              <span className="text-dark-600">|</span>
              <span className="text-dark-400">Fingerprint:</span>
              <span className="text-dark-100 font-mono text-xs">{result.fingerprint}</span>
            </div>

            {/* Public key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-dark-300">Public Key</label>
                <CopyButton
                  text={result.public_key}
                  copied={copiedPublic}
                  onCopy={copyPublic}
                  label="Copy Public Key"
                />
              </div>
              <OutputBox value={result.public_key} rows={3} />
            </div>

            {/* Private key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-dark-300">Private Key</label>
                <CopyButton
                  text={result.private_key}
                  copied={copiedPrivate}
                  onCopy={copyPrivate}
                  label="Copy Private Key"
                />
              </div>
              <OutputBox value={result.private_key} rows={8} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
