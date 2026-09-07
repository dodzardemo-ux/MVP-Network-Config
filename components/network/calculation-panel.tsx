"use client"

import { useNetwork } from "@/lib/context/network-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calculator, TrendingDown, Zap, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function CalculationPanel() {
  const { state, setGlobalTechLoss, calculateLosses } = useNetwork()
  const { globalTechnicalLossPercent, lossResults, isCalculating } = state
  const [localTechLoss, setLocalTechLoss] = useState(globalTechnicalLossPercent.toString())

  const handleCalculate = () => {
    const techLoss = parseFloat(localTechLoss)
    if (!isNaN(techLoss) && techLoss >= 0 && techLoss <= 100) {
      setGlobalTechLoss(techLoss)
      // Small delay to allow state to update
      setTimeout(() => {
        calculateLosses()
      }, 10)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-ZA", {
      maximumFractionDigits: 0
    }).format(num)
  }

  const getLossColor = (percent: number) => {
    if (percent > 20) return "text-red-600"
    if (percent > 15) return "text-orange-500"
    if (percent > 10) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Loss Calculation</CardTitle>
          </div>
          <CardDescription>
            Configure technical loss percentage and calculate network losses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tech-loss">Technical Loss Percentage (%)</Label>
            <div className="flex gap-2">
              <Input
                id="tech-loss"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={localTechLoss}
                onChange={(e) => setLocalTechLoss(e.target.value)}
                placeholder="10"
                className="w-32"
              />
              <Button onClick={handleCalculate} disabled={isCalculating}>
                {isCalculating ? "Calculating..." : "Calculate Losses"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Default is 10%. This represents the expected technical (line) losses in the distribution network.
            </p>
          </div>
        </CardContent>
      </Card>

      {lossResults && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Energy Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Energy Delivered (from Stats Meters)</span>
                  </div>
                  <span className="font-mono font-bold">
                    {formatNumber(lossResults.energyDelivered)} kWh
                  </span>
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Total Customer Sales</span>
                  </div>
                  <span className="font-mono font-bold">
                    {formatNumber(lossResults.customerSales)} kWh
                  </span>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Technical Losses ({lossResults.technicalLossPercent.toFixed(1)}%)</span>
                  </div>
                  <span className="font-mono font-bold">
                    {formatNumber(lossResults.technicalLoss)} kWh
                  </span>
                </div>
                
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="font-medium">Non-Technical Losses</span>
                  </div>
                  <span className={`font-mono text-lg font-bold ${getLossColor(lossResults.nonTechnicalLossPercent)}`}>
                    {formatNumber(lossResults.nonTechnicalLoss)} kWh
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                <CardTitle>Loss Metrics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <div className={`text-3xl font-bold ${getLossColor(lossResults.technicalLossPercent + lossResults.nonTechnicalLossPercent)}`}>
                    {(lossResults.technicalLossPercent + lossResults.nonTechnicalLossPercent).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Total Loss</div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className={`text-3xl font-bold ${getLossColor(lossResults.nonTechnicalLossPercent)}`}>
                    {lossResults.nonTechnicalLossPercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Non-Technical Loss</div>
                </div>
              </div>
              
              {lossResults.nonTechnicalLossPercent > 15 && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800">High Loss Alert</p>
                    <p className="text-orange-700">
                      Non-technical losses exceed 15%. Review feeder-level data for anomalies.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!lossResults && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Calculator className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p>Enter a technical loss percentage and click &quot;Calculate Losses&quot; to see results.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
