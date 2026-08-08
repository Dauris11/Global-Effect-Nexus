import React from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import styles from "./aula-virtual.module.css";
import { proximasAsignacionesDelEstudiante } from "@/server/portales/queries";
import { UploadButton } from "@/components/portal/upload-button";

export default async function AulaVirtualPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dateLocale = locale === "en" ? enUS : es;
  const estudianteId = "mock-id"; // Omitiremos currentUser() para prototipo rápido
  const asignaciones = await proximasAsignacionesDelEstudiante(estudianteId);

  const pendientes = asignaciones.filter(a => a.fecha_vencimiento && new Date(a.fecha_vencimiento) > new Date());

  return (
    <div className={styles.pvaContainer}>
      {/* MAIN */}
      <main className={styles.main}>
        <div className={styles.pageHead}>
          <span className={styles.eyebrow}>PVA · Aula Virtual</span>
          <h1>Tus cursos</h1>
          <p>Contenido, tareas y exámenes que suben tus profesores.</p>
        </div>

        <div className={styles.courseScroller}>
          <div className={`${styles.courseChip} ${styles.active}`}>
            <div className={styles.cring}>
              <svg viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                <circle cx="15" cy="15" r="12" fill="none" stroke="#E7A73E" strokeWidth="3" strokeLinecap="round" strokeDasharray="75.4" strokeDashoffset="26"/>
              </svg>
              <span className={styles.dot} style={{ color: '#fff' }}>65%</span>
            </div>
            <div>
              <strong>Estructura de Datos</strong>
              <small>ISC-215</small>
            </div>
            <span className={styles.unread}></span>
          </div>
        </div>

        <div className={styles.courseHeader}>
          <div>
            <h2>Estructura de Datos</h2>
            <span className={styles.meta}>Prof. Manuel Reynoso &nbsp;·&nbsp; Lun / Mié 4:00–5:30 p.m.</span>
          </div>
          <span className={styles.courseCode}>ISC-215 · Sección 02</span>
        </div>

        <div className={styles.filterRow}>
          <span className={`${styles.filterChip} ${styles.active}`}>Todo</span>
          <span className={styles.filterChip}>Tareas</span>
          <span className={styles.filterChip}>Exámenes</span>
          <span className={styles.filterChip}>Materiales</span>
          <span className={styles.filterChip}>Avisos</span>
        </div>

        <div className={styles.feed}>
          {asignaciones.map((a) => (
            <div className={styles.feedItem} key={a.id}>
              <div className={styles.feedTop}>
                {/* Icon based on tipo */}
                <div className={`${styles.feedIcon} ${a.tipo === 'tarea' ? styles.fern : a.tipo === 'examen' ? styles.coral : styles.marigold}`}>
                  {a.tipo === 'tarea' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
                  {a.tipo === 'examen' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><circle cx="12" cy="12" r="10"/></svg>}
                  {(a.tipo === 'material' || a.tipo === 'anuncio') && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                </div>
                
                <div className={styles.feedBody}>
                  <div className={styles.feedHeadline}>
                    <h3>{a.titulo}</h3>
                    {a.fecha_vencimiento && a.estado_entrega === "pendiente" && (
                      <span className={`${styles.pill} ${new Date(a.fecha_vencimiento) < new Date(new Date().setDate(new Date().getDate() + 1)) ? styles.urgent : styles.soon}`}>
                        {new Date(a.fecha_vencimiento) < new Date(new Date().setDate(new Date().getDate() + 1)) ? "Vence hoy" : `Vence el ${format(new Date(a.fecha_vencimiento), "dd MMM")}`}
                      </span>
                    )}
                    {a.estado_entrega === "entregado" && <span className={`${styles.pill} ${styles.sent}`}>Entregado</span>}
                    {a.estado_entrega === "calificado" && <span className={`${styles.pill} ${styles.graded}`}>Calificado · {a.calificacion}/100</span>}
                  </div>
                  <p className={styles.feedDesc}>{a.descripcion}</p>
                </div>
              </div>

              {a.tipo === 'tarea' && a.estado_entrega === 'pendiente' && (
                <div className={styles.feedFooter}>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Aún no has entregado</span>
                  <UploadButton asignacionId={a.id} title={a.titulo} />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* SIDE */}
      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Próximas entregas</strong></div>
          {pendientes.length > 0 ? (
            pendientes.map(a => (
              <div className={styles.deadlineRow} key={a.id}>
                <div className={styles.dlDate}>
                  <span className={styles.d}>{format(new Date(a.fecha_vencimiento as string), "dd")}</span>
                  <span className={styles.m}>{format(new Date(a.fecha_vencimiento as string), "MMM", { locale: dateLocale })}</span>
                </div>
                <div className={styles.dlInfo}>
                  <strong>{a.titulo}</strong>
                  <span>{a.materia_nombre}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.sideEmpty}>
              <p>No tienes entregas próximas pendientes.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
