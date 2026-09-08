/**
 * Generates a standalone brief (.docx + .pdf) containing every section of the
 * T2 Technologies tender draft that is assigned to Thabiso.
 *
 * Ownership taken verbatim from the draft's Contents page:
 *   5. Solution Architecture and Design Principles   (Thabiso)
 *   6. Delivery Methodology and Implementation Plan   (Thabiso)
 *   7. Programme Governance and Quality Management     (Thabiso)
 *  17. Commercial Proposal Framework / Pricing Schedule (Tumelo / Thabiso — shared)
 *
 * Body content is reproduced from the draft so this doc is self-contained.
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun,
} = require("docx");
const PDFDocument = require("pdfkit");
const { buildAll } = require("./diagrams");

// Rasterised diagrams (id -> { buffer, width, height, title }) and helpers to
// resolve either a diagram or a live-application screenshot into an embeddable
// image with a caption.
const diagrams = buildAll();
const ASSET_DIR = path.join(__dirname, "assets");
function pngSize(buf) { return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }; }
function loadShot(file) {
  const buffer = fs.readFileSync(path.join(ASSET_DIR, file));
  const { width, height } = pngSize(buffer);
  return { buffer, width, height };
}
function resolveFigure(fig) {
  if (fig.kind === "diagram") {
    const d = diagrams[fig.id];
    return { buffer: d.buffer, width: d.width, height: d.height, caption: fig.caption || d.title, isShot: false };
  }
  const s = loadShot(fig.file);
  return { buffer: s.buffer, width: s.width, height: s.height, caption: fig.caption, isShot: true };
}

const BRAND = { blue: "004898", gold: "A39273", dark: "1F2937", grey: "6B7280", light: "F3F4F6" };
const TENDER = { enquiry: "3239CXMWP", title: "Feeder Balancing Module (FBM) Tool", owner: "Thabiso" };

/* ------------------------------------------------------------------ content */
// Each section: heading, optional intro paragraphs, optional tables, optional
// subsections with bullet lists. Reproduced from the draft.
const sections = [
  {
    n: "5",
    title: "Solution Architecture and Design Principles",
    ownership: "Owned by Thabiso",
    intro: [
      "The target architecture will be confirmed during discovery, but T2 Technologies will apply the following principles unless the Client's standards require otherwise.",
    ],
    table: {
      head: ["Principle", "Application"],
      rows: [
        ["Modularity", "Separate business capabilities into clear modules and interfaces so that components can evolve independently."],
        ["API First", "Expose controlled interfaces for system interaction instead of direct database coupling wherever practicable."],
        ["Security by Design", "Apply identity, authorisation, encryption, secrets management, auditability and secure coding from the start."],
        ["Traceability", "Use correlation identifiers and structured logs to trace transactions across service boundaries."],
        ["Resilience", "Apply timeouts, retries where safe, circuit-breaking or isolation patterns, failure handling and recovery controls."],
        ["Idempotency", "Protect critical write operations from accidental duplication when business or integration flows can be retried."],
        ["Observability", "Capture metrics, logs and service health to support proactive operational management."],
        ["Data Governance", "Define ownership, quality controls, retention, access and lineage for critical data."],
        ["Automation", "Automate builds, tests, deployments and repeatable infrastructure tasks to reduce operational error."],
        ["Portability", "Avoid unnecessary technology lock-in and preserve the ability to evolve the deployment model."],
      ],
    },
    subsections: [
      {
        title: "5.1 Illustrative Logical Architecture",
        bullets: [
          "Experience Layer: web portals, mobile applications, administration interfaces and assisted-service channels.",
          "API / Integration Layer: authenticated APIs, routing, orchestration, validation, throttling, transaction controls and external connectors.",
          "Business Services Layer: domain-specific services, workflows and business rules.",
          "Data Layer: operational databases, integration stores, reporting data and controlled analytics pipelines.",
          "Platform Layer: runtime environments, containers/virtual infrastructure, network controls, secrets, backup and recovery.",
          "Operations Layer: CI/CD, monitoring, logging, alerting, vulnerability management, service management and audit reporting.",
        ],
        figures: [{ kind: "diagram", id: "logical-architecture" }],
      },
      {
        title: "5.2 Reference Deployment and Data Flow",
        intro: [
          "The module is designed for a resilient, cloud-ready deployment. Traffic is terminated at a managed edge, routed to stateless application services behind a private network boundary, and backed by managed data and integration stores. The data-flow view shows how metered readings move through import, validation and balancing into the decisions and actions the tool surfaces.",
        ],
        figures: [
          { kind: "diagram", id: "deployment-architecture" },
          { kind: "diagram", id: "data-flow" },
        ],
      },
      {
        title: "5.3 Application Configuration Workflows",
        intro: [
          "The following workflows explain how the tool is operated day to day — behaviour that cannot be conveyed by a static screen alone. Each workflow diagram is paired with a capture of the corresponding screen in the live FBM application.",
          "Configuring a network establishes the eight-level hierarchy (Operating Unit down to Meter); network mapping then lets an engineer re-parent equipment and group meters, transformers or feeders into clusters by drag-and-drop, with energy roll-ups recalculated automatically.",
        ],
        figures: [
          { kind: "diagram", id: "config-workflow" },
          { kind: "shot", file: "shot-configure.png", caption: "Figure 5.7 — Configure Network (live tool): the eight-level hierarchy with automatic energy roll-up and loss KPIs computed at every level." },
          { kind: "diagram", id: "mapping-workflow" },
          { kind: "shot", file: "shot-mapping.png", caption: "Figure 5.8 — Network Mapping (live tool): drag-and-drop organisation chart for a selected substation." },
          { kind: "diagram", id: "meter-cluster-steps" },
          { kind: "shot", file: "shot-cluster.png", caption: "Figure 5.9 — Network Mapping (live tool): two meters grouped into a meter cluster, with one-click Ungroup to reverse the grouping." },
        ],
      },
    ],
  },
  {
    n: "6",
    title: "Delivery Methodology and Implementation Plan",
    ownership: "Owned by Thabiso",
    intro: [
      "T2 Technologies proposes a phased agile delivery model governed by formal stage gates. This balances iterative product development with the traceability and accountability expected in enterprise and public-sector programmes.",
    ],
    table: {
      head: ["Phase", "Indicative Timing", "Key Activities", "Exit Outcome"],
      rows: [
        ["Phase 0 - Mobilisation", "Weeks 1-2", "Contract mobilisation, governance, access, stakeholder map, delivery plan, risks, environments and document baseline.", "Approved mobilisation pack and detailed project plan."],
        ["Phase 1 - Discovery & Blueprint", "Weeks 2-6", "Current-state assessment, requirements, process mapping, architecture, security assessment and prioritisation.", "Requirements baseline, target architecture, backlog and migration approach."],
        ["Phase 2 - Foundation", "Weeks 5-10", "Core platform, CI/CD, security baseline, integration foundation, environments and observability.", "Operational technical foundation ready for solution increments."],
        ["Phase 3 - Incremental Build", "Weeks 8-20", "Applications, APIs, integrations, workflows, data pipelines and automated tests delivered in sprints.", "Demonstrable functional releases with traceability."],
        ["Phase 4 - Integration, UAT & Readiness", "Weeks 18-23", "End-to-end testing, performance/security testing, user acceptance, training, migration rehearsal and operational readiness.", "UAT sign-off and go-live readiness approval."],
        ["Phase 5 - Go-Live & Stabilisation", "Weeks 24+", "Production deployment, hypercare, defect resolution, monitoring, support transition and post-implementation review.", "Stable production service and transition to BAU support."],
      ],
    },
    note: "The above timeline is illustrative. The final schedule must be reconciled with the issued tender milestones, scope volume, data migration complexity, external dependencies, procurement lead times and Client resource availability.",
    figures: [
      { kind: "diagram", id: "delivery-roadmap" },
      { kind: "diagram", id: "sprint-cycle" },
    ],
    subsections: [
      {
        title: "6.1 Sprint Delivery",
        bullets: [
          "Prioritised product backlog linked to approved requirements.",
          "Regular planning, refinement, demonstrations and retrospectives.",
          "Definition of Done covering functional behaviour, testing, security, documentation and deployability.",
          "Formal change control for scope or contractual impacts outside the approved backlog baseline.",
          "Release notes and auditable evidence for each production release.",
        ],
      },
    ],
  },
  {
    n: "7",
    title: "Programme Governance and Quality Management",
    ownership: "Owned by Thabiso",
    intro: [
      "Governance will provide clear authority, reporting, escalation and evidence-based decision making. T2 Technologies recommends a joint structure that includes executive oversight, programme management and technical working groups.",
    ],
    table: {
      head: ["Forum", "Purpose", "Indicative Cadence"],
      rows: [
        ["Steering Committee", "Executive decisions, scope/budget oversight, strategic risks, escalations and milestone approval.", "Monthly or as prescribed"],
        ["Programme Review", "Progress, dependencies, RAID log, commercial status, upcoming milestones and actions.", "Weekly"],
        ["Architecture / Security Review", "Design decisions, integration standards, security controls, technical debt and exceptions.", "Weekly / per major design"],
        ["Sprint Ceremonies", "Planning, stand-ups, demonstrations, retrospectives and backlog refinement.", "Per sprint"],
        ["Service Review", "SLA performance, incidents, problems, capacity, releases and continuous improvement.", "Monthly post go-live"],
      ],
    },
    figures: [{ kind: "diagram", id: "governance-structure" }],
    subsections: [
      {
        title: "7.1 Quality Controls",
        bullets: [
          "Requirements-to-test traceability.",
          "Peer review and controlled source-code management.",
          "Automated unit/integration testing wherever practical.",
          "Security checks integrated into the development lifecycle.",
          "Controlled environments and release approvals.",
          "Document versioning and approval records.",
          "Defect prioritisation and transparent closure evidence.",
          "Post-release verification and service health monitoring.",
        ],
      },
    ],
  },
  {
    n: "17",
    title: "Commercial Proposal Framework / Pricing Schedule",
    ownership: "Shared — Tumelo / Thabiso",
    intro: [
      "Pricing must be completed strictly in the format prescribed by the tender. The following table can be used as an internal reconciliation schedule before values are transferred to the official pricing forms.",
    ],
    table: {
      head: ["Cost Component", "Pricing Basis", "Amount (Excl. VAT)", "Notes"],
      rows: [
        ["Mobilisation & Discovery", "Fixed price / milestone", "R [INSERT]", ""],
        ["Architecture & Design", "Fixed price / milestone", "R [INSERT]", ""],
        ["Application & Integration Delivery", "Fixed / sprint / deliverable", "R [INSERT]", ""],
        ["Data & Migration", "Fixed / estimated volume", "R [INSERT]", ""],
        ["Cloud / DevOps Setup", "Fixed price", "R [INSERT]", "Third-party cloud fees separate unless included"],
        ["Testing & Go-Live", "Fixed price", "R [INSERT]", ""],
        ["Training & Knowledge Transfer", "Fixed price", "R [INSERT]", ""],
        ["Support & Maintenance", "Monthly / annual", "R [INSERT]", "State SLA and support window"],
        ["Third-Party Costs", "At cost / specified", "R [INSERT]", "List separately"],
        ["Total Tendered Price", "As prescribed", "R [INSERT]", "Reconcile to official tender schedule"],
      ],
    },
    note: "Commercial validity, escalation, travel, disbursements, VAT, payment milestones, retention, performance guarantees and any exchange-rate assumptions must be completed exactly as required by the tender conditions.",
  },
];

