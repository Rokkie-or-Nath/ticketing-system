"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogOutIcon } from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/tickets", label: "Tickets" },
  { href: "/tickets/new", label: "New Ticket" },
];

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

  return (
    <div className="flex min-h-screen flex-col text-slate-200">
      <header className="bg-slate-950/80 border-b border-slate-800/70 sticky top-0 z-30 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="ring-white/5 flex size-7 items-center justify-center rounded-md bg-slate-800 text-[0.65rem] font-bold tracking-tight text-white ring-1 ring-inset">
              TN
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">TICKETNET</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`fx-nav rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active ? "fx-nav-active text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="border-slate-800 bg-slate-900/60 hidden items-center gap-2 rounded-full border py-1 pl-1 pr-3 sm:flex">
              <span className="ring-sky-500/20 flex size-6 items-center justify-center rounded-full bg-sky-500/10 text-[0.6rem] font-semibold text-sky-400 ring-1 ring-inset">
                {role.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs text-slate-300">{role}</span>
            </span>
            <Link
              href="/"
              title="Sign out"
              className="fx-nav text-slate-400 hover:bg-slate-800/60 hover:text-white flex size-8 items-center justify-center rounded-md transition-colors"
            >
              <LogOutIcon className="size-4" />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}