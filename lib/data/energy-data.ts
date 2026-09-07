// Mock energy data based on MV90 (energy delivered) and consumption data
// Energy delivered per feeder and consumption per meter

import type { EnergyDelivered, PPUAllocation, CDUAllocation, CDUFeederMap } from '@/lib/types/network';
import { feeders, transformers, meters } from './network-data';

// Deterministic pseudo-random generator based on a string seed.
// Ensures the same values are produced on server and client (prevents hydration mismatch).
function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Convert to a 0..1 float
  return ((h >>> 0) % 100000) / 100000;
}

// Energy delivered per feeder (from MV90 stats meters)
// These values represent monthly energy delivered in kWh
export const energyDeliveredData: EnergyDelivered[] = feeders.map(feeder => {
  // Base energy depends on area type (urban vs suburban)
  const rand = seededRandom(feeder.id);
  let baseEnergy: number;
  if (feeder.id.includes('orlando') || feeder.id.includes('diepkloof') || 
      feeder.id.includes('evaton') || feeder.id.includes('bophelong') ||
      feeder.id.includes('daveyton') || feeder.id.includes('kwa-thema')) {
    // High density areas - more energy
    baseEnergy = 850000 + rand * 400000;
  } else if (feeder.id.includes('fourways') || feeder.id.includes('lanseria')) {
    // Commercial areas - high energy
    baseEnergy = 950000 + rand * 500000;
  } else {
    // Suburban areas - moderate energy
    baseEnergy = 650000 + rand * 300000;
  }
  
  return {
    feederId: feeder.id,
    statsMeterName: feeder.statsMeterName,
    energyDelivered: Math.round(baseEnergy),
    date: '2024-01', // January 2024
  };
});

// Create a map for quick lookup
export const energyDeliveredMap = new Map<string, number>(
  energyDeliveredData.map(ed => [ed.feederId, ed.energyDelivered])
);

// PPU Allocations per transformer (for prepaid customers)
// This represents the aggregate prepaid consumption per transformer
export const ppuAllocations: PPUAllocation[] = transformers.map(tx => {
  // Get meters for this transformer
  const txMeters = meters.filter(m => m.parentId === tx.id);
  const ppuMeters = txMeters.filter(m => m.premType === 'PPU');
  const totalPPUKwh = ppuMeters.reduce((sum, m) => sum + m.kwh, 0);
  
  return {
    transformerId: tx.id,
    kwh: totalPPUKwh,
    customerCount: ppuMeters.length,
    buyingCustomerCount: Math.floor(ppuMeters.length * (0.7 + seededRandom(tx.id + '-ppu') * 0.25)), // 70-95% buying
  };
});

export const ppuAllocationMap = new Map<string, PPUAllocation>(
  ppuAllocations.map(ppu => [ppu.transformerId, ppu])
);

// CDU (Unallocated prepaid sales) by GL Division
// These are prepaid sales that haven't been allocated to specific transformers
export const cduAllocations: CDUAllocation[] = [
  { glDivision: 'JOHANNESBURG', cduCode: 'CDU-JHB-001', cduKwh: 125000 },
  { glDivision: 'JOHANNESBURG', cduCode: 'CDU-JHB-002', cduKwh: 98000 },
  { glDivision: 'SOWETO', cduCode: 'CDU-SOW-001', cduKwh: 185000 },
  { glDivision: 'SOWETO', cduCode: 'CDU-SOW-002', cduKwh: 210000 },
  { glDivision: 'SOWETO', cduCode: 'CDU-SOW-003', cduKwh: 156000 },
  { glDivision: 'VAAL', cduCode: 'CDU-VAAL-001', cduKwh: 142000 },
  { glDivision: 'VAAL', cduCode: 'CDU-VAAL-002', cduKwh: 118000 },
  { glDivision: 'EKURHULENI', cduCode: 'CDU-EKU-001', cduKwh: 135000 },
  { glDivision: 'EKURHULENI', cduCode: 'CDU-EKU-002', cduKwh: 108000 },
  { glDivision: 'TSHWANE', cduCode: 'CDU-TSH-001', cduKwh: 95000 },
];

