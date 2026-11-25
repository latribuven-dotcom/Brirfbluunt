import "server-only";
import type { Analysis } from "./analyze";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function list(items: string[]): string {
  return items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "<p>Ninguna.</p>";
}

/** Envía a la analista el aviso con el análisis. Nunca lanza: devuelve el error como texto. */
export async function sendAnalysisEmail(opts: {
  clientName: string;
  company: string;
  detailUrl: string;
  analysis: Analysis | null;
  analysisError?: string;
}): Promise<string | null> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!key || !to) return "Correo no configurado (RESEND_API_KEY o ADMIN_EMAIL).";

  const a = opts.analysis;
  const title = `${opts.company || opts.clientName}`;
  const body = a
    ? `
      <p><strong>Prioridad:</strong> ${esc(a.prioridad_cliente.nivel)} · <strong>Claridad:</strong> ${a.claridad_brief.puntaje}/10 · <strong>Presupuesto:</strong> ${esc(a.alineacion_presupuesto.nivel.replace("_", " "))} · <strong>Complejidad:</strong> ${esc(a.complejidad)}</p>
      <h3>Resumen</h3><p>${esc(a.resumen_ejecutivo)}</p>
      <h3>Lo que realmente necesita</h3><p>${esc(a.necesidad_real)}</p>
      <h3>Banderas rojas</h3>${list(a.banderas_rojas)}
      <h3>Preguntas para la reunión</h3>${list(a.preguntas_de_seguimiento)}
      <h3>Siguiente paso</h3><p>${esc(a.siguiente_paso)}</p>`
    : `<p>El cliente envió el briefing, pero el análisis automático falló: ${esc(opts.analysisError ?? "error desconocido")}.</p><p>Puedes reintentarlo desde el panel.</p>`;

  const html = `<div style="font-family:system-ui,sans-serif;max-width:640px;line-height:1.5;color:#2c0046">
    <h2 style="margin-bottom:4px">Nuevo briefing: ${esc(title)}</h2>
    <p style="color:#706c82;margin-top:0">Contacto: ${esc(opts.clientName)}</p>
    ${body}
    <p><a href="${esc(opts.detailUrl)}" style="display:inline-block;background:#ccff00;color:#2c0046;font-weight:700;padding:12px 20px;border-radius:999px;text-decoration:none">Ver respuestas y análisis completo</a></p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Briebluunt <onboarding@resend.dev>",
        to: [to],
        subject: `Briebluunt · Nuevo briefing: ${title}`,
        html,
      }),
    });
    if (!res.ok) return `Resend respondió ${res.status}: ${(await res.text()).slice(0, 300)}`;
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}
