/* Generates the FBM tender submission as a .pdf from the shared content model. */
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { blocks, BRAND, TENDER } = require("./content.js");

const M = 50; // margin
const doc = new PDFDocument({ size: "A4", margin: M, bufferPages: true,
  info: { Title: `FBM Tool Tender Submission — ${TENDER.enquiry}`, Author: "T2 Technologies" } });

const outDir = path.join(process.cwd(), "public", "downloads");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "T2-Technologies-FBM-Tender-Submission.pdf");
const outStream = fs.createWriteStream(outPath);
doc.pipe(outStream);

const CW = doc.page.width - M * 2;         // content width
const bottom = () => doc.page.height - M;  // usable bottom
const REG = "Helvetica", BOLD = "Helvetica-Bold";

const strip = (t) => String(t).replace(/\*\*/g, "");

function ensure(h) { if (doc.y + h > bottom()) doc.addPage(); }

// Rich inline text with **bold**, returns nothing (advances doc.y)
function rich(text, x, width, { size = 9.5, color = BRAND.ink, gap = 5, indent = 0 } = {}) {
  const parts = String(text).split(/\*\*/);
  doc.fontSize(size).fillColor(color);
  const startX = x + indent;
  let first = true;
  parts.forEach((seg, i) => {
    if (seg === "") return;
    doc.font(i % 2 === 1 ? BOLD : REG);
    const last = i === parts.length - 1 || parts.slice(i + 1).every((s) => s === "");
    doc.text(seg, first ? startX : undefined, first ? doc.y : undefined, {
      width: width - indent, continued: !last, align: "left",
    });
    first = false;
  });
  doc.font(REG);
  doc.y += gap;
}

function measure(text, width, size) {
  doc.fontSize(size).font(REG);
  return doc.heightOfString(strip(text), { width });
}

// ---- table renderer with wrapping + page breaks ----
function drawTable(b) {
  const widths = (b.widths || b.headers.map(() => 100 / (b.headers ? b.headers.length : b.rows[0].length)))
    .map((w) => (w / 100) * CW);
  const pad = 5, fs = 8.6, hfs = 8.6;

  const rowHeight = (cells, size, bold) => {
    doc.font(bold ? BOLD : REG).fontSize(size);
    let max = 0;
    cells.forEach((c, i) => {
      const h = doc.heightOfString(strip(c), { width: widths[i] - pad * 2 });
      if (h > max) max = h;
    });
    return max + pad * 2;
  };

  const drawRow = (cells, { header = false } = {}) => {
    const size = header ? hfs : fs;
    const h = rowHeight(cells, size, header);
    if (doc.y + h > bottom()) { doc.addPage(); if (b.headers && !header) drawRow(b.headers, { header: true }); }
    const y0 = doc.y;
    let x = M;
    cells.forEach((c, i) => {
      const w = widths[i];
      if (header) doc.rect(x, y0, w, h).fill(BRAND.blue);
      else doc.rect(x, y0, w, h).fill("#ffffff");
      doc.rect(x, y0, w, h).lineWidth(0.5).stroke("#D9DEE6");
      // rich text inside cell
      const parts = String(c).split(/\*\*/);
      doc.fontSize(size).fillColor(header ? "#ffffff" : BRAND.ink);
      let firstSeg = true;
      const tx = x + pad, ty = y0 + pad;
      parts.forEach((seg, k) => {
        if (seg === "") return;
        doc.font(k % 2 === 1 ? BOLD : REG);
        const last = k === parts.length - 1 || parts.slice(k + 1).every((s) => s === "");
        doc.text(seg, firstSeg ? tx : undefined, firstSeg ? ty : undefined, {
          width: w - pad * 2, continued: !last });
        firstSeg = false;
      });
      x += w;
    });
    doc.font(REG).fillColor(BRAND.ink);
    doc.y = y0 + h;
  };

  if (b.headers) drawRow(b.headers, { header: true });
  b.rows.forEach((r) => drawRow(r));
  doc.y += 8;
}

