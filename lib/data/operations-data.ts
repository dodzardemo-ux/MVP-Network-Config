// Operations sample data for the FBM MVP demonstration modules:
//   - Stats meter management (RQ2)
//   - Data validation & exceptions (RQ7, RQ8, RQ10)
//   - Work orders & audits (BRS16, BRS17)
//   - Reporting suite (BRS11)
//   - Requirements traceability
//
// Everything here is DERIVED DETERMINISTICALLY from the existing network sample
// data so the demo stays internally consistent (no random hydration drift).

import { feeders, transformers, meters, nodeMap, getParentChain } from "./network-data";
import {
  energyDeliveredMap,
  getCustomerConsumptionForFeeder,
  getCDUAllocationForFeeder,
} from "./energy-data";

// Deterministic 0..1 hash so server and client render identically.
function seed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const TECH_LOSS = 0.1; // 10% default technical loss, matches the calculation engine

// Feeders deliberately flagged as reporting no energy delivered (RQ8 exception).
export const NO_DELIVERY_FEEDERS = new Set(["fdr-lanseria-3", "fdr-akasia-2"]);

export interface FeederMetric {
  feederId: string;
  name: string;
  zone: string;
  substation: string;
  statsMeterName: string;
  delivered: number;
  sales: number;
  technicalLoss: number;
  nonTechnicalLoss: number;
  ntlPercent: number;
  hasDelivery: boolean;
}

function zoneOf(feederId: string): string {
  const chain = getParentChain(feederId);
  return chain.find((n) => n.type === "zone")?.name ?? "—";
}

// One consolidated loss metric per feeder — the spine most modules read from.
export const feederMetrics: FeederMetric[] = feeders.map((f) => {
  const delivered = NO_DELIVERY_FEEDERS.has(f.id) ? 0 : energyDeliveredMap.get(f.id) ?? 0;
  const sales = getCustomerConsumptionForFeeder(f.id) + getCDUAllocationForFeeder(f.id);
  const technicalLoss = Math.round(delivered * TECH_LOSS);
  const nonTechnicalLoss = delivered - technicalLoss - sales;
  const ntlPercent = delivered > 0 ? (nonTechnicalLoss / delivered) * 100 : 0;
  return {
    feederId: f.id,
    name: f.name,
    zone: zoneOf(f.id),
    substation: nodeMap.get(f.parentId ?? "")?.name ?? "—",
    statsMeterName: f.statsMeterName,
    delivered,
    sales,
    technicalLoss,
    nonTechnicalLoss,
    ntlPercent,
    hasDelivery: delivered > 0,
  };
});

export const feederMetricMap = new Map(feederMetrics.map((m) => [m.feederId, m]));

// ---------------------------------------------------------------------------
// RQ2 — Stats meter management
// ---------------------------------------------------------------------------
export type MeterCommStatus = "online" | "intermittent" | "offline";
export type ReadStatus = "actual" | "estimated" | "missing";

export interface StatsMeter {
  id: string;
  name: string;
  feederId: string;
  feederName: string;
  zone: string;
  serial: string;
  ctRatio: string;
  commStatus: MeterCommStatus;
  readStatus: ReadStatus;
  lastReadDate: string;
  lastReadKwh: number;
  installedOn: string;
}

const CT_RATIOS = ["200/5", "400/5", "600/5", "800/5", "1000/5"];

