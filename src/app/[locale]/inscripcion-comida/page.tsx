/**
 * Lista de comida por día para el usuario administrativo (imprimible).
 * Exige sesión + `operaciones.leer`. Permite navegar entre días y muestra si
 * la inscripción del día ya cerró (>8:30 AM) para imprimir la lista final.
 * Fuera del grupo (portal) para imprimir limpio (sin sidebar).
 */
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { inscritosPorFecha, type InscritoComida } from "@/server/comida";
import { PrintableList } from "./printable-list";

export const dynamic = "force-dynamic";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const HORA_LIMITE_MIN = 8 * 60 + 30;

export default async function InscripcionComidaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { locale } = await params;
  const { fecha: fechaParam } = await searchParams;
  await getTranslations("comida"); // asegura carga de mensajes en el layout

  const user = await currentUser();
  if (!user) redirect(`/${locale}/login?redirectTo=/inscripcion-comida`);
  if (!(await can(user.rol, "operaciones.leer"))) redirect(`/${locale}/dashboard`);

  const hoy = new Date();
  const valido = fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam);
  const fecha = valido ? fechaParam! : iso(hoy);

  let inscritos: InscritoComida[] = [];
  try {
    inscritos = await inscritosPorFecha(fecha);
  } catch {
    /* BD no disponible */
  }

  // ¿Cerrada la inscripción de esa fecha? (día pasado, o hoy tras las 8:30)
  const hoyISO = iso(hoy);
  const cerrado =
    fecha < hoyISO || (fecha === hoyISO && hoy.getHours() * 60 + hoy.getMinutes() > HORA_LIMITE_MIN);

  const base = new Date(`${fecha}T12:00:00`);
  const prev = new Date(base);
  prev.setDate(prev.getDate() - 1);
  const next = new Date(base);
  next.setDate(next.getDate() + 1);

  const fechaLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(base);

  return (
    <main className="min-h-screen bg-background">
      <PrintableList
        fechaLabel={fechaLabel}
        inscritos={inscritos}
        cerrado={cerrado}
        prevHref={`/${locale}/inscripcion-comida?fecha=${iso(prev)}`}
        nextHref={`/${locale}/inscripcion-comida?fecha=${iso(next)}`}
      />
    </main>
  );
}
