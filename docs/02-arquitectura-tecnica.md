# Arquitectura Técnica — Global Effect Nexus

> Arquitectura de la aplicación: capas, estructura de carpetas y decisiones clave. La base de datos se detalla en [03 · Modelo de datos](04-modelo-de-datos/).

## 1. Capas del sistema

```
┌────────────────────────────────────────────────────────────┐
│  Cliente (navegador)                                         │
│  Next.js App Router · React · shadcn/ui · React Query        │
└───────────────┬────────────────────────────────────────────┘
                │  Server Actions / Route Handlers
┌───────────────▼────────────────────────────────────────────┐
│  Servidor (Next.js)                                          │
│  • Auth.js (credenciales + JWT) + middleware RBAC + i18n     │
│  • Capa de dominio: queries.ts (SQL parametrizado) +         │
│    actions.ts + schema.ts (Zod) + types.ts                   │
│  • Servicios de IA (chat, OCR, embeddings/RAG)               │
└───────────────┬────────────────────────────────────────────┘
                │  pg (node-postgres), consultas $1,$2…
┌───────────────▼────────────────────────────────────────────┐
│  PostgreSQL 17 (Supabase) — 36 tablas, RBAC, pgvector       │
│  + Storage (documentos)                                      │
└────────────────────────────────────────────────────────────┘
```

## 2. Estructura de carpetas objetivo (Next.js)

```
global-effect-nexus/
├─ db/                        # migraciones .sql, seed.sql, README (✅ implementado)
├─ docs/                      # documentación / entregas (✅ este directorio)
├─ messages/                  # i18n: es.json, en.json
├─ src/
│  ├─ app/[locale]/
│  │  ├─ (auth)/              # login (sin sidebar)
│  │  ├─ (portal)/            # área autenticada: dashboard, expedientes, academico,
│  │  │                       #   academias, administrativo, patrocinadores, contabilidad,
│  │  │                       #   psicologia, calendario, reportes, configuracion
│  │  ├─ (public)/            # landing, inscripción comida
│  │  └─ api/auth/[...nextauth]/route.ts
│  ├─ components/             # ui/ (shadcn) · layout/ · shared/ · expedientes/
│  ├─ lib/                    # db.ts (pool pg) · auth.ts · rbac.ts · i18n.ts · utils.ts
│  ├─ server/                 # lógica por dominio: queries + actions + schema (zod) + types
│  ├─ hooks/  · middleware.ts (i18n + protección por rol)  · types/
├─ .env.local  ·  .env.example
├─ next.config.mjs · tailwind.config.ts · package.json
```

## 3. Decisiones de arquitectura

- **Acceso a datos sin ORM:** SQL a mano con `pg` y consultas parametrizadas; control total del DDL/DML y defensa contra inyección. Tipado con interfaces TypeScript + validación Zod en el borde.
- **Autenticación:** Auth.js con proveedor de credenciales y sesiones JWT. Los `rol`/`permisos` viajan en el token; `middleware.ts` y `rbac.ts` deciden el acceso por ruta/acción. No se requiere adaptador de BD: basta la tabla `usuario`.
- **RBAC granular:** roles + permisos por módulo (`rol`, `permiso`, `rol_permiso`), evaluados con `can(usuario, 'expedientes.editar')`.
- **Internacionalización:** segmento de ruta `/[locale]`, diccionarios `messages/{es,en}.json`. Los enums se guardan como código y se traducen en la UI (no en la BD).
- **Almacenamiento:** archivos en Storage; sus metadatos en la tabla `documento` (una FK en vez de URLs sueltas).
- **IA:** servicio propio para chat y OCR; contexto recuperado por búsqueda semántica (pgvector/RAG). Historial y extracciones persistidos y auditables.

> La implementación concreta (pool `pg`, Auth.js, RBAC, i18n) está en `src/lib/` y `src/i18n/`; el detalle del esquema en [Modelo de datos](04-modelo-de-datos/).
