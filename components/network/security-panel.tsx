"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import {
  ROLES,
  CAPABILITIES,
  USERS,
  auditLog,
  initials,
  roleHasCapability,
} from "@/lib/data/access-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Check, Minus, ShieldCheck, Users, KeyRound, ShieldAlert } from "lucide-react";

function KpiCard({
  icon: Icon, label, value, hint,
}: { icon: React.ElementType; label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SecurityPanel() {
  const { currentUser, currentRole } = useAuth();
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const deniedCount = auditLog.filter((a) => a.outcome === "denied").length;

  const modules = useMemo(
    () => ["all", ...Array.from(new Set(auditLog.map((a) => a.module)))],
    [],
  );
  const filteredLog = useMemo(
    () => (moduleFilter === "all" ? auditLog : auditLog.filter((a) => a.module === moduleFilter)),
    [moduleFilter],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Access &amp; Audit</h2>
        <p className="text-muted-foreground">
          Role-based access control and a tamper-evident activity trail (NFR-Sec).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Active users" value={String(USERS.length)} hint="Across 5 role types" />
        <KpiCard icon={ShieldCheck} label="Roles" value={String(ROLES.length)} hint="Least-privilege model" />
        <KpiCard icon={KeyRound} label="Capabilities" value={String(CAPABILITIES.length)} hint="Granular permissions" />
        <KpiCard icon={ShieldAlert} label="Denied attempts" value={String(deniedCount)} hint="Blocked & logged" />
      </div>

      {/* Current session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current session</CardTitle>
          <CardDescription>The signed-in user and their effective permissions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">{currentRole.name}</Badge>
                <span className="text-xs text-muted-foreground">
                  {currentUser.region} · last login {currentUser.lastLogin}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:max-w-md sm:justify-end">
            {currentRole.capabilities.map((cap) => (
              <Badge key={cap} variant="outline" className="font-normal">
                {CAPABILITIES.find((c) => c.id === cap)?.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RBAC matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role permission matrix</CardTitle>
          <CardDescription>
            Capabilities granted to each role. Your active role is highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card">Role</TableHead>
                {CAPABILITIES.map((c) => (
                  <TableHead key={c.id} className="min-w-[96px] px-2 text-center align-bottom">
                    <span className="mx-auto block text-xs leading-tight text-pretty">{c.label}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROLES.map((role) => {
                const isActive = role.id === currentRole.id;
                return (
                  <TableRow key={role.id} className={isActive ? "bg-primary/5" : undefined}>
                    <TableCell className={`sticky left-0 bg-card ${isActive ? "font-semibold" : "font-medium"}`}>
                      <span className="whitespace-nowrap">{role.name}</span>
                      {isActive && <Badge className="ml-2 align-middle">You</Badge>}
                    </TableCell>
                    {CAPABILITIES.map((c) => {
                      const allowed = roleHasCapability(role.id, c.id);
                      return (
                        <TableCell key={c.id} className="text-center">
                          {allowed ? (
                            <Check className="mx-auto h-4 w-4 text-green-600" aria-label="Allowed" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" aria-label="Not allowed" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit trail */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Audit trail</CardTitle>
            <CardDescription>Every privileged action is recorded with user, role and outcome.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {modules.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModuleFilter(m)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  moduleFilter === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {m === "all" ? "All modules" : m}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLog.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {entry.timestamp}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{entry.userName}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{entry.roleName}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{entry.module}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.target}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={entry.outcome === "denied" ? "destructive" : "secondary"}
                      className="capitalize"
                    >
                      {entry.outcome}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
