"use client";

import React from "react";
import Link from "next/link";
import styles from "./profesor.module.css";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileSpreadsheet,
  Layers,
  MessageSquare,
  Pencil,
  Send,
  TrendingUp,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import type { CursoDelDocente, ResumenDelDocente } from "@/server/portales/types";

export function ProfesorClient({
  nombreProfesor = "Manuel Reynoso",
  escuela = "Escuela de Ing. en Sistemas",
  resumen,
  cursos = [],
  locale,
}: {
  nombreProfesor?: string;
  escuela?: string;
  resumen?: ResumenDelDocente;
  cursos?: CursoDelDocente[];
  locale: string;
}) {
  const primerNombre = nombreProfesor.split(" ")[0] || "Profesor";

  const totalCursos = resumen?.cursos_activos || 3;
  const totalEstudiantes = resumen?.inscritos || 86;
  const totalEntregas = resumen?.notas || 14;

  const tareasPorCalificar = [
    {
      id: "q1",
      titulo: "Tarea 4 · Árboles binarios de búsqueda",
      materia: "Estructura de Datos · ISC-215",
      tiempo: "entregada hace 3 días",
      entregas: "9 entregas",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      icon: BookOpen,
    },
    {
      id: "q2",
      titulo: "Informe de normalización",
      materia: "Bases de Datos II · ISC-233",
      tiempo: "entregada hace 1 día",
      entregas: "4 entregas",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
      icon: Layers,
    },
    {
      id: "q3",
      titulo: "Quiz corto · Segunda unidad",
      materia: "Estructura de Datos · ISC-215",
      tiempo: "entregada hoy",
      entregas: "1 entrega",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
      icon: CheckCircle2,
    },
  ];

  const alertasTempranas = [
    {
      id: "a1",
      estudiante: "Jonathan Pérez",
      iniciales: "JP",
      detalle: "Estructura de Datos · promedio 62, en descenso",
      motivo: "Riesgo académico",
    },
    {
      id: "a2",
      estudiante: "Camila Méndez",
      iniciales: "CM",
      detalle: "Bases de Datos II · 4 ausencias en 3 semanas",
      motivo: "Asistencia baja",
    },
    {
      id: "a3",
      estudiante: "Dariel Ramírez",
      iniciales: "DR",
      detalle: "Estructura de Datos · no entregó las últimas 2 tareas",
      motivo: "Sin entregar",
    },
  ];

  const listaCursos = cursos.length > 0
    ? cursos.map((c) => ({
        id: c.id,
        codigo: "ISC-215",
        seccion: c.periodo_nombre || "Sección 02",
        nombre: c.nombre,
        horario: "Lun / Mié · 4:00–5:30 p.m. · Aula 204",
        estudiantes: c.inscritos,
        promedio: c.promedio ?? 82,
        asistencia: "90%",
      }))
    : [
        {
          id: "c1",
          codigo: "ISC-215",
          seccion: "Sección 02",
          nombre: "Estructura de Datos",
          horario: "Lun / Mié · 4:00–5:30 p.m. · Aula 204",
          estudiantes: 34,
          promedio: 79,
          asistencia: "88%",
        },
        {
          id: "c2",
          codigo: "ISC-233",
          seccion: "Sección 01",
          nombre: "Bases de Datos II",
          horario: "Mar / Jue · 2:00–3:30 p.m. · Aula 118",
          estudiantes: 28,
          promedio: 85,
          asistencia: "93%",
        },
        {
          id: "c3",
          codigo: "ISC-215",
          seccion: "Sección 04",
          nombre: "Estructura de Datos",
          horario: "Vie · 8:00–11:00 a.m. · Aula 204",
          estudiantes: 24,
          promedio: 81,
          asistencia: "90%",
        },
      ];

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.pageHead}>

          <h1>Hola, Profesor {primerNombre} 👋</h1>
          <p>Esto es lo que necesita tu atención hoy en {escuela}.</p>
        </div>

        {/* Quick Actions Row */}
        <div className={styles.quickRow}>
          <Link href={`/${locale}/academico/calificaciones`} className={styles.quickBtn}>
            <div className={styles.qi} style={{ background: "#0a6a8a", color: "#ffffff" }}>
              <Pencil />
            </div>
            <span>Publicar tarea</span>
          </Link>
          <Link href={`/${locale}/academico/cursos`} className={styles.quickBtn}>
            <div className={styles.qi} style={{ background: "#e6f4f8", color: "#2096ba" }}>
              <UserCheck />
            </div>
            <span>Tomar asistencia</span>
          </Link>
          <Link href={`/${locale}/chat-ia`} className={styles.quickBtn}>
            <div className={styles.qi} style={{ background: "#fef3c7", color: "#b45309" }}>
              <Send />
            </div>
            <span>Enviar aviso</span>
          </Link>
          <Link href={`/${locale}/academico/materias`} className={styles.quickBtn}>
            <div className={styles.qi} style={{ background: "#ffe4e6", color: "#9f1239" }}>
              <FileSpreadsheet />
            </div>
            <span>Exportar reporte</span>
          </Link>
        </div>

        {/* KPI Row */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiEyebrow}>Cursos activos</span>
              <div className={styles.kpiIcon} style={{ background: "#0a6a8a", color: "#ffffff" }}>
                <BookOpen />
              </div>
            </div>
            <div className={styles.kpiNum}>{totalCursos}</div>
            <div className={styles.kpiSub}>{totalEstudiantes} estudiantes en total</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiEyebrow}>Promedio del grupo</span>
              <div className={styles.kpiIcon} style={{ background: "#fef3c7", color: "#b45309" }}>
                <TrendingUp />
              </div>
            </div>
            <div className={styles.kpiNum}>82</div>
            <div className={styles.kpiSub}>78% de aprobación general</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiEyebrow}>Por calificar</span>
              <div className={styles.kpiIcon} style={{ background: "#ffe4e6", color: "#9f1239" }}>
                <ClipboardList />
              </div>
            </div>
            <div className={styles.kpiNum}>{totalEntregas}</div>
            <div className={styles.kpiSub}>3 llevan más de 48h esperando</div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiEyebrow}>Tasa de entrega</span>
              <div className={styles.kpiIcon} style={{ background: "#e6f4f8", color: "#2096ba" }}>
                <Clock />
              </div>
            </div>
            <div className={styles.kpiNum}>91%</div>
            <div className={styles.kpiSub}>Últimas 4 tareas asignadas</div>
          </div>
        </div>

        {/* Panel 1: Por Calificar */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <ClipboardList />
            <strong>Entregas pendientes por calificar</strong>
          </div>
          {tareasPorCalificar.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.id} className={styles.queueItem}>
                <div className={styles.queueIcon} style={{ background: "#e6f4f8", color: "#2096ba" }}>
                  <Icon />
                </div>
                <div className={styles.queueInfo}>
                  <strong>{t.titulo}</strong>
                  <span>{t.materia} · {t.tiempo}</span>
                </div>
                <span className={styles.queueCount}>{t.entregas}</span>
                <Link href={`/${locale}/academico/calificaciones`} className={styles.queueBtn}>
                  Calificar
                </Link>
              </div>
            );
          })}
        </div>

        {/* Panel 2: Alertas Tempranas */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <AlertTriangle className="text-rose-600" />
            <strong>Alertas tempranas de estudiantes</strong>
          </div>
          {alertasTempranas.map((a) => (
            <div key={a.id} className={styles.alertItem}>
              <div className={styles.alertAvatar}>{a.iniciales}</div>
              <div className={styles.alertInfo}>
                <strong>{a.estudiante}</strong>
                <span>{a.detalle}</span>
              </div>
              <span className={styles.alertReason}>{a.motivo}</span>
            </div>
          ))}
        </div>

        {/* Panel 3: Tus Cursos y Grupos */}
        <div className={styles.panel} style={{ marginBottom: 0 }}>
          <div className={styles.panelHead}>
            <BookOpen />
            <strong>Tus cursos y grupos asignados</strong>
          </div>
          {listaCursos.map((c) => (
            <div key={c.id} className={styles.rosterCard}>
              <div className={styles.rcMain}>
                <span className={styles.code}>{c.codigo} · {c.seccion}</span>
                <h3>{c.nombre}</h3>
                <span className={styles.meta}>{c.horario}</span>
              </div>
              <div className={styles.rosterStat}>
                <strong>{c.estudiantes}</strong>
                <span>Estudiantes</span>
              </div>
              <div className={styles.rosterStat}>
                <strong>{c.promedio}</strong>
                <span>Promedio</span>
              </div>
              <div className={styles.rosterStat}>
                <strong>{c.asistencia}</strong>
                <span>Asistencia</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Side Column */}
      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Tu horario de hoy</strong>
          </div>
          <div className={styles.todayRow}>
            <span className={styles.todayTime}>8:00a</span>
            <div className={styles.todayInfo}>
              <strong>Estructura de Datos · Sec. 04</strong>
              <span>Aula 204</span>
            </div>
          </div>
          <div className={styles.todayRow}>
            <span className={styles.todayTime}>2:00p</span>
            <div className={styles.todayInfo}>
              <strong>Bases de Datos II · Sec. 01</strong>
              <span>Aula 118</span>
            </div>
          </div>
          <div className={styles.todayRow}>
            <span className={styles.todayTime}>4:30p</span>
            <div className={styles.todayInfo}>
              <strong>Tutoría abierta de programación</strong>
              <span>Oficina 3B · sin cita previa</span>
            </div>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Actas pendientes de firma</strong>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            El acta final de <strong>Filosofía de Sistemas</strong> del cuatrimestre anterior está lista para firma digital y envío a Registro.
          </p>
          <Link href={`/${locale}/academico/calificaciones`} className={styles.ctaBtn}>
            Revisar y firmar
          </Link>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Actividad reciente</strong>
          </div>
          <div className={styles.pastItem}>
            <div className={styles.dlDate}>
              <span className={styles.d}>08</span>
              <span className={styles.m}>Ago</span>
            </div>
            <div>
              <strong>Publicación de Tarea 4</strong>
              <span>Estructura de Datos · Sec 02</span>
            </div>
          </div>
          <div className={styles.pastItem}>
            <div className={styles.dlDate}>
              <span className={styles.d}>05</span>
              <span className={styles.m}>Ago</span>
            </div>
            <div>
              <strong>Cierre de asistencias</strong>
              <span>Bases de Datos II · Sec 01</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
