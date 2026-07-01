# Documentación — Global Effect Nexus

Plataforma integral de gestión académica y administrativa de la **Fundación Global Effect**.
Toda la documentación del proyecto vive en esta carpeta, organizada para las entregas y para guiar el desarrollo por **sprints**.

## Índice

| # | Documento | Contenido |
|---|---|---|
| 01 | [Visión y Alcance](01-vision-y-alcance.md) | Propósito, stack, roles, módulos y estado del proyecto. |
| 02 | [Arquitectura Técnica](02-arquitectura-tecnica.md) | Capas, estructura de carpetas y decisiones de arquitectura. |
| 03 | [Modelo de Datos](03-modelo-de-datos/) | ERD, diccionario de datos y normalización/escalabilidad. |
| 04 | [Plan de Trabajo](04-plan-de-trabajo.md) | Cronograma general y próximos pasos. |
| 05 | [Backlog de Sprints](05-sprints/README.md) | Los 14 sprints con sus tareas (estado por sprint). |
| — | [`_fuentes/`](_fuentes/) | Documentos fuente originales (módulos, planes, inventarios, entregas). |

### 03 · Modelo de datos
- [Diagrama Entidad-Relación](03-modelo-de-datos/diagrama-entidad-relacion.md) — ERD Mermaid (global + por dominio) y matriz de relaciones.
- [Diagrama de Flujo de Datos (DFD)](03-modelo-de-datos/diagrama-flujo-datos.md) — contexto y procesos (Cuarta Entrega).
- [Diccionario de Datos](03-modelo-de-datos/diccionario-de-datos.md) — 36 tablas, 333 columnas, generado desde la BD real.
- [Normalización y Escalabilidad](03-modelo-de-datos/normalizacion-y-escalabilidad.md) — SMART, 1NF–3NF, escalabilidad e IA.

## Artefactos de base de datos (código)

| Ubicación | Contenido |
|---|---|
| [`../db/migrations/`](../db/migrations/) | Migraciones SQL numeradas por dominio (`0001`–`0013`). |
| [`../db/seed.sql`](../db/seed.sql) | Datos semilla: roles, permisos, usuario maestro, datos de prueba. |
| [`../db/README.md`](../db/README.md) | Guía de despliegue y verificación de la base de datos. |
| `../.env.example` | Plantilla de variables de entorno. |

## Estado del proyecto (2026-07-01)

- ✅ **S0–S3 (Base de datos):** diseñada, normalizada (1NF–3NF), desplegada y verificada en Supabase — 36 tablas, RBAC, pgvector para IA.
- ✅ **Documentación de cimientos** completa (visión, arquitectura, ERD, diccionario, normalización, backlog).
- ▶️ **S4 — Backend núcleo (siguiente):** inicializar Next.js, Auth.js (credenciales + JWT), RBAC, i18n y capa de datos por dominio.

## Cómo arrancar el backend (siguiente sprint)

Ver el detalle en [Backlog de Sprints — S4](05-sprints/README.md#s4--backend-nucleo-auth-rbac-i18n). Resumen:

1. Inicializar proyecto Next.js + TypeScript (`package.json`, Tailwind, shadcn/ui).
2. Configurar `.env.local` (ya existe) y el pool `pg` en `src/lib/db.ts`.
3. Auth.js con credenciales + JWT, cargando `rol`/`permisos` en el token.
4. `middleware.ts` (protección de rutas por rol) + `rbac.ts` (`can(usuario, permiso)`).
5. i18n con next-intl (`messages/es.json`, `messages/en.json`) y rutas `/[locale]`.
6. Primer vertical end-to-end (Expedientes): queries parametrizadas → Zod → Server Actions → UI.

## Resumen de la base de datos

- **Motor:** PostgreSQL 17 (Supabase). SQL a mano, sin ORM, consultas parametrizadas.
- **36 tablas · 333 columnas · 7 enums · 44 FKs · 88+ índices · 20 triggers.**
- **Extensiones:** `pgcrypto`, `citext`, `pg_trgm`, `vector` (pgvector 0.8, índice HNSW).
- **Extensibilidad:** columna `metadata JSONB` en las 14 entidades principales.
- **Credenciales semilla:** `admin@globaleffect.org` / `admin123` (super_admin).
