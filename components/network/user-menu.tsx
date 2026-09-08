"use client";

import { useAuth } from "@/lib/context/auth-context";
import { initials } from "@/lib/data/access-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, LogOut, UserCog } from "lucide-react";

export function UserMenu() {
  const { currentUser, currentRole, users, signInAs } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label={`Signed in as ${currentUser.name}`}
        >
          <span className="relative">
            <Avatar className="h-8 w-8 border border-white/40">
              <AvatarFallback className="bg-white/20 text-xs font-semibold text-white">
                {initials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1a7fb5] bg-green-400"
              aria-hidden="true"
            />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-xs font-medium">{currentUser.name}</span>
            <span className="block text-[11px] text-white/70">{currentRole.name}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">{currentUser.email}</span>
            <span className="mt-1 text-xs text-muted-foreground">
              {currentRole.name} · {currentUser.region}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <UserCog className="h-3.5 w-3.5" />
          Switch role (demo)
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {users.map((u) => {
            const active = u.id === currentUser.id;
            return (
              <DropdownMenuItem
                key={u.id}
                onClick={() => signInAs(u.id)}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex flex-col">
                  <span className="text-sm">{u.name}</span>
                  <span className="text-xs text-muted-foreground">{u.roleId.replace(/_/g, " ")}</span>
                </span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
