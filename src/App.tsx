import { useState, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import PasswordPage from "./pages/PasswordPage";
import SshPage from "./pages/SshPage";
import TokenPage from "./pages/TokenPage";
import HashPage from "./pages/HashPage";
import Base64Page from "./pages/Base64Page";
import type { Page } from "./utils/types";

/** Main application component with sidebar navigation. */
export default function App() {
  const [activePage, setActivePage] = useState<Page>("password");

  const onNavigate = useCallback((page: Page) => {
    setActivePage(page);
  }, []);

  // Keyboard shortcuts: Ctrl/Cmd + 1-5 to switch pages
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const pages: Page[] = ["password", "ssh", "token", "hash", "base64"];
      const num = parseInt(e.key);
      if (num >= 1 && num <= 5) {
        e.preventDefault();
        setActivePage(pages[num - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "password":
        return <PasswordPage />;
      case "ssh":
        return <SshPage />;
      case "token":
        return <TokenPage />;
      case "hash":
        return <HashPage />;
      case "base64":
        return <Base64Page />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-950 text-dark-100 overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">{renderPage()}</div>
      </main>
    </div>
  );
}
