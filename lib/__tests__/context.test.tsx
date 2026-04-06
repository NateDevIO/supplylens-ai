import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AppProvider, useAppState } from "../context";
import type { ImpactData, DisruptionScenario } from "../types";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

const mockScenario: DisruptionScenario = {
  id: "test-scenario",
  name: "Test Scenario",
  description: "A test disruption",
  icon: "🧪",
  affectedRegion: {
    center: { lat: 29.9, lng: -90.1, label: "Test Zone" },
    radiusKm: 300,
  },
  affectedRouteSegments: ["Gulf Coast"],
  severityMultiplier: 1.5,
  estimatedDelayDays: 3,
  alternativeRoutes: [],
  promptTemplate: "Test prompt",
};

const mockImpactData: ImpactData = {
  affectedShipmentIds: ["SHP-001", "SHP-002"],
  revenueAtRisk: 500000,
  avgDelayDays: 3,
  alternativeRoutes: 2,
  disruptionZone: {
    center: { lat: 29.9, lng: -90.1, label: "Test Zone" },
    radiusKm: 300,
  },
  shipmentStatusUpdates: [
    { id: "SHP-001", newStatus: "delayed", reason: "Test reason" },
  ],
};

describe("AppProvider + useAppState", () => {
  it("provides initial state with shipments loaded", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.state.shipments.length).toBeGreaterThan(0);
    expect(result.current.state.activeScenario).toBeNull();
    expect(result.current.state.impactData).toBeNull();
    expect(result.current.state.selectedShipmentId).toBeNull();
    expect(result.current.state.isShipmentTableOpen).toBe(false);
  });

  it("throws when used outside AppProvider", () => {
    expect(() => {
      renderHook(() => useAppState());
    }).toThrow("useAppState must be used within AppProvider");
  });
});

describe("appReducer via dispatch", () => {
  it("SET_SCENARIO sets active scenario and clears impact data", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    // First set some impact data
    act(() => {
      result.current.dispatch({ type: "SET_IMPACT_DATA", payload: mockImpactData });
    });
    expect(result.current.state.impactData).not.toBeNull();

    // Now set scenario — should clear impact data
    act(() => {
      result.current.dispatch({ type: "SET_SCENARIO", payload: mockScenario });
    });
    expect(result.current.state.activeScenario).toEqual(mockScenario);
    expect(result.current.state.impactData).toBeNull();
  });

  it("SET_SCENARIO with null clears scenario", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.dispatch({ type: "SET_SCENARIO", payload: mockScenario });
    });
    act(() => {
      result.current.dispatch({ type: "SET_SCENARIO", payload: null });
    });

    expect(result.current.state.activeScenario).toBeNull();
  });

  it("SET_IMPACT_DATA sets impact data", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.dispatch({ type: "SET_IMPACT_DATA", payload: mockImpactData });
    });

    expect(result.current.state.impactData).toEqual(mockImpactData);
    expect(result.current.state.impactData!.revenueAtRisk).toBe(500000);
    expect(result.current.state.impactData!.affectedShipmentIds).toHaveLength(2);
  });

  it("SELECT_SHIPMENT sets the selected shipment ID", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.dispatch({ type: "SELECT_SHIPMENT", payload: "SHP-001" });
    });
    expect(result.current.state.selectedShipmentId).toBe("SHP-001");

    act(() => {
      result.current.dispatch({ type: "SELECT_SHIPMENT", payload: null });
    });
    expect(result.current.state.selectedShipmentId).toBeNull();
  });

  it("TOGGLE_SHIPMENT_TABLE toggles when no payload", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    expect(result.current.state.isShipmentTableOpen).toBe(false);

    act(() => {
      result.current.dispatch({ type: "TOGGLE_SHIPMENT_TABLE" });
    });
    expect(result.current.state.isShipmentTableOpen).toBe(true);

    act(() => {
      result.current.dispatch({ type: "TOGGLE_SHIPMENT_TABLE" });
    });
    expect(result.current.state.isShipmentTableOpen).toBe(false);
  });

  it("TOGGLE_SHIPMENT_TABLE respects explicit payload", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    act(() => {
      result.current.dispatch({ type: "TOGGLE_SHIPMENT_TABLE", payload: true });
    });
    expect(result.current.state.isShipmentTableOpen).toBe(true);

    // Sending true again should keep it true
    act(() => {
      result.current.dispatch({ type: "TOGGLE_SHIPMENT_TABLE", payload: true });
    });
    expect(result.current.state.isShipmentTableOpen).toBe(true);

    act(() => {
      result.current.dispatch({ type: "TOGGLE_SHIPMENT_TABLE", payload: false });
    });
    expect(result.current.state.isShipmentTableOpen).toBe(false);
  });

  it("RESET returns to initial state", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });

    // Mutate state
    act(() => {
      result.current.dispatch({ type: "SET_SCENARIO", payload: mockScenario });
      result.current.dispatch({ type: "SET_IMPACT_DATA", payload: mockImpactData });
      result.current.dispatch({ type: "SELECT_SHIPMENT", payload: "SHP-001" });
      result.current.dispatch({ type: "TOGGLE_SHIPMENT_TABLE", payload: true });
    });

    // Reset
    act(() => {
      result.current.dispatch({ type: "RESET" });
    });

    expect(result.current.state.activeScenario).toBeNull();
    expect(result.current.state.impactData).toBeNull();
    expect(result.current.state.selectedShipmentId).toBeNull();
    expect(result.current.state.isShipmentTableOpen).toBe(false);
    expect(result.current.state.shipments.length).toBeGreaterThan(0);
  });
});
