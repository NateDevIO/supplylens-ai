"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { AppProvider, useAppState } from "@/lib/context";
import AppShell from "@/components/AppShell";
import ImpactDashboard from "@/components/ImpactDashboard";
import ChatPanel from "@/components/ChatPanel";
import ShipmentTable from "@/components/ShipmentTable";
import ExportBriefing from "@/components/ExportBriefing";
import ErrorBoundary from "@/components/ErrorBoundary";
import WelcomeOverlay from "@/components/WelcomeOverlay";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Loading map...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <PageContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

function PageContent() {
  const [exportOpen, setExportOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [demoRequested, setDemoRequested] = useState(false);
  const [mobileTab, setMobileTab] = useState<"map" | "chat">("map");
  const [chatKey, setChatKey] = useState(0);
  const { state, dispatch } = useAppState();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("supplylens-dark-mode");
    if (stored !== null) {
      setDarkMode(stored === "true");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("supplylens-dark-mode", String(darkMode));
  }, [darkMode]);

  const handleGetStarted = () => {
    setShowWelcome(false);
    // On mobile, switch to Chat tab so users know where to interact
    if (window.innerWidth < 768) setMobileTab("chat");
  };

  const handleWatchDemo = () => {
    setShowWelcome(false);
    if (window.innerWidth < 768) setMobileTab("chat");
    setDemoRequested(true);
  };

  return (
    <>
      {showWelcome && (
        <WelcomeOverlay
          onGetStarted={handleGetStarted}
          onWatchDemo={handleWatchDemo}
        />
      )}
      <AppShell
        nav={
          <NavBar
            onExport={() => setExportOpen(true)}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(!darkMode)}
            mobileTab={mobileTab}
            onMobileTabChange={setMobileTab}
            hasActiveScenario={!!(state.activeScenario || state.impactData)}
            hasMapData={!!(state.impactData && state.impactData.affectedShipmentIds.length > 0)}
            onReset={() => {
              dispatch({ type: "RESET" });
              setChatKey((k) => k + 1);
            }}
            onShowWelcome={() => {
              dispatch({ type: "RESET" });
              setChatKey((k) => k + 1);
              setShowWelcome(true);
            }}
          />
        }
        map={<MapView />}
        dashboard={
          <div>
            <ImpactDashboard />
            {state.impactData &&
              state.impactData.affectedShipmentIds.length > 0 && (
                <div className="px-4 pb-3">
                  <button
                    onClick={() =>
                      dispatch({ type: "TOGGLE_SHIPMENT_TABLE", payload: true })
                    }
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium cursor-pointer"
                  >
                    View affected shipments ({state.impactData.affectedShipmentIds.length}) →
                  </button>
                </div>
              )}
          </div>
        }
        chat={
          <ChatPanel
            key={chatKey}
            demoRequested={demoRequested}
            onDemoStarted={() => setDemoRequested(false)}
            onSwitchToMap={() => setMobileTab("map")}
          />
        }
        shipmentTable={<ShipmentTable />}
        mobileTab={mobileTab}
      />
      <ExportBriefing
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </>
  );
}

function NavBar({
  onExport,
  darkMode,
  onToggleDark,
  mobileTab,
  onMobileTabChange,
  hasActiveScenario,
  hasMapData,
  onReset,
  onShowWelcome,
}: {
  onExport: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  mobileTab: "map" | "chat";
  onMobileTabChange: (tab: "map" | "chat") => void;
  hasActiveScenario: boolean;
  hasMapData: boolean;
  onReset: () => void;
  onShowWelcome: () => void;
}) {
  return (
    <nav className="bg-navy-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg z-10">
      <button
        onClick={() => {
          onReset();
          onShowWelcome();
        }}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        aria-label="Return to welcome screen"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
          SL
        </div>
        <div className="text-left">
          <h1 className="text-lg font-semibold tracking-tight leading-none">
            SupplyLens{" "}
            <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase hidden sm:block">
            Supply Chain Intelligence
          </p>
        </div>
      </button>

      {/* Mobile tab switcher */}
      <div className="flex md:hidden bg-white/10 rounded-lg p-0.5" role="tablist" aria-label="View switcher">
        <button
          role="tab"
          aria-selected={mobileTab === "map"}
          onClick={() => onMobileTabChange("map")}
          className={`relative px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            mobileTab === "map" ? "bg-blue-500 text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          Map
          {hasMapData && mobileTab !== "map" && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        <button
          role="tab"
          aria-selected={mobileTab === "chat"}
          onClick={() => onMobileTabChange("chat")}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            mobileTab === "chat" ? "bg-blue-500 text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          Chat
        </button>
      </div>

      <div className="flex items-center gap-2">
        {hasActiveScenario && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-md transition-colors border border-white/10 cursor-pointer flex items-center gap-1.5"
            aria-label="Reset to default view"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
        <button
          onClick={onToggleDark}
          className="p-2 text-sm hover:bg-white/10 rounded-md transition-colors border border-transparent hover:border-white/10 cursor-pointer"
          title={darkMode ? "Light mode" : "Dark mode"}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <button
          onClick={onExport}
          className="hidden sm:block px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors border border-white/10 cursor-pointer"
          aria-label="Export briefing"
        >
          Export Briefing
        </button>
      </div>
    </nav>
  );
}