export const statsMeters: StatsMeter[] = feeders.map((f) => {
  const r = seed(f.statsMeterName);
  const missing = NO_DELIVERY_FEEDERS.has(f.id);
  const commStatus: MeterCommStatus = missing
    ? "offline"
    : r > 0.85
      ? "intermittent"
      : "online";
  const readStatus: ReadStatus = missing ? "missing" : r > 0.8 ? "estimated" : "actual";
  const lastReadDay = missing ? 6 : Math.floor(seed(f.id + "day") * 3) + 1; // Jan 2024
  return {
    id: `sm-${f.id}`,
    name: f.statsMeterName,
    feederId: f.id,
    feederName: f.name,
    zone: zoneOf(f.id),
    serial: `MV90-${Math.floor(r * 900000 + 100000)}`,
    ctRatio: CT_RATIOS[Math.floor(r * CT_RATIOS.length)],
    commStatus,
    readStatus,
    lastReadDate: readStatus === "missing" ? "—" : `2024-01-0${lastReadDay}`,
    lastReadKwh: energyDeliveredMap.get(f.id) ?? 0,
    installedOn: `20${15 + Math.floor(r * 8)}-0${Math.floor(seed(f.id + "m") * 8) + 1}-1${Math.floor(seed(f.id + "d") * 9)}`,
  };
});

export interface ImportBatch {
  id: string;
  source: string;
  runAt: string;
  metersExpected: number;
  metersReceived: number;
  status: "success" | "partial" | "failed";
}

const received = statsMeters.filter((m) => m.readStatus !== "missing").length;
export const importBatches: ImportBatch[] = [
  {
    id: "IMP-2024-0103",
    source: "MV90 · Automated SFTP pull",
    runAt: "2024-01-03 02:15",
    metersExpected: statsMeters.length,
    metersReceived: received,
    status: "partial",
  },
  {
    id: "IMP-2023-1203",
    source: "MV90 · Automated SFTP pull",
    runAt: "2023-12-03 02:15",
    metersExpected: statsMeters.length,
    metersReceived: statsMeters.length,
    status: "success",
  },
  {
    id: "IMP-2023-1103",
    source: "MV90 · Automated SFTP pull",
    runAt: "2023-11-03 02:15",
    metersExpected: statsMeters.length,
    metersReceived: statsMeters.length - 1,
    status: "partial",
  },
];

// ---------------------------------------------------------------------------
// RQ7 / RQ8 / RQ10 — Data validation & exceptions
// ---------------------------------------------------------------------------
export type ExceptionSeverity = "critical" | "high" | "medium" | "low";
export type ExceptionStatus = "open" | "in-progress" | "resolved";

export interface ValidationException {
  id: string;
  rule: string;
  category: string;
  severity: ExceptionSeverity;
  entity: string;
  entityId: string;
  detail: string;
  assignedRole: string;
  status: ExceptionStatus;
}

const totalMeters = meters.length;
const estimatedMeters = meters.filter((m) => m.isEstimate).length;
const unmappedMeters = Math.round(totalMeters * 0.04);

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  checked: number;
  failed: number;
  category: string;
}

export const validationRules: ValidationRule[] = [
  {
    id: "VR-01",
    name: "Feeder has energy delivered",
    description: "Every active feeder must return an MV90 reading for the period.",
    checked: feeders.length,
    failed: feederMetrics.filter((m) => !m.hasDelivery).length,
    category: "Energy delivered",
  },
  {
    id: "VR-02",
    name: "Non-technical loss within tolerance",
    description: "Feeder NTL must fall between -5% and 25% of energy delivered.",
    checked: feederMetrics.filter((m) => m.hasDelivery).length,
    failed: feederMetrics.filter((m) => m.hasDelivery && (m.ntlPercent > 25 || m.ntlPercent < -5)).length,
    category: "Loss tolerance",
  },
  {
    id: "VR-03",
    name: "Actual (non-estimated) reads",
    description: "Customer meter reads should be actual, not estimated.",
    checked: totalMeters,
    failed: estimatedMeters,
    category: "Meter reads",
  },
  {
    id: "VR-04",
    name: "Customer-network linking (CNL) complete",
    description: "Every customer meter must be linked to a transformer and feeder.",
    checked: totalMeters,
    failed: unmappedMeters,
    category: "CNL mapping",
  },
  {
    id: "VR-05",
    name: "Stats meter communicating",
    description: "Stats meters must report an online communication status.",
    checked: statsMeters.length,
    failed: statsMeters.filter((m) => m.commStatus === "offline").length,
    category: "Metering health",
  },
];

