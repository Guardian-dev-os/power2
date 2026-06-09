import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireAdminClient(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: roles, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  if (!roles?.some((row) => row.role === "admin")) {
    throw new Error("Forbidden: admin role required");
  }

  return supabaseAdmin;
}

export const listAccessRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ filter: z.enum(["pending", "all"]).default("all") })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    let query = supabaseAdmin
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.filter === "pending") query = query.eq("status", "pending");

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const deleteAccessRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    const { error } = await supabaseAdmin.from("access_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    const { data, error } = await supabaseAdmin.from("app_settings").select("*").eq("id", true).maybeSingle();
    if (error) throw new Error(error.message);
    return {
      settings: data ?? {
        id: true,
        primary_agent_name: "Tinashe Lee Vurayai (+263 71 3043 376)",
        solo_amount: 5,
        pair_amount: 8,
      },
    };
  });

export const saveAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        primary_agent_name: z.string().trim().min(2).max(255),
        solo_amount: z.coerce.number().min(0).max(999),
        pair_amount: z.coerce.number().min(0).max(999),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    const { data: settings, error } = await supabaseAdmin
      .from("app_settings")
      .upsert(
        {
          id: true,
          primary_agent_name: data.primary_agent_name,
          solo_amount: data.solo_amount,
          pair_amount: data.pair_amount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { settings };
  });

export const listAgents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    const { data, error } = await supabaseAdmin.from("agents").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { agents: data ?? [] };
  });

export const addAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ name: z.string().trim().min(2).max(160), contact: z.string().trim().max(80).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    const { error } = await supabaseAdmin.from("agents").insert({ name: data.name, contact: data.contact || null });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), name: z.string().trim().min(2).max(160), contact: z.string().trim().max(80).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    const { error } = await supabaseAdmin.from("agents").update({ name: data.name, contact: data.contact || null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdminClient(context.userId);
    const { error } = await supabaseAdmin.from("agents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });