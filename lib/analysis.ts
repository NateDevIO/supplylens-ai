import { Shipment, DefaultKPIs, Location } from "./types";

export function computeDefaultKPIs(shipments: Shipment[]): DefaultKPIs {
  return {
    totalShipments: shipments.length,
    onTrack: shipments.filter(
      (s) => s.status === "in-transit" || s.status === "shipped"
    ).length,
    atRisk: shipments.filter(
      (s) => s.status === "staging" || s.status === "testing"
    ).length,
    delayed: shipments.filter((s) => s.status === "delayed").length,
    totalValue: shipments.reduce((sum, s) => sum + s.value, 0),
  };
}

export function getShipmentsInRadius(
  shipments: Shipment[],
  center: Location,
  radiusKm: number
): Shipment[] {
  return shipments.filter((s) => {
    const points = [
      s.currentLocation,
      s.origin,
      s.destination,
      ...s.waypoints,
    ];
    return points.some((p) => haversineDistance(p, center) <= radiusKm);
  });
}

function haversineDistance(a: Location, b: Location): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function getUniqueRoutes(shipments: Shipment[]): number {
  const routes = new Set(
    shipments.map((s) => `${s.origin.label}-${s.destination.label}`)
  );
  return routes.size;
}
