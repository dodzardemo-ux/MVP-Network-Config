"use client";

import { NetworkProvider } from "@/lib/context/network-context";
import { AuthProvider } from "@/lib/context/auth-context";
import { NetworkTree } from "@/components/network/network-tree";
import { DetailsPanel } from "@/components/network/details-panel";
import { NetworkMappingCanvas } from "@/components/network/network-mapping-canvas";
import { DashboardPanel } from "@/components/network/dashboard-panel";
import { StatsMeterPanel } from "@/components/network/stats-meter-panel";
import { ReportPanel } from "@/components/network/report-panel";
import { TraceabilityPanel } from "@/components/network/traceability-panel";
import { SecurityPanel } from "@/components/network/security-panel";
import { UserMenu } from "@/components/network/user-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Waypoints, LayoutDashboard, RadioTower, FileBarChart, ListChecks, ShieldCheck } from "lucide-react";

function NetworkConfigContent() {
  return (
    <Tabs defaultValue="dashboard" className="h-full flex flex-col">
      {/* Eskom-aligned brand bar: blue-to-green gradient, white logo, italic tagline, embedded nav */}
      <div className="bg-gradient-to-r from-[#00499b] via-[#1a7fb5] to-[#43a935]">
        <div className="flex items-center justify-between gap-4 px-6 pt-3">
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
          <div className="flex items-center gap-4">
            <p className="hidden font-serif text-lg italic text-white lg:block">
              Redefining for a <span className="font-bold not-italic">better future.</span>
            </p>
            <div className="h-7 w-px bg-white/40" aria-hidden="true" />
            <UserMenu />
          </div>
        </div>

        {/* Navigation row embedded in the gradient */}
        <div className="px-6">
            <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
            {[
              { value: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
              { value: "configure", label: "Configure Network", Icon: Network },
              { value: "mapping", label: "Network Mapping", Icon: Waypoints },
              { value: "meters", label: "Stats Meters", Icon: RadioTower },
              { value: "reports", label: "Reports", Icon: FileBarChart },
              { value: "access", label: "Access & Audit", Icon: ShieldCheck },
              { value: "traceability", label: "Traceability", Icon: ListChecks },
            ].map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2 font-medium text-white/80 shadow-none transition-colors hover:border-white hover:text-white data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
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

      <TabsContent value="meters" className="flex-1 m-0 p-6 overflow-auto">
        <StatsMeterPanel />
      </TabsContent>

      <TabsContent value="reports" className="flex-1 m-0 p-6 overflow-auto">
        <ReportPanel />
      </TabsContent>

      <TabsContent value="access" className="flex-1 m-0 p-6 overflow-auto">
        <SecurityPanel />
      </TabsContent>

      <TabsContent value="traceability" className="flex-1 m-0 p-6 overflow-auto">
        <TraceabilityPanel />
      </TabsContent>
    </Tabs>
  );
}

export default function NetworkConfigPage() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <div className="h-screen flex flex-col bg-background">
          <NetworkConfigContent />
        </div>
      </NetworkProvider>
    </AuthProvider>
  );
}
