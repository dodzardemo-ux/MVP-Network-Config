/**
 * Architecture and workflow diagrams for the Thabiso work-package submission.
 *
 * Each diagram is authored as SVG and rasterised to PNG with resvg so it can be
 * embedded in both the .docx (ImageRun) and .pdf (pdfkit doc.image). These
 * diagrams explain structure and process that cannot be seen by using the live
 * tool alone (logical/deployment architecture, delivery model, governance) plus
 * the key application workflows (network configuration, mapping, clustering).
 */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const FONT_DIR = path.join(__dirname, "fonts");
const FONT_FILES = [
  path.join(FONT_DIR, "Inter-Regular.ttf"),
  path.join(FONT_DIR, "Inter-SemiBold.ttf"),
  path.join(FONT_DIR, "Inter-Bold.ttf"),
];

const C = {
  blue: "#004898", blueMid: "#3E6DA6", blueSoft: "#E8EEF6",
  gold: "#A39273", goldSoft: "#F1ECE3",
  dark: "#1F2937", grey: "#6B7280", light: "#F3F4F6", border: "#CBD5E1",
  white: "#FFFFFF",
  green: "#2E7D32", greenSoft: "#E6F4EA",
  red: "#C62828", redSoft: "#FBEAEA",
  amber: "#B7791F", amberSoft: "#FBF3E4",
  indigo: "#4338CA", indigoSoft: "#EEF2FF",
  cyan: "#0E7490", cyanSoft: "#E0F2F7",
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* --------------------------------------------------------------- primitives */
function txt(x, y, s, o = {}) {
  const { size = 14, color = C.dark, weight = 400, anchor = "start" } = o;
  return `<text x="${x}" y="${y}" font-family="Inter" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
}

function rect(x, y, w, h, o = {}) {
  const { fill = C.white, stroke = C.border, rx = 8, sw = 1.5, dash = null } = o;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

/** A card with a centered title and optional subtitle. */
function node(x, y, w, h, title, o = {}) {
  const {
    fill = C.white, stroke = C.border, titleColor = C.dark, sub = null,
    subColor = C.grey, titleSize = 14, rx = 8, sw = 1.5,
  } = o;
  let s = rect(x, y, w, h, { fill, stroke, rx, sw });
  const cx = x + w / 2;
  if (sub) {
    s += txt(cx, y + h / 2 - 2, title, { size: titleSize, color: titleColor, weight: 700, anchor: "middle" });
    s += txt(cx, y + h / 2 + 15, sub, { size: 11, color: subColor, weight: 400, anchor: "middle" });
  } else {
    s += txt(cx, y + h / 2 + titleSize * 0.35, title, { size: titleSize, color: titleColor, weight: 600, anchor: "middle" });
  }
  return s;
}

/** A small pill / chip. */
function chip(x, y, w, h, label, o = {}) {
  const { fill = C.white, stroke = C.border, color = C.dark, size = 11 } = o;
  return rect(x, y, w, h, { fill, stroke, rx: h / 2, sw: 1 }) +
    txt(x + w / 2, y + h / 2 + size * 0.35, label, { size, color, anchor: "middle", weight: 500 });
}

function arrow(x1, y1, x2, y2, o = {}) {
  const { color = C.blue, width = 2, dash = null } = o;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hl = 10, hw = 5.5;
  const bx = x2 - hl * Math.cos(ang), by = y2 - hl * Math.sin(ang);
  const p1x = bx - hw * Math.sin(ang), p1y = by + hw * Math.cos(ang);
  const p2x = bx + hw * Math.sin(ang), p2y = by - hw * Math.cos(ang);
  return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>` +
    `<polygon points="${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}" fill="${color}"/>`;
}

function line(x1, y1, x2, y2, o = {}) {
  const { color = C.border, width = 1.5, dash = null } = o;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

function wrap(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<rect width="${w}" height="${h}" fill="${C.white}"/>` + inner + `</svg>`;
}

/* ----------------------------------------------------------------- diagrams */

// 1. Logical layered architecture (Section 5)
function logicalArchitecture() {
  const W = 940, H = 560;
  const layers = [
    ["Experience Layer", "Web portal · mobile · admin console · assisted-service channels", C.blue, C.blueSoft],
    ["API / Integration Layer", "Authenticated APIs · routing · orchestration · validation · throttling · connectors", C.cyan, C.cyanSoft],
    ["Business Services Layer", "Balancing engine · loss calculation · exception rules · work-order & audit services", C.indigo, C.indigoSoft],
    ["Data Layer", "Operational store · MV90 integration store · reporting data · analytics pipelines", C.green, C.greenSoft],
    ["Platform Layer", "Containers / virtual infrastructure · network controls · secrets · backup & recovery", C.gold, C.goldSoft],
    ["Operations Layer", "CI/CD · monitoring · logging · alerting · vulnerability mgmt · audit reporting", C.grey, C.light],
  ];
  const x = 40, w = W - 80, top = 70, lh = 68, gap = 10;
  let s = txt(W / 2, 40, "FBM Logical Architecture — layered view", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  layers.forEach((L, i) => {
    const y = top + i * (lh + gap);
    s += rect(x, y, w, lh, { fill: L[3], stroke: L[2], sw: 1.5, rx: 8 });
    s += rect(x, y, 210, lh, { fill: L[2], stroke: L[2], sw: 1.5, rx: 8 });
    s += rect(x + 195, y, 15, lh, { fill: L[2], stroke: L[2], sw: 0, rx: 0 });
    s += txt(x + 20, y + lh / 2 + 5, L[0], { size: 14, weight: 700, color: C.white });
    s += txt(x + 228, y + lh / 2 + 4.5, L[1], { size: 12, color: C.dark });
    if (i < layers.length - 1) {
      s += arrow(x + w + 16, y + lh, x + w + 16, y + lh + gap, { color: C.grey, width: 1.5 });
      s += arrow(x + w + 16, y + lh + gap, x + w + 16, y + lh, { color: C.grey, width: 1.5 });
    }
  });
  s += txt(W / 2, H - 12, "Each layer depends only on the layer directly beneath it; interfaces are controlled and versioned.", { size: 11, color: C.grey, anchor: "middle" });
  return { id: "logical-architecture", title: "Figure 5.1 — Logical architecture", w: W, h: H, svg: wrap(W, H, s) };
}

// 2. Deployment / cloud architecture (Section 5)
function deploymentArchitecture() {
  const W = 940, H = 600;
  let s = txt(W / 2, 38, "FBM Deployment Architecture — cloud reference", { size: 19, weight: 700, color: C.blue, anchor: "middle" });

  // Users
  s += node(40, 90, 150, 60, "Eskom users", { fill: C.blueSoft, stroke: C.blue, titleColor: C.blue, sub: "browser / mobile", titleSize: 13 });
  // Edge
  s += node(40, 210, 150, 60, "Edge / WAF", { fill: C.white, stroke: C.gold, titleColor: C.gold, sub: "TLS · DDoS · CDN", titleSize: 13 });
  s += arrow(115, 150, 115, 210);

  // Cloud region box
  const rx = 230, ry = 78, rw = 670, rh = 360;
  s += rect(rx, ry, rw, rh, { fill: "#FAFBFC", stroke: C.blue, sw: 1.5, dash: "6 4", rx: 12 });
  s += txt(rx + 16, ry + 22, "Cloud region (multi-AZ)", { size: 12, weight: 700, color: C.blue });

  // API gateway
  s += node(rx + 30, 150, 180, 56, "API Gateway", { fill: C.cyanSoft, stroke: C.cyan, titleColor: C.cyan, sub: "authN/Z · routing", titleSize: 13 });
  s += arrow(190, 240, rx + 30, 178);

  // App tier
  s += rect(rx + 250, 130, 380, 96, { fill: C.indigoSoft, stroke: C.indigo, sw: 1.2, rx: 10 });
  s += txt(rx + 250 + 190, 150, "Application tier (containers, auto-scaled)", { size: 12, weight: 700, color: C.indigo, anchor: "middle" });
  s += node(rx + 268, 160, 110, 52, "Web / BFF", { fill: C.white, stroke: C.indigo, titleColor: C.dark, titleSize: 12 });
  s += node(rx + 388, 160, 110, 52, "Domain svcs", { fill: C.white, stroke: C.indigo, titleColor: C.dark, titleSize: 12 });
  s += node(rx + 508, 160, 104, 52, "Workflow", { fill: C.white, stroke: C.indigo, titleColor: C.dark, titleSize: 12 });
  s += arrow(rx + 210, 178, rx + 250, 178);

  // Data tier
  s += rect(rx + 30, 250, 300, 92, { fill: C.greenSoft, stroke: C.green, sw: 1.2, rx: 10 });
  s += txt(rx + 30 + 150, 270, "Data tier", { size: 12, weight: 700, color: C.green, anchor: "middle" });
  s += node(rx + 46, 280, 130, 50, "Operational DB", { fill: C.white, stroke: C.green, titleColor: C.dark, titleSize: 11 });
  s += node(rx + 184, 280, 130, 50, "Reporting store", { fill: C.white, stroke: C.green, titleColor: C.dark, titleSize: 11 });
  s += arrow(rx + 320, 212, rx + 200, 250, { color: C.grey });

  // Observability
  s += rect(rx + 350, 250, 280, 92, { fill: C.light, stroke: C.grey, sw: 1.2, rx: 10 });
  s += txt(rx + 350 + 140, 270, "DevOps & observability", { size: 12, weight: 700, color: C.grey, anchor: "middle" });
  s += node(rx + 366, 280, 122, 50, "CI/CD", { fill: C.white, stroke: C.grey, titleColor: C.dark, titleSize: 11 });
  s += node(rx + 496, 280, 122, 50, "Logs / metrics", { fill: C.white, stroke: C.grey, titleColor: C.dark, titleSize: 11 });

  // External systems
  const ey = 470;
  s += txt(rx + 16, ey - 6, "External integrations", { size: 12, weight: 700, color: C.dark });
  const ext = ["MV90 stats metering", "MAXIMO (work orders)", "SAP / billing", "Identity provider"];
  ext.forEach((e, i) => {
    const ex = rx + 20 + i * 165;
    s += chip(ex, ey, 155, 34, e, { fill: C.goldSoft, stroke: C.gold, color: C.dark, size: 11 });
    s += arrow(ex + 77, ey, ex + 77, 438, { color: C.gold, width: 1.5, dash: "4 3" });
  });
  s += txt(W / 2, H - 14, "Secrets, encryption in transit and at rest, and role-based access apply across every tier.", { size: 11, color: C.grey, anchor: "middle" });
  return { id: "deployment-architecture", title: "Figure 5.2 — Deployment architecture", w: W, h: H, svg: wrap(W, H, s) };
}

// 3. FBM data flow (Section 5)
function dataFlow() {
  const W = 980, H = 340;
  let s = txt(W / 2, 36, "FBM Data Flow — from metering to action", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const y = 92, h = 72, w = 138, gap = 22;
  const steps = [
    ["MV90 stats meters", "source reads", C.blueSoft, C.blue],
    ["Automated import", "scheduled ingest", C.cyanSoft, C.cyan],
    ["Validation & exceptions", "business rules", C.amberSoft, C.amber],
    ["Balancing engine", "loss calculation", C.indigoSoft, C.indigo],
  ];
  let x = 26;
  let lastRight = x;
  steps.forEach((st, i) => {
    s += node(x, y, w, h, st[0], { fill: st[2], stroke: st[3], titleColor: st[3], sub: st[1], titleSize: 12 });
    if (i < steps.length - 1) s += arrow(x + w, y + h / 2, x + w + gap, y + h / 2);
    lastRight = x + w;
    x += w + gap;
  });
  // Fan-out from a junction just right of the balancing engine.
  const jx = lastRight + gap, mid = y + h / 2;
  const ox = jx + 16, ow = 246;
  const outs = [
    ["Dashboards & heat map", C.greenSoft, C.green, 42],
    ["Loss reports (bulk / retic / consolidated)", C.greenSoft, C.green, 124],
    ["Work orders & audits", C.redSoft, C.red, 206],
  ];
  s += line(lastRight, mid, jx, mid, { color: C.grey, width: 2 });
  outs.forEach((o) => {
    const cy = o[3] + 27;
    s += line(jx, mid, jx, cy, { color: C.grey, width: 2 });
    s += arrow(jx, cy, ox, cy, { color: C.grey, width: 2 });
    s += node(ox, o[3], ow, 54, o[0], { fill: o[1], stroke: o[2], titleColor: o[2], titleSize: 12 });
  });
  s += txt(W / 2, H - 12, "Every stage is logged with correlation identifiers for full transaction traceability.", { size: 11, color: C.grey, anchor: "middle" });
  return { id: "data-flow", title: "Figure 5.3 — Data flow", w: W, h: H, svg: wrap(W, H, s) };
}

// 4. Delivery roadmap (Section 6)
function deliveryRoadmap() {
  const W = 940, H = 430;
  let s = txt(W / 2, 36, "Phased Delivery Roadmap (indicative)", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const axX = 250, axW = 640, top = 70, weeks = 26;
  const pxForWeek = (wk) => axX + (wk / weeks) * axW;
  // week gridlines
  for (let wk = 0; wk <= weeks; wk += 2) {
    const gx = pxForWeek(wk);
    s += line(gx, top - 6, gx, top + 6 * 46 + 6, { color: "#EEF1F5", width: 1 });
    s += txt(gx, top - 12, "W" + wk, { size: 9, color: C.grey, anchor: "middle" });
  }
  const phases = [
    ["Phase 0 · Mobilisation", 0, 2, C.blue],
    ["Phase 1 · Discovery & Blueprint", 2, 6, C.cyan],
    ["Phase 2 · Foundation", 5, 10, C.indigo],
    ["Phase 3 · Incremental Build", 8, 20, C.green],
    ["Phase 4 · Integration, UAT & Readiness", 18, 23, C.amber],
    ["Phase 5 · Go-Live & Stabilisation", 24, 26, C.gold],
  ];
  const rh = 34, gap = 12;
  phases.forEach((p, i) => {
    const y = top + i * (rh + gap);
    s += txt(axX - 14, y + rh / 2 + 4, p[0], { size: 11.5, color: C.dark, weight: 600, anchor: "end" });
    const bx = pxForWeek(p[1]), bw = pxForWeek(p[2]) - bx;
    s += rect(bx, y, bw, rh, { fill: p[3], stroke: p[3], rx: 6, sw: 0 });
    s += txt(bx + bw / 2, y + rh / 2 + 4, `W${p[1]}–${p[2] === 26 ? "24+" : p[2]}`, { size: 10, color: C.white, weight: 600, anchor: "middle" });
  });
  s += txt(W / 2, H - 12, "Illustrative only — final schedule reconciles to issued tender milestones, scope volume and dependencies.", { size: 11, color: C.grey, anchor: "middle" });
  return { id: "delivery-roadmap", title: "Figure 6.1 — Delivery roadmap", w: W, h: H, svg: wrap(W, H, s) };
}

// 5. Sprint delivery cycle (Section 6)
function sprintCycle() {
  const W = 940, H = 300;
  let s = txt(W / 2, 36, "Sprint Delivery Cycle", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const y = 110, h = 62, w = 150, gap = 26;
  const steps = [["Plan", "prioritised backlog"], ["Build", "increment + tests"], ["Test", "security & quality"], ["Review", "Definition of Done"], ["Demo", "auditable release"]];
  let x = 40;
  const cols = [C.blue, C.indigo, C.amber, C.green, C.gold];
  steps.forEach((st, i) => {
    s += node(x, y, w, h, st[0], { fill: C.white, stroke: cols[i], titleColor: cols[i], sub: st[1], titleSize: 13 });
    if (i < steps.length - 1) s += arrow(x + w, y + h / 2, x + w + gap, y + h / 2, { color: C.grey });
    x += w + gap;
  });
  // return loop
  const lastRight = x - gap - w + w, startX = 40 + w / 2, endX = x - gap - w / 2;
  s += line(endX, y + h, endX, y + h + 34, { color: C.gold, width: 2 });
  s += line(endX, y + h + 34, startX, y + h + 34, { color: C.gold, width: 2 });
  s += arrow(startX, y + h + 34, startX, y + h, { color: C.gold, width: 2 });
  s += txt((startX + endX) / 2, y + h + 30, "retrospective — continuous improvement into the next sprint", { size: 11, color: C.gold, weight: 600, anchor: "middle" });
  return { id: "sprint-cycle", title: "Figure 6.2 — Sprint cycle", w: W, h: H, svg: wrap(W, H, s) };
}

// 6. Governance structure (Section 7)
function governanceStructure() {
  const W = 940, H = 420;
  let s = txt(W / 2, 36, "Programme Governance Structure", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  // Steering
  s += node(W / 2 - 130, 64, 260, 60, "Steering Committee", { fill: C.blue, stroke: C.blue, titleColor: C.white, sub: "executive decisions · monthly", subColor: "#C9D6E8", titleSize: 15 });
  // Programme review
  s += node(W / 2 - 130, 170, 260, 58, "Programme Review", { fill: C.blueSoft, stroke: C.blue, titleColor: C.blue, sub: "progress · RAID · weekly", titleSize: 14 });
  s += arrow(W / 2, 124, W / 2, 170);
  // Working groups
  const groups = [
    ["Architecture / Security", "design & controls", C.indigo, C.indigoSoft],
    ["Sprint Ceremonies", "per-sprint delivery", C.green, C.greenSoft],
    ["Service Review", "SLA · incidents (post go-live)", C.gold, C.goldSoft],
  ];
  const gw = 260, totalW = gw * 3 + 30 * 2, gx0 = (W - totalW) / 2, gy = 300;
  s += line(W / 2, 228, W / 2, 268, { color: C.grey, width: 1.5 });
  s += line(gx0 + gw / 2, 268, gx0 + totalW - gw / 2, 268, { color: C.grey, width: 1.5 });
  groups.forEach((g, i) => {
    const gx = gx0 + i * (gw + 30);
    s += line(gx + gw / 2, 268, gx + gw / 2, gy, { color: C.grey, width: 1.5 });
    s += node(gx, gy, gw, 60, g[0], { fill: g[3], stroke: g[2], titleColor: g[2], sub: g[1], titleSize: 13 });
  });
  s += txt(W / 2, H - 12, "Clear authority, reporting, escalation paths and evidence-based decision making across all forums.", { size: 11, color: C.grey, anchor: "middle" });
  return { id: "governance-structure", title: "Figure 7.1 — Governance structure", w: W, h: H, svg: wrap(W, H, s) };
}

// 7. Network configuration workflow (Section 5.4)
function configWorkflow() {
  const W = 960, H = 250;
  let s = txt(W / 2, 34, "Workflow — Configuring the network hierarchy", { size: 18, weight: 700, color: C.blue, anchor: "middle" });
  const y = 95, h = 66, w = 150, gap = 30;
  const steps = [
    ["Open Configure\nNetwork", C.blueSoft, C.blue],
    ["Select a node in\nthe hierarchy", C.blueSoft, C.blue],
    ["Review details\n& metrics", C.cyanSoft, C.cyan],
    ["Add / edit / move\nnode", C.indigoSoft, C.indigo],
    ["Save — losses\nrecalculated", C.greenSoft, C.green],
  ];
  let x = 30;
  steps.forEach((st, i) => {
    const lines = st[0].split("\n");
    s += rect(x, y, w, h, { fill: st[1], stroke: st[2], rx: 8, sw: 1.5 });
    lines.forEach((ln, li) => s += txt(x + w / 2, y + h / 2 - 6 + li * 16, ln, { size: 12.5, weight: 600, color: st[2], anchor: "middle" }));
    if (i < steps.length - 1) s += arrow(x + w, y + h / 2, x + w + gap, y + h / 2, { color: C.grey });
    x += w + gap;
  });
  s += rect(30, y + h + 26, W - 60, 34, { fill: C.light, stroke: C.border, rx: 8, sw: 1 });
  s += txt(W / 2, y + h + 26 + 22, "Placement rules are enforced on save (e.g. a meter must sit under a transformer in the same substation), preventing invalid topologies.", { size: 11, color: C.dark, anchor: "middle" });
  return { id: "config-workflow", title: "Figure 5.4 — Network configuration workflow", w: W, h: H, svg: wrap(W, H, s) };
}

// 8. Network mapping workflow (Section 5.4)
function mappingWorkflow() {
  const W = 960, H = 260;
  let s = txt(W / 2, 34, "Workflow — Network mapping (drag to reorganise)", { size: 18, weight: 700, color: C.blue, anchor: "middle" });
  const y = 90, h = 66, w = 150, gap = 26;
  const steps = [
    ["Open Network\nMapping", C.blueSoft, C.blue],
    ["Select a\nsubstation", C.blueSoft, C.blue],
    ["Drag a meter,\ntransformer or feeder", C.amberSoft, C.amber],
    ["Drop rule\nvalidated", C.cyanSoft, C.cyan],
  ];
  let x = 30;
  steps.forEach((st, i) => {
    const lines = st[0].split("\n");
    s += rect(x, y, w, h, { fill: st[1], stroke: st[2], rx: 8, sw: 1.5 });
    lines.forEach((ln, li) => s += txt(x + w / 2, y + h / 2 - 6 + li * 16, ln, { size: 12, weight: 600, color: st[2], anchor: "middle" }));
    if (i < steps.length - 1) s += arrow(x + w, y + h / 2, x + w + gap, y + h / 2, { color: C.grey });
    x += w + gap;
  });
  // decision branch: move vs cluster
  const dx = x, cy = y + h / 2;
  s += arrow(dx, cy, dx + 26, cy, { color: C.grey });
  s += node(dx + 26, y - 6, 170, 40, "Different level → Move", { fill: C.greenSoft, stroke: C.green, titleColor: C.green, titleSize: 12 });
  s += node(dx + 26, y + h - 34, 170, 40, "Same level → Cluster", { fill: C.indigoSoft, stroke: C.indigo, titleColor: C.indigo, titleSize: 12 });
  s += line(dx + 13, cy, dx + 13, y + 14, { color: C.grey });
  s += line(dx + 13, y + 14, dx + 26, y + 14, { color: C.grey });
  s += line(dx + 13, cy, dx + 13, y + h - 14, { color: C.grey });
  s += line(dx + 13, y + h - 14, dx + 26, y + h - 14, { color: C.grey });
  s += txt(W / 2, H - 12, "Drops are validated live; only same-substation, rule-compliant moves are accepted.", { size: 11, color: C.grey, anchor: "middle" });
  return { id: "mapping-workflow", title: "Figure 5.5 — Network mapping workflow", w: W, h: H, svg: wrap(W, H, s) };
}

// 9. Create a meter cluster — 3-step UI sequence (Section 5.4)
function meterClusterSteps() {
  const W = 960, H = 340;
  let s = txt(W / 2, 34, "Workflow — Creating a meter cluster", { size: 18, weight: 700, color: C.blue, anchor: "middle" });

  // Mini meter card renderer
  const meter = (x, y, name, o = {}) => {
    const { highlight = false, drag = false } = o;
    const w = 120, h = 56;
    let g = rect(x, y, w, h, { fill: highlight ? C.greenSoft : C.white, stroke: highlight ? C.green : (drag ? C.blue : C.border), rx: 8, sw: highlight || drag ? 2 : 1.5 });
    g += rect(x + 10, y + 12, 30, 30, { fill: C.light, stroke: C.border, rx: 6, sw: 1 });
    g += txt(x + 25, y + 31, "M", { size: 13, weight: 700, color: C.grey, anchor: "middle" });
    g += txt(x + 48, y + 26, name, { size: 12, weight: 600, color: C.dark });
    g += txt(x + 48, y + 42, "Meter", { size: 10, color: C.grey });
    return g;
  };
  const cluster = (x, y) => {
    const w = 140, h = 62;
    let g = rect(x, y, w, h, { fill: C.indigoSoft, stroke: C.indigo, rx: 8, sw: 2 });
    g += rect(x + 10, y + 14, 30, 30, { fill: C.white, stroke: C.indigo, rx: 6, sw: 1 });
    g += txt(x + 25, y + 33, "C", { size: 13, weight: 700, color: C.indigo, anchor: "middle" });
    g += txt(x + 48, y + 24, "Meter cluster", { size: 11.5, weight: 700, color: C.indigo });
    g += chip(x + 48, y + 32, 56, 16, "2 meters", { fill: C.white, stroke: C.indigo, color: C.indigo, size: 9 });
    return g;
  };

  const panelY = 70, panelH = 210;
  const pw = 280, gap = 20, x0 = 30;
  const titles = ["1 · Two meters on a transformer", "2 · Drag meter A onto meter B", "3 · A cluster is created"];
  for (let i = 0; i < 3; i++) {
    const px = x0 + i * (pw + gap);
    s += rect(px, panelY, pw, panelH, { fill: "#FAFBFC", stroke: C.border, rx: 10, sw: 1.2 });
    s += txt(px + pw / 2, panelY + 24, titles[i], { size: 12, weight: 700, color: C.dark, anchor: "middle" });
    if (i < 2) s += arrow(px + pw + 2, panelY + panelH / 2, px + pw + gap - 2, panelY + panelH / 2, { color: C.blue, width: 2 });

    // transformer parent
    s += node(px + pw / 2 - 60, panelY + 44, 120, 40, "Transformer", { fill: C.cyanSoft, stroke: C.cyan, titleColor: C.cyan, titleSize: 11.5 });

    if (i === 0) {
      s += line(px + pw / 2, panelY + 84, px + pw / 2, panelY + 104, { color: C.border });
      s += meter(px + 30, panelY + 110, "Meter A");
      s += meter(px + 160, panelY + 110, "Meter B");
    } else if (i === 1) {
      s += line(px + pw / 2, panelY + 84, px + pw / 2, panelY + 104, { color: C.border });
      s += meter(px + 30, panelY + 130, "Meter A", { drag: true });
      s += meter(px + 160, panelY + 110, "Meter B", { highlight: true });
      s += arrow(px + 92, panelY + 138, px + 168, panelY + 122, { color: C.blue, width: 2, dash: "5 3" });
    } else {
      s += line(px + pw / 2, panelY + 84, px + pw / 2, panelY + 108, { color: C.border });
      s += cluster(px + pw / 2 - 70, panelY + 110);
      s += txt(px + pw / 2, panelY + 190, "Ungroup restores individual meters", { size: 10, color: C.grey, anchor: "middle" });
    }
  }
  return { id: "meter-cluster-steps", title: "Figure 5.6 — Creating a meter cluster", w: W, h: H, svg: wrap(W, H, s) };
}

// 10. Defence-in-depth security layers (Section 8)
function securityLayers() {
  const W = 940, H = 600;
  let s = txt(W / 2, 40, "Defence-in-Depth — layered security controls", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const layers = [
    ["Perimeter & Edge", "Azure Front Door · WAF · DDoS protection", C.blue, C.blueSoft],
    ["Network", "VNet isolation · NSGs · Azure Firewall · private endpoints", C.cyan, C.cyanSoft],
    ["Identity & Access", "Entra ID · MFA / SSO · RBAC · least privilege", C.indigo, C.indigoSoft],
    ["Application", "Secure SDLC · SAST / DAST · input validation · Key Vault", C.amber, C.amberSoft],
    ["Data", "AES-256 at rest · TLS 1.3 in transit · PII masking", C.green, C.greenSoft],
  ];
  layers.forEach((L, i) => {
    const x = 40 + 64 * i, y = 66 + 50 * i, w = 840 - 128 * i, h = 474 - 84 * i;
    s += rect(x, y, w, h, { fill: L[3], stroke: L[2], sw: 2, rx: 14 });
    const cw = Math.max(150, L[0].length * 9 + 30), cx = x + w / 2;
    s += rect(cx - cw / 2, y - 14, cw, 28, { fill: L[2], stroke: L[2], rx: 14, sw: 0 });
    s += txt(cx, y + 5, L[0], { size: 13, weight: 700, color: C.white, anchor: "middle" });
    s += txt(cx, y + 31, L[1], { size: 10.5, color: C.dark, anchor: "middle" });
  });
  const coreX = 350, coreY = 308, coreW = 220, coreH = 72;
  s += rect(coreX, coreY, coreW, coreH, { fill: C.blue, stroke: C.blue, rx: 12, sw: 0 });
  s += txt(coreX + coreW / 2, coreY + coreH / 2 - 3, "FBM data", { size: 13, weight: 700, color: C.white, anchor: "middle" });
  s += txt(coreX + coreW / 2, coreY + coreH / 2 + 15, "& audit trail", { size: 12, weight: 600, color: C.white, anchor: "middle" });
  s += txt(W / 2, H - 14, "Each layer is independent: a control failure at one layer is contained by the layers around it; all layers emit events to centralised monitoring.", { size: 10.5, color: C.grey, anchor: "middle" });
  return { id: "security-layers", title: "Figure 8.1 — Defence-in-depth security layers", w: W, h: H, svg: wrap(W, H, s) };
}

// 11. Authenticated request & access-control flow (Section 8)
function identityFlow() {
  const W = 960, H = 380;
  let s = txt(W / 2, 34, "Authenticated Request Flow & Access Control", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const y = 84, h = 74, w = 150, gap = 22, startX = 61;
  const steps = [
    ["User", "Eskom staff", C.blueSoft, C.blue],
    ["Entra ID", "SSO + MFA", C.indigoSoft, C.indigo],
    ["Edge", "Front Door · WAF", C.cyanSoft, C.cyan],
    ["API + RBAC", "token · role → capability", C.amberSoft, C.amber],
    ["FBM services", "access granted", C.greenSoft, C.green],
  ];
  const cxOf = (i) => startX + i * (w + gap) + w / 2;
  steps.forEach((st, i) => {
    const x = startX + i * (w + gap);
    s += node(x, y, w, h, st[0], { fill: st[2], stroke: st[3], titleColor: st[3], sub: st[1], titleSize: 13 });
    if (i < steps.length - 1) s += arrow(x + w, y + h / 2, x + w + gap, y + h / 2);
  });
  const apiCx = cxOf(3), dY = 206;
  s += arrow(apiCx, y + h, apiCx, dY, { color: C.red });
  s += txt(apiCx + 10, (y + h + dY) / 2 + 4, "deny", { size: 10.5, color: C.red, weight: 600 });
  s += node(apiCx - w / 2, dY, w, 56, "Access denied", { fill: C.redSoft, stroke: C.red, titleColor: C.red, sub: "blocked + logged", titleSize: 12.5 });
  const abX = startX, abW = (w + gap) * 4 + w, abY = 300, abH = 50;
  s += rect(abX, abY, abW, abH, { fill: C.light, stroke: C.grey, sw: 1.5, rx: 10 });
  s += txt(abX + abW / 2, abY + abH / 2 + 4.5, "Immutable audit log — every authentication and authorisation event is recorded", { size: 12, weight: 600, color: C.dark, anchor: "middle" });
  [cxOf(1), cxOf(4)].forEach((cx) => { s += arrow(cx, y + h, cx, abY, { color: C.grey, width: 1.3, dash: "4 3" }); });
  s += arrow(apiCx, dY + 56, apiCx, abY, { color: C.grey, width: 1.3, dash: "4 3" });
  return { id: "identity-flow", title: "Figure 8.2 — Authenticated request & access-control flow", w: W, h: H, svg: wrap(W, H, s) };
}

// 12. Compliance framework mapping (Section 8)
function complianceMatrix() {
  const W = 960, H = 470;
  let s = txt(W / 2, 36, "Compliance Framework Mapping", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const cols = ["POPIA", "ISO/IEC 27001", "SOC 2 Type II", "GDPR", "ISO 27017/18", "NIST CSF"];
  const rows = [
    ["Data protection & privacy", [1, 1, 1, 1, 1, 1]],
    ["Identity & access management", [1, 1, 1, 1, 1, 1]],
    ["Encryption (rest & transit)", [1, 1, 1, 1, 1, 1]],
    ["Logging, audit & monitoring", [1, 1, 1, 1, 1, 1]],
    ["Secure development (SAST/DAST)", [0, 1, 1, 1, 0, 1]],
    ["Resilience, backup & DR", [0, 1, 1, 0, 1, 1]],
    ["Incident & breach response", [1, 1, 1, 1, 0, 1]],
  ];
  const x0 = 40, labelW = 250, colW = (W - 80 - labelW) / cols.length;
  const y0 = 66, headH = 54, rowH = 44;
  cols.forEach((c, i) => {
    const cx = x0 + labelW + i * colW + colW / 2;
    s += rect(x0 + labelW + i * colW + 4, y0 + 8, colW - 8, headH - 12, { fill: C.blueSoft, stroke: C.blue, sw: 1, rx: 8 });
    s += txt(cx, y0 + headH / 2 + 4, c, { size: 10.5, weight: 700, color: C.blue, anchor: "middle" });
  });
  rows.forEach((r, ri) => {
    const ry = y0 + headH + ri * rowH;
    if (ri % 2 === 0) s += rect(x0, ry, W - 80, rowH, { fill: C.light, stroke: C.light, sw: 0, rx: 0 });
    s += txt(x0 + 12, ry + rowH / 2 + 4, r[0], { size: 11.5, weight: 600, color: C.dark });
    r[1].forEach((v, ci) => {
      const cx = x0 + labelW + ci * colW + colW / 2, cy = ry + rowH / 2;
      if (v) {
        s += `<circle cx="${cx}" cy="${cy}" r="8" fill="${C.green}"/>`;
        s += `<path d="M ${cx - 3.6} ${cy} L ${cx - 1} ${cy + 2.6} L ${cx + 4} ${cy - 3}" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else {
        s += line(cx - 6, cy, cx + 6, cy, { color: C.border, width: 2 });
      }
    });
  });
  s += rect(x0, y0 + headH, W - 80, rows.length * rowH, { fill: "none", stroke: C.border, sw: 1.5, rx: 8 });
  s += txt(W / 2, H - 14, "Mapping indicates design intent; certification scope and evidence to be confirmed with T2 Technologies and the Client during discovery.", { size: 10.5, color: C.grey, anchor: "middle" });
  return { id: "compliance-matrix", title: "Figure 8.3 — Compliance framework mapping", w: W, h: H, svg: wrap(W, H, s) };
}

