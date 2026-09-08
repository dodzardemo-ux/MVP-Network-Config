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
  worstFeeders,
  seededWorkOrders,
  type WorkOrder,
  type WorkOrderType,
  type WorkOrderPriority,
  type WorkOrderStatus,
} from "@/lib/data/operations-data";
import { useAuth } from "@/lib/context/auth-context";
import { Wrench, ClipboardCheck, CheckCircle2, Plus } from "lucide-react";

const typeConfig: Record<WorkOrderType, { label: string; className: string }> = {
  maintenance: { label: "Maintenance", className: "bg-blue-100 text-blue-800 border-blue-200" },
  audit: { label: "Audit", className: "bg-violet-100 text-violet-800 border-violet-200" },
};

const priorityConfig: Record<WorkOrderPriority, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" },
  normal: { label: "Normal", className: "bg-slate-100 text-slate-700 border-slate-200" },
};

const woStatusConfig: Record<WorkOrderStatus, { label: string; className: string }> = {
  raised: { label: "Raised", className: "bg-amber-100 text-amber-800 border-amber-200" },
  dispatched: { label: "Dispatched", className: "bg-blue-100 text-blue-800 border-blue-200" },
  "in-progress": { label: "In progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
  closed: { label: "Closed", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

let counter = 4600;

export function WorkOrderPanel() {
  const { can } = useAuth();
  const canMaintenance = can("create_workorder");
  const canAudit = can("initiate_audit");
  const [orders, setOrders] = useState<WorkOrder[]>(seededWorkOrders);
  const [flash, setFlash] = useState<string | null>(null);
  const [raised, setRaised] = useState<Set<string>>(new Set());

  function createOrder(feederId: string, type: WorkOrderType) {
    const feeder = worstFeeders.find((f) => f.feederId === feederId);
    if (!feeder) return;
    counter += 1;
    const id = `WO-${counter}`;
    const order: WorkOrder = {
      id,
      type,
      title:
        type === "audit"
          ? "Revenue-protection audit — high NTL feeder"
          : "Investigate & maintain high-loss feeder",
      targetName: feeder.name,
      targetId: feeder.feederId,
      zone: feeder.zone,
      priority: feeder.ntlPercent > 20 ? "urgent" : "high",
      status: "raised",
      raisedOn: "2024-01-08",
      assignedTeam: type === "audit" ? "Revenue Protection · Team A" : "Field Services · Metering",
      ntlPercent: feeder.ntlPercent,
      reference: `MAXIMO-${type === "audit" ? "AUD" : "WO"}-${counter}`,
    };
    setOrders((prev) => [order, ...prev]);
    setRaised((prev) => new Set(prev).add(`${feederId}-${type}`));
    setFlash(`${id} created and logged to the maintenance system (${order.reference}).`);
    window.setTimeout(() => setFlash(null), 4000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Work Orders &amp; Audits</h2>
          <p className="text-sm text-muted-foreground">
            Log maintenance requests and initiate audits on worst-performing networks (BRS16, BRS17).
          </p>
        </div>
      </div>

      {flash && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {flash}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Worst-performing feeders</CardTitle>
          <CardDescription>
            Ranked by non-technical loss. Raise a maintenance request or initiate a revenue-protection audit directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feeder</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead className="text-right">NTL %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {worstFeeders.map((f) => (
                  <TableRow key={f.feederId}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.zone}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          f.ntlPercent > 20 ? "text-destructive" : "text-orange-600"
                        }`}
                      >
                        {f.ntlPercent.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-xs"
                          disabled={!canMaintenance || raised.has(`${f.feederId}-maintenance`)}
                          title={canMaintenance ? undefined : "Requires the 'Log work orders' permission"}
                          onClick={() => createOrder(f.feederId, "maintenance")}
                        >
                          <Wrench className="h-3 w-3" />
                          {raised.has(`${f.feederId}-maintenance`) ? "Logged" : "Maintenance"}
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          disabled={!canAudit || raised.has(`${f.feederId}-audit`)}
                          title={canAudit ? undefined : "Requires the 'Initiate audits' permission"}
                          onClick={() => createOrder(f.feederId, "audit")}
                        >
                          <ClipboardCheck className="h-3 w-3" />
                          {raised.has(`${f.feederId}-audit`) ? "Audit raised" : "Initiate audit"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Work order register
          </CardTitle>
          <CardDescription>{orders.length} work orders synced with the maintenance system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Raised</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeConfig[o.type].className}>
                        {typeConfig[o.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-56 text-sm">{o.title}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {o.targetName}
                      <span className="block text-xs text-muted-foreground">{o.zone}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityConfig[o.priority].className}>
                        {priorityConfig[o.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{o.assignedTeam}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums text-sm">{o.raisedOn}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={woStatusConfig[o.status].className}>
                        {woStatusConfig[o.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{o.reference}</TableCell>
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