// ---- cover ----
function cover(b) {
  doc.y = M + 30;
  doc.font(BOLD).fontSize(20).fillColor(BRAND.blue).text("T2 TECHNOLOGIES", M, doc.y);
  doc.moveDown(0.2);
  doc.font(REG).fontSize(9).fillColor(BRAND.gold).text("ESKOM DISTRIBUTION  ·  CONFIDENTIAL TENDER RESPONSE");
  doc.moveDown(1.4);
  doc.font(BOLD).fontSize(28).fillColor(BRAND.ink).text(b.title, { width: CW });
  doc.moveDown(0.3);
  doc.font(REG).fontSize(13).fillColor(BRAND.grey).text(b.subtitle, { width: CW });
  doc.moveDown(1.6);
  // meta rows
  const labelW = CW * 0.38, valW = CW * 0.62, pad = 6;
  b.meta.forEach((m) => {
    doc.font(BOLD).fontSize(9.5);
    const lh = doc.heightOfString(m[0], { width: labelW - pad * 2 });
    doc.font(REG).fontSize(9.5);
    const vh = doc.heightOfString(strip(m[1]), { width: valW - pad * 2 });
    const h = Math.max(lh, vh) + pad * 2;
    const y0 = doc.y;
    doc.rect(M, y0, labelW, h).fill(BRAND.light);
    doc.fillColor(BRAND.blue).font(BOLD).fontSize(9.5).text(m[0], M + pad, y0 + pad, { width: labelW - pad * 2 });
    doc.fillColor(BRAND.ink).font(REG).fontSize(9.5).text(strip(m[1]), M + labelW + pad, y0 + pad, { width: valW - pad * 2 });
    doc.y = y0 + h + 3;
  });
}

let h1Counter = 0;

for (const b of blocks) {
  switch (b.type) {
    case "cover": cover(b); break;
    case "pagebreak": doc.addPage(); break;
    case "h1": {
      const label = b.noNum ? b.text : `${++h1Counter}. ${b.text}`;
      ensure(34);
      doc.moveDown(0.4);
      doc.font(BOLD).fontSize(15).fillColor(BRAND.blue).text(label, M, doc.y, { width: CW });
      const ly = doc.y + 2;
      doc.moveTo(M, ly).lineTo(M + CW, ly).lineWidth(1.2).stroke(BRAND.green);
      doc.y = ly + 8;
      break;
    }
    case "h2":
      ensure(26); doc.moveDown(0.3);
      doc.font(BOLD).fontSize(12).fillColor(BRAND.ink).text(b.text, M, doc.y, { width: CW });
      doc.y += 4; break;
    case "h3":
      ensure(22); doc.moveDown(0.2);
      doc.font(BOLD).fontSize(10.5).fillColor(BRAND.green).text(b.text, M, doc.y, { width: CW });
      doc.y += 3; break;
    case "p":
      ensure(Math.min(measure(b.text, CW, 9.5), 120));
      rich(b.text, M, CW, { size: 9.5, gap: 7 }); break;
    case "bullets":
      b.items.forEach((it) => {
        const h = measure(it, CW - 16, 9.5);
        ensure(h + 2);
        const y0 = doc.y;
        doc.font(BOLD).fontSize(9.5).fillColor(BRAND.green).text("•", M, y0, { width: 12 });
        doc.y = y0;
        rich(it, M + 14, CW - 14, { size: 9.5, gap: 4 });
      });
      doc.y += 4; break;
    case "callout": {
      const innerW = CW - 28;
      const h = measure(b.text, innerW, 9) + 18;
      ensure(h + 6);
      const y0 = doc.y;
      doc.rect(M, y0, CW, h).fill(BRAND.light);
      doc.rect(M, y0, 3.5, h).fill(BRAND.green);
      doc.fillColor(BRAND.ink);
      doc.y = y0 + 9;
      rich(b.text, M + 14, innerW, { size: 9, gap: 0 });
      doc.y = y0 + h + 8;
      break;
    }
    case "table": drawTable(b); break;
    case "spacer": doc.y += 8; break;
  }
}

// footer page numbers — neutralise the bottom margin so stamping below the
// content area does not trigger pdfkit's auto page-break (which inflates pages).
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  const y = doc.page.height - 32;
  doc.font(REG).fontSize(7.5).fillColor(BRAND.grey);
  doc.text(`T2 Technologies · FBM Tool Tender Submission · Enquiry ${TENDER.enquiry}`, M, y, { width: CW * 0.72, align: "left", lineBreak: false });
  if (i > range.start) doc.text(`Page ${i - range.start + 1} of ${range.count - 1}`, M + CW * 0.72, y, { width: CW * 0.28, align: "right", lineBreak: false });
  doc.page.margins.bottom = savedBottom;
}

doc.end();
outStream.on("finish", () => console.log("PDF written:", outPath, (fs.statSync(outPath).size / 1024).toFixed(0) + "KB", range.count, "pages"));
