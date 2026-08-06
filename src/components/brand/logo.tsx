/**
 * Logo institucional.
 *
 * En `public/` solo existe la versión blanca (`logo-white.png`), pensada para
 * fondos oscuros. Para los fondos claros (navbar) se invierte por CSS: al ser
 * un logotipo monocromo sobre transparencia, `invert` lo entrega en negro.
 *
 * Es un apaño hasta que exista el asset oscuro real —idealmente un SVG—:
 * el PNG blanco está comprimido y sobre fondos oscuros se le notan los
 * artefactos.
 */
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className = "h-8 w-auto",
  /** `claro` sobre fondo oscuro; `oscuro` sobre fondo claro. */
  tono = "claro",
  priority = false,
}: {
  className?: string;
  tono?: "claro" | "oscuro";
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-white.png"
      alt="Global Effect"
      width={2400}
      height={524}
      /* El asset mide 2400px de ancho pero nunca se pinta a más de ~250.
         Sin `sizes`, next/image asume el viewport completo y sirve la
         variante de 3840px: 97 KB en vez de 5 KB. */
      sizes="250px"
      priority={priority}
      className={cn(className, tono === "oscuro" && "invert")}
    />
  );
}
