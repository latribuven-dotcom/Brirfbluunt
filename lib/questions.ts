// Definición del briefing. Para cambiar preguntas, edita solo este archivo.

export type FieldType = "text" | "textarea" | "email" | "tel" | "select" | "multiselect";

export type Field = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: string[];
};

export type Section = {
  id: string;
  title: string;
  intro?: string;
  fields: Field[];
};

export const SECTIONS: Section[] = [
  {
    id: "contacto",
    title: "Sobre ti y tu empresa",
    intro: "Empecemos por lo básico. Así sabremos con quién hablamos.",
    fields: [
      { id: "nombre_contacto", label: "Tu nombre", type: "text", required: true },
      { id: "cargo", label: "Tu cargo o rol en la empresa", type: "text", placeholder: "Ej.: Gerente, fundadora, jefe de mercadeo" },
      { id: "empresa", label: "Nombre de la empresa o marca", type: "text", required: true },
      { id: "email", label: "Correo electrónico", type: "email", required: true },
      { id: "whatsapp", label: "WhatsApp", type: "tel", required: true, placeholder: "+57 300 000 0000" },
      { id: "ciudad", label: "Ciudad", type: "text" },
      { id: "web_redes", label: "Sitio web y redes sociales", type: "textarea", help: "Pega los enlaces que tengas: web, Instagram, Facebook, TikTok." },
      {
        id: "sector",
        label: "Sector",
        type: "select",
        required: true,
        options: [
          "Alimentos y bebidas", "Moda y belleza", "Salud y bienestar", "Tecnología", "Educación",
          "Construcción e inmobiliaria", "Servicios profesionales", "Comercio y retail",
          "Turismo y hotelería", "Industria y manufactura", "Entidad sin ánimo de lucro", "Otro",
        ],
      },
      {
        id: "tiempo_mercado",
        label: "¿Cuánto tiempo lleva la empresa en el mercado?",
        type: "select",
        options: ["Aún no ha lanzado", "Menos de 1 año", "De 1 a 3 años", "De 3 a 10 años", "Más de 10 años"],
      },
    ],
  },
  {
    id: "negocio",
    title: "Tu negocio",
    intro: "Queremos entender qué haces y por qué te eligen.",
    fields: [
      { id: "descripcion_negocio", label: "¿A qué se dedica tu empresa y qué vende?", type: "textarea", required: true },
      { id: "producto_principal", label: "¿Qué producto o servicio quieres impulsar más?", type: "textarea" },
      { id: "diferencial", label: "¿Por qué un cliente te elige a ti y no a la competencia?", type: "textarea", required: true },
      { id: "situacion_actual", label: "¿Cómo está tu negocio hoy?", type: "textarea", help: "Ventas, reconocimiento, problemas que notas. Lo que quieras contarnos." },
    ],
  },
  {
    id: "proyecto",
    title: "El proyecto",
    intro: "Ahora cuéntanos qué necesitas de nosotros.",
    fields: [
      {
        id: "tipo_proyecto",
        label: "¿Qué necesitas? Puedes marcar varias opciones",
        type: "multiselect",
        required: true,
        options: [
          "Logo e identidad visual", "Manual de marca", "Rediseño de una marca existente",
          "Estrategia de marketing", "Campaña publicitaria", "Redes sociales y contenido",
          "Pauta digital (Meta, Google, TikTok)", "Página web", "Empaque o etiquetas",
          "Material impreso (catálogos, volantes, POP)", "Fotografía o video", "Otro",
        ],
      },
      { id: "descripcion_proyecto", label: "Cuéntanos con tus palabras qué necesitas", type: "textarea", required: true },
      { id: "problema", label: "¿Qué problema quieres resolver con este proyecto?", type: "textarea", required: true },
      {
        id: "objetivo_principal",
        label: "¿Cuál es el objetivo principal?",
        type: "select",
        required: true,
        options: [
          "Dar a conocer la marca", "Vender más", "Lanzar un producto o servicio",
          "Cambiar cómo me perciben", "Fidelizar a mis clientes", "Entrar a un nuevo mercado",
          "Profesionalizar mi imagen", "Otro",
        ],
      },
      { id: "exito", label: "¿Cómo sabrás que el proyecto funcionó?", type: "textarea", required: true, help: "Ej.: más ventas, más mensajes por WhatsApp, más seguidores, más cotizaciones." },
    ],
  },
  {
    id: "publico",
    title: "Tu cliente ideal",
    intro: "Hablemos de la persona o empresa a la que le vendes.",
    fields: [
      { id: "tipo_cliente", label: "¿A quién le vendes?", type: "select", required: true, options: ["A personas", "A empresas", "A ambos"] },
      { id: "publico", label: "Describe a tu cliente ideal", type: "textarea", required: true, help: "Edad, ciudad, ocupación, estilo de vida, tipo de empresa." },
      { id: "publico_motivacion", label: "¿Qué le preocupa o qué desea tu cliente? ¿Por qué te compraría?", type: "textarea" },
      {
        id: "canales",
        label: "¿Dónde encuentras o atiendes a tus clientes?",
        type: "multiselect",
        options: [
          "Instagram", "Facebook", "TikTok", "WhatsApp", "Google / búsquedas", "YouTube", "LinkedIn",
          "Tienda física", "Ferias y eventos", "Voz a voz", "Otro",
        ],
      },
    ],
  },
  {
    id: "competencia",
    title: "Competencia y referentes",
    fields: [
      { id: "competidores", label: "Nombra 2 o 3 competidores. ¿Qué hacen bien o mal?", type: "textarea" },
      { id: "referentes", label: "¿Qué marcas admiras, de cualquier sector, y por qué?", type: "textarea" },
      { id: "no_quiero", label: "¿Qué estilos, colores o ideas NO quieres?", type: "textarea" },
    ],
  },
  {
    id: "marca",
    title: "Tu marca hoy",
    fields: [
      {
        id: "tiene_marca",
        label: "¿Cómo está tu marca hoy?",
        type: "select",
        required: true,
        options: ["No tengo marca todavía", "Tengo logo pero no manual", "Tengo logo y manual de marca", "Tengo marca pero quiero cambiarla"],
      },
      { id: "conservar", label: "¿Qué te gustaría conservar de tu marca actual?", type: "textarea" },
      { id: "personalidad", label: "Describe tu marca en 3 palabras", type: "text", required: true, placeholder: "Ej.: cercana, confiable, moderna" },
      {
        id: "tono",
        label: "¿Cómo debería hablar tu marca?",
        type: "select",
        options: ["Cercana y amigable", "Profesional y seria", "Divertida y atrevida", "Elegante y premium", "Técnica y experta", "Otro"],
      },
      { id: "materiales", label: "¿Qué material tienes?", type: "textarea", help: "Logo, fotos, textos, manual. Si los tienes en Drive o Dropbox, pega el enlace." },
    ],
  },
  {
    id: "alcance",
    title: "Tiempos y presupuesto",
    intro: "Esto nos ayuda a proponerte algo realista desde el primer día.",
    fields: [
      { id: "entregables", label: "¿Qué esperas recibir al final?", type: "textarea", help: "Ej.: logo en todos los formatos, manual en PDF, 12 publicaciones al mes." },
      {
        id: "fecha",
        label: "¿Para cuándo lo necesitas?",
        type: "select",
        required: true,
        options: ["Es urgente (menos de 2 semanas)", "En 1 mes", "En 2 a 3 meses", "No tengo fecha fija"],
      },
      { id: "fecha_detalle", label: "¿Hay una fecha o evento clave?", type: "text", placeholder: "Ej.: lanzamiento el 15 de marzo" },
      {
        id: "presupuesto",
        label: "¿Qué presupuesto tienes para este proyecto? (pesos colombianos)",
        type: "select",
        required: true,
        options: [
          "Menos de $1.000.000", "$1.000.000 a $3.000.000", "$3.000.000 a $8.000.000",
          "$8.000.000 a $20.000.000", "Más de $20.000.000", "Aún no lo tengo definido",
        ],
      },
      {
        id: "decisor",
        label: "¿Quién aprueba el proyecto?",
        type: "select",
        required: true,
        options: ["Yo decido", "Decido con un socio o equipo", "Lo aprueba otra persona o la gerencia"],
      },
      { id: "experiencia_previa", label: "¿Has trabajado antes con agencias o diseñadores? ¿Qué funcionó y qué no?", type: "textarea" },
      { id: "comentarios", label: "¿Algo más que debamos saber?", type: "textarea" },
    ],
  },
];

