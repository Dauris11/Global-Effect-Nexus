# Estándar de Interfaz — Global Effect Nexus

> **Documento normativo.** Define cómo se ve y cómo se comporta *toda* la plataforma.
> Lo que aquí dice "debe" es obligatorio; una pantalla que no lo cumpla no está terminada.
> La marca y sus referencias externas viven en [09 · Guía de Diseño](09-guia-de-diseno.md);
> este documento es la implementación de esa marca en producto.
> Cubre ClickUp **S0 · #39–42** (Tailwind + tokens + layout base).
> Última actualización: 2026-07-28.

---

## 1. Por qué existe este documento

La plataforma tiene 27 módulos, seis roles y dos idiomas, y la construyen dos personas
a lo largo de catorce sprints. Sin un estándar escrito, cada módulo termina inventando su
propio verde para "aprobado" y su propia forma de mostrar una fecha vencida. El resultado no
es feo: es **ilegible**, porque el usuario tiene que reaprender el código de colores en cada
pantalla.

El estándar existe para que **el mismo significado se vea siempre igual**. Una nota de 58, una
transacción de egreso y una tarea urgente comparten el mismo rojo porque las tres dicen
"esto requiere atención ahora". Esa consistencia es la identidad del producto, más que
cualquier logo.

## 2. La identidad: "Impact Editorial"

Global Effect no es una empresa de software: es una fundación de La Vega que sostiene la
educación de jóvenes reales. El sistema es, literalmente, **un registro de vidas**. Cada fila
de una tabla es una persona con nombre, con familia, con notas que suben o bajan.

De ahí salen las tres decisiones que definen el producto:

**Cálida pero institucional.** Sus interlocutores son a la vez una madre de La Vega y un
patrocinador en Estados Unidos que exige rendición de cuentas. La interfaz no puede ser ni
un panel corporativo frío ni una web de ONG sentimental. Base de papel neutro, azul
institucional para la acción, coral usado con cuentagotas donde el contenido es humano.

**Editorial, no dashboard.** El serif (Fraunces) en los titulares y la retícula con aire dicen
"documento", no "panel de métricas". Los datos son de personas; merecen la compostura de un
informe, no la agitación de un tablero de tráfico.

**El estado siempre visible.** Quien usa esto necesita ver, sin leer, qué está bien y qué no.
De ahí la firma del sistema: el **riel de estado** (§5).

### Lo que este producto no es

No usamos: degradados de marca como fondo, tarjetas con sombras profundas, iconos emoji,
ilustraciones genéricas de personas planas, ni el patrón "número gigante + flecha verde +
porcentaje" como respuesta por defecto a toda métrica. Son los reflejos automáticos del
diseño de dashboards y no dicen nada sobre esta fundación.

---

## 3. Arquitectura de tokens (tres capas)

Todo el color vive en `src/app/globals.css`. **Un componente nunca escribe un hex.**

```
Capa 1 · Primitivos     →  el valor crudo            #15803d
Capa 2 · Semánticos     →  el rol en la interfaz     --primary, --border, --surface
Capa 3 · De dominio     →  el significado del negocio --nota-critica, --flujo-ingreso
```

La capa 3 es la que hace que el sistema sea uno solo. Si un módulo necesita un color que no
está en ella, la respuesta correcta es **añadirlo a la capa 3**, no pintarlo localmente.

### 3.1 Capa 2 — semánticos

| Token | Rol |
|---|---|
| `--background` / `--foreground` | Fondo de página y texto principal |
| `--surface` | Tarjetas, filas, paneles |
| `--surface-sunken` | Fondo de columna Kanban, celdas vacías, *wells* |
| `--surface-raised` | Popovers, diálogos, tarjeta en arrastre |
| `--primary` / `--primary-foreground` | Acción principal, enlaces, foco |
| `--muted` / `--muted-foreground` | Fondos sutiles y texto secundario |
| `--accent` / `--accent-foreground` | Hover y selección |
| `--border` / `--input` / `--ring` | Bordes, campos, anillo de foco |
| `--destructive` | Error y acción destructiva |

