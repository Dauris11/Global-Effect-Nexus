# Backlog de Sprints — Global Effect Nexus

> Plan de 14 sprints (~7 meses) derivado de la planificación del proyecto. Los sprints de base de datos (**S0–S3**) ya están **completados y desplegados** en Supabase.

## Estado general

| Sprint | Foco | Fechas | Estado |
| :-- | :-- | :-- | :--: |
| **S0** | Planeamiento y diseno | 2026-07-06 → 2026-07-17 | ✅ Hecho |
| **S1** | BD Identidad y transversales | 2026-07-20 → 2026-07-31 | ✅ Hecho |
| **S2** | BD Estudiante y Academico | 2026-08-03 → 2026-08-14 | ✅ Hecho |
| **S3** | BD Dominios restantes | 2026-08-17 → 2026-08-28 | ✅ Hecho |
| **S4** | Backend nucleo (auth, RBAC, i18n) | 2026-08-31 → 2026-09-11 | ▶️ Siguiente |
| **S5** | Expedientes y Dashboard | 2026-09-14 → 2026-09-25 | ⏳ Pendiente |
| **S6** | Academico (modulos) y portales | 2026-09-28 → 2026-10-09 | ⏳ Pendiente |
| **S7** | Patrocinio y Finanzas | 2026-10-12 → 2026-10-23 | ⏳ Pendiente |
| **S8** | Psicologia | 2026-10-26 → 2026-11-06 | ⏳ Pendiente |
| **S9** | Administrativo y Calendario | 2026-11-09 → 2026-11-20 | ⏳ Pendiente |
| **S10** | Modulos restantes y paginas publicas | 2026-11-23 → 2026-12-04 | ⏳ Pendiente |
| **S11** | IA y Reportes | 2026-12-07 → 2026-12-18 | ⏳ Pendiente |
| **S12** | Migracion, QA y Seguridad | 2026-12-21 → 2027-01-01 | ⏳ Pendiente |
| **S13** | Despliegue y Tesis | 2027-01-04 → 2027-01-15 | ⏳ Pendiente |

> **Estado del backend:** la fundación de datos (S0–S3) está lista. El siguiente paso es **S4 — Backend núcleo (Auth.js, RBAC, i18n)**.

---

## S0 — Planeamiento y diseno
**Fase:** Planeamiento · **Fechas:** 2026-07-06 → 2026-07-17 · **Estimado:** 20 días · **Estado: ✅ COMPLETADO**

> META SMART Especifico: Dejar listo el diseno y el entorno antes de escribir DDL. Medible: ERD aprobado, diccionario de datos completo, matriz roles x permisos y repo Next.js corriendo con pg. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [x] Levantar requerimientos y casos de uso (27 modulos)
- [x] Disenar ERD completo
- [x] Diccionario de datos (tabla por tabla, columna por columna)
- [x] Definir tipos ENUM y catalogos
- [x] Definir matriz de roles x permisos (6 roles)
- [x] Inicializar repo Next.js + TypeScript
- [x] Configurar conexion pg (pool) + .env
- [x] Configurar runner de migraciones
- [x] Configurar i18n (next-intl) es/en
- [x] Integrar Tailwind + shadcn/ui + tokens

---

## S1 — BD Identidad y transversales
**Fase:** Base de datos · **Fechas:** 2026-07-20 → 2026-07-31 · **Estimado:** 18 días · **Estado: ✅ COMPLETADO**

> META SMART Especifico: Crear y migrar identidad, acceso y soporte con FKs, indices, triggers y seed. Medible: 7 tablas migradas + funcion set_updated_at + seed con 6 roles, permisos y admin. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [x] Infra: pgcrypto + funcion/trigger set_updated_at
- [x] Tabla rol
- [x] Tabla permiso
- [x] Tabla rol_permiso (union)
- [x] Tabla usuario
- [x] Tabla documento (reemplaza *_url)
- [x] Tabla notificacion
- [x] Tabla audit_log
- [x] seed.sql: roles, permisos y admin inicial

