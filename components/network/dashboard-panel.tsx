"use client";

import { useMemo, useState } from "react";
import { useNetwork } from "@/lib/context/network-context";
import { zones } from "@/lib/data/network-data";
import {
  calculateZoneLoss,
  calculateOULoss,
  formatKwh,
  type CalculationConfig,
} from "@/lib/calculations/loss-calculator";
import {
  GautengLossMap,
  lossColor,
  type DistrictLoss,
  type LossThresholds,
} from "@/components/network/gauteng-loss-map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Zap, TrendingDown, AlertTriangle, MapPin, Gauge } from "lucide-react";

const chartConfig = {
  delivered: { label: "kWh Delivered", color: "hsl(217 91% 60%)" },
  sales: { label: "kWh Used (Sales)", color: "hsl(142 71% 45%)" },
  ntl: { label: "Non-Technical Loss %", color: "hsl(0 84% 60%)" },
} satisfies ChartConfig;

export function DashboardPanel() {
  const { state } = useNetwork();
  const [thresholds, setThresholds] = useState<LossThresholds>({
    low: 5,
    medium: 10,
    high: 20,
  });
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Build a live calculation config from the shared network state so the
  // dashboard reflects any edits made on the other tabs immediately.
  const config: CalculationConfig = useMemo(
    () => ({
      globalTechnicalLossPercent: state.globalTechnicalLossPercent,
      feederOverrides: state.feederOverrides,
      kwhAdjustments: state.kwhAdjustments,
      includeCDU: state.includeCDU,
    }),
    [
      state.globalTechnicalLossPercent,
      state.feederOverrides,
      state.kwhAdjustments,
      state.includeCDU,
      // node topology changes should also recompute
      state.nodes,
    ],
  );

  const ouResult = useMemo(() => calculateOULoss("ou-gauteng", config), [config]);

  const zoneResults = useMemo(
    () =>
      zones
        .map((z) => calculateZoneLoss(z.id, config))
        .filter((r): r is NonNullable<typeof r> => r !== null),
    [config],
  );

  const lossByZone = useMemo(() => {
    const m = new Map<string, DistrictLoss>();
    for (const r of zoneResults) {
      m.set(r.nodeId, { ntlPercent: r.nonTechnicalLossPercent, name: r.nodeName });
    }
    return m;
  }, [zoneResults]);

  const chartData = useMemo(
    () =>
      zoneResults.map((r) => ({
        name: r.nodeName,
        zoneId: r.nodeId,
        delivered: Math.round(r.energyDelivered / 1000),
        sales: Math.round(r.customerSales / 1000),
        ntl: Number(r.nonTechnicalLossPercent.toFixed(1)),
      })),
    [zoneResults],
  );

  const selectedZone = selectedZoneId
    ? zoneResults.find((r) => r.nodeId === selectedZoneId)
    : null;

  const worstZone = useMemo(() => {
    if (zoneResults.length === 0) return null;
    return [...zoneResults].sort(
      (a, b) => b.nonTechnicalLossPercent - a.nonTechnicalLossPercent,
    )[0];
  }, [zoneResults]);

  if (!ouResult) return null;

  return (
    <div className="space-y-6">
      {/* KPI summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Zap className="h-4 w-4" />}
          label="Energy Delivered"
          value={formatKwh(ouResult.energyDelivered)}
          tone="neutral"
        />
        <KpiCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Customer Sales"
          value={formatKwh(ouResult.customerSales)}
          tone="neutral"
        />
        <KpiCard
          icon={<Gauge className="h-4 w-4" />}
          label={`Technical Loss (${ouResult.technicalLossPercent.toFixed(1)}%)`}
          value={formatKwh(ouResult.technicalLoss)}
          tone="neutral"
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Non-Technical Loss"
          value={formatKwh(ouResult.nonTechnicalLoss)}
          sub={`${ouResult.nonTechnicalLossPercent.toFixed(1)}% of delivered`}
          tone={
            ouResult.nonTechnicalLossPercent >= thresholds.high
              ? "critical"
              : ouResult.nonTechnicalLossPercent >= thresholds.medium
                ? "warning"
                : "good"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Heat map */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Gauteng Non-Technical Loss Heat Map
                </CardTitle>
                <CardDescription>Click a district to inspect it.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <GautengLossMap
                  lossByZone={lossByZone}
                  thresholds={thresholds}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={setSelectedZoneId}
                />
              </div>
              <div className="space-y-4">
                {/* Legend */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Loss severity
                  </div>
                  <LegendRow color={lossColor(0, thresholds)} label={`< ${thresholds.low}% Low`} />
                  <LegendRow
                    color={lossColor(thresholds.low, thresholds)}
                    label={`${thresholds.low}–${thresholds.medium}% Moderate`}
                  />
                  <LegendRow
                    color={lossColor(thresholds.medium, thresholds)}
                    label={`${thresholds.medium}–${thresholds.high}% High`}
                  />
                  <LegendRow
                    color={lossColor(thresholds.high, thresholds)}
                    label={`≥ ${thresholds.high}% Critical`}
                  />
                  <LegendRow color={lossColor(null, thresholds)} label="No data" />
                </div>

                {/* Adjustable thresholds (BR12) */}
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Conditional formatting thresholds
                  </div>
                  <ThresholdSlider
                    label="Low / Moderate"
                    value={thresholds.low}
                    min={0}
                    max={thresholds.medium - 1}
                    onChange={(v) => setThresholds((t) => ({ ...t, low: v }))}
                  />
                  <ThresholdSlider
                    label="Moderate / High"
                    value={thresholds.medium}
                    min={thresholds.low + 1}
                    max={thresholds.high - 1}
                    onChange={(v) => setThresholds((t) => ({ ...t, medium: v }))}
                  />
                  <ThresholdSlider
                    label="High / Critical"
                    value={thresholds.high}
                    min={thresholds.medium + 1}
                    max={40}
                    onChange={(v) => setThresholds((t) => ({ ...t, high: v }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected district / worst performer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{selectedZone ? selectedZone.nodeName : "Zone Overview"}</CardTitle>
            <CardDescription>
              {selectedZone
                ? "Selected district detail"
                : "Click a district on the map to drill in"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(selectedZone ?? worstZone) && (
              <>
                {!selectedZone && worstZone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Highest loss zone: <span className="font-medium text-foreground">{worstZone.nodeName}</span>
                  </div>
                )}
                {(() => {
                  const z = selectedZone ?? worstZone!;
                  return (
                    <div className="space-y-3">
                      <DetailRow label="Energy Delivered" value={formatKwh(z.energyDelivered)} />
                      <DetailRow label="Customer Sales" value={formatKwh(z.customerSales)} />
                      <DetailRow
                        label="Technical Loss"
                        value={`${formatKwh(z.technicalLoss)} (${z.technicalLossPercent.toFixed(1)}%)`}
                      />
                      <DetailRow
                        label="Non-Technical Loss"
                        value={`${formatKwh(z.nonTechnicalLoss)} (${z.nonTechnicalLossPercent.toFixed(1)}%)`}
                        highlight={
                          z.nonTechnicalLossPercent >= thresholds.high
                            ? "critical"
                            : z.nonTechnicalLossPercent >= thresholds.medium
                              ? "warning"
                              : "good"
                        }
                      />
                    </div>
                  );
                })()}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Balancing chart (BR13): delivered vs used per zone */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Balancing by Zone</CardTitle>
          <CardDescription>
            kWh delivered versus kWh used (MWh), per Gauteng zone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={44} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="delivered" fill="var(--color-delivered)" radius={4} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* NTL % per zone with conditional coloring */}
      <Card>
        <CardHeader>
          <CardTitle>Non-Technical Loss % by Zone</CardTitle>
          <CardDescription>
            Bars are colored using the same thresholds as the heat map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={44} unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="ntl" radius={4}>
                {chartData.map((d) => (
                  <Cell key={d.zoneId} fill={lossColor(d.ntl, thresholds)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: "neutral" | "good" | "warning" | "critical";
}) {
  const toneClasses: Record<string, string> = {
    neutral: "border-border",
    good: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
    critical: "border-red-200 bg-red-50",
  };
  const valueTone: Record<string, string> = {
    neutral: "text-foreground",
    good: "text-emerald-700",
    warning: "text-amber-700",
    critical: "text-red-700",
  };
  return (
    <Card className={toneClasses[tone]}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className={`mt-2 text-2xl font-bold ${valueTone[tone]}`}>{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="inline-block h-3 w-3 rounded-sm border"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function ThresholdSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs font-medium tabular-nums">{value}%</span>
      </div>
      <Slider
        value={[value]}
        min={Math.max(0, min)}
        max={max}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "good" | "warning" | "critical";
}) {
  const tone =
    highlight === "critical"
      ? "text-red-700"
      : highlight === "warning"
        ? "text-amber-700"
        : highlight === "good"
          ? "text-emerald-700"
          : "text-foreground";
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
