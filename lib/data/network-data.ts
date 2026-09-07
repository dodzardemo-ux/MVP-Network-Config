// Mock network hierarchy data based on Gauteng SourceData_Network
// Subset of real data for MVP demonstration

import type { 
  NetworkNode, 
  OperatingUnit, 
  Zone, 
  Sector, 
  CNC, 
  Substation, 
  Feeder, 
  Transformer, 
  Meter 
} from '@/lib/types/network';

// Operating Unit
const gautengOU: OperatingUnit = {
  id: 'ou-gauteng',
  name: 'Gauteng Operating Unit',
  type: 'ou',
  parentId: null,
};

// Zones
const zones: Zone[] = [
  { id: 'zone-johannesburg', name: 'Johannesburg', type: 'zone', parentId: 'ou-gauteng' },
  { id: 'zone-vaal', name: 'Vaal', type: 'zone', parentId: 'ou-gauteng' },
  { id: 'zone-ekurhuleni', name: 'Ekurhuleni', type: 'zone', parentId: 'ou-gauteng' },
  { id: 'zone-tshwane', name: 'Tshwane', type: 'zone', parentId: 'ou-gauteng' },
];

// Sectors
const sectors: Sector[] = [
  // Johannesburg
  { id: 'sector-sandton', name: 'Sandton', type: 'sector', parentId: 'zone-johannesburg' },
  { id: 'sector-soweto', name: 'Soweto', type: 'sector', parentId: 'zone-johannesburg' },
  { id: 'sector-randburg', name: 'Randburg', type: 'sector', parentId: 'zone-johannesburg' },
  // Vaal
  { id: 'sector-sebokeng', name: 'Sebokeng', type: 'sector', parentId: 'zone-vaal' },
  { id: 'sector-vanderbijlpark', name: 'Vanderbijlpark', type: 'sector', parentId: 'zone-vaal' },
  // Ekurhuleni
  { id: 'sector-benoni', name: 'Benoni', type: 'sector', parentId: 'zone-ekurhuleni' },
  { id: 'sector-germiston', name: 'Germiston', type: 'sector', parentId: 'zone-ekurhuleni' },
  { id: 'sector-springs', name: 'Springs', type: 'sector', parentId: 'zone-ekurhuleni' },
  // Tshwane
  { id: 'sector-pretoria-north', name: 'Pretoria North', type: 'sector', parentId: 'zone-tshwane' },
  { id: 'sector-centurion', name: 'Centurion', type: 'sector', parentId: 'zone-tshwane' },
];

// CNCs (Customer Network Centers)
const cncs: CNC[] = [
  // Sandton
  { id: 'cnc-lanseria', name: 'Lanseria', type: 'cnc', parentId: 'sector-sandton' },
  { id: 'cnc-fourways', name: 'Fourways', type: 'cnc', parentId: 'sector-sandton' },
  // Soweto
  { id: 'cnc-orlando', name: 'Orlando', type: 'cnc', parentId: 'sector-soweto' },
  { id: 'cnc-diepkloof', name: 'Diepkloof', type: 'cnc', parentId: 'sector-soweto' },
  // Randburg
  { id: 'cnc-northcliff', name: 'Northcliff', type: 'cnc', parentId: 'sector-randburg' },
  // Sebokeng
  { id: 'cnc-evaton', name: 'Evaton', type: 'cnc', parentId: 'sector-sebokeng' },
  // Vanderbijlpark
  { id: 'cnc-bophelong', name: 'Bophelong', type: 'cnc', parentId: 'sector-vanderbijlpark' },
  // Benoni
  { id: 'cnc-daveyton', name: 'Daveyton', type: 'cnc', parentId: 'sector-benoni' },
  // Germiston
  { id: 'cnc-primrose', name: 'Primrose', type: 'cnc', parentId: 'sector-germiston' },
  // Springs
  { id: 'cnc-kwa-thema', name: 'Kwa-Thema', type: 'cnc', parentId: 'sector-springs' },
  // Pretoria North
  { id: 'cnc-akasia', name: 'Akasia', type: 'cnc', parentId: 'sector-pretoria-north' },
  // Centurion
  { id: 'cnc-highveld', name: 'Highveld', type: 'cnc', parentId: 'sector-centurion' },
];

