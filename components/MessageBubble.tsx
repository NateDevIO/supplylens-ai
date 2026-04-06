"use client";

import ReactMarkdown from "react-markdown";
import { stripImpactData } from "@/lib/parse-impact";
import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const rawText = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  const textContent = stripImpactData(rawText);

  if (!textContent.trim()) return null;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{textContent}</p>
        ) : (
          <div className="prose-chat text-sm">
            <ReactMarkdown>{textContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
