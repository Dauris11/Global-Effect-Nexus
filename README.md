# Global Effect Nexus

Plataforma web integral para la gestión académica y administrativa de la **Fundación Global Effect** (La Vega, República Dominicana). Proyecto final de grado — UCATECI.

> **Estado (2026-07-11):** cimientos completos y **backend núcleo (S4) en curso**. BD desplegada en Supabase (36 tablas, RBAC, pgvector); app en **Next.js 16 + Tailwind 4** con **Supabase Auth + RBAC**, i18n `es/en/fr/it`, capa `server/` por dominio, Storage y layout del portal. Build y lint en verde.

---

## Puesta en marcha (para desarrollo)

Requisitos: **Node.js 20.9+**, **npm 10+**, Git. (Opcional: `psql` para SQL manual.)

```bash
# 1. Clonar e instalar dependencias
git clone <repo> && cd "Global Effect"
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
#    -> pedir a un compañero los valores reales (DATABASE_URL, llaves Supabase, Resend, Anthropic)
#       El .env.local NO está en git.

# 3. (Solo para una BD nueva/vacía) aplicar esquema y datos semilla
npm run db:migrate      # aplica db/migrations/0001..0014
npm run db:seed         # roles, permisos, usuario admin, datos de prueba
#    La BD compartida ya está desplegada: db:migrate dirá "Base de datos al día".

# 4. Arrancar
npm run dev             # http://localhost:3000  (redirige a /es)
```

Admin: **`admin@globaleffect.org`** (rol `super_admin`). El login es vía **Supabase Auth**; crea su identidad en Supabase → Authentication (el trigger la enlaza por email). Ver [db/README.md](db/README.md).

> Lista completa de dependencias y comandos de instalación en [`dependencias.txt`](dependencias.txt).

---

## Estructura del proyecto

```
Global Effect/
├─ src/
│  ├─ app/[locale]/            # rutas por idioma (App Router)
│  │  ├─ (auth)/login/         # login (Supabase Auth)
│  │  ├─ (portal)/dashboard/   # área autenticada (Sidebar + TopBar por rol)
│  │  ├─ layout.tsx · page.tsx · globals.css (Tailwind 4)
│  ├─ components/ui/           # componentes base (Radix + propios; base: button)
│  ├─ components/layout/       # sidebar · topbar
│  ├─ i18n/                    # next-intl: routing, request, navigation
│  ├─ lib/                     # db.ts (pg) · supabase/ · auth.ts · rbac.ts · nav.ts · utils.ts
│  ├─ server/                  # capa por dominio (estudiantes/…) · storage.ts · auth/
│  └─ proxy.ts                 # i18n + sesión Supabase + protección por rol
├─ messages/                   # es · en · fr · it (traducciones)
├─ scripts/                    # migrate.mjs · seed.mjs (runners de BD)
├─ db/
│  ├─ migrations/              # 0001..0014 (.sql por dominio)
│  ├─ seed.sql
│  └─ README.md                # guía de despliegue de la BD
├─ docs/                       # TODA la documentación (ver docs/README.md)
├─ .env.example               # plantilla de entorno
├─ eslint.config.mjs · postcss.config.mjs
└─ package.json · tsconfig.json · next.config.mjs
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Linter |
| `npm run db:migrate` | Aplica las migraciones SQL pendientes (idempotente) |
| `npm run db:seed` | Aplica `db/seed.sql` |

---

## Documentación

Todo está en **[`docs/`](docs/)** — un archivo por tema. Empieza por [`docs/README.md`](docs/README.md).

| Tema | Documento |
|---|---|
| Visión y alcance | [docs/01-vision-y-alcance.md](docs/01-vision-y-alcance.md) |
| Arquitectura técnica | [docs/02-arquitectura-tecnica.md](docs/02-arquitectura-tecnica.md) |
| Módulos funcionales (27) | [docs/03-modulos-funcionales.md](docs/03-modulos-funcionales.md) |
| Modelo de datos (ERD, DFD, diccionario) | [docs/04-modelo-de-datos/](docs/04-modelo-de-datos/) |
| Plan de trabajo y sprints | [docs/05-plan-de-trabajo.md](docs/05-plan-de-trabajo.md) |
| **Guía de desarrollo (convenciones)** | [docs/07-guia-desarrollo.md](docs/07-guia-desarrollo.md) |
| **Stack tecnológico (definitivo)** | [docs/08-stack-tecnologico.md](docs/08-stack-tecnologico.md) |
| Guía de diseño (marca, Montserrat, paleta) | [docs/09-guia-de-diseno.md](docs/09-guia-de-diseno.md) |

Diagramas editables: `docs/04-modelo-de-datos/*.drawio` (draw.io) y `esquema.dbml` (dbdiagram.io).

---

## Cómo continuar (Sprint 5 — Expedientes y Dashboard)

El núcleo de S4 ya está: **Supabase Auth + RBAC** (`src/lib/`, `src/proxy.ts`), **login**, capa `server/` por dominio, **Storage** y **layout del portal**. Lo siguiente:

1. Completar el **módulo vertical Expedientes** (UI): consumir `src/server/estudiantes/` (queries + actions + schema + types) con buscador, formulario de 6 pestañas y detalle con GPA.
2. **OCR → Expediente** con Anthropic (usar `documento` + `extraccion_ocr`).
3. **Dashboard** con tarjetas y gráficos (Recharts).

Detalle y convenciones en la [guía de desarrollo](docs/07-guia-desarrollo.md). Backlog en [docs/05-plan-de-trabajo.md](docs/05-plan-de-trabajo.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 + Radix UI · PostgreSQL 17 (Supabase, PostGIS, `pg` sin ORM) · **Supabase Auth** + RBAC propio · next-intl (es/en/fr/it) · Zod · TanStack Query · Recharts · Leaflet · motion · Resend · Anthropic · pgvector (IA/RAG). Detalle completo en [docs/08-stack-tecnologico.md](docs/08-stack-tecnologico.md).

## Equipo

Gabriela García · Dauris Santana — Escuela de Ingeniería en Sistemas y Computación, UCATECI.
