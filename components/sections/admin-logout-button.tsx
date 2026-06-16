"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLogoutButton() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data }) => {
      setIsSignedIn(Boolean(data.user));
    });
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsSigningOut(false);
      toast.error(error.message);
      return;
    }

    toast.success("Signed out.");
    window.location.href = "/admin";
  }

  if (!isSignedIn) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => void signOut()}
      disabled={isSigningOut}
    >
      <LogOut className="h-4 w-4" />
      {isSigningOut ? "Signing Out..." : "Logout"}
    </Button>
  );
}
