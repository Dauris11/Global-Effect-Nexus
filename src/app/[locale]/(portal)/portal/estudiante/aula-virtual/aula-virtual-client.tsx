"use client";

import React, { useState, useRef } from "react";
import { format } from "date-fns";
import styles from "./aula-virtual.module.css";
import { UploadButton } from "@/components/portal/upload-button";
import type { AsignacionDelEstudiante, MateriaDelEstudiante } from "@/server/portales/types";
import { enUS, es as esLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, FileText, Upload, BookOpen, Clock, AlertCircle } from "lucide-react";

export function AulaVirtualClient({
  materias,
  asignaciones,
  locale,
}: {
  materias: MateriaDelEstudiante[];
  asignaciones: AsignacionDelEstudiante[];
  locale: string;
}) {
  const dateLocale = locale === "en" ? enUS : esLocale;
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Todo");
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const filters = ["Todo", "Tareas", "Exámenes", "Materiales", "Avisos"];

  const filteredAsignaciones = asignaciones.filter((a) => {
    if (selectedMateria && a.materia_nombre !== selectedMateria) return false;
    
    if (selectedFilter !== "Todo") {
      if (selectedFilter === "Tareas" && a.tipo !== "tarea") return false;
      if (selectedFilter === "Exámenes" && a.tipo !== "examen") return false;
      if (selectedFilter === "Materiales" && a.tipo !== "material") return false;
      if (selectedFilter === "Avisos" && a.tipo !== "aviso") return false;
    }
    return true;
  });

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir === 'left' ? -250 : 250, behavior: 'smooth' });
    }
  };

  const getPillClass = (tipo: string, fecha?: Date | string | null) => {
    if (tipo === 'examen') return styles.soon;
    if (tipo === 'material' || tipo === 'aviso') return styles.info;
    if (tipo === 'tarea' && fecha) {
      const isPast = new Date(fecha) < new Date();
      if (isPast) return styles.urgent;
    }
    return styles.info;
  };

  const getIconClass = (tipo: string) => {
    if (tipo === 'tarea') return styles.fern;
    if (tipo === 'examen') return styles.coral;
    if (tipo === 'material') return styles.marigold;
    return styles.forest;
  };

  const getIcon = (tipo: string) => {
    if (tipo === 'examen') return <Clock />;
    if (tipo === 'material') return <FileText />;
    return <BookOpen />;
  };

  const getMateriaColor = (index: number) => {
    const classes = [styles.bgForest, styles.bgFern, styles.bgCoral, styles.bgMarigold];
    return classes[index % classes.length];
  };
  
  const selectedMateriaObj = materias.find(m => m.nombre === selectedMateria);

  return (
    <div className={styles.pvaContainer}>
      <main className={styles.main}>
        
        <div className={styles.pageHead}>
          <span className={styles.eyebrow}>PVA · Aula Virtual</span>
          <h1>Tus cursos</h1>
          <p>Contenido, tareas y exámenes que suben tus profesores.</p>
        </div>

        <div className={styles.courseHero}>
          <div className={styles.cheroHead}>
            <strong>Cursos a los que has accedido recientemente</strong>
            <div className={styles.cheroNav}>
              <button aria-label="Anterior" onClick={() => scrollCarousel('left')}>
                <ChevronLeft />
              </button>
              <button aria-label="Siguiente" onClick={() => scrollCarousel('right')}>
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className={styles.courseCarousel} ref={carouselRef}>
            {materias.length === 0 ? (
              <div style={{color:'var(--ink-soft)', fontSize:'13px', padding:'20px'}}>No hay materias inscritas.</div>
            ) : null}
            {materias.map((materia, i) => {
              const isActive = selectedMateria === materia.nombre;
              const bgColorClass = getMateriaColor(i);
              const progress = Math.min(100, Math.floor(Math.random() * 50) + 40); // mock
              const radius = 15.5;
              const circum = 2 * Math.PI * radius;
              const offset = circum - (progress / 100) * circum;
              const ringColor = i % 4 === 1 ? '#3F7D5C' : (i % 4 === 2 ? '#E2607A' : '#E7A73E'); // adaptado del html
              const ringBg = i % 4 === 1 ? '#E7ECDF' : (i % 4 === 2 ? '#FADFE4' : '#E7ECDF');

              return (
                <div 
                  key={materia.nombre} 
                  className={`${styles.chc} ${isActive ? styles.active : ''}`}
                  onClick={() => setSelectedMateria(isActive ? null : materia.nombre)}
                >
                  <div className={`${styles.chcBanner} ${bgColorClass}`}>
                    <svg className={styles.chcRings} viewBox="0 0 150 150" fill="none">
                      <circle cx="75" cy="75" r="60" stroke="#fff" strokeWidth="1" opacity="0.25"/>
                      <circle cx="75" cy="75" r="42" stroke="#fff" strokeWidth="1" opacity="0.3"/>
                      <circle cx="75" cy="75" r="24" stroke="#fff" strokeWidth="1.2" opacity="0.4"/>
                    </svg>
                    <span className={styles.chcCode}>{materia.codigo}</span>
                    <div className={styles.chcRing}>
                      <svg viewBox="0 0 38 38">
                        <circle cx="19" cy="19" r={radius} fill="none" stroke={ringBg} strokeWidth="3.5"/>
                        <circle cx="19" cy="19" r={radius} fill="none" stroke={ringColor} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={circum} strokeDashoffset={offset}/>
                      </svg>
                      <span>{progress}%</span>
                    </div>
                  </div>
                  <div className={styles.chcBody}>
                    <h4>{materia.nombre}</h4>
                    <span>{materia.profesor_nombre || "Sin profesor asignado"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedMateriaObj && (
          <div className={styles.courseHeader}>
            <div>
              <h2>{selectedMateriaObj.nombre}</h2>
              <span className={styles.meta}>Prof. {selectedMateriaObj.profesor_nombre || "N/A"}</span>
            </div>
            <span className={styles.courseCode}>{selectedMateriaObj.codigo}</span>
          </div>
        )}

        <div className={styles.filterRow}>
          {filters.map((f) => (
            <span 
              key={f} 
              className={`${styles.filterChip} ${selectedFilter === f ? styles.active : ''}`}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>

        <div className={styles.feed}>
          {filteredAsignaciones.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px 20px'}}>
              <p style={{color:'var(--ink-soft)', fontSize:'14px'}}>No hay asignaciones para mostrar con estos filtros.</p>
            </div>
          ) : (
            filteredAsignaciones.map((a) => (
              <div key={a.id} className={styles.feedItem}>
                <div className={styles.feedTop}>
                  <div className={`${styles.feedIcon} ${getIconClass(a.tipo)}`}>
                    {getIcon(a.tipo)}
                  </div>
                  <div className={styles.feedBody}>
                    <div className={styles.feedHeadline}>
                      <h3>{a.titulo}</h3>
                      <span className={`${styles.pill} ${getPillClass(a.tipo, a.fecha_vencimiento)}`}>
                        {a.tipo === 'examen' ? 'Examen programado' : (a.tipo === 'tarea' ? 'Entregable' : 'Material')}
                      </span>
                    </div>
                    <span className={styles.feedSub}>
                      {a.materia_nombre}
                    </span>
                    {a.descripcion && <p className={styles.feedDesc}>{a.descripcion}</p>}
                  </div>
                </div>
                
                {a.tipo === "tarea" && (
                  <div className={styles.feedFooter}>
                    <span style={{fontSize:'12px', color:'var(--ink-soft)'}}>
                      {a.fecha_vencimiento 
                        ? `Vence: ${format(new Date(a.fecha_vencimiento), "PP", { locale: dateLocale })}`
                        : 'Sin fecha de entrega'}
                    </span>
                    <UploadButton asignacionId={a.id} title={a.titulo} />
                  </div>
                )}
                {a.tipo === "material" && (
                  <div className={styles.feedFooter}>
                    <div className={styles.fileChip}>
                      <FileText /> Documento adjunto
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Próximas entregas</strong></div>
          {asignaciones.filter(a => a.fecha_vencimiento).slice(0, 4).map((a, i) => {
            const d = new Date(a.fecha_vencimiento!);
            return (
              <div key={a.id} className={styles.deadlineRow}>
                <div className={styles.dlDate}>
                  <span className={styles.d}>{format(d, "dd")}</span>
                  <span className={styles.m}>{format(d, "MMM", {locale: dateLocale})}</span>
                </div>
                <div className={styles.dlInfo}>
                  <strong>{a.titulo}</strong>
                  <span>{a.materia_nombre}</span>
                </div>
              </div>
            );
          })}
          {asignaciones.filter(a => a.fecha_vencimiento).length === 0 && (
             <div className={styles.sideEmpty}>
               <p>No tienes entregas cercanas.</p>
             </div>
          )}
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Tu constancia</strong></div>
          <div className={styles.streakCard}>
            <div className={styles.ringWrap}>
              <svg viewBox="0 0 56 56" style={{position:'absolute', inset:0}}>
                <circle cx="28" cy="28" r="23" fill="none" stroke="var(--fern-tint)" strokeWidth="5"/>
                <circle cx="28" cy="28" r="23" fill="none" stroke="var(--fern)" strokeWidth="5" strokeLinecap="round" strokeDasharray="144.5" strokeDashoffset="30"/>
              </svg>
              <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Grotesk', fontSize:'14px', fontWeight:700, color:'var(--ink)'}}>
                80%
              </div>
            </div>
            <div>
              <strong>Entregas a tiempo</strong>
              <p>Vas muy bien este cuatrimestre. Sigue así.</p>
            </div>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Avisos recientes</strong></div>
          <div className={styles.sideEmpty} style={{padding:'8px 4px 0'}}>
            <p style={{textAlign:'left'}}>"Mantente al tanto de las notificaciones publicadas por los docentes."</p>
          </div>
        </div>
      </aside>

    </div>
  );
}
