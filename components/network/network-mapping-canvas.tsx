'use client';

import { useMemo, useState } from 'react';
import type { JSX } from 'react';
import {
  Building2,
  MapPin,
  Layers,
  Network,
  Zap,
  Box,
  Gauge,
  Boxes,
  Ungroup,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetwork } from '@/lib/context/network-context';
import type { NetworkNode, NodeType, Cluster } from '@/lib/types/network';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

const DRAGGABLE_TYPES: NodeType[] = ['meter', 'transformer', 'feeder'];

export function NetworkMappingCanvas() {
  const {
    state,
    selectNode,
    getChildNodes,
    moveNode,
    createCluster,
    dissolveCluster,
    getAncestorOfType,
  } = useNetwork();
  const nodes = state.nodes;

  // The full OU has hundreds of meters, so the canvas focuses on one substation
  // at a time (the substation is the root of the org chart).
  const substations = useMemo(
    () =>
      Array.from(nodes.values())
        .filter((n) => n.type === 'substation')
        .sort((a, b) => a.name.localeCompare(b.name)),
    [nodes],
  );

  const [substationId, setSubstationId] = useState<string>('');
  const activeSubstationId = substationId || substations[0]?.id || '';
  const rootNode = nodes.get(activeSubstationId);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const sameSubstation = (a: string, b: string): boolean => {
    const sa = getAncestorOfType(a, 'substation');
    return sa !== null && sa === getAncestorOfType(b, 'substation');
  };

  // Drop rules mirror the Configure Network move rules, plus clustering.
  const canDrop = (draggedId: string, targetId: string): boolean => {
    const dragged = nodes.get(draggedId);
    const target = nodes.get(targetId);
    if (!dragged || !target || draggedId === targetId) return false;

    // Add a node into an existing cluster of the same member type (same substation).
    if (target.type === 'cluster') {
      const cl = target as Cluster;
      return dragged.type === cl.memberType && sameSubstation(draggedId, targetId);
    }
    // Cluster two same-type siblings (meters or feeders) within the same substation.
    if (
      dragged.type === target.type &&
      (dragged.type === 'meter' || dragged.type === 'feeder') &&
      sameSubstation(draggedId, targetId)
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
    // Same-type drop (or drop onto a cluster) means clustering; otherwise a move.
    if (target.type === 'cluster' || dragged.type === target.type) {
      createCluster(draggedId, targetId);
    } else {
      moveNode(draggedId, targetId);
    }
  };

  // A cluster hides its own members but exposes their children (e.g. a feeder
  // cluster shows the transformers from every clustered feeder).
  const visibleChildrenOf = (node: NetworkNode): NetworkNode[] => {
    if (node.type === 'cluster') {
      return getChildNodes(node.id).flatMap((member) => getChildNodes(member.id));
    }
    return getChildNodes(node.id);
  };

  // Meters (and meter-clusters) stack vertically; every other level is horizontal.
  const stacksVertically = (children: NetworkNode[]): boolean =>
    children.length > 0 &&
    children.every(
      (c) => c.type === 'meter' || (c.type === 'cluster' && (c as Cluster).memberType === 'meter'),
    );

  const renderCard = (node: NetworkNode): JSX.Element => {
    const cfg = nodeTypeConfig[node.type];
    const isSelected = state.selectedNodeId === node.id;
    const isDragging = draggingId === node.id;
    const isValidTarget = !!draggingId && draggingId !== node.id && canDrop(draggingId, node.id);
    const isHovered = dropTargetId === node.id && isValidTarget;
    const isDraggable = DRAGGABLE_TYPES.includes(node.type);
    const memberCount = node.type === 'cluster' ? getChildNodes(node.id).length : 0;

    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => {
          if (!isDraggable) return;
          e.stopPropagation();
          setDraggingId(node.id);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setDropTargetId(null);
        }}
        onDragOver={(e) => {
          if (isValidTarget) {
            e.preventDefault();
            e.stopPropagation();
            setDropTargetId(node.id);
          }
        }}
        onDragLeave={() => setDropTargetId((prev) => (prev === node.id ? null : prev))}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(node.id);
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectNode(node.id);
        }}
        className={cn(
          'relative flex w-48 flex-col gap-1.5 rounded-lg border bg-card p-3 text-left transition-all',
          isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
          'hover:border-foreground/20 hover:shadow-sm',
          isSelected && cn('ring-2 ring-offset-1', cfg.ring),
          isDragging && 'opacity-40',
          isHovered && 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 dark:bg-emerald-950/40',
          draggingId && !isValidTarget && !isDragging && 'opacity-60',
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted">
            <cfg.icon className={cn('h-4 w-4', cfg.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium" title={node.name}>
              {node.name}
            </div>
            <div className="text-xs text-muted-foreground">{cfg.label}</div>
          </div>
        </div>

        {node.type === 'cluster' && (
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {memberCount} {(node as Cluster).memberType === 'meter' ? 'meters' : 'feeders'}
            </Badge>
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
          </div>
        )}
      </div>
    );
  };

  // Recursively renders a node and its visible children as a connected org-chart branch.
  const renderBranch = (node: NetworkNode): JSX.Element => {
    const children = visibleChildrenOf(node);
    const vertical = stacksVertically(children);

    return (
      <div key={node.id} className="flex flex-col items-center">
        {renderCard(node)}

        {children.length > 0 &&
          (vertical ? (
            // Meter level: cards stacked one below the other, connected by a vertical bus.
            <div className="flex flex-col items-center">
              <div className="h-6 w-px bg-border" />
              {children.map((child, i) => (
                <div key={child.id} className="flex flex-col items-center">
                  {i > 0 && <div className="h-4 w-px bg-border" />}
                  {renderBranch(child)}
                </div>
              ))}
            </div>
          ) : (
            // Structural levels: children spread horizontally under a connector bus.
            <>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-start">
                {children.map((child, i) => (
                  <div key={child.id} className="relative flex flex-col items-center px-4">
                    {children.length > 1 && (
                      <div
                        className={cn(
                          'absolute top-0 h-px bg-border',
                          i === 0
                            ? 'left-1/2 right-0'
                            : i === children.length - 1
                              ? 'left-0 right-1/2'
                              : 'left-0 right-0',
                        )}
                      />
                    )}
                    <div className="h-6 w-px bg-border" />
                    {renderBranch(child)}
                  </div>
                ))}
              </div>
            </>
          ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Substation selector + help strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Substation</span>
          <Select value={activeSubstationId} onValueChange={setSubstationId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a substation" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Substations</SelectLabel>
                {substations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span className="text-pretty">
          Drag a card onto another to reorganize the network. Meters move to any transformer in the same
          substation; transformers move to any feeder in the same substation. Drop a meter onto another meter
          (or a feeder onto another feeder) in the same substation to group them into a cluster. Click a card to
          select it.
        </span>
      </div>

      {/* Org-chart canvas */}
      <div className="flex-1 overflow-auto rounded-lg border bg-muted/20 p-8">
        {rootNode ? (
          <div className="flex min-w-max justify-center">{renderBranch(rootNode)}</div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No substation available.
          </div>
        )}
      </div>
    </div>
  );
}
