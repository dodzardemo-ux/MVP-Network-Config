"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import geoData from "@/lib/data/gauteng-districts.json";

// Maps each Gauteng district polygon to the matching network zone id.
// West Rand has no sample data yet, so it renders as "no data".
export const DISTRICT_TO_ZONE: Record<string, string | null> = {
  "City of Johannesburg": "zone-johannesburg",
  "City of Tshwane": "zone-tshwane",
  Ekurhuleni: "zone-ekurhuleni",
  Sedibeng: "zone-vaal",
  "West Rand": null,
};

export interface DistrictLoss {
  ntlPercent: number;
  name: string;
}

export interface LossThresholds {
  low: number;
  medium: number;
  high: number;
}

// Banded conditional formatting (BR12): the greater the loss, the more red.
export function lossColor(
  ntlPercent: number | null | undefined,
  t: LossThresholds,
): string {
  if (ntlPercent == null) return "hsl(210 16% 88%)"; // no data — neutral grey
  if (ntlPercent < t.low) return "hsl(142 71% 45%)"; // green
  if (ntlPercent < t.medium) return "hsl(48 96% 53%)"; // amber
  if (ntlPercent < t.high) return "hsl(25 95% 53%)"; // orange
  return "hsl(0 84% 60%)"; // red
}

interface GautengLossMapProps {
  // zone id -> loss info
  lossByZone: Map<string, DistrictLoss>;
  thresholds: LossThresholds;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
}

export function GautengLossMap({
  lossByZone,
  thresholds,
  selectedZoneId,
  onSelectZone,
}: GautengLossMapProps) {
  const [hovered, setHovered] = useState<{
    name: string;
    ntl: number | null;
    x: number;
    y: number;
  } | null>(null);

  const geographies = useMemo(() => geoData as unknown, []);

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 13000, center: [28.0, -26.1] }}
        width={520}
        height={440}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geographies}>
          {({ geographies: geos }) =>
            geos.map((geo) => {
              const districtName: string = geo.properties.name;
              const zoneId = DISTRICT_TO_ZONE[districtName] ?? null;
              const loss = zoneId ? lossByZone.get(zoneId) : undefined;
              const ntl = loss ? loss.ntlPercent : null;
              const isSelected = zoneId != null && zoneId === selectedZoneId;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={lossColor(ntl, thresholds)}
                  stroke="hsl(0 0% 100%)"
                  strokeWidth={isSelected ? 2.5 : 1}
                  tabIndex={-1}
                  onMouseEnter={(e) =>
                    setHovered({
                      name: districtName,
                      ntl,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseMove={(e) =>
                    setHovered((h) =>
                      h ? { ...h, x: e.clientX, y: e.clientY } : h,
                    )
                  }
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => zoneId && onSelectZone(isSelected ? null : zoneId)}
                  style={{
                    default: {
                      outline: "none",
                      cursor: zoneId ? "pointer" : "default",
                      filter: isSelected
                        ? "brightness(0.92)"
                        : undefined,
                    },
                    hover: {
                      outline: "none",
                      cursor: zoneId ? "pointer" : "default",
                      filter: "brightness(0.9)",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {hovered && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
          style={{ left: hovered.x + 12, top: hovered.y + 12 }}
        >
          <div className="font-medium text-popover-foreground">{hovered.name}</div>
          <div className="text-muted-foreground">
            {hovered.ntl == null
              ? "No sample data"
              : `Non-technical loss: ${hovered.ntl.toFixed(1)}%`}
          </div>
        </div>
      )}
    </div>
  );
}
