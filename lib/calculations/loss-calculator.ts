// Loss calculation engine for Feeder Balancing Module
// Implements BSR9: Calculate Balancing Results

import type { LossCalculation, NetworkNode, NodeType, Feeder } from '@/lib/types/network';
import { 
  nodeMap, 
  getChildren, 
  feeders, 
  transformers, 
  meters,
  zones,
  sectors,
  cncs,
  substations,
} from '@/lib/data/network-data';
import { 
  energyDeliveredMap, 
  getCustomerConsumptionForFeeder,
  getCDUAllocationForFeeder,
} from '@/lib/data/energy-data';
import type { Meter } from '@/lib/types/network';

export interface CalculationConfig {
  globalTechnicalLossPercent: number;
  feederOverrides: Map<string, number>;
  kwhAdjustments: Map<string, number>;
  includeCDU: boolean;
}

const DEFAULT_CONFIG: CalculationConfig = {
  globalTechnicalLossPercent: 10,
  feederOverrides: new Map(),
  kwhAdjustments: new Map(),
  includeCDU: true,
};

/**
 * Calculate losses for a single feeder
 */
export function calculateFeederLoss(
  feederId: string, 
  config: CalculationConfig = DEFAULT_CONFIG,
  includeChildren: boolean = false
): LossCalculation | null {
  const feeder = nodeMap.get(feederId) as Feeder | undefined;
  if (!feeder || feeder.type !== 'feeder') return null;

  // Get energy delivered (from MV90 stats meter)
  let energyDelivered = energyDeliveredMap.get(feederId) ?? 0;
  
  // Apply any kWh adjustments to energy delivered
  const deliveredAdjustment = config.kwhAdjustments.get(`${feederId}-delivered`) ?? 0;
  energyDelivered += deliveredAdjustment;

  // Get customer consumption (sum of all meters)
  let customerSales = getCustomerConsumptionForFeeder(feederId);
  
  // Apply any kWh adjustments to customer sales
  const salesAdjustment = config.kwhAdjustments.get(`${feederId}-sales`) ?? 0;
  customerSales += salesAdjustment;
  
  // Add CDU allocation if enabled
  if (config.includeCDU) {
    customerSales += getCDUAllocationForFeeder(feederId);
  }

  // Get technical loss percentage (override or global)
  const technicalLossPercent = config.feederOverrides.get(feederId) 
    ?? config.globalTechnicalLossPercent;

  // Calculate technical loss
  const technicalLoss = Math.round(energyDelivered * (technicalLossPercent / 100));

  // Calculate non-technical loss
  // Formula: NTL = Energy Delivered - Customer Sales - Technical Loss
  const nonTechnicalLoss = energyDelivered - customerSales - technicalLoss;
  
  // Calculate NTL percentage
  const nonTechnicalLossPercent = energyDelivered > 0 
    ? (nonTechnicalLoss / energyDelivered) * 100 
    : 0;

  // If children are requested, calculate transformer and meter level
  let children: LossCalculation[] | undefined = undefined;
  if (includeChildren) {
    const feederTransformers = transformers.filter(tx => tx.parentId === feederId);
    children = feederTransformers
      .map(tx => calculateTransformerLoss(tx.id, feederId, energyDelivered, customerSales, config))
      .filter((l): l is LossCalculation => l !== null);
  }

  return {
    nodeId: feederId,
    nodeName: feeder.name,
    nodeType: 'feeder',
    energyDelivered,
    customerSales,
    technicalLossPercent,
    technicalLoss,
    nonTechnicalLoss,
    nonTechnicalLossPercent,
    children,
  };
}

/**
 * Calculate losses for a transformer (proportional allocation from feeder)
 */
