import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "../system-prompt";
import { shipments, scenarios } from "../mock-data";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("returns a non-empty string", () => {
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("includes the SupplyLens AI persona", () => {
    expect(prompt).toContain("SupplyLens AI");
    expect(prompt).toContain("senior logistics analyst");
  });

  it("includes shipment count from dataset", () => {
    expect(prompt).toContain(`${shipments.length} active shipments`);
  });

  it("includes the IMPACT_DATA delimiter format", () => {
    expect(prompt).toContain("<<<IMPACT_DATA>>>");
    expect(prompt).toContain("<<<END>>>");
  });

  it("includes the full shipment dataset as JSON", () => {
    // Every shipment ID should appear in the prompt
    for (const shipment of shipments) {
      expect(prompt).toContain(shipment.id);
    }
  });

  it("includes all scenario names", () => {
    for (const scenario of scenarios) {
      expect(prompt).toContain(scenario.name);
    }
  });

  it("includes alternative route instructions", () => {
    expect(prompt).toContain("Alternative Routes");
    expect(prompt).toContain("rerouted path");
    expect(prompt).toContain("additional cost");
  });

  it("includes scenario alternative routes data", () => {
    expect(prompt).toContain("alternativeRoutes");
  });

  it("includes valid status values", () => {
    expect(prompt).toContain("in-transit");
    expect(prompt).toContain("staging");
    expect(prompt).toContain("testing");
    expect(prompt).toContain("shipped");
    expect(prompt).toContain("delayed");
  });
});