---

## S2 — BD Estudiante y Academico
**Fase:** Base de datos · **Fechas:** 2026-08-03 → 2026-08-14 · **Estimado:** 24 días · **Estado: ✅ COMPLETADO**

> META SMART Especifico: Construir el nucleo del beneficiario (normalizado) y el dominio academico. Medible: 10 tablas migradas (estudiante + 4 perfiles + periodo, materia, curso, inscripcion, calificacion, historial) con enums y FKs. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [x] Crear enums (estudiante y academico)
- [x] Tabla estudiante (normalizada)
- [x] Tabla familiar
- [x] Tabla perfil_vivienda (1:1)
- [x] Tabla perfil_salud (1:1)
- [x] Tabla perfil_socioeconomico (1:1)
- [x] Tabla periodo
- [x] Tabla materia
- [x] Tabla curso (tecnicos)
- [x] Tabla inscripcion (matricula)
- [x] Tabla calificacion
- [x] Tabla historial_calificacion

---

## S3 — BD Dominios restantes
**Fase:** Base de datos · **Fechas:** 2026-08-17 → 2026-08-28 · **Estimado:** 26 días · **Estado: ✅ COMPLETADO**

> META SMART Especifico: Construir patrocinio, finanzas, psicologia, operacion, academias y bienestar. Medible: 12 tablas migradas con enums y FKs. Esquema 100% completo. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [x] Tabla patrocinador
- [x] Tabla asignacion_beca
- [x] Tabla transaccion
- [x] Tabla cita_psicologia
- [x] Tabla nota_psicologica (CONFIDENCIAL)
- [x] Tabla proyecto
- [x] Tabla tarea
- [x] Tabla tarea_asignado (union)
- [x] Tabla evento
- [x] Tabla registro_servicio
- [x] Tabla academia
- [x] Tabla material
- [x] Tabla inscripcion_comida

---

## S4 — Backend nucleo (auth, RBAC, i18n)
**Fase:** Backend · **Fechas:** 2026-08-31 → 2026-09-11 · **Estimado:** 12 días

> META SMART Especifico: Montar autenticacion, control de acceso y la base transversal sobre la BD. Medible: Login con Auth.js (credenciales+JWT), middleware por rol, helper can(), capa de queries, i18n operativo y subida de archivos. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Auth.js (credenciales + JWT)
- [ ] Middleware por rol + helper can()
- [ ] Capa base de queries pg
- [ ] i18n operativo (es/en) + selector
- [ ] Subida de archivos + tabla documento
- [ ] Layout: AppLayout + Sidebar por rol + TopBar

---

## S5 — Expedientes y Dashboard
**Fase:** Implementacion · **Fechas:** 2026-09-14 → 2026-09-25 · **Estimado:** 10 días

> META SMART Especifico: Entregar el modulo mas grande (Expedientes) y el Dashboard. Medible: CRUD con formulario de 6 pestanas, detalle con GPA, OCR, y Dashboard con tarjetas y graficos. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] CRUD de expedientes + buscador
- [ ] Formulario por pestanas (6 secciones)
- [ ] Vista de detalle con GPA y graficos
- [ ] OCR con IA (subir documento)
- [ ] Dashboard principal

---

## S6 — Academico (modulos) y portales
**Fase:** Implementacion · **Fechas:** 2026-09-28 → 2026-10-09 · **Estimado:** 10 días

> META SMART Especifico: Entregar el flujo academico y los portales de estudiante y profesor. Medible: Materias, Cursos, Calificaciones, Historial, Prematricula, Periodos + Portal Estudiante y Profesor. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Materias y Cursos tecnicos
- [ ] Calificaciones (color por nota)
- [ ] Historial + Prematricula + Periodos
- [ ] Portal Estudiante
- [ ] Portal Profesor

---