// Substations
const substations: Substation[] = [
  // Lanseria CNC
  { id: 'sub-lanseria-main', name: 'Lanseria Main Substation', type: 'substation', parentId: 'cnc-lanseria' },
  { id: 'sub-lanseria-north', name: 'Lanseria North Substation', type: 'substation', parentId: 'cnc-lanseria' },
  // Fourways CNC
  { id: 'sub-fourways-main', name: 'Fourways Main Substation', type: 'substation', parentId: 'cnc-fourways' },
  // Orlando CNC
  { id: 'sub-orlando-main', name: 'Orlando Main Substation', type: 'substation', parentId: 'cnc-orlando' },
  { id: 'sub-orlando-west', name: 'Orlando West Substation', type: 'substation', parentId: 'cnc-orlando' },
  // Diepkloof CNC
  { id: 'sub-diepkloof-main', name: 'Diepkloof Main Substation', type: 'substation', parentId: 'cnc-diepkloof' },
  // Northcliff CNC
  { id: 'sub-northcliff-main', name: 'Northcliff Main Substation', type: 'substation', parentId: 'cnc-northcliff' },
  // Evaton CNC
  { id: 'sub-evaton-main', name: 'Evaton Main Substation', type: 'substation', parentId: 'cnc-evaton' },
  // Bophelong CNC
  { id: 'sub-bophelong-main', name: 'Bophelong Main Substation', type: 'substation', parentId: 'cnc-bophelong' },
  // Daveyton CNC
  { id: 'sub-daveyton-main', name: 'Daveyton Main Substation', type: 'substation', parentId: 'cnc-daveyton' },
  // Primrose CNC
  { id: 'sub-primrose-main', name: 'Primrose Main Substation', type: 'substation', parentId: 'cnc-primrose' },
  // Kwa-Thema CNC
  { id: 'sub-kwa-thema-main', name: 'Kwa-Thema Main Substation', type: 'substation', parentId: 'cnc-kwa-thema' },
  // Akasia CNC
  { id: 'sub-akasia-main', name: 'Akasia Main Substation', type: 'substation', parentId: 'cnc-akasia' },
  // Highveld CNC
  { id: 'sub-highveld-main', name: 'Highveld Main Substation', type: 'substation', parentId: 'cnc-highveld' },
];

