# Brief de Diseño para Claude Design — Global Effect Nexus

> **Qué es este documento.** El encargo completo de diseño del proyecto, escrito para
> entregárselo a **Claude Design** (`claude.ai/design`) y que produzca el *design system*
> visual: fichas de componente, especímenes de token y maquetas de pantalla.
>
> **Regla que manda sobre todo lo demás:** el sistema ya existe y está normado en
> [`docs/10-estandar-de-interfaz.md`](10-estandar-de-interfaz.md). Este brief **no abre la
> discusión de la identidad**: la transcribe con los valores reales de
> `src/app/globals.css` para que el diseño coincida con el código ya construido. Si algo
> de aquí contradice al doc 10, gana el doc 10.
>
> Fecha: 2026-07-30 · Estado del código: S0–S6(1/5) y S9 implementados.

---

## 1. El encargo en una frase

Diseñar el sistema visual completo de **Global Effect Nexus**, la plataforma de gestión de
la **Fundación Global Effect** (La Vega, República Dominicana): 27 módulos, 6 roles,
2 idiomas (es/en), tema claro y oscuro.

**No es** un dashboard de SaaS. Es **un registro de vidas**: cada fila de cada tabla es un
joven real con nombre, familia y notas que suben o bajan. El diseño tiene que sostener eso
sin volverse sentimental — la fundación rinde cuentas a madres de La Vega y a
patrocinadores en Estados Unidos, en la misma pantalla.

## 2. La identidad: "Impact Editorial"

Tres decisiones, y las tres son restricciones de diseño, no adjetivos:

| Decisión | Qué implica al diseñar |
|---|---|
| **Cálida pero institucional** | Base de papel neutro, azul institucional para la acción, coral con cuentagotas y solo donde el contenido es humano |
| **Editorial, no dashboard** | Serif en titulares y retícula con aire: el resultado debe leerse como un *informe*, no como un panel de tráfico |
| **El estado siempre visible** | De aquí sale la firma del sistema: el **riel de estado** (§6) |

### Lo que este producto NO es — lista de prohibiciones

Esto es lo que hay que **rechazar activamente**, porque son los reflejos por defecto del
diseño de dashboards:

- ❌ Degradados de marca como fondo (y en particular el morado-sobre-blanco de "IA")
- ❌ Tarjetas con sombras profundas — el portal es **plano**
- ❌ Emojis como iconos (solo `lucide-react`, o SVG propio para marca)
- ❌ Ilustraciones genéricas de personas planas
- ❌ El patrón "número gigante + flecha verde + porcentaje" como respuesta a toda métrica
- ❌ Fotografía de banco. La fundación no tiene fotos propias publicables todavía: donde
  el diseño pida una foto, **poner información real del sistema** en su lugar
- ❌ Fuentes genéricas (Inter, Roboto, Arial, system-ui)

---

## 3. Tokens — tres capas, valores literales

Toda la arquitectura de color vive en `src/app/globals.css`. **Ningún componente escribe un
color.** Las tres capas y su regla:

```
Capa 1 · Primitivos   →  el valor crudo              #15803d
Capa 2 · Semánticos   →  el rol en la interfaz       --primary, --border, --surface
Capa 3 · De dominio   →  el significado del negocio  --nota-critica, --flujo-ingreso
```

Si un módulo necesita un color que no está en la capa 3, la respuesta correcta es
**añadirlo a la capa 3**, no pintarlo localmente.

### 3.1 Capa 2 — semánticos

