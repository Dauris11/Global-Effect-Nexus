"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./docente-calificaciones.module.css";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileCheck2,
  FileSpreadsheet,
  History,
  Lock,
  Save,
  Send,
  Sparkles,
  Users,
} from "lucide-react";

interface EstudianteNota {
  id: string;
  nombre: string;
  matricula: string;
  iniciales: string;
  p1: number;
  p2: number;
  prac: number;
  ef: number;
}

export function DocenteCalificacionesClient({
  locale,
  nombreProfesor = "Manuel Reynoso",
}: {
  locale: string;
  nombreProfesor?: string;
}) {
  const [cursoSeleccionado, setCursoSeleccionado] = useState("c1");
  const [estaPublicado, setEstaPublicado] = useState(false);

  // Group Courses Data
  const grupos = [
    { id: "c1", codigo: "ISC-215", seccion: "Sección 02", nombre: "Estructura de Datos", aula: "Aula 204" },
    { id: "c2", codigo: "ISC-233", seccion: "Sección 01", nombre: "Bases de Datos II", aula: "Aula 118" },
    { id: "c3", codigo: "ISC-215", seccion: "Sección 04", nombre: "Estructura de Datos", aula: "Aula 204" },
    { id: "c4", codigo: "ISC-310", seccion: "Sección 01", nombre: "Filosofía de Sistemas", aula: "Cerrado" },
  ];

  const grupoActual = grupos.find((g) => g.id === cursoSeleccionado) || grupos[0];

  // Student Grades State
  const [estudiantes, setEstudiantes] = useState<EstudianteNota[]>([
    { id: "e1", nombre: "Jonathan Pérez", matricula: "2024-0112", iniciales: "JP", p1: 15, p2: 14, prac: 24, ef: 25 },
    { id: "e2", nombre: "Camila Méndez", matricula: "2024-0145", iniciales: "CM", p1: 19, p2: 18, prac: 28, ef: 28 },
    { id: "e3", nombre: "Dariel Ramírez", matricula: "2024-0189", iniciales: "DR", p1: 11, p2: 12, prac: 18, ef: 21 },
    { id: "e4", nombre: "Sofía Torres", matricula: "2024-0201", iniciales: "ST", p1: 17, p2: 16, prac: 26, ef: 26 },
    { id: "e5", nombre: "Gabriel Castillo", matricula: "2024-0230", iniciales: "GC", p1: 18, p2: 17, prac: 27, ef: 27 },
    { id: "e6", nombre: "Mariana Almonte", matricula: "2024-0255", iniciales: "MA", p1: 20, p2: 19, prac: 29, ef: 29 },
    { id: "e7", nombre: "Lucas Fernández", matricula: "2024-0280", iniciales: "LF", p1: 16, p2: 15, prac: 24, ef: 26 },
    { id: "e8", nombre: "Valeria Guzmán", matricula: "2024-0310", iniciales: "VG", p1: 14, p2: 13, prac: 22, ef: 24 },
  ]);

  const handleScoreChange = (id: string, campo: "p1" | "p2" | "prac" | "ef", val: string) => {
    const num = Math.max(0, Math.min(campo === "prac" || campo === "ef" ? 30 : 20, Number(val) || 0));
    setEstudiantes((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [campo]: num } : e))
    );
  };

  const handlePublicar = () => {
    setEstaPublicado(true);
  };

  // Calculations
  const estudiantesCalculados = estudiantes.map((e) => {
    const notaFinal = e.p1 + e.p2 + e.prac + e.ef;
    let estado = "Aprobado";
    let statusClass = styles.gbStatusOk;
    if (notaFinal < 60) {
      estado = "Reprobado";
      statusClass = styles.gbStatusFail;
    } else if (notaFinal < 70) {
      estado = "En Riesgo";
      statusClass = styles.gbStatusRisk;
    }
    return { ...e, notaFinal, estado, statusClass };
  });

  const aprobadosCount = estudiantesCalculados.filter((e) => e.notaFinal >= 70).length;
  const riesgoCount = estudiantesCalculados.filter((e) => e.notaFinal >= 60 && e.notaFinal < 70).length;
  const reprobadosCount = estudiantesCalculados.filter((e) => e.notaFinal < 60).length;
  const promedioGeneral = (
    estudiantesCalculados.reduce((acc, e) => acc + e.notaFinal, 0) / estudiantesCalculados.length
  ).toFixed(1);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Page Head */}
        <div className={styles.pageHead}>
          <span className={styles.eyebrow}>Gestión de Calificaciones · Ciclo 2026</span>
          <h1>Actas y Calificaciones de Estudiantes</h1>
          <p>
            Completa las evaluaciones de tus grupos y publica las notas oficiales para que los estudiantes las consulten directamente en su portal.
          </p>
        </div>

        {/* Group Selector Row */}
        <div className={styles.gselRow}>
          {grupos.map((g) => {
            const activo = g.id === grupoActual.id;
            return (
              <button
                type="button"
                key={g.id}
                className={`${styles.gselChip} ${activo ? styles.gselChipActive : ""}`}
                onClick={() => {
                  setCursoSeleccionado(g.id);
                  setEstaPublicado(false);
                }}
              >
                <strong>{g.codigo} · {g.seccion}</strong>
                <span>{g.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Status Banner */}
        <div className={`${styles.statusBanner} ${estaPublicado ? styles.statusPublished : styles.statusDraft}`}>
          <div className={styles.statusLeft}>
            {estaPublicado ? <CheckCircle2 /> : <ClipboardList />}
            <div>
              <strong>
                {estaPublicado
                  ? `Acta Oficial Publicada — ${grupoActual.codigo} (${grupoActual.seccion})`
                  : `Acta en Borrador — ${grupoActual.codigo} (${grupoActual.seccion})`}
              </strong>
              <span className="sub block mt-0.5">
                {estaPublicado
                  ? "Las notas ya están visibles para los estudiantes en su Portal de Calificaciones. Última sincronización: Hoy, 10:45 a.m."
                  : `${estudiantesCalculados.length} estudiantes calificados. Revisa los parciales y publica las notas oficiales cuando termines.`}
              </span>
            </div>
          </div>

          <button type="button" onClick={handlePublicar} className={styles.publishCta}>
            <Send className="w-4 h-4" />
            {estaPublicado ? "Actualizar nota publicada" : "Publicar calificaciones oficiales"}
          </button>
        </div>

        {/* Interconnection Notice */}
        {estaPublicado && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <strong className="font-bold block text-sm mb-0.5">¡Interconexión en vivo con el Portal de Estudiantes!</strong>
                <span>
                  Las calificaciones de <strong>{grupoActual.nombre}</strong> han sido transmitidas. Jonathan Pérez, Camila Méndez y los demás estudiantes de esta sección pueden consultar sus notas finales en <strong>/portal/estudiante/calificaciones</strong>.
                </span>
              </div>
            </div>
            <Link
              href={`/${locale}/portal/estudiante/calificaciones`}
              className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-700 text-white px-4 py-2 rounded-full hover:bg-emerald-800 transition-colors"
            >
              Probar vista de Estudiante
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Weighting Cards */}
        <div className={styles.weightRow}>
          <div className={styles.weightCard}>
            <label>Primer Parcial (20%)</label>
            <div className={styles.weightInput}>
              <input type="number" defaultValue={20} readOnly />
              <span>pts</span>
            </div>
          </div>
          <div className={styles.weightCard}>
            <label>Segundo Parcial (20%)</label>
            <div className={styles.weightInput}>
              <input type="number" defaultValue={20} readOnly />
              <span>pts</span>
            </div>
          </div>
          <div className={styles.weightCard}>
            <label>Prácticas / Tareas (30%)</label>
            <div className={styles.weightInput}>
              <input type="number" defaultValue={30} readOnly />
              <span>pts</span>
            </div>
          </div>
          <div className={styles.weightCard}>
            <label>Examen Final (30%)</label>
            <div className={styles.weightInput}>
              <input type="number" defaultValue={30} readOnly />
              <span>pts</span>
            </div>
          </div>
        </div>

        {/* Gradebook Table Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <Users />
            <strong>Libro de Calificaciones — {grupoActual.nombre} ({grupoActual.seccion})</strong>
          </div>

          <div className={styles.gbScroll}>
            <table className={styles.gbTable}>
              <thead>
                <tr>
                  <th scope="col">Estudiante</th>
                  <th scope="col" className="num">P1 <small>20 pts</small></th>
                  <th scope="col" className="num">P2 <small>20 pts</small></th>
                  <th scope="col" className="num">Prácticas <small>30 pts</small></th>
                  <th scope="col" className="num">EF <small>30 pts</small></th>
                  <th scope="col" className="num">Nota Final</th>
                  <th scope="col" className="num">Estado</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesCalculados.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className={styles.gbStudent}>
                        <div className={styles.gbAvatar}>{e.iniciales}</div>
                        <div>
                          <strong>{e.nombre}</strong>
                          <span>Matrícula: {e.matricula}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className={styles.gbCell}
                        value={e.p1}
                        onChange={(ev) => handleScoreChange(e.id, "p1", ev.target.value)}
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className={styles.gbCell}
                        value={e.p2}
                        onChange={(ev) => handleScoreChange(e.id, "p2", ev.target.value)}
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className={styles.gbCell}
                        value={e.prac}
                        onChange={(ev) => handleScoreChange(e.id, "prac", ev.target.value)}
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className={styles.gbCell}
                        value={e.ef}
                        onChange={(ev) => handleScoreChange(e.id, "ef", ev.target.value)}
                      />
                    </td>
                    <td className={styles.gbFinal}>
                      <strong>{e.notaFinal} pts</strong>
                    </td>
                    <td className="text-center">
                      <span className={`${styles.gbStatus} ${e.statusClass}`}>
                        {e.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Toolbar */}
          <div className={styles.gbToolbar}>
            <div className="text-xs text-slate-500 font-semibold space-x-3">
              <span><strong>{estudiantesCalculados.length}</strong> Estudiantes</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">{aprobadosCount} Aprobados</span>
              <span>·</span>
              <span className="text-amber-700 font-bold">{riesgoCount} En Riesgo</span>
              <span>·</span>
              <span className="text-rose-700 font-bold">{reprobadosCount} Reprobados</span>
            </div>

            <div className={styles.exportRow}>
              <button type="button" className={styles.exportBtn}>
                <Save className="w-4 h-4" />
                Guardar borrador
              </button>
              <button type="button" className={styles.exportBtn}>
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Excel (.XLSX)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Side Column */}
      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Resumen del Acta</strong>
          </div>
          <div className={styles.previewRow}>
            <span>Módulo</span>
            <span>{grupoActual.codigo}</span>
          </div>
          <div className={styles.previewRow}>
            <span>Sección</span>
            <span>{grupoActual.seccion}</span>
          </div>
          <div className={styles.previewRow}>
            <span>Calificados</span>
            <span>{estudiantesCalculados.length} / {estudiantesCalculados.length}</span>
          </div>
          <div className={styles.previewRow}>
            <span>Promedio del grupo</span>
            <span>{promedioGeneral} pts</span>
          </div>
          <div className={styles.previewRow}>
            <span>Estado del acta</span>
            <span className={estaPublicado ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
              {estaPublicado ? "Oficial Publicada" : "En Borrador"}
            </span>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Historial de publicaciones</strong>
          </div>
          <div className={styles.pubLog}>
            <div className={styles.plIcon}>
              <History />
            </div>
            <div>
              <strong>Publicación de actas parciales</strong>
              <span>8 ago 2026 por {nombreProfesor}</span>
            </div>
          </div>
          <div className={styles.pubLog}>
            <div className={styles.plIcon}>
              <ClipboardCheck />
            </div>
            <div>
              <strong>Apertura de captura de notas</strong>
              <span>1 ago 2026 por Registro Académico</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
