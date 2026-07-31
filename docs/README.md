# Documentación — Global Effect Nexus

Plataforma integral de gestión académica y administrativa de la **Fundación Global Effect**.
Toda la documentación del proyecto está centralizada en esta carpeta: **un archivo por tema**, sin duplicados.

## Índice

| # | Documento | Contenido |
|---|---|---|
| 01 | [Visión y Alcance](01-vision-y-alcance.md) | Propósito, stack, roles, alcance y estado del proyecto. |
| 02 | [Arquitectura Técnica](02-arquitectura-tecnica.md) | Capas, estructura de carpetas y decisiones de arquitectura. |
| 03 | [Módulos Funcionales](03-modulos-funcionales.md) | Catálogo de los 27 módulos, portales y flujos automatizados. |
| 04 | [Modelo de Datos](04-modelo-de-datos/) | ERD, DFD, diccionario de datos y normalización. |
| 05 | [Plan de Trabajo](05-plan-de-trabajo.md) | Cronograma, próximos pasos y backlog de los 14 sprints. |
| 06 | [Plan de Entregas](06-plan-de-entregas.md) | Guía para producir las entregas de la tesis (E2–E6). |
| 07 | [Guía de Desarrollo](07-guia-desarrollo.md) | Convenciones, patrón de módulos, RBAC, i18n, migraciones y flujo de Git (para desarrollar). |
| 08 | [Stack Tecnológico](08-stack-tecnologico.md) | Stack definitivo (fuente de verdad): framework, Supabase Auth, integraciones, versiones. |
| 09 | [Guía de Diseño](09-guia-de-diseno.md) | Referencias visuales de marca, tipografía y paleta. |
| 10 | [**Estándar de Interfaz**](10-estandar-de-interfaz.md) | **Normativo.** Tokens en tres capas, componentes, densidad, movimiento, accesibilidad y dirección por superficie. |

### 04 · Modelo de datos
- [Diagrama Entidad-Relación](04-modelo-de-datos/diagrama-entidad-relacion.md) — ERD Mermaid (global + por dominio) y matriz de relaciones.
- [Diagrama de Flujo de Datos (DFD)](04-modelo-de-datos/diagrama-flujo-datos.md) — contexto y procesos (Cuarta Entrega).
- [Diccionario de Datos](04-modelo-de-datos/diccionario-de-datos.md) — 36 tablas, 333 columnas, generado desde la BD real.
- [Normalización y Escalabilidad](04-modelo-de-datos/normalizacion-y-escalabilidad.md) — SMART, 1NF–3NF, escalabilidad e IA.
- Formatos de diagrama: [`esquema.dbml`](04-modelo-de-datos/esquema.dbml) (dbdiagram.io) · [`diagrama-flujo-datos.drawio`](04-modelo-de-datos/diagrama-flujo-datos.drawio) (draw.io).

## Otras carpetas

| Carpeta | Contenido |
|---|---|
| [`entregables/`](entregables/) | Documentos formales de la tesis: guía de entregas, primera entrega, análisis académico, plan de entregas (PDF). |
| [`fuentes-datos/`](fuentes-datos/) | Datos crudos de origen: planificación de sprints (CSV) y documentos del **prototipo v1** ([guía de estilo](fuentes-datos/guia-estilo-prototipo.md) · [inventario frente al código actual](fuentes-datos/inventario-prototipo-vs-actual.md)). No normativos: manda el 10. |

## Artefactos de base de datos (código)

| Ubicación | Contenido |
|---|---|
| [`../db/migrations/`](../db/migrations/) | Migraciones SQL numeradas por dominio (`0001`–`0014`; `0014` = integración con Supabase Auth). |
| [`../db/seed.sql`](../db/seed.sql) | Datos semilla: roles, permisos, usuario maestro, datos de prueba. |
| [`../db/README.md`](../db/README.md) | Guía de despliegue y verificación de la base de datos. |
| `../.env.example` | Plantilla de variables de entorno. |

## Estado del proyecto (2026-07-30)

- ✅ **S0–S3 (Base de datos):** diseñada, normalizada (1NF–3NF), desplegada y verificada en Supabase — 36 tablas, RBAC, pgvector.
- ✅ **Documentación de cimientos** completa (visión, arquitectura, módulos, ERD, DFD, diccionario, normalización, plan) + [stack definitivo](08-stack-tecnologico.md) y [guía de diseño](09-guia-de-diseno.md).
- ✅ **Migración de stack:** Next.js 16, Tailwind CSS 4 (CSS-first), Supabase Auth, i18n `es/en`, y libs nuevas (Leaflet, motion, sharp, Resend).
- ▶️ **S4 — Backend núcleo (en curso):** Supabase Auth + RBAC (`proxy.ts` + `requirePermission`), login, capa `server/` por dominio, Storage y layout del portal. Build y lint en verde.
- ✅ **S5 — Expedientes y Panel:** CRUD de expedientes por pestañas, detalle con GPA y gráficos, OCR con IA y panel principal armado por permisos.
- ✅ **S9 — Administrativo y Calendario:** Kanban con automatizaciones (correo + evento espejo), proyectos con avance calculado, personal y calendario mensual.
- ✅ **S6 — Académico y portales por rol:** materias, cursos, calificaciones, historial, prematrícula y períodos; **Portal Estudiante** y **Portal Profesor**, con el vínculo docente ↔ usuario resuelto por FK en la migración `0019`.

Ver los próximos pasos en [Plan de Trabajo](05-plan-de-trabajo.md).

## Resumen de la base de datos

- **Motor:** PostgreSQL 17 (Supabase). SQL a mano, sin ORM, consultas parametrizadas.
- **37 tablas · 347 columnas · 7 enums · 47 FKs · 94 índices · 20 triggers.** (Sin contar `_migracion`, tabla de control del runner.)
- **Extensiones:** `pgcrypto`, `citext`, `pg_trgm`, `vector` (pgvector 0.8, índice HNSW).
- **Extensibilidad:** columna `metadata JSONB` en las 14 entidades principales.
- **Credenciales semilla:** `admin@globaleffect.org` / `admin123` (super_admin).
