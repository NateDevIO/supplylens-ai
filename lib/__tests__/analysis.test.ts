import { describe, it, expect } from "vitest";
import {
  computeDefaultKPIs,
  getShipmentsInRadius,
  formatCurrency,
  getUniqueRoutes,
} from "../analysis";
import type { Shipment, Location } from "../types";

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  const defaultLocation: Location = { lat: 38.6, lng: -90.2, label: "St. Louis" };
  return {
    id: "SHP-TEST-0001",
    clientName: "Test Corp",
    origin: { lat: 29.9, lng: -90.1, label: "New Orleans" },
    destination: { lat: 38.6, lng: -90.2, label: "St. Louis" },
    currentLocation: defaultLocation,
    status: "in-transit",
    cargoType: "Network Infrastructure",
    cargoDescription: "Test cargo",
    value: 100000,
    weight: 5000,
    routeType: "ground",
    carrier: "Test Carrier",
    estimatedDelivery: "2024-11-15",
    integrationCenter: "St. Louis",
    waypoints: [],
    priority: "standard",
    projectId: "PROJ-001",
    ...overrides,
  };
}

describe("computeDefaultKPIs", () => {
  it("counts zero shipments for empty array", () => {
    const kpis = computeDefaultKPIs([]);
    expect(kpis.totalShipments).toBe(0);
    expect(kpis.onTrack).toBe(0);
    expect(kpis.atRisk).toBe(0);
    expect(kpis.delayed).toBe(0);
    expect(kpis.totalValue).toBe(0);
  });

  it("correctly categorizes shipment statuses", () => {
    const shipments = [
      makeShipment({ id: "1", status: "in-transit", value: 100 }),
      makeShipment({ id: "2", status: "shipped", value: 200 }),
      makeShipment({ id: "3", status: "staging", value: 300 }),
      makeShipment({ id: "4", status: "testing", value: 400 }),
      makeShipment({ id: "5", status: "delayed", value: 500 }),
    ];

    const kpis = computeDefaultKPIs(shipments);

    expect(kpis.totalShipments).toBe(5);
    expect(kpis.onTrack).toBe(2); // in-transit + shipped
    expect(kpis.atRisk).toBe(2); // staging + testing
    expect(kpis.delayed).toBe(1);
    expect(kpis.totalValue).toBe(1500);
  });

  it("sums values correctly across many shipments", () => {
    const shipments = Array.from({ length: 10 }, (_, i) =>
      makeShipment({ id: `S-${i}`, value: 50000 })
    );
    expect(computeDefaultKPIs(shipments).totalValue).toBe(500000);
  });

  it("handles all same status", () => {
    const shipments = [
      makeShipment({ id: "1", status: "delayed" }),
      makeShipment({ id: "2", status: "delayed" }),
    ];
    const kpis = computeDefaultKPIs(shipments);
    expect(kpis.onTrack).toBe(0);
    expect(kpis.atRisk).toBe(0);
    expect(kpis.delayed).toBe(2);
  });
});

describe("formatCurrency", () => {
  it("formats millions", () => {
    expect(formatCurrency(1000000)).toBe("$1.0M");
    expect(formatCurrency(2500000)).toBe("$2.5M");
    expect(formatCurrency(15750000)).toBe("$15.8M");
  });

  it("formats thousands", () => {
    expect(formatCurrency(1000)).toBe("$1K");
    expect(formatCurrency(50000)).toBe("$50K");
    expect(formatCurrency(999999)).toBe("$1000K");
  });

  it("formats small values", () => {
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(500)).toBe("$500");
    expect(formatCurrency(999)).toBe("$999");
  });

  it("handles boundary at exactly 1M", () => {
    expect(formatCurrency(1000000)).toBe("$1.0M");
  });

  it("handles boundary at exactly 1K", () => {
    expect(formatCurrency(1000)).toBe("$1K");
  });
});

