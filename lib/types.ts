export interface Location {
  lat: number;
  lng: number;
  label: string;
}

export interface Shipment {
  id: string;
  clientName: string;
  origin: Location;
  destination: Location;
  currentLocation: Location;
  status: ShipmentStatus;
  cargoType: CargoType;
  cargoDescription: string;
  value: number;
  weight: number;
  routeType: RouteType;
  carrier: string;
  estimatedDelivery: string;
  integrationCenter: IntegrationCenter;
  waypoints: Location[];
  priority: Priority;
  projectId: string;
}

export type ShipmentStatus =
  | "in-transit"
  | "staging"
  | "testing"
  | "shipped"
  | "delayed";

export type CargoType =
  | "Network Infrastructure"
  | "Server Rack"
  | "Storage Array"
  | "Security Appliances"
  | "AV/Collaboration"
  | "Data Center Hardware";

export type RouteType = "ground" | "air" | "ocean" | "multimodal";
export type IntegrationCenter = "St. Louis" | "Amsterdam" | "Singapore";
export type Priority = "standard" | "expedited" | "critical";

export interface AlternativeRoute {
  description: string;
  additionalCostPercent: number;
  additionalDelayDays: number;
  routeType: RouteType;
}

export interface DisruptionScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  affectedRegion: {
    center: Location;
    radiusKm: number;
  };
  affectedRouteSegments: string[];
  severityMultiplier: number;
  estimatedDelayDays: number;
  alternativeRoutes: AlternativeRoute[];
  promptTemplate: string;
}

export interface ShipmentStatusUpdate {
  id: string;
  newStatus: ShipmentStatus;
  reason: string;
}

export interface ImpactData {
  affectedShipmentIds: string[];
  revenueAtRisk: number;
  avgDelayDays: number;
  alternativeRoutes: number;
  disruptionZone: {
    center: Location;
    radiusKm: number;
  };
  shipmentStatusUpdates: ShipmentStatusUpdate[];
}

export interface AppState {
  shipments: Shipment[];
  activeScenario: DisruptionScenario | null;
  impactData: ImpactData | null;
  selectedShipmentId: string | null;
  isShipmentTableOpen: boolean;
}

export type AppAction =
  | { type: "SET_SCENARIO"; payload: DisruptionScenario | null }
  | { type: "SET_IMPACT_DATA"; payload: ImpactData | null }
  | { type: "SELECT_SHIPMENT"; payload: string | null }
  | { type: "TOGGLE_SHIPMENT_TABLE"; payload?: boolean }
  | { type: "RESET" };

export interface DefaultKPIs {
  totalShipments: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
  totalValue: number;
}
