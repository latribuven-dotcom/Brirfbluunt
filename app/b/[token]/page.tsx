import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/db";
import { SECTIONS } from "@/lib/questions";
import BriefingForm from "./BriefingForm";
import { LOGO_URL } from "@/lib/brand";

export const dynamic = "force-dynamic";
// El análisis corre después de enviar; damos margen en Vercel.
export const maxDuration = 300;

export const metadata: Metadata = {
  title: "Briebluunt · Briefing",
  robots: { index: false, follow: false },
};

export default async function BriefingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(token)) notFound();

  const [c] = await sql<{ name: string; company: string | null; email: string | null; status: string }[]>`
    select name, company, email, status from clients where token = ${token}`;
  if (!c) notFound();

  const business = process.env.BUSINESS_NAME || "Nuestra agencia";

  if (c.status !== "pendiente") {
    return (
      <main className="public-wrap">
        <div className="card center">
          <p className="eyebrow">{business}</p>
          <h1>¡Gracias, ya recibimos tu briefing!</h1>
          <p className="muted">Lo estamos revisando y te contactaremos pronto.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="public-wrap">
      <BriefingForm
        token={token}
        sections={SECTIONS}
        business={business}
        logo={LOGO_URL}
        privacyEmail={process.env.PRIVACY_EMAIL || process.env.ADMIN_EMAIL || ""}
        prefill={{ nombre_contacto: c.name, empresa: c.company ?? "", email: c.email ?? "" }}
      />
    </main>
  );
}