const ROLE = {
  metering: "Metering Technician",
  data: "Data Analyst",
  revenue: "Revenue Protection",
  field: "Field Services",
};

function buildExceptions(): ValidationException[] {
  const out: ValidationException[] = [];

  // RQ8 — feeders with no energy delivered
  feederMetrics
    .filter((m) => !m.hasDelivery)
    .forEach((m, i) =>
      out.push({
        id: `EXC-${1001 + i}`,
        rule: "VR-01",
        category: "Energy delivered",
        severity: "critical",
        entity: m.name,
        entityId: m.feederId,
        detail: "No MV90 energy delivered received for the period.",
        assignedRole: ROLE.metering,
        status: "open",
      }),
    );

  // Loss out of tolerance
  feederMetrics
    .filter((m) => m.hasDelivery && (m.ntlPercent > 25 || m.ntlPercent < -5))
    .slice(0, 6)
    .forEach((m, i) =>
      out.push({
        id: `EXC-${1101 + i}`,
        rule: "VR-02",
        category: "Loss tolerance",
        severity: m.ntlPercent < 0 ? "high" : "critical",
        entity: m.name,
        entityId: m.feederId,
        detail:
          m.ntlPercent < 0
            ? `Negative NTL of ${m.ntlPercent.toFixed(1)}% suggests under-metered delivery or CNL gaps.`
            : `NTL of ${m.ntlPercent.toFixed(1)}% exceeds the 25% tolerance ceiling.`,
        assignedRole: ROLE.revenue,
        status: i % 3 === 0 ? "in-progress" : "open",
      }),
    );

  // Offline stats meters
  statsMeters
    .filter((m) => m.commStatus === "offline")
    .forEach((m, i) =>
      out.push({
        id: `EXC-${1201 + i}`,
        rule: "VR-05",
        category: "Metering health",
        severity: "high",
        entity: m.name,
        entityId: m.feederId,
        detail: "Stats meter offline — no communication since last successful read.",
        assignedRole: ROLE.field,
        status: "open",
      }),
    );

  // CNL unmapped meters (aggregated per zone for readability)
  const zones = Array.from(new Set(feederMetrics.map((m) => m.zone)));
  zones.slice(0, 3).forEach((z, i) =>
    out.push({
      id: `EXC-${1301 + i}`,
      rule: "VR-04",
      category: "CNL mapping",
      severity: "medium",
      entity: `${z} zone`,
      entityId: `zone-${z.toLowerCase()}`,
      detail: `${3 + i} customer meters not linked to a transformer (CNL non-conformance).`,
      assignedRole: ROLE.data,
      status: i === 0 ? "resolved" : "open",
    }),
  );

  // Estimated reads (aggregated)
  out.push({
    id: "EXC-1401",
    rule: "VR-03",
    category: "Meter reads",
    severity: "low",
    entity: "Gauteng Operating Unit",
    entityId: "ou-gauteng",
    detail: `${estimatedMeters} customer meters carry estimated reads this period.`,
    assignedRole: ROLE.data,
    status: "in-progress",
  });

  return out;
}

export const validationExceptions: ValidationException[] = buildExceptions();

// ---------------------------------------------------------------------------
// BRS16 / BRS17 — Work orders & audits
// ---------------------------------------------------------------------------
export type WorkOrderType = "maintenance" | "audit";
export type WorkOrderPriority = "urgent" | "high" | "normal";
export type WorkOrderStatus = "raised" | "dispatched" | "in-progress" | "closed";

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  title: string;
  targetName: string;
  targetId: string;
  zone: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  raisedOn: string;
  assignedTeam: string;
  ntlPercent: number;
  reference: string;
}

// Worst-performing feeders (by NTL%) drive the "initiate audit" workflow.
export const worstFeeders: FeederMetric[] = [...feederMetrics]
  .filter((m) => m.hasDelivery)
  .sort((a, b) => b.ntlPercent - a.ntlPercent)
  .slice(0, 8);

