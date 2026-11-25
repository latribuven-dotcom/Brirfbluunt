import "server-only";
import { sql, type ClientRow } from "./db";
import { analyzeBriefing } from "./analyze";
import { sendAnalysisEmail } from "./email";

export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Respaldo para hostings donde el trabajo en segundo plano se corta: analiza los briefings
 * que llevan más de 3 minutos esperando. Se llama al abrir el panel.
 */
export async function recoverStuckAnalyses() {
  const stuck = await sql<{ id: string }[]>`
    update clients set analysis_started_at = now()
     where status = 'respondido' and analysis_status = 'pendiente'
       and coalesce(analysis_started_at, submitted_at) < now() - interval '3 minutes'
    returning id`;
  for (const s of stuck.slice(0, 3)) await runAnalysis(s.id, { notify: true });
}

/** Analiza el briefing de un cliente, guarda el resultado y avisa por correo. */
export async function runAnalysis(clientId: string, { notify }: { notify: boolean }) {
  const [c] = await sql<ClientRow[]>`select * from clients where id = ${clientId}`;
  if (!c || !c.answers) return;

  await sql`update clients set analysis_status = 'pendiente', analysis_error = null, analysis_started_at = now() where id = ${clientId}`;

  let error: string | undefined;
  let analysis = null;
  try {
    analysis = await analyzeBriefing(c.answers);
    await sql`update clients set analysis = ${sql.json(analysis)}, analysis_status = 'listo', analyzed_at = now() where id = ${clientId}`;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    console.error("Análisis falló", clientId, error);
    await sql`update clients set analysis_status = 'error', analysis_error = ${error} where id = ${clientId}`;
  }

  if (notify) {
    const mailErr = await sendAnalysisEmail({
      clientName: c.name,
      company: c.company ?? "",
      detailUrl: `${appUrl()}/admin/c/${c.id}`,
      analysis,
      analysisError: error,
    });
    if (mailErr) console.error("Correo falló", clientId, mailErr);
  }
}