// 13. Azure deployment architecture (Section 9)
function azureDeployment() {
  const W = 980, H = 640, B = C.blue;
  let s = txt(W / 2, 34, "Azure Deployment Architecture — Eskom Tenant", { size: 19, weight: 700, color: B, anchor: "middle" });
  s += node(40, 66, 190, 56, "End users", { fill: C.blueSoft, stroke: B, titleColor: B, sub: "browser · mobile", titleSize: 13 });
  s += node(750, 66, 190, 56, "Source systems", { fill: C.goldSoft, stroke: C.gold, titleColor: C.gold, sub: "MV90 · CC&B · Works Mgmt", titleSize: 12.5 });
  s += rect(40, 150, 900, 448, { fill: "#FAFBFD", stroke: B, sw: 2, rx: 14 });
  s += txt(60, 176, "Microsoft Azure — Eskom Tenant · South Africa North (primary) · data resident in RSA", { size: 12, weight: 700, color: B });
  s += node(80, 196, 360, 48, "Azure Front Door · WAF · DDoS", { fill: C.cyanSoft, stroke: C.cyan, titleColor: C.cyan, titleSize: 12.5 });
  s += node(540, 196, 360, 48, "API Management / ESB (iPaaS)", { fill: C.amberSoft, stroke: C.amber, titleColor: C.amber, titleSize: 12.5 });
  s += arrow(135, 122, 200, 196);
  s += arrow(845, 122, 720, 196);
  // VNet
  s += rect(80, 268, 540, 250, { fill: C.white, stroke: C.indigo, sw: 1.8, rx: 12, dash: "6 4" });
  s += txt(96, 290, "Virtual Network — private · NSG · Azure Firewall", { size: 11.5, weight: 700, color: C.indigo });
  s += node(210, 306, 200, 64, "AKS / App Service", { fill: C.indigoSoft, stroke: C.indigo, titleColor: C.indigo, sub: "stateless microservices", titleSize: 13 });
  s += node(100, 410, 160, 72, "Azure SQL", { fill: C.greenSoft, stroke: C.green, titleColor: C.green, sub: "zone-redundant · TDE", titleSize: 12.5 });
  s += node(280, 410, 160, 72, "Storage / Blob", { fill: C.greenSoft, stroke: C.green, titleColor: C.green, sub: "integration · reports", titleSize: 12.5 });
  s += node(460, 410, 140, 72, "Azure Cache", { fill: C.light, stroke: C.grey, titleColor: C.dark, sub: "sessions", titleSize: 12.5 });
  // Platform services
  s += rect(650, 268, 250, 250, { fill: C.white, stroke: C.gold, sw: 1.8, rx: 12 });
  s += txt(666, 290, "Platform services", { size: 11.5, weight: 700, color: C.gold });
  s += node(668, 304, 214, 52, "Microsoft Entra ID", { fill: C.blueSoft, stroke: B, titleColor: B, sub: "SSO · MFA · RBAC", titleSize: 12.5 });
  s += node(668, 366, 214, 52, "Azure Key Vault", { fill: C.blueSoft, stroke: B, titleColor: B, sub: "secrets · keys", titleSize: 12.5 });
  s += node(668, 428, 214, 62, "Monitor · Log Analytics", { fill: C.blueSoft, stroke: B, titleColor: B, sub: "+ Sentinel (SIEM)", titleSize: 12.5 });
  // DR
  s += node(80, 534, 820, 44, "Disaster recovery — geo-replication to South Africa West (paired region) · automated backups · tested DRP", { fill: C.redSoft, stroke: C.red, titleColor: C.red, titleSize: 11.5 });
  // internal arrows
  s += arrow(260, 244, 280, 306);
  s += arrow(720, 244, 380, 306, { color: C.grey });
  s += arrow(280, 370, 200, 410, { color: C.grey });
  s += arrow(320, 370, 350, 410, { color: C.grey });
  s += arrow(360, 370, 500, 410, { color: C.grey });
  s += arrow(410, 332, 668, 328, { color: C.grey, dash: "5 3" });
  return { id: "azure-deployment", title: "Figure 9.1 — Azure deployment architecture", w: W, h: H, svg: wrap(W, H, s) };
}

