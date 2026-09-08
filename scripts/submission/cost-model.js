/**
 * FBM commercial cost model (Tender Enquiry — Annexure L Pricing Schedule).
 *
 * Every currency figure in Section 17 is DERIVED from this module so the
 * tables always reconcile: work-package costs are computed from a single rate
 * card and a person-day effort plan; the 5-year total-cost-of-ownership and
 * the annual cost profile are summed from those same primitives.
 *
 * Basis / assumptions (all must be confirmed by T2 before submission):
 *  - Rates are South African enterprise-IT TOP-OF-BAND (upper-quartile)
 *    benchmark rates (2026), ZAR, excluding VAT. Stored per hour; day-rates
 *    are derived at HOURS_PER_DAY (8-hour billable day).
 *  - Programme: 18-month implementation of the business requirements, then
 *    managed support & maintenance to the 5-year (60-month) mark.
 *  - Delivery team: standard ~8-10 blended resources.
 *  - Licence: T2 proprietary SaaS, 20 named users, billed per user per annum.
 */

// --- Rate card (top-of-band SA benchmarks; hourly is the source of truth) ---
const HOURS_PER_DAY = 8;
const RATE_CARD = {
  pm: { label: "Programme / Project Manager", hourly: 1500 },
  sa: { label: "Solution Architect", hourly: 1850 },
  ba: { label: "Business Analyst", hourly: 1250 },
  sre: { label: "Senior Software Engineer", hourly: 1400 },
  eng: { label: "Software Engineer", hourly: 1000 },
  qa: { label: "QA / Test Analyst", hourly: 950 },
  dm: { label: "Data Migration Specialist", hourly: 1300 },
  ops: { label: "DevOps / Cloud Engineer", hourly: 1400 },
  cm: { label: "Change & Training Specialist", hourly: 1050 },
};
// Derive the day-rate used throughout the effort model from the hourly rate.
const RATES = Object.fromEntries(
  Object.entries(RATE_CARD).map(([k, v]) => [k, { ...v, rate: v.hourly * HOURS_PER_DAY }]),
);

// --- Work packages (Annexure L) with per-role person-day effort -------------
const PACKAGES = [
  { code: "WP1", name: "Business Process Analysis", effort: { ba: 120, sa: 30, pm: 20 } },
  { code: "WP2", name: "Solution Architecture & Design", effort: { sa: 130, sre: 40, ba: 30, ops: 25 } },
  { code: "WP3", name: "Build, Configure & Test", effort: { sre: 180, eng: 380, qa: 180, sa: 40, ba: 40 } },
  { code: "WP4", name: "Data Migration", effort: { dm: 160, eng: 60, qa: 40 } },
  { code: "WP5", name: "Deployment", effort: { ops: 90, sre: 40, qa: 25 } },
  { code: "WP6", name: "Stabilisation & Go-Live (incl. 3-month warranty)", effort: { sre: 50, eng: 60, qa: 45, ops: 30, pm: 20 } },
  { code: "WP7", name: "Training & Knowledge Transfer", effort: { cm: 90, ba: 30, eng: 20 } },
  { code: "WP8", name: "Change Management", effort: { cm: 110, ba: 40, pm: 20 } },
  { code: "WP9", name: "Project & Programme Management", effort: { pm: 300, sa: 20 } },
];

// --- Licence & support parameters -------------------------------------------
const LICENCE = { users: 20, perUserPerMonth: 3000 }; // ZAR/user/month
const SUPPORT_FTE = { sre: 0.3, eng: 0.5, qa: 0.2, pm: 0.1 }; // blended annual FTE
const SUPPORT_DAYS_PER_YEAR = 230;
const TERM_MONTHS = 60;
const IMPLEMENTATION_MONTHS = 18;

// --- Derivations ------------------------------------------------------------
function packageCost(pkg) {
  let cost = 0;
  let days = 0;
  for (const [role, d] of Object.entries(pkg.effort)) {
    cost += d * RATES[role].rate;
    days += d;
  }
  return { ...pkg, days, cost };
}

