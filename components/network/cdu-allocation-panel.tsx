"use client"

import { useState, useMemo } from "react"
import { useNetwork } from "@/lib/context/network-context"
import type { Meter, Feeder } from "@/lib/types/network"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Gauge, 
  Zap, 
  AlertTriangle,
  Info,
  Check
} from "lucide-react"
import { energyDeliveredMap } from "@/lib/data/energy-data"

// Mock CDU unallocated sales data
const MOCK_CDU_UNALLOCATED = {
  totalUnallocatedKwh: 2450000, // 2.45 GWh of unallocated prepaid sales
  period: "2024-12",
  source: "CDU Vending System"
}

interface FeederAllocation {
  feederId: string
  feederName: string
  substationName: string
  zoneName: string
  prepaidCustomerCount: number
  totalCustomerCount: number
  prepaidRatio: number
  currentAllocationPercent: number
  energyDelivered: number
}

export function CDUAllocationPanel() {
  const { state } = useNetwork()
  const [allocations, setAllocations] = useState<Map<string, number>>(new Map())
  const [savedAllocations, setSavedAllocations] = useState<Map<string, number>>(new Map())
  
  // Build list of feeders with their prepaid customer stats (Feeder level CDU mapping)
  const feedersWithStats = useMemo(() => {
    const feedersData: FeederAllocation[] = []
    
    // Iterate through all feeders (type === 'feeder')
    for (const node of state.nodes.values()) {
      if (node.type === 'feeder') {
        const feeder = node as Feeder
        
        // Get substation name by traversing up
        let substationName = ''
        let zoneName = ''
        let current = feeder.parentId ? state.nodes.get(feeder.parentId) : null
        while (current) {
          if (current.type === 'substation') {
            substationName = current.name
          } else if (current.type === 'zone') {
            zoneName = current.name
            break
          }
          current = current.parentId ? state.nodes.get(current.parentId) : null
        }
        
        // Count customers under this feeder (through transformers)
        let prepaidCount = 0
        let totalCount = 0
        
        const countCustomers = (nodeId: string) => {
          for (const child of state.nodes.values()) {
            if (child.parentId === nodeId) {
              if (child.type === 'meter') {
                totalCount++
                const meter = child as Meter
                if (meter.premType === 'PPU') {
                  prepaidCount++
                }
              } else {
                countCustomers(child.id)
              }
            }
          }
        }
        
        countCustomers(feeder.id)
        
        // Get energy delivered for this feeder
        const energyDelivered = energyDeliveredMap.get(feeder.id) || 0
        
        if (totalCount > 0) {
          feedersData.push({
            feederId: feeder.id,
            feederName: feeder.name,
            substationName,
            zoneName,
            prepaidCustomerCount: prepaidCount,
            totalCustomerCount: totalCount,
            prepaidRatio: prepaidCount / totalCount,
            currentAllocationPercent: savedAllocations.get(feeder.id) || 0,
            energyDelivered
          })
        }
      }
    }
    
    // Sort by prepaid ratio (highest first)
    return feedersData.sort((a, b) => b.prepaidRatio - a.prepaidRatio)
  }, [state.nodes, savedAllocations])
  
  const totalAllocatedPercent = useMemo(() => {
    let total = 0
    for (const percent of allocations.values()) {
      total += percent
    }
    return total
  }, [allocations])
  
  const remainingPercent = 100 - totalAllocatedPercent
  
  const handleAllocationChange = (feederId: string, value: string) => {
    const percent = parseFloat(value) || 0
    const newAllocations = new Map(allocations)
    if (percent > 0) {
      newAllocations.set(feederId, Math.min(percent, 100))
    } else {
      newAllocations.delete(feederId)
    }
    setAllocations(newAllocations)
  }
  
  const handleSaveAllocations = () => {
    setSavedAllocations(new Map(allocations))
  }
  
  const handleAutoAllocate = () => {
    // Automatically distribute based on prepaid customer ratio
    const newAllocations = new Map<string, number>()
    const feedersWithPrepaid = feedersWithStats.filter(f => f.prepaidRatio > 0)
    const totalPrepaidRatio = feedersWithPrepaid.reduce((sum, f) => sum + f.prepaidRatio, 0)
    
    for (const feeder of feedersWithPrepaid) {
      const allocation = (feeder.prepaidRatio / totalPrepaidRatio) * 100
      if (allocation >= 0.1) { // Only allocate if >= 0.1%
        newAllocations.set(feeder.feederId, Math.round(allocation * 10) / 10)
      }
    }
    
    setAllocations(newAllocations)
  }
  
  const handleClearAllocations = () => {
    setAllocations(new Map())
  }
  
  const allocatedKwh = (MOCK_CDU_UNALLOCATED.totalUnallocatedKwh * totalAllocatedPercent) / 100
  const unallocatedKwh = MOCK_CDU_UNALLOCATED.totalUnallocatedKwh - allocatedKwh
  
  return (
    <div className="space-y-4">
      {/* CDU Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <CardTitle>CDU Unallocated Sales</CardTitle>
          </div>
          <CardDescription>
            Prepaid electricity sales that are not linked to specific feeders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">CDU Allocation at Feeder Level</p>
                <p className="text-sm text-amber-700 mt-1">
                  CDU (Central Distribution Unit) handles prepaid vending. Unallocated prepaid 
                  electricity sales are mapped to feeders based on prepaid customer concentration. 
                  This ensures accurate loss calculation at the feeder level by accounting for all 
                  prepaid consumption within each feeder&apos;s service area.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold">
                {(MOCK_CDU_UNALLOCATED.totalUnallocatedKwh / 1000000).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">GWh Unallocated</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalAllocatedPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Allocated</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className={`text-2xl font-bold ${remainingPercent > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {remainingPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleAutoAllocate} variant="outline" className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Auto-Allocate by PP Ratio
            </Button>
            <Button onClick={handleClearAllocations} variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Allocation List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Allocate to Feeders</CardTitle>
            <Badge variant={remainingPercent === 0 ? "default" : "secondary"}>
              {remainingPercent === 0 ? "Fully Allocated" : `${remainingPercent.toFixed(1)}% remaining`}
            </Badge>
          </div>
          <CardDescription>
            Assign percentages to feeders with high prepaid customer concentrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            <div className="space-y-3">
              {feedersWithStats.map(feeder => {
                const currentAllocation = allocations.get(feeder.feederId) || 0
                const allocatedKwhForFeeder = (MOCK_CDU_UNALLOCATED.totalUnallocatedKwh * currentAllocation) / 100
                
                return (
                  <div 
                    key={feeder.feederId}
                    className={`rounded-lg border p-3 transition-colors ${
                      currentAllocation > 0 ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{feeder.feederName}</div>
                        <div className="text-xs text-muted-foreground">{feeder.substationName} - {feeder.zoneName}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {feeder.prepaidCustomerCount} PP / {feeder.totalCustomerCount} total
                          </Badge>
                          <Badge 
                            variant={feeder.prepaidRatio > 0.5 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {(feeder.prepaidRatio * 100).toFixed(0)}% prepaid
                          </Badge>
                          <Badge variant="outline" className="text-xs text-blue-600">
                            {(feeder.energyDelivered / 1000).toFixed(0)} MWh delivered
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentAllocation || ''}
                            onChange={(e) => handleAllocationChange(feeder.feederId, e.target.value)}
                            className="w-20 h-8 text-right"
                            placeholder="0"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                        {currentAllocation > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {(allocatedKwhForFeeder / 1000).toFixed(0)} MWh
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            {totalAllocatedPercent > 100 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Total allocation exceeds 100%</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span>Total Allocated kWh:</span>
              <span className="font-mono font-bold">
                {(allocatedKwh / 1000).toLocaleString()} MWh
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Remaining Unallocated:</span>
              <span className="font-mono font-bold">
                {(unallocatedKwh / 1000).toLocaleString()} MWh
              </span>
            </div>
            
            <Button 
              onClick={handleSaveAllocations} 
              className="w-full"
              disabled={totalAllocatedPercent > 100}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Allocations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
