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

export function AdminSessionGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      toast.error("Connect Supabase before signing in.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    await checkAccess();
    setSubmitting(false);
    form.reset();
    window.location.reload();
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
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void signIn(event.currentTarget);
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  required
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
