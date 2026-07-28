# Guía de Diseño — Global Effect Nexus

> **Marca y referencias visuales.** De dónde viene la identidad y cómo se ve.
> Las reglas obligatorias de producto (tokens, componentes, densidad, accesibilidad)
> están en **[10 · Estándar de Interfaz](10-estandar-de-interfaz.md)** — ese documento manda.
> Última actualización: 2026-07-27.

## 1. Referencias de marca

La identidad se apoya en dos fuentes reales:

| Fuente | URL | Rasgos observados |
|---|---|---|
| **Fundación Global Effect** | [globaleffect.org](https://www.globaleffect.org/) | Estética limpia y minimalista; **negro** como base y **acento dorado/ámbar** (sello Candid Gold); fotografía documental real (no stock); tono cálido, orientado a la misión y a la transformación comunitaria. |
| **Urban Group** (marca corporativa, fuente oficial) | [urbangroup.do](https://urbangroup.do/) | Base **blanco / gris carbón** con acento **turquesa**; mucho espacio en blanco; retícula de tarjetas; tipografía geométrica sans-serif (**Montserrat**); aire sobrio, contemporáneo y premium. |

**Síntesis para el producto:** dirección **"Impact Editorial"** — cálida, humana y moderna-institucional. **Papel neutro** como base, **azul institucional** (`#1D5FD4`) como primario, **coral** (`#FF6B5C`) como acento humano de uso puntual (el "riesgo" estético) y **tinta** (`#171717`) para texto. Prioriza legibilidad, contraste (AA) y jerarquía. Diseñada con las skills `frontend-design` (Anthropic), `ui-ux-pro-max`, `emil-design-eng` y `shadcn`.

> **Firmas:** en las páginas públicas, un **subrayado de marcador** que se dibuja bajo la última palabra del titular del hero (`components/brand/marker.tsx`), más el bento grid asimétrico de programas y la cinta marquee de la promesa. En el portal, el **riel de estado** ([10 · §5](10-estandar-de-interfaz.md#5-la-firma-el-riel-de-estado)). El resto se mantiene en calma: principio de gastar la audacia en un solo lugar.

## 2. Tipografía (pareja deliberada)

Tres familias auto-hospedadas con `next/font/google` en `src/app/[locale]/layout.tsx`:

- **Fraunces** (serif óptica) — `font-display`, titulares del hero y de sección (calidez editorial, usada con restricción).
- **Montserrat** (oficial) — `font-sans`, UI y cuerpo.
- **JetBrains Mono** — `font-mono`, eyebrows, cifras (tabulares) y etiquetas (precisión/contraste).

Jerarquía: display `font-semibold tracking-tight`; cuerpo regular; datos/eyebrows en `font-mono uppercase`. **Sin emojis como iconos** — solo `lucide-react` (o SVG inline para iconos de marca).

## 3. Paleta — "Impact Editorial" (definitiva)

Definida en `src/app/globals.css` como variables **hex** (tema claro + `.dark`) y expuesta como utilidades Tailwind (`bg-primary`, `text-brand-teal`, `text-muted-foreground`…).

| Token | Hex (claro) | Rol |
|---|---|---|
| `--brand-charcoal` | `#1A2230` | **Tinta base** — superficies oscuras (foto del hero, marquee, footer, chip del logo) |
| `--brand-teal` / `--primary` | `#1D5FD4` | **Primario** — acciones, enlaces, foco, tile destacado, firma del marcador |
| `--brand-teal-dark` | `#123A86` | Hover del primario |
| `--brand-accent` | `#FF6B5C` | **Coral** (acento humano) — separadores del marquee, chip de dato |
| `--brand-gold` | `#F59E0B` | Ámbar — comida (y solo comida) |
| `--background` | `#F5F5F5` | Papel neutro (fondo) |
| `--foreground` | `#171717` | Texto principal |
| `--muted` / `--muted-foreground` | `#F5F5F5` / `#5F6B76` | Fondos sutiles y texto secundario |
| `--border` / `--input` | `#E5E5E5` | Bordes y campos |
| `--destructive` | `#BA1A1A` | Errores (semántico, tal cual) |

> El nombre `--brand-teal` es histórico: el token pasó de turquesa a azul institucional, pero se conservó el nombre para no romper las utilidades ya en uso. El valor autoritativo es el de `globals.css`.

**Tema oscuro** (`.dark`): papel → `#121316`, texto `#F2F3F5`, `--primary` a azul claro `#5B9BF5`. Contrastes AA cuidados.

**Colores de dominio** (notas, finanzas, confidencialidad, tareas y prioridad): definidos como capa 3 de tokens en [10 · §3.2](10-estandar-de-interfaz.md#32-capa-3--dominio). No los redefinas por módulo.

**Logo:** wordmark **blanco** en `public/logo-white.png` (`components/brand/logo.tsx`) e **icono** en `public/icon.png` (`components/brand/icon-mark.tsx`); favicon compuesto (icono blanco sobre tinta) en `src/app/icon.png`. Se usan **solo sobre fondos oscuros**.

### Colores semánticos de datos (del dominio)
De [03 · Módulos](03-modulos-funcionales.md), implementados como tokens de capa 3:
- **Calificaciones:** verde ≥90 · azul 70–89 · ámbar 60–69 · rojo <60.
- **Finanzas:** verde ingresos · rojo egresos.
- **Confidencialidad (psicología):** nivel alto / medio / bajo.
- **Tareas y prioridad:** ver [10 · §3.2](10-estandar-de-interfaz.md#32-capa-3--dominio).

## 4. Layout y componentes

- **AppLayout:** Sidebar (navegación por rol) + TopBar (usuario · rol · cerrar sesión) + área de contenido. Implementado en `src/components/layout/` y `src/app/[locale]/(portal)/layout.tsx`.
- **Sidebar por rol:** el menú se filtra por permisos (RBAC); `super_admin` ve todo. Config en `src/lib/nav.ts`.
- **Componentes base:** Radix UI + propios con `class-variance-authority` y `cn()` (patrón shadcn). Radio de esquinas vía `--radius`.
- **Responsive:** tarjetas en móvil, tablas en escritorio (patrón repetido en los módulos).
- **Modo oscuro:** soportado por tokens `.dark` (variante `dark:` activada por clase).

## 5. Animación e interacción

- **motion** con `LazyMotion + domAnimation + m` para transiciones ligeras (evita cargar todo el motor).
- **`@formkit/auto-animate`** para listas y cambios de layout (Kanban, buscadores en tiempo real).
- Preferir microinteracciones discretas; respetar `prefers-reduced-motion`.

## 6. Mapas y gráficas

- **Mapas:** Leaflet + react-leaflet sobre **OpenStreetMap** (sin Mapbox/Google). Estilo sobrio acorde a la paleta.
- **Gráficas:** Recharts para dashboards; **SVG propio** para exportación a PDF (servicios mensuales, reportes).

---

> **Reglas obligatorias de producto:** [10 · Estándar de Interfaz](10-estandar-de-interfaz.md).
> Referencia técnica del stack: [08 · Stack Tecnológico](08-stack-tecnologico.md). Convenciones de código: [07 · Guía de Desarrollo](07-guia-desarrollo.md).
