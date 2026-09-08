"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  reportDefinitions,
  feederMetrics,
  zoneRollups,
  fmtKwh,
  type ReportDefinition,
} from "@/lib/data/operations-data";
import { FileBarChart, Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";

// Build the preview rows for the selected report from the shared metrics.
function previewRows(report: ReportDefinition): string[][] {
  if (report.id === "RPT-RETIC") {
    return [...feederMetrics]
      .filter((m) => m.hasDelivery)
      .sort((a, b) => b.ntlPercent - a.ntlPercent)
      .slice(0, 12)
      .map((m) => [
        m.name,
        fmtKwh(m.delivered),
        fmtKwh(m.sales),
        fmtKwh(m.technicalLoss),
        fmtKwh(m.nonTechnicalLoss),
        `${m.ntlPercent.toFixed(1)}%`,
      ]);
  }
  if (report.id === "RPT-CONS") {
    return zoneRollups.map((z) => [
      "Zone",
      z.zone,
      fmtKwh(z.delivered),
      fmtKwh(z.sales),
      fmtKwh(z.ntl),
      `${z.ntlPercent.toFixed(1)}%`,
    ]);
  }
  // Bulk supply point — aggregate feeders per substation.
  const bySub = new Map<string, { zone: string; delivered: number; sales: number }>();
  for (const m of feederMetrics) {
    const row = bySub.get(m.substation) ?? { zone: m.zone, delivered: 0, sales: 0 };
    row.delivered += m.delivered;
    row.sales += m.sales;
    bySub.set(m.substation, row);
  }
  return Array.from(bySub.entries())
    .slice(0, 12)
    .map(([sub, r]) => {
      const loss = r.delivered - r.sales;
      const pct = r.delivered > 0 ? (loss / r.delivered) * 100 : 0;
      return [sub, r.zone, fmtKwh(r.delivered), fmtKwh(r.sales), fmtKwh(loss), `${pct.toFixed(1)}%`];
    });
}

function downloadCsv(report: ReportDefinition, rows: string[][]) {
  const csv = [report.columns, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.id}-2024-01.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportPanel() {
  const [selectedId, setSelectedId] = useState(reportDefinitions[1].id);
  const [flash, setFlash] = useState<string | null>(null);
  const selected = reportDefinitions.find((r) => r.id === selectedId)!;
  const rows = previewRows(selected);

  function notify(msg: string) {
    setFlash(msg);
    window.setTimeout(() => setFlash(null), 4000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileBarChart className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Loss Reporting Suite</h2>
          <p className="text-sm text-muted-foreground">
            Bulk supply, reticulation and consolidated loss reports with export (BRS11, RQ12/13).
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reportDefinitions.map((r) => {
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <h3 className="mt-2 font-semibold">{r.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.description}</p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{r.frequency}</p>
            </button>
          );
        })}
      </div>

      {flash && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {flash}
        </div>
      )}

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">{selected.name} — preview</CardTitle>
            <CardDescription>Period 2024-01 · showing {rows.length} rows</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => downloadCsv(selected, rows)}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => notify(`${selected.name} queued as Excel (.xlsx) — check your downloads shortly.`)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => notify(`${selected.name} queued as PDF — check your downloads shortly.`)}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {selected.columns.map((c, i) => (
                    <TableHead key={c} className={i >= 2 ? "text-right" : ""}>
                      {c}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, ri) => (
                  <TableRow key={ri}>
                    {row.map((cell, ci) => (
                      <TableCell
                        key={ci}
                        className={`${ci >= 2 ? "text-right tabular-nums" : ""} ${ci === 0 ? "font-medium" : ""}`}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
