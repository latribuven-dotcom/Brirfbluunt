import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import RegisterSW from "./RegisterSW";
import { LOGO_URL } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="panel">
      <RegisterSW />
      <header className="topbar no-print">
        <Link href="/admin" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt={process.env.BUSINESS_NAME || "Briefing"} />
        </Link>
        <form action={logout}>
          <button className="btn ghost small">Salir</button>
        </form>
      </header>
      <main className="panel-main">{children}</main>
    </div>
  );
}
