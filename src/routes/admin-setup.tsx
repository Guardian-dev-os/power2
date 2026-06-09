import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Lock } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin-setup")({ component: AdminSetup });

function AdminSetup() {
  const nav = useNavigate();
  const [exists, setExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"create" | "signin">(() => {
    if (typeof window === "undefined") return "create";
    return window.location.search.includes("finish=1") ||
      localStorage.getItem("pe1_admin_setup_pending") === "1"
      ? "signin"
      : "create";
  });

  useEffect(() => {
    supabase.rpc("admin_exists").then(({ data }) => setExists(!!data));
  }, []);

  const claimAfterAuth = async () => {
    const { data, error } = await supabase.rpc("claim_admin");
    if (error) {
      toast.error(error.message);
      return false;
    }
    const r = data as { success: boolean; error?: string };
    if (!r.success) {
      toast.error(r.error || "Could not claim admin");
      return false;
    }
    return true;
  };

  const signUp = async () => {
    setBusy(true);
    const { data: sd, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin-setup?finish=1`,
        data: { full_name: name || "Administrator" },
      },
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    if (sd.session) {
      const ok = await claimAfterAuth();
      setBusy(false);
      if (ok) {
        toast.success(
          exists ? "Admin credentials reset _ you are now the admin" : "Admin account created",
        );
        nav({ to: "/admin" });
      }
    } else {
      setBusy(false);
      localStorage.setItem("pe1_admin_setup_pending", "1");
      setMode("signin");
      toast.success(
        "Account created. Confirm your email, then sign in here to finish admin setup.",
      );
    }
  };

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    const ok = await claimAfterAuth();
    setBusy(false);
    if (ok) {
      localStorage.removeItem("pe1_admin_setup_pending");
      toast.success("Welcome, Administrator");
      nav({ to: "/admin" });
    }
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card text-card-foreground shadow-card-elev">
        <Link to="/" className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-14" />
        </Link>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-secondary">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Admin Portal</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {mode === "signin" ? (
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Sign in to finish administrator setup
              </span>
            ) : exists === null ? (
              "Checking..."
            ) : exists ? (
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Sign in with your administrator credentials
              </span>
            ) : (
              "First-time setup — create the administrator account"
            )}
          </p>
        </div>

        {exists || mode === "signin" ? (
          <div className="space-y-3 mt-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={signIn} disabled={busy} className="w-full bg-brand-gradient">
              Sign in
            </Button>
            {exists === false && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("create")}
                className="w-full"
              >
                Create a different admin account
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={signUp} disabled={busy} className="w-full bg-brand-gradient">
              Create administrator account
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