// Feeders (with Stats Meters)
const feeders: Feeder[] = [
  // Lanseria Main Substation
  { id: 'fdr-lanseria-1', name: 'Lanseria Feeder 1', type: 'feeder', parentId: 'sub-lanseria-main', statsMeterName: 'LANS_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-lanseria-2', name: 'Lanseria Feeder 2', type: 'feeder', parentId: 'sub-lanseria-main', statsMeterName: 'LANS_FDR2_MV90', technicalLossPercent: 10 },
  { id: 'fdr-lanseria-3', name: 'Lanseria Feeder 3', type: 'feeder', parentId: 'sub-lanseria-main', statsMeterName: 'LANS_FDR3_MV90', technicalLossPercent: 10 },
  // Lanseria North Substation
  { id: 'fdr-lanseria-n1', name: 'Lanseria North Feeder 1', type: 'feeder', parentId: 'sub-lanseria-north', statsMeterName: 'LANS_N_FDR1_MV90', technicalLossPercent: 10 },
  // Fourways Main Substation
  { id: 'fdr-fourways-1', name: 'Fourways Feeder 1', type: 'feeder', parentId: 'sub-fourways-main', statsMeterName: 'FOUR_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-fourways-2', name: 'Fourways Feeder 2', type: 'feeder', parentId: 'sub-fourways-main', statsMeterName: 'FOUR_FDR2_MV90', technicalLossPercent: 10 },
  // Orlando Main Substation
  { id: 'fdr-orlando-1', name: 'Orlando Feeder 1', type: 'feeder', parentId: 'sub-orlando-main', statsMeterName: 'ORLA_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-orlando-2', name: 'Orlando Feeder 2', type: 'feeder', parentId: 'sub-orlando-main', statsMeterName: 'ORLA_FDR2_MV90', technicalLossPercent: 10 },
  { id: 'fdr-orlando-3', name: 'Orlando Feeder 3', type: 'feeder', parentId: 'sub-orlando-main', statsMeterName: 'ORLA_FDR3_MV90', technicalLossPercent: 10 },
  // Orlando West Substation
  { id: 'fdr-orlando-w1', name: 'Orlando West Feeder 1', type: 'feeder', parentId: 'sub-orlando-west', statsMeterName: 'ORLA_W_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-orlando-w2', name: 'Orlando West Feeder 2', type: 'feeder', parentId: 'sub-orlando-west', statsMeterName: 'ORLA_W_FDR2_MV90', technicalLossPercent: 10 },
  // Diepkloof Main Substation
  { id: 'fdr-diepkloof-1', name: 'Diepkloof Feeder 1', type: 'feeder', parentId: 'sub-diepkloof-main', statsMeterName: 'DIEP_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-diepkloof-2', name: 'Diepkloof Feeder 2', type: 'feeder', parentId: 'sub-diepkloof-main', statsMeterName: 'DIEP_FDR2_MV90', technicalLossPercent: 10 },
  // Northcliff Main Substation
  { id: 'fdr-northcliff-1', name: 'Northcliff Feeder 1', type: 'feeder', parentId: 'sub-northcliff-main', statsMeterName: 'NORT_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-northcliff-2', name: 'Northcliff Feeder 2', type: 'feeder', parentId: 'sub-northcliff-main', statsMeterName: 'NORT_FDR2_MV90', technicalLossPercent: 10 },
  // Evaton Main Substation
  { id: 'fdr-evaton-1', name: 'Evaton Feeder 1', type: 'feeder', parentId: 'sub-evaton-main', statsMeterName: 'EVAT_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-evaton-2', name: 'Evaton Feeder 2', type: 'feeder', parentId: 'sub-evaton-main', statsMeterName: 'EVAT_FDR2_MV90', technicalLossPercent: 10 },
  // Bophelong Main Substation
  { id: 'fdr-bophelong-1', name: 'Bophelong Feeder 1', type: 'feeder', parentId: 'sub-bophelong-main', statsMeterName: 'BOPH_FDR1_MV90', technicalLossPercent: 10 },
  // Daveyton Main Substation
  { id: 'fdr-daveyton-1', name: 'Daveyton Feeder 1', type: 'feeder', parentId: 'sub-daveyton-main', statsMeterName: 'DAVE_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-daveyton-2', name: 'Daveyton Feeder 2', type: 'feeder', parentId: 'sub-daveyton-main', statsMeterName: 'DAVE_FDR2_MV90', technicalLossPercent: 10 },
  // Primrose Main Substation
  { id: 'fdr-primrose-1', name: 'Primrose Feeder 1', type: 'feeder', parentId: 'sub-primrose-main', statsMeterName: 'PRIM_FDR1_MV90', technicalLossPercent: 10 },
  // Kwa-Thema Main Substation
  { id: 'fdr-kwa-thema-1', name: 'Kwa-Thema Feeder 1', type: 'feeder', parentId: 'sub-kwa-thema-main', statsMeterName: 'KWAT_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-kwa-thema-2', name: 'Kwa-Thema Feeder 2', type: 'feeder', parentId: 'sub-kwa-thema-main', statsMeterName: 'KWAT_FDR2_MV90', technicalLossPercent: 10 },
  // Akasia Main Substation
  { id: 'fdr-akasia-1', name: 'Akasia Feeder 1', type: 'feeder', parentId: 'sub-akasia-main', statsMeterName: 'AKAS_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-akasia-2', name: 'Akasia Feeder 2', type: 'feeder', parentId: 'sub-akasia-main', statsMeterName: 'AKAS_FDR2_MV90', technicalLossPercent: 10 },
  // Highveld Main Substation
  { id: 'fdr-highveld-1', name: 'Highveld Feeder 1', type: 'feeder', parentId: 'sub-highveld-main', statsMeterName: 'HIGH_FDR1_MV90', technicalLossPercent: 10 },
  { id: 'fdr-highveld-2', name: 'Highveld Feeder 2', type: 'feeder', parentId: 'sub-highveld-main', statsMeterName: 'HIGH_FDR2_MV90', technicalLossPercent: 10 },
];

