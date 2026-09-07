'use client';

import { useMemo, useState } from 'react';
import {
  Building2,
  MapPin,
  Layers,
  Network,
  Zap,
  Box,
  Gauge,
  Boxes,
  ChevronRight,
  CornerDownRight,
  Ungroup,
  Home,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetwork } from '@/lib/context/network-context';
import type { NetworkNode, NodeType, Meter, Cluster } from '@/lib/types/network';
import { energyDeliveredMap, getTotalConsumptionForNode } from '@/lib/data/energy-data';

const nodeTypeConfig: Record<NodeType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  ring: string;
}> = {
  ou: { icon: Building2, label: 'Operating Unit', color: 'text-blue-600', ring: 'ring-blue-500' },
  zone: { icon: MapPin, label: 'Zone', color: 'text-emerald-600', ring: 'ring-emerald-500' },
  sector: { icon: Layers, label: 'Sector', color: 'text-amber-600', ring: 'ring-amber-500' },
  cnc: { icon: Network, label: 'CNC', color: 'text-purple-600', ring: 'ring-purple-500' },
  substation: { icon: Zap, label: 'Substation', color: 'text-orange-600', ring: 'ring-orange-500' },
  feeder: { icon: Zap, label: 'Feeder', color: 'text-red-600', ring: 'ring-red-500' },
  transformer: { icon: Box, label: 'Transformer', color: 'text-cyan-600', ring: 'ring-cyan-500' },
  meter: { icon: Gauge, label: 'Meter', color: 'text-slate-600', ring: 'ring-slate-500' },
  cluster: { icon: Boxes, label: 'Cluster', color: 'text-indigo-600', ring: 'ring-indigo-500' },
};

function formatEnergy(kwh: number): string {
  if (kwh >= 1_000_000) return `${(kwh / 1_000_000).toFixed(2)} GWh`;
  if (kwh >= 1_000) return `${(kwh / 1_000).toFixed(1)} MWh`;
  return `${Math.round(kwh)} kWh`;
}

