# Visión y Alcance — Global Effect Nexus

> Documento de visión del proyecto: propósito, alcance funcional, roles y estado. Última actualización: 2026-07-01.

## 1. Visión general

**Global Effect Nexus** es la plataforma integral de gestión académica y administrativa de la **Fundación Global Effect** (República Dominicana). Centraliza en un solo sistema todos los flujos de trabajo de la fundación: estudiantes, docentes, patrocinadores, finanzas, psicología, tareas y comunicación institucional.

El sistema se construye con arquitectura propia de extremo a extremo: frontend **Next.js 16 (App Router)** y backend sobre **PostgreSQL** (Supabase) con SQL parametrizado (sin ORM), autenticación con **Supabase Auth** y control de acceso por roles (RBAC) propio, almacenamiento de archivos, asistentes de IA, envío de correos e internacionalización (es/en/fr/it).

## 2. Stack tecnológico

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Radix UI + componentes propios
- **Estado/datos:** TanStack React Query + Server Actions
- **Base de datos:** PostgreSQL 17 (Supabase, PostGIS) con `pg` (node-postgres) y SQL parametrizado a mano
- **Autenticación:** Supabase Auth (`@supabase/ssr`) — email + contraseña, sesión en cookies + RBAC propio (6 roles)
- **Internacionalización:** next-intl (es / en / fr / it), ruta por locale `/[locale]/...`
- **Validación:** React Hook Form + Zod
- **UI/gráficos/fechas/mapas:** Lucide React · Recharts · date-fns · Leaflet + react-leaflet (OpenStreetMap) · motion
- **IA:** Anthropic (OCR, chat, traducción) + pgvector para búsqueda semántica/RAG
- **Archivos:** Supabase Storage + `sharp` + tabla `documento`
- **Integraciones:** n8n (webhooks/CRM) · Resend (emails) · GENIALiA (CRM)

> Detalle completo y versiones en [08 · Stack Tecnológico](08-stack-tecnologico.md).

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

- ✅ **Base de datos:** diseñada, normalizada (1NF–3NF), desplegada y verificada en Supabase (36 tablas, soporte de IA con pgvector). Ver [modelo de datos](04-modelo-de-datos/).
- ✅ **Documentación de cimientos:** ERD, diccionario de datos, normalización/escalabilidad, guía de despliegue, [stack](08-stack-tecnologico.md) y [diseño](09-guia-de-diseno.md).
- ▶️ **Aplicación Next.js (S4 en curso):** Supabase Auth + RBAC, i18n (es/en/fr/it), capa `server/` por dominio, Storage y layout del portal. Build/lint en verde.

Ver el [plan de trabajo](05-plan-de-trabajo.md) para el detalle de sprints y próximos pasos.
