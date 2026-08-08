"use client";

import React, { useState } from "react";
import styles from "./prematricula.module.css";
import { Search, Plus, Check, X, AlertCircle } from "lucide-react";

interface MateriaCatalogo {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  horarioStr: string;
  profesor: string;
  cuposLibres: number;
  cuposTotal: number;
  isConflict?: boolean;
}

const mockCatalogo: MateriaCatalogo[] = [
  { id: "1", codigo: "ISC-320", nombre: "Sistemas Operativos", creditos: 4, horarioStr: "Lun / Mié · 8:00–9:30 a.m.", profesor: "Prof. Katherine Núñez", cuposLibres: 22, cuposTotal: 30 },
  { id: "2", codigo: "ISC-330", nombre: "Ingeniería de Software I", creditos: 4, horarioStr: "Mar / Jue · 8:30–10:00 a.m.", profesor: "Prof. Manuel Reynoso", cuposLibres: 6, cuposTotal: 30 },
  { id: "3", codigo: "MAT-250", nombre: "Estadística Aplicada", creditos: 3, horarioStr: "Lun / Mié · 9:00–10:30 a.m.", profesor: "Prof. Dariana Peña", cuposLibres: 25, cuposTotal: 30 },
  { id: "4", codigo: "ISC-341", nombre: "Redes de Computadoras", creditos: 4, horarioStr: "Mar / Jue · 8:00–9:30 a.m.", profesor: "Prof. Felix Almonte", cuposLibres: 18, cuposTotal: 30 },
  { id: "5", codigo: "ISC-355", nombre: "Interacción Humano-Computadora", creditos: 3, horarioStr: "Vie · 2:00–5:00 p.m.", profesor: "Prof. Krisanny Sosa", cuposLibres: 0, cuposTotal: 25 },
];

