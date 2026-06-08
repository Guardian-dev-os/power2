// Admin-only: create a new user (email + password), optionally grant full access.
import { cors, requireAdmin } from "../_shared/admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { supa } = await requireAdmin(req);
    const { email, password, full_name, access_level, is_admin } = await req.json();
    if (!email || !password) throw new Error("Email and password are required");
    if (String(password).length < 6) throw new Error("Password must be at least 6 characters");

    const { data: created, error: cErr } = await supa.auth.admin.createUser({
      email: String(email).trim(),
      password: String(password),
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });
    if (cErr || !created.user) throw new Error(cErr?.message || "Could not create user");
    const uid = created.user.id;

    await supa.from("profiles").upsert({
      id: uid,
      email: String(email).trim(),
      full_name: full_name || "",
      access_level: access_level === "full" ? "full" : "free",
    });

    if (is_admin) {
      await supa.from("user_roles").upsert({ user_id: uid, role: "admin" }, { onConflict: "user_id,role" });
    }

    return new Response(JSON.stringify({ ok: true, user_id: uid }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});
