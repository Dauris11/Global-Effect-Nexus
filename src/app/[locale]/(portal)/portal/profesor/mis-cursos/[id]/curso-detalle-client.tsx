"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./curso-detalle.module.css";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  Users,
} from "lucide-react";

interface CourseMeta {
  id: string;
  codigo: string;
  seccion: string;
  nombre: string;
  horario: string;
  estudiantesCount: number;
  promedio: number;
  asistencia: string;
}

const LISTA_TODOS_CURSOS: CourseMeta[] = [
  {
    id: "c1",
    codigo: "ISC-215",
    seccion: "Sección 02",
    nombre: "Estructura de Datos",
    horario: "Lun / Mié 4:00–5:30 p.m. · Aula 204",
    estudiantesCount: 34,
    promedio: 79,
    asistencia: "88%",
  },
  {
    id: "c2",
    codigo: "ISC-233",
    seccion: "Sección 01",
    nombre: "Bases de Datos II",
    horario: "Mar / Jue 2:00–3:30 p.m. · Aula 118",
    estudiantesCount: 28,
    promedio: 85,
    asistencia: "93%",
  },
  {
    id: "c3",
    codigo: "ISC-215",
    seccion: "Sección 04",
    nombre: "Estructura de Datos",
    horario: "Vie 8:00–11:00 a.m. · Aula 204",
    estudiantesCount: 24,
    promedio: 81,
    asistencia: "90%",
  },
  {
    id: "c4",
    codigo: "ISC-310",
    seccion: "Sección 01",
    nombre: "Filosofía de Sistemas",
    horario: "Cuatrimestre pasado · Cerrado",
    estudiantesCount: 30,
    promedio: 84,
    asistencia: "91%",
  },
];