export const ALL_FIELDS: Field[] = SECTIONS.flatMap((s) => s.fields);

export type Answers = Record<string, string | string[]>;

const MAX_TEXT = 4000;

/** Valida y limpia las respuestas recibidas del cliente. Devuelve errores por campo. */
export function cleanAnswers(raw: unknown): { answers: Answers; errors: Record<string, string> } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const answers: Answers = {};
  const errors: Record<string, string> = {};

  for (const f of ALL_FIELDS) {
    const v = input[f.id];
    if (f.type === "multiselect") {
      const arr = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && f.options!.includes(x)) : [];
      answers[f.id] = arr;
      if (f.required && arr.length === 0) errors[f.id] = "Elige al menos una opción.";
    } else if (f.type === "select") {
      const s = typeof v === "string" && f.options!.includes(v) ? v : "";
      answers[f.id] = s;
      if (f.required && !s) errors[f.id] = "Elige una opción.";
    } else {
      const s = typeof v === "string" ? v.trim().slice(0, MAX_TEXT) : "";
      answers[f.id] = s;
      if (f.required && !s) errors[f.id] = "Este campo es obligatorio.";
      else if (s && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) errors[f.id] = "Revisa el correo.";
    }
  }
  return { answers, errors };
}

/** Respuestas en texto legible, por secciones. Se usa para la IA y el correo. */
export function answersAsText(a: Answers): string {
  return SECTIONS.map((s) => {
    const lines = s.fields.map((f) => {
      const v = a[f.id];
      const val = Array.isArray(v) ? v.join(", ") : v;
      return `- ${f.label}: ${val || "(sin respuesta)"}`;
    });
    return `## ${s.title}\n${lines.join("\n")}`;
  }).join("\n\n");
}
