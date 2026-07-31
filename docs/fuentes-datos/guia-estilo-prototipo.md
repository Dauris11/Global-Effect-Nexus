# Guía de estilo visual y tipografía — prototipo v1

> **Procedencia y advertencia.** Documento recibido el **2026-07-31**. Describe el
> **prototipo anterior** (Vite + React Router + `.jsx`, `src/pages/`,
> `tailwind.config.js`), **no** el sistema vigente de este repositorio.
>
> El estándar **normativo** en vigor es [10 · Estándar de Interfaz](../10-estandar-de-interfaz.md).
> Ante cualquier discrepancia, manda el 10 — no este archivo.
>
> Se conserva aquí como **fuente de origen** (igual que `sprints-clickup.csv`):
> sirve para trazar de dónde viene una decisión y para valorar una migración,
> no para copiar valores a un componente.
>
> Divergencias medidas contra el código real en
> [`inventario-prototipo-vs-actual.md`](inventario-prototipo-vs-actual.md).

---

## 1. Sistema de tipografía

**Fuente principal (única familia del sistema):**

- Familia: **Inter** (Google Fonts)
- Importación: `@import url('...Inter:wght@300;400;500;600;700;800;900')` al inicio de `src/index.css`
- Pesos: 300 light · 400 regular · 500 medium · 600 semibold · 700 bold · 800 extrabold · 900 black

**Roles tipográficos (tokens CSS):**

| Token | Valor | Uso |
|---|---|---|
| `--font-heading` | `'Inter', sans-serif` | títulos y encabezados |
| `--font-body` | `'Inter', sans-serif` | texto general y párrafos |

Mapeo en `tailwind.config.js`: `font-heading` → `var(--font-heading)` · `font-body` → `var(--font-body)`

**Escala tipográfica:**

| Elemento | Clase Tailwind | Tamaño aprox. |
|---|---|---|
| Hero H1 (landing) | `clamp(28px, 5.5vw, 56px)` | 28–56px / bold |
| Título de sección H2 | `text-3xl md:text-4xl` | 30–36px / bold |
| Título de página H1 | `text-2xl font-bold` | 24px / bold |
| Título TopBar H2 | `text-base md:text-lg` | 16–18px / semibold |
| Título de tarjeta H3 | `text-base font-bold` | 16px / bold |
| Título StatCard H3 | `text-sm font-semibold` | 14px / semibold |
| Texto descriptivo | `text-sm` | 14px / regular |
| Texto de cuerpo | `text-sm leading-relaxed` | 14px / regular |
| Texto auxiliar/label | `text-xs` | 12px / regular |
| Eyebrow/uppercase | `text-xs tracking-widest uppercase` | 12px / semibold |
| Badge/etiqueta | `text-xs font-semibold` | 12px / semibold |
| Botón | `text-sm font-medium` | 14px / medium |
| Botón pequeño | `text-xs` | 12px / medium |
| Valor StatCard | `text-2xl font-bold` | 24px / bold |

**Propiedades recurrentes:** `letter-spacing` de títulos −0.03em (hero H1) · `tracking-widest` (0.1em) en eyebrows · `leading-tight` en títulos y `leading-relaxed` en párrafos · `truncate` en el título del TopBar.

---

## 2. Sistema de color (tokens)

Variables HSL en `src/index.css` (`--nombre: H S% L%`), mapeadas en `tailwind.config.js`.

### Tokens principales (modo claro)

| Token | HSL | Hex aprox. | Uso |
|---|---|---|---|
| `--background` | `210 20% 98%` | `#F8FAFC` | Fondo app |
| `--foreground` | `220 15% 10%` | `#171A1D` | Texto principal |
| `--card` | `0 0% 100%` | `#FFFFFF` | Tarjetas, TopBar |
| `--card-foreground` | `220 15% 10%` | `#171A1D` | Texto en cards |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Menús, dropdowns |
| `--primary` | `193 71% 43%` | `#2096BA` | Color institucional |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre primary |
| `--secondary` | `150 28% 77%` | `#B5D5C4` | Acento secundario |
| `--muted` | `210 15% 95%` | `#EFF3F6` | Fondos muted |
| `--muted-foreground` | `220 10% 45%` | `#66737F` | Texto secundario |
| `--accent` | `150 28% 77%` | `#B5D5C4` | Hover accents |
| `--destructive` | `0 84% 60%` | `#EF4444` | Errores, eliminar |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre destructive |
| `--border` | `210 15% 90%` | `#DCE3E9` | Bordes sutiles |
| `--input` | `210 15% 90%` | `#DCE3E9` | Bordes de inputs |
| `--ring` | `193 71% 43%` | `#2096BA` | Focus ring |
| `--radius` | `0.75rem` | — | Radio de esquinas |

