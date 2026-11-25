// Crea la tabla de la app. Uso: DATABASE_URL=... npm run db:init
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

await sql`
  create table if not exists clients (
    id uuid primary key default gen_random_uuid(),
    token text not null unique,
    name text not null,
    company text,
    email text,
    status text not null default 'pendiente',
    answers jsonb,
    analysis jsonb,
    analysis_status text,
    analysis_error text,
    notes text not null default '',
    consent_at timestamptz,
    created_at timestamptz not null default now(),
    submitted_at timestamptz,
    analyzed_at timestamptz
  )
`;
await sql`create index if not exists clients_created_idx on clients (created_at desc)`;
await sql`alter table clients add column if not exists analysis_started_at timestamptz`;

console.log("Base de datos lista.");
await sql.end();