| Token | Claro | Oscuro | Rol |
|---|---|---|---|
| `--background` | `#f5f5f5` | `#121316` | Fondo de página (papel neutro) |
| `--foreground` | `#171717` | `#f2f3f5` | Texto principal |
| `--card` / `--surface` | `#ffffff` | `#1a1b1e` | Tarjetas, filas, paneles |
| `--surface-sunken` | `#ededed` | `#0e0f12` | Fondo de columna Kanban, celdas vacías, *wells* |
| `--surface-raised` | `#ffffff` | `#26282c` | Popovers, diálogos, tarjeta en arrastre |
| `--primary` | `#1d5fd4` | `#5b9bf5` | Acción principal, enlaces, foco |
| `--primary-foreground` | `#ffffff` | `#08183a` | Texto sobre el primario |
| `--secondary` | `#ededed` | `#26282c` | Acción secundaria |
| `--muted` / `--muted-foreground` | `#f5f5f5` / `#5f6b76` | `#26282c` / `#a3aab3` | Fondos sutiles y texto secundario |
| `--accent` / `--accent-foreground` | `#eaf1fd` / `#123a86` | `#1c2b47` / `#cadcfb` | Hover y selección |
| `--border` / `--input` / `--ring` | `#e5e5e5` / `#e5e5e5` / `#1d5fd4` | `#2e3035` / `#2e3035` / `#5b9bf5` | Bordes, campos, anillo de foco |
| `--destructive` | `#ba1a1a` | `#ffb4ab` | Error y acción destructiva |
| `--radius` | `0.9rem` | — | Radio base de esquinas |

### 3.2 Capa 3 — dominio

Cada familia tiene **dos** tokens: el **sólido** (texto, icono, riel) y el **suave** (fondo
del chip). Los nombres siguen los enums de la base de datos, no una invención de la
interfaz.

| Familia | Token | Claro | Oscuro | Significado |
|---|---|---|---|---|
| **Calificaciones** | `--nota-excelente` | `#15803d` | `#4ade80` | ≥ 90 |
| | `--nota-buena` | `#1d5fd4` | `#5b9bf5` | 70–89 |
| | `--nota-riesgo` | `#b45309` | `#fbbf24` | 60–69 |
| | `--nota-critica` | `#ba1a1a` | `#ffb4ab` | < 60 |
| **Finanzas** | `--flujo-ingreso` | `#15803d` | `#4ade80` | Ingreso |
| | `--flujo-egreso` | `#ba1a1a` | `#ffb4ab` | Egreso |
| **Psicología** | `--confid-alto` | `#ba1a1a` | `#ffb4ab` | Confidencialidad/riesgo alto |
| | `--confid-medio` | `#b45309` | `#fbbf24` | Medio |
| | `--confid-bajo` | `#15803d` | `#4ade80` | Bajo |
| **Tareas** | `--tarea-pendiente` | `#5f6b76` | `#a3aab3` | `pendiente` |
| | `--tarea-progreso` | `#1d5fd4` | `#5b9bf5` | `en_progreso` |
| | `--tarea-completada` | `#15803d` | `#4ade80` | `completada` |
| | `--tarea-cancelada` | `#8b949e` | — | `cancelada` |
| **Prioridad** | `--prioridad-baja` | `#5f6b76` | — | Baja |
| | `--prioridad-media` | `#1d5fd4` | — | Media |
| | `--prioridad-alta` | `#b45309` | — | Alta |
| | `--prioridad-urgente` | `#ba1a1a` | — | Urgente |

Fondos suaves en claro: `#e8f5ed` (verde) · `#eaf1fd` (azul) · `#fdf3e3` (ámbar) ·
`#fdecec` (rojo) · `#eeeff1` (gris). En oscuro son **tintes** (`#16351f`, `#14243f`,
`#3a2a0c`, `#43181a`, `#2a2c31`), no colores planos, para que el chip se apoye en su
superficie.

**Dos reglas no negociables sobre color:**

1. **El color nunca va solo.** Un estado se comunica con color **más** texto o icono. Hay
   usuarios con daltonismo y el sistema muestra decisiones sobre becas y notas: un punto
   verde sin etiqueta es un defecto, no un detalle.
2. **Ninguna pantalla traduce un estado a color por su cuenta.** El mapa vive en
   `src/lib/estados.ts`.

### 3.3 Marca

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--brand-charcoal` | `#1a2230` | `#1a1b1e` | Tinta: superficies oscuras (hero, sidebar, footer, chip del logo) |
| `--brand-deep` | `#0f1620` | — | Tinta más profunda |
| `--brand-teal` | `#1d5fd4` | `#5b9bf5` | Primario (el nombre es histórico: pasó de turquesa a azul) |
| `--brand-teal-dark` | `#123a86` | `#1d5fd4` | Hover del primario |
| `--brand-accent` | `#ff6b5c` | `#ff8377` | **Coral** — acento humano, uso puntual |
| `--brand-gold` | `#f59e0b` | `#f59e0b` | Ámbar — **comida y solo comida** |

