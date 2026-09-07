/**
 * Single source of truth for the FBM tender submission document.
 * Consumed by build-docx.js and build-pdf.js so the .docx and .pdf stay in sync.
 *
 * Block schema:
 *   { type: 'cover', title, subtitle, meta: [[label, value]...] }
 *   { type: 'h1'|'h2'|'h3', text, num? }
 *   { type: 'p', text }                      // supports **bold** inline
 *   { type: 'bullets', items: [text...] }    // supports **bold** inline
 *   { type: 'table', widths:[..], headers:[..], rows:[[..]] }
 *   { type: 'callout', text }                // shaded emphasis box
 *   { type: 'spacer' } | { type: 'pagebreak' }
 *
 * Company-specific evidence is intentionally left as [PLACEHOLDER: ...] so nothing is fabricated.
 */

const BRAND = {
  blue: "#00499b",
  green: "#43a935",
  gold: "#A39273",
  ink: "#1f2937",
  grey: "#6b7280",
  light: "#eef2f7",
};

const TENDER = {
  enquiry: "3239CXMWP",
  title: "Feeder Balancing Module (FBM) Tool",
  client: "Eskom Holdings SOC Ltd — Distribution Group IT",
  bidder: "T2 Technologies",
  closing: "10 September 2026 at 10:00 (South African Standard Time)",
  contract: "NEC3 Professional Services Contract (Option A), ~6.5-year term",
  validity: "[PLACEHOLDER: validity period per ITT, e.g. 120 days from closing]",
};

