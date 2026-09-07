"use client";

import { NetworkProvider } from "@/lib/context/network-context";
import { NetworkTree } from "@/components/network/network-tree";
import { DetailsPanel } from "@/components/network/details-panel";
import { CalculationPanel } from "@/components/network/calculation-panel";
import { LossDashboard } from "@/components/network/loss-dashboard";
import { CDUAllocationPanel } from "@/components/network/cdu-allocation-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Calculator, BarChart3, Gauge } from "lucide-react";

function NetworkConfigContent() {
  return (
    <Tabs defaultValue="configure" className="h-full flex flex-col">
      <div className="border-b px-6 py-4 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Feeder Balancing Module</h1>
            <p className="text-muted-foreground">
              Configure network topology, calculate and analyze distribution losses
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="configure" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Configure Network
            </TabsTrigger>
            <TabsTrigger value="calculate" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculate Losses
            </TabsTrigger>
            <TabsTrigger value="cdu" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              CDU Allocation
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View Results
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="configure" className="flex-1 m-0 overflow-hidden">
        <div className="flex h-full">
          <div className="w-80 min-w-64 max-w-96 h-full border-r bg-muted/30 overflow-hidden">
            <NetworkTree />
          </div>
          <div className="flex-1 h-full overflow-auto p-6">
            <DetailsPanel />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="calculate" className="flex-1 m-0 p-6 overflow-auto">
        <CalculationPanel />
      </TabsContent>

      <TabsContent value="cdu" className="flex-1 m-0 p-6 overflow-auto">
        <CDUAllocationPanel />
      </TabsContent>

      <TabsContent value="results" className="flex-1 m-0 p-6 overflow-auto">
        <LossDashboard />
      </TabsContent>
    </Tabs>
  );
}

export default function NetworkConfigPage() {
  return (
    <NetworkProvider>
      <div className="h-screen flex flex-col bg-background">
        <NetworkConfigContent />
      </div>
    </NetworkProvider>
  );
}
