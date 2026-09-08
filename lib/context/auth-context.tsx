"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  USERS,
  roleMap,
  roleHasCapability,
  type User,
  type Role,
  type CapabilityId,
} from "@/lib/data/access-data";

interface AuthContextValue {
  currentUser: User;
  currentRole: Role;
  users: User[];
  signInAs: (userId: string) => void;
  can: (capability: CapabilityId) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default session: the System Administrator is signed in.
  const [currentUserId, setCurrentUserId] = useState<string>(USERS[0].id);

  const value = useMemo<AuthContextValue>(() => {
    const currentUser = USERS.find((u) => u.id === currentUserId) ?? USERS[0];
    const currentRole = roleMap[currentUser.roleId];
    return {
      currentUser,
      currentRole,
      users: USERS,
      signInAs: setCurrentUserId,
      can: (capability: CapabilityId) => roleHasCapability(currentUser.roleId, capability),
    };
  }, [currentUserId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
