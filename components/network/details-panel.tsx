"use client"

import { useNetwork } from "@/lib/context/network-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Zap, 
  ArrowRight,
  Building2,
  Box,
  Gauge,
  Layers,
  Network,
  Boxes,
  TrendingDown,
  AlertTriangle
} from "lucide-react"
import { MoveModal } from "./move-modal"
import { FeederAdjustmentsPanel } from "./feeder-adjustments-panel"
import { useState, useMemo } from "react"
import type { NetworkNode, NodeType, Meter } from "@/lib/types/network"
import { energyDeliveredMap } from "@/lib/data/energy-data"

const nodeTypeConfig: Record<NodeType, { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  color: string;
}> = {
  ou: { icon: Building2, label: 'Operating Unit', color: 'text-blue-600' },
  zone: { icon: MapPin, label: 'Zone', color: 'text-emerald-600' },
  sector: { icon: Layers, label: 'Sector', color: 'text-amber-600' },
  cnc: { icon: Network, label: 'CNC', color: 'text-purple-600' },
  substation: { icon: Zap, label: 'Substation/Feeder', color: 'text-orange-600' },
  feeder: { icon: Zap, label: 'Feeder', color: 'text-red-600' },
  transformer: { icon: Box, label: 'Transformer', color: 'text-cyan-600' },
  meter: { icon: Gauge, label: 'Meter', color: 'text-slate-600' },
  cluster: { icon: Boxes, label: 'Cluster', color: 'text-indigo-600' },
};