export function NetworkMappingCanvas() {
  const { state, selectNode, getChildNodes, moveNode, createCluster, dissolveCluster } = useNetwork();
  const nodes = state.nodes;

  // Root operating unit is the default focus.
  const rootNode = useMemo(
    () => Array.from(nodes.values()).find((n) => n.parentId === null),
    [nodes],
  );
  const [focusId, setFocusId] = useState<string>(rootNode?.id ?? 'ou-gauteng');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const focusNode = nodes.get(focusId) ?? rootNode;
  const children = useMemo(
    () => (focusNode ? getChildNodes(focusNode.id) : []),
    [focusNode, getChildNodes, nodes],
  );

  // Ancestor chain from root down to (and including) the focus node, for the breadcrumb.
  const breadcrumb = useMemo(() => {
    const chain: NetworkNode[] = [];
    let current: NetworkNode | undefined = focusNode;
    while (current) {
      chain.unshift(current);
      current = current.parentId ? nodes.get(current.parentId) : undefined;
    }
    return chain;
  }, [focusNode, nodes]);

  const substationAncestor = (id: string): string | null => {
    let current: NetworkNode | undefined = nodes.get(id);
    while (current) {
      if (current.type === 'substation') return current.id;
      current = current.parentId ? nodes.get(current.parentId) : undefined;
    }
    return null;
  };

  const sameSubstation = (a: string, b: string) => {
    const sa = substationAncestor(a);
    return sa !== null && sa === substationAncestor(b);
  };

  // Drop rules mirror the Configure Network move/cluster constraints.
  const canDrop = (draggedId: string, targetId: string): boolean => {
    const dragged = nodes.get(draggedId);
    const target = nodes.get(targetId);
    if (!dragged || !target || draggedId === targetId) return false;

    // Add into an existing cluster of the same member type sharing its parent.
    if (target.type === 'cluster') {
      const cl = target as Cluster;
      return dragged.type === cl.memberType && dragged.parentId === cl.parentId;
    }
    // Cluster two same-type siblings (meters or feeders) that share a parent.
    if (
      dragged.type === target.type &&
      (dragged.type === 'meter' || dragged.type === 'feeder') &&
      dragged.parentId === target.parentId
    ) {
      return true;
    }
    // Move a meter to any transformer in the same substation.
    if (dragged.type === 'meter' && target.type === 'transformer') {
      return sameSubstation(draggedId, targetId);
    }
    // Move a transformer to any feeder in the same substation.
    if (dragged.type === 'transformer' && target.type === 'feeder') {
      return sameSubstation(draggedId, targetId);
    }
    return false;
  };

  const handleDrop = (targetId: string) => {
    const draggedId = draggingId;
    setDraggingId(null);
    setDropTargetId(null);
    if (!draggedId || !canDrop(draggedId, targetId)) return;
    const target = nodes.get(targetId)!;
    const dragged = nodes.get(draggedId)!;
    if (target.type === 'cluster' || dragged.type === target.type) {
      createCluster(draggedId, targetId);
    } else {
      moveNode(draggedId, targetId);
    }
  };

  const metricFor = (node: NetworkNode): string | null => {
    if (node.type === 'feeder') {
      const e = energyDeliveredMap.get(node.id);
      return e ? `${formatEnergy(e)} delivered` : null;
    }
    if (node.type === 'meter') {
      return `${formatEnergy((node as Meter).kwh)} sales`;
    }
    if (node.type === 'cluster') return null;
    const consumption = getTotalConsumptionForNode(node.id, node.type);
    return consumption ? `${formatEnergy(consumption)} sales` : null;
  };

  if (!focusNode) {
    return <div className="p-6 text-muted-foreground">No network data available.</div>;
  }

  const focusConfig = nodeTypeConfig[focusNode.type];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 flex-wrap text-sm">
        <button
          onClick={() => rootNode && setFocusId(rootNode.id)}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label="Go to top of network"
        >
          <Home className="h-4 w-4" />
        </button>
        {breadcrumb.map((node, i) => {
          const cfg = nodeTypeConfig[node.type];
          const isLast = i === breadcrumb.length - 1;
          return (
            <div key={node.id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <button
                onClick={() => setFocusId(node.id)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded hover:bg-accent',
                  isLast ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <cfg.icon className={cn('h-3.5 w-3.5', cfg.color)} />
                <span className="truncate max-w-40">{node.name}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Help strip */}
      <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span className="text-pretty">
          Drag a card onto another to reorganize the network. Meters move to any transformer in the same
          substation; transformers move to any feeder in the same substation. Drop a card onto a same-type
          sibling to group them into a cluster. Click a card to inspect it, or use the drill-in arrow to
          navigate deeper.
        </span>
      </div>

      {/* Focus node header */}
      <div className={cn('flex items-center gap-3 rounded-lg border bg-card p-4')}>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-md bg-muted')}>
          <focusConfig.icon className={cn('h-5 w-5', focusConfig.color)} />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">{focusNode.name}</div>
          <div className="text-sm text-muted-foreground">
            {focusConfig.label} &middot; {children.length} direct{' '}
            {children.length === 1 ? 'child' : 'children'}
          </div>
        </div>
      </div>

      {/* Children grid */}
      <div className="flex-1 overflow-auto">
        {children.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            This node has no child elements.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {children.map((node) => {
              const cfg = nodeTypeConfig[node.type];
              const hasChildren = getChildNodes(node.id).length > 0;
              const isSelected = state.selectedNodeId === node.id;
              const isDragging = draggingId === node.id;
              const isValidTarget =
                draggingId && draggingId !== node.id && canDrop(draggingId, node.id);
              const isHovered = dropTargetId === node.id && isValidTarget;
              const metric = metricFor(node);
              const childCount = getChildNodes(node.id).length;

              return (
                <div
                  key={node.id}
                  draggable
                  onDragStart={() => setDraggingId(node.id)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDropTargetId(null);
                  }}
                  onDragOver={(e) => {
                    if (isValidTarget) {
                      e.preventDefault();
                      setDropTargetId(node.id);
                    }
                  }}
                  onDragLeave={() => setDropTargetId((prev) => (prev === node.id ? null : prev))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(node.id);
                  }}
                  onClick={() => selectNode(node.id)}
                  className={cn(
                    'group relative flex flex-col gap-2 rounded-lg border bg-card p-3 cursor-grab transition-all',
                    'hover:border-foreground/20 hover:shadow-sm',
                    isSelected && cn('ring-2 ring-offset-1', cfg.ring),
                    isDragging && 'opacity-40',
                    isHovered && 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    draggingId && !isValidTarget && !isDragging && 'opacity-60',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted')}>
                      <cfg.icon className={cn('h-4 w-4', cfg.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate" title={node.name}>
                        {node.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{cfg.label}</div>
                    </div>
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFocusId(node.id);
                        }}
                        className="p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-opacity"
                        aria-label={`Drill into ${node.name}`}
                      >
                        <CornerDownRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground truncate">
                      {metric ?? (childCount > 0 ? `${childCount} items` : '\u2014')}
                    </div>
                    {node.type === 'cluster' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dissolveCluster(node.id);
                        }}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                        aria-label={`Ungroup ${node.name}`}
                      >
                        <Ungroup className="h-3.5 w-3.5" />
                        Ungroup
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
