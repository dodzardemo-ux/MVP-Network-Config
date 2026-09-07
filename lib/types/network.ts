// Network hierarchy types for Feeder Balancing Module

export type NodeType = 
  | 'ou' 
  | 'zone' 
  | 'sector' 
  | 'cnc' 
  | 'substation' 
  | 'feeder' 
  | 'transformer' 
  | 'meter'
  | 'cluster';

export interface BaseNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
}

// Operating Unit (Top level - e.g., Gauteng)
export interface OperatingUnit extends BaseNode {
  type: 'ou';
  parentId: null;
}

// Zone (e.g., Johannesburg, Vaal, Ekurhuleni, Tshwane)
export interface Zone extends BaseNode {
  type: 'zone';
}

// Sector (e.g., Sandton, Soweto, Benoni)
export interface Sector extends BaseNode {
  type: 'sector';
}

// Customer Network Center
export interface CNC extends BaseNode {
  type: 'cnc';
}

// Substation / Switch Station
export interface Substation extends BaseNode {
  type: 'substation';
}

// Feeder (MV Line with Stats Meter)
export interface Feeder extends BaseNode {
  type: 'feeder';
  statsMeterName: string; // Links to MV90 data
  technicalLossPercent: number; // Default 10%, can be overridden
}

// Transformer
export interface Transformer extends BaseNode {
  type: 'transformer';
  code: string; // Transformer code for linking to meters
}

// Meter / Account
export interface Meter extends BaseNode {
  type: 'meter';
  premId: string; // Premise ID
  acctId: string; // Account ID
  address: string;
  premType: 'SPU' | 'LPU' | 'PPU'; // Small Power User / Large Power User / Prepaid User
  kwh: number; // Monthly consumption
  isEstimate: boolean; // Actual vs Estimate reading
}

// Cluster - a grouping container created by dragging one same-type node onto another.
// A meter-cluster lives under a transformer and groups meters.
// A feeder-cluster lives under a substation and groups feeders.
export interface Cluster extends BaseNode {
  type: 'cluster';
  memberType: 'meter' | 'feeder'; // The type of nodes this cluster groups
}

export type NetworkNode = 
  | OperatingUnit 
  | Zone 
  | Sector 
  | CNC 
  | Substation 
  | Feeder 
  | Transformer 
  | Meter
  | Cluster;

// Energy data types
export interface EnergyDelivered {
  feederId: string;
  statsMeterName: string;
  energyDelivered: number; // kWh
  date: string;
}

export interface CustomerConsumption {
  meterId: string;
  transformerId: string;
  kwh: number;
  premType: 'SPU' | 'LPU' | 'PPU';
}

export interface PPUAllocation {
  transformerId: string;
  kwh: number;
  customerCount: number;
  buyingCustomerCount: number;
}

export interface CDUAllocation {
  glDivision: string;
  cduCode: string;
  cduKwh: number;
}

export interface CDUFeederMap {
  feederId: string;
  cduCode: string;
  percentAlloc: number;
}

// Loss calculation types
export interface LossCalculation {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  energyDelivered: number;
  customerSales: number;
  technicalLossPercent: number;
  technicalLoss: number;
  nonTechnicalLoss: number;
  nonTechnicalLossPercent: number;
  children?: LossCalculation[];
}

// Network configuration state
export interface NetworkConfig {
  nodes: Map<string, NetworkNode>;
  energyDelivered: Map<string, number>; // feederId -> kWh
  customerConsumption: Map<string, number>; // meterId -> kWh
  ppuAllocations: Map<string, PPUAllocation>; // transformerId -> allocation
  cduAllocations: CDUFeederMap[];
  globalTechnicalLossPercent: number;
  feederTechnicalLossOverrides: Map<string, number>; // feederId -> percent
  kwhAdjustments: Map<string, number>; // nodeId -> adjustment (+/-)
}

// Action types for state management
export type NetworkAction =
  | { type: 'MOVE_NODE'; nodeId: string; newParentId: string }
  | { type: 'SET_TECHNICAL_LOSS_PERCENT'; percent: number }
  | { type: 'SET_FEEDER_TECHNICAL_LOSS'; feederId: string; percent: number }
  | { type: 'ADJUST_KWH'; nodeId: string; adjustment: number }
  | { type: 'ALLOCATE_CDU'; feederId: string; cduCode: string; percent: number }
  | { type: 'RESET_CONFIG' };
