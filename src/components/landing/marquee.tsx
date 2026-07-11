/**
 * Cinta marquee (firma): la promesa institucional desplazándose sobre la
 * tinta de marca, en serif (Fraunces) con separadores coral. Movimiento
 * continuo (CSS), pausado bajo prefers-reduced-motion. Decorativo (aria-hidden).
 */
const FRASES = ["Bringing Hope", "Changing Lives", "Transforming Communities"];

function Fila() {
  const repetido = [...FRASES, ...FRASES, ...FRASES];
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {repetido.map((f, i) => (
        <span key={i} className="flex items-center gap-10">
          <span className="font-display text-2xl italic text-white/90 md:text-3xl">{f}</span>
          <span className="inline-block size-2 rounded-full bg-brand-accent" />
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div aria-hidden className="overflow-hidden border-y border-white/10 bg-brand-charcoal py-6">
      <div className="flex w-max animate-marquee">
        <Fila />
        <Fila />
      </div>
    </div>
  );
}
