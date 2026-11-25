"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Answers, Field, Section } from "@/lib/questions";
import { submitBriefing } from "./actions";

type Props = {
  token: string;
  sections: Section[];
  business: string;
  logo: string;
  privacyEmail: string;
  prefill: Record<string, string>;
};

function isEmpty(f: Field, v: Answers[string] | undefined) {
  return f.type === "multiselect" ? !Array.isArray(v) || v.length === 0 : !v || (typeof v === "string" && !v.trim());
}

export default function BriefingForm({ token, sections, business, logo, privacyEmail, prefill }: Props) {
  const storageKey = `briefing-draft-${token}`;
  const [answers, setAnswers] = useState<Answers>(() => ({ ...prefill }));
  const [step, setStep] = useState(0); // 0 = bienvenida, 1..n = secciones, n+1 = envío
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  const total = sections.length;
  const finalStep = total + 1;

  // Recupera el borrador guardado en este dispositivo.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const d = JSON.parse(raw) as { answers?: Answers; step?: number };
        if (d.answers) setAnswers((a) => ({ ...a, ...d.answers }));
        if (typeof d.step === "number") setStep(Math.min(d.step, finalStep));
      }
    } catch {}
    loaded.current = true;
  }, [storageKey, finalStep]);

  useEffect(() => {
    if (!loaded.current || done) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, step }));
    } catch {}
  }, [answers, step, storageKey, done]);

  const section = step >= 1 && step <= total ? sections[step - 1] : null;
  const progress = useMemo(() => Math.round((Math.min(step, finalStep) / finalStep) * 100), [step, finalStep]);

  function set(id: string, v: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: "" }));
  }

  function go(n: number) {
    setStep(n);
    setMessage(null);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function next() {
    if (section) {
      const errs: Record<string, string> = {};
      for (const f of section.fields) {
        const v = answers[f.id];
        if (f.required && isEmpty(f, v)) errs[f.id] = f.type === "multiselect" || f.type === "select" ? "Elige una opción." : "Este campo es obligatorio.";
        else if (f.type === "email" && typeof v === "string" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errs[f.id] = "Revisa el correo.";
      }
      setErrors(errs);
      if (Object.keys(errs).length) {
        setMessage("Revisa los campos marcados.");
        return;
      }
    }
    go(step + 1);
  }

  function submit() {
    if (!consent) {
      setMessage("Para enviar, autoriza el tratamiento de tus datos.");
      return;
    }
    startTransition(async () => {
      const res = await submitBriefing(token, answers, consent);
      if (res.ok) {
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        setDone(true);
        return;
      }
      setMessage(res.message);
      if (res.errors) {
        setErrors(res.errors);
        const idx = sections.findIndex((s) => s.fields.some((f) => res.errors![f.id]));
        if (idx >= 0) go(idx + 1);
      }
    });
  }

  if (done) {
    return (
      <div className="card center">
        <p className="eyebrow">{business}</p>
        <h1>¡Listo, gracias!</h1>
        <p className="muted">Recibimos tu briefing. Lo vamos a revisar con calma y te contactaremos pronto.</p>
      </div>
    );
  }

  return (
    <div ref={topRef} className="form-shell">
      <header className="form-head brand-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={business} />
        <p className="eyebrow">Briefing de proyecto</p>
        <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
        </div>
        {section && (
          <p className="muted small">
            Paso {step} de {total}
          </p>
        )}
      </header>

      {step === 0 && (
        <div className="card">
          <h1>Hola{prefill.nombre_contacto ? `, ${prefill.nombre_contacto}` : ""}</h1>
          <p className="lead">Hacemos ruido con estrategia. Y la estrategia empieza por entenderte.</p>
          <p>
            Este briefing nos ayuda a entender tu negocio y tu proyecto antes de proponerte algo. Toma entre 10 y 15
            minutos. Mientras más detalle nos des, mejor será la propuesta.
          </p>
          <p className="muted small">Tus respuestas se guardan en este dispositivo mientras avanzas, así que puedes cerrar y volver después.</p>
          <button className="btn primary" onClick={() => go(1)}>
            Empezar
          </button>
        </div>
      )}

      {section && (
        <div className="card">
          <h2>{section.title}</h2>
          {section.intro && <p className="muted">{section.intro}</p>}
          <div className="fields">
            {section.fields.map((f) => (
              <FieldInput key={f.id} field={f} value={answers[f.id]} error={errors[f.id]} onChange={(v) => set(f.id, v)} />
            ))}
          </div>
          {message && <p className="error-msg">{message}</p>}
          <div className="nav">
            <button className="btn ghost" onClick={() => go(step - 1)}>
              Atrás
            </button>
            <button className="btn primary" onClick={next}>
              {step === total ? "Revisar y enviar" : "Siguiente"}
            </button>
          </div>
        </div>
      )}

      {step === finalStep && (
        <div className="card">
          <h2>Último paso</h2>
          <p>Revisa que todo esté bien. Puedes volver atrás para corregir cualquier respuesta.</p>
          <label className="consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              Autorizo a {business} a recolectar y tratar mis datos personales y los de mi empresa con el fin de analizar este
              briefing, preparar una propuesta comercial y contactarme, conforme a la Ley 1581 de 2012. Entiendo que las respuestas
              sobre mi negocio y mi proyecto (sin mi nombre, empresa, correo ni teléfono) se envían al servicio gratuito de
              inteligencia artificial Gemini de Google, ubicado fuera de Colombia, para generar un análisis interno; que en ese
              servicio Google puede usar esa información para mejorar sus productos y que personas revisoras de Google pueden
              leerla. Por eso no debo incluir datos personales ni información confidencial en mis respuestas. Puedo consultar,
              corregir o pedir que se eliminen mis datos
              {privacyEmail ? (
                <>
                  {" "}escribiendo a <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
                </>
              ) : null}
              .
            </span>
          </label>
          {message && <p className="error-msg">{message}</p>}
          <div className="nav">
            <button className="btn ghost" onClick={() => go(step - 1)} disabled={pending}>
              Atrás
            </button>
            <button className="btn primary" onClick={submit} disabled={pending}>
              {pending ? "Enviando..." : "Enviar briefing"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({
  field: f,
  value,
  error,
  onChange,
}: {
  field: Field;
  value: Answers[string] | undefined;
  error?: string;
  onChange: (v: string | string[]) => void;
}) {
  const id = `f-${f.id}`;
  const label = (
    <span className="label">
      {f.label}
      {f.required && <span className="req" aria-hidden> *</span>}
    </span>
  );
  const help = f.help && <span className="help">{f.help}</span>;
  const err = error && <span className="field-error">{error}</span>;

  if (f.type === "multiselect" || f.type === "select") {
    const selected = f.type === "multiselect" ? (Array.isArray(value) ? value : []) : typeof value === "string" ? [value] : [];
    return (
      <fieldset className={`field ${error ? "has-error" : ""}`}>
        <legend>{label}</legend>
        {help}
        <div className="chips">
          {f.options!.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                type="button"
                key={o}
                className={`chip ${on ? "on" : ""}`}
                aria-pressed={on}
                onClick={() => {
                  if (f.type === "select") onChange(on ? "" : o);
                  else onChange(on ? selected.filter((x) => x !== o) : [...selected, o]);
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
        {err}
      </fieldset>
    );
  }

  const str = typeof value === "string" ? value : "";
  return (
    <label className={`field ${error ? "has-error" : ""}`} htmlFor={id}>
      {label}
      {help}
      {f.type === "textarea" ? (
        <textarea id={id} rows={4} maxLength={4000} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          id={id}
          type={f.type}
          maxLength={400}
          value={str}
          placeholder={f.placeholder}
          autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {err}
    </label>
  );
}
