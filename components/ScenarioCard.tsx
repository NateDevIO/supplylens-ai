"use client";

import { type DisruptionScenario } from "@/lib/types";

interface ScenarioCardProps {
  scenario: DisruptionScenario;
  onClick: () => void;
  disabled?: boolean;
}

export default function ScenarioCard({
  scenario,
  onClick,
  disabled,
}: ScenarioCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-full
        hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500 active:bg-gray-100 dark:active:bg-slate-600 transition-all disabled:opacity-50
        disabled:cursor-not-allowed whitespace-nowrap cursor-pointer dark:text-gray-200"
    >
      <span className="mr-1">{scenario.icon}</span>
      {scenario.name}
    </button>
  );
}