describe("getShipmentsInRadius", () => {
  const stLouis: Location = { lat: 38.627, lng: -90.199, label: "St. Louis" };

  it("returns empty array when no shipments provided", () => {
    expect(getShipmentsInRadius([], stLouis, 500)).toEqual([]);
  });

  it("finds shipments whose current location is within radius", () => {
    const nearby = makeShipment({
      id: "NEAR",
      currentLocation: { lat: 38.9, lng: -89.9, label: "Near STL" },
    });
    const farAway = makeShipment({
      id: "FAR",
      currentLocation: { lat: 51.5, lng: -0.1, label: "London" },
      origin: { lat: 51.5, lng: -0.1, label: "London" },
      destination: { lat: 52.5, lng: 13.4, label: "Berlin" },
    });

    const result = getShipmentsInRadius([nearby, farAway], stLouis, 100);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("NEAR");
  });

  it("includes shipments whose origin is within radius", () => {
    const shipment = makeShipment({
      id: "ORIG",
      origin: { lat: 38.6, lng: -90.2, label: "STL" },
      currentLocation: { lat: 51.5, lng: -0.1, label: "London" },
      destination: { lat: 51.5, lng: -0.1, label: "London" },
    });

    const result = getShipmentsInRadius([shipment], stLouis, 50);
    expect(result).toHaveLength(1);
  });

  it("includes shipments whose destination is within radius", () => {
    const shipment = makeShipment({
      id: "DEST",
      destination: { lat: 38.6, lng: -90.2, label: "STL" },
      currentLocation: { lat: 51.5, lng: -0.1, label: "London" },
      origin: { lat: 51.5, lng: -0.1, label: "London" },
    });

    const result = getShipmentsInRadius([shipment], stLouis, 50);
    expect(result).toHaveLength(1);
  });

  it("includes shipments whose waypoint is within radius", () => {
    const shipment = makeShipment({
      id: "WAYP",
      currentLocation: { lat: 51.5, lng: -0.1, label: "London" },
      origin: { lat: 51.5, lng: -0.1, label: "London" },
      destination: { lat: 52.5, lng: 13.4, label: "Berlin" },
      waypoints: [{ lat: 38.6, lng: -90.2, label: "STL waypoint" }],
    });

    const result = getShipmentsInRadius([shipment], stLouis, 50);
    expect(result).toHaveLength(1);
  });

  it("excludes all shipments outside radius", () => {
    const shipment = makeShipment({
      id: "FAR",
      currentLocation: { lat: 35.0, lng: 139.0, label: "Tokyo" },
      origin: { lat: 35.0, lng: 139.0, label: "Tokyo" },
      destination: { lat: 37.5, lng: 127.0, label: "Seoul" },
      waypoints: [],
    });

    const result = getShipmentsInRadius([shipment], stLouis, 1000);
    expect(result).toHaveLength(0);
  });

  it("zero radius returns only exact matches", () => {
    const exact = makeShipment({
      id: "EXACT",
      currentLocation: stLouis,
    });
    // Even a very small radius should find a point at the same coords
    const result = getShipmentsInRadius([exact], stLouis, 0.001);
    expect(result).toHaveLength(1);
  });
});

describe("getUniqueRoutes", () => {
  it("returns 0 for empty array", () => {
    expect(getUniqueRoutes([])).toBe(0);
  });

  it("counts unique origin-destination pairs", () => {
    const shipments = [
      makeShipment({
        id: "1",
        origin: { lat: 0, lng: 0, label: "A" },
        destination: { lat: 0, lng: 0, label: "B" },
      }),
      makeShipment({
        id: "2",
        origin: { lat: 0, lng: 0, label: "A" },
        destination: { lat: 0, lng: 0, label: "B" },
      }),
      makeShipment({
        id: "3",
        origin: { lat: 0, lng: 0, label: "C" },
        destination: { lat: 0, lng: 0, label: "D" },
      }),
    ];
    expect(getUniqueRoutes(shipments)).toBe(2);
  });

  it("treats A->B and B->A as different routes", () => {
    const shipments = [
      makeShipment({
        id: "1",
        origin: { lat: 0, lng: 0, label: "A" },
        destination: { lat: 0, lng: 0, label: "B" },
      }),
      makeShipment({
        id: "2",
        origin: { lat: 0, lng: 0, label: "B" },
        destination: { lat: 0, lng: 0, label: "A" },
      }),
    ];
    expect(getUniqueRoutes(shipments)).toBe(2);
  });
});
