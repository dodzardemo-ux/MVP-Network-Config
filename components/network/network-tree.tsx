'use client';

import { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetwork } from '@/lib/context/network-context';
import type { NetworkNode, NodeType } from '@/lib/types/network';

const nodeTypeConfig: Record<NodeType, { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  color: string;
}> = {
  ou: { icon: Building2, label: 'Operating Unit', color: 'text-blue-600' },
  zone: { icon: MapPin, label: 'Zone', color: 'text-emerald-600' },
  sector: { icon: Layers, label: 'Sector', color: 'text-amber-600' },
  cnc: { icon: Network, label: 'CNC', color: 'text-purple-600' },
  substation: { icon: Zap, label: 'Substation', color: 'text-orange-600' },
  feeder: { icon: Zap, label: 'Feeder', color: 'text-red-600' },
  transformer: { icon: Box, label: 'Transformer', color: 'text-cyan-600' },
  meter: { icon: Gauge, label: 'Meter', color: 'text-slate-600' },
  cluster: { icon: Boxes, label: 'Cluster', color: 'text-indigo-600' },
};

interface TreeNodeProps {
  node: NetworkNode;
  level: number;
  expandedNodes: Set<string>;
  toggleExpand: (nodeId: string) => void;
}

function TreeNode({ node, level, expandedNodes, toggleExpand }: TreeNodeProps) {
  const { state, selectNode, getChildNodes, clearHighlight } = useNetwork();
  const children = getChildNodes(node.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = state.selectedNodeId === node.id;
  const isHighlighted = state.highlightedPath.has(node.id);
  const isMovedNode = state.recentlyMovedNodeId === node.id;
  
  const config = nodeTypeConfig[node.type];
  const Icon = config.icon;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleExpand(node.id);
    }
  };

  const handleSelect = () => {
    selectNode(node.id);
    // Clear highlight after 5 seconds when any node is clicked
    if (state.recentlyMovedNodeId) {
      setTimeout(() => clearHighlight(), 5000);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-300',
          'hover:bg-accent',
          isSelected && 'bg-accent ring-1 ring-ring',
          isHighlighted && !isSelected && 'bg-emerald-100 dark:bg-emerald-950/50',
          isMovedNode && 'bg-emerald-200 dark:bg-emerald-900 ring-2 ring-emerald-500 animate-pulse'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        <button
          onClick={handleToggle}
          className={cn(
            'p-0.5 rounded hover:bg-muted-foreground/10 transition-colors',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <Icon className={cn('h-4 w-4 flex-shrink-0', config.color)} />
        <span className="text-sm truncate">{node.name}</span>
        {hasChildren && (
          <span className="ml-auto text-xs text-muted-foreground">
            {children.length}
          </span>
        )}
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NetworkTree() {
  const { getChildNodes } = useNetwork();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['ou-gauteng']) // Start with OU expanded
  );

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const { state } = useNetwork();
    const allIds = Array.from(state.nodes.keys());
    setExpandedNodes(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['ou-gauteng']));
  };

  // Get root node (Gauteng OU)
  const rootNodes = getChildNodes('') || [];
  const gautengNode = rootNodes.find(n => n.type === 'ou') || 
    Array.from(getChildNodes('')).find(n => n.parentId === null);

  // Actually, we need to find nodes with null parentId
  const { state } = useNetwork();
  const topLevelNodes = useMemo(() => {
    return Array.from(state.nodes.values()).filter(n => n.parentId === null);
  }, [state.nodes]);

  // Auto-expand the path when a node is moved
  useEffect(() => {
    if (state.highlightedPath.size > 0) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        state.highlightedPath.forEach(id => next.add(id));
        return next;
      });
    }
  }, [state.highlightedPath]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-semibold">Network Hierarchy</h3>
        <div className="flex gap-1">
          <button
            onClick={() => {
              const allIds = Array.from(state.nodes.keys());
              setExpandedNodes(new Set(allIds));
            }}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent"
          >
            Collapse
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {topLevelNodes.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            expandedNodes={expandedNodes}
            toggleExpand={toggleExpand}
          />
        ))}
      </div>
      
      <div className="border-t px-3 py-2">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {Object.entries(nodeTypeConfig).slice(0, 4).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div key={type} className="flex items-center gap-1">
                <Icon className={cn('h-3 w-3', config.color)} />
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
