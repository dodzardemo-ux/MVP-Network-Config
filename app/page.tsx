"use client";

import { NetworkProvider } from "@/lib/context/network-context";
import { NetworkTree } from "@/components/network/network-tree";
import { DetailsPanel } from "@/components/network/details-panel";
import { CalculationPanel } from "@/components/network/calculation-panel";
import { LossDashboard } from "@/components/network/loss-dashboard";
import { CDUAllocationPanel } from "@/components/network/cdu-allocation-panel";
import { NetworkMappingCanvas } from "@/components/network/network-mapping-canvas";
import { DashboardPanel } from "@/components/network/dashboard-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Calculator, BarChart3, Gauge, Waypoints, LayoutDashboard } from "lucide-react";

function NetworkConfigContent() {
  return (
    <Tabs defaultValue="dashboard" className="h-full flex flex-col">
      {/* Eskom-aligned brand bar: blue-to-green gradient, white logo, italic tagline */}
      <div className="bg-gradient-to-r from-[#00499b] via-[#1a7fb5] to-[#43a935] px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/eskom-logo-white.gif"
              alt="Eskom — Powering your world"
              className="h-8 w-auto"
            />
            <div className="h-7 w-px bg-white/40" aria-hidden="true" />
            <span className="font-brand text-lg font-semibold text-white">
              Feeder Balancing Module
            </span>
          </div>
          <p className="hidden font-serif text-lg italic text-white md:block">
            Redefining for a <span className="font-bold not-italic">better future.</span>
          </p>
        </div>
      </div>

      {/* Navigation row */}
      <div className="border-b px-6 py-2 bg-background">
        <div className="flex items-center justify-end">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="configure" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Configure Network
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center gap-2">
              <Waypoints className="h-4 w-4" />
              Network Mapping
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

      <TabsContent value="dashboard" className="flex-1 m-0 p-6 overflow-auto">
        <DashboardPanel />
      </TabsContent>

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

      <TabsContent value="mapping" className="flex-1 m-0 p-6 overflow-hidden">
        <NetworkMappingCanvas />
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
