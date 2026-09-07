'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { NetworkNode, NetworkAction, LossCalculation, NodeType } from '@/lib/types/network';
import { allNodes, nodeMap as initialNodeMap, getChildren } from '@/lib/data/network-data';
import { 
  getFullLossHierarchy, 
  calculateLossForNode,
  type CalculationConfig 
} from '@/lib/calculations/loss-calculator';

// Walk up the parent chain to find the nearest ancestor of a given type.
// Used to enforce "same substation" move/cluster rules on the mapping canvas.
function findAncestorOfType(
  nodes: Map<string, NetworkNode>,
  nodeId: string,
  type: NodeType,
): string | null {
  let current: NetworkNode | undefined = nodes.get(nodeId);
  while (current) {
    if (current.type === type) return current.id;
    current = current.parentId ? nodes.get(current.parentId) : undefined;
  }
  return null;
}

interface NetworkState {
  nodes: Map<string, NetworkNode>;
  selectedNodeId: string | null;
  globalTechnicalLossPercent: number;
  feederOverrides: Map<string, number>;
  kwhAdjustments: Map<string, number>;
  includeCDU: boolean;
  lossResults: LossCalculation | null;
  isCalculating: boolean;
  recentlyMovedNodeId: string | null; // Track the most recently moved node
  highlightedPath: Set<string>; // IDs of nodes in the highlight path
}

type Action =
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'MOVE_NODE'; nodeId: string; newParentId: string }
  | { type: 'CREATE_CLUSTER'; draggedId: string; targetId: string }
  | { type: 'DISSOLVE_CLUSTER'; clusterId: string }
  | { type: 'SET_GLOBAL_TECH_LOSS'; percent: number }
  | { type: 'SET_FEEDER_TECH_LOSS'; feederId: string; percent: number }
  | { type: 'CLEAR_FEEDER_OVERRIDE'; feederId: string }
  | { type: 'ADJUST_KWH'; nodeId: string; key: string; adjustment: number }
  | { type: 'TOGGLE_CDU'; enabled: boolean }
  | { type: 'SET_LOSS_RESULTS'; results: LossCalculation | null }
  | { type: 'SET_CALCULATING'; calculating: boolean }
  | { type: 'CLEAR_HIGHLIGHT' }
  | { type: 'RESET_CONFIG' };

const initialState: NetworkState = {
  nodes: new Map(allNodes.map(n => [n.id, { ...n }])),
  selectedNodeId: 'ou-gauteng',
  globalTechnicalLossPercent: 10,
  feederOverrides: new Map(),
  kwhAdjustments: new Map(),
  includeCDU: true,
  lossResults: null,
  isCalculating: false,
  recentlyMovedNodeId: null,
  highlightedPath: new Set(),
};