export function PrematriculaClient() {
  const [cartIds, setCartIds] = useState<string[]>(["1"]); // pre-selected example
  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");

  const cart = mockCatalogo.filter(m => cartIds.includes(m.id));
  const totalCreditos = cart.reduce((acc, m) => acc + m.creditos, 0);
  const maxCreditos = 18;

  const toggleCart = (id: string) => {
    if (cartIds.includes(id)) {
      setCartIds(cartIds.filter(i => i !== id));
    } else {
      if (totalCreditos + (mockCatalogo.find(m => m.id === id)?.creditos ?? 0) > maxCreditos) {
        alert("Excedes el límite de 18 créditos permitidos.");
        return;
      }
      setCartIds([...cartIds, id]);
    }
  };

  const hasConflict = cartIds.includes("2") && cartIds.includes("4");

  const filteredCatalogo = mockCatalogo.filter(m => {
    if (search && !m.nombre.toLowerCase().includes(search.toLowerCase()) && !m.codigo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={styles.pContainer}>
      <main className={styles.main}>
        
        <div className={styles.enrollBanner}>
          <div className={styles.left}>
            <Check className={styles.iconCheck} style={{width: 20, height: 20, color: 'var(--marigold)'}} />
            <div>
              <strong>Prematrícula abierta · Enero–Abril 2027</strong>
              <span>Selecciona tus materias antes de que cierre el periodo.</span>
            </div>
          </div>
          <span className={styles.enrollCountdown}>Cierra en 4 días · 15 de agosto</span>
        </div>

        <div className={styles.pageHead}>
          <span className={styles.eyebrow}>Prematrícula</span>
          <h1>Selecciona tus materias</h1>
          <p>Estructura de Sistemas, 5to cuatrimestre. Puedes tomar hasta {maxCreditos} créditos.</p>
        </div>

        <div className={styles.catalogToolbar}>
          <input 
            className={styles.searchInput} 
            type="text" 
            placeholder="Buscar por nombre o código…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {['Todas', 'Obligatorias', 'Electivas'].map(f => (
            <span key={f} className={`${styles.filterChip} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
              {f}
            </span>
          ))}
        </div>

        <div className={styles.catalogList}>
          {filteredCatalogo.map(m => {
            const added = cartIds.includes(m.id);
            const full = m.cuposLibres === 0;
            const progress = (m.cuposTotal - m.cuposLibres) / m.cuposTotal;
            const circleColor = full ? '#E2607A' : '#2096BA';
            const bgCircleColor = full ? '#FADFE4' : '#e6f4f8';
            
            return (
              <div key={m.id} className={`${styles.catalogItem} ${full ? styles.full : ''}`}>
                <div className={styles.catMain}>
                  <span className={styles.code}>{m.codigo}</span>
                  <h3>{m.nombre}</h3>
                  <div className={styles.catTags}>
                    <span className={styles.tag}>{m.creditos} créditos</span>
                    <span className={styles.tag}>{m.horarioStr}</span>
                    <span className={styles.tag}>{m.profesor}</span>
                  </div>
                </div>
                
                <div className={styles.catCupos}>
                  <div className={styles.ringWrap}>
                    <svg viewBox="0 0 46 46">
                      <circle cx="23" cy="23" r="19" fill="none" stroke={bgCircleColor} strokeWidth="5"/>
                      <circle cx="23" cy="23" r="19" fill="none" stroke={circleColor} strokeWidth="5" strokeLinecap="round" strokeDasharray="119.4" strokeDashoffset={119.4 * (1 - progress)}/>
                    </svg>
                    <span className={styles.num}>{m.cuposLibres}</span>
                  </div>
                  <div className={styles.catCuposLabel}><strong>{m.cuposLibres} / {m.cuposTotal}</strong>cupos{full ? ', agotado' : ' libres'}</div>
                </div>
                
                <button 
                  className={`${styles.addBtn} ${added ? styles.added : ''} ${full ? styles.disabled : ''}`}
                  onClick={() => !full && toggleCart(m.id)}
                  disabled={full}
                >
                  {added ? <Check /> : (full ? null : <Plus />)}
                  {added ? "Agregada" : (full ? "Sin cupo" : "Agregar")}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Tu selección</strong></div>
          
          {cart.map((m, i) => {
            const colors = ["#2096BA", "#E7A73E", "#E2607A"];
            const c = colors[i % colors.length];
            return (
              <div key={m.id} className={styles.cartItem}>
                <span className={styles.swatch} style={{background: c}}></span>
                <div className={styles.info}>
                  <strong>{m.nombre}</strong>
                  <span>{m.codigo} · {m.creditos} créditos</span>
                </div>
                <button aria-label="Quitar" onClick={() => toggleCart(m.id)}><X /></button>
              </div>
            );
          })}
          {cart.length === 0 && <p style={{fontSize:'12.5px', color:'var(--ink-soft)'}}>No has seleccionado materias aún.</p>}

          <div className={styles.creditTrack}>
            <div className={styles.creditBar}>
              <div className={styles.creditBarFill} style={{width: `${(totalCreditos / maxCreditos) * 100}%`, background: totalCreditos > maxCreditos ? 'var(--coral)' : 'var(--fern)'}}></div>
            </div>
            <span className={styles.n}>{totalCreditos}/{maxCreditos}</span>
          </div>

          {hasConflict && (
            <div className={styles.conflictNote}>
              <AlertCircle />
              <span><strong>Redes de Computadoras</strong> choca con <strong>Ingeniería de Software I</strong> los martes de 8:30 a 9:30. Ajusta tu selección.</span>
            </div>
          )}

          <button className={styles.confirmBtn} style={{ opacity: (totalCreditos === 0 || hasConflict) ? 0.5 : 1, cursor: (totalCreditos === 0 || hasConflict) ? 'not-allowed' : 'pointer' }}>
            <Check />
            Confirmar prematrícula
          </button>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Vista de horario</strong></div>
          <div className={styles.schedGrid}>
            <span></span>
            <span className={styles.sh}>LUN</span><span className={styles.sh}>MAR</span><span className={styles.sh}>MIÉ</span><span className={styles.sh}>JUE</span><span className={styles.sh}>VIE</span>

            <span className={styles.st}>8am</span>
            <div className={`${styles.schedCell} ${cartIds.includes('1') ? styles.fern : ''}`}></div>
            <div className={`${styles.schedCell} ${cartIds.includes('4') ? (hasConflict ? styles.coral : styles.fern) : ''}`}></div>
            <div className={`${styles.schedCell} ${cartIds.includes('1') ? styles.fern : ''}`}></div>
            <div className={`${styles.schedCell} ${cartIds.includes('4') ? (hasConflict ? styles.coral : styles.fern) : ''}`}></div>
            <div className={styles.schedCell}></div>

            <span className={styles.st}>9am</span>
            <div className={`${styles.schedCell} ${cartIds.includes('3') ? styles.marigold : ''}`}></div>
            <div className={`${styles.schedCell} ${cartIds.includes('2') ? (hasConflict ? styles.coral : styles.marigold) : ''}`}></div>
            <div className={`${styles.schedCell} ${cartIds.includes('3') ? styles.marigold : ''}`}></div>
            <div className={`${styles.schedCell} ${cartIds.includes('2') ? (hasConflict ? styles.coral : styles.marigold) : ''}`}></div>
            <div className={styles.schedCell}></div>
            
            <span className={styles.st}>10am</span>
            <div className={styles.schedCell}></div><div className={styles.schedCell}></div><div className={styles.schedCell}></div><div className={styles.schedCell}></div><div className={styles.schedCell}></div>
          </div>
          {hasConflict && <p style={{fontSize:'11px', color:'var(--ink-soft)', margin:'10px 0 0', lineHeight:1.4}}>El bloque coral marca el choque de horario entre tus dos materias del martes.</p>}
        </div>
      </aside>
    </div>
  );
}
