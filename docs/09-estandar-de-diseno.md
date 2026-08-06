# Estándar de Diseño — Global Effect Nexus

> **Fuente de verdad de la capa visual.** Si una pantalla y este documento no
> coinciden, gana este documento. Si algo que necesitas no está aquí, no lo
> inventes en el componente: añádelo primero a este estándar.
>
> Última actualización: 2026-08-06.

---

## 0. Por qué existe este documento

El proyecto pasó por tres sistemas visuales en poco tiempo: uno turquesa, otro
oscuro con glassmorphism y un tercero cálido en crema que se descartó. Cada
cambio dejó restos —`bg-gold`, `bg-surface`, `shadow-plana`— que seguían
escritos en el código apuntando a tokens ya inexistentes. Esas clases no
producen error: simplemente no generan CSS, y el elemento se pinta transparente
o sin sombra hasta que alguien mira la pantalla con atención.

Este documento fija **el sistema vigente** para que no vuelva a pasar.

---

## 1. Dónde vive el sistema

| Qué | Dónde |
|---|---|
| Tokens de color, radios y tipografía | `src/app/globals.css` (`:root` + `@theme inline`) |
| Fuentes | `src/app/[locale]/layout.tsx` (`next/font`) |
| Primitivas | `src/components/ui/` |
| Piezas de portal | `src/components/portal/` |
| Catálogo de portales | `src/lib/portales.ts` |
| Registro de iconos para componentes cliente | `src/components/ui/icono.tsx` |

**No existe `tailwind.config.js` y no debe crearse.** El proyecto usa Tailwind
v4: la configuración va en CSS con `@theme inline`. Cualquier receta que hable
de `theme.extend.colors` es de la v3 y no aplica aquí.

---

## 2. Color

### 2.1 Institucional

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#2096BA` | Color de marca. Acciones, enlaces, acentos, foco. |
| `--primary-hover` | `#187a99` | Estado hover del primario. |
| `--primary-dark` | `#0a6a8a` | Cierre de degradados de marca. |

### 2.2 Superficies y texto

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#F8FAFC` | Fondo de la aplicación y de las secciones alternas. |
| `--card` | `#FFFFFF` | Tarjetas y superficies elevadas. |
| `--foreground` | `#171A1D` | Texto principal. |
| `--muted-foreground` | `#64748B` | Texto secundario. |
| `--border` / `--input` | `#DCE3E9` | Bordes y contornos de campo. |
| `--sidebar` | `#171A1D` | Barra lateral fija del portal. |

### 2.3 Colores de rol

Identifican cada portal. Se usan **en el banner del portal y en su login**,
nunca sueltos por la interfaz.

| Rol | Degradado |
|---|---|
| Estudiante | `from-[#2096BA] to-[#0a6a8a]` |
| Docente | `from-emerald-500 to-emerald-700` |
| Administrativo | `from-orange-500 to-orange-700` |
| Psicología | `from-rose-500 to-rose-700` |
| Contabilidad | `from-violet-500 to-violet-700` |
| Cursos técnicos | `from-[#d97706] to-[#b45309]` |

Están declarados una sola vez en `src/lib/portales.ts`. **No los copies a un
componente**: impórtalos de ahí.

### 2.4 Colores de estado

`emerald` positivo · `red` negativo · `amber` advertencia · `blue` informativo.
Se escriben con la paleta por defecto de Tailwind, no como tokens.

### 2.5 Reglas de color

1. **Cero azul marino.** Ni `#0a0e27`, ni `slate-900` como fondo de página, ni
   degradados oscuros "tech". La única superficie casi negra es el sidebar
   (`#171A1D`), que es cálido, no azul.
2. **El color de rol no se acumula.** En una fila de seis portales, seis
   colores compiten y ninguno gana: la tira del landing usa **un solo tono**
   (azulejo `slate-100`, glifo turquesa) y el color aparece dentro, en el
   banner de cada portal.
3. **Nunca inventes un token.** Antes de escribir `bg-loquesea`, comprueba que
   existe en `globals.css`. Tokens muertos históricos, prohibidos:
   `bg-gold`, `text-gold`, `bg-surface`, `text-ink`, `shadow-plana`,
   `shadow-flotante`, `shadow-glow`, `brand-teal`, `brand-charcoal`.

---

## 3. Tipografía

**Una sola familia: Inter** (300–900), cargada con `next/font`.
`--font-sans` y `--font-heading` apuntan a la misma.

| Elemento | Clase |
|---|---|
| H1 hero landing | `clamp(28px, 5.5vw, 56px)`, `font-bold`, `letter-spacing: -0.03em` |
| H2 sección landing | `text-3xl md:text-4xl font-bold` |
| H1 interno | `text-2xl font-bold` |
| Título de banner de portal | `text-xl font-bold` |
| `CardTitle` de lista | `text-sm text-muted-foreground` |
| Etiqueta de dato | `text-xs text-muted-foreground` |
| Valor de KPI | `text-2xl font-bold` |

**Nada de monoespaciadas decorativas.** Las micro-etiquetas en mayúsculas con
tracking ancho se usan solo como *eyebrow* de sección, una por bloque.

---

## 4. Forma, sombra y espacio

