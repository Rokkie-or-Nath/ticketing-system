"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Ticket,
  Timer,
} from "lucide-react";
import { usePageTransition } from "@/components/PageTransition";
import PageContainer from "@/components/PageContainer";
import { useTheme } from "@/components/ThemeProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type Priority } from "@/data/mock";
import { logout } from "@/lib/api";
import { clearSession, getSessionUser, getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="size-4 shrink-0" /> },
  { href: "/tickets", label: "Ticket queue", icon: <Inbox className="size-4 shrink-0" /> },
  { href: "/tickets/new", label: "New ticket", icon: <Plus className="size-4 shrink-0" /> },
];

const SLA_ROWS: { priority: Priority; response: string; resolution: string }[] = [
  { priority: "critical", response: "15m", resolution: "4h" },
  { priority: "high", response: "30m", resolution: "8h" },
  { priority: "medium", response: "2h", resolution: "24h" },
  { priority: "low", response: "8h", resolution: "48h" },
];

const PRIORITY_DOT: Record<Priority, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-info",
  low: "bg-success",
};

/** Build breadcrumb segments from a pathname. */
function useBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.startsWith("TK-") ? seg : seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

function NavItems({
  collapsed,
  isActive,
  onNavigate,
}: {
  collapsed: boolean;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-0.5 px-2 py-3">
      {!collapsed && (
        <p className="px-2 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Workspace
        </p>
      )}
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={cn(
            "fx-nav",
            collapsed && "justify-center px-0",
            isActive(item.href) && "fx-nav-active"
          )}
        >
          {item.icon}
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
}

function SlaPanel({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/60">
        <Timer className="size-3" />
        SLA targets
      </p>
      <div className="mt-2 space-y-1.5 text-xs">
        {SLA_ROWS.map((row) => (
          <div key={row.priority} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
              <span className={cn("size-1.5 rounded-full", PRIORITY_DOT[row.priority])} />
              {row.priority}
            </span>
            <span className="font-mono text-sidebar-foreground/70">
              {row.response} / {row.resolution}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const navigate = usePageTransition();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<ReturnType<typeof getSessionUser>>(null);
  const [jump, setJump] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ticketnet_sidebar");
    if (saved === "collapsed") setCollapsed(true);
  }, []);

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

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("ticketnet_sidebar", next ? "collapsed" : "expanded");
  };

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href === "/tickets") {
      return pathname.startsWith("/tickets/") && pathname !== "/tickets/new";
    }
    return false;
  };

  const signOut = async () => {
    try { await logout(); } catch { /* ignore */ }
    clearSession();
    router.replace("/");
  };

  const jumpTo = (e: FormEvent) => {
    e.preventDefault();
    const q = jump.trim();
    if (!q) return;
    if (/^TK-\d+$/i.test(q)) {
      navigate(`/tickets/${q.toUpperCase()}`);
    } else {
      navigate(`/tickets?q=${encodeURIComponent(q)}`);
    }
    setJump("");
  };

  const breadcrumbs = useBreadcrumbs(pathname);
  const initials = user ? user.name.slice(0, 2).toUpperCase() : "??";

  return (
    <div className="flex min-h-screen text-foreground">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-12 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-0" : "px-3 gap-2"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
              <Ticket className="size-4" />
            </span>
            {!collapsed && (
              <span className="text-sidebar-foreground text-sm font-semibold tracking-tight truncate">
                TICKETNET
              </span>
            )}
          </Link>
        </div>

        <NavItems collapsed={collapsed} isActive={isActive} />
        <SlaPanel collapsed={collapsed} />

        {/* User footer */}
        <div className={cn(
          "flex items-center border-t border-sidebar-border px-3 py-3",
          collapsed ? "justify-center" : "gap-2"
        )}>
          <Avatar className="size-7 shrink-0 text-[0.6rem]">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-[0.6rem]">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-foreground truncate text-xs font-semibold">
                {user?.name ?? "—"}
              </p>
              <p className="text-muted-foreground text-[0.65rem] capitalize">
                {user?.role ?? ""}
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className={cn(
            "flex items-center justify-center border-t border-sidebar-border py-2 text-muted-foreground",
            "hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-xs gap-1"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="size-3.5" />
            : <><ChevronLeft className="size-3.5" /><span>Collapse</span></>
          }
        </button>
      </aside>

      {/* ── Content column ──────────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden size-8 shrink-0">
                <Menu className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-3 py-3">
                  <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-7 items-center justify-center rounded-md">
                    <Ticket className="size-4" />
                  </span>
                  <SheetTitle className="text-sm font-semibold tracking-tight">TICKETNET</SheetTitle>
                </div>
              </SheetHeader>
              <NavItems
                collapsed={false}
                isActive={isActive}
                onNavigate={() => setMobileOpen(false)}
              />
              <SlaPanel collapsed={false} />
              <div className="flex items-center gap-2 border-t border-sidebar-border px-3 py-3">
                <Avatar className="size-7 text-[0.6rem]">
                  <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-[0.6rem]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sidebar-foreground truncate text-xs font-semibold">{user?.name ?? "—"}</p>
                  <p className="text-muted-foreground text-[0.65rem] capitalize">{user?.role ?? ""}</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Search */}
          <form onSubmit={jumpTo} className="relative min-w-0 flex-1 max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
            <Input
              value={jump}
              onChange={(e) => setJump(e.target.value)}
              placeholder="Jump to ticket…"
              className="h-8 pl-8 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-background"
            />
          </form>

          <div className="ml-auto flex items-center gap-1">
            {/* New ticket shortcut */}
            <Button asChild size="sm" className="hidden sm:flex h-8 gap-1.5 px-3">
              <Link href="/tickets/new">
                <Plus className="size-3.5" />
                New ticket
              </Link>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              {resolvedTheme === "dark"
                ? <Sun className="size-4" />
                : <Moon className="size-4" />
              }
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 h-8 data-[state=open]:bg-accent">
                  <span className="hidden text-sm text-muted-foreground sm:inline">
                    {user?.name?.split(" ")[0] ?? ""}
                  </span>
                  <Avatar className="size-6 text-[0.6rem]">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-[0.6rem]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Signed in as
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="text-sm">
                  {user?.name}
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => void signOut()}
                  className="text-destructive focus:text-destructive gap-2"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="border-b border-border/50 bg-background/60 px-5 py-2">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => (
                  <BreadcrumbItem key={crumb.href}>
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                        {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        <main className="flex-1 py-6">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
