import { getStrengthBarColor, getStrengthColor, getStrengthPercent } from "../utils/constants";

interface StrengthMeterProps {
  strength: string;
  entropy: number;
  crackTime: string;
}

/** Visual password strength indicator with entropy details. */
export default function StrengthMeter({ strength, entropy, crackTime }: StrengthMeterProps) {
  const percent = getStrengthPercent(strength);
  const barColor = getStrengthBarColor(strength);
  const textColor = getStrengthColor(strength);

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={`text-sm font-semibold min-w-[90px] text-right ${textColor}`}>
          {strength}
        </span>
      </div>

      {/* Details */}
      <div className="flex justify-between text-xs text-dark-400">
        <span>
          Entropy: <span className="text-dark-200 font-mono">{entropy.toFixed(1)} bits</span>
        </span>
        <span>
          Crack time: <span className="text-dark-200">{crackTime}</span>
        </span>
      </div>
    </div>
  );
}
