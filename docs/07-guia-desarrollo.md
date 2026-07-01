# Guía de Desarrollo — Global Effect Nexus

Convenciones y flujos de trabajo del proyecto. Léela antes de escribir código. Los estándares aquí descritos ya están aplicados desde la fase de base de datos.

> **Regla de oro:** todo el código va **documentado** (comentario de cabecera por archivo y en funciones no triviales). Este es un proyecto de tesis; la documentación importa tanto como el código.

---

## 1. Convenciones

- **TypeScript estricto.** Nada de `any` salvo casos justificados.
- **Nomenclatura:** `camelCase` en código TS; `snake_case`, en español y en singular, en la base de datos (`estudiante`, no `students`).
- **Sin ORM.** El acceso a datos se escribe a mano con `pg` y **parámetros posicionales** (`$1, $2…`). **Nunca** concatenar entrada del usuario en el SQL (defensa contra inyección).
- **Validación con Zod** en la frontera (formularios / Server Actions). Tipos por entidad en `types.ts`.
- **i18n:** los textos de interfaz van en `messages/{es,en}.json`. Los valores de estado se guardan como **código** en la BD y se traducen solo en la UI.
- **Estilos:** Tailwind + shadcn/ui, usando `cn()` de `src/lib/utils.ts` para componer clases.
- **Secretos:** solo en `.env.local` (nunca en el repo).

---

## 2. Estructura de un módulo (patrón por dominio)

Cada módulo de negocio vive en `src/server/<dominio>/` con cuatro archivos:

```
src/server/estudiantes/
├─ types.ts       # interfaces TypeScript de la entidad
├─ schema.ts      # esquemas Zod (validación de entrada)
├─ queries.ts     # SELECTs parametrizados (lectura)
└─ actions.ts     # Server Actions (escritura) + control de permisos
```

La UI (páginas y componentes) consume estas funciones; no accede a la BD directamente.

### Ejemplo — query parametrizada (`queries.ts`)

```ts
import { query } from "@/lib/db";
import type { Estudiante } from "./types";

export async function getEstudiante(id: string): Promise<Estudiante | null> {
  const { rows } = await query(
    `SELECT e.*, p.nombre AS patrocinador_nombre
       FROM estudiante e
       LEFT JOIN patrocinador p ON p.id = e.patrocinador_id
      WHERE e.id = $1`,
    [id],
  );
  return (rows[0] as Estudiante) ?? null;
}
```

### Ejemplo — Server Action con validación y permiso (`actions.ts`)

```ts
"use server";
import { z } from "zod";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";

const CrearEstudiante = z.object({ nombre: z.string().min(1), cedula: z.string().optional() });

export async function crearEstudiante(input: unknown) {
  const session = await auth();
  const rol = session?.user?.rol;
  if (!rol || !(await can(rol, "expedientes.escribir"))) throw new Error("No autorizado");

  const data = CrearEstudiante.parse(input);
  const { rows } = await query(
    `INSERT INTO estudiante (nombre, cedula) VALUES ($1, $2) RETURNING id`,
    [data.nombre, data.cedula ?? null],
  );
  return rows[0].id as string;
}
```

---

## 3. Autenticación y RBAC

- Configuración de Auth.js: `src/lib/auth.ts` (credenciales + JWT; el `rol` viaja en el token).
- Helpers de permisos: `src/lib/rbac.ts` → `can(rol, "codigo.permiso")` y `permisosDeRol(rol)`.
- `super_admin` siempre pasa `can()`.
- En **S4** se integrará la protección por rol en `src/middleware.ts` (hoy solo hace i18n).

Permisos disponibles (ver `db/seed.sql`): `expedientes.*`, `academico.*`, `calificaciones.registrar`, `patrocinadores.*`, `finanzas.*`, `psicologia.*`, `operaciones.*`, `usuarios.administrar`, `ia.usar`, `ia.administrar`.

### Regla crítica — confidencialidad de Psicología
Las tablas `cita_psicologia`, `nota_psicologica` y `perfil_psicologico` están **aisladas**. Nunca hacer `JOIN` a ellas desde consultas del expediente general. Su lectura exige `psicologia.leer` (rol `psicologo` / `super_admin`).

---

## 4. Internacionalización (i18n)

- Componentes de servidor/cliente: `const t = useTranslations("home");  t("title")`.
- Agregar textos en `messages/es.json` **y** `messages/en.json` (mismas claves).
- Navegación con prefijo de idioma: usar `Link`, `redirect`, `useRouter` de `src/i18n/navigation.ts` (no los de `next/navigation`).

---

## 5. Base de datos y migraciones

- El esquema son archivos `.sql` numerados en `db/migrations/`. **No editar** una migración ya aplicada; crear una nueva.
- Crear un cambio de esquema:
  1. Nuevo archivo `db/migrations/0014_<descripcion>.sql`.
  2. `npm run db:migrate` (aplica solo lo pendiente; registra en la tabla `_migracion`).
- Convenciones del esquema: PK `id uuid` (`gen_random_uuid()`), `created_at`/`updated_at` con trigger `set_updated_at()`, FKs con `ON DELETE` explícito, `CHECK`/`UNIQUE` de negocio.
- Extensibilidad: las entidades principales tienen `metadata JSONB` para campos futuros sin alterar el esquema.
- Referencia completa: [modelo de datos](04-modelo-de-datos/) (ERD, DFD, diccionario) y [`db/README.md`](../db/README.md).

---

## 6. Componentes de interfaz (shadcn/ui)

Agregar un componente:

```bash
npx shadcn@latest add card input dialog table   # etc.
```

Se instala en `src/components/ui/`. Ya está configurado `components.json`. Componente base incluido: `button`.

---

## 7. Flujo de Git

- **No** hacer push directo a `main`. Trabajar en ramas: `feat/<modulo>`, `fix/<algo>`, `docs/<tema>`.
- Commits descriptivos en español. Abrir Pull Request hacia `main` para revisión.
- `.env.local`, `node_modules/` y `.next/` están en `.gitignore` (no versionar).

---

## 8. Verificación antes de subir

```bash
npm run lint        # sin errores de lint
npm run build       # compila sin errores de tipos
```

Para cambios de BD, probar `npm run db:migrate` contra una base de prueba y verificar el borrado en cascada y las restricciones.

---

## 9. Mapa rápido de "dónde está qué"

| Necesito… | Está en… |
|---|---|
| Conexión a la BD | `src/lib/db.ts` (`query`, `pool`) |
| Login / sesión | `src/lib/auth.ts` |
| Permisos | `src/lib/rbac.ts` |
| Traducciones | `messages/*.json` + `src/i18n/` |
| Esquema / tablas | `db/migrations/` · [diccionario](04-modelo-de-datos/diccionario-de-datos.md) |
| Qué hace cada módulo | [03-modulos-funcionales.md](03-modulos-funcionales.md) |
| Qué sigue (sprints) | [05-plan-de-trabajo.md](05-plan-de-trabajo.md) |