export function calculateTransformerLoss(
  transformerId: string,
  feederId: string,
  feederEnergyDelivered: number,
  feederTotalConsumption: number,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  const transformer = nodeMap.get(transformerId);
  if (!transformer || transformer.type !== 'transformer') return null;

  // Get all meters under this transformer
  const transformerMeters = meters.filter(m => m.parentId === transformerId);
  const transformerConsumption = transformerMeters.reduce((sum, m) => sum + m.kwh, 0);
  
  // Proportional allocation of energy delivered based on consumption
  const proportion = feederTotalConsumption > 0 
    ? transformerConsumption / feederTotalConsumption 
    : 0;
  const energyDelivered = Math.round(feederEnergyDelivered * proportion);
  
  const technicalLossPercent = config.globalTechnicalLossPercent;
  const technicalLoss = Math.round(energyDelivered * (technicalLossPercent / 100));
  const nonTechnicalLoss = energyDelivered - transformerConsumption - technicalLoss;
  const nonTechnicalLossPercent = energyDelivered > 0 
    ? (nonTechnicalLoss / energyDelivered) * 100 
    : 0;

  // Calculate meter-level losses
  const meterChildren = transformerMeters
    .map(m => calculateMeterLoss(m, energyDelivered, transformerConsumption, config))
    .filter((l): l is LossCalculation => l !== null);

  return {
    nodeId: transformerId,
    nodeName: transformer.name,
    nodeType: 'transformer',
    energyDelivered,
    customerSales: transformerConsumption,
    technicalLossPercent,
    technicalLoss,
    nonTechnicalLoss,
    nonTechnicalLossPercent,
    children: meterChildren,
  };
}

/**
 * Calculate losses for a meter (proportional allocation from transformer)
 */
export function calculateMeterLoss(
  meter: Meter,
  transformerEnergyDelivered: number,
  transformerTotalConsumption: number,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  // Proportional allocation of energy delivered based on consumption
  const proportion = transformerTotalConsumption > 0 
    ? meter.kwh / transformerTotalConsumption 
    : 0;
  const energyDelivered = Math.round(transformerEnergyDelivered * proportion);
  
  const technicalLossPercent = config.globalTechnicalLossPercent;
  const technicalLoss = Math.round(energyDelivered * (technicalLossPercent / 100));
  const nonTechnicalLoss = energyDelivered - meter.kwh - technicalLoss;
  const nonTechnicalLossPercent = energyDelivered > 0 
    ? (nonTechnicalLoss / energyDelivered) * 100 
    : 0;

  return {
    nodeId: meter.id,
    nodeName: `${meter.name} (${meter.premType})`,
    nodeType: 'meter',
    energyDelivered,
    customerSales: meter.kwh,
    technicalLossPercent,
    technicalLoss,
    nonTechnicalLoss,
    nonTechnicalLossPercent,
  };
}

/**
 * Aggregate losses from child nodes
 */
function aggregateLosses(
  children: LossCalculation[],
  nodeId: string,
  nodeName: string,
  nodeType: NodeType
): LossCalculation {
  const energyDelivered = children.reduce((sum, c) => sum + c.energyDelivered, 0);
  const customerSales = children.reduce((sum, c) => sum + c.customerSales, 0);
  const technicalLoss = children.reduce((sum, c) => sum + c.technicalLoss, 0);
  const nonTechnicalLoss = children.reduce((sum, c) => sum + c.nonTechnicalLoss, 0);
  
  // Weighted average of technical loss percent
  const technicalLossPercent = energyDelivered > 0 
    ? (technicalLoss / energyDelivered) * 100 
    : 0;
  
  const nonTechnicalLossPercent = energyDelivered > 0 
    ? (nonTechnicalLoss / energyDelivered) * 100 
    : 0;

  return {
    nodeId,
    nodeName,
    nodeType,
    energyDelivered,
    customerSales,
    technicalLossPercent,
    technicalLoss,
    nonTechnicalLoss,
    nonTechnicalLossPercent,
    children,
  };
}

/**
 * Calculate losses for a substation (aggregate from feeders)
 */
export function calculateSubstationLoss(
  substationId: string,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  const substation = nodeMap.get(substationId);
  if (!substation || substation.type !== 'substation') return null;

  const substationFeeders = feeders.filter(f => f.parentId === substationId);
  const feederLosses = substationFeeders
    .map(f => calculateFeederLoss(f.id, config, true)) // Include children (transformers & meters)
    .filter((l): l is LossCalculation => l !== null);

  return aggregateLosses(feederLosses, substationId, substation.name, 'substation');
}

