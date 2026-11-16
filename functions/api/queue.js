const EMAIL_WEBHOOK = "https://script.google.com/macros/s/AKfycbxMTYet3XLMTNCcnowQ6IXTfnXi-ytey7deXYQaUWVe3ZJ4pfaeIIxOU5gmqLRiNlye/exec";

async function sendEmailNotification(to, subject, htmlBody) {
  try {
    await fetch(EMAIL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, htmlBody })
    });
  } catch (e) {
    console.error("Email dispatch failed", e);
  }
}

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
    await context.env.DSW_DB.prepare(
      "INSERT INTO queue (ticket_id, client_name, client_email, client_phone, package_tier, budget, project_details, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      body.ticket_id, 
      body.client_name, 
      body.client_email, 
      body.client_phone || body.phone || '', 
      body.package_tier, 
      body.budget || '0', 
      body.project_details || body.scope || body.details || '', 
      body.status, 
      body.created_at
    ).run();

    const trackerUrl = new URL(context.request.url).origin + "/status.html";
    const htmlBody = `
      <div style="font-family: monospace; color: #334155; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Transmission Received</h2>
        <p>Hello ${body.client_name},</p>
        <p>Your project application has been securely logged into the DanStudio Works intake queue.</p>
        <p><strong>Reference ID:</strong> ${body.ticket_id}</p>
        <p>You can monitor your live queue position and production status at any time via the tracker portal:</p>
        <a href="${trackerUrl}" style="display: inline-block; padding: 10px 20px; background: #22d3ee; color: #000; text-decoration: none; font-weight: bold; border-radius: 4px;">Access Live Tracker</a>
        <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">DanStudio Works // Nexus Command</p>
      </div>
    `;
    // Run in background without blocking the response
    if (body.client_email) {
      if (typeof context.waitUntil === 'function') {
        context.waitUntil(sendEmailNotification(body.client_email, `Application Received: ${body.ticket_id}`, htmlBody));
      } else {
        await sendEmailNotification(body.client_email, `Application Received: ${body.ticket_id}`, htmlBody);
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function onRequestPatch(context) {
  try {
    const body = await context.request.json();
    
    // 1. Update the status
    await context.env.DSW_DB.prepare("UPDATE queue SET status = ? WHERE ticket_id = ?").bind(body.status, body.ticket_id).run();
    
    // 2. Fetch the client's email and name
    const { results } = await context.env.DSW_DB.prepare("SELECT client_name, client_email FROM queue WHERE ticket_id = ?").bind(body.ticket_id).all();
    
    // 3. Send the corresponding email
    if (results && results.length > 0) {
      const client = results[0];
      let subject = "";
      let htmlBody = "";
      
      if (body.status === "accepted" || body.status === "approved") {
        subject = `Project Accepted: ${body.ticket_id}`;
        htmlBody = `<div style="font-family: monospace; color: #334155; max-width: 600px;"><h2 style="color: #0d9488;">Slot Confirmed</h2><p>Hello ${client.client_name},</p><p>Your project has been officially accepted into the DanStudio Works production queue. The Lead Dev will initiate direct contact shortly to begin onboarding.</p></div>`;
      } else if (body.status === "archived" || body.status === "rejected") {
        subject = `Application Status Update: ${body.ticket_id}`;
        htmlBody = `<div style="font-family: monospace; color: #334155; max-width: 600px;"><h2>Application Archived</h2><p>Hello ${client.client_name},</p><p>Due to current production capacity constraints, we are unable to accept your project at this time. Your ticket has been archived. Thank you for considering DanStudio Works.</p></div>`;
      }
      
      if (subject && client.client_email) {
        if (typeof context.waitUntil === 'function') {
          context.waitUntil(sendEmailNotification(client.client_email, subject, htmlBody));
        } else {
          await sendEmailNotification(client.client_email, subject, htmlBody);
        }
      }
    }
    
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
