import { describe, it, expect } from "vitest";
import { shipments, scenarios } from "../mock-data";

describe("shipments dataset integrity", () => {
  it("has the expected number of shipments", () => {
    expect(shipments.length).toBe(45);
  });

  it("every shipment has a unique ID", () => {
    const ids = shipments.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every shipment has valid coordinates", () => {
    for (const s of shipments) {
      for (const loc of [s.origin, s.destination, s.currentLocation]) {
        expect(loc.lat).toBeGreaterThanOrEqual(-90);
        expect(loc.lat).toBeLessThanOrEqual(90);
        expect(loc.lng).toBeGreaterThanOrEqual(-180);
        expect(loc.lng).toBeLessThanOrEqual(180);
        expect(loc.label).toBeTruthy();
      }
      for (const wp of s.waypoints) {
        expect(wp.lat).toBeGreaterThanOrEqual(-90);
        expect(wp.lat).toBeLessThanOrEqual(90);
      }
    }
  });

  it("every shipment has a positive value", () => {
    for (const s of shipments) {
      expect(s.value).toBeGreaterThan(0);
    }
  });

  it("every shipment has a valid status", () => {
    const validStatuses = ["in-transit", "staging", "testing", "shipped", "delayed"];
    for (const s of shipments) {
      expect(validStatuses).toContain(s.status);
    }
  });

  it("every shipment has a valid integration center", () => {
    const validCenters = ["St. Louis", "Amsterdam", "Singapore"];
    for (const s of shipments) {
      expect(validCenters).toContain(s.integrationCenter);
    }
  });

  it("every shipment has a valid priority", () => {
    const validPriorities = ["standard", "expedited", "critical"];
    for (const s of shipments) {
      expect(validPriorities).toContain(s.priority);
    }
  });

  it("every shipment has a valid route type", () => {
    const validRoutes = ["ground", "air", "ocean", "multimodal"];
    for (const s of shipments) {
      expect(validRoutes).toContain(s.routeType);
    }
  });

  it("every shipment has required string fields", () => {
    for (const s of shipments) {
      expect(s.clientName).toBeTruthy();
      expect(s.cargoType).toBeTruthy();
      expect(s.cargoDescription).toBeTruthy();
      expect(s.carrier).toBeTruthy();
      expect(s.estimatedDelivery).toBeTruthy();
      expect(s.projectId).toBeTruthy();
    }
  });
});

describe("scenarios dataset integrity", () => {
  it("has 5 disruption scenarios", () => {
    expect(scenarios.length).toBe(5);
  });

  it("every scenario has a unique ID", () => {
    const ids = scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every scenario has valid disruption zone coordinates", () => {
    for (const s of scenarios) {
      expect(s.affectedRegion.center.lat).toBeGreaterThanOrEqual(-90);
      expect(s.affectedRegion.center.lat).toBeLessThanOrEqual(90);
      expect(s.affectedRegion.radiusKm).toBeGreaterThan(0);
    }
  });

  it("every scenario has a prompt template", () => {
    for (const s of scenarios) {
      expect(s.promptTemplate).toBeTruthy();
      expect(s.promptTemplate.length).toBeGreaterThan(10);
    }
  });

  it("every scenario has a severity multiplier > 0", () => {
    for (const s of scenarios) {
      expect(s.severityMultiplier).toBeGreaterThan(0);
    }
  });

  it("every scenario has alternative routes defined", () => {
    for (const s of scenarios) {
      expect(Array.isArray(s.alternativeRoutes)).toBe(true);
      expect(s.alternativeRoutes.length).toBeGreaterThan(0);
    }
  });
});