// 14. Integration architecture (Section 9)
function integrationArchitecture() {
  const W = 980, H = 470;
  let s = txt(W / 2, 34, "Integration Architecture — sources to insight", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const sources = [
    ["MV90 stats meters", C.blue],
    ["CC&B billing", C.cyan],
    ["Works Mgmt (MAXIMO)", C.amber],
    ["CNL / GIS", C.indigo],
  ];
  const sy = 82, sh = 50, sgap = 12;
  sources.forEach((src, i) => {
    const y = sy + i * (sh + sgap);
    s += node(40, y, 180, sh, src[0], { fill: C.light, stroke: src[1], titleColor: src[1], titleSize: 12 });
    s += arrow(220, y + sh / 2, 300, 214, { color: C.grey, width: 1.4 });
  });
  // ESB
  s += node(300, 120, 180, 190, "API Management / ESB", { fill: C.amberSoft, stroke: C.amber, titleColor: C.amber, sub: "adapters · routing · validation · throttling", titleSize: 13 });
  s += arrow(480, 214, 540, 214);
  // FBM platform
  s += rect(540, 92, 210, 246, { fill: C.white, stroke: C.blue, sw: 1.8, rx: 12 });
  s += txt(645, 114, "FBM platform", { size: 12, weight: 700, color: C.blue, anchor: "middle" });
  const fbm = [["Ingestion", C.cyan], ["Validation & exceptions", C.amber], ["Balancing & data stores", C.green]];
  fbm.forEach((f, i) => {
    const y = 126 + i * 68;
    s += node(558, y, 174, 56, f[0], { fill: C.blueSoft, stroke: f[1], titleColor: f[1], titleSize: 12 });
    if (i < fbm.length - 1) s += arrow(645, y + 56, 645, y + 68, { color: C.grey, width: 1.4 });
  });
  s += arrow(750, 214, 800, 214);
  // outputs
  const outs = [["BI / corporate reporting", C.green], ["Losses Reduction Potential", C.green], ["Dashboards & heat map", C.blue]];
  outs.forEach((o, i) => {
    const y = 120 + i * 66;
    s += node(800, y, 180, 54, o[0], { fill: C.greenSoft, stroke: o[1], titleColor: o[1], titleSize: 11.5 });
    if (i !== 1) s += arrow(790, 214, 800, y + 27, { color: C.grey, width: 1.3 });
  });
  // monitoring bar
  s += rect(40, 400, 940, 42, { fill: C.light, stroke: C.grey, sw: 1.4, rx: 10 });
  s += txt(510, 426, "Centralised monitoring, correlation IDs and audit logging across every integration hop", { size: 11.5, weight: 600, color: C.dark, anchor: "middle" });
  return { id: "integration-architecture", title: "Figure 9.2 — Integration architecture", w: W, h: H, svg: wrap(W, H, s) };
}

// 15. Environments, CI/CD & DR (Section 9)
function environmentsPipeline() {
  const W = 980, H = 380;
  let s = txt(W / 2, 34, "Environments, CI/CD & Disaster Recovery", { size: 19, weight: 700, color: C.blue, anchor: "middle" });
  const y = 118, h = 76, w = 130, gap = 24, startX = 40;
  const stages = [
    ["Commit", "developer", C.blueSoft, C.blue],
    ["Build & SAST", "CI pipeline", C.cyanSoft, C.cyan],
    ["DEV", "integration", C.indigoSoft, C.indigo],
    ["TEST / UAT", "DAST · UAT", C.amberSoft, C.amber],
    ["PROD", "SA North", C.greenSoft, C.green],
    ["DR", "SA West", C.redSoft, C.red],
  ];
  stages.forEach((st, i) => {
    const x = startX + i * (w + gap);
    s += node(x, y, w, h, st[0], { fill: st[2], stroke: st[3], titleColor: st[3], sub: st[1], titleSize: 13 });
    if (i < stages.length - 1) {
      const dashed = i === stages.length - 2;
      s += arrow(x + w, y + h / 2, x + w + gap, y + h / 2, dashed ? { color: C.red, dash: "5 3" } : {});
    }
  });
  // approval gate chip between TEST and PROD
  const gateX = startX + 4 * (w + gap) - gap / 2;
  s += chip(gateX - 46, y - 34, 92, 22, "approval gate", { fill: C.white, stroke: C.gold, color: C.gold, size: 10 });
  s += line(gateX, y - 12, gateX, y + h / 2 - 10, { color: C.gold, width: 1.2, dash: "3 3" });
  // replication label
  const repX = startX + 5 * (w + gap) - gap / 2;
  s += txt(repX, y - 16, "geo-replication", { size: 10, color: C.red, weight: 600, anchor: "middle" });
  // pipeline bar
  s += rect(40, 250, 924, 46, { fill: C.light, stroke: C.grey, sw: 1.4, rx: 10 });
  s += txt(502, 278, "Azure DevOps / GitHub Actions — build · automated tests · SAST/DAST · IaC (Bicep/Terraform) · gated release", { size: 11.5, weight: 600, color: C.dark, anchor: "middle" });
  s += txt(W / 2, H - 16, "Identical, isolated environments promoted through automated quality gates; production continuously protected by a paired-region DR target.", { size: 10.5, color: C.grey, anchor: "middle" });
  return { id: "environments-pipeline", title: "Figure 9.3 — Environments, CI/CD & DR", w: W, h: H, svg: wrap(W, H, s) };
}

/* --------------------------------------------------------------- rasterise */
function rasterize(svg, scale = 2) {
  const resvg = new Resvg(svg, {
    font: { fontFiles: FONT_FILES, defaultFontFamily: "Inter", loadSystemFonts: false },
    fitTo: { mode: "zoom", value: scale },
  });
  const rendered = resvg.render();
  return { buffer: rendered.asPng(), width: rendered.width, height: rendered.height };
}

function getDiagrams() {
  return [
    logicalArchitecture(), deploymentArchitecture(), dataFlow(),
    deliveryRoadmap(), sprintCycle(), governanceStructure(),
    configWorkflow(), mappingWorkflow(), meterClusterSteps(),
    securityLayers(), identityFlow(), complianceMatrix(),
    azureDeployment(), integrationArchitecture(), environmentsPipeline(),
  ];
}

/** Build a { id: { buffer, width, height, title, w, h } } map. */
function buildAll() {
  const out = {};
  for (const d of getDiagrams()) {
    const png = rasterize(d.svg, 2);
    out[d.id] = { ...png, title: d.title, logicalW: d.w, logicalH: d.h };
  }
  return out;
}

module.exports = { getDiagrams, rasterize, buildAll, C };

// Debug: `node scripts/submission/diagrams.js` writes PNG previews to /tmp.
if (require.main === module) {
  const dir = "/tmp/agent-browser";
  fs.mkdirSync(dir, { recursive: true });
  for (const d of getDiagrams()) {
    const png = rasterize(d.svg, 2);
    fs.writeFileSync(path.join(dir, `diag-${d.id}.png`), png.buffer);
    console.log(`${d.id}: ${png.width}x${png.height}`);
  }
}