**Logo:** wordmark blanco (`public/logo-white.png`) e icono (`public/icon.png`). Se usan
**solo sobre fondos oscuros**.

### 3.4 Elevación

El portal es plano. **Solo tres sombras**, y la tercera es exclusiva del arrastre.

| Token | Valor | Uso |
|---|---|---|
| `--sombra-plana` | `0 1px 2px 0 rgb(15 22 32 / .05)` | Tarjeta en reposo — el borde hace el trabajo |
| `--sombra-flotante` | `0 4px 12px -2px rgb(15 22 32 / .1), 0 2px 4px -2px rgb(15 22 32 / .06)` | Popover, dropdown, diálogo |
| `--sombra-arrastre` | `0 12px 28px -6px rgb(15 22 32 / .22)` | Única sombra grande: tarjeta levantada en el Kanban |

**En tema oscuro la profundidad se hace con luminosidad, no con sombra** — una sombra sobre
fondo oscuro no se ve.

---

## 4. Tipografía

Tres familias, cada una con un trabajo. **Ninguna invade el de otra.**

| Familia | Variable | Trabajo |
|---|---|---|
| **Fraunces** (serif óptica) | `font-display` | Titulares. Calidez editorial, con restricción |
| **Montserrat** (oficial de la marca) | `font-sans` | Interfaz y cuerpo — el 90% del texto |
| **JetBrains Mono** | `font-mono` | Cifras, eyebrows y etiquetas. Precisión |

### Escala

| Nombre | Tamaño / interlínea | Clases | Dónde |
|---|---|---|---|
| Display XL | 3.5rem / 1.05 | `font-display text-6xl font-semibold tracking-tight` | Hero de la landing |
| Display L | 2.25rem / 1.1 | `font-display text-4xl font-semibold tracking-tight` | Títulos de sección pública |
| Display M | 1.75rem / 1.15 | `font-display text-2xl font-semibold tracking-tight` | Título de página del portal |
| Título | 1.125rem / 1.4 | `text-lg font-semibold` | Título de tarjeta o panel |
| Cuerpo | 0.9375rem / 1.6 | `text-[15px]` | Texto por defecto del portal |
| Cuerpo S | 0.875rem / 1.55 | `text-sm` | Celdas de tabla, texto secundario |
| Pie | 0.8125rem / 1.4 | `text-[13px] text-muted-foreground` | Metadatos, ayudas |
| Eyebrow | 0.6875rem / 1 | `font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground` | Etiqueta sobre un título |
| Dato | — | `font-mono tabular-nums` | Toda cifra que se compara en columna |

**Regla de las cifras:** cualquier número que el usuario compare verticalmente —montos,
notas, conteos, GPA— va en `font-mono tabular-nums`. Sin eso las columnas bailan.

**Regla del display:** máximo **un** elemento en Fraunces por pantalla del portal (el
título de página). En páginas públicas, dos. El serif pierde su fuerza si se reparte.

---

## 5. Densidad y espacio

Base de 4px. Pasos permitidos: **4 · 8 · 12 · 16 · 24 · 32 · 48 · 64**. Nada intermedio.

| Contexto | Valor |
|---|---|
| Padding de tarjeta | 20px (`p-5`) |
| Separación entre tarjetas | 16px (`gap-4`) |
| Separación entre secciones | 32px (`space-y-8`) |
| Margen lateral de página | 24px móvil / 32px escritorio |
| Alto de fila de tabla | 48px |
| Alto de control (botón, input) | 40px; 32px en variante compacta |

---

## 6. La firma: el riel de estado

**Es el elemento más importante de este brief.** Es lo único decorativo del portal, y no es
decorativo: **codifica información.**

Toda tarjeta o fila que represente un registro con estado lleva una franja vertical de
**3px** (`--riel`) en su **borde izquierdo**, coloreada con el token de dominio que
corresponda a su estado principal.

```
┃ Yeimy Rodríguez              GPA 3.8   ← riel --nota-excelente
┃ Carlos Méndez                GPA 2.1   ← riel --nota-critica
┃ Rediseñar folleto  • Alta    3 nov     ← riel --prioridad-alta
┃ Aporte Hope Foundation    +$250.00     ← riel --flujo-ingreso
```

