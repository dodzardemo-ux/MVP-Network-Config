"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  traceabilityMatrix,
  traceSummary,
  type TraceStatus,
} from "@/lib/data/operations-data";
import { ListChecks, CheckCircle2, CircleDashed, Circle } from "lucide-react";

const statusConfig: Record<TraceStatus, { label: string; className: string; Icon: typeof Circle }> = {
  demonstrated: { label: "Demonstrated", className: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  partial: { label: "Partial", className: "bg-amber-100 text-amber-800 border-amber-200", Icon: CircleDashed },
  planned: { label: "Planned", className: "bg-slate-100 text-slate-700 border-slate-200", Icon: Circle },
};

// Tender scoring weights, for evaluator context.
const scoringWeights = [
  { area: "Functional", weight: 40 },
  { area: "Non-Functional", weight: 20 },
  { area: "Key Requirements", weight: 20 },
  { area: "Security", weight: 15 },
  { area: "Cloud", weight: 5 },
];

export function TraceabilityPanel() {
  const coverage = Math.round((traceSummary.demonstrated / traceSummary.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Requirements Traceability</h2>
          <p className="text-sm text-muted-foreground">
            Every scored requirement mapped to the module that demonstrates it.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Demonstrated coverage</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-600">{coverage}%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${coverage}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-around gap-2 p-4">
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums text-emerald-600">{traceSummary.demonstrated}</p>
              <p className="text-xs text-muted-foreground">Demonstrated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums text-amber-600">{traceSummary.partial}</p>
              <p className="text-xs text-muted-foreground">Partial</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold tabular-nums text-slate-500">{traceSummary.planned}</p>
              <p className="text-xs text-muted-foreground">Planned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scoring weights</p>
            <div className="mt-2 space-y-1">
              {scoringWeights.map((s) => (
                <div key={s.area} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.area}</span>
                  <span className="font-semibold tabular-nums">{s.weight}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Traceability matrix</CardTitle>
          <CardDescription>
            {traceSummary.total} requirements across functional, non-functional, security and cloud areas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead className="min-w-72">Requirement</TableHead>
                  <TableHead>Scoring area</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {traceabilityMatrix.map((t) => {
                  const cfg = statusConfig[t.status];
                  return (
                    <TableRow key={t.ref}>
                      <TableCell className="font-mono text-xs font-medium">{t.ref}</TableCell>
                      <TableCell className="text-sm">{t.requirement}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{t.scoringArea}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{t.module}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${cfg.className}`}>
                          <cfg.Icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
