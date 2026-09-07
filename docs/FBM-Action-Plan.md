# FBM (Feeder Balancing Module) — Action Plan & Gap Analysis

**Source of truth:** FBM Feeder Balancing Module Scope of Work (Final, updated 17.08.26)
**Baseline assessed:** current MVP web application (this repository)
**Last updated by this plan:** see Git history

---

## 1. Purpose

Feeder balancing reconciles **energy delivered** (stats/MV90 meters) against **energy consumed** (customer meters in CC&B), incorporating **technical losses**, so that `delivered ≈ consumed + technical losses`. Any residual is **non-technical loss (NTL)** — the number the business is trying to find, explain, and reduce.

This document maps every requirement in the Scope of Work to the current application state and defines what still needs to be executed.

---

## 2. Current MVP — what exists today

The application is a single-page, client-side React/Next.js tool with an in-memory network model (no backend, no persistence). It provides five tabs:

| Tab | Capability today |
|-----|------------------|
| **Configure Network** | Tree view of the OU hierarchy (OU → Zone → Sector → CNC → Substation → Feeder → Transformer → Meter); drag-and-drop / modal move of meters→transformers and transformers→feeders within the same substation; per-feeder kWh adjustments, per-feeder technical-loss % override, and CDU mapping. |
| **Network Mapping** | Org-chart canvas per substation; drag-and-drop reorganisation with the same move rules; **clustering** of meters, feeders, and (new) transformers within a substation. |
| **Calculate Losses** | Runs the balancing calculation across the hierarchy with global/per-feeder technical-loss % and optional CDU inclusion. |
| **CDU Allocation** | Panel for allocating unallocated CDU (prepaid) sales to feeders. |
| **View Results** | Loss dashboard summarising results. |

**Architecture reality:** all data is hard-coded/sample data held in React context. There is **no data import, no database, no authentication, no reporting engine, and no persistence/versioning**. This is a functional prototype of the *interactive configuration & calculation* surface only.

---

## 3. Functional requirements (BRS) — gap matrix

Legend: ✅ Done · 🟡 Partial · ⛔ Not started

| BRS | Requirement | Status | Notes / gap to close |
|-----|-------------|:------:|----------------------|
| **BRS 1** | Import & consolidate all source-system data into one BI universe (Metering/MV90, CC&B sales, unallocated CC&B, Small World/Maximo network, CNL) | ⛔ | No ingestion. Needs BI universe + automated feeds; MV90.EU → BI still manual per scope. |
| **BRS 2** | Advanced source-data analytics / data mining with anomaly detection | ⛔ | No analytics layer. |
| **BRS 3** | Upload data from BI into the app for configuration & allocation | ⛔ | App uses sample data; needs a real load path from BI. |
| **BRS 4** | Manage meter/feeder statuses (current + historical), filter, modify per business rules, rename meters | ⛔ | No status model or history. |
| **BRS 5** | Configure the network by mapping stats meters to feeder/substation configurations | 🟡 | **Core of the MVP.** Interactive mapping works (tree + org-chart + clustering). Gaps: real data, CNL-driven linking, persistence, audit of changes. |
| **BRS 6** | Map CDU unallocated sales to feeders by percentage | 🟡 | CDU Allocation + per-feeder CDU mapping exist against sample data; needs real unallocated-sales feed and %-by-density logic. |
| **BRS 7** | kWh adjustments (energy delivered and/or consumption, up/down) | ✅ | Per-feeder delivered & sales adjustments implemented; needs to run on real data + be persisted/audited. |
| **BRS 8** | Adjust technical-loss % (10% default, per-feeder override becomes new default) | 🟡 | Global default + per-feeder override implemented. Gap: "override becomes the persisted new default going forward." |
| **BRS 9** | Calculate balancing results (sum sales per feeder vs measured consumption) | 🟡 | Calculation engine works on sample data; needs real inputs and validated formulas. |
| **BRS 10** | Display losses per OU hierarchy with drill-down to feeder & stats-meter | 🟡 | Results dashboard exists; needs full hierarchical drill-down and combined Dx/national roll-up. |
| **BRS 11** | 28 specified report extracts (pivot grids — see §5) | ⛔ | None of the 28 exception/analysis reports exist. |
| **BRS 12** | Heat maps with conditional colour-coded loss representation (adjustable thresholds) | ⛔ | Not started. |
| **BRS 13** | Charts (bar = current month, line = historical) for kWh delivered vs used and NTL kWh/% per OU→substation | ⛔ | Not started (needs historical data). |
| **BRS 14** | Publish balanced results to online DB/BI warehouse + corporate shared folder, set meter statuses | ⛔ | No publish pipeline. |
| **BRS 15** | Display KPI results consolidated nationally with drill-down Cluster/OU/Zone/Sector/CNC/Meter | ⛔ | Single-OU only; no national consolidation or RBAC-scoped views. |
| **BRS 16** | Store latest data mapping + every data iteration versioned by date/time for reuse next month | ⛔ | No persistence or versioning at all. |
| **BRS 17** | Meter-reading automation; log WO to maintenance system for faulty meters | ⛔ | No device management or work-order integration. |

