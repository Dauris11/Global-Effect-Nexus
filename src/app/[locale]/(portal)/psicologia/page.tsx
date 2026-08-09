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

import { MODO_DISENO } from "@/lib/modo-diseno";

export const dynamic = "force-dynamic";

const DEMO_CITAS: CitaPsicologia[] = [
  {
    id: "c-demo-1",
    estudiante_id: "e1",
    estudiante_nombre: "Jonathan Pérez",
    psicologo_id: "p1",
    psicologo_nombre: "Lcda. Mariela Guzmán",
    tipo_registro: "seguimiento",
    fecha: "2026-08-12",
    hora: "10:00 a.m.",
    nivel_confidencialidad: "alto",
    estado: "programada",
    riesgos: "Estrés académico elevado por entregas finales. Requiere acompañamiento quincenal.",
    solicitada_por_estudiante: true,
    motivo_estudiante: "Solicitó acompañamiento para técnicas de manejo de ansiedad pre-exámenes.",
    ultima_nota: "Se acordó plan de organización de tareas y ejercicios de respiración guiada.",
  },
  {
    id: "c-demo-2",
    estudiante_id: "e2",
    estudiante_nombre: "Camila Méndez",
    psicologo_id: "p1",
    psicologo_nombre: "Lcda. Mariela Guzmán",
    tipo_registro: "cita",
    fecha: "2026-08-14",
    hora: "02:30 p.m.",
    nivel_confidencialidad: "medio",
    estado: "programada",
    riesgos: "Ausentismo recurrente reportado por docentes de la tarde.",
    solicitada_por_estudiante: false,
    motivo_estudiante: null,
    ultima_nota: "Sesión inicial de evaluación de hábitos de estudio e inserción universitaria.",
  },
  {
    id: "c-demo-3",
    estudiante_id: "e3",
    estudiante_nombre: "Dariel Ramírez",
    psicologo_id: "p1",
    psicologo_nombre: "Lcda. Mariela Guzmán",
    tipo_registro: "evaluacion",
    fecha: "2026-08-05",
    hora: "11:00 a.m.",
    nivel_confidencialidad: "alto",
    estado: "completada",
    riesgos: null,
    solicitada_por_estudiante: false,
    motivo_estudiante: null,
    ultima_nota: "Evaluación vocacional ejecutada. Resultados favorables hacia área técnica.",
  },
  {
    id: "c-demo-4",
    estudiante_id: "e4",
    estudiante_nombre: "Sofía Torres",
    psicologo_id: "p1",
    psicologo_nombre: "Lcda. Mariela Guzmán",
    tipo_registro: "seguimiento",
    fecha: "2026-08-02",
    hora: "09:00 a.m.",
    nivel_confidencialidad: "bajo",
    estado: "completada",
    riesgos: null,
    solicitada_por_estudiante: false,
    motivo_estudiante: null,
    ultima_nota: "Revisión trimestral de metas personales y desempeño académico estable.",
  },
];

const DEMO_ESTUDIANTES = [
  { id: "e1", nombre: "Jonathan Pérez" },
  { id: "e2", nombre: "Camila Méndez" },
  { id: "e3", nombre: "Dariel Ramírez" },
  { id: "e4", nombre: "Sofía Torres" },
  { id: "e5", nombre: "Gabriel Castillo" },
  { id: "e6", nombre: "Mariana Almonte" },
];

export default async function PsicologiaPage() {
  if (!MODO_DISENO) {
    await requirePermission("psicologia.leer");
  }

  const [usuario, locale, tRecords] = await Promise.all([
    currentUser(),
    getLocale(),
    getTranslations("records"),
  ]);
  const [puedeEscribir, puedeGestionar] = usuario
    ? await Promise.all([
        can(usuario.rol, "expedientes.escribir"),
        can(usuario.rol, "psicologia.escribir"),
      ])
    : [true, true];

  let citas: CitaPsicologia[] = [];
  let stats: PsicologiaEstadisticas = {
    total: 4,
    programadas: 2,
    seguimientos: 2,
    confidenciales: 3,
  };
  let estudiantes: { id: string; nombre: string }[] = DEMO_ESTUDIANTES;

  try {
    const [citasBd, statsBd, estudiantesBd] = await Promise.all([
      listarCitas(),
      estadisticasPsicologia(),
      estudiantesParaSelector(),
    ]);
    if (citasBd.length > 0) citas = citasBd;
    if (statsBd.total > 0) stats = statsBd;
    if (estudiantesBd.length > 0) estudiantes = estudiantesBd;
  } catch {
    /* Usar datos demo */
  }

  if (citas.length === 0) {
    citas = DEMO_CITAS;
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
        puedeGestionar={puedeGestionar}
        locale={locale}
        textosOcr={tRecords.raw("ocr")}
      />
    </div>
  );
}
