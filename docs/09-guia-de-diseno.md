# Guía de Diseño — Global Effect Nexus

> Referencias visuales de marca y tokens de diseño de la interfaz. Alimenta la capa de estilos (Tailwind 4, `src/app/globals.css`). Última actualización: 2026-07-11.

## 1. Referencias de marca

La identidad se apoya en dos fuentes reales:

| Fuente | URL | Rasgos observados |
|---|---|---|
| **Fundación Global Effect** | [globaleffect.org](https://www.globaleffect.org/) | Estética limpia y minimalista; **negro** como base y **acento dorado/ámbar** (sello Candid Gold); fotografía documental real (no stock); tono cálido, orientado a la misión y a la transformación comunitaria. |
| **Urban Group** (marca corporativa, fuente oficial) | [urbangroup.do](https://urbangroup.do/) | Base **blanco / gris carbón** con acento **turquesa**; mucho espacio en blanco; retícula de tarjetas; tipografía geométrica sans-serif (**Montserrat**); aire sobrio, contemporáneo y premium. |

**Síntesis para el producto:** dirección **"Impact Editorial"** — cálida, humana y moderna-institucional. **Papel frío** como base, **teal** (`#2096BA`) de marca, **coral** (`#FF6B5C`) como acento humano (el "riesgo" estético) y **tinta** (`#0F1E2E`) para texto/superficies oscuras. Prioriza legibilidad, contraste (AA) y jerarquía. Diseñada con las skills `frontend-design` (Anthropic), `ui-ux-pro-max`, `emil-design-eng` y `shadcn`.

> **Firma:** un **subrayado de marcador turquesa** que se dibuja bajo la última palabra del titular del hero (`components/brand/marker.tsx`), + el **bento grid** asimétrico de programas y la **cinta marquee** de la promesa. El resto se mantiene en calma (principio de "gastar la audacia en un solo lugar").

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
| `--brand-charcoal` | `#0F1E2E` | **Tinta base** — superficies oscuras (foto del hero, marquee, footer, chip del logo) |
| `--brand-teal` / `--primary` | `#2096BA` | **Primario** — acciones, enlaces, foco, tile destacado, firma del marcador |
| `--brand-teal-dark` | `#12657D` | Hover del primario |
| `--brand-accent` | `#FF6B5C` | **Coral** (acento humano) — separadores del marquee, chip de dato |
| `--brand-gold` | `#F59E0B` | Ámbar — botón de comida |
| `--background` | `#F7F9FB` | Papel frío (fondo) |
| `--foreground` | `#0F1E2E` | Texto principal |
| `--muted` / `--muted-foreground` | `#EEF3F6` / `#4A5B68` | Fondos sutiles y texto secundario |
| `--border` / `--input` | `#DBE4EA` | Bordes y campos |
| `--destructive` | `#BA1A1A` | Errores (semántico, tal cual) |

**Tema oscuro** (`.dark`): papel → tinta `#0A1620`, texto `#EEF3F6`, `--primary` a cian claro `#58C6E6`. Contrastes AA cuidados.

**Logo:** wordmark **blanco** en `public/logo-white.png` (`components/brand/logo.tsx`) e **icono** en `public/icon.png` (`components/brand/icon-mark.tsx`); favicon compuesto (icono blanco sobre tinta) en `src/app/icon.png`. Se usan **solo sobre fondos oscuros**.

### Colores semánticos de datos (del dominio)
De [03 · Módulos](03-modulos-funcionales.md), a respetar en tablas/gráficas:
- **Calificaciones:** verde ≥90 · azul 70–89 · amarillo 60–69 · rojo <60.
- **Finanzas:** verde ingresos · rojo egresos.
- **Confidencialidad (psicología):** indicadores de nivel alto/medio/bajo y de riesgo.

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

> Referencia técnica del stack: [08 · Stack Tecnológico](08-stack-tecnologico.md). Convenciones de código: [07 · Guía de Desarrollo](07-guia-desarrollo.md).
