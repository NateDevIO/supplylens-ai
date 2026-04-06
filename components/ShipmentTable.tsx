"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/context";
import { formatCurrency } from "@/lib/analysis";
import { type ShipmentStatus } from "@/lib/types";

type SortKey =
  | "id"
  | "clientName"
  | "value"
  | "status"
  | "estimatedDelivery";

const columnLabels: Record<SortKey, string> = {
  id: "ID",
  clientName: "Client",
  value: "Value",
  status: "Status",
  estimatedDelivery: "ETA",
};

export default function ShipmentTable() {
  const { state, dispatch } = useAppState();
  const { shipments, impactData, isShipmentTableOpen } = state;
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortAsc, setSortAsc] = useState(false);

  const affectedShipments = useMemo(() => {
    if (!impactData) return [];
    return shipments
      .filter((s) => impactData.affectedShipmentIds.includes(s.id))
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp =
          typeof aVal === "string"
            ? aVal.localeCompare(bVal as string)
            : (aVal as number) - (bVal as number);
        return sortAsc ? cmp : -cmp;
      });
  }, [shipments, impactData, sortKey, sortAsc]);

  if (!isShipmentTableOpen || affectedShipments.length === 0) return null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div role="dialog" aria-label="Affected shipments table" className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-800 border-t-2 border-gray-300 dark:border-slate-600 shadow-2xl max-h-[50vh] overflow-y-auto animate-slide-up">
      <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-3 flex justify-between items-center border-b border-gray-200 dark:border-slate-700 z-10">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
          Affected Shipments ({affectedShipments.length})
        </h3>
        <button
          onClick={() =>
            dispatch({ type: "TOGGLE_SHIPMENT_TABLE", payload: false })
          }
          aria-label="Close shipment table"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-700 text-left text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            {(Object.keys(columnLabels) as SortKey[]).map((key) => (
              <th
                key={key}
                className="px-6 py-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none"
                onClick={() => handleSort(key)}
              >
                {columnLabels[key]}
                {sortKey === key && (
                  <span className="ml-1">{sortAsc ? "\u25B2" : "\u25BC"}</span>
                )}
              </th>
            ))}
            <th className="px-6 py-2">Cargo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {affectedShipments.map((s) => (
            <tr
              key={s.id}
              className="hover:bg-blue-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              onClick={() =>
                dispatch({ type: "SELECT_SHIPMENT", payload: s.id })
              }
            >
              <td className="px-6 py-2.5 font-mono text-xs text-blue-600 dark:text-blue-400">
                {s.id}
              </td>
              <td className="px-6 py-2.5 text-gray-700 dark:text-gray-300">{s.clientName}</td>
              <td className="px-6 py-2.5 font-mono text-gray-700 dark:text-gray-300">
                {formatCurrency(s.value)}
              </td>
              <td className="px-6 py-2.5">
                <StatusBadge status={s.status} />
              </td>
              <td className="px-6 py-2.5 text-gray-500 dark:text-gray-400">
                {s.estimatedDelivery}
              </td>
              <td className="px-6 py-2.5 text-gray-500 dark:text-gray-400 text-xs">
                {s.cargoType}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}