// Transformers
const transformers: Transformer[] = [
  // Lanseria Feeder 1
  { id: 'tx-lanseria-1-a', name: 'TX-LANS-1A', type: 'transformer', parentId: 'fdr-lanseria-1', code: 'LANS001A' },
  { id: 'tx-lanseria-1-b', name: 'TX-LANS-1B', type: 'transformer', parentId: 'fdr-lanseria-1', code: 'LANS001B' },
  { id: 'tx-lanseria-1-c', name: 'TX-LANS-1C', type: 'transformer', parentId: 'fdr-lanseria-1', code: 'LANS001C' },
  // Lanseria Feeder 2
  { id: 'tx-lanseria-2-a', name: 'TX-LANS-2A', type: 'transformer', parentId: 'fdr-lanseria-2', code: 'LANS002A' },
  { id: 'tx-lanseria-2-b', name: 'TX-LANS-2B', type: 'transformer', parentId: 'fdr-lanseria-2', code: 'LANS002B' },
  // Lanseria Feeder 3
  { id: 'tx-lanseria-3-a', name: 'TX-LANS-3A', type: 'transformer', parentId: 'fdr-lanseria-3', code: 'LANS003A' },
  { id: 'tx-lanseria-3-b', name: 'TX-LANS-3B', type: 'transformer', parentId: 'fdr-lanseria-3', code: 'LANS003B' },
  // Lanseria North Feeder 1
  { id: 'tx-lanseria-n1-a', name: 'TX-LANS-N1A', type: 'transformer', parentId: 'fdr-lanseria-n1', code: 'LANSN01A' },
  // Fourways Feeder 1
  { id: 'tx-fourways-1-a', name: 'TX-FOUR-1A', type: 'transformer', parentId: 'fdr-fourways-1', code: 'FOUR001A' },
  { id: 'tx-fourways-1-b', name: 'TX-FOUR-1B', type: 'transformer', parentId: 'fdr-fourways-1', code: 'FOUR001B' },
  { id: 'tx-fourways-1-c', name: 'TX-FOUR-1C', type: 'transformer', parentId: 'fdr-fourways-1', code: 'FOUR001C' },
  // Fourways Feeder 2
  { id: 'tx-fourways-2-a', name: 'TX-FOUR-2A', type: 'transformer', parentId: 'fdr-fourways-2', code: 'FOUR002A' },
  { id: 'tx-fourways-2-b', name: 'TX-FOUR-2B', type: 'transformer', parentId: 'fdr-fourways-2', code: 'FOUR002B' },
  // Orlando Feeder 1
  { id: 'tx-orlando-1-a', name: 'TX-ORLA-1A', type: 'transformer', parentId: 'fdr-orlando-1', code: 'ORLA001A' },
  { id: 'tx-orlando-1-b', name: 'TX-ORLA-1B', type: 'transformer', parentId: 'fdr-orlando-1', code: 'ORLA001B' },
  { id: 'tx-orlando-1-c', name: 'TX-ORLA-1C', type: 'transformer', parentId: 'fdr-orlando-1', code: 'ORLA001C' },
  { id: 'tx-orlando-1-d', name: 'TX-ORLA-1D', type: 'transformer', parentId: 'fdr-orlando-1', code: 'ORLA001D' },
  // Orlando Feeder 2
  { id: 'tx-orlando-2-a', name: 'TX-ORLA-2A', type: 'transformer', parentId: 'fdr-orlando-2', code: 'ORLA002A' },
  { id: 'tx-orlando-2-b', name: 'TX-ORLA-2B', type: 'transformer', parentId: 'fdr-orlando-2', code: 'ORLA002B' },
  { id: 'tx-orlando-2-c', name: 'TX-ORLA-2C', type: 'transformer', parentId: 'fdr-orlando-2', code: 'ORLA002C' },
  // Orlando Feeder 3
  { id: 'tx-orlando-3-a', name: 'TX-ORLA-3A', type: 'transformer', parentId: 'fdr-orlando-3', code: 'ORLA003A' },
  { id: 'tx-orlando-3-b', name: 'TX-ORLA-3B', type: 'transformer', parentId: 'fdr-orlando-3', code: 'ORLA003B' },
  // Orlando West Feeder 1
  { id: 'tx-orlando-w1-a', name: 'TX-ORLA-W1A', type: 'transformer', parentId: 'fdr-orlando-w1', code: 'ORLAW01A' },
  { id: 'tx-orlando-w1-b', name: 'TX-ORLA-W1B', type: 'transformer', parentId: 'fdr-orlando-w1', code: 'ORLAW01B' },
  // Orlando West Feeder 2
  { id: 'tx-orlando-w2-a', name: 'TX-ORLA-W2A', type: 'transformer', parentId: 'fdr-orlando-w2', code: 'ORLAW02A' },
  // Diepkloof Feeder 1
  { id: 'tx-diepkloof-1-a', name: 'TX-DIEP-1A', type: 'transformer', parentId: 'fdr-diepkloof-1', code: 'DIEP001A' },
  { id: 'tx-diepkloof-1-b', name: 'TX-DIEP-1B', type: 'transformer', parentId: 'fdr-diepkloof-1', code: 'DIEP001B' },
  { id: 'tx-diepkloof-1-c', name: 'TX-DIEP-1C', type: 'transformer', parentId: 'fdr-diepkloof-1', code: 'DIEP001C' },
  // Diepkloof Feeder 2
  { id: 'tx-diepkloof-2-a', name: 'TX-DIEP-2A', type: 'transformer', parentId: 'fdr-diepkloof-2', code: 'DIEP002A' },
  { id: 'tx-diepkloof-2-b', name: 'TX-DIEP-2B', type: 'transformer', parentId: 'fdr-diepkloof-2', code: 'DIEP002B' },
  // Northcliff Feeder 1
  { id: 'tx-northcliff-1-a', name: 'TX-NORT-1A', type: 'transformer', parentId: 'fdr-northcliff-1', code: 'NORT001A' },
  { id: 'tx-northcliff-1-b', name: 'TX-NORT-1B', type: 'transformer', parentId: 'fdr-northcliff-1', code: 'NORT001B' },
  // Northcliff Feeder 2
  { id: 'tx-northcliff-2-a', name: 'TX-NORT-2A', type: 'transformer', parentId: 'fdr-northcliff-2', code: 'NORT002A' },
  // Evaton Feeder 1
  { id: 'tx-evaton-1-a', name: 'TX-EVAT-1A', type: 'transformer', parentId: 'fdr-evaton-1', code: 'EVAT001A' },
  { id: 'tx-evaton-1-b', name: 'TX-EVAT-1B', type: 'transformer', parentId: 'fdr-evaton-1', code: 'EVAT001B' },
  { id: 'tx-evaton-1-c', name: 'TX-EVAT-1C', type: 'transformer', parentId: 'fdr-evaton-1', code: 'EVAT001C' },
  // Evaton Feeder 2
  { id: 'tx-evaton-2-a', name: 'TX-EVAT-2A', type: 'transformer', parentId: 'fdr-evaton-2', code: 'EVAT002A' },
  { id: 'tx-evaton-2-b', name: 'TX-EVAT-2B', type: 'transformer', parentId: 'fdr-evaton-2', code: 'EVAT002B' },
  // Bophelong Feeder 1
  { id: 'tx-bophelong-1-a', name: 'TX-BOPH-1A', type: 'transformer', parentId: 'fdr-bophelong-1', code: 'BOPH001A' },
  { id: 'tx-bophelong-1-b', name: 'TX-BOPH-1B', type: 'transformer', parentId: 'fdr-bophelong-1', code: 'BOPH001B' },
  // Daveyton Feeder 1
  { id: 'tx-daveyton-1-a', name: 'TX-DAVE-1A', type: 'transformer', parentId: 'fdr-daveyton-1', code: 'DAVE001A' },
  { id: 'tx-daveyton-1-b', name: 'TX-DAVE-1B', type: 'transformer', parentId: 'fdr-daveyton-1', code: 'DAVE001B' },
  { id: 'tx-daveyton-1-c', name: 'TX-DAVE-1C', type: 'transformer', parentId: 'fdr-daveyton-1', code: 'DAVE001C' },
  // Daveyton Feeder 2
  { id: 'tx-daveyton-2-a', name: 'TX-DAVE-2A', type: 'transformer', parentId: 'fdr-daveyton-2', code: 'DAVE002A' },
  { id: 'tx-daveyton-2-b', name: 'TX-DAVE-2B', type: 'transformer', parentId: 'fdr-daveyton-2', code: 'DAVE002B' },
  // Primrose Feeder 1
  { id: 'tx-primrose-1-a', name: 'TX-PRIM-1A', type: 'transformer', parentId: 'fdr-primrose-1', code: 'PRIM001A' },
  { id: 'tx-primrose-1-b', name: 'TX-PRIM-1B', type: 'transformer', parentId: 'fdr-primrose-1', code: 'PRIM001B' },
  // Kwa-Thema Feeder 1
  { id: 'tx-kwa-thema-1-a', name: 'TX-KWAT-1A', type: 'transformer', parentId: 'fdr-kwa-thema-1', code: 'KWAT001A' },
  { id: 'tx-kwa-thema-1-b', name: 'TX-KWAT-1B', type: 'transformer', parentId: 'fdr-kwa-thema-1', code: 'KWAT001B' },
  { id: 'tx-kwa-thema-1-c', name: 'TX-KWAT-1C', type: 'transformer', parentId: 'fdr-kwa-thema-1', code: 'KWAT001C' },
  // Kwa-Thema Feeder 2
  { id: 'tx-kwa-thema-2-a', name: 'TX-KWAT-2A', type: 'transformer', parentId: 'fdr-kwa-thema-2', code: 'KWAT002A' },
  { id: 'tx-kwa-thema-2-b', name: 'TX-KWAT-2B', type: 'transformer', parentId: 'fdr-kwa-thema-2', code: 'KWAT002B' },
  // Akasia Feeder 1
  { id: 'tx-akasia-1-a', name: 'TX-AKAS-1A', type: 'transformer', parentId: 'fdr-akasia-1', code: 'AKAS001A' },
  { id: 'tx-akasia-1-b', name: 'TX-AKAS-1B', type: 'transformer', parentId: 'fdr-akasia-1', code: 'AKAS001B' },
  // Akasia Feeder 2
  { id: 'tx-akasia-2-a', name: 'TX-AKAS-2A', type: 'transformer', parentId: 'fdr-akasia-2', code: 'AKAS002A' },
  // Highveld Feeder 1
  { id: 'tx-highveld-1-a', name: 'TX-HIGH-1A', type: 'transformer', parentId: 'fdr-highveld-1', code: 'HIGH001A' },
  { id: 'tx-highveld-1-b', name: 'TX-HIGH-1B', type: 'transformer', parentId: 'fdr-highveld-1', code: 'HIGH001B' },
  // Highveld Feeder 2
  { id: 'tx-highveld-2-a', name: 'TX-HIGH-2A', type: 'transformer', parentId: 'fdr-highveld-2', code: 'HIGH002A' },
  { id: 'tx-highveld-2-b', name: 'TX-HIGH-2B', type: 'transformer', parentId: 'fdr-highveld-2', code: 'HIGH002B' },
];