**Por qué funciona:** el ojo recorre el borde izquierdo de una lista sin leerla, así que el
estado de veinte registros se percibe de un vistazo. Y como es el mismo *device* en todos
los módulos, se aprende una vez.

**Reglas:**

- **Un riel por registro.** Si un registro tiene dos estados, el riel lleva el más urgente
  y el otro va como chip.
- **Solo en el borde izquierdo.** Nunca arriba, nunca en dos lados.
- Los registros **sin estado relevante no llevan riel** — si todo lo tiene, no señala nada.
  *(Ejemplo real: el catálogo de materias no lleva riel, porque casi toda materia está
  activa; la fila inactiva se apaga con opacidad.)*
- El riel se acompaña **siempre** de un chip o texto con el mismo estado.

Fuera del portal, la landing tiene su propia firma: el **subrayado de marcador** que se
dibuja bajo la última palabra del titular.

---

## 7. Movimiento

El movimiento comunica causa y efecto; **no adorna**.

| Curva | Token | Uso |
|---|---|---|
| Salida rápida | `--ease-out` | Entradas y salidas |
| Simétrica | `--ease-in-out` | Desplazamiento en pantalla |
| Rebote sutil | `--ease-spring` | Excepcional: confirmación de una acción |

Duraciones: **150ms** hover y foco · **250ms** paneles y diálogos · **400ms máximo** para
una entrada orquestada. Nada supera 400ms.

- **Nada aparece desde `scale(0)`** — en el mundo real nada surge de la nada. Las entradas
  son `translateY(10px) + fade`.
- *Stagger* de listas: 30–80ms por elemento, y **solo en la carga inicial**.
- `prefers-reduced-motion: reduce` desactiva todo movimiento.

---

## 8. Piso de accesibilidad

No es una fase final. **Una pantalla que falle esto está incompleta.**

- Contraste **AA**: 4.5:1 en texto normal, 3:1 en texto grande y bordes de control.
- Todo lo accionable se alcanza con `Tab` y tiene foco visible
  (`focus-visible:ring-2 ring-ring ring-offset-2`). Sin `outline: none` sin reemplazo.
- Diálogos y paneles: foco atrapado, `Esc` cierra, el foco vuelve al disparador.
- Iconos sin texto llevan `aria-label`; los decorativos, `aria-hidden`.
- Objetivo táctil mínimo **40×40px**.
- Tablas con `<th scope>`; formularios con `<label for>` real.
- **Legible a 360px de ancho.** Tablas y diagramas anchos hacen scroll en su propio
  contenedor; el `body` nunca hace scroll horizontal.

---

## 9. Cinco superficies, un solo sistema

Cambia la densidad y la voz, **nunca la paleta**.

| Superficie | Referencia | Carácter |
|---|---|---|
| **Landing pública** | Stanford · MIT · Stripe | Aire, fotografía documental real, Fraunces en el hero, **una sola** llamada a la acción por sección. Es la cara ante patrocinadores |
| **Portal administrativo** | Linear · Notion · Odoo | Densidad alta, tablas, teclado primero. Cero cromo innecesario |
| **Académico** | Canvas · Blackboard | **Claridad sobre densidad.** Las notas se leen por bandas de color; el progreso siempre visible |
| **Patrocinadores** | Stripe Portal · Notion | Sobriedad y rendición de cuentas: cifras en mono, trazabilidad de cada aporte, **nada de lenguaje emotivo** |
| **Operaciones** | **Asana** | Tablero, tarjetas, arrastre |

> ⚠️ **Aclaración sobre "Patrocinadores":** son **pantallas internas** donde el personal de
> la fundación gestiona patrocinadores y rinde cuentas de cada aporte. Los patrocinadores
> **no son usuarios del sistema**: no tienen portal, ni login, ni acceso a datos de
> estudiantes. **No diseñar un portal del patrocinador.** Un estudiante sin patrocinador
> muestra "Sin patrocinador", no un hueco.

### Páginas públicas de servicio

