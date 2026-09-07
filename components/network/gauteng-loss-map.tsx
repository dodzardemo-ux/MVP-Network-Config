"use client";

import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import rawGeo from "@/lib/data/gauteng-municipalities.json";

export interface DistrictLoss {
  ntlPercent: number;
  name: string;
}

export interface LossThresholds {
  low: number;
  medium: number;
  high: number;
}

interface MunicipalityProps {
  name: string;
  district: string;
  zone: string | null;
}

const geoData = rawGeo as unknown as FeatureCollection<Geometry, MunicipalityProps>;

// Eskom-aligned severity palette for the heat map.
const COLOR_LOW = "#16a34a"; // green
const COLOR_MODERATE = "#eab308"; // amber
const COLOR_HIGH = "#f97316"; // orange
const COLOR_CRITICAL = "#dc2626"; // red
const COLOR_NODATA = "#dfe3e8"; // neutral grey

export function lossColor(
  ntl: number | null | undefined,
  t: LossThresholds,
): string {
  if (ntl == null || Number.isNaN(ntl)) return COLOR_NODATA;
  if (ntl < t.low) return COLOR_LOW;
  if (ntl < t.medium) return COLOR_MODERATE;
  if (ntl < t.high) return COLOR_HIGH;
  return COLOR_CRITICAL;
}

const WIDTH = 760;
const HEIGHT = 620;

export function GautengLossMap({
  lossByZone,
  thresholds,
  selectedZoneId,
  onSelectZone,
}: {
  lossByZone: Map<string, DistrictLoss>;
  thresholds: LossThresholds;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Fit the whole province into the viewport once; geoPath renders accurate
  // boundaries from the real GeoJSON (no hand-drawn coordinates).
  const { pathFor, labelFor } = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [24, 24],
        [WIDTH - 24, HEIGHT - 24],
      ],
      geoData,
    );
    const path = geoPath(projection);
    return {
      pathFor: (f: Feature<Geometry, MunicipalityProps>) => path(f) ?? "",
      labelFor: (f: Feature<Geometry, MunicipalityProps>) => path.centroid(f),
    };
  }, []);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Gauteng non-technical loss heat map by municipality"
      >
        {geoData.features.map((f) => {
          const { name, zone } = f.properties;
          const loss = zone ? lossByZone.get(zone) : undefined;
          const ntl = loss ? loss.ntlPercent : null;
          const fill = lossColor(ntl, thresholds);
          const isActive = zone !== null && zone === selectedZoneId;
          const isHovered = hovered === name;
          return (
            <path
              key={name}
              d={pathFor(f)}
              fill={fill}
              stroke="#ffffff"
              strokeWidth={isActive ? 2.5 : isHovered ? 1.75 : 1}
              opacity={hovered && !isHovered ? 0.82 : 1}
              className={zone ? "cursor-pointer transition-all" : "cursor-default transition-all"}
              style={isActive ? { filter: "drop-shadow(0 0 2px rgba(0,0,0,0.35))" } : undefined}
              onMouseEnter={(e) => {
                setHovered(name);
                const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                const scaleX = rect.width / WIDTH;
                const scaleY = rect.height / HEIGHT;
                const [cx, cy] = labelFor(f);
                setTooltip({
                  x: cx * scaleX,
                  y: cy * scaleY,
                  text: ntl !== null ? `${name}: ${ntl.toFixed(1)}% NTL` : `${name}: no sample data`,
                });
              }}
              onMouseLeave={() => {
                setHovered(null);
                setTooltip(null);
              }}
              onClick={() => {
                if (zone) onSelectZone(zone === selectedZoneId ? null : zone);
              }}
            />
          );
        })}

        {/* Municipality labels at polygon centroids */}
        {geoData.features.map((f) => {
          const [cx, cy] = labelFor(f);
          if (Number.isNaN(cx) || Number.isNaN(cy)) return null;
          return (
            <text
              key={`label-${f.properties.name}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
              style={{
                fontSize: 10,
                fontWeight: 600,
                fill: "#1f2937",
                paintOrder: "stroke",
                stroke: "rgba(255,255,255,0.85)",
                strokeWidth: 2.5,
                strokeLinejoin: "round",
              }}
            >
              {f.properties.name.replace(/^City of /, "")}
            </text>
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
