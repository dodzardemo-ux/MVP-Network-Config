/**
 * Generates a standalone CV Schedule PDF for the FBM tender: the delivery-team
 * positions whose CVs are submitted with the bid, and the experience /
 * certification required for each.
 *
 * Sourcing note: two requirements are hard tender mandates verified from the
 * SoW earlier in the engagement — minimum 8 years' experience for key roles
 * and ISTQB certification for test resources. The remaining certifications are
 * T2 Technologies' recommended baseline to make each CV competitive; they are
 * clearly labelled as such and must be confirmed against the final tender text.
 */
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const BRAND = { blue: "004898", gold: "A39273", dark: "1F2937", grey: "6B7280", light: "F3F4F6" };
const TENDER = { enquiry: "3239CXMWP", title: "Feeder Balancing Module (FBM) Tool", owner: "Thabiso" };

// Positions requiring CVs. `key` = tender-mandated key role (min 8 yrs).
// source: "tender" (hard requirement) or "recommended" (T2 baseline).
const POSITIONS = [
  {
    role: "Programme / Project Manager",
    key: true,
    experience: "Minimum 8 years managing enterprise IT / software delivery programmes.",
    certification: "PMP or PRINCE2; Agile / Scrum (e.g. PSM).",
    certSource: "recommended",
  },
  {
    role: "Solution Architect",
    key: true,
    experience: "Minimum 8 years designing cloud-native, integration-heavy enterprise systems.",
    certification: "Microsoft Azure Solutions Architect Expert; TOGAF.",
    certSource: "recommended",
  },
  {
    role: "Business Analyst",
    key: true,
    experience: "Minimum 8 years in requirements engineering on enterprise systems.",
    certification: "CBAP / IIBA (or equivalent BA certification).",
    certSource: "recommended",
  },
  {
    role: "Senior Software Engineer",
    key: true,
    experience: "Minimum 8 years building and leading delivery of production software.",
    certification: "Relevant cloud / development certification (e.g. Azure Developer Associate).",
    certSource: "recommended",
  },
  {
    role: "Software Engineer",
    key: false,
    experience: "Demonstrable delivery experience appropriate to the role.",
    certification: "Relevant development certification (advantageous).",
    certSource: "recommended",
  },
  {
    role: "QA / Test Analyst",
    key: false,
    experience: "Test-analysis experience on enterprise systems.",
    certification: "ISTQB certification (mandatory).",
    certSource: "tender",
  },
  {
    role: "Data Migration Specialist",
    key: true,
    experience: "Minimum 8 years in data migration / ETL and reconciliation.",
    certification: "Data / ETL or database certification (e.g. Azure Data Engineer).",
    certSource: "recommended",
  },
  {
    role: "DevOps / Cloud Engineer",
    key: true,
    experience: "Minimum 8 years in CI/CD, IaC and cloud platform operations.",
    certification: "Azure DevOps Engineer Expert or Azure Administrator Associate.",
    certSource: "recommended",
  },
  {
    role: "Change & Training Specialist",
    key: false,
    experience: "Organisational change and training-delivery experience.",
    certification: "Change management (e.g. Prosci / ADKAR) (advantageous).",
    certSource: "recommended",
  },
];

const outDir = path.join(__dirname, "..", "..", "public", "downloads");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "T2-Technologies-FBM-CV-Schedule.pdf");

const M = 54;
const doc = new PDFDocument({ size: "A4", margins: { top: M, bottom: M, left: M, right: M }, bufferPages: true });
const outStream = fs.createWriteStream(outPath);
doc.pipe(outStream);
const CW = doc.page.width - M * 2;
const REG = "Helvetica", BOLD = "Helvetica-Bold", IT = "Helvetica-Oblique";
const c = (h) => "#" + h;

// Cover header
doc.font(BOLD).fontSize(30).fillColor(c(BRAND.blue)).text("T2 TECHNOLOGIES", M, 96);
doc.font(REG).fontSize(13).fillColor(c(BRAND.dark)).text(`${TENDER.title} — Tender Enquiry ${TENDER.enquiry}`, { width: CW });
doc.moveDown(0.4);
doc.font(BOLD).fontSize(16).fillColor(c(BRAND.gold)).text("CV Schedule — Key Personnel, Experience & Certification");
doc.moveDown(0.8);
doc.font(REG).fontSize(11).fillColor(c(BRAND.dark)).text(
  "The following positions require a CV to be submitted with the tender. For each, the minimum experience and the required or recommended certifications are listed. Items marked (mandatory) are explicit tender requirements; items marked (recommended) are T2 Technologies' baseline to strengthen each CV and must be confirmed against the final tender text.",
  { width: CW },
);
doc.moveDown(0.9);

// Legend chips
const chipY = doc.y;
doc.roundedRect(M, chipY, 150, 20, 4).fill(c(BRAND.blue));
doc.font(BOLD).fontSize(8.5).fillColor("#FFFFFF").text("KEY ROLE — min. 8 years", M + 8, chipY + 6, { width: 138 });
doc.roundedRect(M + 162, chipY, 120, 20, 4).fill(c(BRAND.gold));
doc.font(BOLD).fontSize(8.5).fillColor("#FFFFFF").text("mandatory = tender", M + 170, chipY + 6, { width: 108 });
doc.y = chipY + 20;
doc.moveDown(1);

