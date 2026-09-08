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
const cost = require("./cost-model");

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
      {
        title: "5.4 Mobile Offline Field Audit",
        intro: [
          "The SoW requires that the worst-performing feeders can be taken into the field for physical audit and that findings are captured and returned to the source systems. The solution supports an offline-capable mobile workflow so that audits proceed in areas with poor or no connectivity.",
        ],
        bullets: [
          "Export a prioritised worklist of the worst-performing feeders/meters to a mobile device for field audit.",
          "Capture audit findings, meter conditions, photographs and GPS location while offline.",
          "On-device data validation to enforce completeness and correctness before submission.",
          "Automatic, conflict-aware synchronisation and write-back to the source systems once connectivity is restored.",
          "Full audit trail linking each field finding to the originating feeder, auditor and work order.",
        ],
      },
      {
        title: "5.5 Substation-Level Balancing and Reporting",
        intro: [
          "In addition to feeder-level analysis, the solution provides energy balancing and reporting at substation level, including substations shared across business units, so that losses can be located and attributed accurately across the hierarchy.",
        ],
        bullets: [
          "Energy balancing computed and visualised at substation level as well as feeder level.",
          "Correct handling of shared substations and feeder-based (rather than substation-based) business boundaries.",
          "Bulk, reticulation and consolidated views produced as separate, reconcilable reports.",
          "Substation results published to the BI/corporate reporting layer for downstream consumption.",
        ],
      },
      {
        title: "5.6 Losses Reduction Potential and National KPI Drill-Down",
        intro: [
          "The solution surfaces where intervention will yield the greatest return and lets users navigate results across the full national hierarchy.",
        ],
        bullets: [
          "Losses Reduction Potential tool that ranks networks by the recoverable-loss opportunity to direct field effort.",
          "National KPI drill-down across the eight levels — Cluster, Operating Unit, Zone, Sector, CNC, and down to feeder and meter.",
          "Comparison of current versus historical performance over selectable durations, with bar and line visualisations.",
          "Publication of KPI results to corporate BI and the Losses Reduction Potential tool.",
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
      {
        title: "6.2 Data Migration and Take-On Approach",
        intro: [
          "The SoW provides for data take-on as and when required. T2 Technologies applies a controlled, repeatable migration method so that data quality is proven before go-live and each run is auditable.",
        ],
        bullets: [
          "Source profiling and data-quality assessment to size and de-risk the migration.",
          "Documented mapping from source systems to the FBM canonical model, with transformation rules.",
          "Extract-transform-load pipelines with automated validation, reconciliation and exception reporting.",
          "Iterative migration rehearsals (mock runs) with sign-off before the production cut-over.",
          "Reconciliation reports and a rollback position for every run; personal data masked in non-production.",
        ],
      },
      {
        title: "6.3 Deliverable Breakdown Structure and Acceptance",
        intro: [
          "Each priced deliverable is defined, produced and formally accepted before the associated payment milestone is invoiced, matching the tender's deliverable-based acceptance model.",
        ],
        bullets: [
          "A Deliverable Breakdown Structure maps every deliverable to its work package, acceptance criteria and payment milestone (see Section 17.7).",
          "Each deliverable is reviewed against pre-agreed acceptance criteria before sign-off.",
          "A Delivery Acceptance Certificate is issued and signed by the Client for each accepted deliverable.",
          "Only accepted deliverables trigger invoicing, giving the Client clear cost-to-value control.",
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
      {
        title: "7.2 Enterprise Architecture Governance Gates",
        intro: [
          "The programme aligns to Eskom's Enterprise Architecture governance. Two formal approval gates are respected in addition to the delivery stage gates, and no downstream activity proceeds until the corresponding approval is obtained.",
        ],
        bullets: [
          "Project Architecture Document (PAD) approval is obtained before build commences.",
          "Pre-Transfer (production readiness) approval is obtained before go-live and handover to operations.",
          "Architecture and security decisions are logged, with exceptions escalated through the Architecture / Security Review forum.",
          "Governance evidence is retained to support internal and external audit.",
        ],
      },
      {
        title: "7.3 Team Competency and Certification",
        intro: [
          "T2 Technologies will staff the programme with suitably qualified and experienced resources, and will provide supporting CVs and certificates as returnable evidence.",
        ],
        bullets: [
          "Key roles staffed with a minimum of eight years' relevant experience, as required by the tender.",
          "Test resources hold ISTQB certification.",
          "Role-appropriate certifications for cloud, security and architecture disciplines.",
          "Named CVs, certificates and contactable references provided with the submission.",
        ],
      },
    ],
  },
  {
    n: "8",
    title: "Security and Compliance",
    ownership: "Owned by Thabiso",
    intro: [
      "Security is treated as a design property of the FBM solution rather than an afterthought. The architecture applies defence-in-depth: independent, mutually reinforcing controls at the perimeter, network, identity, application and data layers, so that the failure of any single control is contained by the layers around it. This section responds to the non-functional security requirements of the Statement of Work (SoW 5.1) and is designed to align with Eskom's information-security standards, which will be confirmed during discovery.",
      "The controls below describe the intended security posture for the production service. They are stated as design commitments subject to detailed design, Client security standards and the outcome of a joint threat and risk assessment; specific certification scopes are noted as assumptions where relevant.",
    ],
    figures: [{ kind: "diagram", id: "security-layers" }],
    subsections: [
      {
        title: "8.1 Security Principles",
        bullets: [
          "Secure by design and by default — security requirements are captured in the backlog and verified as part of the Definition of Done.",
          "Least privilege and need-to-know — access is granted against defined roles and reviewed periodically.",
          "Defence-in-depth — no single control is relied upon; controls are layered and independent.",
          "Zero-trust orientation — every request is authenticated, authorised and logged regardless of network location.",
          "Encryption everywhere — data is protected in transit and at rest across all tiers.",
          "Segregation of duties and environments — development, test and production are isolated with controlled promotion.",
        ],
      },
      {
        title: "8.2 Identity and Access Management",
        intro: [
          "Authentication federates to Eskom's identity provider so that FBM never holds primary credentials. Every request passes identity, edge and authorisation controls before reaching application services, and each decision — grant or deny — is written to the immutable audit trail already demonstrated in the prototype.",
        ],
        bullets: [
          "Single sign-on via Microsoft Entra ID (Azure AD) with multi-factor authentication enforced for all users.",
          "Role-based access control mapped to the FBM capability model demonstrated in the application (e.g. view, edit network, manage meters, resolve exceptions, initiate audits, export, view audit log).",
          "Privileged Identity Management with just-in-time elevation and approval for administrative roles.",
          "Joiner-Mover-Leaver process integration so access follows the user lifecycle.",
          "Periodic access recertification and automatic session expiry.",
        ],
        figures: [{ kind: "diagram", id: "identity-flow" }],
      },
      {
        title: "8.3 Data Protection and Privacy",
        bullets: [
          "Encryption at rest using AES-256 (Transparent Data Encryption for Azure SQL; server-side encryption for storage).",
          "Encryption in transit using TLS 1.3 for all external and service-to-service traffic.",
          "Data residency within the Republic of South Africa (Azure South Africa North), addressing data-sovereignty requirements.",
          "Personally identifiable information masked or de-identified in non-production environments.",
          "Defined data-classification, retention and secure-disposal policies.",
          "POPIA-aligned processing, including lawful basis, data-subject rights handling and records of processing.",
        ],
      },
      {
        title: "8.4 Application and Platform Security",
        bullets: [
          "Secure SDLC with threat modelling, secure-coding standards and mandatory peer review.",
          "Static and dynamic application security testing (SAST/DAST) and software-composition analysis in the CI/CD pipeline.",
          "Container image scanning and hardened, patched base images.",
          "Secrets and keys held in Azure Key Vault — never in source control or configuration files.",
          "Web Application Firewall, DDoS protection and rate limiting at the edge.",
          "Independent penetration testing before every major production release and periodically thereafter.",
        ],
      },
      {
        title: "8.5 Monitoring, Audit and Incident Response",
        bullets: [
          "Centralised logging and SIEM via Azure Monitor, Log Analytics and Microsoft Sentinel.",
          "Immutable, tamper-evident audit trail of security-relevant events (demonstrated in the prototype's Access & Audit module).",
          "Real-time alerting on anomalous authentication, authorisation and data-access events.",
          "Documented incident-response runbooks with defined severities and escalation paths.",
          "POPIA breach-notification handling within the regulated timeframe, with e-discovery support.",
          "Regular control testing, log review and continuous-improvement feedback into the backlog.",
        ],
      },
      {
        title: "8.6 Compliance and Standards Alignment",
        intro: [
          "The solution is designed to support the following frameworks. The matrix shows which control domains each framework informs; certification scope and supporting evidence are to be confirmed with T2 Technologies and the Client.",
        ],
        figures: [{ kind: "diagram", id: "compliance-matrix" }],
        table: {
          head: ["Framework", "Relevance to FBM"],
          widths: [0.34, 0.66],
          rows: [
            ["POPIA (South Africa)", "Primary data-protection law governing processing of personal information."],
            ["ISO/IEC 27001", "Information Security Management System baseline for controls and governance."],
            ["ISO/IEC 27017 & 27018", "Cloud-specific security controls and protection of PII in the cloud."],
            ["SOC 2 Type II", "Independent attestation of security, availability and confidentiality controls."],
            ["GDPR", "Applied as good practice for privacy-by-design and data-subject rights."],
            ["NIST Cybersecurity Framework", "Structures the overall posture: Identify, Protect, Detect, Respond, Recover."],
            ["Cybercrimes Act & King IV", "South African statutory and governance context for security and oversight."],
          ],
        },
        note: "Where T2 Technologies does not currently hold a specific certification, the commitment is to operate in alignment with the standard and to pursue certification within a timeframe agreed with the Client. All items are subject to confirmation during discovery.",
      },
    ],
  },
  {
    n: "9",
    title: "Architecture Deep-Dive",
    ownership: "Owned by Thabiso",
    intro: [
      "This section expands the solution architecture in Section 5 into an implementable, cloud-native target for deployment into Eskom's Microsoft Azure tenant, with all data resident in South Africa. The design favours composable, containerised microservices, an API-first integration model and elastic scaling, so the platform can grow from the demonstrated prototype to a national roll-out without re-architecture.",
      "The specific Azure services named below are a reference design. Final service selection, sizing, region pairing and landing-zone configuration will be confirmed with Eskom's cloud and security teams during discovery.",
    ],
    figures: [{ kind: "diagram", id: "azure-deployment" }],
    subsections: [
      {
        title: "9.1 Azure Landing Zone and Hosting",
        bullets: [
          "Deployment into an Eskom-governed Azure landing zone with policy, RBAC and cost guardrails.",
          "Primary region Azure South Africa North (Johannesburg) for data sovereignty.",
          "Resource segregation by environment and workload using subscriptions and resource groups.",
          "Infrastructure as Code (Bicep or Terraform) for repeatable, auditable provisioning.",
          "Private networking by default — virtual networks, network security groups, Azure Firewall and private endpoints.",
        ],
      },
      {
        title: "9.2 Application Architecture",
        bullets: [
          "Composable microservices packaged as containers on AKS or Azure App Service.",
          "Stateless services that scale horizontally behind Azure Front Door and API Management.",
          "API-first design with versioned, documented contracts between services and channels.",
          "Event-driven ingestion for MV90 and other feeds, decoupled via queues for resilience.",
          "Autoscaling driven by demand, with graceful degradation under load.",
        ],
      },
      {
        title: "9.3 Data Architecture",
        bullets: [
          "Azure SQL (Business Critical, zone-redundant) as the operational store with Transparent Data Encryption.",
          "Separation of operational data from reporting/analytics data to protect transactional performance.",
          "Azure Storage/Blob for the integration store, imported files and generated report extracts.",
          "Azure Cache for sessions, rate-limiting state and hot lookups.",
          "Defined retention, archiving and point-in-time restore aligned to Client policy.",
        ],
      },
      {
        title: "9.4 Integration Architecture",
        intro: [
          "FBM integrates with upstream systems of record through a managed integration layer using a canonical data model, so that source-system change is absorbed by adapters rather than propagated into the core.",
        ],
        bullets: [
          "API Management / Enterprise Service Bus (iPaaS) mediates all inbound and outbound integration.",
          "Source adapters for MV90 stats meters, CC&B billing, Works Management (e.g. MAXIMO) and CNL/GIS.",
          "Batch and near-real-time patterns with idempotent processing and dead-letter queues.",
          "Outbound publication to BI/corporate reporting and the Losses Reduction Potential tool.",
          "Correlation identifiers propagated across every hop for end-to-end traceability.",
        ],
        figures: [{ kind: "diagram", id: "integration-architecture" }],
      },
      {
        title: "9.5 Scalability, Availability and Disaster Recovery",
        bullets: [
          "Horizontal autoscaling of stateless services and zone-redundant data services for high availability.",
          "Target availability, RPO and RTO to be agreed and underpinned by the SLA.",
          "Geo-replication to the paired region (Azure South Africa West) for disaster recovery.",
          "Automated, encrypted backups with regular restore testing.",
          "A documented, regularly tested Disaster Recovery Plan (DRP).",
        ],
      },
      {
        title: "9.6 Environments and DevOps",
        intro: [
          "Identical, isolated environments are promoted through an automated pipeline with quality and security gates, giving predictable, auditable releases.",
        ],
        bullets: [
          "Separate DEV, TEST/UAT, staging and PROD environments provisioned from the same IaC.",
          "CI/CD via Azure DevOps or GitHub Actions with build, automated test, SAST/DAST and release gates.",
          "Manual approval gate before production promotion, with full release evidence.",
          "Blue-green or canary release strategy to minimise deployment risk.",
          "Observability (metrics, logs, traces) wired in from day one.",
        ],
        figures: [{ kind: "diagram", id: "environments-pipeline" }],
      },
      {
        title: "9.7 Well-Architected Framework Alignment",
        intro: [
          "As required by the SoW, the design is governed by the Microsoft Azure Well-Architected Framework, which provides the reference architecture and review discipline for the solution across its five pillars.",
        ],
        table: {
          head: ["Pillar", "How the FBM solution addresses it"],
          widths: [0.28, 0.72],
          rows: [
            ["Reliability", "Zone-redundant services, paired-region DR, automated backups and tested recovery."],
            ["Security", "Defence-in-depth, zero-trust access, encryption and continuous monitoring (Section 8)."],
            ["Cost Optimisation", "Elastic, consumption-based scaling; right-sized environments; IaC to avoid drift and waste."],
            ["Operational Excellence", "IaC, CI/CD with quality gates, full observability and service management."],
            ["Performance Efficiency", "Stateless horizontal scaling, caching and separation of operational and reporting workloads."],
          ],
        },
        note: "A formal Well-Architected Review will be conducted during design and at defined checkpoints, with findings tracked to closure through the Architecture / Security Review forum.",
      },
    ],
    note: "Architecture is presented as a reference design aligned to the SoW's cloud, security and scalability requirements. Target tenant configuration, service selection and non-functional targets (availability, RPO/RTO, performance) must be confirmed with Eskom during discovery.",
  },
  {
    n: "17",
    title: "Commercial Proposal Framework / Pricing Schedule",
    ownership: "Shared — Tumelo / Thabiso",
    intro: [
      "This section presents a fully costed commercial estimate aligned to the structure of the tender's Pricing Schedule (Annexure L): a software/subscription licence on the SoW's named-user sliding scale, itemised implementation work-packages, a professional-services rate card, five years of support & maintenance, a total cost of ownership and a milestone-based payment plan. All figures are in South African Rand and exclude VAT unless stated otherwise.",
      "The estimate assumes an 18-month implementation of the business requirements, followed by a full five operational years of managed support & maintenance after go-live (per SoW 6.1), delivered by a standard blended team of approximately 8-10 resources. Licence volumes follow the mandated sliding scale (20 users during implementation, 40 in operational Year 1, 50 in Years 2-5). Every currency figure is derived from the rate card and the effort plan below, so the totals reconcile across all tables.",
    ],
    subsections: [
      {
        title: "17.1 Pricing Basis and Assumptions",
        bullets: [
          "All rates are South African enterprise-IT top-of-band (upper-quartile) benchmark rates (2026), quoted per hour and per day, and must be confirmed against T2 Technologies' actual rate card before submission.",
          "Prices exclude VAT; VAT at 15% is shown separately in the total-cost-of-ownership summary.",
          `Software is licensed as T2's proprietary SaaS platform on a named-user basis at ${cost.rands(cost.LICENCE.perUserPerMonth)} per user per month, on the SoW-mandated sliding scale (20 users during implementation, 40 in operational Year 1, 50 in Years 2-5).`,
          "The implementation is a fixed-price engagement invoiced against the delivery milestones in 17.7; effort is shown for transparency and change-control.",
          "Support & maintenance begins at production go-live (a three-month warranty is included in Stabilisation) and runs for a full five operational years, as required by SoW 6.1.",
          "Third-party cloud/hosting, network connectivity, non-standard integrations, hardware and travel/disbursements outside Gauteng are excluded and quoted at cost on confirmation.",
        ],
      },
      {
        title: "17.2 Software / Subscription Licence",
        intro: [`T2 FBM SaaS named-user licence at ${cost.rands(cost.LICENCE.perUserPerMonth)} per user per month, priced on the SoW-mandated sliding scale.`],
        table: {
          head: ["Phase", "Users", "Months", "Annual (excl. VAT)", "Phase Cost (excl. VAT)"],
          widths: [0.34, 0.1, 0.12, 0.22, 0.22],
          rows: [
            ...cost.licenceSchedule.map((p) => [
              p.phase,
              String(p.users),
              String(p.months),
              cost.rands(p.perYear),
              cost.rands(p.cost),
            ]),
            ["Total licence (contract term)", "", "", "", cost.rands(cost.licenceTotal)],
          ],
        },
      },
      {
        title: "17.3 Professional Services Rate Card",
        intro: [`The following top-of-band (upper-quartile) South African benchmark rates underpin the implementation and support pricing. Day-rates are calculated at an ${cost.HOURS_PER_DAY}-hour billable day.`],
        table: {
          head: ["Role", "Hourly (excl. VAT)", "Day Rate (excl. VAT)"],
          widths: [0.5, 0.25, 0.25],
          rows: Object.values(cost.RATES).map((r) => [r.label, cost.rands(r.hourly), cost.rands(r.rate)]),
        },
      },
      {
        title: "17.4 Implementation Work-Package Pricing",
        intro: ["Fixed-price implementation broken down by the Annexure L work-packages, with indicative effort."],
        table: {
          head: ["Ref", "Work Package", "Effort (p-days)", "Price (excl. VAT)"],
          widths: [0.09, 0.55, 0.16, 0.2],
          rows: [
            ...cost.packages.map((p) => [p.code, p.name, String(p.days), cost.rands(p.cost)]),
            ["", "Total implementation (fixed price)", String(cost.implementationDays), cost.rands(cost.implementationTotal)],
          ],
        },
      },
      {
        title: "17.5 Support and Maintenance",
        table: {
          head: ["Item", "Basis", "Annual (excl. VAT)", "Term", "Total (excl. VAT)"],
          widths: [0.26, 0.22, 0.16, 0.18, 0.18],
          rows: [
            [
              "Managed support & maintenance",
              "Blended support team",
              cost.rands(cost.supportPerYear),
              `${cost.supportYears} yrs (post go-live)`,
              cost.rands(cost.supportTotal),
            ],
          ],
        },
        note: "Support covers L2/L3 application support, corrective and adaptive maintenance, platform updates and service management under an agreed SLA. Final SLA tiers and support windows to be confirmed with the Client.",
      },
      {
        title: "17.6 Total Cost of Ownership",
        intro: ["Full contract term: an 18-month implementation phase followed by five operational years of licence and support & maintenance."],
        table: {
          head: ["Phase", "Implementation", "Licence", "Support & Maint.", "Phase Total"],
          widths: [0.2, 0.2, 0.18, 0.2, 0.22],
          rows: [
            ...cost.annualProfile.map((r) => [
              r.year,
              r.implementation ? cost.rands(r.implementation) : "—",
              cost.rands(r.licence),
              r.support ? cost.rands(r.support) : "—",
              cost.rands(r.total),
            ]),
            ["Total (excl. VAT)", "", "", "", cost.rands(cost.totalContractValue)],
            ["VAT @ 15%", "", "", "", cost.rands(cost.totalContractValue * cost.VAT_RATE)],
            ["Total (incl. VAT)", "", "", "", cost.rands(cost.totalContractValue * (1 + cost.VAT_RATE))],
          ],
        },
      },
      {
        title: "17.7 Payment Milestone Schedule",
        intro: ["Implementation value is invoiced on completion and acceptance of each milestone across the 18-month term."],
        table: {
          head: ["Milestone", "% of Implementation", "Value (excl. VAT)"],
          widths: [0.56, 0.22, 0.22],
          rows: [
            ...cost.MILESTONES.map(([label, p]) => [label, cost.pct(p), cost.rands(cost.implementationTotal * p)]),
            ["Total", "100%", cost.rands(cost.implementationTotal)],
          ],
        },
      },
    ],
    note: "Commercial validity period, price escalation, retention, performance guarantees and any exchange-rate assumptions must still be completed exactly as required by the tender conditions before the figures are transferred to the official Annexure L pricing forms. All estimates are benchmark-based and subject to T2 Technologies' final review.",
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
      if (sub.table) children.push(docxTable(sub.table.head, sub.table.rows));
      if (sub.note) children.push(new Paragraph({ spacing: { before: 100, after: 140 }, children: [new TextRun({ text: sub.note, italics: true, size: 18, color: BRAND.grey })] }));
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
      if (sub.table) { ensure(80); pdfTable(sub.table.head, sub.table.rows, sub.table.widths || colWidthsFor(sub.table.head.length)); }
      if (sub.note) { doc.moveDown(0.3); doc.font(IT).fontSize(9).fillColor(c(BRAND.grey)).text(sub.note, { width: CW }); doc.moveDown(0.3); }
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
