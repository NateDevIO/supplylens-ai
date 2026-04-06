"use client";

import { useAppState } from "@/lib/context";
import { computeDefaultKPIs, formatCurrency } from "@/lib/analysis";
import { useMemo, useEffect, useState, useRef } from "react";
import { type ImpactData, type Shipment, type ShipmentStatus } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ImpactDashboard() {
  const { state } = useAppState();
  const { shipments, impactData } = state;

  const defaultKPIs = useMemo(
    () => computeDefaultKPIs(shipments),
    [shipments]
  );

  if (impactData && impactData.affectedShipmentIds.length > 0) {
    return <ScenarioView impactData={impactData} shipments={shipments} />;
  }

  return <DefaultView kpis={defaultKPIs} shipments={shipments} />;
}

type KPIFilter = "all" | "onTrack" | "atRisk" | "delayed" | null;

function DefaultView({
  kpis,
  shipments,
}: {
  kpis: ReturnType<typeof computeDefaultKPIs>;
  shipments: Shipment[];
}) {
  const [expanded, setExpanded] = useState<KPIFilter>(null);

  const filteredShipments = useMemo(() => {
    if (!expanded) return [];
    switch (expanded) {
      case "all":
        return shipments;
      case "onTrack":
        return shipments.filter(
          (s) => s.status === "in-transit" || s.status === "shipped"
        );
      case "atRisk":
        return shipments.filter(
          (s) => s.status === "staging" || s.status === "testing"
        );
      case "delayed":
        return shipments.filter((s) => s.status === "delayed");
    }
  }, [expanded, shipments]);

  const toggleFilter = (filter: KPIFilter) => {
    setExpanded(expanded === filter ? null : filter);
  };

  const totalFilteredValue = filteredShipments.reduce(
    (sum, s) => sum + s.value,
    0
  );

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Operations Overview
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" role="group" aria-label="Shipment status filters">
        <KPICardClickable
          label="Active Shipments"
          value={kpis.totalShipments}
          active={expanded === "all"}
          onClick={() => toggleFilter("all")}
        />
        <KPICardClickable
          label="On Track"
          value={kpis.onTrack}
          color="text-green-600 dark:text-green-400"
          active={expanded === "onTrack"}
          onClick={() => toggleFilter("onTrack")}
        />
        <KPICardClickable
          label="At Risk"
          value={kpis.atRisk}
          color="text-amber-500 dark:text-amber-400"
          active={expanded === "atRisk"}
          onClick={() => toggleFilter("atRisk")}
        />
        <KPICardClickable
          label="Delayed"
          value={kpis.delayed}
          color="text-red-500 dark:text-red-400"
          active={expanded === "delayed"}
          onClick={() => toggleFilter("delayed")}
        />
        <KPICard
          label="In-Transit Value"
          value={formatCurrency(kpis.totalValue)}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Expandable shipment detail panel */}
      {expanded && filteredShipments.length > 0 && (
        <div className="mt-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden animate-fade-in">
          <div className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {expanded === "all"
                ? "All Shipments"
                : expanded === "onTrack"
                  ? "On Track Shipments"
                  : expanded === "atRisk"
                    ? "At Risk Shipments"
                    : "Delayed Shipments"}{" "}
              — {formatCurrency(totalFilteredValue)} total value
            </span>
            <button
              onClick={() => setExpanded(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="max-h-[180px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-slate-700 text-left text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky top-0">
                <tr>
                  <th className="px-3 py-1.5">ID</th>
                  <th className="px-3 py-1.5">Client</th>
                  <th className="px-3 py-1.5">Cargo</th>
                  <th className="px-3 py-1.5 text-right">Value</th>
                  <th className="px-3 py-1.5">Status</th>
                  <th className="px-3 py-1.5">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-3 py-1.5 font-mono text-blue-600 dark:text-blue-400">
                      {s.id}
                    </td>
                    <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">
                      {s.clientName}
                    </td>
                    <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                      {s.cargoType}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-right text-gray-700 dark:text-gray-300">
                      {formatCurrency(s.value)}
                    </td>
                    <td className="px-3 py-1.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400">
                      {s.estimatedDelivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ScenarioView({
  impactData,
  shipments,
}: {
  impactData: ImpactData;
  shipments: Shipment[];
}) {
  const affectedShipments = useMemo(
    () =>
      shipments.filter((s) =>
        impactData.affectedShipmentIds.includes(s.id)
      ),
    [shipments, impactData]
  );

  const byCenter = useMemo(() => {
    const counts: Record<string, number> = {};
    affectedShipments.forEach((s) => {
      counts[s.integrationCenter] = (counts[s.integrationCenter] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [affectedShipments]);

  const byCargo = useMemo(() => {
    const counts: Record<string, number> = {};
    affectedShipments.forEach((s) => {
      counts[s.cargoType] = (counts[s.cargoType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [affectedShipments]);

  const COLORS = [
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#22c55e",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <h3 className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider">
        Disruption Impact
      </h3>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Revenue at Risk"
          value={formatCurrency(impactData.revenueAtRisk)}
          color="text-red-500 dark:text-red-400"
        />
        <KPICard
          label="Shipments Affected"
          value={impactData.affectedShipmentIds.length}
          color="text-amber-500 dark:text-amber-400"
        />
        <KPICard
          label="Avg Delay"
          value={`${impactData.avgDelayDays} days`}
          color="text-amber-500 dark:text-amber-400"
        />
        <KPICard
          label="Alt Routes"
          value={impactData.alternativeRoutes}
          color="text-blue-500 dark:text-blue-400"
        />
      </div>

      {/* Charts */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-3" style={{ width: Math.max(120, byCenter.length * 70 + 50) }}>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            By Integration Center
          </p>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={byCenter}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={20} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-3" style={{ width: Math.max(200, byCargo.length * 50 + 120) }}>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            By Cargo Type
          </p>
          <div className="flex items-center gap-3">
            <div className="shrink-0" style={{ width: 80, height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCargo}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={35}
                    dataKey="value"
                    stroke="none"
                  >
                    {byCargo.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1">
              {byCargo.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">{entry.name}</span>
                  <span className="text-gray-400">({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  color,
  className,
}: {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 p-3 shadow-sm ${className ?? ""}`}
    >
      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-xl font-bold mt-1 ${color ?? "text-gray-900 dark:text-gray-100"}`}>
        {typeof value === "number" ? (
          <AnimatedNumber target={value} />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function KPICardClickable({
  label,
  value,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-expanded={active}
      aria-label={`${label}: ${value}. Click to ${active ? "collapse" : "view"} details`}
      className={`bg-white dark:bg-slate-800 rounded-lg border p-3 shadow-sm text-left transition-all cursor-pointer ${
        active
          ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900"
          : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
      }`}
    >
      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-xl font-bold mt-1 ${color ?? "text-gray-900 dark:text-gray-100"}`}>
        <AnimatedNumber target={value} />
      </p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
        Click to {active ? "collapse" : "view details"}
      </p>
    </button>
  );
}

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const styles: Record<ShipmentStatus, string> = {
    "in-transit": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    staging: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    testing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    shipped: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    delayed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function AnimatedNumber({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number | null>(null);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current === target ? 0 : current;
    prevTarget.current = target;
    const duration = 600;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    }

    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return <span>{current.toLocaleString()}</span>;
}
