"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText, small }: { children: React.ReactNode; pendingText: string; small?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className={`btn ${small ? "ghost small" : "primary"}`} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}

export function LinkShare({ link, name }: { link: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Hola ${name}, para preparar tu propuesta necesitamos conocer mejor tu proyecto. Llena este briefing (toma unos 10 minutos): ${link}`;
  return (
    <div className="link-share">
      <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Enlace del cliente" />
      <div className="row">
        <button
          type="button"
          className="btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {}
          }}
        >
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
        <a className="btn primary" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
          Enviar por WhatsApp
        </a>
      </div>
    </div>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="btn no-print" onClick={() => window.print()}>
      Descargar PDF
    </button>
  );
}

export function ConfirmButton({ children, message, danger }: { children: React.ReactNode; message: string; danger?: boolean }) {
  return (
    <button
      className={`btn small ${danger ? "danger" : "ghost"}`}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
