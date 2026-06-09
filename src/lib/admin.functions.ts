import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

async function requireAdminRole(userId: string) {
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  if (!roles?.some((row) => row.role === "admin")) {
    throw new Error("Forbidden: admin role required");
  }
}

export async function listAccessRequests(filter: "pending" | "all" = "all") {
  let query = supabase
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filter === "pending") {
    query = query.eq("status", "pending");
  }

  const { data: rows, error } = await query;
  if (error) throw new Error(error.message);
  return { rows: rows ?? [] };
}

export async function deleteAccessRequest(id: string) {
  if (!z.string().uuid().safeParse(id).success) {
    throw new Error("Invalid UUID");
  }
  const { error } = await supabase.from("access_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getAppSettings() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { data: data ?? null };
}

export async function saveAppSettings(settings: Record<string, any>) {
  const { error } = await supabase
    .from("app_settings")
    .update(settings as any)
    .eq("id", true);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listAgents() {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { rows: data ?? [] };
}

export async function addAgent(agent: { name: string; phone: string; email?: string }) {
  const { data, error } = await supabase
    .from("agents")
    .insert([agent as any])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { data };
}

export async function updateAgent(id: string, updates: Record<string, any>) {
  const { error } = await supabase
    .from("agents")
    .update(updates as any)
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteAgent(id: string) {
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
