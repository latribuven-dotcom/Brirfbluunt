import { notFound } from "next/navigation";
import { sql, type ClientRow } from "@/lib/db";
import { SECTIONS } from "@/lib/questions";
import { appUrl } from "@/lib/process";
import { deleteClient, reopenBriefing, retryAnalysis, saveNotes } from "../../../actions";
import { AutoRefresh, ConfirmButton, LinkShare, PrintButton, SubmitButton } from "./ui";

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short", timeZone: "America/Bogota" });

const PRESUPUESTO: Record<string, string> = {
  alineado: "Alineado con el alcance",
  ajustado: "Ajustado",
  insuficiente: "Insuficiente para lo que pide",
  sin_datos: "Sin datos suficientes",
};

export default async function ClientDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { id } = await params;
  const { nuevo } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [c] = await sql<ClientRow[]>`select * from clients where id = ${id}`;
  if (!c) notFound();

  const link = `${appUrl()}/b/${c.token}`;
  const a = c.analysis;
  const analyzing = c.status === "respondido" && c.analysis_status === "pendiente";
  const startedAt = c.analysis_started_at ?? c.submitted_at;
  const stuck = analyzing && !!startedAt && Date.now() - startedAt.getTime() > 3 * 60 * 1000;

  return (
    <article className="detail">
      {analyzing && !stuck && <AutoRefresh />}

      <header className="detail-head">
        <div>
          <p className="eyebrow">{c.status === "respondido" ? "Briefing respondido" : "Esperando respuesta"}</p>
          <h1>{c.company || c.name}</h1>
          <p className="muted">
            {c.name}
            {c.email ? ` · ${c.email}` : ""}
            {c.submitted_at ? ` · Respondió el ${fmt.format(c.submitted_at)}` : ` · Creado el ${fmt.format(c.created_at)}`}
          </p>
        </div>
        {c.status === "respondido" && <PrintButton />}
      </header>

      {c.status === "pendiente" && (
        <section className="card highlight no-print">
          <h2>{nuevo ? "Cliente creado. Envíale este enlace" : "Enlace del cliente"}</h2>
          <LinkShare link={link} name={c.name} />
          <p className="muted small">El enlace es único para este cliente y deja de aceptar respuestas cuando lo envía.</p>
        </section>
      )}

      {analyzing && (
        <section className="card">
          {stuck ? (
            <form action={retryAnalysis.bind(null, c.id)} className="stuck">
              <p>El análisis no ha terminado. Puedes lanzarlo ahora; tarda unos segundos.</p>
              <SubmitButton pendingText="Analizando...">Analizar ahora</SubmitButton>
            </form>
          ) : (
            <p className="pulse">Analizando el briefing con IA. Esto suele tardar menos de un minuto...</p>
          )}
        </section>
      )}

      {c.analysis_status === "error" && (
        <section className="card bad-card no-print">
          <h2>El análisis falló</h2>
          <p>{c.analysis_error}</p>
          <form action={retryAnalysis.bind(null, c.id)}>
            <SubmitButton pendingText="Analizando...">Reintentar análisis</SubmitButton>
          </form>
        </section>
      )}

      {a && (
        <section className="analysis">
          <div className="kpis">
            <div className={`kpi prio-${a.prioridad_cliente.nivel}`}>
              <span>Prioridad</span>
              <strong>{a.prioridad_cliente.nivel}</strong>
            </div>
            <div className="kpi">
              <span>Claridad del brief</span>
              <strong>{a.claridad_brief.puntaje}/10</strong>
            </div>
            <div className="kpi">
              <span>Presupuesto</span>
              <strong>{a.alineacion_presupuesto.nivel.replace("_", " ")}</strong>
            </div>
            <div className="kpi">
              <span>Complejidad</span>
              <strong>{a.complejidad}</strong>
            </div>
          </div>

          <div className="card">
            <h2>Resumen</h2>
            <p>{a.resumen_ejecutivo}</p>
            <h3>Lo que realmente necesita</h3>
            <p>{a.necesidad_real}</p>
            <h3>Siguiente paso</h3>
            <p className="next-step">{a.siguiente_paso}</p>
            <p className="muted small">Prioridad {a.prioridad_cliente.nivel}: {a.prioridad_cliente.razon}</p>
          </div>

          <div className="grid2">
            <div className="card">
              <h2>Banderas rojas</h2>
              <List items={a.banderas_rojas} empty="No se detectaron." />
            </div>
            <div className="card">
              <h2>Oportunidades</h2>
              <List items={a.oportunidades} empty="Ninguna destacada." />
            </div>
          </div>

          <div className="card">
            <h2>Enfoque estratégico sugerido</h2>
            <p>{a.enfoque_estrategico}</p>
            <h3>Público y posicionamiento</h3>
            <p>{a.publico_y_posicionamiento}</p>
          </div>

          <div className="card">
            <h2>Entregables recomendados</h2>
            <ul className="deliverables">
              {a.entregables_recomendados.map((d, i) => (
                <li key={i}>
                  <strong>{d.nombre}</strong>
                  <span>{d.justificacion}</span>
                </li>
              ))}
            </ul>
            {a.servicios_detectados.length > 0 && (
              <p className="muted small">Servicios detectados: {a.servicios_detectados.join(", ")}</p>
            )}
          </div>

          <div className="grid2">
            <div className="card">
              <h2>Presupuesto y tiempos</h2>
              <p>
                <strong>{PRESUPUESTO[a.alineacion_presupuesto.nivel]}.</strong> {a.alineacion_presupuesto.comentario}
              </p>
              <p>{a.tiempo_estimado}</p>
            </div>
            <div className="card">
              <h2>Claridad del brief</h2>
              <p>{a.claridad_brief.comentario}</p>
            </div>
          </div>

          <div className="card">
            <h2>Preguntas para la reunión</h2>
            <List items={a.preguntas_de_seguimiento} empty="Ninguna." ordered />
          </div>

          <p className="muted small no-print">
            Es una guía para tu criterio, no un sustituto. Análisis generado con IA{c.analyzed_at ? ` el ${fmt.format(c.analyzed_at)}` : ""}
          </p>
        </section>
      )}

      {c.answers && (
        <section className="card answers">
          <h2>Respuestas del cliente</h2>
          {SECTIONS.map((s) => (
            <div key={s.id} className="answer-section">
              <h3>{s.title}</h3>
              <dl>
                {s.fields.map((f) => {
                  const v = c.answers![f.id];
                  const val = Array.isArray(v) ? v.join(", ") : v;
                  return (
                    <div key={f.id}>
                      <dt>{f.label}</dt>
                      <dd className={val ? "" : "muted"}>{val || "Sin respuesta"}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
          {c.consent_at && <p className="muted small">Autorizó el tratamiento de datos (Ley 1581) el {fmt.format(c.consent_at)}</p>}
        </section>
      )}

      <section className="card">
        <h2>Mis notas</h2>
        <form action={saveNotes.bind(null, c.id)} className="notes-form">
          <textarea name="notes" rows={5} defaultValue={c.notes} placeholder="Notas privadas sobre este cliente" />
          <button className="btn no-print">Guardar notas</button>
        </form>
      </section>

      <section className="danger-zone no-print">
        {c.status === "respondido" && a && (
          <form action={retryAnalysis.bind(null, c.id)}>
            <SubmitButton small pendingText="Analizando...">Volver a analizar</SubmitButton>
          </form>
        )}
        {c.status === "respondido" && (
          <form action={reopenBriefing.bind(null, c.id)}>
            <ConfirmButton message="El cliente podrá volver a llenar el briefing con el mismo enlace. Sus respuestas actuales se reemplazarán cuando envíe de nuevo. ¿Continuar?">
              Reabrir enlace
            </ConfirmButton>
          </form>
        )}
        <form action={deleteClient.bind(null, c.id)}>
          <ConfirmButton danger message="Se borrarán para siempre el cliente, sus respuestas y el análisis. ¿Continuar?">
            Eliminar cliente y sus datos
          </ConfirmButton>
        </form>
      </section>
    </article>
  );
}

function List({ items, empty, ordered }: { items: string[]; empty: string; ordered?: boolean }) {
  if (!items.length) return <p className="muted">{empty}</p>;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag>
      {items.map((i, k) => (
        <li key={k}>{i}</li>
      ))}
    </Tag>
  );
}