function networkReducer(state: NetworkState, action: Action): NetworkState {
  switch (action.type) {
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.nodeId };

    case 'MOVE_NODE': {
      const newNodes = new Map(state.nodes);
      const node = newNodes.get(action.nodeId);
      if (node) {
        newNodes.set(action.nodeId, { ...node, parentId: action.newParentId });
      }
      
      // Build the highlight path from the moved node up to root
      const highlightedPath = new Set<string>();
      highlightedPath.add(action.nodeId);
      let currentId: string | null = action.newParentId;
      while (currentId) {
        highlightedPath.add(currentId);
        const parent = newNodes.get(currentId);
        currentId = parent?.parentId || null;
      }
      
      return { 
        ...state, 
        nodes: newNodes,
        recentlyMovedNodeId: action.nodeId,
        highlightedPath
      };
    }

    case 'CLEAR_HIGHLIGHT':
      return { 
        ...state, 
        recentlyMovedNodeId: null, 
        highlightedPath: new Set() 
      };

    case 'CREATE_CLUSTER': {
      const dragged = state.nodes.get(action.draggedId);
      const target = state.nodes.get(action.targetId);
      if (!dragged || !target || action.draggedId === action.targetId) return state;

      // Meters, transformers, and feeders can be clustered (same substation)
      const clusterableTypes = ['meter', 'feeder', 'transformer'];
      const draggedMemberType = dragged.type as 'meter' | 'feeder' | 'transformer';

      const newNodes = new Map(state.nodes);

      // Members can cluster across different transformers/feeders as long as they
      // live under the same substation (mirrors the drag-and-drop move rules).
      const draggedSubstation = findAncestorOfType(state.nodes, action.draggedId, 'substation');
      const targetSubstation = findAncestorOfType(state.nodes, action.targetId, 'substation');
      const sameSubstation =
        draggedSubstation !== null && draggedSubstation === targetSubstation;

      // Case 1: target is already a cluster of the same member type -> add dragged into it
      if (target.type === 'cluster') {
        const targetCluster = target as Extract<NetworkNode, { type: 'cluster' }>;
        if (
          !clusterableTypes.includes(dragged.type) ||
          targetCluster.memberType !== dragged.type ||
          !sameSubstation
        ) {
          return state;
        }
        newNodes.set(action.draggedId, { ...dragged, parentId: targetCluster.id });
        return { ...state, nodes: newNodes, selectedNodeId: targetCluster.id };
      }

      // Case 2: dragged onto a same-type sibling in the same substation -> create new cluster
      if (
        !clusterableTypes.includes(dragged.type) ||
        dragged.type !== target.type ||
        !sameSubstation ||
        !target.parentId
      ) {
        return state;
      }

      const sharedParentId = target.parentId;
      const clusterId = `cluster-${draggedMemberType}-${action.targetId}-${Date.now()}`;
      const memberLabel =
        draggedMemberType === 'meter'
          ? 'Meter'
          : draggedMemberType === 'transformer'
            ? 'Transformer'
            : 'Feeder';

      const clusterNode = {
        id: clusterId,
        name: `${memberLabel} Cluster`,
        type: 'cluster' as const,
        parentId: sharedParentId,
        memberType: draggedMemberType,
      } as NetworkNode;

      newNodes.set(clusterId, clusterNode);
      newNodes.set(action.targetId, { ...target, parentId: clusterId });
      newNodes.set(action.draggedId, { ...dragged, parentId: clusterId });

      return { ...state, nodes: newNodes, selectedNodeId: clusterId };
    }

    case 'DISSOLVE_CLUSTER': {
      const cluster = state.nodes.get(action.clusterId);
      if (!cluster || cluster.type !== 'cluster') return state;

      const newNodes = new Map(state.nodes);
      const clusterParentId = cluster.parentId;

      // Re-parent all members back to the cluster's parent
      for (const node of newNodes.values()) {
        if (node.parentId === action.clusterId && clusterParentId) {
          newNodes.set(node.id, { ...node, parentId: clusterParentId });
        }
      }
      newNodes.delete(action.clusterId);

      return {
        ...state,
        nodes: newNodes,
        selectedNodeId: clusterParentId,
      };
    }

    case 'SET_GLOBAL_TECH_LOSS':
      return { ...state, globalTechnicalLossPercent: action.percent };

    case 'SET_FEEDER_TECH_LOSS': {
      const newOverrides = new Map(state.feederOverrides);
      newOverrides.set(action.feederId, action.percent);
      return { ...state, feederOverrides: newOverrides };
    }

    case 'CLEAR_FEEDER_OVERRIDE': {
      const newOverrides = new Map(state.feederOverrides);
      newOverrides.delete(action.feederId);
      return { ...state, feederOverrides: newOverrides };
    }

    case 'ADJUST_KWH': {
      const newAdjustments = new Map(state.kwhAdjustments);
      newAdjustments.set(`${action.nodeId}-${action.key}`, action.adjustment);
      return { ...state, kwhAdjustments: newAdjustments };
    }

    case 'TOGGLE_CDU':
      return { ...state, includeCDU: action.enabled };

    case 'SET_LOSS_RESULTS':
      return { ...state, lossResults: action.results, isCalculating: false };

    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.calculating };

    case 'RESET_CONFIG':
      return {
        ...state,
        globalTechnicalLossPercent: 10,
        feederOverrides: new Map(),
        kwhAdjustments: new Map(),
        includeCDU: true,
        lossResults: null,
      };

    default:
      return state;
  }
}

