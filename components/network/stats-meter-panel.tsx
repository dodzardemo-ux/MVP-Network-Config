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
import { Input } from "@/components/ui/input";
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
  statsMeters,
  importBatches,
  fmtKwh,
  type MeterCommStatus,
  type ReadStatus,
} from "@/lib/data/operations-data";
import { RadioTower, Search, RefreshCw, Wifi, WifiOff, SignalMedium } from "lucide-react";

const commConfig: Record<MeterCommStatus, { label: string; className: string; Icon: typeof Wifi }> = {
  online: { label: "Online", className: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: Wifi },
  intermittent: { label: "Intermittent", className: "bg-amber-100 text-amber-800 border-amber-200", Icon: SignalMedium },
  offline: { label: "Offline", className: "bg-destructive/10 text-destructive border-destructive/20", Icon: WifiOff },
};

const readConfig: Record<ReadStatus, { label: string; className: string }> = {
  actual: { label: "Actual", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  estimated: { label: "Estimated", className: "bg-amber-100 text-amber-800 border-amber-200" },
  missing: { label: "Missing", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function StatsMeterPanel() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return statsMeters;
    return statsMeters.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.feederName.toLowerCase().includes(q) ||
        m.zone.toLowerCase().includes(q) ||
        m.serial.toLowerCase().includes(q),
    );
  }, [query]);

  const total = statsMeters.length;
  const online = statsMeters.filter((m) => m.commStatus === "online").length;
  const missing = statsMeters.filter((m) => m.readStatus === "missing").length;
  const estimated = statsMeters.filter((m) => m.readStatus === "estimated").length;
  const lastBatch = importBatches[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <RadioTower className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Stats Meter Management</h2>
            <p className="text-sm text-muted-foreground">
              Automated MV90 imports and stats-meter health across the network (RQ2).
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Run MV90 import
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Stats meters" value={String(total)} sub="One per feeder" />
        <StatCard label="Communicating" value={`${online}/${total}`} sub={`${Math.round((online / total) * 100)}% online`} />
        <StatCard label="Estimated reads" value={String(estimated)} sub="Flagged for review" />
        <StatCard label="Missing reads" value={String(missing)} sub="No MV90 this period" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest import</CardTitle>
          <CardDescription>
            {lastBatch.id} · {lastBatch.source} · {lastBatch.runAt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Received</span>{" "}
              <span className="font-semibold tabular-nums">
                {lastBatch.metersReceived}/{lastBatch.metersExpected}
              </span>
            </div>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(lastBatch.metersReceived / lastBatch.metersExpected) * 100}%` }}
              />
            </div>
            <Badge
              variant="outline"
              className={
                lastBatch.status === "success"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }
            >
              {lastBatch.status === "success" ? "Complete" : "Partial — exceptions raised"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Stats meter register</CardTitle>
            <CardDescription>{filtered.length} of {total} meters</CardDescription>
          </div>
          <div className="relative w-64 max-w-full">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search meter, feeder, zone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stats meter</TableHead>
                  <TableHead>Feeder</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>CT ratio</TableHead>
                  <TableHead>Comms</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Last read</TableHead>
                  <TableHead className="text-right">Last kWh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => {
                  const comm = commConfig[m.commStatus];
                  const read = readConfig[m.readStatus];
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{m.feederName}</TableCell>
                      <TableCell>{m.zone}</TableCell>
                      <TableCell className="tabular-nums">{m.ctRatio}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${comm.className}`}>
                          <comm.Icon className="h-3 w-3" />
                          {comm.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={read.className}>
                          {read.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{m.lastReadDate}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {m.readStatus === "missing" ? "—" : fmtKwh(m.lastReadKwh)}
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
