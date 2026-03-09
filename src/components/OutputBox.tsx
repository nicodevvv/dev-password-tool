interface OutputBoxProps {
  value: string;
  label?: string;
  mono?: boolean;
  rows?: number;
}

/** Read-only output display box for generated content. */
export default function OutputBox({
  value,
  label,
  mono = true,
  rows = 3,
}: OutputBoxProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-dark-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        readOnly
        value={value}
        rows={rows}
        className={`w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-dark-100 resize-none focus:border-accent/50 ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}
