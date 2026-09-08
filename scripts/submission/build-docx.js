/* Generates the FBM tender submission as a .docx from the shared content model. */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, HeadingLevel, ShadingType, PageBreak,
} = require("docx");
const { blocks, BRAND, TENDER } = require("./content.js");

const hex = (c) => c.replace("#", "");
const BLUE = hex(BRAND.blue), GREEN = hex(BRAND.green), INK = hex(BRAND.ink),
  GREY = hex(BRAND.grey), LIGHT = hex(BRAND.light), GOLD = hex(BRAND.gold);

// Parse **bold** into TextRuns
function runs(text, opts = {}) {
  const parts = String(text).split(/\*\*/);
  return parts.map((seg, i) =>
    new TextRun({ text: seg, bold: i % 2 === 1 || opts.bold, color: opts.color, size: opts.size, font: "Calibri" })
  );
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "D9DEE6" };

function cell(text, { header = false, width, align } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: header ? { type: ShadingType.CLEAR, fill: BLUE, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
    children: [new Paragraph({
      alignment: align || AlignmentType.LEFT,
      children: runs(text, header ? { bold: true, color: "FFFFFF", size: 19 } : { size: 19 }),
    })],
  });
}

function table(b) {
  const rows = [];
  if (b.headers) {
    rows.push(new TableRow({
      tableHeader: true,
      children: b.headers.map((h, i) => cell(h, { header: true, width: b.widths && b.widths[i] })),
    }));
  }
  b.rows.forEach((r) => {
    rows.push(new TableRow({
      children: r.map((c, i) => cell(c, { width: b.widths && b.widths[i] })),
    }));
  });
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

let h1Counter = 0;
const children = [];

for (const b of blocks) {
  switch (b.type) {
    case "cover": {
      children.push(new Paragraph({ spacing: { before: 1400 }, children: [
        new TextRun({ text: "T2 TECHNOLOGIES", bold: true, size: 40, color: BLUE, font: "Calibri" }),
      ]}));
      children.push(new Paragraph({ spacing: { before: 80 }, children: [
        new TextRun({ text: "ESKOM DISTRIBUTION  ·  CONFIDENTIAL TENDER RESPONSE", size: 18, color: GOLD, font: "Calibri" }),
      ]}));
      children.push(new Paragraph({ spacing: { before: 500 }, children: [
        new TextRun({ text: b.title, bold: true, size: 56, color: INK, font: "Calibri" }),
      ]}));
      children.push(new Paragraph({ spacing: { before: 120, after: 500 }, children: [
        new TextRun({ text: b.subtitle, size: 26, color: GREY, font: "Calibri" }),
      ]}));
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: b.meta.map((m, idx) => new TableRow({ children: [
          new TableCell({ width: { size: 38, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" },
            margins: { top: 70, bottom: 70, left: 120, right: 90 },
            borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "FFFFFF" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "FFFFFF" }, left: noBorder, right: noBorder },
            children: [new Paragraph({ children: [new TextRun({ text: m[0], bold: true, size: 19, color: BLUE, font: "Calibri" })] })] }),
          new TableCell({ width: { size: 62, type: WidthType.PERCENTAGE },
            margins: { top: 70, bottom: 70, left: 120, right: 90 },
            borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "FFFFFF" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "FFFFFF" }, left: noBorder, right: noBorder },
            children: [new Paragraph({ children: runs(m[1], { size: 19 }) })] }),
        ]})),
      }));
      break;
    }
    case "h1": {
      const label = b.noNum ? b.text : `${++h1Counter}. ${b.text}`;
      children.push(new Paragraph({
        spacing: { before: 260, after: 140 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: GREEN } },
        children: [new TextRun({ text: label, bold: true, size: 30, color: BLUE, font: "Calibri" })],
      }));
      break;
    }
    case "h2":
      children.push(new Paragraph({ spacing: { before: 200, after: 90 },
        children: [new TextRun({ text: b.text, bold: true, size: 24, color: INK, font: "Calibri" })] }));
      break;
    case "h3":
      children.push(new Paragraph({ spacing: { before: 160, after: 70 },
        children: [new TextRun({ text: b.text, bold: true, size: 21, color: GREEN, font: "Calibri" })] }));
      break;
    case "p":
      children.push(new Paragraph({ spacing: { after: 120, line: 288 }, children: runs(b.text, { size: 20 }) }));
      break;
    case "bullets":
      b.items.forEach((it) => children.push(new Paragraph({
        bullet: { level: 0 }, spacing: { after: 60, line: 276 }, children: runs(it, { size: 20 }),
      })));
      break;
    case "callout":
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          borders: { top: noBorder, bottom: noBorder, right: noBorder,
            left: { style: BorderStyle.SINGLE, size: 24, color: GREEN } },
          children: [new Paragraph({ children: runs(b.text, { size: 19, color: INK }) })],
        }),
      ]})]}));
      children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      break;
    case "table":
      children.push(table(b));
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      break;
    case "spacer":
      children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
      break;
    case "pagebreak":
      children.push(new Paragraph({ children: [new PageBreak()] }));
      break;
  }
}

const doc = new Document({
  creator: "T2 Technologies",
  title: `FBM Tool Tender Submission — ${TENDER.enquiry}`,
  styles: { default: { document: { run: { font: "Calibri", size: 20, color: INK } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
    footers: {},
    children,
  }],
});

const outDir = path.join(process.cwd(), "public", "downloads");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "T2-Technologies-FBM-Tender-Submission.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("DOCX written:", outPath, (buf.length / 1024).toFixed(0) + "KB");
});
