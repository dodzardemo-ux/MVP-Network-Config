"use client"

import { useNetwork } from "@/lib/context/network-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useMemo, useCallback } from "react"
import type { NetworkNode, NodeType } from "@/lib/types/network"
import { cn } from "@/lib/utils"

interface MoveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemToMove: {
    type: NodeType
    node: NetworkNode
  } | null
}

export function MoveModal({ open, onOpenChange, itemToMove }: MoveModalProps) {
  const { state, moveNode } = useNetwork()
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)

  // Get the valid parent type for the item being moved
  const targetParentType = useMemo(() => {
    if (!itemToMove) return null
    switch (itemToMove.type) {
      case "meter": return "transformer"
      case "transformer": return "substation"
      case "substation": return "cnc"
      default: return null
    }
  }, [itemToMove])

  // Get the constraining ancestor (the level above the target parent)
  // This ensures moves stay within the same grandparent's subtree
  const getConstrainingAncestor = useMemo(() => {
    if (!itemToMove) return null
    
    // For meters: constrain to same substation (feeder)
    // For transformers: constrain to same CNC  
    // For substations: constrain to same sector
    let constraintLevel: NodeType | null = null
    switch (itemToMove.type) {
      case "meter": constraintLevel = "substation"; break  // Stay within same feeder/substation
      case "transformer": constraintLevel = "cnc"; break   // Stay within same CNC
      case "substation": constraintLevel = "sector"; break // Stay within same sector
      default: return null
    }
    
    // Walk up from the item to find the constraining ancestor
    let current: NetworkNode | undefined = itemToMove.node
    while (current && current.parentId) {
      const parent = state.nodes.get(current.parentId)
      if (parent && parent.type === constraintLevel) {
        return parent
      }
      current = parent
    }
    return null
  }, [itemToMove, state.nodes])

  // Check if a node is a descendant of an ancestor
  const isDescendantOf = useCallback((nodeId: string, ancestorId: string): boolean => {
    let current = state.nodes.get(nodeId)
    while (current) {
      if (current.id === ancestorId) return true
      if (!current.parentId) return false
      current = state.nodes.get(current.parentId)
    }
    return false
  }, [state.nodes])

  // Get all possible destinations with their hierarchy path
  const destinations = useMemo(() => {
    if (!targetParentType) return []
    
    const results: { id: string; name: string; path: string }[] = []
    
    // Build path for each potential destination
    const buildPath = (nodeId: string): string => {
      const parts: string[] = []
      let current = state.nodes.get(nodeId)
      while (current) {
        parts.unshift(current.name)
        if (current.parentId) {
          current = state.nodes.get(current.parentId)
        } else {
          break
        }
      }
      return parts.slice(0, -1).join(' > ')
    }

    for (const node of state.nodes.values()) {
      if (node.type === targetParentType) {
        // Skip the current parent (can't move to same location)
        if (itemToMove && node.id === itemToMove.node.parentId) continue
        
        // If we have a constraining ancestor, only allow destinations within it
        if (getConstrainingAncestor) {
          if (!isDescendantOf(node.id, getConstrainingAncestor.id)) continue
        }
        
        results.push({
          id: node.id,
          name: node.name,
          path: buildPath(node.id)
        })
      }
    }

    return results.sort((a, b) => a.name.localeCompare(b.name))
  }, [state.nodes, targetParentType, itemToMove, getConstrainingAncestor, isDescendantOf])

  if (!itemToMove) return null

  const handleMove = () => {
    if (!selectedDestination || !itemToMove) return
    
    moveNode(itemToMove.node.id, selectedDestination)
    setSelectedDestination(null)
    onOpenChange(false)
  }

  const getTitle = () => {
    switch (itemToMove.type) {
      case "meter": return "Move Meter"
      case "transformer": return "Move Transformer"
      case "substation": return "Move Substation"
      default: return "Move Item"
    }
  }

  const getDescription = () => {
    const name = itemToMove.node.name
    const constraintName = getConstrainingAncestor?.name || ''
    switch (itemToMove.type) {
      case "meter": return `Select a transformer within "${constraintName}" to move meter "${name}" to`
      case "transformer": return `Select a substation within "${constraintName}" to move transformer "${name}" to`
      case "substation": return `Select a CNC within "${constraintName}" to move substation "${name}" to`
      default: return `Select a destination for "${name}"`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] rounded-md border p-2">
          <div className="space-y-1">
            {destinations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No valid destinations available
              </div>
            ) : (
              destinations.map(dest => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedDestination(dest.id)
                  }}
                  className={cn(
                    "w-full rounded-lg p-3 text-left transition-colors",
                    selectedDestination === dest.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="font-medium">{dest.name}</div>
                  <div className={cn(
                    "text-xs",
                    selectedDestination === dest.id
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}>
                    {dest.path}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedDestination}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