### 3.2 Capa 3 — dominio

Cada familia tiene dos tokens: el **sólido** (texto, icono, riel) y el **suave** (fondo del chip).

| Familia | Tokens | Significado |
|---|---|---|
| Calificaciones | `--nota-excelente` ≥90 · `--nota-buena` 70–89 · `--nota-riesgo` 60–69 · `--nota-critica` <60 | Bandas de [03 · Módulos](03-modulos-funcionales.md) |
| Finanzas | `--flujo-ingreso` · `--flujo-egreso` | Signo del movimiento |
| Psicología | `--confid-alto` · `--confid-medio` · `--confid-bajo` | Nivel de confidencialidad o riesgo |
| Tareas | `--tarea-pendiente` · `--tarea-progreso` · `--tarea-completada` · `--tarea-cancelada` | Estado de la tarea (enum `tarea.estado`) |
| Prioridad | `--prioridad-baja` · `--prioridad-media` · `--prioridad-alta` · `--prioridad-urgente` | Urgencia de la tarea |

Los nombres siguen los enums de la base de datos, no una invención de la interfaz: si el
esquema dice `en_progreso`, el token se llama igual.

Se usan como utilidades de Tailwind: `text-nota-critica`, `bg-flujo-ingreso-suave`,
`border-l-tarea-progreso`.

**Ninguna pantalla traduce un estado a color por su cuenta.** El mapa vive en
[`src/lib/estados.ts`](../src/lib/estados.ts) y expone `paletaDe(estado)` más traductores
desde los valores de la base de datos: `bandaDeNota(87)`, `bandaDeTarea("en_progreso")`,
`bandaDePrioridad("urgente")`, `bandaDeFlujo("ingreso")`, `bandaDeConfidencialidad("alto")`.
Si falta un estado, se añade allí y a `globals.css` — nunca en el componente.

**El color nunca va solo.** Un estado se comunica siempre con color **más** texto o icono: hay
usuarios con daltonismo y el sistema muestra decisiones sobre becas y notas. Un punto verde
sin etiqueta es un defecto, no un detalle.

### 3.3 Elevación

El portal es plano. Solo tres sombras, y la tercera es exclusiva del arrastre.

| Token | Uso |
|---|---|
| `--sombra-plana` | Tarjeta en reposo. Casi imperceptible; el borde hace el trabajo |
| `--sombra-flotante` | Popover, dropdown, diálogo |
| `--sombra-arrastre` | Única sombra grande del sistema: tarjeta levantada en el Kanban |

En tema oscuro la profundidad se hace con **luminosidad**, no con sombra: `--surface-raised`
es más claro que `--surface`. Una sombra sobre fondo oscuro no se ve.

---

## 4. Tipografía

Tres familias, cada una con un trabajo. Ninguna invade el de otra.

| Familia | Variable | Trabajo |
|---|---|---|
| **Fraunces** | `font-display` | Titulares. Calidez editorial, usada con restricción |
| **Montserrat** | `font-sans` | Interfaz y cuerpo. El 90% del texto |
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

**Regla de las cifras:** cualquier número que el usuario vaya a comparar verticalmente —montos,
notas, conteos— va en `font-mono tabular-nums`. Sin eso las columnas bailan.

**Regla del display:** máximo **un** elemento en Fraunces por pantalla del portal (el título de
página). En las páginas públicas puede haber dos. El serif pierde su fuerza si se reparte.

---

## 5. La firma: el riel de estado

Es el único elemento decorativo del portal, y no es decorativo: **codifica información**.

Toda tarjeta o fila que represente un registro con estado lleva una franja vertical de
`var(--riel)` (3px) en su borde izquierdo, coloreada con el token de dominio que corresponda a
su estado principal.

```
┃ Yeimy Rodríguez              GPA 3.8   ← riel --nota-excelente
┃ Carlos Méndez                GPA 2.1   ← riel --nota-critica
┃ Rediseñar folleto  • Alta    3 nov     ← riel --prioridad-alta
┃ Aporte Hope Foundation    +$250.00     ← riel --flujo-ingreso
```

