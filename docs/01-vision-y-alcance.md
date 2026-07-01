# Visión y Alcance — Global Effect Nexus

> Documento de visión del proyecto: propósito, alcance funcional, roles y estado. Última actualización: 2026-07-01.

## 1. Visión general

**Global Effect Nexus** es la plataforma integral de gestión académica y administrativa de la **Fundación Global Effect** (República Dominicana). Centraliza en un solo sistema todos los flujos de trabajo de la fundación: estudiantes, docentes, patrocinadores, finanzas, psicología, tareas y comunicación institucional.

El sistema se construye con arquitectura propia de extremo a extremo: frontend **Next.js (App Router)** y backend sobre **PostgreSQL** con SQL parametrizado (sin ORM), autenticación con control de acceso por roles (RBAC), almacenamiento de archivos, asistentes de IA, envío de correos e internacionalización (español/inglés).

## 2. Stack tecnológico

- **Frontend:** Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui
- **Estado/datos:** TanStack React Query + Server Actions
- **Base de datos:** PostgreSQL 17 (Supabase) con `pg` (node-postgres) y SQL parametrizado a mano
- **Autenticación:** Auth.js (NextAuth v5) — credenciales + sesiones JWT + RBAC (6 roles)
- **Internacionalización:** next-intl (es / en), ruta por locale `/[locale]/...`
- **Validación:** React Hook Form + Zod
- **UI/gráficos/fechas:** Lucide React · Recharts · date-fns (locale español)
- **IA:** servicio propio (OCR, chat, extracción de datos) + pgvector para búsqueda semántica/RAG
- **Archivos:** storage propio (Supabase Storage / S3) + tabla `documento`

### ¿Por qué SQL a mano y no un ORM?
- Se documenta y justifica cada tabla, índice y constraint (relevante para la defensa académica).
- Las consultas parametrizadas (`$1`, `$2`…) son la defensa directa contra inyección SQL.
- El costo (más código, sin tipado automático de filas) se compensa con Zod + interfaces TypeScript por entidad.

## 3. Roles y control de acceso (RBAC)

Cada usuario ve un menú lateral distinto según su rol. Los usuarios se **invitan**, no se registran.

| Rol | Alcance |
|---|---|
| `super_admin` | Acceso absoluto: configuración, auditoría y todos los datos |
| `admin` | Administración general operativa y todos los módulos |
| `docente` | Portal docente: cursos, materias, calificaciones |
| `estudiante` | Portal estudiantil: materias, notas, citas |
| `psicologo` | Citas confidenciales, expedientes (lectura), notas de psicología |
| `contabilidad` | Transacciones, balances, reportes financieros |

**Privacidad:** las notas de psicología no forman parte del expediente general; viven aisladas con acceso restringido (`psicologia.leer` / `super_admin`).

## 4. Alcance funcional (27 módulos + portales)

**Públicos (sin login):** Landing pública · Inscripción de comida (`/comida`) · Agendar cita de psicología.

**Autenticados:**
- **Dashboard:** métricas en tiempo real, gráficos financieros, tareas y eventos.
- **Expedientes:** CRUD del perfil integral + **OCR con IA**; formulario de 6 pestañas; detalle con GPA y gráficos.
- **Académico:** Materias, Cursos técnicos, Calificaciones, Historial, Prematrícula, Períodos.
- **Academias:** Programas de liderazgo/habilidades y Materiales educativos.
- **Patrocinio:** Patrocinadores y Asignación de becas.
- **Contabilidad:** ingresos/egresos/becas, balance.
- **Psicología:** citas confidenciales, niveles de confidencialidad, riesgos (acceso estricto).
- **Administrativo:** Tareas (Kanban + email + evento automático), Proyectos, Gestión de personal.
- **Calendario:** eventos + tareas con vencimiento; agenda a 30 días.
- **IA:** Chat interno (contexto de toda la BD) y Chat estudiantil.
- **Reportes:** dashboards (Proyectos / Académico / Contabilidad).
- **Otros:** Servicios mensuales (export PDF), Configuración, Sitemap.

**Portales por rol:** Estudiante, Profesor, Administrativo, Contabilidad, Psicología, Cursos técnicos.

### Flujos automatizados clave
1. **OCR → Expediente:** subir documento → IA extrae datos → guarda/precarga formulario (con trazabilidad en `extraccion_ocr`).
2. **Tarea → Notificación:** crear tarea con asignados → correo a cada uno → evento en calendario.
3. **Inscripción comida:** validar hora (≤ 8:30 AM) + no duplicado → registro → confirmación.
4. **Servicios mensuales:** toggle → upsert de registro.
5. **Chat IA:** contexto desde entidades (+ recuperación semántica RAG) → respuesta markdown.

## 5. Estado del proyecto (2026-07-01)

- ✅ **Base de datos:** diseñada, normalizada (1NF–3NF), desplegada y verificada en Supabase (36 tablas, soporte de IA con pgvector). Ver [modelo de datos](03-modelo-de-datos/).
- ✅ **Documentación de cimientos:** ERD, diccionario de datos, normalización/escalabilidad y guía de despliegue.
- ⏳ **Aplicación Next.js:** por iniciar (scaffolding, Auth.js, i18n, capa de datos por dominio).

Ver el [plan de trabajo](04-plan-de-trabajo.md) para el detalle de sprints y próximos pasos.