`/comida` y las inscripciones abiertas se usan **desde el móvil, con prisa y a veces con
mala conexión**. Botones grandes, un objetivo por pantalla, confirmación inequívoca. Ámbar
(`--brand-gold`) es el color de comida, y solo el de comida.

---

## 10. Qué producir — inventario del *design system*

Organizar las fichas en estos grupos (etiqueta del grupo entre paréntesis):

### A. Fundamentos (`Foundations`)

1. **Paleta** — las tres capas, claro y oscuro lado a lado, con el nombre del token bajo
   cada muestra y la relación de contraste sobre su fondo previsto.
2. **Tipografía** — las tres familias y los nueve pasos de la escala, con su clase.
3. **Espaciado** — la escala de 4px, con los seis contextos de la tabla §5.
4. **Elevación** — las tres sombras, en claro y en oscuro (y por qué en oscuro se usa
   luminosidad).
5. **Radio y bordes** — `--radius: 0.9rem` aplicado a tarjeta, input, chip y diálogo.

### B. La firma (`Signature`)

6. **Riel de estado** — el especímen central: las cinco familias de dominio aplicadas a
   una fila y a una tarjeta, con sus casos límite (sin estado → sin riel; dos estados → el
   más urgente).
7. **Chip de estado** — las 17 variantes de dominio, sólido + suave, con punto y sin punto.
8. **Barra de progreso** — con y sin cifra, y los cuatro colores de saturación de cupo.

### C. Controles (`Controls`)

9. **Botón** — 6 variantes (`default`, `destructive`, `outline`, `secondary`, `ghost`,
   `link`) × 4 tamaños (`default`, `sm`, `lg`, `icon`) × estados (reposo, hover, foco
   visible, disabled, con icono).
10. **Campos** — `input`, `textarea`, `select`, `checkbox`, y el envoltorio `field`
    (etiqueta + control + ayuda + error, con el error sustituyendo a la ayuda).
11. **Buscador** — el patrón de campo con icono a la izquierda y filtros en la URL.

### D. Estructura (`Layout`)

12. **PageHeader** — eyebrow + título Fraunces + descripción + zona de acciones.
13. **Card** — reposo, con riel, con cabecera y descripción.
14. **Tabla** — cabecera, fila de 48px, fila con riel, fila apagada (inactiva), celda de
    cifra en mono tabular, y su comportamiento con scroll horizontal a 360px.
15. **Tabs** — subrayado (no píldora), con 6 pestañas y desbordamiento.
16. **Dialog vs SidePanel** — la pareja, con la regla de cuándo cada uno.
17. **AppLayout** — Sidebar por rol + TopBar + área de contenido, en escritorio y móvil.

### E. Estados de pantalla (`States`)

18. **Vacío** — como **invitación a actuar**: título de una línea que nombra lo que falta,
    una frase de contexto y el botón de la acción principal. **Nunca una ilustración sola.**
19. **Carga** — skeleton por tipo de contenido (tarjeta, fila, gráfica).
20. **Error** — dice **qué pasó y qué hacer**: "No se pudo guardar la tarea: falta la fecha
    límite", nunca "Ups, algo salió mal".
21. **Sin permiso** — el caso real: llegar a un módulo sin el permiso es un accidente
    normal, no un ataque. Aviso + camino de vuelta, no un error de servidor.

### F. Datos (`Data`)

22. **Gráficas** — área (ingresos/egresos), línea (evolución de GPA con eje fijo 0–4 y
    línea de referencia), barras y circular. Colores **solo** de la capa 3.
23. **Tarjeta de cifra (StatCard)** — con y sin icono, con `delta`, con pista, y en versión
    enlazada a su módulo.
24. **Avatar y AvatarGroup** — apilados con `+N` al pasar de tres.

### G. Marca (`Brand`)

25. **Logo y favicon** — sobre fondo oscuro, con la zona de respeto.
26. **Subrayado de marcador** — la firma de la landing.

---

## 11. Pantallas a maquetar

Marcadas con su estado real en el código, para saber qué es **rediseño** y qué es
**diseño nuevo**:

