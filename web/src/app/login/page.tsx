"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, messageOf, signup } from "@/lib/api";
import { setSession } from "@/lib/auth";
import type { User } from "@/data/mock";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { user: raw, token } =
        mode === "login"
          ? await login(email.trim(), password)
          : await signup(name.trim(), email.trim(), password);
      const user = raw as User;
      setSession(token, user);
      toast.success(mode === "login" ? "Welcome back" : "Account created");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(messageOf(err));
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] [background:radial-gradient(62%_52%_at_50%_0%,rgba(56,189,248,0.13),transparent)]"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-inset ring-white/10">
            TN
          </span>
          <span className="text-foreground text-sm font-semibold tracking-tight">TICKETNET</span>
        </div>

        <Card className="p-6">
          <CardContent className="p-0">
            <h1 className="text-foreground text-xl font-semibold tracking-tight">
              {mode === "login" ? "Sign in" : "Create an account"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {mode === "login"
                ? "Welcome back to the support desk."
                : "Accounts start with the Employee role."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1.5 h-10"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@corp.io"
                  className="mt-1.5 h-10"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-1.5 h-10"
                />
              </div>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {mode === "login" ? (
            <>
              <span className="text-muted-foreground">No account yet?</span>
              <button
                type="button"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
                onClick={() => setMode("signup")}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Already have an account?</span>
              <button
                type="button"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
                onClick={() => setMode("login")}
              >
                Sign in instead
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <CheckCircle2 className="mr-1 inline size-3.5 text-emerald-400" />
          Demo: use the Sign up form to create an employee account.
        </div>
      </div>
    </div>
  );
}