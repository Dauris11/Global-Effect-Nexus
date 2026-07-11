/**
 * Icono institucional (versión blanca, sin fondo). Para espacios compactos
 * sobre fondos oscuros (chip de la TopBar en móvil, marcadores). El favicon
 * se genera aparte en `src/app/icon.png`.
 */
import Image from "next/image";

export function IconMark({
  className = "h-6 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/icon.png"
      alt="Global Effect"
      width={1183}
      height={960}
      priority={priority}
      className={className}
    />
  );
}
