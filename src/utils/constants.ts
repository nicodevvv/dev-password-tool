import type { NavItem } from "./types";

/** Navigation items for the sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { id: "password", label: "Password Generator", icon: "🔐" },
  { id: "ssh", label: "SSH Keys", icon: "🔑" },
  { id: "token", label: "Token Generator", icon: "🎫" },
  { id: "hash", label: "Hash Generator", icon: "#️⃣" },
  { id: "base64", label: "Base64 Tool", icon: "🔄" },
];

/** Get strength color class based on strength label. */
export function getStrengthColor(strength: string): string {
  switch (strength) {
    case "Very Weak":
      return "text-red-500";
    case "Weak":
      return "text-orange-500";
    case "Reasonable":
      return "text-yellow-500";
    case "Strong":
      return "text-green-500";
    case "Very Strong":
      return "text-emerald-400";
    default:
      return "text-dark-300";
  }
}

/** Get strength bar width percentage. */
export function getStrengthPercent(strength: string): number {
  switch (strength) {
    case "Very Weak":
      return 10;
    case "Weak":
      return 30;
    case "Reasonable":
      return 55;
    case "Strong":
      return 80;
    case "Very Strong":
      return 100;
    default:
      return 0;
  }
}

/** Get strength bar color class. */
export function getStrengthBarColor(strength: string): string {
  switch (strength) {
    case "Very Weak":
      return "bg-red-500";
    case "Weak":
      return "bg-orange-500";
    case "Reasonable":
      return "bg-yellow-500";
    case "Strong":
      return "bg-green-500";
    case "Very Strong":
      return "bg-emerald-400";
    default:
      return "bg-dark-600";
  }
}
