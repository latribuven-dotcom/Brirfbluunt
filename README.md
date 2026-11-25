# Briebluunt

App de briefing de Bluunt Group.

Formulario web con enlace único por cliente, análisis automático con IA (Gemini, capa gratuita) y panel de analista instalable en el celular (PWA). Todo funciona con planes gratuitos.

## Cómo funciona

1. En el panel (`/admin`) creas un cliente. La app genera su enlace único (`/b/xxxx`), que envías por WhatsApp o copias.
2. El cliente llena el briefing en 7 pasos desde cualquier celular o computador, sin instalar nada. Su avance se guarda en su dispositivo si cierra y vuelve.
3. Al enviar, autoriza el tratamiento de datos (Ley 1581 de 2012). El enlace deja de aceptar respuestas.
4. Gemini analiza las respuestas y te llega un correo con el resumen, las banderas rojas, las preguntas para la reunión y el siguiente paso.
5. Todo queda guardado en tu panel: análisis completo, respuestas, tus notas privadas y la opción de descargar en PDF.

Para instalar el panel como app en Android: abre `tu-app/admin` en Chrome, menú ⋮ y "Instalar app" o "Agregar a la pantalla principal". En iPhone: Safari, Compartir y "Agregar a inicio".

## Costo: $0

| Servicio | Para qué | Plan gratuito |
|---|---|---|
| GitHub | Guardar el código | Repositorio privado gratis |
| Netlify | Publicar la app en `tu-nombre.netlify.app` | Plan Free, permite uso comercial |
| Neon | Base de datos | 0,5 GB, suficiente para miles de briefings |
| Google AI Studio | Análisis con Gemini | Sin tarjeta. Límite diario por modelo (unos 20 análisis/día en el modelo principal, más en el de respaldo) |
| Resend | Correo de aviso a ti | 3.000 correos/mes |

No necesitas dominio propio: la dirección `tu-nombre.netlify.app` funciona.

### Lo que cuesta lo gratis (léelo)

- **Privacidad con Gemini gratis.** En la capa gratuita, Google puede usar lo que envías para mejorar sus productos y personas revisoras pueden leerlo. Google pide no enviar datos personales. Por eso la app **nunca envía a Gemini** el nombre, cargo, empresa, correo ni WhatsApp del cliente: solo las respuestas sobre el negocio y el proyecto. El formulario se lo explica al cliente antes de enviar. Si un cliente escribe datos confidenciales en una respuesta abierta, igual llegan a Google.
- **Límite diario.** Si se agota el límite del modelo principal, la app usa el de respaldo. Si también se agota, el briefing queda guardado y lo analizas desde el panel al día siguiente con "Reintentar análisis".
- **Para quitar estas limitaciones** basta con activar facturación en Google Cloud (desde ese momento Google no usa tus datos para entrenar) y pagar centavos por análisis. No hay que cambiar código.
- **Por qué no Vercel gratis.** Sus términos limitan el plan Hobby a uso "personal o no comercial", y en ese plan Vercel puede usar tu contenido para entrenar su IA. Una agencia con clientes es uso comercial. Si prefieres Vercel, usa el plan Pro (USD 20/mes).

## Publicarla paso a paso (unos 30 minutos)

1. **Código en GitHub.** Crea un repositorio privado y sube esta carpeta.
2. **Base de datos.** En neon.tech crea un proyecto y copia la cadena de conexión (`postgres://...`).
3. **Crear la tabla.** En el "SQL Editor" de Neon pega y ejecuta:
   ```sql
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
     analyzed_at timestamptz,
     analysis_started_at timestamptz
   );
   ```
4. **Clave de Gemini.** En aistudio.google.com, "Get API key" y crea una. No actives facturación si quieres seguir en $0.
5. **Correo.** En resend.com crea una API key. Sin dominio propio, el remitente es `onboarding@resend.dev` y solo puede enviarte a tu propio correo de Resend, que es justo lo que necesitas.
6. **Netlify.** "Add new site", "Import an existing project", elige el repositorio. En "Environment variables" agrega las variables de `.env.example` con tus valores. `APP_URL` es la dirección que te da Netlify (por ejemplo `https://tu-briefing.netlify.app`); puedes cambiar el nombre del sitio en "Site configuration".
7. **Entra** a `APP_URL/admin` con tu `ADMIN_PASSWORD` y crea un cliente de prueba para ti.

Si un análisis se queda en "Analizando" más de 3 minutos, el panel muestra el botón "Analizar ahora".

## Cambiar las preguntas

Las preguntas están en `lib/questions.ts`. El formato del análisis, las instrucciones de la IA y los campos que nunca se envían a Gemini están en `lib/analyze.ts`.

## Privacidad (Ley 1581)

- El cliente autoriza expresamente el tratamiento de sus datos, incluido el envío a Gemini fuera de Colombia, y queda registrada la fecha.
- Desde el panel puedes eliminar un cliente y todos sus datos (derecho de supresión).
- Pendiente de tu parte: publicar una política de tratamiento de datos de tu empresa y, si aplica, registrar la base de datos ante la SIC (RNBD). Esto no lo resuelve el código.

## Desarrollo local

```bash
cp .env.example .env.local   # completa los valores
npm install
npm run db:init
npm run dev                  # http://localhost:3000/admin
```