/**
 * Calculate losses for a CNC (aggregate from substations)
 */
export function calculateCNCLoss(
  cncId: string,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  const cnc = nodeMap.get(cncId);
  if (!cnc || cnc.type !== 'cnc') return null;

  const cncSubstations = substations.filter(s => s.parentId === cncId);
  const substationLosses = cncSubstations
    .map(s => calculateSubstationLoss(s.id, config))
    .filter((l): l is LossCalculation => l !== null);

  return aggregateLosses(substationLosses, cncId, cnc.name, 'cnc');
}

/**
 * Calculate losses for a Sector (aggregate from CNCs)
 */
export function calculateSectorLoss(
  sectorId: string,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  const sector = nodeMap.get(sectorId);
  if (!sector || sector.type !== 'sector') return null;

  const sectorCNCs = cncs.filter(c => c.parentId === sectorId);
  const cncLosses = sectorCNCs
    .map(c => calculateCNCLoss(c.id, config))
    .filter((l): l is LossCalculation => l !== null);

  return aggregateLosses(cncLosses, sectorId, sector.name, 'sector');
}

/**
 * Calculate losses for a Zone (aggregate from Sectors)
 */
export function calculateZoneLoss(
  zoneId: string,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  const zone = nodeMap.get(zoneId);
  if (!zone || zone.type !== 'zone') return null;

  const zoneSectors = sectors.filter(s => s.parentId === zoneId);
  const sectorLosses = zoneSectors
    .map(s => calculateSectorLoss(s.id, config))
    .filter((l): l is LossCalculation => l !== null);

  return aggregateLosses(sectorLosses, zoneId, zone.name, 'zone');
}

/**
 * Calculate losses for the entire Operating Unit (aggregate from Zones)
 */
export function calculateOULoss(
  ouId: string,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  const ou = nodeMap.get(ouId);
  if (!ou || ou.type !== 'ou') return null;

  const ouZones = zones.filter(z => z.parentId === ouId);
  const zoneLosses = ouZones
    .map(z => calculateZoneLoss(z.id, config))
    .filter((l): l is LossCalculation => l !== null);

  return aggregateLosses(zoneLosses, ouId, ou.name, 'ou');
}

/**
 * Calculate losses for any node type
 */
export function calculateLossForNode(
  nodeId: string,
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  const node = nodeMap.get(nodeId);
  if (!node) return null;

  switch (node.type) {
    case 'ou':
      return calculateOULoss(nodeId, config);
    case 'zone':
      return calculateZoneLoss(nodeId, config);
    case 'sector':
      return calculateSectorLoss(nodeId, config);
    case 'cnc':
      return calculateCNCLoss(nodeId, config);
    case 'substation':
      return calculateSubstationLoss(nodeId, config);
    case 'feeder':
      return calculateFeederLoss(nodeId, config);
    default:
      return null;
  }
}

/**
 * Calculate losses for all feeders
 */
export function calculateAllFeederLosses(
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation[] {
  return feeders
    .map(f => calculateFeederLoss(f.id, config))
    .filter((l): l is LossCalculation => l !== null);
}

/**
 * Get the full loss hierarchy starting from the OU
 */
export function getFullLossHierarchy(
  config: CalculationConfig = DEFAULT_CONFIG
): LossCalculation | null {
  return calculateOULoss('ou-gauteng', config);
}

/**
 * Format kWh value for display
 */
export function formatKwh(kwh: number): string {
  if (kwh >= 1000000) {
    return `${(kwh / 1000000).toFixed(2)} GWh`;
  } else if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(1)} MWh`;
  }
  return `${kwh.toFixed(0)} kWh`;
}

/**
 * Format percentage for display
 */
export function formatPercent(percent: number): string {
  return `${percent.toFixed(2)}%`;
}

/**
 * Determine loss severity for conditional formatting
 */
export function getLossSeverity(ntlPercent: number): 'low' | 'medium' | 'high' | 'critical' {
  if (ntlPercent < 0) return 'low'; // Negative means surplus/gain
  if (ntlPercent < 5) return 'low';
  if (ntlPercent < 10) return 'medium';
  if (ntlPercent < 20) return 'high';
  return 'critical';
}
