// Public: resolve full name + access code → synthetic auth credentials.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { full_name, code } = await req.json();
    if (!full_name || !code) throw new Error("Full name and code required");
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const normCode = String(code).trim().toUpperCase();
    const { data: row } = await supa
      .from("access_requests")
      .select("*")
      .eq("generated_code", normCode)
      .eq("status", "approved")
      .maybeSingle();
    if (!row || !row.synthetic_email || !row.auto_password) throw new Error("Invalid name or access code");
    if (String(row.full_name).trim().toLowerCase() !== String(full_name).trim().toLowerCase()) {
      throw new Error("Invalid name or access code");
    }
    return new Response(
      JSON.stringify({ email: row.synthetic_email, password: row.auto_password }),
      { headers: { ...cors, "content-type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});
