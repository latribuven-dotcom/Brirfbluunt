"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { endSession, passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { runAnalysis } from "@/lib/process";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const pw = String(form.get("password") ?? "");
  // Pequeña espera para frenar intentos repetidos.
  await new Promise((r) => setTimeout(r, 600));
  if (!passwordMatches(pw)) return "Contraseña incorrecta.";
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function createClient(form: FormData) {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim().slice(0, 200);
  const company = String(form.get("company") ?? "").trim().slice(0, 200);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  if (!name) return;
  const token = randomBytes(12).toString("base64url");
  const [row] = await sql<{ id: string }[]>`
    insert into clients (token, name, company, email) values (${token}, ${name}, ${company || null}, ${email || null})
    returning id`;
  revalidatePath("/admin");
  redirect(`/admin/c/${row.id}?nuevo=1`);
}

export async function saveNotes(id: string, form: FormData) {
  await requireAdmin();
  const notes = String(form.get("notes") ?? "").slice(0, 20000);
  await sql`update clients set notes = ${notes} where id = ${id}`;
  revalidatePath(`/admin/c/${id}`);
}

export async function retryAnalysis(id: string) {
  await requireAdmin();
  // Se ejecuta mientras esperas (unos segundos), así funciona en cualquier hosting.
  await runAnalysis(id, { notify: false });
  revalidatePath(`/admin/c/${id}`);
}

export async function reopenBriefing(id: string) {
  await requireAdmin();
  await sql`update clients set status = 'pendiente' where id = ${id}`;
  revalidatePath(`/admin/c/${id}`);
}

export async function deleteClient(id: string) {
  await requireAdmin();
  await sql`delete from clients where id = ${id}`;
  revalidatePath("/admin");
  redirect("/admin");
}
