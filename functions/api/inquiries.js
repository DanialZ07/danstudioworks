export async function onRequestGet(context) {
  const { results } = await context.env.DSW_DB.prepare("SELECT value FROM dsw_cache WHERE key = 'danstudio_inquiries'").all();
  const data = results.length ? results[0].value : "[]";
  return new Response(data, { headers: { "Content-Type": "application/json" } });
}
export async function onRequestPost(context) {
  const body = await context.request.text();
  await context.env.DSW_DB.prepare("UPDATE dsw_cache SET value = ? WHERE key = 'danstudio_inquiries'").bind(body).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
}
