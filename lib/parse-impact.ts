import { ImpactData } from "./types";

const IMPACT_START = "<<<IMPACT_DATA>>>";
const IMPACT_END = "<<<END>>>";

export function parseImpactData(text: string): ImpactData | null {
  const startIdx = text.indexOf(IMPACT_START);
  const endIdx = text.indexOf(IMPACT_END);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  const jsonStr = text.slice(startIdx + IMPACT_START.length, endIdx).trim();

  try {
    const data = JSON.parse(jsonStr);
    if (
      Array.isArray(data.affectedShipmentIds) &&
      typeof data.revenueAtRisk === "number" &&
      typeof data.avgDelayDays === "number"
    ) {
      return data as ImpactData;
    }
    return null;
  } catch {
    return null;
  }
}

export function stripImpactData(text: string): string {
  const startIdx = text.indexOf(IMPACT_START);
  const endIdx = text.indexOf(IMPACT_END);

  if (startIdx === -1 || endIdx === -1) return text;

  return (
    text.slice(0, startIdx) + text.slice(endIdx + IMPACT_END.length)
  ).trim();
}