Por qué funciona: el ojo recorre el borde izquierdo de una lista sin leerla, así que el estado
de veinte registros se percibe de un vistazo. Y como es **el mismo device en todos los
módulos**, se aprende una vez.

Reglas:

- **Un riel por registro.** Si un registro tiene dos estados, el riel lleva el más urgente y el
  otro va como chip.
- **Solo en el borde izquierdo.** Nunca arriba, nunca en dos lados.
- Los registros sin estado relevante **no llevan riel** — si todo lo tiene, no señala nada.
- El riel se acompaña siempre de un chip o texto con el mismo estado (§3.2, regla del color).

Implementación: `<Rail estado="critica" />` o la clase utilitaria `border-l-[3px] border-l-<token>`.

Fuera del portal, la landing conserva su propia firma: el **subrayado de marcador** que se
dibuja bajo la última palabra del titular (`components/brand/marker.tsx`).

---

## 6. Componentes

Base: Radix UI + `class-variance-authority` + `cn()` (patrón shadcn), en `src/components/ui/`.

### Contratos obligatorios

Todo componente interactivo debe:

1. Reenviar `className` y combinarlo con `cn()` — nunca concatenar cadenas.
2. Tener **foco visible** por teclado: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
3. Tener estado `disabled` con `opacity-50 pointer-events-none`.
4. Aceptar `asChild` cuando tenga sentido envolver otro elemento (patrón Radix `Slot`).
5. Declarar sus variantes con `cva`, no con condicionales sueltos.

### Inventario

Todos en `src/components/ui/`.

| Componente | Para qué |
|---|---|
| `button` · `card` · `badge` · `table` · `separator` · `skeleton` | Base |
| `page-header` · `stat-card` · `empty-state` · `dropdown-menu` | Patrones compuestos |
| `input` · `textarea` · `label` · `select` · `checkbox` | Controles de formulario |
| `field` | Envoltorio de campo: etiqueta + control + ayuda + error, con el ARIA ya cableado |
| `dialog` | Modal. Para confirmar o crear algo puntual |
| `side-panel` | Panel lateral de detalle. Para recorrer registros en serie (patrón Asana, §10) |
| `tabs` · `tooltip` · `avatar` (+ `AvatarGroup`) | Composición |
| `rail` · `chip-estado` · `barra-progreso` | Del estándar: la firma y sus acompañantes |

**Cuándo `dialog` y cuándo `side-panel`:** si el usuario va a abrir un registro, mirarlo y
pasar al siguiente —tareas, expedientes, citas— es `side-panel`, porque deja la lista visible
detrás. Si es una decisión puntual que interrumpe —confirmar un borrado, crear algo— es
`dialog`.

### Densidad y espacio

Base de 4px. Pasos permitidos: **4 · 8 · 12 · 16 · 24 · 32 · 48 · 64**. Nada intermedio.

| Contexto | Valor |
|---|---|
| Padding de tarjeta | 20px (`p-5`) |
| Separación entre tarjetas | 16px (`gap-4`) |
| Separación entre secciones | 32px (`space-y-8`) |
| Margen lateral de página | 24px móvil / 32px escritorio |
| Alto de fila de tabla | 48px |
| Alto de control (botón, input) | 40px; 32px en la variante compacta |

### Estados vacíos y errores

Un estado vacío es **una invitación a actuar**, no un aviso de que no hay nada: título de una
línea que nombra lo que falta, una frase de contexto y el botón de la acción principal.
Nunca una ilustración sola.

Un error dice **qué pasó y qué hacer**, en la voz del sistema. Ni disculpas, ni vaguedades:
"No se pudo guardar la tarea: falta la fecha límite", no "Ups, algo salió mal".

### Escritura de interfaz

- Nombra las cosas como las nombra el usuario, no como las nombra la base de datos:
  "Expediente", no "registro de estudiante".
- Voz activa y el verbo exacto de lo que va a pasar: **"Guardar cambios"**, no "Enviar".
- Una acción conserva su nombre en todo el flujo: si el botón dice "Publicar", el aviso dice
  "Publicado".
