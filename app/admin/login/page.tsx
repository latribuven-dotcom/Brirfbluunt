"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="public-wrap">
      <form action={action} className="card narrow">
        <div className="brand-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.bluuntgroup.com/assets/logo-bluunt.png" alt="Bluunt Group" />
          <p className="eyebrow">Panel de analista</p>
        </div>
        <h1>Entrar</h1>
        <label className="field">
          <span className="label">Contraseña</span>
          <input name="password" type="password" autoComplete="current-password" required autoFocus />
        </label>
        {error && <p className="error-msg">{error}</p>}
        <button className="btn primary" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
