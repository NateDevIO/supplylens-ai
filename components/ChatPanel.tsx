"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useCallback, useState } from "react";
import { useAppState } from "@/lib/context";
import { scenarios } from "@/lib/mock-data";
import { parseImpactData } from "@/lib/parse-impact";
import { DEMO_PROMPT, DEMO_RESPONSE } from "@/lib/demo-response";
import {
  computeDefaultKPIs,
  formatCurrency,
  getUniqueRoutes,
} from "@/lib/analysis";
import MessageBubble from "./MessageBubble";
import ScenarioCard from "./ScenarioCard";
import type { DisruptionScenario, ImpactData } from "@/lib/types";
import type { UIMessage } from "ai";

function getMessageText(message: {
  parts: Array<{ type: string; text?: string }>;
}): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface ChatPanelProps {
  demoRequested?: boolean;
  onDemoStarted?: () => void;
  onSwitchToMap?: () => void;
}

export default function ChatPanel({ demoRequested, onDemoStarted, onSwitchToMap }: ChatPanelProps) {
  const { state, dispatch } = useAppState();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [demoMessages, setDemoMessages] = useState<UIMessage[] | null>(null);
  const [demoTyping, setDemoTyping] = useState(false);
  const demoTriggered = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollIndicators();
    window.addEventListener("resize", updateScrollIndicators);
    return () => window.removeEventListener("resize", updateScrollIndicators);
  }, [updateScrollIndicators]);

  const kpis = computeDefaultKPIs(state.shipments);
  const routes = getUniqueRoutes(state.shipments);

  const welcomeText = `Welcome to SupplyLens AI. I'm currently monitoring **${kpis.totalShipments} active shipments** across **${routes} routes** with a combined value of **${formatCurrency(kpis.totalValue)}**. ${kpis.delayed} shipments are currently flagged for delays.\n\nDescribe a disruption scenario, or select one below to begin analysis.`;

  const welcomeMessage: UIMessage = {
    id: "welcome",
    role: "assistant" as const,
    parts: [{ type: "text" as const, text: welcomeText }],
  };

  const { messages, sendMessage, status, error } = useChat({
    id: "supply-lens",
    messages: [welcomeMessage],
  });

  const isActive = status === "streaming" || status === "submitted";
  const isDemoMode = demoMessages !== null;
  const displayMessages = isDemoMode ? demoMessages : messages;

  // Handle demo mode
  useEffect(() => {
    if (demoRequested && !demoTriggered.current) {
      demoTriggered.current = true;
      onDemoStarted?.();

      const scenario = scenarios.find((s) => s.id === "midwest-winter-storm") ?? scenarios[0];
      dispatch({ type: "SET_SCENARIO", payload: scenario });

      // Show user message immediately
      const userMsg: UIMessage = {
        id: "demo-user",
        role: "user",
        parts: [{ type: "text", text: DEMO_PROMPT }],
      };
      setDemoMessages([welcomeMessage, userMsg]);
      setDemoTyping(true);

      // After a brief delay, show the "AI" response
      setTimeout(() => {
        const assistantMsg: UIMessage = {
          id: "demo-assistant",
          role: "assistant",
          parts: [{ type: "text", text: DEMO_RESPONSE }],
        };
        setDemoMessages([welcomeMessage, userMsg, assistantMsg]);
        setDemoTyping(false);

        // Parse impact data from demo response
        const impactData = parseImpactData(DEMO_RESPONSE);
        if (impactData) {
          dispatch({ type: "SET_IMPACT_DATA", payload: impactData });
        }
      }, 2000);
    }
  }, [demoRequested, onDemoStarted, dispatch, welcomeMessage]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  // Parse impact data from completed assistant messages (live mode)
  useEffect(() => {
    if (isDemoMode || isActive) return;
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (lastAssistant && lastAssistant.id !== "welcome") {
      const text = getMessageText(lastAssistant);
      const impactData = parseImpactData(text);
      if (impactData) {
        dispatch({ type: "SET_IMPACT_DATA", payload: impactData });
      }
    }
  }, [messages, isActive, isDemoMode, dispatch]);

  const handleScenarioSelect = useCallback(
    (scenario: DisruptionScenario) => {
      // Exit demo mode if active
      if (isDemoMode) setDemoMessages(null);

      dispatch({ type: "SET_SCENARIO", payload: scenario });
      dispatch({
        type: "SET_IMPACT_DATA",
        payload: {
          affectedShipmentIds: [],
          revenueAtRisk: 0,
          avgDelayDays: 0,
          alternativeRoutes: 0,
          disruptionZone: scenario.affectedRegion,
          shipmentStatusUpdates: [],
        },
      });
      sendMessage({ text: scenario.promptTemplate });
    },
    [dispatch, sendMessage, isDemoMode]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isActive) {
      if (isDemoMode) setDemoMessages(null);
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-800">
      {/* Scenario presets */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 shrink-0">
        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Analyze a Disruption Scenario
        </p>
        <div className="relative">
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50/90 dark:from-slate-900/90 to-transparent z-10 pointer-events-none" />
          )}
          <div
            ref={scrollRef}
            onScroll={updateScrollIndicators}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
          >
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onClick={() => handleScenarioSelect(scenario)}
                disabled={isActive || demoTyping}
              />
            ))}
          </div>
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50/90 dark:from-slate-900/90 to-transparent z-10 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {displayMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {(isActive || demoTyping) && (
          <div className="flex items-center gap-1.5 px-4 py-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        )}
        {error && (
          <div className="mx-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error.message.includes("401") || error.message.includes("API key")
              ? "API key not configured. Click a scenario button above or try the demo to see the app in action."
              : `Error: ${error.message}`}
          </div>
        )}
        {onSwitchToMap && state.impactData && state.impactData.affectedShipmentIds.length > 0 && !isActive && !demoTyping && (
          <button
            onClick={onSwitchToMap}
            className="mx-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors md:hidden animate-fade-in"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Tap <strong>Map</strong> to see affected shipments and disruption zone
          </button>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a disruption scenario..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400"
            disabled={isActive || demoTyping}
            aria-label="Disruption scenario input"
          />
          <button
            type="submit"
            disabled={isActive || demoTyping || !input.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
