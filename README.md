# Global Effect Nexus

Plataforma web integral para la gestión académica y administrativa de la **Fundación Global Effect** (La Vega, República Dominicana). Proyecto final de grado — UCATECI.

> **Estado (2026-07-01):** cimientos completos. Base de datos diseñada, normalizada y **desplegada en Supabase** (36 tablas, RBAC, pgvector); proyecto Next.js inicializado y compilando. **Siguiente sprint: S4 — backend núcleo** (login, RBAC en middleware, primer módulo).

---

## Puesta en marcha (para desarrollo)

Requisitos: **Node.js 20+**, **npm 10+**, Git. (Opcional: `psql` para SQL manual.)

```bash
# 1. Clonar e instalar dependencias
git clone <repo> && cd "Global Effect"
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
#    -> pedir a un compañero los valores reales (DATABASE_URL, llaves Supabase, AUTH_SECRET)
#       El .env.local NO está en git.

# 3. (Solo para una BD nueva/vacía) aplicar esquema y datos semilla
npm run db:migrate      # aplica db/migrations/0001..0013
npm run db:seed         # roles, permisos, usuario admin, datos de prueba
#    La BD compartida ya está desplegada: db:migrate dirá "Base de datos al día".

# 4. Arrancar
npm run dev             # http://localhost:3000  (redirige a /es)
```

Usuario semilla: **`admin@globaleffect.org` / `admin123`** (rol `super_admin`).

> Lista completa de dependencias y comandos de instalación en [`dependencias.txt`](dependencias.txt).

---

## Estructura del proyecto

```
Global Effect/
├─ src/
│  ├─ app/[locale]/            # rutas por idioma (App Router)
│  │  ├─ layout.tsx · page.tsx
│  │  └─ api/auth/[...nextauth]/route.ts
│  ├─ components/ui/           # componentes shadcn/ui (base: button)
│  ├─ i18n/                    # next-intl: routing, request, navigation
│  ├─ lib/                     # db.ts (pool pg) · auth.ts · rbac.ts · utils.ts
│  ├─ types/                   # tipos globales (next-auth.d.ts)
│  └─ middleware.ts            # i18n (RBAC se integra en S4)
├─ messages/                   # es.json · en.json (traducciones)
├─ scripts/                    # migrate.mjs · seed.mjs (runners de BD)
├─ db/
│  ├─ migrations/              # 0001..0013 (.sql por dominio)
│  ├─ seed.sql
│  └─ README.md                # guía de despliegue de la BD
├─ docs/                       # TODA la documentación (ver docs/README.md)
├─ .env.example               # plantilla de entorno
├─ dependencias.txt           # dependencias + comandos
└─ package.json · tsconfig.json · next.config.mjs · tailwind.config.ts
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

Diagramas editables: `docs/04-modelo-de-datos/*.drawio` (draw.io) y `esquema.dbml` (dbdiagram.io).

---

## Cómo continuar (Sprint 4 — backend núcleo)

1. Pantalla de **login** que use `signIn` de Auth.js (`src/lib/auth.ts` ya configurado).
2. Integrar **RBAC en `middleware.ts`** (proteger rutas del área autenticada por rol/permiso con `can()` de `src/lib/rbac.ts`).
3. Primer **módulo vertical end-to-end** (Expedientes): `src/server/estudiantes/` con `queries.ts` + `actions.ts` + `schema.ts` (Zod) + `types.ts`, y su UI.

Detalle y convenciones en la [guía de desarrollo](docs/07-guia-desarrollo.md). Backlog en [docs/05-plan-de-trabajo.md](docs/05-plan-de-trabajo.md).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind + shadcn/ui · PostgreSQL 17 (Supabase, `pg` sin ORM) · Auth.js v5 (JWT + RBAC) · next-intl (es/en) · Zod · TanStack Query · Recharts · pgvector (IA/RAG).

## Equipo

Gabriela García · Dauris Santana — Escuela de Ingeniería en Sistemas y Computación, UCATECI.
