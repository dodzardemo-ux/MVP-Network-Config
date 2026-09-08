// Access-control sample data for the FBM MVP (NFR-Sec: RBAC & audit trail).
//
// Roles, capabilities, users and audit entries are static sample data so the
// security demonstration stays internally consistent across renders.

export type CapabilityId =
  | "view_dashboard"
  | "edit_network"
  | "manage_meters"
  | "resolve_exceptions"
  | "create_workorder"
  | "initiate_audit"
  | "export_reports"
  | "view_audit_log"
  | "manage_users";

export interface Capability {
  id: CapabilityId;
  label: string;
  description: string;
}

export const CAPABILITIES: Capability[] = [
  { id: "view_dashboard", label: "View dashboards", description: "Read loss dashboards, maps and balancing results" },
  { id: "edit_network", label: "Edit network", description: "Modify the OU / zone / substation / feeder hierarchy" },
  { id: "manage_meters", label: "Manage stats meters", description: "Import MV90 data and maintain the meter register" },
  { id: "resolve_exceptions", label: "Resolve exceptions", description: "Action and close data-validation exceptions" },
  { id: "create_workorder", label: "Log work orders", description: "Raise maintenance requests to the works system" },
  { id: "initiate_audit", label: "Initiate audits", description: "Open loss audits on worst-performing networks" },
  { id: "export_reports", label: "Export reports", description: "Generate and download loss reports" },
  { id: "view_audit_log", label: "View audit trail", description: "Read the system activity and audit log" },
  { id: "manage_users", label: "Manage users & roles", description: "Administer accounts, roles and permissions" },
];

export type RoleId =
  | "administrator"
  | "loss_analyst"
  | "regional_manager"
  | "data_steward"
  | "field_auditor";

export interface Role {
  id: RoleId;
  name: string;
  summary: string;
  capabilities: CapabilityId[];
}

export const ROLES: Role[] = [
  {
    id: "administrator",
    name: "System Administrator",
    summary: "Full platform access, including user and role administration.",
    capabilities: [
      "view_dashboard", "edit_network", "manage_meters", "resolve_exceptions",
      "create_workorder", "initiate_audit", "export_reports", "view_audit_log", "manage_users",
    ],
  },
  {
    id: "loss_analyst",
    name: "Loss Analyst",
    summary: "Investigates losses, resolves exceptions and raises work orders.",
    capabilities: [
      "view_dashboard", "resolve_exceptions", "create_workorder", "export_reports", "view_audit_log",
    ],
  },
  {
    id: "regional_manager",
    name: "Regional Manager",
    summary: "Oversees regional performance and authorises audits.",
    capabilities: ["view_dashboard", "initiate_audit", "export_reports", "view_audit_log"],
  },
  {
    id: "data_steward",
    name: "Data Steward",
    summary: "Maintains meter data quality and resolves data exceptions.",
    capabilities: ["view_dashboard", "manage_meters", "resolve_exceptions"],
  },
  {
    id: "field_auditor",
    name: "Field Auditor",
    summary: "Read-only access to dashboards and the audit trail.",
    capabilities: ["view_dashboard", "view_audit_log"],
  },
];

export const roleMap: Record<RoleId, Role> = ROLES.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<RoleId, Role>,
);

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: RoleId;
  region: string;
  lastLogin: string;
}

export const USERS: User[] = [
  { id: "u-thabo", name: "Thabo Mokoena", email: "thabo.mokoena@eskom.co.za", roleId: "administrator", region: "National", lastLogin: "2026-09-08 07:42" },
  { id: "u-naledi", name: "Naledi Dlamini", email: "naledi.dlamini@eskom.co.za", roleId: "loss_analyst", region: "Gauteng", lastLogin: "2026-09-08 08:15" },
  { id: "u-sipho", name: "Sipho Khumalo", email: "sipho.khumalo@eskom.co.za", roleId: "regional_manager", region: "Gauteng", lastLogin: "2026-09-07 16:03" },
  { id: "u-lerato", name: "Lerato Nkosi", email: "lerato.nkosi@eskom.co.za", roleId: "data_steward", region: "Gauteng", lastLogin: "2026-09-08 06:58" },
  { id: "u-johan", name: "Johan van der Merwe", email: "johan.vdm@eskom.co.za", roleId: "field_auditor", region: "Ekurhuleni", lastLogin: "2026-09-05 11:20" },
];