const blocks = [
  // ---------------------------------------------------------------- COVER
  {
    type: "cover",
    title: "Tender Submission",
    subtitle:
      "Feeder Balancing Module (FBM) Tool — Design, Build, Host, Support and Maintain",
    meta: [
      ["Enquiry / Tender Number", TENDER.enquiry],
      ["Tender Title", TENDER.title],
      ["Issued By", TENDER.client],
      ["Bidder", TENDER.bidder],
      ["Contract Form", TENDER.contract],
      ["Closing Date & Time", TENDER.closing],
      ["Bid Validity", TENDER.validity],
      ["Classification", "Confidential — Tender Response"],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- DOC CONTROL
  { type: "h1", text: "Document Control", noNum: true },
  {
    type: "table",
    widths: [34, 66],
    headers: ["Item", "Detail"],
    rows: [
      ["Document Title", "T2 Technologies — FBM Tool Tender Submission"],
      ["Version", "1.0 (Draft for tender-specific completion)"],
      ["Prepared For", TENDER.client],
      ["Prepared By", "T2 Technologies"],
      ["Enquiry Number", TENDER.enquiry],
      ["Classification", "Confidential"],
      ["Date", "[PLACEHOLDER: submission date]"],
    ],
  },
  { type: "spacer" },
  {
    type: "callout",
    text:
      "Completion note: Replace every [PLACEHOLDER: …] with the exact wording and values from the issued tender pack before submission. Where this document and the issued tender pack conflict, the tender pack takes precedence. All company registration documents, tax compliance status, B-BBEE evidence, key-personnel CVs, priced schedules and signed returnable forms must be attached in the format prescribed by Eskom.",
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- CONTENTS
  { type: "h1", text: "Contents", noNum: true },
  {
    type: "bullets",
    items: [
      "Letter of Tender Submission",
      "1. Executive Summary",
      "2. Understanding of Eskom's Requirement",
      "3. Response Map to the Evaluation Criteria",
      "4. Key Requirements Response (20%)",
      "5. Functional Requirements Response (40%)",
      "6. Non-Functional Requirements Response (20%)",
      "7. Cloud Response (5%)",
      "8. Security Response (15%)",
      "9. Solution Architecture and Design Principles",
      "10. Delivery Methodology and Implementation Plan",
      "11. Programme Governance and Proposed Team",
      "12. Relevant Experience and the FBM Working Prototype",
      "13. Testing and Quality Assurance",
      "14. Service Management, Support and Maintenance",
      "15. Knowledge Transfer and Change Enablement",
      "16. Risk Management",
      "17. Socio-Economic Development (SD&L)",
      "18. Assumptions, Dependencies and Exclusions",
      "19. Commercial Proposal Framework",
      "20. Functional & Non-Functional Compliance Matrix",
      "21. Declarations and Acceptance",
      "22. Returnable Schedules and Annexure Checklist",
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- LETTER
  { type: "h1", text: "Letter of Tender Submission", noNum: true },
  { type: "p", text: "To: The Bid Evaluation Committee" },
  { type: "p", text: `Organisation: ${TENDER.client}` },
  { type: "p", text: `Enquiry: ${TENDER.enquiry} — ${TENDER.title}` },
  { type: "spacer" },
  { type: "p", text: "Dear Sir / Madam," },
  {
    type: "p",
    text:
      "T2 Technologies is pleased to submit this proposal for the design, build, hosting, support and maintenance of the Feeder Balancing Module (FBM) Tool. We understand that Eskom Distribution is not asking for an isolated software build. Eskom needs a governed, auditable capability that consolidates fragmented source-system data into a single trusted universe, lets energy analysts correct network configuration and allocate unallocated sales, calculates reliable energy-balancing results, and publishes those results and exception reports back into the business so that losses can be found, explained and reduced.",
  },
  {
    type: "p",
    text:
      "Our response is deliberately **evidence-led**. Rather than describe an intended tool in the abstract, we have already built a **working FBM prototype** that demonstrates the interactive core of the scope — the OU hierarchy, network mapping, technical-loss and kWh adjustments, the balancing calculation, and a loss heat map with adjustable conditional formatting. This de-risks the most heavily weighted parts of the evaluation because the committee can see the functionality operate, not merely read about it.",
  },
  {
    type: "p",
    text:
      "T2 Technologies is a South African technology company delivering dependable end-to-end digital transformation. The company is 100% black-owned and operates with Level 1 B-BBEE credentials, subject to inclusion of the current valid supporting certificate or affidavit in the final bid pack. Our delivery model emphasises local capability development, accountable governance under the NEC3 contract, and practical transfer of technical knowledge to Eskom personnel.",
  },
  {
    type: "p",
    text:
      "We confirm our commitment to the requirements of this enquiry and to working collaboratively with Eskom to finalise the implementation plan, milestones, service levels and transition arrangements in accordance with the contract.",
  },
  { type: "spacer" },
  { type: "p", text: "Yours faithfully," },
  { type: "spacer" },
  { type: "p", text: "[PLACEHOLDER: Authorised Signatory]  |  [Position]" },
  { type: "p", text: "T2 Technologies  |  [Email]  |  [Mobile]" },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 1. EXEC SUMMARY
  { type: "h1", text: "Executive Summary" },
  {
    type: "p",
    text:
      "Feeder balancing reconciles **energy delivered** (measured by statistical / MV90 meters) against **energy consumed** (customer meters billed in CC&B), after accounting for **technical losses** incurred in physically transporting electricity. When delivered energy is compared with consumption plus technical loss, any residual is **non-technical loss (NTL)** — the number Eskom Distribution needs to find, explain and reduce. Today this process is constrained by fragmented source data, manual screening, manual network configuration and manual sales allocation, which limits both accuracy and the speed of corrective action.",
  },
  {
    type: "p",
    text:
      "T2 Technologies proposes a secure, modular FBM platform that automates data consolidation into a single BI universe, provides a user-friendly application to correct network configuration and allocate unallocated CDU sales, calculates energy-balancing results with adjustable technical-loss percentages, and publishes results, heat maps, charts and the full suite of exception reports. The platform integrates to Eskom's work- and asset-management systems to raise work requests on faulty metering and to initiate audits on the worst-performing networks.",
  },
  { type: "h3", text: "Why T2 Technologies" },
  {
    type: "bullets",
    items: [
      "**Proven, not promised.** A working FBM prototype already demonstrates the interactive configuration, adjustment, calculation and heat-map surfaces that carry the largest functional weighting.",
      "**Eskom-aligned architecture.** Designed for the Eskom Azure tenant with data sovereignty in South Africa, SSO/MFA against Eskom identity, RBAC, AES-256 at rest and TLS 1.3 in transit, and integration to Eskom's ESB/iPaaS estate.",
      "**Security and compliance by design.** SOC 2 Type II posture where hosted as a cloud service, SAST/DAST and penetration testing before production, POPIA compliance, WAF and DDoS protection, and 24-hour breach notification.",
      "**End-to-end delivery.** From discovery and the BI data platform through configuration, calculation, reporting, publishing, integration, testing, go-live and long-term support under NEC3.",
      "**Local skills transfer.** Documentation, paired delivery and administrator training reduce Eskom's long-term dependency on the supplier and support transformation objectives.",
    ],
  },
  {
    type: "callout",
    text:
      "Evaluation-aware summary: This response is structured around Eskom's five weighted evaluation areas — Key Requirements (20%), Functional (40%), Non-Functional (20%), Cloud (5%) and Security (15%) — and is written to meet or exceed the functionality threshold. Section 3 maps each evaluation area to the section that answers it.",
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 2. UNDERSTANDING
  { type: "h1", text: "Understanding of Eskom's Requirement" },
  {
    type: "p",
    text:
      "Eskom requires a like-for-like replacement of the existing FBM tools with defined enhancements and integration, delivered as a governed digital capability. The tool must consolidate source-system data, enable correction of network configuration and sales allocation, compute reliable balancing results, and publish results and reports for loss management and targeted audits.",
  },
  { type: "h3", text: "2.1 From As-Is to To-Be" },
  {
    type: "table",
    widths: [50, 50],
    headers: ["As-Is (today)", "To-Be (required)"],
    rows: [
      ["Source data flows partially automated to BI; MV90.EU file still manual", "Fully automate all source feeds (incl. MV90.EU) into one production BI universe"],
      ["Manual screening of data for challenges", "Advanced source-data analytics and data mining with anomaly detection"],
      ["Manual network configuration; reliance on field resources", "Application-driven mapping of stats meters to feeder/substation configurations, with CNL-assisted linking"],
      ["Manual allocation of unallocated CDU/PP sales", "Tools to allocate unallocated sales by percentage to dense prepaid networks"],
      ["Manual kWh manipulation; single default technical-loss %", "Auditable kWh adjustments and per-feeder technical-loss % that becomes the new default"],
      ["OU-based results, manually combined for national view", "National consolidation with drill-down Cluster/OU/Zone/Sector/CNC/Meter"],
      ["Reports produced in the legacy tool", "The 28 report extracts, heat maps and charts developed in the BI environment and published"],
      ["No versioned storage of monthly mapping", "Every data iteration and mapping stored, time-stamped and reusable next month"],
    ],
  },
  { type: "h3", text: "2.2 The reconciliation at the heart of the scope" },
  {
    type: "p",
    text:
      "For every feeder, the platform summates customer sales on the mapped feeder and compares them against the consumption measured by the mapped stats meter, incorporating the feeder's technical-loss percentage. The result is the first-version loss, refined through validated kWh adjustments and sales allocation. Results roll up through the OU hierarchy to national level and down to feeder and stats-meter level, and are published to the corporate BI warehouse and shared folder with meter statuses set accordingly.",
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 3. RESPONSE MAP
  { type: "h1", text: "Response Map to the Evaluation Criteria" },
  {
    type: "p",
    text:
      "The table below maps each weighted evaluation area to the section of this response that addresses it, so the committee can score efficiently. Weightings reflect the Technical Evaluation Criteria (TEC); please verify against the issued TEC before finalisation.",
  },
  {
    type: "table",
    widths: [40, 15, 45],
    headers: ["Evaluation area", "Weight", "Answered in"],
    rows: [
      ["Key Requirements (referenceability & standing)", "20%", "Section 4 + Annexures (references, B-BBEE, registration)"],
      ["Functional Requirements (BRS 1–17, RQ, reports)", "40%", "Section 5 + Section 12 (working prototype) + Section 20 (matrix)"],
      ["Non-Functional Requirements", "20%", "Section 6 + Section 13/14 (testing, support, BCP)"],
      ["Cloud", "5%", "Section 7 + Section 9 (architecture)"],
      ["Security", "15%", "Section 8"],
    ],
  },
  {
    type: "callout",
    text:
      "Threshold awareness: Eskom applies a minimum functionality threshold (typically 70%) before price and B-BBEE are considered. Every functional and non-functional line item in Section 20 is answered with a Comply / Partial / Comply-by-delivery position and a cross-reference to the supporting evidence.",
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 4. KEY REQUIREMENTS
  { type: "h1", text: "Key Requirements Response (20%)" },
  {
    type: "p",
    text:
      "The Key Requirements area assesses the bidder's standing and ability to demonstrate comparable, verifiable delivery. T2 Technologies responds as follows; all claims are supported by the annexures listed and must be finalised with current evidence before submission.",
  },
  {
    type: "table",
    widths: [30, 45, 25],
    headers: ["Key requirement", "T2 Technologies response", "Evidence"],
    rows: [
      ["Referenceability (verifiable comparable projects)", "T2 presents comparable delivery in data integration, transaction/energy data reconciliation and enterprise platform delivery, supported by signed reference letters and contactable referees.", "Annexure I: [PLACEHOLDER: 3+ signed reference letters]"],
      ["Company registration & legal standing", "Registered South African company in good standing.", "Annexure B: [PLACEHOLDER: CIPC registration]"],
      ["Tax compliance", "Valid tax compliance status.", "Annexure C: [PLACEHOLDER: Tax PIN / status]"],
      ["B-BBEE", "100% black-owned; Level 1 contributor.", "Annexure D: [PLACEHOLDER: valid B-BBEE certificate/affidavit]"],
      ["Financial standing", "Financial capacity to deliver a ~6.5-year NEC3 engagement.", "Annexure F: [PLACEHOLDER: banking / financials if required]"],
    ],
  },
  {
    type: "callout",
    text:
      "Integrity note: Only references supported by signed appointment letters, purchase orders, completion certificates or contactable referees should be presented as formal contractual references. Company experience, individual team-member experience and internal product development must be clearly distinguished.",
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 5. FUNCTIONAL
  { type: "h1", text: "Functional Requirements Response (40%)" },
  {
    type: "p",
    text:
      "This section responds to every Business Requirement (BRS 1–17) and the enhancement requirements (RQ), and identifies which capabilities are already demonstrable in the working prototype (Section 12). Legend: **Comply** = available/demonstrable now; **Comply by delivery** = delivered within the implementation plan; **Partial (prototype)** = interactive behaviour demonstrable on sample data, completed on real data during delivery.",
  },
  { type: "h2", text: "5.1 Data platform (BRS 1–4)" },
  {
    type: "table",
    widths: [12, 43, 20, 25],
    headers: ["BRS", "Requirement", "Position", "How we deliver"],
    rows: [
      ["1", "Import & consolidate all source systems (MV90 metering, CC&B sales, unallocated CC&B, Small World/Maximo network, CNL) into one BI universe", "Comply by delivery", "Automated ETL/iPaaS feeds into a governed BI FBM universe; completes the outstanding MV90.EU→production automation"],
      ["2", "Advanced source-data analytics and data mining with anomaly detection", "Comply by delivery", "Rule-based anomaly detection with user follow-up and custom analyst queries across combined datasets"],
      ["3", "Upload data from BI into a user-friendly configuration/allocation application", "Comply by delivery", "Governed load path from BI into the FBM application"],
      ["4", "Manage current & historical meter/feeder statuses; filter, modify per rules, rename meters", "Comply by delivery", "Status model with history, filtering, rule-based modification and audit"],
    ],
  },
  { type: "h2", text: "5.2 Configuration, allocation & calculation (BRS 5–10)" },
  {
    type: "table",
    widths: [12, 43, 20, 25],
    headers: ["BRS", "Requirement", "Position", "How we deliver"],
    rows: [
      ["5", "Configure the network by mapping stats meters to feeder/substation configurations (CNL-assisted)", "Partial (prototype)", "Interactive tree + org-chart mapping with drag-and-drop and clustering is demonstrable now; wired to real data + CNL during delivery"],
      ["6", "Allocate unallocated CDU/PP sales by percentage to dense prepaid networks", "Partial (prototype)", "CDU allocation panel demonstrable now; real unallocated-sales feed during delivery"],
      ["7", "kWh adjustments (energy delivered and/or consumption, up/down)", "Comply (prototype)", "Per-feeder delivered & sales adjustments implemented; audited and persisted on real data"],
      ["8", "Adjust technical-loss % (10% default; per-feeder override becomes the new default)", "Partial (prototype)", "Global default + per-feeder override implemented; persistence of the new default during delivery"],
      ["9", "Calculate balancing results (sum sales per feeder vs measured consumption)", "Comply (prototype)", "Balancing engine runs across the hierarchy now; validated on real inputs during delivery"],
      ["10", "Display losses per OU hierarchy with drill-down to feeder & stats-meter", "Partial (prototype)", "Results dashboard + drill-down demonstrable; full national roll-up during delivery"],
    ],
  },
  { type: "h2", text: "5.3 Reporting, publishing & storage (BRS 11–16)" },
  {
    type: "table",
    widths: [12, 43, 20, 25],
    headers: ["BRS", "Requirement", "Position", "How we deliver"],
    rows: [
      ["11", "28 specified report extracts (pivot grids) — see 5.5", "Comply by delivery", "All 28 extracts developed in the BI environment after data acceptance and publishing"],
      ["12", "Heat maps with adjustable conditional colour-coding per feeder & OU", "Comply (prototype)", "Loss heat map with adjustable NTL%/kWh thresholds is demonstrable now"],
      ["13", "Charts: bar (current month) + line (historical), kWh delivered vs used and NTL kWh/% per OU→substation", "Partial (prototype)", "Balancing charts demonstrable; historical series added with stored iterations"],
      ["14", "Publish balanced results to online DB/BI warehouse + corporate shared folder; set meter statuses", "Comply by delivery", "Publishing pipeline to corporate BI + shared folder with meter-status setting"],
      ["15", "Display KPI results consolidated nationally with drill-down Cluster/OU/Zone/Sector/CNC/Meter", "Comply by delivery", "National consolidation with RBAC-scoped drill-down"],
      ["16", "Store latest data mapping + every iteration, time-stamped, reusable next month", "Comply by delivery", "Versioned storage of every data iteration and mapping in BI"],
    ],
  },
  { type: "h2", text: "5.4 Device management & enhancements (BRS 17, RQ)" },
  {
    type: "table",
    widths: [14, 61, 25],
    headers: ["Ref", "Requirement", "Position"],
    rows: [
      ["17", "Meter-reading automation; log WO to maintenance system for faulty meters", "Comply by delivery"],
      ["RQ2", "Stats-meter readings managed via online Oracle DB; Stats Meter Management Module to automate MV90", "Comply by delivery"],
      ["RQ4", "Upgrade local DB to SQL Server/MySQL/PostgreSQL (cater for Eskom PPU customers)", "Comply by delivery"],
      ["RQ5", "CNL data mapping & validation module with graphical non-conformance overview", "Comply by delivery"],
      ["RQ7", "FBM data-validation module (continuous, rule-based, role-routed exceptions)", "Comply by delivery"],
      ["RQ8", "FBM meter-status flagging from MV90 status (multi-level)", "Comply by delivery"],
      ["RQ10/12/13/16", "Additional exception & analysis reports (no-delivery feeders, supply points, customer/feeder linking, all CC&B customers)", "Comply by delivery"],
      ["RQ17/18", "Business levels based on feeders (not substations); substations shared across OU boundaries", "Comply by delivery"],
      ["RQ19/20", "Dx substation balancing; MTS balancing (Tx/Dx incoming vs Dx outflow reconciliation)", "Comply by delivery"],
      ["RQ21", "Three published reports: Bulk feeders, Reticulation feeders, Consolidated", "Comply by delivery"],
    ],
  },
  { type: "h2", text: "5.5 The 28 report extracts (BRS 11)" },
  {
    type: "p",
    text:
      "All 28 extracts will be delivered in the BI environment: stats-meter analysis per meter; feeder mapping scenarios; Feeder Consumption Analysis (Fdr/Trfm/Cust); Feeder Consumption Analysis (Fdr/Cust); new stats meters imported; stats meters previously imported now missing; new network locations imported; network locations previously imported now missing; network locations previously mapped no longer mapped; stats meters previously mapped no longer mapped; current vs previous stats-meter import comparison; transformers in engineering not in CC&B; premises with kWh but no Account ID; conventional transformers in CC&B not in engineering; PPU transformers in CC&B not in engineering; feeders not mapped; feeders with no consumption; worst-performing feeders; transformers_bulk on feeder; trfms_bulk/consumption on feeders; indicators (business) current vs previous; indicators (meters/feeders) current vs previous; LPU status current vs previous; CNL LPUs in engineering not linked to CC&B; CNL LPUs in CC&B not in engineering; CNL Trfs & bulks with no sales; CNL duplicate premises; feeders & meters not mapped.",
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 6. NON-FUNCTIONAL
  { type: "h1", text: "Non-Functional Requirements Response (20%)" },
  {
    type: "table",
    widths: [26, 74],
    headers: ["Non-functional area", "T2 Technologies commitment"],
    rows: [
      ["Performance", "Record save within ~1s and retrieval within ~3s under agreed load; throughput sized to national data volumes. Baselines validated by performance testing (Section 13)."],
      ["Availability & scalability", "High availability across Azure availability zones; horizontally scalable, containerised services sized for all OUs at national scale."],
      ["Backup & archiving", "Incremental daily encrypted backups kept offsite; retention aligned to Eskom policy; every monthly data iteration archived and versioned."],
      ["Business continuity & DR", "System criticality treated as Tier 0/1 (Safety & Revenue / Mission Critical); RTO within 8–24h and defined RPO; real-time replication to a DR site in a different SA region; DRP and restore procedures tested annually with results shared with Eskom Cyber Security."],
      ["Usability & accessibility", "Role-based, task-focused UI consistent with the demonstrated prototype; accessible and responsive."],
      ["Maintainability & portability", "Modular, open-standards architecture avoiding lock-in; documented interfaces and portable data."],
      ["Training & documentation", "Administrator, analyst and service-desk training; architecture, API, security, deployment and operations documentation."],
      ["Project management", "Delivery under a formal PM methodology with NEC3 governance, stage gates and RAID management (Section 10–11)."],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 7. CLOUD
  { type: "h1", text: "Cloud Response (5%)" },
  {
    type: "bullets",
    items: [
      "**Hosting model.** Preferred deployment within the **Eskom Azure tenant / VPC** (Platform-as-a-Service), keeping the database within the Eskom corporate LAN/BIN behind the perimeter firewall. Where any component is offered as an external cloud service, SOC 1/2 Type II attestation applies (Section 8).",
      "**Data sovereignty.** All data stored and processed within South Africa; DR region also within South Africa.",
      "**Composability.** Containerised microservices, infrastructure-as-code, and environment automation across DEV/DR/PROD.",
      "**Integration.** Supports Eskom's prevailing ESB / API / iPaaS estate (e.g. IBM App Connect, TIBCO, WSO2, webMethods, Azure Service Bus, Oracle Service Bus, MuleSoft, SSIS, Power Automate) for security, logging and monitoring across on-prem, hybrid and multi-cloud.",
      "**Portability.** Open standards preserve Eskom's ability to evolve the deployment model and avoid vendor lock-in.",
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 8. SECURITY
  { type: "h1", text: "Security Response (15%)" },
  {
    type: "table",
    widths: [28, 72],
    headers: ["Control domain", "Commitment (aligned to the Scope of Work security requirements)"],
    rows: [
      ["Attestation", "For any cloud service storing/processing financial or PII/IP data, valid SOC 1 and SOC 2 Type II reports submitted to Eskom; annual summaries and bridge letters as required."],
      ["Identity & access", "Integration with Eskom's on-prem IdP and MFA for SSO; RBAC with least privilege; privileged-access controls and joiner-mover-leaver procedures."],
      ["Encryption", "AES-256 at rest; TLS 1.3 (or later) in transit."],
      ["Logging & audit", "Audit trails, user-administration and activity logs enabled, encrypted and access-restricted to administrators."],
      ["Data protection", "PII masked in Sandbox/DEV; data minimisation and retention controls; controlled export."],
      ["Backups & DR", "Incremental daily encrypted offsite backups; real-time replication to a DR site in a different SA region; annually tested DRP and restore procedures."],
      ["Vulnerability management", "SAST + DAST, vulnerability assessment and penetration testing before PROD; all critical/high/medium findings remediated pre-PROD; summaries submitted to Eskom Cyber Security for acceptance; defined patch-management process."],
      ["Network & perimeter", "Database behind the perimeter firewall (Eskom LAN/BIN on-prem or partner private network in cloud); WAF for internet-facing apps; DDoS protection for all databases; database security management tooling."],
      ["Privacy & incident response", "POPIA (and GDPR where applicable) compliance; breach notification to Eskom within 24 hours; change notification within one month for significant business/platform/hosting changes."],
      ["e-Discovery", "Capability to identify, collect and produce electronically stored information on request."],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 9. ARCHITECTURE
  { type: "h1", text: "Solution Architecture and Design Principles" },
  {
    type: "p",
    text:
      "The target architecture will be confirmed during discovery against Eskom's standards. T2 applies the following layered design.",
  },
  {
    type: "bullets",
    items: [
      "**Experience layer** — analyst and administrator interfaces for configuration, allocation, calculation, dashboards and reporting (as demonstrated in the prototype).",
      "**Application/services layer** — network configuration, sales allocation, technical-loss management, balancing calculation, status management and validation services.",
      "**Integration layer** — authenticated APIs and ESB/iPaaS connectors to MV90, CC&B, Small World/Maximo, CNL, and work/asset management.",
      "**Data layer** — the BI FBM universe, versioned monthly iterations, the upgraded relational database (SQL Server/PostgreSQL) and the publishing store.",
      "**Platform layer** — Azure tenant, containers, secrets management, backup and DR.",
      "**Operations layer** — CI/CD, monitoring, logging, alerting, vulnerability management and audit reporting.",
    ],
  },
  {
    type: "table",
    widths: [26, 74],
    headers: ["Principle", "Application to FBM"],
    rows: [
      ["Modularity", "Separate configuration, calculation, reporting and publishing so each can evolve independently."],
      ["API-first & integration", "Controlled interfaces to source systems rather than direct coupling."],
      ["Security by design", "Identity, RBAC, encryption, secrets and auditability from inception."],
      ["Traceability & auditability", "Every configuration change, adjustment and allocation is versioned and attributable."],
      ["Resilience & data governance", "HA/DR, and defined ownership, quality controls, retention and lineage for critical data."],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 10. METHODOLOGY
  { type: "h1", text: "Delivery Methodology and Implementation Plan" },
  {
    type: "p",
    text:
      "T2 proposes a phased, agile delivery model governed by NEC3 stage gates — balancing iterative product delivery with the traceability expected of an Eskom programme. Timings are indicative and reconciled to the issued milestones during mobilisation.",
  },
  {
    type: "table",
    widths: [22, 16, 40, 22],
    headers: ["Phase", "Indicative", "Key activities", "Exit outcome"],
    rows: [
      ["0 — Mobilisation", "Wks 1–2", "Contract mobilisation, governance, access, security clearance, delivery plan, environments", "Approved mobilisation pack & plan"],
      ["1 — Discovery & Blueprint", "Wks 2–6", "Source-system assessment, requirements baseline, BI universe design, target architecture, security assessment", "Baseline, architecture & backlog"],
      ["2 — Data Platform", "Wks 5–12", "Database upgrade, BI feeds incl. MV90.EU automation, load path into the app", "Trusted data flowing to the app"],
      ["3 — Configuration & Calculation", "Wks 10–20", "BRS 5–10 on real data; CNL linking; status mgmt; versioned persistence", "Balancing results on real data"],
      ["4 — Reporting & Publishing", "Wks 18–28", "28 report extracts, heat maps, charts, publishing pipeline, national consolidation", "Reports & KPIs published"],
      ["5 — Advanced & Integration", "Wks 26–34", "Data mining, RQ17–21, device mgmt & WO integration, validation module", "Enhancements live"],
      ["6 — UAT, Readiness & Go-Live", "Wks 32–40", "End-to-end, performance, security testing, UAT, training, DR rehearsal, go-live & hypercare", "Production service + BAU transition"],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 11. GOVERNANCE & TEAM
  { type: "h1", text: "Programme Governance and Proposed Team" },
  {
    type: "table",
    widths: [34, 46, 20],
    headers: ["Forum", "Purpose", "Cadence"],
    rows: [
      ["Steering Committee", "Executive decisions, scope/budget, strategic risk, milestone approval", "Monthly / as prescribed"],
      ["Programme Review", "Progress, dependencies, RAID, upcoming milestones", "Weekly"],
      ["Architecture / Security Review", "Design decisions, integration standards, security controls", "Per major design"],
      ["Sprint Ceremonies", "Planning, stand-ups, demos, retrospectives", "Per sprint"],
      ["Service Review", "SLA, incidents, problems, releases, improvement", "Monthly post go-live"],
    ],
  },
  { type: "h3", text: "11.1 Proposed core team" },
  {
    type: "bullets",
    items: [
      "Executive Sponsor / Account Lead; Programme/Project Manager; Solution/Enterprise Architect.",
      "Business Analyst (energy/losses domain); Data Engineers (BI/ETL); Software Engineers; Integration Engineer.",
      "DevOps/Cloud Engineer; Cybersecurity Specialist; QA/Test Lead; UX Specialist; Service/Support Lead.",
      "CVs, qualifications, role allocation and availability attached as Annexure H and matched to the resource schedule.",
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 12. EXPERIENCE + PROTOTYPE
  { type: "h1", text: "Relevant Experience and the FBM Working Prototype" },
  {
    type: "p",
    text:
      "A key differentiator of this bid is that the interactive core of the FBM scope already exists as a working prototype, available for live demonstration to the committee. It validates our understanding of the domain and materially de-risks the functional evaluation.",
  },
  {
    type: "table",
    widths: [30, 70],
    headers: ["Prototype capability", "Scope requirement demonstrated"],
    rows: [
      ["OU hierarchy & network mapping", "BRS 5 — tree + org-chart mapping of meters→transformers→feeders→substations, drag-and-drop and clustering"],
      ["kWh & technical-loss adjustments", "BRS 7 & 8 — per-feeder delivered/sales adjustments and technical-loss % override"],
      ["CDU allocation", "BRS 6 — allocation of unallocated sales to feeders"],
      ["Balancing calculation", "BRS 9 — delivered vs consumed + technical loss across the hierarchy"],
      ["Loss dashboard & heat map", "BRS 12 — Gauteng loss heat map with adjustable conditional formatting; BRS 10/13 drill-down and charts"],
    ],
  },
  {
    type: "callout",
    text:
      "The prototype currently runs on representative Gauteng sample data. Under the implementation plan it is wired to Eskom's real source systems, the BI universe and the upgraded database, then extended nationally.",
  },
  { type: "h3", text: "12.1 Representative experience (to be evidenced)" },
  {
    type: "bullets",
    items: [
      "Electricity data integration & feeder analytics — mapping and reconciliation of network, feeder, transformer and meter datasets for energy-flow analysis.",
      "Enterprise integration & data engineering — secure APIs, ETL pipelines and reconciliation across multiple source systems.",
      "[PLACEHOLDER: named comparable projects with signed reference letters, scope, duration and contactable referees].",
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 13. TESTING
  { type: "h1", text: "Testing and Quality Assurance" },
  {
    type: "table",
    widths: [30, 70],
    headers: ["Test level", "Purpose"],
    rows: [
      ["Unit", "Verify components and balancing business logic at code level"],
      ["API / Integration", "Verify source-system interfaces, data contracts and error handling"],
      ["Data / Reconciliation", "Validate transformation, completeness, duplicates and control totals against source"],
      ["Functional", "Verify BRS/RQ behaviour and user stories"],
      ["Performance", "Validate the ~1s save / ~3s retrieve targets and national-scale throughput"],
      ["Security", "SAST/DAST, vulnerability assessment and penetration testing before PROD"],
      ["UAT", "Eskom users confirm fitness for operational use"],
      ["Operational readiness", "Validate monitoring, backup, recovery, runbooks and go-live procedures"],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 14. SUPPORT
  { type: "h1", text: "Service Management, Support and Maintenance" },
  {
    type: "p",
    text:
      "Following go-live, T2 transitions the FBM Tool into a supported service for the NEC3 term. Response and restoration targets are aligned to the tender SLA; the values below are indicative pending confirmation.",
  },
  {
    type: "table",
    widths: [22, 52, 26],
    headers: ["Severity", "Definition", "Indicative response"],
    rows: [
      ["P1 — Critical", "Production unavailable, balancing/publishing stopped, or severe security event", "[PLACEHOLDER: e.g. 30 min]"],
      ["P2 — High", "Major degradation or key function unavailable", "[PLACEHOLDER: e.g. 1 hr]"],
      ["P3 — Medium", "Limited degradation with workaround", "[PLACEHOLDER: e.g. 4 bus. hrs]"],
      ["P4 — Low / Request", "Minor defect, service request or query", "[PLACEHOLDER: e.g. 1 bus. day]"],
    ],
  },
  {
    type: "bullets",
    items: [
      "Support model & escalation matrix; monitoring & alerting; backup/restore procedures.",
      "Release & change management; operations runbook & known-error records.",
      "Monthly service report covering SLA, incidents, problems, changes and improvement actions.",
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 15. KT
  { type: "h1", text: "Knowledge Transfer and Change Enablement" },
  {
    type: "bullets",
    items: [
      "Joint design and implementation sessions with nominated Eskom technical staff.",
      "Architecture, API, security, deployment and operations documentation.",
      "Administrator, analyst and service-desk training; role-based operational guidance.",
      "Handover of source code, configuration and pipeline definitions per the contract's IP provisions.",
      "Defined knowledge-transfer acceptance criteria before transition to BAU.",
    ],
  },
  { type: "spacer" },

  // ---------------------------------------------------------------- 16. RISK
  { type: "h1", text: "Risk Management" },
  {
    type: "table",
    widths: [34, 16, 50],
    headers: ["Risk", "Rating", "Mitigation"],
    rows: [
      ["Source-data quality / availability (esp. MV90.EU automation)", "High", "Early data discovery, profiling, reconciliation controls and rehearsal loads"],
      ["Integration uncertainty across CC&B, Small World/Maximo, CNL", "High", "Interface inventory, ESB/iPaaS standards, proof-of-concept integrations"],
      ["Scope volume at national scale", "Med-High", "Phased delivery, prioritised backlog, formal NEC3 change control"],
      ["Security & compliance obligations", "High", "Secure SDLC, SAST/DAST + pen test, remediation gates before PROD"],
      ["Eskom dependency delays (access, decisions)", "Med-High", "Dependency register, named owners, escalation dates, readiness checklists"],
      ["Adoption & change", "Medium", "Stakeholder engagement, demonstrations, training and phased rollout"],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 17. SD&L
  { type: "h1", text: "Socio-Economic Development (SD&L)" },
  {
    type: "bullets",
    items: [
      "Use of South African technical and professional resources wherever feasible.",
      "Structured participation of junior/developing resources under senior supervision.",
      "On-the-job knowledge transfer to Eskom personnel as measurable deliverables.",
      "Support for local suppliers/specialist partners where compliant with procurement rules.",
      "SD&L commitments completed on the prescribed SDL&I template and aligned to the exact scoring framework.",
      "[PLACEHOLDER: specific SD&L percentages/commitments per Annexure].",
    ],
  },
  { type: "spacer" },

  // ---------------------------------------------------------------- 18. ASSUMPTIONS
  { type: "h1", text: "Assumptions, Dependencies and Exclusions" },
  { type: "h3", text: "18.1 Assumptions" },
  {
    type: "bullets",
    items: [
      "Eskom provides timely access to stakeholders, source systems, documentation and environments.",
      "Existing system owners cooperate with agreed integration and testing activities.",
      "Eskom nominates authorised owners for requirements, architecture, security, data and UAT decisions.",
      "Security clearance and site-access processes are communicated before mobilisation.",
    ],
  },
  { type: "h3", text: "18.2 Exclusions unless specifically priced" },
  {
    type: "bullets",
    items: [
      "Third-party licence and cloud subscription fees; hardware and data-centre facilities.",
      "Large-scale historical data cleansing beyond the agreed migration scope.",
      "24x7 managed operations unless included in the pricing schedule.",
      "Independent certification or external penetration-testing fees unless expressly priced.",
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 19. COMMERCIAL
  { type: "h1", text: "Commercial Proposal Framework" },
  {
    type: "p",
    text:
      "Pricing is completed strictly in the format prescribed by the FBM Pricing Schedule (Annexure L). The table below is an internal reconciliation view only; all values transfer to the official priced schedule.",
  },
  {
    type: "table",
    widths: [40, 30, 30],
    headers: ["Cost component", "Pricing basis", "Amount (excl. VAT)"],
    rows: [
      ["Mobilisation & Discovery", "Milestone", "R [PLACEHOLDER]"],
      ["Data platform (DB upgrade + BI feeds)", "Milestone", "R [PLACEHOLDER]"],
      ["Configuration, calculation & reporting build", "Sprint / deliverable", "R [PLACEHOLDER]"],
      ["Integration & advanced enhancements", "Milestone", "R [PLACEHOLDER]"],
      ["Testing & go-live", "Fixed", "R [PLACEHOLDER]"],
      ["Hosting (Azure/PaaS)", "Monthly / annual", "R [PLACEHOLDER]"],
      ["Support & maintenance (NEC3 term)", "Monthly / annual", "R [PLACEHOLDER]"],
      ["Total tendered price", "As prescribed", "R [PLACEHOLDER]"],
    ],
  },
  {
    type: "p",
    text:
      "Validity, escalation, disbursements, VAT, payment milestones, retention and any guarantees are completed exactly as required by the tender conditions and NEC3 contract data.",
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 20. COMPLIANCE MATRIX
  { type: "h1", text: "Functional & Non-Functional Compliance Matrix" },
  {
    type: "p",
    text:
      "This consolidated matrix is the committee's scoring aid. Positions: C = Comply now (prototype/available); D = Comply by delivery; P = Partial (prototype on sample data, completed on real data).",
  },
  {
    type: "table",
    widths: [12, 58, 12, 18],
    headers: ["Ref", "Requirement", "Pos.", "Reference"],
    rows: [
      ["BRS 1", "Import & consolidate source systems into BI universe", "D", "§5.1"],
      ["BRS 2", "Advanced analytics & data mining", "D", "§5.1"],
      ["BRS 3", "Upload BI data into the application", "D", "§5.1"],
      ["BRS 4", "Manage meter/feeder statuses (current & historical)", "D", "§5.1"],
      ["BRS 5", "Configure network (meter→feeder/substation mapping)", "P", "§5.2, §12"],
      ["BRS 6", "Allocate unallocated CDU/PP sales", "P", "§5.2, §12"],
      ["BRS 7", "kWh adjustments", "C", "§5.2, §12"],
      ["BRS 8", "Adjust technical-loss % (new default)", "P", "§5.2, §12"],
      ["BRS 9", "Calculate balancing results", "C", "§5.2, §12"],
      ["BRS 10", "Display losses per OU hierarchy w/ drill-down", "P", "§5.2, §12"],
      ["BRS 11", "28 report extracts", "D", "§5.3, §5.5"],
      ["BRS 12", "Heat maps (adjustable conditional formatting)", "C", "§5.3, §12"],
      ["BRS 13", "Charts (bar + historical line)", "P", "§5.3"],
      ["BRS 14", "Publish results + set meter statuses", "D", "§5.3"],
      ["BRS 15", "National KPI consolidation + drill-down", "D", "§5.3"],
      ["BRS 16", "Store versioned data & mapping", "D", "§5.3"],
      ["BRS 17", "Meter-reading automation + WO logging", "D", "§5.4"],
      ["RQ2–RQ21", "Enhancements (Oracle stats DB, DB upgrade, CNL, validation, feeder business levels, Dx/MTS balancing, split reports)", "D", "§5.4"],
      ["NFR", "Performance, availability, scalability, backup, DR/BCP, training, PM", "D", "§6"],
      ["Cloud", "Azure/PaaS, SA sovereignty, ESB/iPaaS integration", "D", "§7"],
      ["Security", "SOC 2, SSO/MFA, RBAC, AES-256/TLS 1.3, SAST/DAST, POPIA, WAF/DDoS", "D", "§8"],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 21. DECLARATIONS
  { type: "h1", text: "Declarations and Acceptance" },
  {
    type: "p",
    text:
      "T2 Technologies declares that the information in the final submitted bid will be accurate to the best of its knowledge and that any qualifications, assumptions or deviations are clearly disclosed. Tender-specific declarations are signed on the prescribed forms by an authorised representative.",
  },
  {
    type: "table",
    widths: [40, 60],
    headers: ["Declaration", "Completion"],
    rows: [
      ["Authorised signatory", "[PLACEHOLDER: name & position]"],
      ["Signature / Date / Place", "____________________  /  __________  /  __________"],
      ["Bid validity confirmed", "[PLACEHOLDER: yes / as required]"],
      ["Conflict of interest", "[Attach prescribed form]"],
      ["Tax compliance / PIN", "[Attach / insert]"],
      ["Central Supplier Database", "[Attach / insert]"],
      ["B-BBEE evidence", "[Attach current valid certificate/affidavit]"],
    ],
  },
  { type: "pagebreak" },

  // ---------------------------------------------------------------- 22. ANNEXURES
  { type: "h1", text: "Returnable Schedules and Annexure Checklist" },
  {
    type: "table",
    widths: [12, 68, 20],
    headers: ["Annex", "Document", "Included"],
    rows: [
      ["A", "Official tender forms & returnable schedules (Form A, Schedule Q, Annexure K)", "[ ]"],
      ["B", "Company registration documents (CIPC)", "[ ]"],
      ["C", "Tax compliance documentation", "[ ]"],
      ["D", "B-BBEE certificate / affidavit", "[ ]"],
      ["E", "CSD / supplier registration evidence", "[ ]"],
      ["F", "Banking / financial confirmation (if required)", "[ ]"],
      ["G", "Company profile", "[ ]"],
      ["H", "Key personnel CVs and qualifications", "[ ]"],
      ["I", "Project references / completion certificates", "[ ]"],
      ["J", "Technical architecture / solution diagrams", "[ ]"],
      ["K", "Implementation project plan", "[ ]"],
      ["L", "Risk register", "[ ]"],
      ["M", "Priced schedule (Annexure L pricing)", "[ ]"],
      ["N", "SLA / support model", "[ ]"],
      ["O", "Security & POPIA / data-protection response", "[ ]"],
      ["P", "Method statement (240-126469599) & SHE requirements", "[ ]"],
      ["Q", "SDL&I template", "[ ]"],
    ],
  },
  { type: "h3", text: "Final bid readiness check" },
  {
    type: "bullets",
    items: [
      "Every mandatory returnable is present and signed where required.",
      "Enquiry number and title are consistent across the entire bid pack.",
      "Pricing totals reconcile across all schedules.",
      "All named personnel match the CVs and resource schedule.",
      "All reference claims are supported by contactable referees.",
      "No [PLACEHOLDER] text remains in the final submission.",
      "Electronic filenames, page limits, portal upload rules and closing time verified.",
    ],
  },
];

module.exports = { blocks, BRAND, TENDER };