const outDir = path.join(__dirname, "..", "..", "public", "downloads");
fs.mkdirSync(outDir, { recursive: true });
const baseName = "T2-Technologies-FBM-Thabiso-Sections";

module.exports = { sections, TENDER, BRAND, outDir, baseName };

/* ---------------------------------------------------------------- DOCX build */
function buildDocx() {
  const children = [];

  // Cover / title
  children.push(
    new Paragraph({ spacing: { before: 400, after: 120 }, children: [new TextRun({ text: "T2 TECHNOLOGIES", bold: true, size: 40, color: BRAND.blue })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `${TENDER.title} — Tender Enquiry ${TENDER.enquiry}`, size: 24, color: BRAND.dark })] }),
    new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: `Author work package — ${TENDER.owner}`, bold: true, size: 28, color: BRAND.gold })] }),
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: "This brief consolidates every section of the tender submission draft assigned to Thabiso, with the current draft content reproduced in full so each section can be developed independently before being merged back into the master document.", size: 22, color: BRAND.dark })],
    }),
  );

  // Assignment summary table
  children.push(new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: "Assignment Summary", bold: true, size: 26, color: BRAND.blue })] }));
  children.push(docxTable(
    ["Section", "Title", "Ownership"],
    sections.map((s) => [s.n, s.title, s.ownership]),
  ));

  // Each section
  for (const s of sections) {
    children.push(new Paragraph({ pageBreakBefore: true, spacing: { before: 200, after: 40 }, heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: `${s.n}. ${s.title}`, bold: true, size: 30, color: BRAND.blue })] }));
    children.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: s.ownership, italics: true, bold: true, size: 20, color: BRAND.gold })] }));
    (s.intro || []).forEach((p) => children.push(new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: p, size: 22, color: BRAND.dark })] })));
    if (s.table) children.push(docxTable(s.table.head, s.table.rows));
    if (s.note) children.push(new Paragraph({ spacing: { before: 140, after: 140 }, children: [new TextRun({ text: s.note, italics: true, size: 20, color: BRAND.grey })] }));
    (s.figures || []).forEach((f) => pushDocxFigure(children, f));
    (s.subsections || []).forEach((sub) => {
      children.push(new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text: sub.title, bold: true, size: 24, color: BRAND.dark })] }));
      (sub.intro || []).forEach((p) => children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: p, size: 22, color: BRAND.dark })] })));
      (sub.bullets || []).forEach((b) => children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: b, size: 22, color: BRAND.dark })] })));
      (sub.figures || []).forEach((f) => pushDocxFigure(children, f));
    });
  }

  const doc = new Document({
    creator: "T2 Technologies",
    title: `FBM Tender — Thabiso Sections`,
    sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } }, children }],
  });

  return Packer.toBuffer(doc).then((buf) => {
    const p = path.join(outDir, `${baseName}.docx`);
    fs.writeFileSync(p, buf);
    console.log("DOCX written:", p, (buf.length / 1024).toFixed(0) + "KB");
  });
}