export const userMap: Record<string, User> = USERS.reduce(
  (acc, u) => ({ ...acc, [u.id]: u }),
  {} as Record<string, User>,
);

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function roleHasCapability(roleId: RoleId, cap: CapabilityId): boolean {
  return roleMap[roleId]?.capabilities.includes(cap) ?? false;
}

export type AuditOutcome = "success" | "denied";

export interface AuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  roleName: string;
  action: string;
  module: string;
  target: string;
  outcome: AuditOutcome;
}

// Deterministic recent activity, newest first. Includes a denied entry to show
// that access control is actually enforced and logged.
export const auditLog: AuditEntry[] = [
  { id: "a-014", timestamp: "2026-09-08 09:12:04", userName: "Thabo Mokoena", roleName: "System Administrator", action: "Updated role permissions", module: "Access & Audit", target: "Role: Data Steward", outcome: "success" },
  { id: "a-013", timestamp: "2026-09-08 09:03:47", userName: "Naledi Dlamini", roleName: "Loss Analyst", action: "Logged work order", module: "Work Orders", target: "WO to MAXIMO · Feeder LAN-3", outcome: "success" },
  { id: "a-012", timestamp: "2026-09-08 08:56:21", userName: "Naledi Dlamini", roleName: "Loss Analyst", action: "Resolved exception", module: "Data Validation", target: "EXC-2201 · CNL mismatch", outcome: "success" },
  { id: "a-011", timestamp: "2026-09-08 08:44:10", userName: "Johan van der Merwe", roleName: "Field Auditor", action: "Attempted work order creation", module: "Work Orders", target: "Feeder AKA-2", outcome: "denied" },
  { id: "a-010", timestamp: "2026-09-08 08:31:55", userName: "Sipho Khumalo", roleName: "Regional Manager", action: "Initiated loss audit", module: "Work Orders", target: "Feeder AKA-2 · 41% NTL", outcome: "success" },
  { id: "a-009", timestamp: "2026-09-08 08:20:33", userName: "Lerato Nkosi", roleName: "Data Steward", action: "Imported MV90 stats data", module: "Stats Meters", target: "Batch 2026-09-08 · 428 meters", outcome: "success" },
  { id: "a-008", timestamp: "2026-09-08 08:15:02", userName: "Naledi Dlamini", roleName: "Loss Analyst", action: "Exported consolidated report", module: "Reports", target: "Consolidated Loss Report (CSV)", outcome: "success" },
  { id: "a-007", timestamp: "2026-09-08 07:58:44", userName: "Lerato Nkosi", roleName: "Data Steward", action: "Signed in", module: "Authentication", target: "Session started", outcome: "success" },
  { id: "a-006", timestamp: "2026-09-08 07:49:19", userName: "Johan van der Merwe", roleName: "Field Auditor", action: "Attempted network edit", module: "Configure Network", target: "Zone: Johannesburg", outcome: "denied" },
  { id: "a-005", timestamp: "2026-09-08 07:42:08", userName: "Thabo Mokoena", roleName: "System Administrator", action: "Signed in", module: "Authentication", target: "Session started", outcome: "success" },
  { id: "a-004", timestamp: "2026-09-07 16:39:51", userName: "Sipho Khumalo", roleName: "Regional Manager", action: "Viewed loss dashboard", module: "Dashboard", target: "Gauteng heat map", outcome: "success" },
  { id: "a-003", timestamp: "2026-09-07 16:12:27", userName: "Thabo Mokoena", roleName: "System Administrator", action: "Created user account", module: "Access & Audit", target: "User: Lerato Nkosi", outcome: "success" },
  { id: "a-002", timestamp: "2026-09-07 15:47:03", userName: "Naledi Dlamini", roleName: "Loss Analyst", action: "Adjusted loss thresholds", module: "Dashboard", target: "Low/Med/High thresholds", outcome: "success" },
  { id: "a-001", timestamp: "2026-09-07 15:30:00", userName: "Thabo Mokoena", roleName: "System Administrator", action: "Configured feeder hierarchy", module: "Configure Network", target: "Substation: Lanseria", outcome: "success" },
];