const ensure = (need) => { if (doc.y + need > doc.page.height - M - 24) doc.addPage(); };

// Table
const widths = [0.26, 0.36, 0.38];
const head = ["Position", "Minimum Experience", "Certification"];
const xs = [];
let acc = M;
widths.forEach((w) => { xs.push(acc); acc += w * CW; });
const pad = 6;

const rowHeight = (cells) => {
  let h = 0;
  cells.forEach((cell, i) => {
    const w = widths[i] * CW - pad * 2;
    const hh = doc.font(REG).fontSize(9).heightOfString(String(cell), { width: w });
    h = Math.max(h, hh);
  });
  return h + pad * 2;
};

const drawHeader = () => {
  const hh = rowHeight(head);
  let y = doc.y;
  doc.rect(M, y, CW, hh).fill(c(BRAND.blue));
  head.forEach((t, i) => doc.font(BOLD).fontSize(9.5).fillColor("#FFFFFF").text(String(t), xs[i] + pad, y + pad, { width: widths[i] * CW - pad * 2 }));
  doc.y = y + hh;
  return hh;
};

ensure(60);
let headerH = drawHeader();

POSITIONS.forEach((p, ri) => {
  const roleCell = p.role + (p.key ? "\n(key role)" : "");
  const cells = [roleCell, p.experience, p.certification];
  const rh = rowHeight(cells);
  if (doc.y + rh > doc.page.height - M - 24) {
    doc.addPage();
    headerH = drawHeader();
  }
  const y = doc.y;
  if (ri % 2) doc.rect(M, y, CW, rh).fill(c(BRAND.light));

  // Position (bold) + key-role tag
  doc.font(BOLD).fontSize(9.5).fillColor(c(BRAND.blue)).text(p.role, xs[0] + pad, y + pad, { width: widths[0] * CW - pad * 2 });
  if (p.key) doc.font(IT).fontSize(8).fillColor(c(BRAND.gold)).text("key role · min. 8 yrs", xs[0] + pad, doc.y + 1, { width: widths[0] * CW - pad * 2 });

  doc.font(REG).fontSize(9).fillColor(c(BRAND.dark)).text(p.experience, xs[1] + pad, y + pad, { width: widths[1] * CW - pad * 2 });

  // Certification with source label
  doc.font(REG).fontSize(9).fillColor(c(BRAND.dark)).text(p.certification, xs[2] + pad, y + pad, { width: widths[2] * CW - pad * 2 });
  const tag = p.certSource === "tender" ? "mandatory" : "recommended";
  const tagColor = p.certSource === "tender" ? BRAND.blue : BRAND.grey;
  doc.font(IT).fontSize(8).fillColor(c(tagColor)).text(tag, xs[2] + pad, doc.y + 1, { width: widths[2] * CW - pad * 2 });

  doc.moveTo(M, y + rh).lineTo(M + CW, y + rh).strokeColor("#E5E7EB").lineWidth(0.5).stroke();
  doc.y = y + rh;
});

doc.moveDown(1);

// Mandatory summary box
ensure(120);
const boxY = doc.y;
doc.font(BOLD).fontSize(12).fillColor(c(BRAND.blue)).text("Tender-mandated requirements", M, boxY);
doc.moveDown(0.3);
[
  "Key personnel must each have a minimum of 8 years' relevant experience.",
  "Test resources must hold ISTQB certification.",
  "CVs, certificates and contactable references are returnable with the bid.",
].forEach((b) => {
  const sy = doc.y;
  doc.font(BOLD).fontSize(11).fillColor(c(BRAND.gold)).text("•", M, sy, { width: 12 });
  doc.font(REG).fontSize(11).fillColor(c(BRAND.dark)).text(b, M + 14, sy, { width: CW - 14 });
  doc.moveDown(0.3);
});

doc.moveDown(0.6);
doc.font(IT).fontSize(9).fillColor(c(BRAND.grey)).text(
  "Note: the 8-year and ISTQB requirements are the verified hard mandates from the SoW. Certifications marked \"recommended\" are T2 Technologies' proposed baseline and should be re-verified against the final tender documents before submission.",
  { width: CW },
);

// footer page numbers
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  const saved = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  const y = doc.page.height - 30;
  doc.font(REG).fontSize(7.5).fillColor(c(BRAND.grey));
  doc.text(`T2 Technologies · FBM Tender — CV Schedule · Enquiry ${TENDER.enquiry}`, M, y, { width: CW * 0.72, align: "left", lineBreak: false });
  doc.text(`Page ${i - range.start + 1} of ${range.count}`, M + CW * 0.72, y, { width: CW * 0.28, align: "right", lineBreak: false });
  doc.page.margins.bottom = saved;
}

doc.end();
outStream.on("finish", () => {
  console.log("PDF written:", outPath, (fs.statSync(outPath).size / 1024).toFixed(0) + "KB", range.count, "pages");
});
