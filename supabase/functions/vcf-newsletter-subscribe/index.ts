// VCF-only, explicit-consent Brevo subscription. No browser-exposed Brevo API key.
const LIST_ID = 3; // Solid (private). NEVER use Partytime #2.
const ALLOWED_ORIGIN = "https://vicecityforums.com";
const respond = (status: number, data: object) => new Response(JSON.stringify(data), {
  status, headers: {"content-type":"application/json", "access-control-allow-origin":ALLOWED_ORIGIN, "vary":"Origin"}
});
Deno.serve(async request => {
  const origin = request.headers.get("origin");
  if (origin !== ALLOWED_ORIGIN) return respond(403,{error:"Origin not allowed"});
  if (request.method === "OPTIONS") return new Response(null,{status:204,headers:{
    "access-control-allow-origin":ALLOWED_ORIGIN,
    "access-control-allow-headers":"authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods":"POST, OPTIONS", "vary":"Origin"
  }});
  if(request.method !== "POST") return respond(405,{error:"Method not allowed"});
  const bearer = request.headers.get("authorization") || "";
  if(!bearer.startsWith("Bearer ")) return respond(401,{error:"Sign in required"});
  let body: {consent?: boolean} = {};
  try { body = await request.json(); } catch { return respond(400,{error:"Invalid JSON"}); }
  if(body.consent !== true) return respond(400,{error:"Explicit consent required"});
  const apiKey = Deno.env.get("BREVO_VCF_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!apiKey || !supabaseUrl || !anonKey) return respond(503,{error:"VCF newsletter not configured"});
  // Do not accept an email address from the caller: obtain the confirmed email from Supabase Auth.
  const who = await fetch(supabaseUrl + "/auth/v1/user", {
    headers: {"authorization":bearer,"apikey":anonKey}
  });
  if(!who.ok) return respond(401,{error:"Session invalid"});
  const user = await who.json();
  if (!user.email || !user.email_confirmed_at) return respond(403,{error:"Confirmed email required"});
  // Never set emailBlacklisted=false: preserve existing unsubscribe/blacklist state.
  const brevo = await fetch("https://api.brevo.com/v3/contacts", {
    method:"POST",
    headers: {"api-key":apiKey,"content-type":"application/json","accept":"application/json"},
    body:JSON.stringify({email:user.email, listIds:[LIST_ID], updateEnabled:true})
  });
  if (!brevo.ok) {
    console.error("VCF Brevo subscription failed",brevo.status);
    return respond(502,{error:"Subscription unavailable"});
  }
  return respond(200,{ok:true});
});
