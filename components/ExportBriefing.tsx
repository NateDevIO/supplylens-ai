"use client";

import { useEffect } from "react";
import { useAppState } from "@/lib/context";
import { formatCurrency } from "@/lib/analysis";

interface ExportBriefingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportBriefing({ isOpen, onClose }: ExportBriefingProps) {
  const { state } = useAppState();
  const { impactData, shipments, activeScenario } = state;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const affectedShipments = shipments.filter((s) =>
    impactData?.affectedShipmentIds.includes(s.id)
  );

  const handleExport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const shipmentRows = affectedShipments
      .map(
        (s) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;font-size:12px;color:#2563eb;">${s.id}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;">${s.clientName}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;">${s.cargoType}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;">${formatCurrency(s.value)}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;">
          <span style="padding:2px 8px;border-radius:12px;font-size:11px;background:${
            s.status === "delayed"
              ? "#fee2e2;color:#991b1b"
              : s.status === "in-transit"
                ? "#dcfce7;color:#166534"
                : "#fef3c7;color:#92400e"
          };">${s.status}</span>
        </td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280;">${s.estimatedDelivery}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>SupplyLens AI - Disruption Briefing</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
    h1 { color: #0a1628; border-bottom: 3px solid #3b82f6; padding-bottom: 12px; font-size: 24px; }
    h2 { color: #1e3a5f; font-size: 18px; margin-top: 32px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
    .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; }
    .kpi-value { font-size: 28px; font-weight: 700; }
    .red { color: #ef4444; }
    .amber { color: #f59e0b; }
    .blue { color: #3b82f6; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; border: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .meta { color: #6b7280; font-size: 12px; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .header-meta { color: #6b7280; font-size: 13px; }
    @media print {
      body { padding: 20px; font-size: 12px; }
      .kpi-grid { break-inside: avoid; }
      table { break-inside: avoid; page-break-inside: avoid; }
      h2 { break-after: avoid; }
      tr { break-inside: avoid; }
      .meta { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; }
    }
  </style>
</head>
<body>
  <h1>Supply Chain Disruption Briefing</h1>
  <p class="header-meta"><strong>Scenario:</strong> ${activeScenario?.name ?? "Custom Analysis"}</p>
  <p class="header-meta"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <p style="margin-top:16px;">${activeScenario?.description ?? "Custom disruption scenario analysis."}</p>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div class="kpi-value red">${formatCurrency(impactData?.revenueAtRisk ?? 0)}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Revenue at Risk</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-value amber">${impactData?.affectedShipmentIds.length ?? 0}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Shipments Affected</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-value amber">${impactData?.avgDelayDays ?? 0} days</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Avg Estimated Delay</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-value blue">${impactData?.alternativeRoutes ?? 0}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Alternative Routes</div>
    </div>
  </div>

  <h2>Affected Shipments</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Client</th><th>Cargo Type</th><th>Value</th><th>Status</th><th>ETA</th>
      </tr>
    </thead>
    <tbody>
      ${shipmentRows}
    </tbody>
  </table>

  <h2>Affected Clients</h2>
  <ul style="line-height:1.8;">
    ${[...new Set(affectedShipments.map((s) => s.clientName))]
      .map(
        (name) =>
          `<li><strong>${name}</strong> — ${affectedShipments.filter((s) => s.clientName === name).length} shipment(s), ${formatCurrency(affectedShipments.filter((s) => s.clientName === name).reduce((sum, s) => sum + s.value, 0))} at risk</li>`
      )
      .join("")}
  </ul>

  <p class="meta">
    Generated by SupplyLens AI | Confidential — For Internal Use Only
  </p>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="export-title">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 id="export-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Export Client Briefing
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Generate a print-ready disruption briefing with scenario summary,
          affected shipments, and recommended actions.
        </p>
        {(!impactData || impactData.affectedShipmentIds.length === 0) && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            No active scenario. Run a disruption analysis first to generate a
            briefing.
          </p>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleExport();
              onClose();
            }}
            disabled={!impactData || impactData.affectedShipmentIds.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Generate Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