export function DetailsPanel() {
  const { state, getSelectedNode, getChildNodes, selectNode, moveNode } = useNetwork()
  const selectedNode = getSelectedNode()
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [itemToMove, setItemToMove] = useState<{
    type: NodeType
    node: NetworkNode
  } | null>(null)

  // Get children of the selected node
  const childNodes = useMemo(() => {
    if (!selectedNode) return []
    return getChildNodes(selectedNode.id)
  }, [selectedNode, getChildNodes])

  // Get the parent node
  const parentNode = useMemo(() => {
    if (!selectedNode || !selectedNode.parentId) return null
    return state.nodes.get(selectedNode.parentId)
  }, [selectedNode, state.nodes])

  // Get all descendant counts by type
  const stats = useMemo(() => {
    if (!selectedNode) return { zones: 0, sectors: 0, cncs: 0, substations: 0, feeders: 0, transformers: 0, meters: 0 }
    
    const countDescendants = (nodeId: string, type?: NodeType): number => {
      const children = Array.from(state.nodes.values()).filter(n => n.parentId === nodeId)
      let count = 0
      for (const child of children) {
        if (!type || child.type === type) count++
        count += countDescendants(child.id, type)
      }
      return count
    }

    return {
      zones: countDescendants(selectedNode.id, 'zone'),
      sectors: countDescendants(selectedNode.id, 'sector'),
      cncs: countDescendants(selectedNode.id, 'cnc'),
      substations: countDescendants(selectedNode.id, 'substation'),
      feeders: countDescendants(selectedNode.id, 'feeder'),
      transformers: countDescendants(selectedNode.id, 'transformer'),
      meters: countDescendants(selectedNode.id, 'meter'),
    }
  }, [selectedNode, state.nodes])

  // Calculate meter energy data (energy delivered allocated by proportion of consumption)
  const meterEnergyData = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'meter') return null
    
    const meter = selectedNode as Meter
    const transformerId = meter.parentId
    if (!transformerId) return null
    
    // Get transformer
    const transformer = state.nodes.get(transformerId)
    if (!transformer) return null
    
    // Get feeder (transformer's parent)
    const feederId = transformer.parentId
    if (!feederId) return null
    
    // Get feeder node to confirm it's a feeder
    const feeder = state.nodes.get(feederId)
    if (!feeder || feeder.type !== 'feeder') return null
    
    // Get all transformers under the same feeder
    const siblingTransformers = Array.from(state.nodes.values())
      .filter(n => n.type === 'transformer' && n.parentId === feederId)
    
    // Calculate total feeder consumption from all meters
    let totalFeederConsumption = 0
    for (const tx of siblingTransformers) {
      const txMeters = Array.from(state.nodes.values())
        .filter(n => n.type === 'meter' && n.parentId === tx.id) as Meter[]
      totalFeederConsumption += txMeters.reduce((sum, m) => sum + m.kwh, 0)
    }
    
    // Get energy delivered to the feeder
    const feederEnergy = energyDeliveredMap.get(feederId) || 0
    
    // Allocate energy to this meter based on consumption proportion
    const meterProportion = totalFeederConsumption > 0 
      ? meter.kwh / totalFeederConsumption 
      : 0
    const allocatedEnergy = Math.round(feederEnergy * meterProportion)
    
    // Calculate losses with technical loss
    const technicalLossPercent = state.globalTechnicalLossPercent
    const technicalLoss = Math.round(allocatedEnergy * (technicalLossPercent / 100))
    const loss = allocatedEnergy - meter.kwh - technicalLoss
    const lossPercent = allocatedEnergy > 0 ? (loss / allocatedEnergy) * 100 : 0
    
    return {
      energyDelivered: allocatedEnergy,
      customerSales: meter.kwh,
      technicalLossPercent,
      technicalLoss,
      loss,
      lossPercent
    }
  }, [selectedNode, state.nodes, state.globalTechnicalLossPercent])

  // Calculate energy summary for any hierarchy level (OU to Transformer)
  // Energy is summed up from child feeders (which have the energyDeliveredMap data)
  const hierarchyEnergyData = useMemo(() => {
    if (!selectedNode || selectedNode.type === 'meter') return null
    
    // Helper to get all descendants of a certain type
    const getDescendants = (nodeId: string, targetType?: string): NetworkNode[] => {
      const descendants: NetworkNode[] = []
      const traverse = (id: string) => {
        for (const node of state.nodes.values()) {
          if (node.parentId === id) {
            if (!targetType || node.type === targetType) {
              descendants.push(node)
            }
            traverse(node.id)
          }
        }
      }
      traverse(nodeId)
      return descendants
    }

    // Get all feeders under this node (feeders have energy delivered data)
    const descendantFeeders = selectedNode.type === 'feeder' 
      ? [selectedNode] 
      : getDescendants(selectedNode.id, 'feeder')
    
    // Sum energy delivered from all feeders (including kWh adjustments)
    let energyDelivered = 0
    for (const feeder of descendantFeeders) {
      const baseEnergy = energyDeliveredMap.get(feeder.id) || 0
      const adjustment = state.kwhAdjustments.get(`${feeder.id}-delivered`) || 0
      energyDelivered += baseEnergy + adjustment
    }
    
    // Get all meters and sum their consumption
    const allMeters = selectedNode.type === 'transformer'
      ? Array.from(state.nodes.values()).filter(n => n.type === 'meter' && n.parentId === selectedNode.id)
      : getDescendants(selectedNode.id, 'meter')
    
    let customerSales = (allMeters as Meter[]).reduce((sum, m) => sum + m.kwh, 0)
    
    // Add sales adjustments from feeders
    for (const feeder of descendantFeeders) {
      const salesAdj = state.kwhAdjustments.get(`${feeder.id}-sales`) || 0
      customerSales += salesAdj
    }
    
    // For transformers, we need to calculate proportional energy delivered from parent feeder
    if (selectedNode.type === 'transformer') {
      const parentFeeder = state.nodes.get(selectedNode.parentId || '')
      if (parentFeeder && parentFeeder.type === 'feeder') {
        const baseFeederEnergy = energyDeliveredMap.get(parentFeeder.id) || 0
        const feederAdj = state.kwhAdjustments.get(`${parentFeeder.id}-delivered`) || 0
        const feederEnergy = baseFeederEnergy + feederAdj
        // Get all meters under the same feeder
        const allFeederMeters = getDescendants(parentFeeder.id, 'meter') as Meter[]
        const totalFeederConsumption = allFeederMeters.reduce((sum, m) => sum + m.kwh, 0)
        // Proportional allocation
        const meterConsumption = (allMeters as Meter[]).reduce((sum, m) => sum + m.kwh, 0)
        energyDelivered = totalFeederConsumption > 0 
          ? Math.round(feederEnergy * (meterConsumption / totalFeederConsumption))
          : 0
        customerSales = meterConsumption
      }
    }
    
    if (energyDelivered === 0 && customerSales === 0) return null
    
    // Get technical loss % (use feeder override if this is a single feeder, otherwise global)
    const technicalLossPercent = selectedNode.type === 'feeder' && state.feederOverrides.has(selectedNode.id)
      ? state.feederOverrides.get(selectedNode.id)!
      : state.globalTechnicalLossPercent
    
    const technicalLoss = Math.round(energyDelivered * (technicalLossPercent / 100))
    const nonTechnicalLoss = energyDelivered - customerSales - technicalLoss
    const nonTechnicalLossPercent = energyDelivered > 0 ? (nonTechnicalLoss / energyDelivered) * 100 : 0
    
    return {
      energyDelivered,
      customerSales,
      technicalLossPercent,
      technicalLoss,
      nonTechnicalLoss,
      nonTechnicalLossPercent
    }
  }, [selectedNode, state.nodes, state.globalTechnicalLossPercent, state.kwhAdjustments, state.feederOverrides])

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No Selection</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a node from the network tree to view details
          </p>
        </div>
      </div>
    )
  }

  const handleMoveClick = (node: NetworkNode) => {
    setItemToMove({ type: node.type, node })
    setMoveModalOpen(true)
  }

  const config = nodeTypeConfig[selectedNode.type]
  const Icon = config.icon

  const canMove = ['substation', 'transformer', 'meter'].includes(selectedNode.type)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${config.color}`} />
              <CardTitle>{selectedNode.name}</CardTitle>
            </div>
            {canMove && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleMoveClick(selectedNode)}
              >
                Move
              </Button>
            )}
          </div>
          <CardDescription>
            {config.label}
            {parentNode && ` in ${parentNode.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats - show relevant descendant counts based on node type */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedNode.type === 'ou' && stats.zones > 0 && (
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{stats.zones}</div>
                <div className="text-xs text-muted-foreground">Zones</div>
              </div>
            )}
            {['ou', 'zone'].includes(selectedNode.type) && stats.sectors > 0 && (
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{stats.sectors}</div>
                <div className="text-xs text-muted-foreground">Sectors</div>
              </div>
            )}
            {['ou', 'zone', 'sector'].includes(selectedNode.type) && stats.cncs > 0 && (
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{stats.cncs}</div>
                <div className="text-xs text-muted-foreground">CNCs</div>
              </div>
            )}
            {['ou', 'zone', 'sector', 'cnc'].includes(selectedNode.type) && stats.substations > 0 && (
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{stats.substations}</div>
                <div className="text-xs text-muted-foreground">Substations</div>
              </div>
            )}
            {['ou', 'zone', 'sector', 'cnc', 'substation'].includes(selectedNode.type) && stats.feeders > 0 && (
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{stats.feeders}</div>
                <div className="text-xs text-muted-foreground">Feeders</div>
              </div>
            )}
            {['ou', 'zone', 'sector', 'cnc', 'substation', 'feeder'].includes(selectedNode.type) && stats.transformers > 0 && (
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{stats.transformers}</div>
                <div className="text-xs text-muted-foreground">Transformers</div>
              </div>
            )}
            {selectedNode.type !== 'meter' && stats.meters > 0 && (
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold">{stats.meters}</div>
                <div className="text-xs text-muted-foreground">Meters</div>
              </div>
            )}
          </div>

          {/* Energy Summary for Hierarchy Levels (OU to Transformer) */}
          {hierarchyEnergyData && selectedNode.type !== 'meter' && (
            <>
              <Separator />
              <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Energy Summary
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center rounded-lg bg-background/50 p-2">
                    <div className="text-lg font-bold text-blue-600">
                      {hierarchyEnergyData.energyDelivered >= 1000000 
                        ? `${(hierarchyEnergyData.energyDelivered / 1000000).toFixed(2)} GWh`
                        : hierarchyEnergyData.energyDelivered >= 1000
                        ? `${(hierarchyEnergyData.energyDelivered / 1000).toFixed(1)} MWh`
                        : `${hierarchyEnergyData.energyDelivered.toLocaleString()} kWh`}
                    </div>
                    <div className="text-xs text-muted-foreground">Energy Delivered</div>
                  </div>
                  <div className="text-center rounded-lg bg-background/50 p-2">
                    <div className="text-lg font-bold text-green-600">
                      {hierarchyEnergyData.customerSales >= 1000000 
                        ? `${(hierarchyEnergyData.customerSales / 1000000).toFixed(2)} GWh`
                        : hierarchyEnergyData.customerSales >= 1000
                        ? `${(hierarchyEnergyData.customerSales / 1000).toFixed(1)} MWh`
                        : `${hierarchyEnergyData.customerSales.toLocaleString()} kWh`}
                    </div>
                    <div className="text-xs text-muted-foreground">Customer Sales</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center rounded-lg bg-background/50 p-2">
                    <div className="text-md font-bold text-amber-600">
                      {hierarchyEnergyData.technicalLoss >= 1000
                        ? `${(hierarchyEnergyData.technicalLoss / 1000).toFixed(1)} MWh`
                        : `${hierarchyEnergyData.technicalLoss.toLocaleString()} kWh`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tech Loss ({hierarchyEnergyData.technicalLossPercent}%)
                    </div>
                  </div>
                  <div className="text-center rounded-lg bg-background/50 p-2">
                    <div className={`text-md font-bold ${
                      hierarchyEnergyData.nonTechnicalLossPercent > 15 ? 'text-red-600' : 
                      hierarchyEnergyData.nonTechnicalLossPercent > 10 ? 'text-orange-600' : 'text-emerald-600'
                    }`}>
                      {Math.abs(hierarchyEnergyData.nonTechnicalLoss) >= 1000
                        ? `${(hierarchyEnergyData.nonTechnicalLoss / 1000).toFixed(1)} MWh`
                        : `${hierarchyEnergyData.nonTechnicalLoss.toLocaleString()} kWh`}
                    </div>
                    <div className="text-xs text-muted-foreground">Non-Tech Loss</div>
                  </div>
                  <div className="text-center rounded-lg bg-background/50 p-2">
                    <div className={`text-md font-bold ${
                      hierarchyEnergyData.nonTechnicalLossPercent > 15 ? 'text-red-600' : 
                      hierarchyEnergyData.nonTechnicalLossPercent > 10 ? 'text-orange-600' : 'text-emerald-600'
                    }`}>
                      {hierarchyEnergyData.nonTechnicalLossPercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">NTL %</div>
                  </div>
                </div>
                {hierarchyEnergyData.nonTechnicalLossPercent > 15 && (
                  <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    High non-technical losses detected in this area
                  </div>
                )}
              </div>
            </>
          )}

          {/* Feeder Adjustments Panel - BRS-7 & BRS-8 */}
          {selectedNode.type === 'feeder' && (
            <>
              <Separator />
              <FeederAdjustmentsPanel 
                feederId={selectedNode.id} 
                feederName={selectedNode.name} 
              />
            </>
          )}

          {/* Legacy energy data if available via metadata */}
          {selectedNode.metadata?.energyDelivered && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">
                      {(selectedNode.metadata.energyDelivered / 1000).toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">MWh Delivered</div>
                  </div>
                  {selectedNode.metadata.totalSales && (
                    <div>
                      <div className="text-2xl font-bold">
                        {(selectedNode.metadata.totalSales / 1000).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">MWh Sales</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Meter specific data */}
          {selectedNode.type === 'meter' && (
            <>
              <Separator />
              
              {/* Energy Summary Card for Meters */}
              {meterEnergyData && (
                <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Energy Summary
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center rounded-lg bg-background/50 p-2">
                      <div className="text-lg font-bold text-blue-600">
                        {meterEnergyData.energyDelivered.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">kWh Delivered</div>
                    </div>
                    <div className="text-center rounded-lg bg-background/50 p-2">
                      <div className="text-lg font-bold text-green-600">
                        {meterEnergyData.customerSales.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">kWh Sales</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center rounded-lg bg-background/50 p-2">
                      <div className="text-md font-bold text-amber-600">
                        {meterEnergyData.technicalLoss.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tech Loss ({meterEnergyData.technicalLossPercent}%)
                      </div>
                    </div>
                    <div className="text-center rounded-lg bg-background/50 p-2">
                      <div className={`text-md font-bold ${
                        meterEnergyData.lossPercent > 15 ? 'text-red-600' : 
                        meterEnergyData.lossPercent > 10 ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        {meterEnergyData.loss.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">kWh NTL</div>
                    </div>
                    <div className="text-center rounded-lg bg-background/50 p-2">
                      <div className={`text-md font-bold ${
                        meterEnergyData.lossPercent > 15 ? 'text-red-600' : 
                        meterEnergyData.lossPercent > 10 ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        {meterEnergyData.lossPercent.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">NTL %</div>
                    </div>
                  </div>
                  {meterEnergyData.lossPercent > 15 && (
                    <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      High loss detected on this meter
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account ID</span>
                  <span className="font-mono text-sm">{(selectedNode as Meter).acctId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premise ID</span>
                  <span className="font-mono text-sm">{(selectedNode as Meter).premId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Type</span>
                  <Badge variant={
                    (selectedNode as Meter).premType === "LPU" ? "default" :
                    (selectedNode as Meter).premType === "SPU" ? "secondary" : "outline"
                  }>
                    {(selectedNode as Meter).premType === "LPU" ? "Large Power User" :
                     (selectedNode as Meter).premType === "SPU" ? "Small Power User" : "Prepaid"}
                  </Badge>
                </div>
                {(selectedNode as Meter).address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-right text-sm max-w-[200px] truncate">
                      {(selectedNode as Meter).address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reading Type</span>
                  <Badge variant={(selectedNode as Meter).isEstimate ? "secondary" : "default"}>
                    {(selectedNode as Meter).isEstimate ? "Estimated" : "Actual"}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Transformer specific data */}
          {selectedNode.type === 'transformer' && selectedNode.metadata?.capacityKVA && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-semibold">{selectedNode.metadata.capacityKVA} kVA</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Children list */}
      {childNodes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {childNodes[0] ? nodeTypeConfig[childNodes[0].type]?.label + 's' : 'Children'}
            </CardTitle>
            <CardDescription>
              {childNodes.length} {childNodes[0] ? nodeTypeConfig[childNodes[0].type]?.label.toLowerCase() + 's' : 'items'} connected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {childNodes.map(child => {
                  const childConfig = nodeTypeConfig[child.type]
                  const ChildIcon = childConfig.icon
                  const canMoveChild = ['substation', 'transformer', 'meter'].includes(child.type)
                  
                  return (
                    <div 
                      key={child.id} 
                      className="flex items-center justify-between rounded-lg border p-2 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => selectNode(child.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ChildIcon className={`h-4 w-4 flex-shrink-0 ${childConfig.color}`} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{child.name}</div>
                          {child.metadata?.consumptionKwh && (
                            <div className="text-xs text-muted-foreground">
                              {child.metadata.consumptionKwh.toLocaleString()} kWh
                            </div>
                          )}
                          {child.metadata?.customerType && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {child.metadata.customerType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {canMoveChild && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveClick(child)
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      <MoveModal 
        open={moveModalOpen}
        onOpenChange={setMoveModalOpen}
        itemToMove={itemToMove}
      />
    </div>
  )
}
