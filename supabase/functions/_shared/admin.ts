// Shared helpers for admin-only edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Verifies the bearer token belongs to an admin user. Throws on failure. */
export async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Unauthorized");
  const supa = adminClient();
  const { data: userRes, error: uErr } = await supa.auth.getUser(token);
  if (uErr || !userRes?.user) throw new Error("Unauthorized");
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id);
  if (!roles?.some((r: { role: string }) => r.role === "admin")) throw new Error("Forbidden");
  return { supa, userId: userRes.user.id };
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]!,
  );
}

export async function sendCodeEmail(to: string, fullName: string, code: string) {
  try {
    // Send email via edge function that uses Supabase's native SMTP
    const res = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-access-email`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, fullName, code }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return { sent: false, reason: `Email send failed: ${body.slice(0, 200)}` };
    }

    return { sent: true };
  } catch (e) {
    return { sent: false, reason: (e as Error).message };
  }
}

export function randCode() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AUT-${seg()}-${seg()}`;
}
export function randPassword() {
  return crypto.randomUUID() + "Aa1!";
}
export function synthEmail() {
  return `user-${crypto.randomUUID()}@auto.industrialautomation.app`;
}