export function CursoDetalleClient({
  courseId,
  locale,
}: {
  courseId: string;
  locale: string;
}) {
  const [activeTab, setActiveTab] = useState<"contenido" | "asistencia" | "estudiantes">("contenido");
  const [contentType, setContentType] = useState<"tarea" | "examen" | "material" | "aviso">("tarea");
  
  // Current Course Selection
  const cursoActual = LISTA_TODOS_CURSOS.find((c) => c.id === courseId) || LISTA_TODOS_CURSOS[0];

  // Form State
  const [titulo, setTitulo] = useState(`Tarea 5 · ${cursoActual.nombre}`);
  const [instrucciones, setInstrucciones] = useState(
    `Especificaciones para la asignación del curso ${cursoActual.nombre} (${cursoActual.seccion}). Describa detalladamente los requisitos que debe subir el estudiante a su PVA.`
  );
  const [fechaLimite, setFechaLimite] = useState("2026-08-18");
  const [horaLimite, setHoraLimite] = useState("11:59 p.m.");
  const [tamanioMax, setTamanioMax] = useState("25");
  const [puntosMax, setPuntosMax] = useState("100");
  const [tiposPermitidos, setTiposPermitidos] = useState<string[]>(["PDF", "ZIP"]);

  // Feed items published per course
  const [publicaciones, setPublicaciones] = useState([
    {
      id: "pub-1",
      tipo: "tarea",
      titulo: `Tarea 4 · Asignación Principal ${cursoActual.nombre}`,
      subtitulo: `${cursoActual.codigo} · Fecha límite: 15 de agosto, 11:59 p.m.`,
      desc: "Instrucciones de desarrollo y solución con complejidad O(n).",
      entregados: 14,
      totalEstudiantes: cursoActual.estudiantesCount,
      urgente: true,
    },
    {
      id: "pub-2",
      tipo: "material",
      titulo: `Guía Teórica · ${cursoActual.nombre}`,
      subtitulo: "Publicado el 4 de agosto · Documento obligatorio de lectura",
      desc: "Material complementario de consulta disponible en PVA.",
      entregados: 0,
      totalEstudiantes: cursoActual.estudiantesCount,
      urgente: false,
    },
  ]);

  const [mensajeExito, setMensajeExito] = useState("");

  // Attendance State
  const [asistencia, setAsistencia] = useState<Record<string, "P" | "A" | "T" | "E">>({
    e1: "P",
    e2: "P",
    e3: "A",
    e4: "T",
    e5: "P",
    e6: "P",
    e7: "P",
    e8: "A",
  });

  const estudiantesData = [
    { id: "e1", nombre: "Jonathan Pérez", matricula: "2024-0112", promedio: 78, asistencia: "88%", iniciales: "JP" },
    { id: "e2", nombre: "Camila Méndez", matricula: "2024-0145", promedio: 92, asistencia: "96%", iniciales: "CM" },
    { id: "e3", nombre: "Dariel Ramírez", matricula: "2024-0189", promedio: 64, asistencia: "72%", iniciales: "DR" },
    { id: "e4", nombre: "Sofía Torres", matricula: "2024-0201", promedio: 85, asistencia: "90%", iniciales: "ST" },
    { id: "e5", nombre: "Gabriel Castillo", matricula: "2024-0230", promedio: 89, asistencia: "94%", iniciales: "GC" },
    { id: "e6", nombre: "Mariana Almonte", matricula: "2024-0255", promedio: 95, asistencia: "98%", iniciales: "MA" },
    { id: "e7", nombre: "Lucas Fernández", matricula: "2024-0280", promedio: 81, asistencia: "89%", iniciales: "LF" },
    { id: "e8", nombre: "Valeria Guzmán", matricula: "2024-0310", promedio: 76, asistencia: "78%", iniciales: "VG" },
  ];

  const handleToggleTipo = (tipo: string) => {
    setTiposPermitidos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const handlePublicar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const nuevaPub = {
      id: `pub-${Date.now()}`,
      tipo: contentType,
      titulo: titulo.trim(),
      subtitulo: `${cursoActual.codigo} · Fecha límite: ${fechaLimite}, ${horaLimite}`,
      desc: instrucciones.trim(),
      entregados: 0,
      totalEstudiantes: cursoActual.estudiantesCount,
      urgente: false,
    };

    setPublicaciones([nuevaPub, ...publicaciones]);
    setMensajeExito(`¡Asignación publicada con éxito en ${cursoActual.nombre} (${cursoActual.seccion})!`);
  };

  const countP = Object.values(asistencia).filter((v) => v === "P").length;
  const countA = Object.values(asistencia).filter((v) => v === "A").length;
  const countT = Object.values(asistencia).filter((v) => v === "T").length;

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Navigation & Course Switcher Bar */}
        <div className={styles.topNav}>
          <Link href={`/${locale}/portal/profesor/mis-cursos`} className={styles.backBtn}>
            <ArrowLeft />
            Volver a Mis Cursos
          </Link>

          <div className={styles.courseSwitcher}>
            <span className="text-xs font-bold text-slate-500 mr-1">Tus módulos:</span>
            {LISTA_TODOS_CURSOS.map((c) => {
              const esActivo = c.id === cursoActual.id;
              return (
                <Link
                  key={c.id}
                  href={`/${locale}/portal/profesor/mis-cursos/${c.id}`}
                  className={`${styles.switcherChip} ${esActivo ? styles.switcherChipActive : ""}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{c.codigo} ({c.seccion})</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Header Block */}
        <div className={styles.cdHeader}>
          <div>
            <span className={styles.eyebrow}>{cursoActual.codigo} · {cursoActual.seccion}</span>
            <h1>{cursoActual.nombre}</h1>
            <span className={styles.meta}>Prof. Manuel Reynoso · {cursoActual.horario}</span>
          </div>
          <div className={styles.cdStats}>
            <div>
              <strong>{cursoActual.estudiantesCount}</strong>
              <span>Estudiantes</span>
            </div>
            <div>
              <strong>{cursoActual.promedio}</strong>
              <span>Promedio</span>
            </div>
            <div>
              <strong>{cursoActual.asistencia}</strong>
              <span>Asistencia</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabRow}>
          <button
            className={`${styles.tabBtn} ${activeTab === "contenido" ? styles.active : ""}`}
            onClick={() => setActiveTab("contenido")}
          >
            Contenido y Asignaciones
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "asistencia" ? styles.active : ""}`}
            onClick={() => setActiveTab("asistencia")}
          >
            Control de Asistencia
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "estudiantes" ? styles.active : ""}`}
            onClick={() => setActiveTab("estudiantes")}
          >
            Estudiantes Inscritos ({cursoActual.estudiantesCount})
          </button>
        </div>

        {/* TAB 1: CONTENIDO */}
        {activeTab === "contenido" && (
          <div>
            {/* Form Panel */}
            <form onSubmit={handlePublicar} className={styles.panel}>
              <div className={styles.panelHead}>
                <Plus />
                <strong>Agregar contenido para {cursoActual.nombre} ({cursoActual.seccion})</strong>
              </div>
              <span className={styles.panelSub}>
                Las publicaciones creadas aquí aparecerán en el PVA de los {cursoActual.estudiantesCount} estudiantes de esta clase.
              </span>

              {/* Type Chips */}
              <div className={styles.typeRow}>
                <button
                  type="button"
                  className={`${styles.typeChip} ${contentType === "tarea" ? styles.selected : ""}`}
                  onClick={() => setContentType("tarea")}
                >
                  <FileText />
                  Tarea
                </button>
                <button
                  type="button"
                  className={`${styles.typeChip} ${contentType === "examen" ? styles.selected : ""}`}
                  onClick={() => setContentType("examen")}
                >
                  <CheckCircle2 />
                  Examen
                </button>
                <button
                  type="button"
                  className={`${styles.typeChip} ${contentType === "material" ? styles.selected : ""}`}
                  onClick={() => setContentType("material")}
                >
                  <BookOpen />
                  Material
                </button>
                <button
                  type="button"
                  className={`${styles.typeChip} ${contentType === "aviso" ? styles.selected : ""}`}
                  onClick={() => setContentType("aviso")}
                >
                  <MessageSquare />
                  Aviso
                </button>
              </div>

              {/* Form Grid */}
              <div className={styles.formGrid}>
                <div className={`${styles.formField} ${styles.full}`}>
                  <label>Título de la publicación</label>
                  <input
                    type="text"
                    placeholder={`Ej. Tarea en ${cursoActual.nombre}`}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>
                <div className={`${styles.formField} ${styles.full}`}>
                  <label>Instrucciones y descripción para el estudiante</label>
                  <textarea
                    placeholder="Describe los requerimientos para tus estudiantes..."
                    value={instrucciones}
                    onChange={(e) => setInstrucciones(e.target.value)}
                  />
                </div>
                <div className={styles.formField}>
                  <label>Fecha límite de entrega</label>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                  />
                </div>
                <div className={styles.formField}>
                  <label>Hora límite</label>
                  <input
                    type="text"
                    value={horaLimite}
                    onChange={(e) => setHoraLimite(e.target.value)}
                  />
                </div>
              </div>

              {/* Specification Box */}
              <div className={styles.specBox}>
                <div className={styles.specTitle}>
                  <Paperclip />
                  Especificaciones de la entrega
                </div>

                <label className="text-xs font-semibold text-slate-500 mb-2 block">
                  Tipos de archivo permitidos
                </label>
                <div className={styles.filetypeRow}>
                  {["PDF", "ZIP", "DOCX", "PNG / JPG", "Enlace URL"].map((ft) => (
                    <button
                      type="button"
                      key={ft}
                      className={`${styles.filetypeChip} ${tiposPermitidos.includes(ft) ? styles.selected : ""}`}
                      onClick={() => handleToggleTipo(ft)}
                    >
                      .{ft}
                    </button>
                  ))}
                </div>

                <div className={styles.specRow}>
                  <div className={styles.specMini}>
                    <label>Tamaño máximo</label>
                    <div className={styles.unitInput}>
                      <input
                        type="number"
                        value={tamanioMax}
                        onChange={(e) => setTamanioMax(e.target.value)}
                      />
                      <span>MB</span>
                    </div>
                  </div>
                  <div className={styles.specMini}>
                    <label>Puntuación máxima</label>
                    <div className={styles.unitInput}>
                      <input
                        type="number"
                        value={puntosMax}
                        onChange={(e) => setPuntosMax(e.target.value)}
                      />
                      <span>pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publish Action Footer */}
              <div className={styles.publishRow}>
                <div className={styles.visibilityNote}>
                  <Sparkles />
                  <span>Visible de inmediato en el PVA de {cursoActual.nombre}</span>
                </div>
                <button type="submit" className={styles.publishBtn}>
                  <Send className="w-4 h-4" />
                  Publicar en el PVA
                </button>
              </div>

              {/* Action Success Box */}
              {mensajeExito && (
                <div className={styles.actionNotice}>
                  <div className={styles.actionNoticeHeader}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{mensajeExito}</span>
                  </div>
                  <div className={styles.actionNoticeLinks}>
                    <Link href={`/${locale}/portal/profesor/mis-cursos`} className={styles.actionNoticeBtn}>
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Volver a la lista de cursos
                    </Link>
                    {LISTA_TODOS_CURSOS.filter((c) => c.id !== cursoActual.id).map((c) => (
                      <Link
                        key={c.id}
                        href={`/${locale}/portal/profesor/mis-cursos/${c.id}`}
                        className={styles.actionNoticeBtn}
                      >
                        Ir a {c.codigo} ({c.seccion})
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Published Content Feed */}
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <BookOpen />
                <strong>Contenido publicado en {cursoActual.nombre} ({publicaciones.length})</strong>
              </div>

              <div className={styles.feed}>
                {publicaciones.map((pub) => (
                  <div key={pub.id} className={styles.feedItem}>
                    <div className={styles.feedTop}>
                      <div className={styles.feedIcon}>
                        <FileText />
                      </div>
                      <div className={styles.feedBody}>
                        <div className={styles.feedHeadline}>
                          <h3>{pub.titulo}</h3>
                          <span className={`${styles.pill} ${pub.urgente ? styles.pillUrgent : styles.pillSent}`}>
                            {pub.entregados > 0 ? `${pub.entregados}/${pub.totalEstudiantes} entregaron` : "Publicado en PVA"}
                          </span>
                        </div>
                        <span className={styles.feedSub}>{pub.subtitulo}</span>
                        <p className={styles.feedDesc}>{pub.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASISTENCIA */}
        {activeTab === "asistencia" && (
          <div className={styles.panel}>
            <div className={styles.attToolbar}>
              <div className={styles.attDate}>
                <Calendar />
                <span>Asistencia · {cursoActual.nombre} ({cursoActual.seccion})</span>
              </div>
              <div className={styles.attSummary}>
                <span className={`${styles.attPill} ${styles.attPillP}`}>{countP} Presentes</span>
                <span className={`${styles.attPill} ${styles.attPillA}`}>{countA} Ausentes</span>
                <span className={`${styles.attPill} ${styles.attPillT}`}>{countT} Tardanzas</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {estudiantesData.map((e) => {
                const estado = asistencia[e.id] || "P";
                return (
                  <div key={e.id} className={styles.attRow}>
                    <div className={styles.attName}>
                      <div className={styles.attAvatar}>{e.iniciales}</div>
                      <div>
                        <strong>{e.nombre}</strong>
                        <span>Matrícula: {e.matricula} · Asistencia acumulada: {e.asistencia}</span>
                      </div>
                    </div>
                    <div className={styles.attToggle}>
                      <button
                        type="button"
                        className={`${styles.attOpt} ${estado === "P" ? styles.attOptPSelected : ""}`}
                        onClick={() => setAsistencia((prev) => ({ ...prev, [e.id]: "P" }))}
                      >
                        P (Presente)
                      </button>
                      <button
                        type="button"
                        className={`${styles.attOpt} ${estado === "A" ? styles.attOptASelected : ""}`}
                        onClick={() => setAsistencia((prev) => ({ ...prev, [e.id]: "A" }))}
                      >
                        A (Ausente)
                      </button>
                      <button
                        type="button"
                        className={`${styles.attOpt} ${estado === "T" ? styles.attOptTSelected : ""}`}
                        onClick={() => setAsistencia((prev) => ({ ...prev, [e.id]: "T" }))}
                      >
                        T (Tardanza)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ESTUDIANTES */}
        {activeTab === "estudiantes" && (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Users />
              <strong>Estudiantes inscritos en {cursoActual.nombre} ({cursoActual.seccion})</strong>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {estudiantesData.map((e) => (
                <div key={e.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0a6a8a] text-white flex items-center justify-center font-bold text-xs">
                      {e.iniciales}
                    </div>
                    <div>
                      <strong className="text-sm text-slate-900 dark:text-white block font-bold">{e.nombre}</strong>
                      <span className="text-xs text-slate-500">Matrícula: {e.matricula}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <strong className="text-sm text-slate-900 dark:text-white block font-bold">{e.promedio} pts</strong>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Promedio</span>
                    </div>
                    <div className="text-center">
                      <strong className="text-sm text-slate-900 dark:text-white block font-bold">{e.asistencia}</strong>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Asistencia</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Side Column */}
      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Resumen de módulo</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Código de curso</span>
            <span>{cursoActual.codigo}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Sección</span>
            <span>{cursoActual.seccion}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tareas publicadas</span>
            <span>{publicaciones.length}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Estudiantes inscritos</span>
            <span>{cursoActual.estudiantesCount}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Promedio general</span>
            <span>{cursoActual.promedio} pts</span>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Otros módulos</strong>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Cambia rápidamente de curso para publicar materiales o tareas en tus otras asignaturas:
          </p>
          <div className="space-y-2">
            {LISTA_TODOS_CURSOS.filter((c) => c.id !== cursoActual.id).map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/portal/profesor/mis-cursos/${c.id}`}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-[#e6f4f8] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-semibold transition-all group"
              >
                <span>{c.codigo} · {c.nombre}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0a6a8a] group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