// Deterministic pseudo-random generator based on a string seed.
// Ensures identical meter data on server and client (prevents hydration mismatch).
function meterSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

// Helper to generate meters for a transformer
function generateMeters(
  transformerId: string, 
  transformerCode: string, 
  count: number, 
  baseAddress: string,
  premTypes: ('SPU' | 'LPU' | 'PPU')[]
): Meter[] {
  const meters: Meter[] = [];
  for (let i = 1; i <= count; i++) {
    // Deterministic pseudo-random based on meter code so server/client match
    const meterCode = `${transformerCode}-${i.toString().padStart(3, '0')}`;
    const r1 = meterSeed(meterCode + '-type');
    const r2 = meterSeed(meterCode + '-var');
    const r3 = meterSeed(meterCode + '-est');
    const premType = premTypes[Math.floor(r1 * premTypes.length)];
    const baseKwh = premType === 'LPU' ? 5000 : premType === 'SPU' ? 800 : 400;
    const variance = r2 * 0.4 - 0.2; // +/- 20%
    meters.push({
      id: `meter-${transformerCode}-${i.toString().padStart(3, '0')}`,
      name: `Meter ${transformerCode}-${i.toString().padStart(3, '0')}`,
      type: 'meter',
      parentId: transformerId,
      premId: `PREM-${transformerCode}-${i.toString().padStart(3, '0')}`,
      acctId: `ACCT-${transformerCode}-${i.toString().padStart(3, '0')}`,
      address: `${i} ${baseAddress}`,
      premType,
      kwh: Math.round(baseKwh * (1 + variance)),
      isEstimate: r3 > 0.85, // 15% are estimates
    });
  }
  return meters;
}