**Summary:** the MVP substantially covers the *interactive configure/adjust/calculate* slice (BRS 5–10) on sample data. The **data platform (1–4), reporting (11–13), publish/consolidate (14–15), persistence/versioning (16), and device/WO integration (17)** are not yet started.

---

## 4. Enhancement requirements (RQ) — status

| RQ | Enhancement | Status | Notes |
|----|-------------|:------:|-------|
| RQ2 | Stats-meter readings managed via online DB (Oracle); Stats Meter Management Module to automate MV90 import | ⛔ | Depends on data platform. |
| RQ4 | Upgrade local DB to SQL Server/MySQL/PostgreSQL (cater for Eskom PPU customers) | ⛔ | No DB yet. |
| RQ5 | CNL data mapping & validation module with graphical non-conformance overview | ⛔ | |
| RQ7 | FBM data-validation module (continuous, rule-based, role-routed exceptions) | ⛔ | |
| RQ8 | FBM meter-status flagging from MV90 status (multi-level) | ⛔ | Ties to BRS 4. |
| RQ10 | Exception: feeders with no energy delivered | ⛔ | A report (extends BRS 11). |
| RQ12 | Report: list all supply points (Trfs/Bulks) in Feeder Consumption Analysis | ⛔ | |
| RQ13 | Report: detailed customer/feeder linking | ⛔ | |
| RQ16 | Report: all CC&B customers for an OU | ⛔ | |
| RQ17 | Business levels based on **feeders**, not substations | ⛔ | Model change; requires RQ18. |
| RQ18 | Substations shared across OU boundaries (all substations available for mapping per OU) | 🟡 | Mapping today is substation-scoped in a single OU; cross-OU sharing not modelled. |
| RQ19 | Dx substation balancing — visualise & publish balancing at substation level | 🟡 | Calc supports substation nodes; no substation-level reporting/publish. |
| RQ20 | MTS balancing — reconcile incoming Tx/Dx feeders vs outflowing Dx substations (new relationship table) | ⛔ | |
| RQ21 | Three published reports: Bulk feeders, Reticulation feeders, Consolidated | ⛔ | |

---

## 5. BRS 11 — the 28 required report extracts

Stats-meter analysis per meter · Feeder mapping scenarios · Feeder Consumption Analysis (Fdr/Trfm/Cust) · Feeder Consumption Analysis (Fdr/Cust) · New stats meters imported · Stats meters previously imported now missing · New network locations imported · Network locations previously imported now missing · Network locations previously mapped no longer mapped · Stats meters previously mapped no longer mapped · Current vs previous stats-meter import comparison · Transformers in engineering not in CC&B · Premises with kWh but no Account ID · Conventional transformers in CC&B not in engineering · PPU transformers in CC&B not in engineering · Feeders not mapped · Feeders with no consumption · Worst-performing feeders · Transformers_bulk on feeder · Trfms_bulk/consumption on feeders · Indicators (business) current vs previous · Indicators (meters/feeders) current vs previous · LPU status current vs previous · CNL — LPUs in engineering not linked to CC&B · CNL — LPUs in CC&B not in engineering · CNL — Trfs & bulks with no sales · CNL — duplicate premises · Feeders & meters not mapped.

