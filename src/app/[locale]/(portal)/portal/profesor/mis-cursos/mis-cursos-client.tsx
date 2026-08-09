"use client";

import React from "react";
import Link from "next/link";
import styles from "./mis-cursos.module.css";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import type { CursoDelDocente } from "@/server/portales/types";

export function MisCursosClient({
  locale,
  cursos = [],
}: {
  locale: string;
  cursos?: CursoDelDocente[];
}) {
  const listaCursos = cursos.length > 0
    ? cursos.map((c, i) => ({
        id: c.id,
        codigo: "ISC-215",
        seccion: c.periodo_nombre || `Sección 0${i + 1}`,
        nombre: c.nombre,
        horario: "Lun / Mié · 4:00–5:30 p.m. · Aula 204",
        estudiantes: c.inscritos,
        promedio: c.promedio ?? 82,
        asistencia: "90%",
        activo: true,
        bannerClass: i % 3 === 0 ? styles.mcBanner : i % 3 === 1 ? styles.mcBannerBlue2 : styles.mcBannerSky,
      }))
    : [
        {
          id: "mc1",
          codigo: "ISC-215",
          seccion: "Sección 02",
          nombre: "Estructura de Datos",
          horario: "Lun / Mié · 4:00–5:30 p.m. · Aula 204",
          estudiantes: 34,
          promedio: 79,
          asistencia: "88%",
          activo: true,
          bannerClass: styles.mcBanner,
        },
        {
          id: "mc2",
          codigo: "ISC-233",
          seccion: "Sección 01",
          nombre: "Bases de Datos II",
          horario: "Mar / Jue · 2:00–3:30 p.m. · Aula 118",
          estudiantes: 28,
          promedio: 85,
          asistencia: "93%",
          activo: true,
          bannerClass: styles.mcBannerBlue2,
        },
        {
          id: "mc3",
          codigo: "ISC-215",
          seccion: "Sección 04",
          nombre: "Estructura de Datos",
          horario: "Vie · 8:00–11:00 a.m. · Aula 204",
          estudiantes: 24,
          promedio: 81,
          asistencia: "90%",
          activo: true,
          bannerClass: styles.mcBannerSky,
        },
        {
          id: "mc4",
          codigo: "ISC-310",
          seccion: "Sección 01",
          nombre: "Filosofía de Sistemas",
          horario: "Cuatrimestre pasado · Cerrado",
          estudiantes: 30,
          promedio: 84,
          asistencia: "91%",
          activo: false,
          bannerClass: styles.mcBannerSlate,
        },
      ];

  const activosCount = listaCursos.filter((c) => c.activo).length;
  const estudiantesTotal = listaCursos.reduce((acc, c) => acc + c.estudiantes, 0);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {/* Page Head */}
        <div className={styles.pageHead}>
          <span className={styles.eyebrow}>Mis cursos · Ciclo Actual 2026</span>
          <h1>Tus materias impartidas</h1>
          <p>Selecciona un curso para agregar contenido, tareas y controlar asistencia.</p>
        </div>

        {/* Courses Grid */}
        <div className={styles.mcGrid}>
          {listaCursos.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/portal/profesor/mis-cursos/${c.id}`}
              className={styles.mcCard}
            >
              <div className={`${styles.mcBanner} ${c.bannerClass}`}>
                <svg className={styles.mcRings} viewBox="0 0 130 130" fill="none">
                  <circle cx="65" cy="65" r="52" stroke="#ffffff" strokeWidth="1" opacity="0.35" />
                  <circle cx="65" cy="65" r="36" stroke="#ffffff" strokeWidth="1" opacity="0.45" />
                  <circle cx="65" cy="65" r="20" stroke="#ffffff" strokeWidth="1.2" opacity="0.55" />
                </svg>
                <span className={styles.mcCode}>{c.codigo}</span>
                <span className={styles.mcSectionTag}>{c.seccion}</span>
              </div>
              <div className={styles.mcBody}>
                <h3>{c.nombre}</h3>
                <span className={styles.meta}>{c.horario}</span>
                <div className={styles.mcStats}>
                  <div>
                    <strong>{c.estudiantes}</strong>
                    <span>Estudiantes</span>
                  </div>
                  <div>
                    <strong>{c.promedio}</strong>
                    <span>Promedio</span>
                  </div>
                  <div>
                    <strong>{c.asistencia}</strong>
                    <span>Asistencia</span>
                  </div>
                </div>
                <div className={styles.mcFooter}>
                  <span>{c.activo ? "Entrar al curso" : "Ver historial"}</span>
                  <ArrowRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Side Aside Column */}
      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Resumen general</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Cursos activos</span>
            <span>{activosCount}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Estudiantes en total</span>
            <span>{estudiantesTotal}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Promedio general</span>
            <span>82</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Asistencia promedio</span>
            <span>90%</span>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Acceso rápido</strong>
          </div>
          <p style={{ fontSize: "12px", color: "var(--ink-soft)", lineHeight: 1.55, margin: "0 0 12px" }}>
            Entra a un curso para agregar contenido nuevo, publicar tareas o pasar asistencia de hoy.
          </p>
          <Link href={`/${locale}/portal/profesor/mis-cursos/c1`} className={styles.ctaBtn}>
            Ir a Estructura de Datos
          </Link>
        </div>
      </aside>
    </div>
  );
}