const packages = PACKAGES.map(packageCost);
const implementationTotal = packages.reduce((s, p) => s + p.cost, 0);
const implementationDays = packages.reduce((s, p) => s + p.days, 0);

const licencePerYear = LICENCE.users * LICENCE.perUserPerMonth * 12;
const licenceFiveYear = licencePerYear * 5;

const supportPerYear = Object.entries(SUPPORT_FTE).reduce(
  (s, [role, fte]) => s + fte * SUPPORT_DAYS_PER_YEAR * RATES[role].rate,
  0,
);
// Support runs from go-live (~end of implementation) to the 5-year mark.
const supportYears = Math.round((TERM_MONTHS - IMPLEMENTATION_MONTHS) / 12); // 4 (Years 2-5)
const supportTotal = supportPerYear * supportYears;

const fiveYearTco = implementationTotal + licenceFiveYear + supportTotal;

// Milestone-based payment plan for the implementation value.
const MILESTONES = [
  ["Contract signature & mobilisation", 0.10],
  ["Business Process Analysis sign-off", 0.10],
  ["Solution design approval", 0.15],
  ["Build, configure & test complete", 0.25],
  ["Data migration & UAT sign-off", 0.15],
  ["Production go-live", 0.15],
  ["Stabilisation & final acceptance", 0.10],
];

// Annual cost profile (ex VAT).
const annualProfile = [
  { year: "Year 1", implementation: implementationTotal, licence: licencePerYear, support: 0 },
  { year: "Year 2", implementation: 0, licence: licencePerYear, support: supportPerYear },
  { year: "Year 3", implementation: 0, licence: licencePerYear, support: supportPerYear },
  { year: "Year 4", implementation: 0, licence: licencePerYear, support: supportPerYear },
  { year: "Year 5", implementation: 0, licence: licencePerYear, support: supportPerYear },
].map((r) => ({ ...r, total: r.implementation + r.licence + r.support }));

const VAT_RATE = 0.15;

// --- Formatting helpers -----------------------------------------------------
function rands(n) {
  const rounded = Math.round(n);
  return "R " + rounded.toLocaleString("en-ZA").replace(/,/g, " ");
}
function pct(n) {
  return (n * 100).toFixed(0) + "%";
}

module.exports = {
  RATES, HOURS_PER_DAY, packages, implementationTotal, implementationDays,
  LICENCE, licencePerYear, licenceFiveYear,
  supportPerYear, supportYears, supportTotal,
  fiveYearTco, MILESTONES, annualProfile, VAT_RATE,
  IMPLEMENTATION_MONTHS, TERM_MONTHS,
  rands, pct,
};

// Allow `node cost-model.js` to print a reconciliation summary.
if (require.main === module) {
  console.log("Rate card (top-of-band, " + HOURS_PER_DAY + "h day):");
  Object.values(RATES).forEach((r) => console.log("  " + r.label.padEnd(34), (rands(r.hourly) + "/hr").padEnd(14), rands(r.rate) + "/day"));
  console.log("\nWork packages:");
  packages.forEach((p) => console.log("  " + p.code, p.name.padEnd(48), (p.days + "pd").padEnd(8), rands(p.cost)));
  console.log("  " + "".padEnd(4), "IMPLEMENTATION TOTAL".padEnd(48), (implementationDays + "pd").padEnd(8), rands(implementationTotal));
  console.log("\nLicence/yr:", rands(licencePerYear), "| 5-yr:", rands(licenceFiveYear));
  console.log("Support/yr:", rands(supportPerYear), "| years:", supportYears, "| total:", rands(supportTotal));
  console.log("5-YEAR TCO (ex VAT):", rands(fiveYearTco));
  console.log("5-YEAR TCO (incl VAT):", rands(fiveYearTco * (1 + VAT_RATE)));
  const profSum = annualProfile.reduce((s, r) => s + r.total, 0);
  console.log("Annual profile sum:", rands(profSum), profSum === fiveYearTco ? "(reconciles)" : "(MISMATCH)");
}