interface NetworkContextValue {
  state: NetworkState;
  selectNode: (nodeId: string | null) => void;
  moveNode: (nodeId: string, newParentId: string) => void;
  createCluster: (draggedId: string, targetId: string) => void;
  dissolveCluster: (clusterId: string) => void;
  setGlobalTechLoss: (percent: number) => void;
  setFeederTechLoss: (feederId: string, percent: number) => void;
  clearFeederOverride: (feederId: string) => void;
  adjustKwh: (nodeId: string, key: string, adjustment: number) => void;
  toggleCDU: (enabled: boolean) => void;
  calculateLosses: () => void;
  resetConfig: () => void;
  clearHighlight: () => void;
  getNode: (nodeId: string) => NetworkNode | undefined;
  getChildNodes: (parentId: string) => NetworkNode[];
  getSelectedNode: () => NetworkNode | undefined;
  getAncestorOfType: (nodeId: string, type: NodeType) => string | null;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(networkReducer, initialState);

  const selectNode = useCallback((nodeId: string | null) => {
    dispatch({ type: 'SELECT_NODE', nodeId });
  }, []);

  const moveNode = useCallback((nodeId: string, newParentId: string) => {
    dispatch({ type: 'MOVE_NODE', nodeId, newParentId });
  }, []);

  const createCluster = useCallback((draggedId: string, targetId: string) => {
    dispatch({ type: 'CREATE_CLUSTER', draggedId, targetId });
  }, []);

  const dissolveCluster = useCallback((clusterId: string) => {
    dispatch({ type: 'DISSOLVE_CLUSTER', clusterId });
  }, []);

  const setGlobalTechLoss = useCallback((percent: number) => {
    dispatch({ type: 'SET_GLOBAL_TECH_LOSS', percent });
  }, []);

  const setFeederTechLoss = useCallback((feederId: string, percent: number) => {
    dispatch({ type: 'SET_FEEDER_TECH_LOSS', feederId, percent });
  }, []);

  const clearFeederOverride = useCallback((feederId: string) => {
    dispatch({ type: 'CLEAR_FEEDER_OVERRIDE', feederId });
  }, []);

  const adjustKwh = useCallback((nodeId: string, key: string, adjustment: number) => {
    dispatch({ type: 'ADJUST_KWH', nodeId, key, adjustment });
  }, []);

  const toggleCDU = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_CDU', enabled });
  }, []);

  const calculateLosses = useCallback(() => {
    dispatch({ type: 'SET_CALCULATING', calculating: true });
    
    // Simulate async calculation
    setTimeout(() => {
      const config: CalculationConfig = {
        globalTechnicalLossPercent: state.globalTechnicalLossPercent,
        feederOverrides: state.feederOverrides,
        kwhAdjustments: state.kwhAdjustments,
        includeCDU: state.includeCDU,
      };
      
      const results = getFullLossHierarchy(config);
      dispatch({ type: 'SET_LOSS_RESULTS', results });
    }, 100);
  }, [state.globalTechnicalLossPercent, state.feederOverrides, state.kwhAdjustments, state.includeCDU]);

  const resetConfig = useCallback(() => {
    dispatch({ type: 'RESET_CONFIG' });
  }, []);

  const clearHighlight = useCallback(() => {
    dispatch({ type: 'CLEAR_HIGHLIGHT' });
  }, []);

  const getNode = useCallback((nodeId: string) => {
    return state.nodes.get(nodeId);
  }, [state.nodes]);

  const getChildNodes = useCallback((parentId: string) => {
    return Array.from(state.nodes.values()).filter(n => n.parentId === parentId);
  }, [state.nodes]);

  const getSelectedNode = useCallback(() => {
    return state.selectedNodeId ? state.nodes.get(state.selectedNodeId) : undefined;
  }, [state.selectedNodeId, state.nodes]);

  const getAncestorOfType = useCallback((nodeId: string, type: NodeType) => {
    return findAncestorOfType(state.nodes, nodeId, type);
  }, [state.nodes]);

  const value = useMemo(() => ({
    state,
    selectNode,
    moveNode,
    createCluster,
    dissolveCluster,
    setGlobalTechLoss,
    setFeederTechLoss,
    clearFeederOverride,
    adjustKwh,
    toggleCDU,
    calculateLosses,
    resetConfig,
    clearHighlight,
    getNode,
    getChildNodes,
    getSelectedNode,
    getAncestorOfType,
  }), [
    state,
    selectNode,
    moveNode,
    createCluster,
    dissolveCluster,
    setGlobalTechLoss,
    setFeederTechLoss,
    clearFeederOverride,
    adjustKwh,
    toggleCDU,
    calculateLosses,
    resetConfig,
    clearHighlight,
    getNode,
    getChildNodes,
    getSelectedNode,
    getAncestorOfType,
  ]);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
