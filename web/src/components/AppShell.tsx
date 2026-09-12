"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { logout } from "@/lib/api";
import { clearSession, getSessionUser, getToken } from "@/lib/auth";

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getSessionUser>>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!getToken()) {
        router.replace("/login");
        return;
      }
      setUser(getSessionUser());
    }, 0);
    return () => clearTimeout(id);
  }, [router]);

  const signOut = async () => {
    try {
      await logout();
    } catch {
      // ignore network/API errors on sign-out; clear local session regardless
    }
    clearSession();
    router.replace("/");
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
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-sm">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                <span className="hidden sm:inline">Overview</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-sm">
              <Link href="/tickets">
                <Ticket className="size-4" />
                <span className="hidden sm:inline">Tickets</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-sm">
              <Link href="/tickets/new">
                <Plus className="size-4" />
                <span className="hidden sm:inline">New ticket</span>
              </Link>
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-1.5 hover:bg-accent data-[state=open]:bg-accent">
                  <Avatar className="size-6 text-[0.6rem]">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {user ? user.name.slice(0, 2).toUpperCase() : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground hidden text-xs sm:inline">
                    {user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="text-muted-foreground">
                  {user?.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => void signOut()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sign out
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