### Colores de gráficos (Recharts)

`--chart-1: 193 71% 43%` (#2096BA turquesa) · `--chart-2: 150 28% 77%` (verde suave) · `--chart-3: 220 15% 10%` (casi negro) · `--chart-4: 38 96% 67%` (ámbar) · `--chart-5: 0 100% 60%` (rojo)

### Colores del sidebar (modo oscuro fijo)

`--sidebar-background: 220 15% 10%` (#171A1D) · `--sidebar-foreground: 210 20% 92%` (#EBEFF3) · `--sidebar-primary: 193 71% 43%` (#2096BA) · `--sidebar-accent: 220 12% 16%` (#222831) · `--sidebar-border: 220 10% 18%` (#283039)

### Colores por rol (gradient accents del sidebar)

| Rol | Gradiente Tailwind | Hex aprox. |
|---|---|---|
| admin | `from-slate-700 to-slate-900` | #334155→#0F172A |
| estudiante | `from-blue-500 to-blue-700` | #3B82F6→#1D4ED8 |
| profesor | `from-amber-500 to-amber-700` | #F59E0B→#B45309 |
| administrativo | `from-orange-500 to-orange-700` | #F97316→#C2410C |
| psicologia | `from-rose-500 to-rose-700` | #F43F5E→#BE123C |
| contabilidad | `from-violet-500 to-violet-700` | #8B5CF6→#6D28D9 |

### Colores de acento por portal (landing)

| Portal | Gradiente CSS |
|---|---|
| Admin Global | `linear-gradient(135deg, #2096BA, #187a99)` |
| Psicología | `linear-gradient(135deg, #6366f1, #4f46e5)` |
| Contabilidad | `linear-gradient(135deg, #059669, #047857)` |
| Cursos Técnicos | `linear-gradient(135deg, #2096BA, #187a99)` |
| Portal Administrativo | `linear-gradient(135deg, #d97706, #b45309)` |
| Agendar Cita | `linear-gradient(135deg, #6366f1, #4f46e5)` |

---

## 3. Espaciado y radios

**Radios** (mapeados a `--radius: 0.75rem` = 12px):
`rounded-lg` 12px · `rounded-md` 10px · `rounded-sm` 8px · `rounded-xl` 12px · `rounded-2xl` 16px (tarjetas grandes, portales) · `rounded-full` (pills, badges, avatares)

**Espaciado habitual:**
- Padding tarjetas: `p-6` (24px)
- Padding secciones: `py-14` a `py-20`
- Gaps en grids: `gap-4` (16px) a `gap-6` (24px)
- Max-width contenedor: `max-w-6xl` (1152px)
- Max-width texto hero: `max-w-3xl` / `max-w-xl`

---

## 4. Sombras y efectos

- `shadow-sm` → elementos pequeños, botones outline
- `shadow` → tarjetas por defecto (Card)
- `shadow-lg` → botones primarios con color (`shadow-[#2096BA]/30`)
- `shadow-xl` → hover en tarjetas de portales
- Transiciones: `duration-200` (botones) · `duration-300` (tarjetas) · `duration-700` (slider)
- Hover translate: `hover:-translate-y-0.5` (botones) · `hover:-translate-y-1.5` (tarjetas de portal)
- Backdrop blur: `backdrop-blur-md` (navbar) · `backdrop-blur-sm` (botones del hero)
- Animaciones: `animate-pulse` (punto «Sistema activo») · `animate-bounce` (loading dots del chat)

---

## 5. Iconografía

- Librería: **lucide-react** (única permitida)
- Tamaños: `w-3 h-3`/`w-3.5 h-3.5` auxiliar inline · `w-4 h-4` botones, inputs, badges · `w-5 h-5` navegación, stats · `w-6 h-6` iconos grandes de portal
- Color: `text-white` sobre gradientes · `text-primary` (#2096BA) sobre fondos claros · `text-muted-foreground` en secundarios
- Contenedores: `rounded-xl`/`rounded-lg` con `bg-primary/10` e icono `text-primary`

---

## 6. Estilo por sección — Landing page (`Inicio.jsx`)

### 6.1 Navbar sticky
Fondo `bg-white/90 backdrop-blur-md` · borde `border-b border-slate-200/80` · altura `h-16`, contenedor `max-w-6xl` · enlaces `text-sm text-slate-600 hover:text-slate-900` · botón comida `bg-amber-500 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-amber-600` · badge sistema `bg-emerald-50 text-emerald-600 border-emerald-200 text-xs`, punto `bg-emerald-500 animate-pulse`

### 6.2 Hero slider
Altura 72vh, fondo Unsplash `bg-cover bg-center` · overlay `bg-gradient-to-b from-slate-900/60 via-slate-900/70 to-slate-900/90` · tag pill `px-3 py-1 rounded-full text-xs font-semibold` · H1 `font-bold text-white`, `clamp(28px, 5.5vw, 56px)`, `letter-spacing -0.03em`, `max-w-3xl` · descripción `text-slate-300`, `clamp(14px, 2vw, 18px)`, `max-w-xl` · botón primario `bg-[#2096BA] text-white rounded-xl px-6 py-3 text-sm font-semibold shadow-lg shadow-[#2096BA]/30 hover:bg-[#187a99] hover:-translate-y-0.5` · botón secundario `bg-white/10 text-white border border-white/25 backdrop-blur-sm rounded-xl hover:bg-white/20` · controles `w-10 h-10 rounded-full bg-white/10 border-white/20 backdrop-blur-sm text-white` · indicadores activo `w-8 h-2 bg-white`, inactivo `w-2 h-2 bg-white/40`

### 6.3 Stats bar
`bg-white border-b border-slate-200` · grid 2 cols mobile / 4 desktop, `divide-x divide-slate-100` · icono `w-5 h-5 text-[#2096BA]` · valor `text-2xl font-bold text-slate-900` · label `text-xs text-slate-500`

### 6.4 Portales (grid de tarjetas)
Sección `max-w-6xl py-16 md:py-20` · eyebrow `text-xs font-semibold tracking-widest text-[#2096BA] uppercase` · H2 `text-3xl md:text-4xl font-bold text-slate-900` · subtítulo `text-slate-500 max-w-lg text-sm` · tarjetas `bg-white rounded-2xl border border-slate-200/80`, `hover:-translate-y-1.5 hover:shadow-xl` · barra superior `h-1` con gradiente al hover · icono `w-12 h-12 rounded-xl` con gradiente, `shadow-sm`, `group-hover:scale-110` · H3 `font-bold text-base text-slate-900` · descripción `text-sm text-slate-500` · features `text-xs text-slate-500` con `CheckCircle2` · CTA `text-xs font-semibold` con `ArrowRight group-hover:translate-x-1`

### 6.5 Eventos
`bg-white border-y border-slate-200`, `py-14` · eyebrow `text-xs font-semibold tracking-widest text-[#2096BA]` · tarjetas `bg-slate-50 rounded-xl border border-slate-200 p-5`, `hover:border-[#2096BA]/40 hover:bg-[#2096BA]/5` · icono `w-9 h-9 rounded-lg bg-[#2096BA]/10 text-[#2096BA]` · título `font-semibold text-sm text-slate-900` · fecha `text-xs text-slate-500` (date-fns español) · ubicación `text-xs text-slate-400` con `MapPin`

### 6.6 Propuesta de valor
`max-w-6xl py-14`, grid 3 cols · tarjetas `flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/80` · icono `w-10 h-10 rounded-xl bg-[#2096BA]/10 text-[#2096BA]` · título `font-semibold text-sm text-slate-900` · descripción `text-xs text-slate-500`

### 6.7 Footer
`bg-slate-900`, `border-t-4` con `borderTopColor #2096BA` · grid 4 cols, `py-12` · logo `brightness-200` · tagline `text-slate-400 text-xs` · redes `w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white` · H3 `text-white font-semibold text-sm` · enlaces `text-slate-400 text-xs hover:text-white` · barra inferior `border-t border-slate-800 pt-6 text-xs text-slate-500`

---

## 7. Layout interno (`AppLayout`)

**Estructura:** `flex h-screen overflow-hidden bg-background` · Sidebar fijo + contenedor `flex-1 flex-col` (TopBar `h-14 md:h-16` + `main flex-1 overflow-y-auto` con el `Outlet`)

### 7.1 Sidebar
Fondo `bg-sidebar` (#171A1D) · texto `text-sidebar-foreground` (#EBEFF3) · item activo `bg-sidebar-accent text-sidebar-primary` · hover `bg-sidebar-accent/50` · iconos `w-5 h-5`, activo `text-white` · área de logo con gradiente del rol · botón colapsar `bg-sidebar-accent hover:bg-sidebar-accent/70` · mobile: overlay con backdrop y slide-in

### 7.2 TopBar
Fondo `bg-card`, `border-b border-border` · altura `h-14 md:h-16` · título `text-base md:text-lg font-heading font-semibold text-foreground truncate` · buscador `Input pl-9 w-48 lg:w-64 h-9 bg-muted/50` con `Search text-muted-foreground` · badge de rol `bg-primary/10 text-primary text-xs font-medium rounded-full px-3 py-1.5`

---

## 8. Estilo por módulo interno

### 8.1 PageHeader
H1 `text-2xl font-heading font-bold text-foreground` · descripción `text-sm text-muted-foreground mt-1` · botón `bg-primary hover:bg-primary/90` con `Plus w-4 h-4` y `text-sm`

### 8.2 StatCard
Card `rounded-xl border bg-card shadow` · título `text-sm font-medium text-muted-foreground` · valor `text-2xl font-bold` · subtítulo `text-xs text-muted-foreground` · icono `w-4 h-4`

### 8.3 EmptyState
Centrado, icono `w-12 h-12 text-muted-foreground` · título `text-lg font-semibold` · descripción `text-sm text-muted-foreground` · botón `bg-primary text-primary-foreground`

### 8.4 Dashboard
Hero banner con gradiente `bg-primary` y texto blanco · stats grid 4 cols · accesos grid 4 tarjetas `hover:shadow-lg` · gráficos Recharts `chart-1`–`chart-5` · tarjetas de lista `bg-card rounded-xl border shadow p-6`

### 8.5 Expedientes
Búsqueda `BuscadorEstudiantes` (dropdown con `<mark>`) · tabs de filtro activo `bg-primary/10 text-primary` · tarjetas `bg-card rounded-xl border p-4 grid`, `hover:shadow-md`, foto `w-12 h-12` redonda · badges `destructive` suspendido / `secondary` inactivo / `default` activo · Dialog `max-w-2xl` con 6 pestañas, labels `text-sm font-medium`

### 8.6 Materias / Cursos / Calificaciones
Desktop: `Table` con `hover:bg-muted/50` · mobile: tarjetas `bg-card rounded-lg border p-4` · badge `default` activa / `secondary` inactiva · botones editar/eliminar `ghost size icon` con `Pencil`/`Trash2 w-4 h-4`, `hover:text-destructive` · Dialog `p-6`, grid de Inputs

### 8.7 Patrocinadores / Contabilidad
Tabs Todos/Activos/Inactivos · 3 StatCards arriba · tabla con montos `text-right font-semibold` · badge de tipo `outline` con color · Dialog con `Select`

### 8.8 Psicología
Buscador destacado arriba · 4 StatCards (Total, Programadas, Seguimientos, Confidenciales) · tabs por tipo · tarjetas de cita `bg-card border rounded-xl p-5` con badge de confidencialidad (alto=`destructive`, medio=ámbar, bajo=`secondary`) · botones Completar/Cancelar `ghost` con `CheckCircle2`/`X`

### 8.9 Tareas (Kanban)
3 columnas `flex gap-6`, cada una `bg-muted/30 rounded-xl p-4` · encabezado `font-semibold uppercase text-xs tracking-wider` + contador · tarjetas `bg-card border rounded-lg p-4 shadow-sm`, `hover:shadow-md` · badge de prioridad urgente=`destructive`, alta=ámbar, media=azul, baja=`secondary` · avatares `w-6 h-6 rounded-full bg-primary text-white text-xs` · `DropdownMenu` por tarjeta

### 8.10 Calendario
Vista mensual grid 7 cols, celdas `border-b border-r min-h-24`, día `text-sm font-semibold` · día actual `bg-primary/10 text-primary rounded` · indicadores punto `w-1.5 h-1.5 rounded-full` azul (eventos) / naranja (tareas) · panel lateral `bg-card border rounded-xl p-4` · navegación `ghost size icon` con `ChevronLeft`/`Right` · vista agenda en lista

### 8.11 Chat IA (admin y estudiantil)
Header `bg-white border-b p-4`, avatar gradiente `w-9 h-9 rounded-xl`, título `font-bold text-sm` · mensajes `max-w-3xl mx-auto`, burbuja IA `bg-white border rounded-2xl rounded-tl-sm`, usuario `bg-slate-800 text-white rounded-2xl rounded-tr-sm` · markdown con `react-markdown`, `prose prose-sm max-w-none` · prompts rápidos `text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-primary/5` · input `bg-slate-50 border rounded-full px-5 py-2`, botón `w-9 h-9 rounded-full bg-[#2096BA] text-white` · loading 3 puntos `w-2 h-2 bg-slate-400 rounded-full animate-bounce` escalonados

### 8.12 Reportes
3 tabs (Proyectos / Académico / Contabilidad) · KPIs grid 4 cols · Recharts BarChart, PieChart, AreaChart, BarStacked con `chart-1`–`chart-5`

### 8.13 Servicios mensuales
Selector de mes (`Select`) · 3 StatCards · tabla tipo Excel con toggles `CheckCircle2` (`bg-emerald-50 text-emerald-600`) / `XCircle` (`bg-red-50 text-red-600`), `w-8 h-8` · botón imprimir `outline` con `Printer`

### 8.14 Inscripción comida
Header gradiente `bg-amber-500` con `UtensilsCrossed w-8 h-8` · estado badge `bg-emerald-500` / `bg-red-500` · formulario Input grande + botón `bg-amber-500` · confirmación `bg-emerald-50 border-emerald-200 text-emerald-700 rounded-xl p-4` con `CheckCircle2`

### 8.15 Portales por rol
Banner hero con gradiente del rol (de `RoleContext`), texto blanco, `p-8 rounded-2xl`, icono `w-10 h-10` · 3–4 StatCards · accesos rápidos grid 2–4 cols `hover:shadow-lg hover:-translate-y-1` · listas `bg-card rounded-xl border p-4`

---

## 9. Componentes shadcn/ui (estilo base)

Todos usan los tokens de `index.css` (`hsl(var(--token))`) y `cn()` de `@/lib/utils`.

- **Button** — variant (default=primary, destructive, outline, secondary, ghost, link) · size (default h-9, sm h-8, lg h-10, icon w-9) · `rounded-md text-sm font-medium transition-colors`
- **Card** — `rounded-xl border bg-card text-card-foreground shadow` · CardHeader `p-6` · CardTitle `font-semibold` · CardDescription `text-sm text-muted-foreground` · CardContent `p-6 pt-0`
- **Input** — `h-9 rounded-md border-input bg-transparent px-3 text-base md:text-sm focus-visible:ring-1 ring-ring`
- **Textarea** — igual, `min-h-[80px]`
- **Select** — Radix; trigger `h-9 rounded-md border`, content `bg-popover shadow-md rounded-md`, item `focus:bg-accent`
- **Dialog** — Radix; overlay `bg-black/80`, content `bg-card rounded-xl shadow-lg p-6 max-w-lg`
- **Tabs** — Radix; list `bg-muted rounded-lg`, trigger activo `bg-card text-foreground shadow-sm`
- **Table** — `w-full caption-bottom`, header `bg-muted/50`, cell `p-4 align-middle`, row `hover:bg-muted/50`
- **Badge** — `rounded-md px-2.5 py-0.5 text-xs font-semibold` (default, secondary, destructive, outline)
- **DropdownMenu** — Radix; content `bg-popover border rounded-md shadow-md`, item `focus:bg-accent`

---

## 10. Principios de diseño generales

1. **Una sola fuente:** Inter para todo. No mezclar familias.
2. **Color institucional:** #2096BA (turquesa) es el primary — CTAs, acentos, iconos activos, enlaces. Nunca hex directos en componentes internos: usar `bg-primary`, `text-primary`.
3. **Jerarquía por tamaño y peso:** bold títulos, semibold subtítulos y botones, regular cuerpo, medium labels.
4. **Fondos claros:** background #F8FAFC, cards blancas, sidebar oscuro #171A1D.
5. **Bordes sutiles:** `border-border` (#DCE3E9), `border-slate-200/80` en landing. Nunca bordes gruesos.
6. **Radios amplios:** `rounded-xl` (12px) a `rounded-2xl` (16px). Pills y badges `rounded-full`.
7. **Sombras suaves:** `shadow-sm` por defecto, `shadow` en hover de tarjetas, `shadow-lg` solo en botones primarios con color.
8. **Espaciado generoso:** `p-6` tarjetas, `py-14`–`py-20` secciones, `gap-4`–`gap-6` grids.
9. **Estados hover claros:** translate-y negativo en tarjetas, cambio de bg en botones, scale en iconos.
10. **Responsive siempre:** `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3/4`; `text-xs` mobile, `text-sm`+ desktop.
