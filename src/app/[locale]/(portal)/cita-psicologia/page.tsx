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

import { CitaPsicologiaClient } from "./cita-psicologia-client";

export const dynamic = "force-dynamic";

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

  const [mias, psicologo] = await Promise.all([
    citasDeEstudiante().catch(() => [] as CitaDelEstudiante[]),
    miPsicologo().catch(() => null as PsicologoAsignado | null),
  ]);

  return <CitaPsicologiaClient locale={locale} mias={mias} psicologo={psicologo} />;
}