- **Radios:** tarjetas grandes y banners `rounded-2xl` (16px) · tarjetas shadcn
  `rounded-xl` (12px) · botones y campos `rounded-lg`/`rounded-md` ·
  pastillas `rounded-full`. La escala de Tailwind **no se sobrescribe**: el
  estándar habla en clases literales.
- **Sombras:** `shadow-sm` en reposo. `hover:shadow-md` + `hover:-translate-y-0.5`
  en tarjetas interactivas del portal; `hover:shadow-xl` + `hover:-translate-y-1.5`
  en las del landing. **Ningún glow ni sombra de neón.**
- **Espacio:** contenedores `max-w-6xl` en landing · `p-4 md:p-6` en portal ·
  secciones `py-14 md:py-20` · rejillas `gap-4` / `gap-6`.

---

## 5. Movimiento

150–250 ms, `ease-out`, y solo donde aporte. Todo queda anulado por
`prefers-reduced-motion`, que ya está resuelto en `globals.css` — no hace falta
repetirlo por componente.

Las animaciones de entrada/salida de Radix vienen de `tw-animate-css`
(`data-[state=open]:animate-in`).

---

## 6. Patrones de componente

### 6.1 Banner de rol — `components/portal/banner-rol.tsx`
`rounded-2xl p-5`, texto blanco sobre el degradado del rol. Icono en círculo
`w-10 h-10 bg-white/20`. Tres KPI separados por `w-px bg-white/20`.

### 6.2 Accesos rápidos — `components/portal/accesos-rapidos.tsx`
Tarjeta shadcn con azulejo `w-10 h-10 rounded-xl` en **pastel + icono intenso**
(`bg-emerald-50 text-emerald-600`). Título `text-sm font-semibold`, descripción
`text-xs text-muted-foreground`.

Si la pantalla destino no existe todavía, `disponible: false` — se pinta apagada
y sin enlace. **Nunca enlaces a un 404.**

### 6.3 Tarjeta de lista — `components/portal/card-lista.tsx`
`CardTitle` en `text-sm text-muted-foreground` con icono `w-4` opcional. Ítems:
`flex items-center gap-3 p-3 rounded-lg bg-muted/40`, azulejo a la izquierda,
texto `truncate`, valor o badge a la derecha.

### 6.4 Estado vacío
`p text-sm text-muted-foreground text-center py-6`, o el componente
`EmptyState` cuando ocupa la pantalla.

### 6.5 Piezas con contrato propio

- **`StatCard`** recibe el icono **por nombre** (`icon="Heart"`), no como
  componente: es cliente y React no serializa funciones a través de la
  frontera. Si el icono no está en `components/ui/icono.tsx`, **regístralo ahí**
  en vez de esquivar el patrón.
- **`Badge`** tiene las variantes `neutral · success · info · warning · danger ·
  accent · outline`. **No existe `secondary`.**
- **`Logo`** lleva `self-start` de serie: como hijo de un `flex flex-col`, el
  `align-items: stretch` lo estiraría a lo ancho y lo deformaría.

---

## 7. Reglas técnicas que el estándar impone

1. **Clases literales, nunca concatenadas.** Tailwind analiza el código como
   texto: `` `bg-${color}-50` `` no genera nada. Escribe la clase completa en un
   mapa (`const COLOR = { alto: "text-red-500", … }`).
2. **Imágenes por `next/image`.** Nunca `background-image` para fotos reales:
   se pierde AVIF/WebP y el redimensionado. Declara `sizes` cuando el elemento
   sea mucho menor que el asset.
3. **Iconos solo de `lucide-react`**, tamaños `w-4`/`w-5`/`w-6`.
4. **Fechas con `date-fns`** y locale (`es` / `enUS`), nunca `toLocaleDateString`
   suelto.
5. **Todo texto pasa por i18n**, en `es` y `en`. `npm run i18n:check` debe salir
   simétrico. Si el mensaje lleva un valor dentro (`"{count} cr."`), pásale el
   argumento — no lo concatenes por fuera.
6. **El color no puede ser la única señal.** Un importe negativo lleva signo
   además de rojo; un riesgo lleva icono además de naranja.
7. **Contraste AA.** Texto normal ≥ 4.5:1, elementos no textuales ≥ 3:1. El
   anillo de foco va en `--ring`, no en el color de borde.

---

## 8. Prohibido

- ❌ Azul marino o fondos azul oscuro de página.
- ❌ Glassmorphism, `backdrop-blur` fuera de la navbar fija del landing.
- ❌ Glows, sombras de neón, degradados oscuros "tech".
- ❌ Micro-etiquetas monoespaciadas en mayúsculas como decoración repetida.
- ❌ Tokens de sistemas anteriores (§2.5).
- ❌ Segunda familia tipográfica.

---

## 9. Antes de dar por terminado un cambio visual

```
npm run build        # sin errores de tipos
npx eslint src       # limpio
npm run i18n:check   # es/en simétricos
```

Y **míralo corriendo**. Que compile no significa que se vea bien: los tres
`FORMATTING_ERROR` de next-intl, el logo estirado y los azulejos transparentes
del dashboard pasaron todos el build.

> Nota de método: no ejecutes `npm run build` con `npm run dev` levantado. Los
> dos escriben en `.next` y corrompen los manifiestos del servidor de
> desarrollo, que empieza a devolver 404 en rutas que sí existen.