export const seededWorkOrders: WorkOrder[] = [
  {
    id: "WO-4501",
    type: "audit",
    title: "Revenue-protection audit — high NTL feeder",
    targetName: worstFeeders[0]?.name ?? "Feeder",
    targetId: worstFeeders[0]?.feederId ?? "",
    zone: worstFeeders[0]?.zone ?? "—",
    priority: "urgent",
    status: "in-progress",
    raisedOn: "2024-01-04",
    assignedTeam: "Revenue Protection · Team A",
    ntlPercent: worstFeeders[0]?.ntlPercent ?? 0,
    reference: "MAXIMO-AUD-4501",
  },
  {
    id: "WO-4502",
    type: "maintenance",
    title: "Replace offline MV90 stats meter",
    targetName: worstFeeders[1]?.name ?? "Feeder",
    targetId: worstFeeders[1]?.feederId ?? "",
    zone: worstFeeders[1]?.zone ?? "—",
    priority: "high",
    status: "dispatched",
    raisedOn: "2024-01-05",
    assignedTeam: "Field Services · Metering",
    ntlPercent: worstFeeders[1]?.ntlPercent ?? 0,
    reference: "MAXIMO-WO-4502",
  },
  {
    id: "WO-4503",
    type: "audit",
    title: "CNL verification audit",
    targetName: worstFeeders[2]?.name ?? "Feeder",
    targetId: worstFeeders[2]?.feederId ?? "",
    zone: worstFeeders[2]?.zone ?? "—",
    priority: "normal",
    status: "closed",
    raisedOn: "2023-12-28",
    assignedTeam: "Data Quality",
    ntlPercent: worstFeeders[2]?.ntlPercent ?? 0,
    reference: "MAXIMO-AUD-4498",
  },
];

// ---------------------------------------------------------------------------
// BRS11 — Reporting suite
// ---------------------------------------------------------------------------
export interface ReportDefinition {
  id: string;
  name: string;
  category: "Bulk supply" | "Reticulation" | "Consolidated";
  description: string;
  frequency: string;
  columns: string[];
  formats: string[];
}

export const reportDefinitions: ReportDefinition[] = [
  {
    id: "RPT-BULK",
    name: "Bulk Supply Point Loss Report",
    category: "Bulk supply",
    description:
      "Energy balance at bulk supply / substation level: energy in vs energy delivered to reticulation, with loss variance.",
    frequency: "Monthly",
    columns: ["Substation", "Zone", "Energy In (kWh)", "Delivered (kWh)", "Loss (kWh)", "Loss %"],
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    id: "RPT-RETIC",
    name: "Reticulation Loss Report",
    category: "Reticulation",
    description:
      "Feeder-level technical and non-technical loss split, ranked by NTL% with tolerance flags.",
    frequency: "Monthly",
    columns: ["Feeder", "Delivered (kWh)", "Sales (kWh)", "Technical (kWh)", "NTL (kWh)", "NTL %"],
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    id: "RPT-CONS",
    name: "Consolidated Loss Report",
    category: "Consolidated",
    description:
      "Roll-up across the hierarchy (OU → Zone → Substation → Feeder) with period-on-period movement.",
    frequency: "Monthly / Quarterly",
    columns: ["Level", "Name", "Delivered (kWh)", "Sales (kWh)", "NTL (kWh)", "NTL %"],
    formats: ["PDF", "Excel"],
  },
];

// Zone roll-up used by the consolidated report preview.
export interface ZoneRollup {
  zone: string;
  delivered: number;
  sales: number;
  ntl: number;
  ntlPercent: number;
  feeders: number;
}

export const zoneRollups: ZoneRollup[] = (() => {
  const map = new Map<string, ZoneRollup>();
  for (const m of feederMetrics) {
    const z = map.get(m.zone) ?? {
      zone: m.zone,
      delivered: 0,
      sales: 0,
      ntl: 0,
      ntlPercent: 0,
      feeders: 0,
    };
    z.delivered += m.delivered;
    z.sales += m.sales;
    z.ntl += m.nonTechnicalLoss;
    z.feeders += 1;
    map.set(m.zone, z);
  }
  const rows = Array.from(map.values());
  rows.forEach((r) => (r.ntlPercent = r.delivered > 0 ? (r.ntl / r.delivered) * 100 : 0));
  return rows.sort((a, b) => b.delivered - a.delivered);
})();