## S7 — Patrocinio y Finanzas
**Fase:** Implementacion · **Fechas:** 2026-10-12 → 2026-10-23 · **Estimado:** 8 días

> META SMART Especifico: Entregar patrocinadores, becas y contabilidad. Medible: Patrocinadores, Asignacion de Becas y Contabilidad con estadisticas + Portal Contabilidad. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Patrocinadores (CRUD + estadisticas)
- [ ] Asignacion de becas
- [ ] Contabilidad (transacciones + balance)
- [ ] Portal Contabilidad

---

## S8 — Psicologia
**Fase:** Implementacion · **Fechas:** 2026-10-26 → 2026-11-06 · **Estimado:** 8 días

> META SMART Especifico: Entregar Psicologia con control de acceso estricto a datos confidenciales. Medible: Citas con confidencialidad, notas clinicas protegidas por permiso, agendamiento del estudiante y Portal Psicologia. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Gestion de citas y seguimientos
- [ ] Acceso estricto a notas confidenciales
- [ ] Agendar cita (estudiante)
- [ ] Portal Psicologia

---

## S9 — Administrativo y Calendario
**Fase:** Implementacion · **Fechas:** 2026-11-09 → 2026-11-20 · **Estimado:** 10 días

> META SMART Especifico: Entregar tareas (Kanban + automatizaciones), proyectos, personal y calendario. Medible: Kanban con email + evento automatico, proyectos con progreso, personal y calendario mensual + agenda. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Tareas (Kanban) + asignacion multiple
- [ ] Automatizaciones al crear tarea
- [ ] Proyectos + Gestion de personal
- [ ] Calendario mensual + agenda 30 dias
- [ ] Portal Administrativo

---

## S10 — Modulos restantes y paginas publicas
**Fase:** Implementacion · **Fechas:** 2026-11-23 → 2026-12-04 · **Estimado:** 10 días

> META SMART Especifico: Cerrar los modulos restantes y las paginas publicas. Medible: Academias/Materiales, Servicios mensuales (PDF), Comida (publica), Configuracion, Sitemap y Landing. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Academias/Programas + Materiales
- [ ] Servicios mensuales (toggles + PDF)
- [ ] Inscripcion de comida (publica)
- [ ] Configuracion + Sitemap
- [ ] Landing publica (Inicio)

---

## S11 — IA y Reportes
**Fase:** Implementacion · **Fechas:** 2026-12-07 → 2026-12-18 · **Estimado:** 6 días

> META SMART Especifico: Entregar los asistentes de IA y el dashboard analitico. Medible: Chat IA interno con contexto de la BD, Chat IA estudiantil y Reportes (Proyectos/Academico/Contabilidad). Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Chat IA interno (contexto de la BD)
- [ ] Chat IA estudiantil
- [ ] Reportes visuales (3 secciones)

---

## S12 — Migracion, QA y Seguridad
**Fase:** Estabilizacion · **Fechas:** 2026-12-21 → 2027-01-01 · **Estimado:** 6 días

> META SMART Especifico: Migrar datos reales, endurecer seguridad y asegurar calidad. Medible: Migracion >=30% de registros, pruebas de flujos criticos y revision de seguridad. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Migrar >=30% de registros actuales
- [ ] Pruebas de flujos criticos
- [ ] Revision de seguridad

---

## S13 — Despliegue y Tesis
**Fase:** Cierre · **Fechas:** 2027-01-04 → 2027-01-15 · **Estimado:** 6 días

> META SMART Especifico: Desplegar a produccion y dejar la documentacion de tesis lista. Medible: Sistema desplegado, UAT aprobado y documentacion entregada. Alcanzable: equipo de 2, stack Next.js+pg+PostgreSQL. Relevante: avanza el entregable de tesis. Temporal: 2 semanas.

- [ ] Desplegar a produccion
- [ ] UAT con la fundacion
- [ ] Documentacion final de tesis

---