| Módulo | Ruta | Estado |
|---|---|---|
| Landing pública | `/` | ✅ Construida — maquetar para revisión |
| Login por invitación | `/login` | ✅ Construida |
| Panel general | `/dashboard` | ✅ Construido (bloques por permiso) |
| Expedientes: lista | `/expedientes` | ✅ Construida |
| Expedientes: alta 6 pestañas | `/expedientes/nuevo` | ✅ Construida |
| Expedientes: detalle + GPA | `/expedientes/[id]` | ✅ Construido |
| Materias | `/academico/materias` | ✅ Construida |
| Cursos técnicos | `/academico/cursos` | ✅ Construida |
| Tareas (Kanban) | `/administrativo/tareas` | ✅ Construido |
| Proyectos · Personal · Portal admin | `/administrativo/*` | ✅ Construidos |
| Calendario (mes + agenda 30 días) | `/calendario` | ✅ Construido |
| Comida pública + lista imprimible | `/comida`, `/inscripcion-comida` | ✅ Construidas |
| **Calificaciones** (banda por nota) | `/academico/calificaciones` | 🆕 **Diseñar** |
| **Historial · Prematrícula · Períodos** | `/academico/*` | 🆕 **Diseñar** |
| **Portal Estudiante · Portal Profesor** | por definir | 🆕 **Diseñar** |
| **Patrocinadores · Becas** | `/patrocinadores`, `/patrocinadores/becas` | 🆕 **Diseñar** |
| **Contabilidad + portal** | `/contabilidad` | 🆕 **Diseñar** |
| **Psicología** (acceso estricto) | `/psicologia` | 🆕 **Diseñar** |
| **Servicios mensuales** (+ PDF) | `/servicios-mensuales` | 🆕 **Diseñar** |
| **Academias · Materiales** | `/academias/*` | 🆕 **Diseñar** |
| **Chat IA interno · estudiantil** | `/chat-ia`, `/chat-ia-estudiantil` | 🆕 **Diseñar** |
| **Reportes** (3 secciones) | `/reportes` | 🆕 **Diseñar** |
| **Configuración · Sitemap** | `/configuracion`, `/sitemap` | 🆕 **Diseñar** |

**Dos pantallas necesitan cuidado especial:**

- **Psicología.** Sus datos son confidenciales y están aislados a nivel de base de datos.
  El diseño debe **comunicar** ese aislamiento (nivel de confidencialidad visible, sin
  filtraciones a otras pantallas) y jamás mostrar notas clínicas en un resumen o un
  dashboard.
- **Servicios mensuales.** Tabla tipo hoja de cálculo con *toggles*, y **exportación a PDF
  imprimible**: hay que diseñar la versión de papel, no solo la de pantalla.

---

## 12. Formato de entrega

- **Un archivo HTML de *preview* por ficha**, autocontenido, con el marcador de tarjeta en
  la primera línea: `<!-- @dsCard group="Controls" -->`.
- Los grupos son los de §10 (`Foundations`, `Signature`, `Controls`, `Layout`, `States`,
  `Data`, `Brand`).
- Cada ficha muestra **todas las variantes juntas** para poder compararlas de un vistazo,
  y **en los dos temas**.
- Los colores se escriben como `var(--token)`, **nunca como hex literal** — que la ficha
  demuestre la arquitectura de tokens, no que la esquive.
- La sincronización va **componente a componente**, nunca como reemplazo masivo.

## 13. Criterio de aceptación

Una ficha está terminada cuando cumple esta lista (es la misma del doc 10 §11):

- [ ] Ningún hex literal en el componente
- [ ] Foco visible en todo lo accionable
- [ ] Estados vacío / carga / error resueltos
- [ ] Cifras comparables en `font-mono tabular-nums`
- [ ] Funciona en tema claro y oscuro
- [ ] Legible a 360px de ancho
- [ ] Sin cadenas de texto literales (todo pasa por es/en)
- [ ] El color no es el único portador de significado
- [ ] Movimiento por debajo de 400ms y respeta `prefers-reduced-motion`

---

> **Fuentes de verdad, en este orden:** [10 · Estándar de Interfaz](10-estandar-de-interfaz.md)
> → [09 · Guía de Diseño](09-guia-de-diseno.md) → `src/app/globals.css` →
> [03 · Módulos Funcionales](03-modulos-funcionales.md) (qué hace cada pantalla) →
> este brief.
