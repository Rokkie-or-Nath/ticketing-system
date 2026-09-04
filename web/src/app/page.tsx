"use client";

import { usePageTransition } from "@/components/PageTransition";
import { ChevronRightIcon } from "@/components/icons";

const ROLES = [
  { key: "EMPLOYEE", title: "Employee", desc: "File and track your requests", avatar: "EM" },
  { key: "AGENT", title: "Agent", desc: "Triage and resolve tickets", avatar: "AG" },
  { key: "ADMIN", title: "Admin", desc: "Full platform access", avatar: "AD" },
];

export default function LoginPage() {
  const navigate = usePageTransition();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-slate-200">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="bg-slate-800 ring-white/5 flex size-11 items-center justify-center rounded-xl text-sm font-bold text-white ring-1 ring-inset">
            TN
          </span>
          <h1 className="text-white mt-5 text-xl font-semibold">Welcome to TICKETNET</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to continue to your support desk.</p>
        </div>

        <div className="fx-card bg-slate-900/50 border-slate-800 mt-8 rounded-2xl border p-2">
          {ROLES.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => {
                window.localStorage.setItem("ticketnet_role", role.key);
                navigate("/dashboard");
              }}
              className="fx-row hover:bg-slate-800/50 group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors"
            >
              <span className="ring-white/5 bg-slate-800/80 text-slate-200 flex size-9 items-center justify-center rounded-lg text-xs font-semibold ring-1 ring-inset">
                {role.avatar}
              </span>
              <span className="flex-1">
                <span className="text-white block text-sm font-medium">{role.title}</span>
                <span className="text-slate-500 block text-xs">{role.desc}</span>
              </span>
              <ChevronRightIcon className="text-slate-500 group-hover:text-white size-4 transition-colors" />
            </button>
          ))}
        </div>

        <p className="text-slate-600 mt-6 text-center text-xs">
          Demo environment — no credentials required.
        </p>
      </div>
    </div>
  );
}