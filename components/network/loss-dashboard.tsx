"use client";

import { useState } from "react";
import { useNetwork } from "@/lib/context/network-context";
import type { LossCalculation } from "@/lib/types/network";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function formatKwh(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} GWh`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} MWh`;
  }
  return `${value.toFixed(0)} kWh`;
}

function LossIndicator({ lossPercent }: { lossPercent: number }) {
  if (lossPercent > 15) {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingUp className="h-4 w-4" />
        <span className="font-semibold">{lossPercent.toFixed(1)}%</span>
      </div>
    );
  }
  if (lossPercent > 10) {
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <Minus className="h-4 w-4" />
        <span className="font-medium">{lossPercent.toFixed(1)}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-emerald-600">
      <TrendingDown className="h-4 w-4" />
      <span>{lossPercent.toFixed(1)}%</span>
    </div>
  );
}

interface DrilldownRowProps {
  result: LossCalculation;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}

function DrilldownRow({ result, depth, expanded, onToggle }: DrilldownRowProps) {
  const isExpanded = expanded.has(result.nodeId);
  const hasChildren = result.children && result.children.length > 0;
  
  const levelColors: Record<string, string> = {
    ou: "bg-blue-100 text-blue-800",
    zone: "bg-purple-100 text-purple-800",
    sector: "bg-indigo-100 text-indigo-800",
    cnc: "bg-cyan-100 text-cyan-800",
    substation: "bg-emerald-100 text-emerald-800",
    feeder: "bg-orange-100 text-orange-800",
    transformer: "bg-amber-100 text-amber-800",
    meter: "bg-slate-100 text-slate-800",
  };

  return (
    <>
      <TableRow 
        className={cn(
          "cursor-pointer hover:bg-muted/50 transition-colors",
          result.nonTechnicalLossPercent > 15 && "bg-red-50"
        )}
        onClick={() => hasChildren && onToggle(result.nodeId)}
      >
        <TableCell style={{ paddingLeft: `${depth * 24 + 16}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span className="font-medium">{result.nodeName}</span>
            <Badge variant="outline" className={levelColors[result.nodeType] || ""}>
              {result.nodeType.toUpperCase()}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="text-right font-mono">
          {formatKwh(result.energyDelivered)}
        </TableCell>
        <TableCell className="text-right font-mono">
          {formatKwh(result.customerSales)}
        </TableCell>
        <TableCell className="text-right font-mono text-muted-foreground">
          {formatKwh(result.technicalLoss)}
        </TableCell>
        <TableCell className="text-right font-mono">
          {formatKwh(result.nonTechnicalLoss)}
        </TableCell>
        <TableCell className="text-right">
          <LossIndicator lossPercent={result.nonTechnicalLossPercent} />
        </TableCell>
      </TableRow>
      {isExpanded && result.children?.map((child) => (
        <DrilldownRow
          key={child.nodeId}
          result={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}

export function LossDashboard() {
  const { state } = useNetwork();
  const { lossResults, globalTechnicalLossPercent } = state;
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["ou-gauteng"]));

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!lossResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loss Analysis</CardTitle>
          <CardDescription>
            Configure the network and click &quot;Calculate Losses&quot; to view results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No calculation results yet. Go to the &quot;Calculate Losses&quot; tab to run a calculation.
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLossPercent = lossResults.technicalLossPercent + lossResults.nonTechnicalLossPercent;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Loss Analysis by OU Hierarchy</CardTitle>
            <CardDescription>
              Click rows to drill down. Technical loss set at {globalTechnicalLossPercent}%
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Non-Technical Loss</div>
            <div className={cn(
              "text-2xl font-bold",
              lossResults.nonTechnicalLossPercent > 15 ? "text-red-600" : 
              lossResults.nonTechnicalLossPercent > 10 ? "text-amber-600" : "text-emerald-600"
            )}>
              {lossResults.nonTechnicalLossPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Energy Delivered</div>
            <div className="text-xl font-semibold">{formatKwh(lossResults.energyDelivered)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Customer Sales</div>
            <div className="text-xl font-semibold">{formatKwh(lossResults.customerSales)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Technical Loss ({lossResults.technicalLossPercent.toFixed(1)}%)</div>
            <div className="text-xl font-semibold text-muted-foreground">{formatKwh(lossResults.technicalLoss)}</div>
          </div>
          <div className="rounded-lg border p-4 border-red-200 bg-red-50">
            <div className="text-sm text-red-600">Non-Technical Loss</div>
            <div className="text-xl font-semibold text-red-700">{formatKwh(lossResults.nonTechnicalLoss)}</div>
          </div>
        </div>

        {/* Drilldown Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Hierarchy Level</TableHead>
                <TableHead className="text-right">Energy Delivered</TableHead>
                <TableHead className="text-right">Customer Sales</TableHead>
                <TableHead className="text-right">Technical Loss</TableHead>
                <TableHead className="text-right">Non-Tech Loss</TableHead>
                <TableHead className="text-right">Loss %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <DrilldownRow
                result={lossResults}
                depth={0}
                expanded={expanded}
                onToggle={toggleExpand}
              />
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
