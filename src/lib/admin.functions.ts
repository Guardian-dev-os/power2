import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export async function listAccessRequests(filter: "pending" | "all" = "all") {
  let query = (supabase as any)
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
  const { error } = await (supabase as any).from("access_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function getAppSettings() {
  const { data, error } = await (supabase as any)
    .from("app_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { data: data ?? null, settings: data ?? null };
}

export async function saveAppSettings(settings: Record<string, any>) {
  const { error } = await (supabase as any)
    .from("app_settings")
    .update(settings)
    .eq("id", true);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listAgents() {
  const { data, error } = await (supabase as any)
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { rows: data ?? [], agents: data ?? [] };
}

export async function addAgent(agent: { name: string; contact?: string; phone?: string; email?: string }) {
  const row: any = { name: agent.name, contact: agent.contact ?? agent.phone ?? null };
  const { data, error } = await (supabase as any)
    .from("agents")
    .insert([row])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { data };
}

export async function updateAgent(id: string, updates?: Record<string, any>) {
  // Support both updateAgent(id, updates) and updateAgent({id, ...updates})
  let theId = id;
  let theUpdates = updates;
  if (typeof id === "object" && id !== null) {
    const obj: any = id;
    theId = obj.id;
    const { id: _ignored, ...rest } = obj;
    theUpdates = rest;
  }
  const { error } = await (supabase as any)
    .from("agents")
    .update(theUpdates as any)
    .eq("id", theId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteAgent(id: string) {
  const { error } = await (supabase as any).from("agents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
