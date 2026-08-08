/**
 * Cita de Psicología (estudiante) — módulo 22 del catálogo.
 *
 * Es la mitad estudiantil del módulo de Psicología, y existe precisamente
 * porque el joven **no** puede entrar en `/psicologia`: ese módulo exige
 * `psicologia.leer` y el rol `estudiante` solo tiene `academico.leer` e
 * `ia.usar`. Sin esta pantalla, el acceso "Cita de Psicología" de su portal
 * era un enlace a una puerta cerrada.
 *
 * La asimetría es deliberada, no una limitación: el estudiante **pide** una
 * cita y ve las suyas; no ve la agenda de nadie más, ni el nivel de
 * confidencialidad, ni los riesgos anotados, ni las notas. Todo eso vive en el
 * módulo del psicólogo. Tampoco ve su propio expediente: eso es material de
 * psicología y administración, no del joven.
 *
 * Antes esta pantalla llamaba a `listarCitas()`, que exige `psicologia.leer`;
 * el `catch` se tragaba el error y la lista salía vacía siempre. Ahora usa
 * `citasDeEstudiante()`, que solo pide sesión y filtra por el expediente
 * enlazado a ella en el propio SQL.
 */
import { redirect } from "next/navigation";
import { Heart, UserRound } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { currentUser } from "@/lib/auth";
import { aFecha } from "@/lib/fechas";
import { estudianteDelUsuario } from "@/server/portales/queries";
import { citasDeEstudiante, miPsicologo } from "@/server/psicologia/queries";
import type { CitaDelEstudiante, PsicologoAsignado } from "@/server/psicologia/types";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CardLista, ItemLista, EstadoVacio } from "@/components/portal/card-lista";
import { SolicitarCitaForm } from "./solicitar";

export const dynamic = "force-dynamic";

const ESTADO: Record<string, string> = {
  programada: "bg-blue-100 text-blue-700",
  completada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

export default async function CitaPsicologiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await currentUser();
  if (!user) redirect(`/${locale}/login`);

  const estudiante = await estudianteDelUsuario(user.id).catch(() => null);

  if (!estudiante) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <EmptyState
          icon={UserRound}
          title="Sin expediente enlazado"
          description="Tu usuario todavía no está vinculado a un expediente de estudiante. Habla con administración para poder agendar."
        />
      </div>
    );
  }

  // Ambas resuelven el expediente desde la sesión, no desde la URL. Sin BD
  // detrás, la pantalla sigue mostrando el formulario y la lista vacía.
  const [mias, psicologo] = await Promise.all([
    citasDeEstudiante().catch(() => [] as CitaDelEstudiante[]),
    miPsicologo().catch(() => null as PsicologoAsignado | null),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Bienestar"
        title="Cita de psicología"
        description="Pide una cita confidencial. Solo tú y el equipo de psicología ven esta información."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SolicitarCitaForm
          psicologo={psicologo}
          fechasOcupadas={mias
            .filter((c) => c.estado === "programada")
            .map((c) => c.fecha)}
        />

        <CardLista titulo="Mis citas" icono={Heart}>
          {mias.length === 0 ? (
            <EstadoVacio mensaje="Todavía no has pedido ninguna cita." />
          ) : (
            mias.map((c) => (
              <ItemLista
                key={c.id}
                icono={Heart}
                azulejo="bg-rose-100 text-rose-600"
                titulo={format(aFecha(c.fecha), "EEEE d 'de' MMMM", { locale: es })}
                detalle={[c.hora ?? "Hora por confirmar", c.psicologo_nombre]
                  .filter(Boolean)
                  .join(" · ")}
                derecha={
                  <Badge className={`text-[10px] capitalize ${ESTADO[c.estado] ?? ""}`}>
                    {c.estado}
                  </Badge>
                }
              />
            ))
          )}
        </CardLista>
      </div>
    </div>
  );
}
