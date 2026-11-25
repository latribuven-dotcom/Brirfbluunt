import Link from "next/link";
import { sql, type ClientRow } from "@/lib/db";
import { after } from "next/server";
import { createClient } from "../actions";
import { recoverStuckAnalyses } from "@/lib/process";

type Row = Pick<ClientRow, "id" | "name" | "company" | "status" | "analysis_status" | "created_at" | "submitted_at"> & {
  prioridad: string | null;
  claridad: number | null;
};

const fmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" });

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  after(() => recoverStuckAnalyses().catch((e) => console.error("Recuperación falló", e)));
  const rows = await sql<Row[]>`
    select id, name, company, status, analysis_status, created_at, submitted_at,
           analysis->'prioridad_cliente'->>'nivel' as prioridad,
           (analysis->'claridad_brief'->>'puntaje')::int as claridad
      from clients
     order by coalesce(submitted_at, created_at) desc
     limit 500`;

  const counts = {
    total: rows.length,
    pendiente: rows.filter((r) => r.status === "pendiente").length,
    respondido: rows.filter((r) => r.status === "respondido").length,
    alta: rows.filter((r) => r.prioridad === "alta").length,
  };
  const shown = f === "pendiente" || f === "respondido" ? rows.filter((r) => r.status === f) : f === "alta" ? rows.filter((r) => r.prioridad === "alta") : rows;

  return (
    <>
      <section className="card">
        <h2>Nuevo cliente</h2>
        <p className="muted small">Crea el cliente y te damos su enlace único para enviarle por WhatsApp o correo.</p>
        <form action={createClient} className="create-form">
          <input name="name" placeholder="Nombre del contacto" required maxLength={200} />
          <input name="company" placeholder="Empresa (opcional)" maxLength={200} />
          <input name="email" type="email" placeholder="Correo (opcional)" maxLength={200} />
          <button className="btn primary">Crear enlace</button>
        </form>
      </section>

      <nav className="filters">
        <Link href="/admin" className={!f ? "on" : ""}>Todos <b>{counts.total}</b></Link>
        <Link href="/admin?f=respondido" className={f === "respondido" ? "on" : ""}>Respondidos <b>{counts.respondido}</b></Link>
        <Link href="/admin?f=pendiente" className={f === "pendiente" ? "on" : ""}>Pendientes <b>{counts.pendiente}</b></Link>
        <Link href="/admin?f=alta" className={f === "alta" ? "on" : ""}>Prioridad alta <b>{counts.alta}</b></Link>
      </nav>

      {shown.length === 0 ? (
        <p className="muted center pad">Todavía no hay clientes aquí.</p>
      ) : (
        <ul className="client-list">
          {shown.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/c/${r.id}`} className="client-item">
                <div>
                  <strong>{r.company || r.name}</strong>
                  <span className="muted small">
                    {r.company ? `${r.name} · ` : ""}
                    {r.submitted_at ? `Respondió el ${fmt.format(r.submitted_at)}` : `Creado el ${fmt.format(r.created_at)}`}
                  </span>
                </div>
                <div className="badges">
                  {r.status === "pendiente" && <span className="badge">Sin responder</span>}
                  {r.status === "respondido" && r.analysis_status === "pendiente" && <span className="badge info">Analizando</span>}
                  {r.analysis_status === "error" && <span className="badge bad">Error en análisis</span>}
                  {r.prioridad && <span className={`badge prio-${r.prioridad}`}>Prioridad {r.prioridad}</span>}
                  {r.claridad != null && <span className="badge">Claridad {r.claridad}/10</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
