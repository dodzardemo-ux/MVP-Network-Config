"use client";

import { useMemo, useState } from "react";
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
  validationRules,
  validationExceptions,
  type ExceptionSeverity,
  type ExceptionStatus,
} from "@/lib/data/operations-data";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const severityConfig: Record<ExceptionSeverity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-800 border-amber-200" },
  low: { label: "Low", className: "bg-slate-100 text-slate-700 border-slate-200" },
};

const statusConfig: Record<ExceptionStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-destructive/10 text-destructive border-destructive/20" },
  "in-progress": { label: "In progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
  resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const FILTERS = ["all", "open", "in-progress", "resolved"] as const;

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "danger" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone === "danger" ? "text-destructive" : ""}`}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function DataValidationPanel() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return validationExceptions;
    return validationExceptions.filter((e) => e.status === filter);
  }, [filter]);

  const totalChecked = validationRules.reduce((s, r) => s + r.checked, 0);
  const totalFailed = validationRules.reduce((s, r) => s + r.failed, 0);
  const passRate = ((totalChecked - totalFailed) / totalChecked) * 100;
  const openCount = validationExceptions.filter((e) => e.status === "open").length;
  const criticalCount = validationExceptions.filter((e) => e.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Data Validation &amp; Exceptions</h2>
          <p className="text-sm text-muted-foreground">
            Business-rule validation, exception detection and routing to role-players (RQ7, RQ8, RQ10).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Validation pass rate" value={`${passRate.toFixed(1)}%`} sub={`${totalChecked} checks run`} />
        <StatCard label="Exceptions raised" value={String(validationExceptions.length)} sub="This period" />
        <StatCard label="Open" value={String(openCount)} sub="Awaiting action" tone="danger" />
        <StatCard label="Critical" value={String(criticalCount)} sub="Highest severity" tone="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validation rules</CardTitle>
          <CardDescription>Automated checks applied to each period&apos;s data load.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {validationRules.map((rule) => {
            const pass = rule.checked - rule.failed;
            const pct = (pass / rule.checked) * 100;
            const clean = rule.failed === 0;
            return (
              <div key={rule.id} className="flex items-center gap-4 rounded-lg border p-3">
                <div className={clean ? "text-emerald-600" : "text-amber-600"}>
                  {clean ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rule.name}</span>
                    <Badge variant="outline" className="text-[10px]">{rule.category}</Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{rule.description}</p>
                </div>
                <div className="hidden w-40 sm:block">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${clean ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right text-sm tabular-nums">
                  {clean ? (
                    <span className="text-emerald-600">All pass</span>
                  ) : (
                    <span className="text-amber-700">{rule.failed} failed</span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Exception queue</CardTitle>
            <CardDescription>{filtered.length} exceptions routed to role-players</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="h-7 px-3 text-xs capitalize"
              >
                {f === "in-progress" ? "In progress" : f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="min-w-72">Detail</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No exceptions match this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={severityConfig[e.severity].className}>
                          {severityConfig[e.severity].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{e.category}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">{e.entity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.detail}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{e.assignedRole}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${statusConfig[e.status].className}`}>
                          {e.status === "resolved" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : e.status === "open" ? (
                            <XCircle className="h-3 w-3" />
                          ) : null}
                          {statusConfig[e.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
