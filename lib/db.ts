import "server-only";
import postgres from "postgres";
import type { Answers } from "./questions";
import type { Analysis } from "./analyze";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL ?? "", {
    max: 5,
    idle_timeout: 20,
    // Neon y Supabase en modo "pooler" no soportan sentencias preparadas.
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export type ClientRow = {
  id: string;
  token: string;
  name: string;
  company: string | null;
  email: string | null;
  status: "pendiente" | "respondido";
  answers: Answers | null;
  analysis: Analysis | null;
  analysis_status: "pendiente" | "listo" | "error" | null;
  analysis_error: string | null;
  notes: string;
  consent_at: Date | null;
  created_at: Date;
  submitted_at: Date | null;
  analyzed_at: Date | null;
  analysis_started_at: Date | null;
};
