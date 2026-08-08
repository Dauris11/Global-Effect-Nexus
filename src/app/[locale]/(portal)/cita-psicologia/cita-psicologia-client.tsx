"use client";

import React, { useState } from "react";
import styles from "./cita-psicologia.module.css";
import { format } from "date-fns";
import { Heart, User, MapPin, Video, Check, ArrowRight } from "lucide-react";

export function CitaPsicologiaClient({ locale }: { locale: string }) {
  const [modality, setModality] = useState<string>("presencial");
  const [motivo, setMotivo] = useState<string>("Estrés académico");
  const [counselor, setCounselor] = useState<string>("MG");
  const [time, setTime] = useState<string>("11:00 a.m.");

  const motivos = [
    "Estrés académico", "Ansiedad", "Manejo del tiempo", 
    "Orientación vocacional", "Relaciones y familia", "Prefiero no decirlo"
  ];
  
  const times = [
    { label: "9:00 a.m.", taken: true },
    { label: "10:00 a.m.", taken: false },
    { label: "11:00 a.m.", taken: false },
    { label: "1:00 p.m.", taken: false },
    { label: "2:00 p.m.", taken: true },
    { label: "3:00 p.m.", taken: false },
  ];

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.trustBanner}>
          <div className={styles.ic}>
            <Heart />
          </div>
          <div>
            <strong>Este espacio es privado</strong>
            <p>Tu cita y lo que converses con el equipo de psicología no aparecen en tu expediente académico ni son visibles para profesores o administración. Solo tú y tu consejero/a tienen acceso.</p>
          </div>
        </div>

        <div className={styles.pageHead}>
          <span className={styles.eyebrow}>Portal de Psicología</span>
          <h1>Agenda tu cita</h1>
          <p>Elige cómo, con quién y cuándo te gustaría conversar.</p>
        </div>

        <div className={styles.stepSection}>
          <div className={styles.stepLabel}>
            <span className={styles.stepNum}>1</span>
            <strong>¿Cómo prefieres tu sesión?</strong>
          </div>
          <div className={styles.modalityRow}>
            <div 
              className={`${styles.modalityCard} ${modality === "presencial" ? styles.selected : ""}`}
              onClick={() => setModality("presencial")}
            >
              <MapPin />
              <div>
                <strong>Presencial</strong>
                <span>Oficina de Bienestar Estudiantil</span>
              </div>
            </div>
            <div 
              className={`${styles.modalityCard} ${modality === "virtual" ? styles.selected : ""}`}
              onClick={() => setModality("virtual")}
            >
              <Video />
              <div>
                <strong>Virtual</strong>
                <span>Videollamada, enlace por correo</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.stepSection}>
          <div className={styles.stepLabel}>
            <span className={styles.stepNum}>2</span>
            <strong>¿Sobre qué te gustaría conversar? (opcional)</strong>
          </div>
          <div className={styles.motivoRow}>
            {motivos.map(m => (
              <span 
                key={m} 
                className={`${styles.motivoChip} ${motivo === m ? styles.selected : ""}`}
                onClick={() => setMotivo(m)}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.stepSection}>
          <div className={styles.stepLabel}>
            <span className={styles.stepNum}>3</span>
            <strong>Elige a tu consejero/a</strong>
          </div>
          <div className={styles.counselorRow}>
            <div 
              className={`${styles.counselorCard} ${counselor === "MG" ? styles.selected : ""}`}
              onClick={() => setCounselor("MG")}
            >
              <div className={styles.cAvatar}>MG</div>
              <div className={styles.cInfo}>
                <strong>Lcda. Mariela Guzmán</strong>
                <span>Psicología clínica · Ansiedad y estrés académico</span>
              </div>
              <span className={styles.cNext}>Próximo cupo: mañana</span>
              <div className={styles.cPick}>
                <Check />
              </div>
            </div>
            <div 
              className={`${styles.counselorCard} ${counselor === "RT" ? styles.selected : ""}`}
              onClick={() => setCounselor("RT")}
            >
              <div className={styles.cAvatar}>RT</div>
              <div className={styles.cInfo}>
                <strong>Lic. Rafael Tavárez</strong>
                <span>Orientación vocacional · Relaciones interpersonales</span>
              </div>
              <span className={styles.cNext}>Próximo cupo: jue 13</span>
              <div className={styles.cPick}>
                <Check />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.stepSection} style={{ marginBottom: 0 }}>
          <div className={styles.stepLabel}>
            <span className={styles.stepNum}>4</span>
            <strong>Elige fecha y hora</strong>
          </div>
          <div className={styles.panel} style={{ padding: "20px 22px" }}>
            <div className={styles.timeRow}>
              {times.map(t => (
                <span 
                  key={t.label} 
                  className={`${styles.timeChip} ${time === t.label ? styles.selected : ""} ${t.taken ? styles.taken : ""}`}
                  onClick={() => !t.taken && setTime(t.label)}
                >
                  {t.label}
                </span>
              ))}
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--ink-soft)", margin: "12px 0 0" }}>
              Mostrando disponibilidad de {counselor === "MG" ? "Lcda. Guzmán" : "Lic. Tavárez"} para mañana, viernes 9 de agosto.
            </p>
          </div>
        </div>
      </main>

      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Resumen de tu cita</strong></div>
          <div className={styles.summaryRow}><span>Modalidad</span><span>{modality === "presencial" ? "Presencial" : "Virtual"}</span></div>
          <div className={styles.summaryRow}><span>Motivo</span><span>{motivo}</span></div>
          <div className={styles.summaryRow}><span>Consejera</span><span>{counselor === "MG" ? "Lcda. Mariela Guzmán" : "Lic. Rafael Tavárez"}</span></div>
          <div className={styles.summaryRow}><span>Fecha</span><span>Vie 9 ago, {time}</span></div>
          <div className={styles.summaryRow}><span>Lugar</span><span>{modality === "presencial" ? "Bienestar Estudiantil" : "Online"}</span></div>
          <button className={styles.confirmBtn} disabled={!time}>
            <Check />
            Confirmar cita
          </button>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>Tus citas anteriores</strong></div>
          <div className={styles.pastItem}>
            <div className={styles.dlDate}><span className={styles.d}>14</span><span className={styles.m}>Jul</span></div>
            <div>
              <strong>Sesión con Lcda. Guzmán</strong>
              <span>Completada · notas privadas</span>
            </div>
          </div>
          <div className={styles.pastItem}>
            <div className={styles.dlDate}><span className={styles.d}>02</span><span className={styles.m}>Jun</span></div>
            <div>
              <strong>Sesión con Lcda. Guzmán</strong>
              <span>Completada · notas privadas</span>
            </div>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}><strong>¿Necesitas hablar antes de tu cita?</strong></div>
          <p style={{ fontSize: "12px", color: "var(--ink-soft)", lineHeight: 1.55, margin: 0 }}>
            Si algo se siente urgente, puedes escribir directo a la línea de Bienestar Estudiantil o pasar por la oficina — no tienes que esperar a tu horario agendado.
          </p>
        </div>
      </aside>
    </div>
  );
}
