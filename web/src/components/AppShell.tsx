"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, LogOut, Plus, Ticket } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/tickets/new", label: "New Ticket", icon: Plus },
];

const ROLES = ["Employee", "Agent", "Admin"];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState("Employee");

  useEffect(() => {
    const id = setTimeout(() => {
      const r = window.localStorage.getItem("ticketnet_role");
      if (r) {
        setRole(r.charAt(0) + r.slice(1).toLowerCase());
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const selectRole = (label: string) => {
    window.localStorage.setItem("ticketnet_role", label.toUpperCase());
    setRole(label);
  };

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-[0.65rem] font-bold tracking-tight ring-1 ring-inset ring-white/10">
              TN
            </span>
            <span className="text-foreground text-sm font-semibold tracking-tight">TICKETNET</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 text-sm",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 px-1.5 hover:bg-accent data-[state=open]:bg-accent"
                >
                  <Avatar className="size-6 text-[0.6rem]">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {role.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground hidden text-xs sm:inline">{role}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ROLES.map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onSelect={() => selectRole(r)}
                    className={cn(r === role && "text-primary")}
                  >
                    {r}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="text-destructive focus:text-destructive">
                    <LogOut className="size-4" />
                    Sign out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}