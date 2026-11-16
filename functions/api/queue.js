export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DSW_DB.prepare("SELECT * FROM queue ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(results || []), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    await context.env.DSW_DB.prepare("INSERT INTO queue (ticket_id, client_name, client_email, package_tier, status, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(body.ticket_id, body.client_name, body.client_email, body.package_tier, body.status, body.created_at)
      .run();
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestPatch(context) {
  try {
    const body = await context.request.json();
    await context.env.DSW_DB.prepare("UPDATE queue SET status = ? WHERE ticket_id = ?")
      .bind(body.status, body.ticket_id)
      .run();
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestDelete(context) {
  try {
    const body = await context.request.json();
    await context.env.DSW_DB.prepare("DELETE FROM queue WHERE ticket_id = ?")
      .bind(body.ticket_id)
      .run();
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
