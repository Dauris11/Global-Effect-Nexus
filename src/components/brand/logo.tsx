/**
 * Logo institucional (versión blanca). Pensado para fondos oscuros (hero,
 * sidebar de marca, chips navy). Usa next/image sobre el asset de `public/`.
 */
import Image from "next/image";

export function Logo({
  className = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-white.png"
      alt="Global Effect"
      width={2400}
      height={524}
      priority={priority}
      className={className}
    />
  );
}
