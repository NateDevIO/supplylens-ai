"use client";

import { type ReactNode } from "react";

interface AppShellProps {
  nav: ReactNode;
  map: ReactNode;
  dashboard: ReactNode;
  chat: ReactNode;
  shipmentTable?: ReactNode;
  mobileTab?: "map" | "chat";
}

export default function AppShell({
  nav,
  map,
  dashboard,
  chat,
  shipmentTable,
  mobileTab = "map",
}: AppShellProps) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gray-50 dark:bg-slate-900">
      {nav}

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_420px] lg:grid-cols-[1fr_480px] min-h-0">
        {/* Left column: Map + Dashboard */}
        <div className={`flex flex-col min-h-0 overflow-hidden ${mobileTab === "chat" ? "hidden md:flex" : "flex"}`}>
          <div className="flex-[65] min-h-0 relative">{map}</div>
          <div className="flex-[35] min-h-0 overflow-y-auto border-t border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-900/80 scrollbar-thin">
            {dashboard}
          </div>
        </div>

        {/* Right column: Chat Panel */}
        <div className={`min-h-0 border-l-0 md:border-l border-gray-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800 overflow-hidden ${mobileTab === "map" ? "hidden md:flex" : "flex"}`}>
          {chat}
        </div>
      </main>

      {shipmentTable}
    </div>
  );
}
