# Plan de Trabajo — Global Effect Nexus

> Plan de 14 sprints (~7 meses) y próximos pasos. Detalle de subtareas en `ClickUp_Sprints_Global_Effect_Nexus_jerarquia.csv`.

## 1. Cronograma de sprints

| Sprint | Foco | Fechas |
|---|---|---|
| **S0** | Planeamiento y diseño (ERD, diccionario, entorno) | 06–17 jul 2026 |
| **S1** | BD: Identidad, RBAC y transversales + seed | 20–31 jul 2026 |
| **S2** | BD: Estudiante (normalizado) y Académico | 03–14 ago 2026 |
| **S3** | BD: dominios restantes | 17–28 ago 2026 |
| **S4** | Backend núcleo: Auth.js, RBAC, i18n | 31 ago–11 sep 2026 |
| **S5** | Expedientes (+ OCR) y Dashboard | 14–25 sep 2026 |
| **S6** | Académico (módulos) y portales | 28 sep–09 oct 2026 |
| **S7** | Patrocinio y Finanzas | 12–23 oct 2026 |
| **S8** | Psicología (acceso estricto) | 26 oct–06 nov 2026 |
| **S9** | Administrativo y Calendario | 09–20 nov 2026 |
| **S10** | Módulos restantes y páginas públicas | 23 nov–04 dic 2026 |
| **S11** | IA y Reportes | 07–18 dic 2026 |
| **S12** | Migración, QA y Seguridad | 21 dic 2026–01 ene 2027 |
| **S13** | Despliegue y Tesis | 04–15 ene 2027 |

## 2. Estado actual

La **capa de base de datos está adelantada** respecto al cronograma: el diseño y despliegue previstos en S0–S3 ya están hechos y verificados en Supabase.

- ✅ Diseño ER, normalización 1NF–3NF, diccionario de datos.
- ✅ Migraciones `0001`–`0012` desplegadas (36 tablas, RBAC, pgvector para IA).
- ✅ Seed de roles, permisos y datos de prueba.

## 3. Próximos pasos

### Inmediatos (S1 → S4: backend)
1. **Inicializar el proyecto Next.js:** `package.json`, TypeScript, Tailwind + shadcn, next-intl, pool `pg` en `src/lib/db.ts`.
2. **Auth.js** con credenciales + JWT; cargar `rol`/`permisos` en el token; `rbac.ts` + `middleware.ts`.
3. **Scaffolding i18n** (`messages/es.json`, `messages/en.json`) y rutas `/[locale]`.
4. **Runner de migraciones** integrado al repo (script npm) para reproducibilidad.

### Corto plazo (S5+)
5. **Primer vertical end-to-end** (Expedientes): queries parametrizadas → Zod → Server Actions → UI.
6. **Storage** + flujo **OCR → Expediente** (usando `documento` y `extraccion_ocr`).
7. **Servicios de IA:** chat con contexto RAG (`fragmento_conocimiento`), historial (`conversacion_ia`/`mensaje_ia`).

### Transversal
8. **`audit_log`** en acciones sensibles; **notificaciones** internas.
9. **Reforzar aislamiento de Psicología** (nunca `JOIN` a tablas confidenciales sin permiso).
10. **Pruebas y seguridad** (S12): validación de constraints, RBAC, y consultas parametrizadas.

## 4. Orden de construcción sugerido (un módulo a la vez)

Identidad → Expedientes → Académico → Patrocinio/Becas → Contabilidad → Psicología → Operaciones (Proyectos/Tareas/Calendario/Comida) → Reportes/Dashboard → IA → Estabilización/Despliegue.

Cada módulo = migración (ya lista) + queries parametrizadas + validación Zod + control de acceso por permiso + i18n.
