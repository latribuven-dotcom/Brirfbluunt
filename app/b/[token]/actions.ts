"use server";

import { after } from "next/server";
import { sql } from "@/lib/db";
import { cleanAnswers } from "@/lib/questions";
import { runAnalysis } from "@/lib/process";

export type SubmitResult = { ok: true } | { ok: false; message: string; errors?: Record<string, string> };

export async function submitBriefing(token: string, rawAnswers: unknown, consent: boolean): Promise<SubmitResult> {
  if (typeof token !== "string" || token.length > 64) return { ok: false, message: "Enlace inválido." };
  if (consent !== true) return { ok: false, message: "Debes autorizar el tratamiento de datos para enviar el briefing." };

  const { answers, errors } = cleanAnswers(rawAnswers);
  if (Object.keys(errors).length) return { ok: false, message: "Faltan respuestas obligatorias.", errors };

  const rows = await sql<{ id: string }[]>`
    update clients
       set answers = ${sql.json(answers)},
           status = 'respondido',
           submitted_at = now(),
           consent_at = now(),
           analysis_status = 'pendiente',
           email = coalesce(nullif(email, ''), ${String(answers.email)}),
           company = coalesce(nullif(company, ''), ${String(answers.empresa)})
     where token = ${token} and status = 'pendiente'
     returning id`;

  if (!rows.length) return { ok: false, message: "Este enlace ya fue usado o no existe." };

  const id = rows[0].id;
  // El análisis corre después de responder al cliente, para que no espere.
  after(() => runAnalysis(id, { notify: true }));
  return { ok: true };
}
