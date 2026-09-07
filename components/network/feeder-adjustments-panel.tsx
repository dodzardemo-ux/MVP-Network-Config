"use client"

import { useState, useEffect } from "react"
import { useNetwork } from "@/lib/context/network-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings2, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  RotateCcw,
  Check,
  Percent
} from "lucide-react"
import { energyDeliveredMap, getCustomerConsumptionForFeeder } from "@/lib/data/energy-data"

interface FeederAdjustmentsPanelProps {
  feederId: string
  feederName: string
}

export function FeederAdjustmentsPanel({ feederId, feederName }: FeederAdjustmentsPanelProps) {
  const { 
    state, 
    setFeederTechLoss, 
    clearFeederOverride, 
    adjustKwh 
  } = useNetwork()

  // Get current values
  const baseEnergyDelivered = energyDeliveredMap.get(feederId) || 0
  const baseCustomerSales = getCustomerConsumptionForFeeder(feederId)
  
  // Get current adjustments from state
  const currentDeliveredAdj = state.kwhAdjustments.get(`${feederId}-delivered`) || 0
  const currentSalesAdj = state.kwhAdjustments.get(`${feederId}-sales`) || 0
  const currentTechLossOverride = state.feederOverrides.get(feederId)
  const hasOverride = currentTechLossOverride !== undefined

  // Local state for input fields
  const [deliveredAdjustment, setDeliveredAdjustment] = useState(currentDeliveredAdj.toString())
  const [salesAdjustment, setSalesAdjustment] = useState(currentSalesAdj.toString())
  const [techLossPercent, setTechLossPercent] = useState(
    hasOverride ? currentTechLossOverride.toString() : state.globalTechnicalLossPercent.toString()
  )

  // Update local state when feeder changes
  useEffect(() => {
    setDeliveredAdjustment(currentDeliveredAdj.toString())
    setSalesAdjustment(currentSalesAdj.toString())
    setTechLossPercent(
      hasOverride ? currentTechLossOverride!.toString() : state.globalTechnicalLossPercent.toString()
    )
  }, [feederId, currentDeliveredAdj, currentSalesAdj, currentTechLossOverride, hasOverride, state.globalTechnicalLossPercent])

  // Calculated values with adjustments
  const adjustedDelivered = baseEnergyDelivered + (parseFloat(deliveredAdjustment) || 0)
  const adjustedSales = baseCustomerSales + (parseFloat(salesAdjustment) || 0)

  const handleApplyDeliveredAdjustment = () => {
    const value = parseFloat(deliveredAdjustment) || 0
    adjustKwh(feederId, 'delivered', value)
  }

  const handleApplySalesAdjustment = () => {
    const value = parseFloat(salesAdjustment) || 0
    adjustKwh(feederId, 'sales', value)
  }

  const handleApplyTechLoss = () => {
    const value = parseFloat(techLossPercent) || 10
    setFeederTechLoss(feederId, Math.max(0, Math.min(100, value)))
  }

  const handleResetTechLoss = () => {
    clearFeederOverride(feederId)
    setTechLossPercent(state.globalTechnicalLossPercent.toString())
  }

  const handleResetAllAdjustments = () => {
    adjustKwh(feederId, 'delivered', 0)
    adjustKwh(feederId, 'sales', 0)
    clearFeederOverride(feederId)
    setDeliveredAdjustment('0')
    setSalesAdjustment('0')
    setTechLossPercent(state.globalTechnicalLossPercent.toString())
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Feeder Adjustments</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleResetAllAdjustments}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset All
          </Button>
        </div>
        <CardDescription>
          Adjustments for {feederName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BRS-7: kWh Adjustments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">kWh Adjustments</span>
          </div>
          
          {/* Energy Delivered Adjustment */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Energy Delivered</Label>
              <Badge variant="outline" className="text-xs">
                Base: {(baseEnergyDelivered / 1000).toFixed(1)} MWh
              </Badge>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={deliveredAdjustment}
                  onChange={(e) => setDeliveredAdjustment(e.target.value)}
                  placeholder="Adjustment in kWh"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {parseFloat(deliveredAdjustment) > 0 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{parseFloat(deliveredAdjustment).toLocaleString()} kWh
                    </span>
                  ) : parseFloat(deliveredAdjustment) < 0 ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {parseFloat(deliveredAdjustment).toLocaleString()} kWh
                    </span>
                  ) : (
                    'Enter positive or negative value'
                  )}
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={handleApplyDeliveredAdjustment}
                disabled={parseFloat(deliveredAdjustment) === currentDeliveredAdj}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
            {currentDeliveredAdj !== 0 && (
              <div className="text-xs text-blue-600">
                Adjusted: {(adjustedDelivered / 1000).toFixed(1)} MWh
              </div>
            )}
          </div>

          {/* Customer Sales Adjustment */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Customer Sales</Label>
              <Badge variant="outline" className="text-xs">
                Base: {(baseCustomerSales / 1000).toFixed(1)} MWh
              </Badge>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={salesAdjustment}
                  onChange={(e) => setSalesAdjustment(e.target.value)}
                  placeholder="Adjustment in kWh"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {parseFloat(salesAdjustment) > 0 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{parseFloat(salesAdjustment).toLocaleString()} kWh
                    </span>
                  ) : parseFloat(salesAdjustment) < 0 ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {parseFloat(salesAdjustment).toLocaleString()} kWh
                    </span>
                  ) : (
                    'Enter positive or negative value'
                  )}
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={handleApplySalesAdjustment}
                disabled={parseFloat(salesAdjustment) === currentSalesAdj}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
            {currentSalesAdj !== 0 && (
              <div className="text-xs text-green-600">
                Adjusted: {(adjustedSales / 1000).toFixed(1)} MWh
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* BRS-8: Technical Loss Adjustment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Technical Loss %</span>
          </div>
          
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Technical Loss Percentage</Label>
              <Badge variant={hasOverride ? "default" : "secondary"} className="text-xs">
                {hasOverride ? 'Custom Override' : `Default: ${state.globalTechnicalLossPercent}%`}
              </Badge>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={techLossPercent}
                    onChange={(e) => setTechLossPercent(e.target.value)}
                    placeholder="Technical loss %"
                    className="text-sm pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasOverride 
                    ? `Overriding global default of ${state.globalTechnicalLossPercent}%`
                    : 'Set a custom technical loss % for this feeder'
                  }
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={handleApplyTechLoss}
                disabled={parseFloat(techLossPercent) === (currentTechLossOverride ?? state.globalTechnicalLossPercent)}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
            {hasOverride && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={handleResetTechLoss}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to Global Default ({state.globalTechnicalLossPercent}%)
              </Button>
            )}
          </div>
        </div>

        {/* Summary of Active Adjustments */}
        {(currentDeliveredAdj !== 0 || currentSalesAdj !== 0 || hasOverride) && (
          <>
            <Separator />
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Active Adjustments</div>
              <div className="flex flex-wrap gap-2">
                {currentDeliveredAdj !== 0 && (
                  <Badge variant="outline" className="text-xs">
                    Energy: {currentDeliveredAdj > 0 ? '+' : ''}{(currentDeliveredAdj / 1000).toFixed(1)} MWh
                  </Badge>
                )}
                {currentSalesAdj !== 0 && (
                  <Badge variant="outline" className="text-xs">
                    Sales: {currentSalesAdj > 0 ? '+' : ''}{(currentSalesAdj / 1000).toFixed(1)} MWh
                  </Badge>
                )}
                {hasOverride && (
                  <Badge variant="default" className="text-xs">
                    Tech Loss: {currentTechLossOverride}%
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
