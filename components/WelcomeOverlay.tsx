"use client";

import { useEffect } from "react";

interface WelcomeOverlayProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

export default function WelcomeOverlay({
  onGetStarted,
  onWatchDemo,
}: WelcomeOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onGetStarted();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onGetStarted]);

  return (
    <div className="fixed inset-0 z-[9998] bg-navy-900/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-lg text-center">
        <div className="w-14 h-14 mx-auto mb-5 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/30">
          SL
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          SupplyLens <span className="text-blue-400">AI</span>
        </h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-6">
          Supply Chain Intelligence
        </p>
        <p className="text-gray-300 text-base leading-relaxed mb-8">
          Analyze supply chain disruptions in real-time with AI-powered
          scenario planning. Simulate hurricanes, port congestion, trade
          conflicts and more across a live shipment network — then get
          actionable intelligence on impact, alternative routes, and
          recommended mitigations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGetStarted}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm cursor-pointer shadow-lg shadow-blue-600/25"
          >
            Get Started
          </button>
          <button
            onClick={onWatchDemo}
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm cursor-pointer border border-white/10"
          >
            Watch Demo
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-6">
          Built with Next.js, Vercel AI SDK, Leaflet &amp; Claude
        </p>
      </div>
    </div>
  );
}
