"use client";

import React, { useState, useTransition } from "react";
import styles from "./cita-psicologia.module.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, MapPin, Video, Check, Loader2, Sparkles } from "lucide-react";
import { solicitarCita } from "@/server/psicologia/actions";
import type { CitaDelEstudiante, PsicologoAsignado } from "@/server/psicologia/types";

export function CitaPsicologiaClient({
  locale,
  mias = [],
  psicologo = null,
}: {
  locale: string;
  mias?: CitaDelEstudiante[];
  psicologo?: PsicologoAsignado | null;
}) {
  const [modality, setModality] = useState<string>("presencial");
  const [motivo, setMotivo] = useState<string>("Estrés académico");
  const [counselor, setCounselor] = useState<string>(psicologo?.nombre ? "AS" : "MG");
  const [time, setTime] = useState<string>("11:00 a.m.");
  const [fecha, setFecha] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );
  const [enviado, setEnviado] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const motivos = [
    "Estrés académico",
    "Ansiedad",
    "Manejo del tiempo",
    "Orientación vocacional",
    "Relaciones y familia",
    "Prefiero no decirlo",
  ];

  const times = [
    { label: "09:00 a.m.", taken: false },
    { label: "10:00 a.m.", taken: false },
    { label: "11:00 a.m.", taken: false },
    { label: "01:00 p.m.", taken: false },
    { label: "02:00 p.m.", taken: false },
    { label: "03:00 p.m.", taken: false },
  ];

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        const motivoCompleto = `[${modality.toUpperCase()}] ${motivo}`;
        await solicitarCita({
          fecha,
          hora: time,
          motivo: motivoCompleto,
        });
        setEnviado(true);
      } catch (err: any) {
        setError(err.message || "No se pudo agendar la cita. Inténtalo de nuevo.");
      }
    });
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.trustBanner}>
          <div className={styles.ic}>
            <Heart />
          </div>
          <div>
            <strong>Este espacio es privado y confidencial</strong>
            <p>
              Tu cita y lo que converses con el equipo de psicología no aparecen en tu expediente
              académico ni son visibles para profesores o administración. Solo tú y tu consejero/a
              tienen acceso.
            </p>
          </div>
        </div>

        <div className={styles.pageHead}>
          <span className={styles.eyebrow}>Bienestar Estudiantil</span>
          <h1>Agenda tu cita de psicología</h1>
          <p>Elige cómo, con quién y cuándo te gustaría conversar.</p>
        </div>

        {enviado ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
              ¡Tu cita ha sido solicitada con éxito!
            </div>
            <p className="text-sm">
              Hemos registrado tu solicitud para el <strong>{fecha}</strong> a las{" "}
              <strong>{time}</strong> ({modality}). El profesional asignado confirmará tu horario a la brevedad.
            </p>
            <button
              onClick={() => setEnviado(false)}
              className="mt-2 text-xs font-semibold underline hover:text-emerald-950"
            >
              Agendar otra cita
            </button>
          </div>
        ) : (
          <>
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
                {motivos.map((m) => (
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
                {psicologo ? (
                  <div className={`${styles.counselorCard} ${styles.selected}`}>
                    <div className={styles.cAvatar}>
                      {psicologo.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div className={styles.cInfo}>
                      <strong>{psicologo.nombre}</strong>
                      <span>Tu profesional de psicología asignado/a</span>
                    </div>
                    <div className={styles.cPick}>
                      <Check />
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`${styles.counselorCard} ${counselor === "MG" ? styles.selected : ""}`}
                      onClick={() => setCounselor("MG")}
                    >
                      <div className={styles.cAvatar}>MG</div>
                      <div className={styles.cInfo}>
                        <strong>Lcda. Mariela Guzmán</strong>
                        <span>Psicología clínica · Ansiedad y estrés académico</span>
                      </div>
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
                      <div className={styles.cPick}>
                        <Check />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.stepSection} style={{ marginBottom: 0 }}>
              <div className={styles.stepLabel}>
                <span className={styles.stepNum}>4</span>
                <strong>Elige fecha y hora</strong>
              </div>
              <div className={styles.panel} style={{ padding: "20px 22px" }}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de la cita:
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <div className={styles.timeRow}>
                  {times.map((t) => (
                    <span
                      key={t.label}
                      className={`${styles.timeChip} ${time === t.label ? styles.selected : ""} ${t.taken ? styles.taken : ""}`}
                      onClick={() => !t.taken && setTime(t.label)}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <aside className={styles.side}>
        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Resumen de tu cita</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Modalidad</span>
            <span>{modality === "presencial" ? "Presencial" : "Virtual"}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Motivo</span>
            <span>{motivo}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Consejero/a</span>
            <span>
              {psicologo?.nombre ??
                (counselor === "MG" ? "Lcda. Mariela Guzmán" : "Lic. Rafael Tavárez")}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span>Fecha</span>
            <span>
              {fecha}, {time}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span>Lugar</span>
            <span>{modality === "presencial" ? "Bienestar Estudiantil" : "Online"}</span>
          </div>

          {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

          <button
            className={styles.confirmBtn}
            disabled={!time || isPending || enviado}
            onClick={handleConfirm}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isPending ? "Agendando..." : "Confirmar cita"}
          </button>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>Tus citas registradas</strong>
          </div>
          {mias.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">Todavía no has agendado citas.</p>
          ) : (
            mias.map((c) => (
              <div key={c.id} className={styles.pastItem}>
                <div className={styles.dlDate}>
                  <span className={styles.d}>{c.fecha.split("-")[2] ?? "01"}</span>
                  <span className={styles.m}>{c.fecha.split("-")[1] ?? "MMM"}</span>
                </div>
                <div>
                  <strong>{c.psicologo_nombre ?? "Bienestar Estudiantil"}</strong>
                  <span className="capitalize">
                    {c.estado} · {c.hora ?? "Hora por confirmar"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideHead}>
            <strong>¿Necesitas hablar antes de tu cita?</strong>
          </div>
          <p style={{ fontSize: "12px", color: "var(--ink-soft)", lineHeight: 1.55, margin: 0 }}>
            Si algo se siente urgente, puedes escribir directo a la línea de Bienestar Estudiantil
            o pasar por la oficina — no tienes que esperar a tu horario agendado.
          </p>
        </div>
      </aside>
    </div>
  );
}