// Generate meters for all transformers
const meters: Meter[] = [
  // Lanseria area (more LPU - commercial area)
  ...generateMeters('tx-lanseria-1-a', 'LANS001A', 8, 'Lanseria Rd', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-lanseria-1-b', 'LANS001B', 6, 'Pelindaba Rd', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-lanseria-1-c', 'LANS001C', 10, 'Falcon Dr', ['SPU', 'LPU', 'LPU']),
  ...generateMeters('tx-lanseria-2-a', 'LANS002A', 7, 'Airport Ave', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-lanseria-2-b', 'LANS002B', 5, 'Hangar St', ['LPU', 'LPU']),
  ...generateMeters('tx-lanseria-3-a', 'LANS003A', 6, 'Runway Rd', ['SPU', 'LPU']),
  ...generateMeters('tx-lanseria-3-b', 'LANS003B', 8, 'Tower Ln', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-lanseria-n1-a', 'LANSN01A', 5, 'North Gate', ['SPU', 'LPU']),
  // Fourways area (mixed residential/commercial)
  ...generateMeters('tx-fourways-1-a', 'FOUR001A', 12, 'William Nicol Dr', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-fourways-1-b', 'FOUR001B', 10, 'Witkoppen Rd', ['SPU', 'SPU', 'SPU']),
  ...generateMeters('tx-fourways-1-c', 'FOUR001C', 8, 'Fourways Blvd', ['SPU', 'LPU', 'LPU']),
  ...generateMeters('tx-fourways-2-a', 'FOUR002A', 9, 'Monte Casino Blvd', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-fourways-2-b', 'FOUR002B', 7, 'Cedar Rd', ['SPU', 'SPU', 'SPU']),
  // Orlando area (high PPU - prepaid users)
  ...generateMeters('tx-orlando-1-a', 'ORLA001A', 15, 'Vilakazi St', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-1-b', 'ORLA001B', 12, 'Moema St', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-1-c', 'ORLA001C', 14, 'Maseko Rd', ['PPU', 'PPU', 'SPU']),
  ...generateMeters('tx-orlando-1-d', 'ORLA001D', 10, 'Khumalo St', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-2-a', 'ORLA002A', 13, 'Kumalo Ave', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-2-b', 'ORLA002B', 11, 'Dube St', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-2-c', 'ORLA002C', 9, 'Jabavu Dr', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-3-a', 'ORLA003A', 8, 'Mzimhlophe St', ['PPU', 'PPU', 'SPU']),
  ...generateMeters('tx-orlando-3-b', 'ORLA003B', 10, 'Phefeni Rd', ['PPU', 'PPU', 'PPU']),
  // Orlando West (high PPU)
  ...generateMeters('tx-orlando-w1-a', 'ORLAW01A', 12, 'Ngakane St', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-w1-b', 'ORLAW01B', 11, 'Sofasonke St', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-orlando-w2-a', 'ORLAW02A', 9, 'Mofolo North', ['PPU', 'PPU', 'PPU']),
  // Diepkloof (high PPU)
  ...generateMeters('tx-diepkloof-1-a', 'DIEP001A', 14, 'Immink Dr', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-diepkloof-1-b', 'DIEP001B', 12, 'Zone 1 St', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-diepkloof-1-c', 'DIEP001C', 10, 'Zone 2 St', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-diepkloof-2-a', 'DIEP002A', 11, 'Zone 3 St', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-diepkloof-2-b', 'DIEP002B', 9, 'Zone 4 St', ['PPU', 'PPU', 'PPU']),
  // Northcliff (residential)
  ...generateMeters('tx-northcliff-1-a', 'NORT001A', 8, 'Doreen Rd', ['SPU', 'SPU', 'SPU']),
  ...generateMeters('tx-northcliff-1-b', 'NORT001B', 7, 'Doreen Ext', ['SPU', 'SPU', 'SPU']),
  ...generateMeters('tx-northcliff-2-a', 'NORT002A', 6, 'Weltevreden Rd', ['SPU', 'SPU', 'LPU']),
  // Evaton (mixed PPU/SPU)
  ...generateMeters('tx-evaton-1-a', 'EVAT001A', 10, 'Evaton Main St', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-evaton-1-b', 'EVAT001B', 12, 'Evaton North', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-evaton-1-c', 'EVAT001C', 8, 'Evaton South', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-evaton-2-a', 'EVAT002A', 9, 'Palm Springs', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-evaton-2-b', 'EVAT002B', 7, 'Small Farms', ['SPU', 'SPU', 'PPU']),
  // Bophelong (high PPU)
  ...generateMeters('tx-bophelong-1-a', 'BOPH001A', 14, 'Bophelong Main', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-bophelong-1-b', 'BOPH001B', 12, 'Bophelong Ext', ['PPU', 'PPU', 'SPU']),
  // Daveyton (mixed)
  ...generateMeters('tx-daveyton-1-a', 'DAVE001A', 11, 'Etwatwa Main', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-daveyton-1-b', 'DAVE001B', 10, 'Etwatwa East', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-daveyton-1-c', 'DAVE001C', 9, 'Etwatwa West', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-daveyton-2-a', 'DAVE002A', 8, 'Barcelona', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-daveyton-2-b', 'DAVE002B', 7, 'Chris Hani', ['SPU', 'PPU', 'PPU']),
  // Primrose (residential)
  ...generateMeters('tx-primrose-1-a', 'PRIM001A', 9, 'Primrose Hill', ['SPU', 'SPU', 'SPU']),
  ...generateMeters('tx-primrose-1-b', 'PRIM001B', 8, 'Primrose Glen', ['SPU', 'SPU', 'LPU']),
  // Kwa-Thema (high PPU)
  ...generateMeters('tx-kwa-thema-1-a', 'KWAT001A', 13, 'Kwa-Thema Main', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-kwa-thema-1-b', 'KWAT001B', 11, 'Kwa-Thema North', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-kwa-thema-1-c', 'KWAT001C', 10, 'Kwa-Thema South', ['PPU', 'PPU', 'PPU']),
  ...generateMeters('tx-kwa-thema-2-a', 'KWAT002A', 9, 'Kwa-Thema East', ['SPU', 'PPU', 'PPU']),
  ...generateMeters('tx-kwa-thema-2-b', 'KWAT002B', 8, 'Kwa-Thema West', ['PPU', 'PPU', 'PPU']),
  // Akasia (suburban)
  ...generateMeters('tx-akasia-1-a', 'AKAS001A', 7, 'Akasia Main', ['SPU', 'SPU', 'SPU']),
  ...generateMeters('tx-akasia-1-b', 'AKAS001B', 8, 'Akasia North', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-akasia-2-a', 'AKAS002A', 6, 'Akasia Gardens', ['SPU', 'SPU', 'SPU']),
  // Highveld (mixed)
  ...generateMeters('tx-highveld-1-a', 'HIGH001A', 9, 'Highveld Park', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-highveld-1-b', 'HIGH001B', 8, 'Highveld Ridge', ['SPU', 'SPU', 'SPU']),
  ...generateMeters('tx-highveld-2-a', 'HIGH002A', 7, 'Highveld Ext', ['SPU', 'SPU', 'LPU']),
  ...generateMeters('tx-highveld-2-b', 'HIGH002B', 6, 'Highveld Glen', ['SPU', 'SPU', 'SPU']),
];

// Combine all nodes
export const allNodes: NetworkNode[] = [
  gautengOU,
  ...zones,
  ...sectors,
  ...cncs,
  ...substations,
  ...feeders,
  ...transformers,
  ...meters,
];

// Create a Map for quick lookup
export const nodeMap = new Map<string, NetworkNode>(
  allNodes.map(node => [node.id, node])
);

// Helper functions
export function getChildren(parentId: string): NetworkNode[] {
  return allNodes.filter(node => node.parentId === parentId);
}

export function getNodesByType<T extends NetworkNode>(type: NodeType): T[] {
  return allNodes.filter(node => node.type === type) as T[];
}

export function getParentChain(nodeId: string): NetworkNode[] {
  const chain: NetworkNode[] = [];
  let currentNode = nodeMap.get(nodeId);
  
  while (currentNode) {
    chain.unshift(currentNode);
    if (currentNode.parentId) {
      currentNode = nodeMap.get(currentNode.parentId);
    } else {
      break;
    }
  }
  
  return chain;
}

export function getAllDescendants(nodeId: string): NetworkNode[] {
  const descendants: NetworkNode[] = [];
  const children = getChildren(nodeId);
  
  for (const child of children) {
    descendants.push(child);
    descendants.push(...getAllDescendants(child.id));
  }
  
  return descendants;
}

// Export individual collections for convenience
export { gautengOU, zones, sectors, cncs, substations, feeders, transformers, meters };
