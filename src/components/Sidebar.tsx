import { type Page, type NavItem } from "../utils/types";
import { NAV_ITEMS } from "../utils/constants";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

/** Sidebar navigation component. */
export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 bg-dark-900 border-r border-dark-700 flex flex-col no-select shrink-0">
      {/* App title */}
      <div className="px-4 py-5 border-b border-dark-700">
        <h1 className="text-lg font-bold text-dark-100 tracking-tight">
          🛡️ Dev Password Tool
        </h1>
        <p className="text-xs text-dark-400 mt-1">Crypto utilities for devs</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {NAV_ITEMS.map((item: NavItem) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === item.id
                ? "bg-accent/15 text-accent-hover border border-accent/30"
                : "text-dark-300 hover:bg-dark-800 hover:text-dark-100 border border-transparent"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-dark-700">
        <p className="text-xs text-dark-500">v1.0.0 • Offline-first</p>
      </div>
    </aside>
  );
}