// CDU to Feeder mapping (% allocation of unallocated sales to feeders)
// Based on high prepaid customer concentration
export const cduFeederMaps: CDUFeederMap[] = [
  // JOHANNESBURG CDU allocated to Randburg feeders
  { feederId: 'fdr-northcliff-1', cduCode: 'CDU-JHB-001', percentAlloc: 60 },
  { feederId: 'fdr-northcliff-2', cduCode: 'CDU-JHB-001', percentAlloc: 40 },
  { feederId: 'fdr-northcliff-1', cduCode: 'CDU-JHB-002', percentAlloc: 50 },
  { feederId: 'fdr-northcliff-2', cduCode: 'CDU-JHB-002', percentAlloc: 50 },
  // SOWETO CDU allocated to Orlando and Diepkloof feeders
  { feederId: 'fdr-orlando-1', cduCode: 'CDU-SOW-001', percentAlloc: 35 },
  { feederId: 'fdr-orlando-2', cduCode: 'CDU-SOW-001', percentAlloc: 35 },
  { feederId: 'fdr-orlando-3', cduCode: 'CDU-SOW-001', percentAlloc: 30 },
  { feederId: 'fdr-orlando-w1', cduCode: 'CDU-SOW-002', percentAlloc: 50 },
  { feederId: 'fdr-orlando-w2', cduCode: 'CDU-SOW-002', percentAlloc: 50 },
  { feederId: 'fdr-diepkloof-1', cduCode: 'CDU-SOW-003', percentAlloc: 55 },
  { feederId: 'fdr-diepkloof-2', cduCode: 'CDU-SOW-003', percentAlloc: 45 },
  // VAAL CDU allocated to Evaton and Bophelong feeders
  { feederId: 'fdr-evaton-1', cduCode: 'CDU-VAAL-001', percentAlloc: 40 },
  { feederId: 'fdr-evaton-2', cduCode: 'CDU-VAAL-001', percentAlloc: 30 },
  { feederId: 'fdr-bophelong-1', cduCode: 'CDU-VAAL-001', percentAlloc: 30 },
  { feederId: 'fdr-evaton-1', cduCode: 'CDU-VAAL-002', percentAlloc: 35 },
  { feederId: 'fdr-evaton-2', cduCode: 'CDU-VAAL-002', percentAlloc: 35 },
  { feederId: 'fdr-bophelong-1', cduCode: 'CDU-VAAL-002', percentAlloc: 30 },
  // EKURHULENI CDU allocated to Daveyton and Kwa-Thema feeders
  { feederId: 'fdr-daveyton-1', cduCode: 'CDU-EKU-001', percentAlloc: 30 },
  { feederId: 'fdr-daveyton-2', cduCode: 'CDU-EKU-001', percentAlloc: 30 },
  { feederId: 'fdr-kwa-thema-1', cduCode: 'CDU-EKU-001', percentAlloc: 40 },
  { feederId: 'fdr-primrose-1', cduCode: 'CDU-EKU-002', percentAlloc: 40 },
  { feederId: 'fdr-kwa-thema-2', cduCode: 'CDU-EKU-002', percentAlloc: 60 },
  // TSHWANE CDU allocated to Akasia and Highveld feeders
  { feederId: 'fdr-akasia-1', cduCode: 'CDU-TSH-001', percentAlloc: 30 },
  { feederId: 'fdr-akasia-2', cduCode: 'CDU-TSH-001', percentAlloc: 20 },
  { feederId: 'fdr-highveld-1', cduCode: 'CDU-TSH-001', percentAlloc: 25 },
  { feederId: 'fdr-highveld-2', cduCode: 'CDU-TSH-001', percentAlloc: 25 },
];

// Helper: Get total CDU allocation for a feeder
export function getCDUAllocationForFeeder(feederId: string): number {
  const allocations = cduFeederMaps.filter(m => m.feederId === feederId);
  let totalCDU = 0;
  
  for (const alloc of allocations) {
    const cdu = cduAllocations.find(c => c.cduCode === alloc.cduCode);
    if (cdu) {
      totalCDU += Math.round(cdu.cduKwh * (alloc.percentAlloc / 100));
    }
  }
  
  return totalCDU;
}

// Helper: Get customer consumption for a feeder (sum of all meters under it)
export function getCustomerConsumptionForFeeder(feederId: string): number {
  const feederTransformers = transformers.filter(tx => tx.parentId === feederId);
  let totalConsumption = 0;
  
  for (const tx of feederTransformers) {
    const txMeters = meters.filter(m => m.parentId === tx.id);
    totalConsumption += txMeters.reduce((sum, m) => sum + m.kwh, 0);
  }
  
  return totalConsumption;
}

// Helper: Get total customer consumption for any node (aggregated from descendants)
export function getTotalConsumptionForNode(nodeId: string, nodeType: string): number {
  // For meters, return their kWh directly
  const meter = meters.find(m => m.id === nodeId);
  if (meter) return meter.kwh;
  
  // For transformers, sum all meters
  if (nodeType === 'transformer') {
    return meters.filter(m => m.parentId === nodeId).reduce((sum, m) => sum + m.kwh, 0);
  }
  
  // For feeders, sum all transformer meters
  if (nodeType === 'feeder') {
    return getCustomerConsumptionForFeeder(nodeId);
  }
  
  // For higher levels, we need to aggregate from feeders
  // This will be handled by the calculation engine
  return 0;
}
