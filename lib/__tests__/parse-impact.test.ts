import { describe, it, expect } from "vitest";
import { parseImpactData, stripImpactData } from "../parse-impact";

const validImpactJSON = JSON.stringify({
  affectedShipmentIds: ["SHP-2024-0801", "SHP-2024-0802"],
  revenueAtRisk: 1500000,
  avgDelayDays: 3,
  alternativeRoutes: 2,
  disruptionZone: {
    center: { lat: 29.9, lng: -90.1, label: "Gulf Coast" },
    radiusKm: 500,
  },
  shipmentStatusUpdates: [
    { id: "SHP-2024-0801", newStatus: "delayed", reason: "Hurricane path" },
  ],
});

function wrapImpact(json: string): string {
  return `Some analysis text here.\n\n<<<IMPACT_DATA>>>\n${json}\n<<<END>>>\n`;
}

describe("parseImpactData", () => {
  it("parses valid impact data from AI response", () => {
    const text = wrapImpact(validImpactJSON);
    const result = parseImpactData(text);

    expect(result).not.toBeNull();
    expect(result!.affectedShipmentIds).toEqual([
      "SHP-2024-0801",
      "SHP-2024-0802",
    ]);
    expect(result!.revenueAtRisk).toBe(1500000);
    expect(result!.avgDelayDays).toBe(3);
    expect(result!.alternativeRoutes).toBe(2);
    expect(result!.disruptionZone.center.lat).toBe(29.9);
    expect(result!.shipmentStatusUpdates).toHaveLength(1);
  });

  it("returns null when no delimiters present", () => {
    expect(parseImpactData("Just a regular response")).toBeNull();
  });

  it("returns null when only start delimiter present", () => {
    expect(parseImpactData("Text <<<IMPACT_DATA>>> but no end")).toBeNull();
  });

  it("returns null when only end delimiter present", () => {
    expect(parseImpactData("Text <<<END>>> but no start")).toBeNull();
  });

  it("returns null when end comes before start", () => {
    const text = "<<<END>>> some text <<<IMPACT_DATA>>>{}\n";
    expect(parseImpactData(text)).toBeNull();
  });

  it("returns null for invalid JSON between delimiters", () => {
    const text = "<<<IMPACT_DATA>>>\n{not valid json}\n<<<END>>>";
    expect(parseImpactData(text)).toBeNull();
  });

  it("returns null when required fields are missing", () => {
    const incomplete = JSON.stringify({
      affectedShipmentIds: ["SHP-001"],
      // missing revenueAtRisk and avgDelayDays
    });
    expect(parseImpactData(wrapImpact(incomplete))).toBeNull();
  });

  it("returns null when affectedShipmentIds is not an array", () => {
    const bad = JSON.stringify({
      affectedShipmentIds: "SHP-001",
      revenueAtRisk: 100,
      avgDelayDays: 1,
    });
    expect(parseImpactData(wrapImpact(bad))).toBeNull();
  });

  it("returns null when revenueAtRisk is not a number", () => {
    const bad = JSON.stringify({
      affectedShipmentIds: ["SHP-001"],
      revenueAtRisk: "1.5M",
      avgDelayDays: 1,
    });
    expect(parseImpactData(wrapImpact(bad))).toBeNull();
  });

  it("handles extra whitespace around JSON", () => {
    const text = `<<<IMPACT_DATA>>>   \n\n  ${validImpactJSON}  \n\n  <<<END>>>`;
    const result = parseImpactData(text);
    expect(result).not.toBeNull();
    expect(result!.revenueAtRisk).toBe(1500000);
  });

  it("handles surrounding analysis text correctly", () => {
    const text = `## Situation Assessment\n\nA major hurricane is approaching.\n\n**Affected Shipments:**\n- SHP-001\n- SHP-002\n\n<<<IMPACT_DATA>>>\n${validImpactJSON}\n<<<END>>>\n\nAdditional notes here.`;
    const result = parseImpactData(text);
    expect(result).not.toBeNull();
    expect(result!.affectedShipmentIds).toHaveLength(2);
  });

  it("handles empty affectedShipmentIds array", () => {
    const data = JSON.stringify({
      affectedShipmentIds: [],
      revenueAtRisk: 0,
      avgDelayDays: 0,
      alternativeRoutes: 0,
      disruptionZone: {
        center: { lat: 0, lng: 0, label: "None" },
        radiusKm: 0,
      },
      shipmentStatusUpdates: [],
    });
    const result = parseImpactData(wrapImpact(data));
    expect(result).not.toBeNull();
    expect(result!.affectedShipmentIds).toEqual([]);
  });
});

describe("stripImpactData", () => {
  it("removes impact data block from text", () => {
    const text = `Analysis here.\n\n<<<IMPACT_DATA>>>\n${validImpactJSON}\n<<<END>>>\n`;
    const stripped = stripImpactData(text);
    expect(stripped).toBe("Analysis here.");
    expect(stripped).not.toContain("<<<IMPACT_DATA>>>");
    expect(stripped).not.toContain("<<<END>>>");
  });

  it("returns original text when no delimiters present", () => {
    const text = "Just a regular response with no data block.";
    expect(stripImpactData(text)).toBe(text);
  });

  it("preserves text before and after the block", () => {
    const text = `Before the block.\n<<<IMPACT_DATA>>>\n{}\n<<<END>>>\nAfter the block.`;
    const result = stripImpactData(text);
    expect(result).toContain("Before the block.");
    expect(result).toContain("After the block.");
  });

  it("handles text with only start delimiter", () => {
    const text = "Some text <<<IMPACT_DATA>>> more text";
    expect(stripImpactData(text)).toBe(text);
  });

  it("returns trimmed result", () => {
    const text = `  Analysis.  \n\n<<<IMPACT_DATA>>>\n${validImpactJSON}\n<<<END>>>  `;
    const result = stripImpactData(text);
    expect(result).toBe("Analysis.");
  });
});
