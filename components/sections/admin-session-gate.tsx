"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthState = "loading" | "disconnected" | "signed-out" | "unauthorized" | "admin";
type LoginNotice = { type: "success" | "error"; message: string } | null;

export function AdminSessionGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<LoginNotice>(null);

  async function checkAccess() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return setState("disconnected");

    const { data } = await supabase.auth.getUser();
    if (!data.user) return setState("signed-out");

    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", data.user.id)
      .eq("active", true)
      .maybeSingle();

    setState(profile ? "admin" : "unauthorized");
  }

  useEffect(() => {
    void checkAccess();
  }, []);

  async function signIn(form: HTMLFormElement) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setNotice({ type: "error", message: "Supabase is not connected yet." });
      toast.error("Connect Supabase before signing in.");
      return;
    }

    setSubmitting(true);
    setNotice(null);
    const normalizedUsername = username.trim().toLowerCase();
    const email = normalizedUsername.includes("@")
      ? normalizedUsername
      : `${normalizedUsername}@sportx2026.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      setNotice({
        type: "error",
        message: "Login failed. Check the username and password exactly, then try again.",
      });
      toast.error(error.message);
      return;
    }

    setNotice({ type: "success", message: "Signed in. Loading admin dashboard..." });
    toast.success("Signed in.");
    await checkAccess();
    setSubmitting(false);
    form.reset();
    window.setTimeout(() => window.location.reload(), 300);
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setState("signed-out");
  }

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  if (state !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Admin Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state === "disconnected" ? (
              <p className="mb-5 text-sm text-muted-foreground">
                Connect this app to Supabase before signing in. Add the project URL
                and keys to <code>.env.local</code>, then create the first admin.
              </p>
            ) : state === "unauthorized" ? (
              <p className="mb-5 text-sm text-muted-foreground">
                This account is not an active SportX admin. Ask the first super admin
                to add it to admin_profiles.
              </p>
            ) : null}
            {notice ? (
              <div
                className={
                  notice.type === "success"
                    ? "mb-5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
                    : "mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                }
                role="status"
              >
                {notice.message}
              </div>
            ) : null}
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void signIn(event.currentTarget);
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use <code>hariadminaccess</code> or <code>sportx26admin</code>.
                  No email address is needed.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={submitting || state === "disconnected"}>
                <LogIn className="h-4 w-4" />
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
              {state === "unauthorized" ? (
                <Button type="button" variant="ghost" onClick={() => void signOut()}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
