/**
 * Módulo Psicología — gestión de citas, seguimientos y evaluaciones.
 *
 * Es la pantalla de trabajo del psicólogo, distinta del portal de rol
 * (`/portal/psicologia`), que solo resume. Aquí se filtra, se registra y se
 * abre el expediente completo del joven.
 *
 * **El permiso se exige en el servidor.** `psicologia.leer` no está en ningún
 * otro rol salvo `super_admin`: el resto del personal —incluida la dirección—
 * no ve estos datos. Se comprueba aquí y no solo en el menú, porque ocultar un
 * enlace no protege una URL.
 *
 * El listado de estudiantes se carga una vez y se pasa a los dos hijos: lo
 * necesitan el buscador de expedientes y el formulario de alta, y pedirlo dos
 * veces sería una consulta de más por cada visita.
 */
import { getLocale, getTranslations } from "next-intl/server";
import { requirePermission, can } from "@/lib/rbac";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { listarCitas, estadisticasPsicologia } from "@/server/psicologia/queries";
import { estudiantesParaSelector } from "@/server/estudiantes/queries";
import type { CitaPsicologia, PsicologiaEstadisticas } from "@/server/psicologia/types";
import { PanelPsicologia } from "./panel";
import { NuevoRegistro } from "./nuevo-registro";

export const dynamic = "force-dynamic";

export default async function PsicologiaPage() {
  await requirePermission("psicologia.leer");

  /* El panel de documentos vive dentro del expediente y su OCR escribe: el
     psicólogo tiene `expedientes.leer` pero no `escribir`, así que para él
     el panel es de solo lectura. Los textos se resuelven aquí porque el
     componente los recibe ya traducidos (es cliente). */
  const [usuario, locale, tRecords] = await Promise.all([
    currentUser(),
    getLocale(),
    getTranslations("records"),
  ]);
  const puedeEscribir = usuario ? await can(usuario.rol, "expedientes.escribir") : false;

  let citas: CitaPsicologia[] = [];
  let stats: PsicologiaEstadisticas = {
    total: 0,
    programadas: 0,
    seguimientos: 0,
    confidenciales: 0,
  };
  let estudiantes: { id: string; nombre: string }[] = [];
  try {
    [citas, stats, estudiantes] = await Promise.all([
      listarCitas(),
      estadisticasPsicologia(),
      estudiantesParaSelector(),
    ]);
  } catch {
    /* Sin BD la pantalla se pinta con estados vacíos en vez de reventar. */
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Bienestar estudiantil"
        title="Psicología"
        description="Citas, seguimientos y evaluaciones. Todo el contenido de este módulo es confidencial."
        actions={<NuevoRegistro estudiantes={estudiantes} />}
      />

      <PanelPsicologia
        citas={citas}
        stats={stats}
        estudiantes={estudiantes}
        puedeEscribir={puedeEscribir}
        locale={locale}
        textosOcr={tRecords.raw("ocr")}
      />
    </div>
  );
}
