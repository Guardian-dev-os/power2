// Public: submit access request (anonymous). Email REQUIRED.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { full_name, whatsapp, email } = await req.json();
    if (!full_name || full_name.trim().length < 2) throw new Error("Full name is required");
    if (!whatsapp || whatsapp.trim().length < 5) throw new Error("WhatsApp number is required");

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await supa.from("access_requests").insert({
      full_name: full_name.trim(),
      whatsapp: whatsapp.trim(),
      email: email ? String(email).trim() : null,
    });
    if (error) throw new Error(error.message);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});