function docxTable(head, rows) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" };
  const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
  const headRow = new TableRow({
    tableHeader: true,
    children: head.map((h) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: BRAND.blue },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })] })],
    })),
  });
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((c) => new TableCell({
      shading: ri % 2 ? { type: ShadingType.CLEAR, fill: BRAND.light } : undefined,
      margins: { top: 50, bottom: 50, left: 80, right: 80 },
      children: [new Paragraph({ children: [new TextRun({ text: String(c), size: 19, color: BRAND.dark })] })],
    })),
  }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [headRow, ...bodyRows] });
}

function pushDocxFigure(children, fig) {
  const r = resolveFigure(fig);
  const maxW = 600;
  const scale = Math.min(1, maxW / r.width);
  const w = Math.round(r.width * scale);
  const h = Math.round(r.height * scale);
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 40 },
    children: [new ImageRun({ type: "png", data: r.buffer, transformation: { width: w, height: h } })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: r.caption, italics: true, size: 16, color: BRAND.grey })],
  }));
}

/* ----------------------------------------------------------------- PDF build */
function buildPdf() {
  const M = 54;
  const doc = new PDFDocument({ size: "A4", margins: { top: M, bottom: M, left: M, right: M }, bufferPages: true });
  const outPath = path.join(outDir, `${baseName}.pdf`);
  const outStream = fs.createWriteStream(outPath);
  doc.pipe(outStream);
  const CW = doc.page.width - M * 2;
  const REG = "Helvetica", BOLD = "Helvetica-Bold", IT = "Helvetica-Oblique";
  const c = (h) => "#" + h;

  const ensure = (need) => { if (doc.y + need > doc.page.height - M - 24) doc.addPage(); };

  // Cover
  doc.font(BOLD).fontSize(30).fillColor(c(BRAND.blue)).text("T2 TECHNOLOGIES", M, 120);
  doc.font(REG).fontSize(13).fillColor(c(BRAND.dark)).text(`${TENDER.title} — Tender Enquiry ${TENDER.enquiry}`, { width: CW });
  doc.moveDown(0.4);
  doc.font(BOLD).fontSize(16).fillColor(c(BRAND.gold)).text(`Author work package — ${TENDER.owner}`);
  doc.moveDown(0.8);
  doc.font(REG).fontSize(11).fillColor(c(BRAND.dark)).text(
    "This brief consolidates every section of the tender submission draft assigned to Thabiso, with the current draft content reproduced in full so each section can be developed independently before being merged back into the master document.",
    { width: CW },
  );
  doc.moveDown(1.2);

  // Assignment summary
  doc.font(BOLD).fontSize(13).fillColor(c(BRAND.blue)).text("Assignment Summary");
  doc.moveDown(0.3);
  pdfTable(["Section", "Title", "Ownership"], sections.map((s) => [s.n, s.title, s.ownership]), [0.12, 0.55, 0.33]);

  for (const s of sections) {
    doc.addPage();
    doc.font(BOLD).fontSize(17).fillColor(c(BRAND.blue)).text(`${s.n}. ${s.title}`, { width: CW });
    doc.moveDown(0.2);
    doc.font(IT).fontSize(10).fillColor(c(BRAND.gold)).text(s.ownership);
    doc.moveDown(0.5);
    (s.intro || []).forEach((p) => { doc.font(REG).fontSize(11).fillColor(c(BRAND.dark)).text(p, { width: CW }); doc.moveDown(0.5); });
    if (s.table) pdfTable(s.table.head, s.table.rows, colWidthsFor(s.table.head.length));
    if (s.note) { doc.moveDown(0.4); doc.font(IT).fontSize(9.5).fillColor(c(BRAND.grey)).text(s.note, { width: CW }); doc.moveDown(0.3); }
    (s.figures || []).forEach((f) => pdfFigure(f));
    (s.subsections || []).forEach((sub) => {
      ensure(60);
      doc.moveDown(0.5);
      doc.font(BOLD).fontSize(12).fillColor(c(BRAND.dark)).text(sub.title);
      doc.moveDown(0.2);
      (sub.intro || []).forEach((p) => { doc.font(REG).fontSize(11).fillColor(c(BRAND.dark)).text(p, { width: CW }); doc.moveDown(0.4); });
      (sub.bullets || []).forEach((b) => {
        ensure(24);
        const startY = doc.y;
        doc.font(BOLD).fontSize(11).fillColor(c(BRAND.gold)).text("•", M, startY, { width: 12 });
        doc.font(REG).fontSize(11).fillColor(c(BRAND.dark)).text(b, M + 14, startY, { width: CW - 14 });
        doc.moveDown(0.25);
      });
      (sub.figures || []).forEach((f) => pdfFigure(f));
    });
  }

  function pdfFigure(fig) {
    const r = resolveFigure(fig);
    const w = CW;
    const h = r.height * (CW / r.width);
    const capH = 22;
    if (doc.y + h + capH > doc.page.height - M - 24) doc.addPage();
    doc.moveDown(0.4);
    const y = doc.y;
    doc.image(r.buffer, M, y, { width: w });
    if (r.isShot) doc.rect(M, y, w, h).strokeColor("#D1D5DB").lineWidth(0.75).stroke();
    doc.y = y + h + 4;
    doc.font(IT).fontSize(8.5).fillColor(c(BRAND.grey)).text(r.caption, M, doc.y, { width: CW, align: "center" });
    doc.moveDown(0.6);
  }

  function colWidthsFor(n) {
    if (n === 2) return [0.28, 0.72];
    if (n === 3) return [0.28, 0.52, 0.2];
    return [0.26, 0.2, 0.34, 0.2];
  }

  function pdfTable(head, rows, widths) {
    const xs = [];
    let acc = M;
    widths.forEach((w) => { xs.push(acc); acc += w * CW; });
    const pad = 5;

    const rowHeight = (cells) => {
      let h = 0;
      cells.forEach((cell, i) => {
        const w = widths[i] * CW - pad * 2;
        const hh = doc.font(REG).fontSize(9).heightOfString(String(cell), { width: w });
        h = Math.max(h, hh);
      });
      return h + pad * 2;
    };

    // header
    const hh = rowHeight(head);
    ensure(hh + 20);
    let y = doc.y;
    doc.rect(M, y, CW, hh).fill(c(BRAND.blue));
    head.forEach((t, i) => {
      doc.font(BOLD).fontSize(9).fillColor("#FFFFFF").text(String(t), xs[i] + pad, y + pad, { width: widths[i] * CW - pad * 2 });
    });
    y += hh;

    rows.forEach((r, ri) => {
      const rh = rowHeight(r);
      if (y + rh > doc.page.height - M - 24) {
        doc.addPage();
        y = doc.y;
        // repeat header
        doc.rect(M, y, CW, hh).fill(c(BRAND.blue));
        head.forEach((t, i) => doc.font(BOLD).fontSize(9).fillColor("#FFFFFF").text(String(t), xs[i] + pad, y + pad, { width: widths[i] * CW - pad * 2 }));
        y += hh;
      }
      if (ri % 2) doc.rect(M, y, CW, rh).fill(c(BRAND.light));
      r.forEach((cell, i) => {
        doc.font(REG).fontSize(9).fillColor(c(BRAND.dark)).text(String(cell), xs[i] + pad, y + pad, { width: widths[i] * CW - pad * 2 });
      });
      // grid line
      doc.moveTo(M, y + rh).lineTo(M + CW, y + rh).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
      y += rh;
    });
    doc.rect(M, doc.y, 0, 0); // reset
    doc.y = y + 4;
  }

  // footer page numbers
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const saved = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - 30;
    doc.font(REG).fontSize(7.5).fillColor(c(BRAND.grey));
    doc.text(`T2 Technologies · FBM Tender — Thabiso work package · Enquiry ${TENDER.enquiry}`, M, y, { width: CW * 0.72, align: "left", lineBreak: false });
    doc.text(`Page ${i - range.start + 1} of ${range.count}`, M + CW * 0.72, y, { width: CW * 0.28, align: "right", lineBreak: false });
    doc.page.margins.bottom = saved;
  }

  doc.end();
  return new Promise((res) => outStream.on("finish", () => {
    console.log("PDF written:", outPath, (fs.statSync(outPath).size / 1024).toFixed(0) + "KB", range.count, "pages");
    res();
  }));
}

if (require.main === module) {
  (async () => { await buildDocx(); await buildPdf(); })();
}
