"use client";

import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import { useAppState } from "@/lib/context";
import { type Shipment, type ImpactData } from "@/lib/types";
import { useEffect, useMemo, useRef } from "react";
import { formatCurrency } from "@/lib/analysis";

const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://openstreetmap.org">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

function TileSwapper() {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    function applyTiles() {
      const isDark = document.documentElement.classList.contains("dark");
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      const layer = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
        attribution: TILE_ATTR,
      });
      layer.addTo(map);
      layerRef.current = layer;
    }

    applyTiles();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "class") {
          applyTiles();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map]);

  return null;
}

const statusColors: Record<string, string> = {
  "in-transit": "#22c55e",
  staging: "#f59e0b",
  testing: "#3b82f6",
  shipped: "#22c55e",
  delayed: "#ef4444",
};

function createCircleIcon(color: string, isAffected: boolean = false) {
  const size = isAffected ? 14 : 10;
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      ${isAffected ? "animation: pulse-ring 1.5s infinite;" : ""}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapController({
  impactData,
  selectedShipmentId,
  shipments,
}: {
  impactData: ImpactData | null;
  selectedShipmentId: string | null;
  shipments: Shipment[];
}) {
  const map = useMap();

  useEffect(() => {
    if (impactData?.disruptionZone) {
      const { center, radiusKm } = impactData.disruptionZone;
      map.flyTo([center.lat, center.lng], getZoomForRadius(radiusKm), {
        duration: 1.5,
      });
    }
  }, [impactData, map]);

  useEffect(() => {
    if (selectedShipmentId) {
      const shipment = shipments.find((s) => s.id === selectedShipmentId);
      if (shipment) {
        map.flyTo(
          [shipment.currentLocation.lat, shipment.currentLocation.lng],
          8,
          { duration: 1 }
        );
      }
    }
  }, [selectedShipmentId, shipments, map]);

  return null;
}

function getZoomForRadius(radiusKm: number): number {
  if (radiusKm > 1000) return 3;
  if (radiusKm > 500) return 4;
  if (radiusKm > 200) return 5;
  if (radiusKm > 100) return 6;
  return 7;
}

function MapLegend({ hasDisruption }: { hasDisruption: boolean }) {
  return (
    <div role="region" aria-label="Map legend" className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-slate-600 px-3 py-2.5 text-[11px]">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Map Legend</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white"
            style={{ background: "#22c55e", boxShadow: "0 0 2px rgba(0,0,0,0.2)" }}
          />
          <span className="text-gray-600 dark:text-gray-400">On Track / Shipped</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white"
            style={{ background: "#f59e0b", boxShadow: "0 0 2px rgba(0,0,0,0.2)" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Staging</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white"
            style={{ background: "#3b82f6", boxShadow: "0 0 2px rgba(0,0,0,0.2)" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Testing</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white"
            style={{ background: "#ef4444", boxShadow: "0 0 2px rgba(0,0,0,0.2)" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Delayed{hasDisruption ? " / Affected" : ""}</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-slate-600 mt-1">
          <span className="inline-block w-4 border-t-2 border-dashed border-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Shipment Route</span>
        </div>
        {hasDisruption && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 border-t-2 border-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Disrupted Route</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapView() {
  const { state, dispatch } = useAppState();
  const { shipments, impactData, selectedShipmentId } = state;

  const affectedIds = useMemo(
    () => new Set(impactData?.affectedShipmentIds ?? []),
    [impactData]
  );

  const hasDisruption = affectedIds.size > 0;

  return (
    <div className="relative h-full w-full">
      <MapLegend hasDisruption={hasDisruption} />
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileSwapper />

        {/* Route polylines */}
        {shipments.map((shipment) => {
          const points: [number, number][] = [
            [shipment.origin.lat, shipment.origin.lng],
            ...shipment.waypoints.map(
              (w) => [w.lat, w.lng] as [number, number]
            ),
            [shipment.destination.lat, shipment.destination.lng],
          ];
          const isAffected = affectedIds.has(shipment.id);
          return (
            <Polyline
              key={`route-${shipment.id}`}
              positions={points}
              pathOptions={{
                color: isAffected ? "#ef4444" : "#94a3b8",
                weight: isAffected ? 3 : 1.5,
                opacity: isAffected ? 0.8 : 0.3,
                dashArray: isAffected ? "8 6" : "5 5",
                className: isAffected ? "disrupted-route" : "animated-route",
              }}
            />
          );
        })}

        {/* Shipment markers */}
        {shipments.map((shipment) => {
          const isAffected = affectedIds.has(shipment.id);
          return (
            <Marker
              key={shipment.id}
              position={[
                shipment.currentLocation.lat,
                shipment.currentLocation.lng,
              ]}
              icon={createCircleIcon(
                isAffected ? "#ef4444" : statusColors[shipment.status],
                isAffected
              )}
              eventHandlers={{
                click: () =>
                  dispatch({
                    type: "SELECT_SHIPMENT",
                    payload: shipment.id,
                  }),
              }}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-mono font-bold text-xs text-blue-600">
                    {shipment.id}
                  </p>
                  <p className="font-semibold mt-1">{shipment.clientName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {shipment.cargoDescription}
                  </p>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {shipment.status}
                    </span>
                    <span className="font-mono font-semibold text-xs">
                      {formatCurrency(shipment.value)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {shipment.origin.label} &rarr; {shipment.destination.label}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Disruption zone overlay */}
        {impactData?.disruptionZone && (
          <Circle
            center={[
              impactData.disruptionZone.center.lat,
              impactData.disruptionZone.center.lng,
            ]}
            radius={impactData.disruptionZone.radiusKm * 1000}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.12,
              weight: 2,
              dashArray: "10 5",
            }}
          />
        )}

        <MapController
          impactData={impactData}
          selectedShipmentId={selectedShipmentId}
          shipments={shipments}
        />
      </MapContainer>
    </div>
  );
}
