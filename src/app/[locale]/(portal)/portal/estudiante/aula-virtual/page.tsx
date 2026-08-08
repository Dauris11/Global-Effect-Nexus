import React from "react";
import styles from "./aula-virtual.module.css";

export default function AulaVirtualPage() {
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
          
          <div className={styles.courseChip}>
            <div className={styles.cring}>
              <svg viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="12" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                <circle cx="15" cy="15" r="12" fill="none" stroke="#2096BA" strokeWidth="3" strokeLinecap="round" strokeDasharray="75.4" strokeDashoffset="15"/>
              </svg>
              <span className={styles.dot}>80%</span>
            </div>
            <div>
              <strong>Bases de Datos II</strong>
              <small>ISC-233</small>
            </div>
          </div>
          
          <div className={styles.courseChip}>
            <div className={styles.cring}>
              <svg viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="12" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                <circle cx="15" cy="15" r="12" fill="none" stroke="#E2607A" strokeWidth="3" strokeLinecap="round" strokeDasharray="75.4" strokeDashoffset="45"/>
              </svg>
              <span className={styles.dot}>40%</span>
            </div>
            <div>
              <strong>Cálculo Integral</strong>
              <small>MAT-201</small>
            </div>
          </div>
          
          <div className={styles.courseChip}>
            <div className={styles.cring}>
              <svg viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="12" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                <circle cx="15" cy="15" r="12" fill="none" stroke="#2096BA" strokeWidth="3" strokeLinecap="round" strokeDasharray="75.4" strokeDashoffset="8"/>
              </svg>
              <span className={styles.dot}>90%</span>
            </div>
            <div>
              <strong>Filosofía de Sistemas</strong>
              <small>ISC-310</small>
            </div>
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
          <div className={styles.feedItem}>
            <div className={styles.feedTop}>
              <div className={`${styles.feedIcon} ${styles.fern}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div className={styles.feedBody}>
                <div className={styles.feedHeadline}>
                  <h3>Tarea 4 · Árboles binarios de búsqueda</h3>
                  <span className={`${styles.pill} ${styles.urgent}`}>Vence hoy, 11:59 p.m.</span>
                </div>
                <span className={styles.feedSub}>Publicado por Prof. Reynoso · hace 4 días</span>
                <p className={styles.feedDesc}>Implementa inserción, eliminación y recorrido in-order de un BST en el lenguaje visto en clase. Sube tu código como .zip o enlace a repositorio.</p>
              </div>
            </div>
            <div className={styles.feedFooter}>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Aún no has entregado</span>
              <button className={styles.uploadBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/></svg>
                Subir entrega
              </button>
            </div>
          </div>

          <div className={styles.feedItem}>
            <div className={styles.feedTop}>
              <div className={`${styles.feedIcon} ${styles.coral}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div className={styles.feedBody}>
                <div className={styles.feedHeadline}>
                  <h3>Segundo parcial</h3>
                  <span className={`${styles.pill} ${styles.soon}`}>En 3 días</span>
                </div>
                <span className={styles.feedSub}>Publicado por Prof. Reynoso · hace 1 semana</span>
                <p className={styles.feedDesc}>Cubre listas enlazadas, pilas, colas y árboles. Modalidad presencial, dura 90 minutos. Trae tu carnet estudiantil.</p>
              </div>
            </div>
            <div className={styles.feedFooter}>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Martes 11 de agosto · Aula 204</span>
              <span className={`${styles.pill} ${styles.info}`}>Sin entrega digital</span>
            </div>
          </div>

          <div className={styles.feedItem}>
            <div className={styles.feedTop}>
              <div className={`${styles.feedIcon} ${styles.marigold}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div className={styles.feedBody}>
                <div className={styles.feedHeadline}>
                  <h3>Slides · Árboles balanceados (AVL)</h3>
                  <span className={`${styles.pill} ${styles.info}`}>Material</span>
                </div>
                <span className={styles.feedSub}>Publicado por Prof. Reynoso · hace 1 semana</span>
              </div>
            </div>
            <div className={styles.feedFooter}>
              <div className={styles.fileChip}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/></svg>
                AVL_clase08.pdf
              </div>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>2.4 MB</span>
            </div>
          </div>

          <div className={styles.feedItem}>
            <div className={styles.feedTop}>
              <div className={`${styles.feedIcon} ${styles.fern}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div className={styles.feedBody}>
                <div className={styles.feedHeadline}>
                  <h3>Tarea 3 · Pilas y colas</h3>
                  <span className={`${styles.pill} ${styles.sent}`}>Entregado</span>
                </div>
                <span className={styles.feedSub}>Publicado por Prof. Reynoso · hace 2 semanas</span>
              </div>
            </div>
            <div className={styles.feedFooter}>
              <div className={styles.fileChip}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/></svg>
                tarea3_akiko.zip
              </div>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Entregado el 28 jul, 6:12 p.m.</span>
            </div>
          </div>

          <div className={styles.feedItem}>
            <div className={styles.feedTop}>
              <div className={`${styles.feedIcon} ${styles.forest}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div className={styles.feedBody}>
                <div className={styles.feedHeadline}>
                  <h3>Tarea 2 · Listas enlazadas</h3>
                  <span className={`${styles.pill} ${styles.graded}`}>Calificado · 92/100</span>
                </div>
                <span className={styles.feedSub}>Publicado por Prof. Reynoso · hace 3 semanas</span>
                <div className={styles.gradeNote}><strong>Nota del profesor:</strong> Buena implementación de la lista doble. Te faltó manejar el caso de eliminar el único nodo — revísalo antes del parcial.</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* SIDE */}
      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Próximas entregas</strong></div>
          <div className={styles.deadlineRow}>
            <div className={styles.dlDate}><span className={styles.d}>08</span><span className={styles.m}>Ago</span></div>
            <div className={styles.dlInfo}>
              <strong>Tarea 4 · Árboles BST</strong>
              <span>Estructura de Datos · vence hoy</span>
            </div>
          </div>
          <div className={styles.deadlineRow}>
            <div className={styles.dlDate}><span className={styles.d}>10</span><span className={styles.m}>Ago</span></div>
            <div className={styles.dlInfo}>
              <strong>Informe de normalización</strong>
              <span>Bases de Datos II</span>
            </div>
          </div>
          <div className={styles.deadlineRow}>
            <div className={styles.dlDate}><span className={styles.d}>11</span><span className={styles.m}>Ago</span></div>
            <div className={styles.dlInfo}>
              <strong>Segundo parcial</strong>
              <span>Estructura de Datos · Aula 204</span>
            </div>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Tu constancia</strong></div>
          <div className={styles.streakCard}>
            <div className={styles.ringWrap}>
              <svg viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="23" fill="none" stroke="#e6f4f8" strokeWidth="5"/>
                <circle cx="28" cy="28" r="23" fill="none" stroke="#2096BA" strokeWidth="5" strokeLinecap="round" strokeDasharray="144.5" strokeDashoffset="18"/>
              </svg>
              <span className={styles.num} style={{ fontSize: '14px' }}>8/9</span>
            </div>
            <div>
              <strong>Entregas a tiempo</strong>
              <p>Vas muy bien este cuatrimestre. Solo te falta la tarea de hoy.</p>
            </div>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Avisos recientes</strong></div>
          <div className={styles.sideEmpty} style={{ padding: '8px 4px 0' }}>
            <p style={{ textAlign: 'left' }}>"Recuerden traer calculadora científica para el parcial del martes." — Prof. Reynoso</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