All 28 are ⛔ not started and depend on the data platform (BRS 1–3).

---

## 6. Non-functional requirements (NFR)

These are **tender-critical** even though they are invisible in the current prototype.

- **Security:** SOC 1/2 Type II attestation (if SaaS); SSO against Eskom AD/Azure AD via OAuth2/SAML2 with MFA; RBAC (least privilege); AES-256 at rest, TLS 1.3 in transit; encrypted audit/activity logs; PII masking in non-prod; SAST/DAST + VA/PT before prod; POPIA/GDPR compliance; 24-hour breach notification; WAF + DDoS; DB behind perimeter firewall; SIEM integration (Syslog/SNMP/API).
- **Architecture:** Eskom Azure tenant preferred; data sovereignty within South Africa; composable/modular microservices + containerisation; open standards; portability across hyperscalers.
- **Business continuity:** system criticality Tier 0/1 (Safety & Revenue / Mission Critical); RTO < 8–24 h, defined RPO; HA across landing zones + DR to another SA geo-region; daily encrypted offsite backups; annually tested DRP & restore procedures.
- **Integration:** must support Eskom's ESB/iPaaS estate (IBM App Connect, TIBCO, WSO2, webMethods, Azure Service Bus, Oracle Service Bus, MuleSoft, SSIS, Power Automate, etc.); e-Discovery capability.

Status: ⛔ none addressed by the current prototype — these are design/hosting/operational commitments to be described in the tender response, not app features.

---

## 7. Proposed phased action plan

**Phase 0 — MVP hardening (current app, no backend).** Finish the interactive slice as a credible demo: real-looking sample data across a full OU, complete drill-down in View Results (BRS 10), and the worst-performing-feeder + heat-map visuals (BRS 12/13) on sample data. *Purpose: a compelling demo for the tender.*

**Phase 1 — Data platform foundation.** Stand up the database (RQ4) and the BI FBM universe + automated source feeds (BRS 1), including the outstanding MV90.EU → production-BI automation. Add the app's real load path from BI (BRS 3).

**Phase 2 — Configuration & calculation on real data.** Wire BRS 5–9 to real data; add CNL-driven meter↔sales linking (RQ5), status management + history (BRS 4/RQ8), and persistence/versioning of every mapping iteration (BRS 16, incl. BRS 8 "override becomes new default").

**Phase 3 — Reporting & publishing.** Build the 28 report extracts (BRS 11) + RQ10/12/13/16/21, heat maps (BRS 12), historical charts (BRS 13), and the publish pipeline + national/provincial consolidation with RBAC drill-down (BRS 14/15).

**Phase 4 — Advanced & integration.** Data mining/analytics (BRS 2), feeder-based business levels + cross-OU substation sharing (RQ17/18), Dx substation & MTS balancing (RQ19/20), device management + work-order integration (BRS 17), and the data-validation module (RQ7).

**Cross-cutting (all phases).** Implement the NFR security, architecture, and BCP commitments from §6 as the platform is built, not bolted on at the end.

---

## 8. Open questions to resolve before the tender response

1. **Hosting model:** Eskom Azure tenant (preferred) vs SaaS — this drives the SOC-report and data-sovereignty obligations.
2. **Scope of this bid:** is the tender for the full FBM replacement (BRS 1–17 + RQ), or a defined subset/phase?
3. **BI universe ownership:** does Eskom build/own the BI feeds, or is that in the service provider's scope?
4. **Existing system parity:** which reports/heat maps/charts must be like-for-like vs enhanced?
5. **Data volumes & retention:** national scale (all OUs) drives the architecture, RTO/RPO, and DR design.