- Mayúscula inicial de frase, no de título. Sin punto final en botones ni etiquetas.
- Todo texto visible pasa por `next-intl` (es · en). Cero cadenas literales en JSX.

---

## 7. Movimiento

El movimiento comunica causa y efecto; no adorna.

| Curva | Token | Uso |
|---|---|---|
| Salida rápida | `--ease-out` | Entradas y salidas de elementos |
| Simétrica | `--ease-in-out` | Desplazamiento en pantalla |
| Rebote sutil | `--ease-spring` | Excepcional: confirmación de una acción del usuario |

Duraciones: **150ms** para hover y foco, **250ms** para paneles y diálogos, **400ms** máximo
para una entrada orquestada. Nada supera 400ms.

Reglas:

- Nada aparece desde `scale(0)`: en el mundo real nada surge de la nada. Las entradas son
  `translateY(10px) + fade` (`.animate-fade-up`).
- El *stagger* de listas es de 30–80ms por elemento y solo en la carga inicial.
- `@formkit/auto-animate` para reordenamientos (Kanban, buscadores en vivo).
- `motion` con `LazyMotion + domAnimation + m` — nunca el motor completo.
- `prefers-reduced-motion: reduce` desactiva todo movimiento. Ya está resuelto globalmente en
  `globals.css`; no lo reimplementes por componente.

---

## 8. Piso de accesibilidad

No es una fase final. Una pantalla que falle esto está incompleta.

- Contraste **AA**: 4.5:1 en texto normal, 3:1 en texto grande y en bordes de control.
- Todo lo accionable se alcanza con `Tab` y tiene foco visible. Sin `outline: none` sin
  reemplazo.
- Diálogos y paneles: foco atrapado dentro, `Esc` cierra, el foco vuelve al disparador.
  Radix lo da gratis — úsalo en vez de escribirlo.
- Iconos sin texto llevan `aria-label`. Los decorativos, `aria-hidden`.
- Objetivo táctil mínimo 40×40px.
- Tablas con `<th scope>`; formularios con `<label for>` real, no un `div` que parece etiqueta.
- El idioma del documento se declara en `<html lang>` según el locale activo.

---

## 9. Dirección por superficie

Un solo sistema de tokens, cinco temperaturas. Cambia la densidad y la voz, nunca la paleta.

| Superficie | Referencia | Carácter |
|---|---|---|
| **Landing pública** | Stanford · MIT · Stripe | Aire, fotografía documental real, Fraunces en el hero, una sola llamada a la acción por sección. Es la cara ante patrocinadores. |
| **Portal administrativo** | Linear · Notion · Odoo | Densidad alta, tablas, teclado primero. Cero cromo innecesario. El riel hace el trabajo visual. |
| **Académico** | Canvas · Blackboard | Claridad sobre densidad. Las notas se leen con las bandas de color, el progreso siempre visible. |
| **Patrocinadores** | Stripe Portal · Notion | Sobriedad y rendición de cuentas: cifras en mono, trazabilidad de cada aporte, nada de lenguaje emotivo. |
| **Operaciones** | **Asana** | Tablero, tarjetas, arrastre. Detalle en §10. |

### Páginas públicas de servicio

`/comida` y las inscripciones abiertas se usan desde el móvil, con prisa y a veces con mala
conexión. Botones grandes, un objetivo por pantalla, confirmación inequívoca. Ámbar
(`--brand-gold`) es el color de comida, y solo el de comida.

---

## 10. Operaciones: qué tomamos de Asana

El módulo de proyectos y tareas sigue los patrones de **Asana** porque son el estándar que la
gente ya conoce: copiarlos elimina la curva de aprendizaje. Tomamos **la mecánica**, no la piel:
la paleta, la tipografía y el riel siguen siendo los nuestros.

### Adoptamos

