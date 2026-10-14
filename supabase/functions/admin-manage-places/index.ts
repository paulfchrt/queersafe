// QueerSafe admin-only place management.
// Deploy as a Supabase Edge Function named "admin-manage-places".
// Required server-side secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// QUEERSAFE_ADMIN_EMAILS (comma-separated allowlist). Never expose service role to browser.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://paulfchrt.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function response(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response(405, { error: "Method not allowed" });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmails = (Deno.env.get("QUEERSAFE_ADMIN_EMAILS") ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!url || !serviceKey || adminEmails.length === 0) {
    return response(503, { error: "Admin function is not configured." });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return response(401, { error: "Sign in required." });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const token = authHeader.slice("Bearer ".length);
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    return response(403, { error: "Admin access required." });
  }

  // safe_places.submitted_by and verified_by reference public.profiles(id).
  // Create a minimal profile for an authorized admin if signup did not create one.
  const { data: existingProfile, error: profileLookupError } = await admin
    .from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (profileLookupError) return response(500, { error: "Could not verify admin profile." });
  if (!existingProfile) {
    const { error: profileInsertError } = await admin.from("profiles").insert({
      id: user.id,
      display_name: "Administrateur QueerSafe",
    });
    if (profileInsertError) return response(500, { error: "Could not initialize admin profile." });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return response(400, { error: "Invalid JSON." }); }
  const action = body.action;

  if (action === "list") {
    const { data, error } = await admin.from("safe_places").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) return response(500, { error: "Could not load places." });
    return response(200, { places: data });
  }

  if (action === "create") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const countryCode = typeof body.country_code === "string" ? body.country_code.trim().toUpperCase() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const allowedCategories = ["association", "cafe", "bar", "health", "community_center", "public_place", "other"];
    if (name.length < 2 || name.length > 120 || !allowedCategories.includes(category) ||
        city.length < 1 || city.length > 100 || !/^[A-Z]{2}$/.test(countryCode) || description.length > 1200) {
      return response(400, { error: "Check the place name, category, city, country code and description." });
    }
    const { data, error } = await admin.from("safe_places").insert({
      name, category, city, country_code: countryCode, description,
      address: typeof body.address === "string" && body.address.trim() ? body.address.trim().slice(0, 250) : null,
      website_url: typeof body.website_url === "string" && body.website_url.trim() ? body.website_url.trim().slice(0, 500) : null,
      phone: typeof body.phone === "string" && body.phone.trim() ? body.phone.trim().slice(0, 80) : null,
      accessibility_notes: typeof body.accessibility_notes === "string" ? body.accessibility_notes.trim().slice(0, 1000) : null,
      submitted_by: user.id,
      status: "pending",
      verified: false,
      verified_at: null,
      verified_by: null,
    }).select("id,name,status,verified,created_at").single();
    if (error) return response(500, { error: "Could not create place." });
    return response(201, { place: data });
  }

  if (action === "review") {
    const id = typeof body.id === "string" ? body.id : "";
    const decision = body.decision;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !["publish", "reject", "archive"].includes(String(decision))) {
      return response(400, { error: "Invalid place ID or decision." });
    }
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (decision === "publish") {
      updates.status = "published";
      updates.verified = true;
      updates.verified_at = new Date().toISOString();
      updates.verified_by = user.id;
    } else if (decision === "reject") {
      updates.status = "rejected";
      updates.verified = false;
      updates.verified_at = null;
      updates.verified_by = null;
    } else {
      updates.status = "archived";
      updates.verified = false;
      updates.verified_at = null;
      updates.verified_by = null;
    }
    const { data, error } = await admin.from("safe_places").update(updates).eq("id", id).select("id,name,status,verified,verified_at").single();
    if (error) return response(500, { error: "Could not update place." });
    return response(200, { place: data });
  }

  return response(400, { error: "Unknown action. Use list, create or review." });
});
