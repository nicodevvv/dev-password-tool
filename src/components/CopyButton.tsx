interface CopyButtonProps {
  text: string;
  copied: boolean;
  onCopy: (text: string) => void;
  label?: string;
  className?: string;
}

/** Reusable copy-to-clipboard button with "Copied!" feedback. */
export default function CopyButton({
  text,
  copied,
  onCopy,
  label = "Copy",
  className = "",
}: CopyButtonProps) {
  return (
    <button
      onClick={() => onCopy(text)}
      disabled={!text}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        copied
          ? "bg-green-600/20 text-green-400 border border-green-500/30"
          : "bg-accent/15 text-accent-hover hover:bg-accent/25 border border-accent/30"
      } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {copied ? "✓ Copied!" : label}
    </button>
  );
}