- **Columnas = estado.** Tres: Pendiente · En progreso · Completada, con el conteo en la
  cabecera de cada una (ClickUp S9 · #440). El cuarto estado del enum, `cancelada`, no tiene
  columna: sería una papelera a la vista. Las canceladas se ven filtrando, en gris apagado.
- **Tarjeta de tarea compacta:** título, avatares de asignados apilados, chip de prioridad,
  fecha límite. Nada más en la tarjeta.
- **La fecha vencida se pinta en rojo** (`--destructive`) y la de hoy en ámbar. Es la señal más
  útil del tablero.
- **Panel de detalle lateral,** no modal: entra desde la derecha, deja el tablero visible
  detrás. Cambiar de tarea no obliga a cerrar y reabrir.
- **Añadir tarea en línea,** al pie de cada columna, sin salir del tablero.
- **Arrastrar y soltar** entre columnas, con hueco de destino visible y `--sombra-arrastre` en
  la tarjeta levantada.
- **Barra de progreso del proyecto** derivada de las tareas cerradas, no escrita a mano.
- **Asignación múltiple** con avatares apilados y `+N` al pasar de tres.

### No adoptamos

- Su paleta (morado/coral de marca) ni su iconografía.
- Su densidad de funciones: nada de dependencias, subtareas anidadas, portafolios ni reglas.
  Este módulo sirve a una fundación de veinte personas.
- El *onboarding* con celebración animada.

### Dónde vive

Backend en `src/server/operaciones/` (queries, actions, schema, types) y, para el equipo,
`src/server/usuarios/`. UI en `src/app/[locale]/(portal)/administrativo/` —portal, tareas,
proyectos y personal— y en `src/app/[locale]/(portal)/calendario/`. Permisos
`operaciones.leer` y `operaciones.escribir`; la pantalla de personal exige además
`usuarios.administrar`.

### El calendario

No es una tercera vista del tablero: es la misma información contestando otra pregunta.

- **Dos vistas a la vez, no en pestañas.** La rejilla del mes responde "cómo viene el mes"
  y la agenda de 30 días "qué me viene encima". Esconder una detrás de una pestaña obliga a
  elegir antes de saber qué se busca.
- **Eventos y tareas mezclados.** El usuario no piensa en tablas, piensa en días. Las dos
  fuentes se normalizan a una sola forma (`EntradaAgenda`) y solo se distinguen por icono.
- **Una tarea con fecha límite genera un evento espejo,** y la consulta del calendario
  descarta esos espejos: gana la tarea, que sí conserva su estado y su prioridad.
- **El color codifica urgencia,** no categoría: una tarea lleva el color de su prioridad —el
  mismo de su riel en el tablero, para reconocerla entre pantallas— y un evento el de su
  estado. El tipo de evento va en texto, en el chip.
- **El mes vive en la URL** (`?mes=YYYY-MM`), no en estado de cliente: es compartible y
  funciona sin JavaScript.

---

## 11. Cómo aplicar el estándar

Al construir una pantalla:

1. Identifica la superficie (§9) y su carácter.
2. Usa `PageHeader` para el título; un solo Fraunces por pantalla.
3. Si la pantalla lista registros con estado, ponles riel (§5).
4. Cualquier color de significado sale de la capa 3 (§3.2). Si no existe, añádelo allí.
5. Espacios de la escala de §6. Cifras en mono tabular.
6. Estado vacío, estado de carga (`skeleton`) y estado de error: los tres, siempre.
7. Textos por `next-intl`, en los dos idiomas.
8. Recorre la pantalla solo con teclado antes de darla por hecha.

### Lista de revisión

- [ ] Ningún hex literal en el componente
- [ ] Foco visible en todo lo accionable
- [ ] Estados vacío / carga / error resueltos
- [ ] Cifras comparables en `font-mono tabular-nums`
- [ ] Funciona en tema claro y oscuro
- [ ] Legible a 360px de ancho
- [ ] Sin cadenas de texto literales
- [ ] El color no es el único portador de significado
- [ ] Movimiento por debajo de 400ms y respeta `prefers-reduced-motion`

---

> [09 · Guía de Diseño](09-guia-de-diseno.md) — marca y referencias.
> [07 · Guía de Desarrollo](07-guia-desarrollo.md) — convenciones de código.
> [08 · Stack Tecnológico](08-stack-tecnologico.md) — librerías.