// ---------------------------------------------------------------------------
// Requirements traceability
// ---------------------------------------------------------------------------
export type TraceStatus = "demonstrated" | "partial" | "planned";

export interface TraceItem {
  ref: string;
  requirement: string;
  scoringArea: string;
  module: string;
  tab: string;
  status: TraceStatus;
}

export const traceabilityMatrix: TraceItem[] = [
  { ref: "RQ2", requirement: "Automated MV90 stats meter import & visual meter management", scoringArea: "Functional", module: "Stats Meters", tab: "meters", status: "demonstrated" },
  { ref: "BRS1–10", requirement: "Feeder balancing hierarchy & loss calculation engine", scoringArea: "Functional", module: "Configure Network + Dashboard", tab: "configure", status: "demonstrated" },
  { ref: "RQ5", requirement: "Customer-network linking (CNL) validation", scoringArea: "Functional", module: "Dashboard · Data Validation", tab: "dashboard", status: "demonstrated" },
  { ref: "RQ7", requirement: "Business-rule data validation", scoringArea: "Functional", module: "Dashboard · Data Validation", tab: "dashboard", status: "demonstrated" },
  { ref: "RQ8", requirement: "Feeders with no energy delivered exception", scoringArea: "Functional", module: "Dashboard · Data Validation", tab: "dashboard", status: "demonstrated" },
  { ref: "RQ10", requirement: "Exception routing to role-players", scoringArea: "Functional", module: "Dashboard · Data Validation", tab: "dashboard", status: "demonstrated" },
  { ref: "BRS16", requirement: "Log work request to maintenance system", scoringArea: "Functional", module: "Dashboard · Work Orders", tab: "dashboard", status: "demonstrated" },
  { ref: "BRS17", requirement: "Initiate audit on worst-performing network", scoringArea: "Functional", module: "Dashboard · Work Orders", tab: "dashboard", status: "demonstrated" },
  { ref: "BRS11", requirement: "Bulk, reticulation & consolidated loss reports", scoringArea: "Functional", module: "Reporting", tab: "reports", status: "demonstrated" },
  { ref: "RQ12/13", requirement: "Report extracts & export (PDF/Excel/CSV)", scoringArea: "Functional", module: "Reporting", tab: "reports", status: "demonstrated" },
  { ref: "RQ19", requirement: "Loss visualisation (geographic heat map)", scoringArea: "Functional", module: "Dashboard", tab: "dashboard", status: "demonstrated" },
  { ref: "RQ20", requirement: "Substation / MTS level balancing", scoringArea: "Functional", module: "Configure Network", tab: "configure", status: "partial" },
  { ref: "NFR-Sec", requirement: "Role-based access control & audit trail", scoringArea: "Security", module: "Access & Audit", tab: "access", status: "demonstrated" },
  { ref: "NFR-Perf", requirement: "Responsive performance on large hierarchies", scoringArea: "Non-Functional", module: "All modules", tab: "traceability", status: "demonstrated" },
  { ref: "NFR-Cloud", requirement: "Cloud-native deployment architecture", scoringArea: "Cloud", module: "Architecture", tab: "traceability", status: "planned" },
];

export const traceSummary = {
  demonstrated: traceabilityMatrix.filter((t) => t.status === "demonstrated").length,
  partial: traceabilityMatrix.filter((t) => t.status === "partial").length,
  planned: traceabilityMatrix.filter((t) => t.status === "planned").length,
  total: traceabilityMatrix.length,
};

// Shared number formatter for kWh values.
export function fmtKwh(n: number): string {
  return new Intl.NumberFormat("en-ZA").format(Math.round(n));
}
