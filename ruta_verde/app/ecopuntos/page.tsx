"use client";

import styles from "../CSS/ecopuntos/ecopuntos.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState } from "react";

const HISTORIAL = [
  { id: 1, tipo: "Plástico PET",    emoji: "♻️", puntos: +15, fecha: "Hoy, 10:42 am",          lugar: "EcoPunto Macarena" },
  { id: 2, tipo: "Cartón",          emoji: "📦", puntos: +10, fecha: "Hoy, 9:15 am",            lugar: "ReciclaYa Suria" },
  { id: 3, tipo: "Vidrio",          emoji: "🍶", puntos: +20, fecha: "Ayer, 4:30 pm",            lugar: "EcoPunto Universidad" },
  { id: 4, tipo: "Metal / Lata",    emoji: "🥫", puntos: +25, fecha: "Ayer, 11:00 am",          lugar: "Verde Centro Comercial" },
  { id: 5, tipo: "Plástico PET",    emoji: "♻️", puntos: +15, fecha: "Lun 31 Mar, 3:20 pm",     lugar: "EcoPunto Bello Horizonte" },
  { id: 6, tipo: "Orgánico",        emoji: "🌿", puntos: +8,  fecha: "Lun 31 Mar, 8:10 am",     lugar: "ReciclaYa Suria" },
  { id: 7, tipo: "Cartón",          emoji: "📦", puntos: +10, fecha: "Dom 30 Mar, 5:00 pm",     lugar: "Punto Verde La Serranía" },
  { id: 8, tipo: "Metal / Lata",    emoji: "🥫", puntos: +25, fecha: "Sáb 29 Mar, 2:15 pm",    lugar: "ReciclaVerde La Grama" },
];

const INSIGNIAS = [
  { id: 1,  emoji: "🌱", nombre: "Primer paso",        desc: "Primera entrega realizada",  desbloqueada: true  },
  { id: 2,  emoji: "🔥", nombre: "En racha",           desc: "7 días seguidos reciclando", desbloqueada: true  },
  { id: 3,  emoji: "♻️", nombre: "Reciclador Pro",     desc: "50 entregas completadas",    desbloqueada: true  },
  { id: 4,  emoji: "🏆", nombre: "Reciclador Experto", desc: "100 entregas completadas",   desbloqueada: false },
  { id: 5,  emoji: "🌿", nombre: "Guardián del bosque",desc: "500 kg reciclados",          desbloqueada: false },
  { id: 6,  emoji: "⭐", nombre: "Estrella Verde",     desc: "Top 10 del ranking",         desbloqueada: false },
];

const RECOMPENSAS = [
  { id: 1, emoji: "☕", nombre: "Café gratis",         costo: 200,  disponible: true  },
  { id: 2, emoji: "🛒", nombre: "Descuento 10%",       costo: 500,  disponible: true  },
  { id: 3, emoji: "🌳", nombre: "Siembra un árbol",    costo: 800,  disponible: false },
  { id: 4, emoji: "🎁", nombre: "Caja sorpresa eco",   costo: 1500, disponible: false },
];

const PUNTOS_TOTALES = 1240;
const META = 1500;
const NIVEL = "Reciclador Activo";
const NIVEL_SIGUIENTE = "Reciclador Experto";

export default function EcoPuntosPage() {
  const [tab, setTab] = useState<"historial" | "insignias" | "recompensas">("historial");

  const progreso = Math.min((PUNTOS_TOTALES / META) * 100, 100);

  return (
    <>
      <Header currentPage="ecopuntos" />
      <main className={styles.main}>

        {/* Hero de puntos */}
        <div className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroInner}>

            {/* Avatar y nivel */}
            <div className={styles.perfil}>
              <div className={styles.avatar}>JG</div>
              <div>
                <div className={styles.nivel}>
                  <span className={styles.nivelDot} />
                  {NIVEL}
                </div>
                <h1 className={styles.nombreUsuario}>Juan García</h1>
                <p className={styles.ciudadUsuario}>📍 Villavicencio, Meta</p>
              </div>
            </div>

            {/* Puntos grandes */}
            <div className={styles.puntosGrande}>
              <div className={styles.puntosNumero}>{PUNTOS_TOTALES.toLocaleString()}</div>
              <div className={styles.puntosLabel}>EcoPuntos acumulados</div>

              {/* Barra de progreso al siguiente nivel */}
              <div className={styles.progresoWrap}>
                <div className={styles.progresoLabel}>
                  <span>Hacia {NIVEL_SIGUIENTE}</span>
                  <span>{PUNTOS_TOTALES} / {META} pts</span>
                </div>
                <div className={styles.progresoBar}>
                  <div className={styles.progresoFill} style={{ width: `${progreso}%` }} />
                </div>
              </div>
            </div>

            {/* Stats rápidos */}
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>47</span>
                <span className={styles.heroStatLabel}>Entregas</span>
              </div>
              <div className={styles.heroStatDiv} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>3</span>
                <span className={styles.heroStatLabel}>Insignias</span>
              </div>
              <div className={styles.heroStatDiv} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>#12</span>
                <span className={styles.heroStatLabel}>Ranking</span>
              </div>
              <div className={styles.heroStatDiv} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>7</span>
                <span className={styles.heroStatLabel}>Días racha</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impacto ambiental */}
        <div className={styles.impactoBar}>
          <div className={styles.impactoInner}>
            <span className={styles.impactoTitle}>Tu impacto ambiental</span>
            <div className={styles.impactoItems}>
              {[
                { emoji: "🌿", val: "94 kg", label: "Residuos reciclados" },
                { emoji: "☁️", val: "0.47 ton", label: "CO₂ evitado" },
                { emoji: "🌳", val: "24", label: "Árboles equivalentes" },
                { emoji: "💧", val: "1.2 m³", label: "Agua ahorrada" },
              ].map((i) => (
                <div key={i.label} className={styles.impactoItem}>
                  <span>{i.emoji}</span>
                  <strong>{i.val}</strong>
                  <small>{i.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido con tabs */}
        <div className={styles.container}>

          {/* Tabs */}
          <div className={styles.tabs}>
            {(["historial", "insignias", "recompensas"] as const).map((t) => (
              <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
                onClick={() => setTab(t)}>
                {t === "historial" && "📋 Historial"}
                {t === "insignias" && "🏅 Insignias"}
                {t === "recompensas" && "🎁 Recompensas"}
              </button>
            ))}
          </div>

          {/* HISTORIAL */}
          {tab === "historial" && (
            <div className={styles.historialWrap}>
              <div className={styles.historialList}>
                {HISTORIAL.map((h, i) => (
                  <div key={h.id} className={styles.historialItem} style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className={styles.historialEmoji}>{h.emoji}</div>
                    <div className={styles.historialInfo}>
                      <div className={styles.historialTipo}>{h.tipo}</div>
                      <div className={styles.historialMeta}>{h.fecha} · {h.lugar}</div>
                    </div>
                    <div className={styles.historialPuntos}>+{h.puntos}</div>
                  </div>
                ))}
              </div>
              <div className={styles.historialResumen}>
                <h3 className={styles.resumenTitle}>Esta semana</h3>
                <div className={styles.resumenGrid}>
                  {[
                    { label: "Entregas", val: "8" },
                    { label: "Puntos ganados", val: "+128" },
                    { label: "Mejor día", val: "Lunes" },
                    { label: "Tipo más frecuente", val: "Plástico" },
                  ].map((r) => (
                    <div key={r.label} className={styles.resumenItem}>
                      <span className={styles.resumenVal}>{r.val}</span>
                      <span className={styles.resumenLabel}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INSIGNIAS */}
          {tab === "insignias" && (
            <div className={styles.insigniasGrid}>
              {INSIGNIAS.map((ins, i) => (
                <div key={ins.id} className={`${styles.insigniaCard} ${!ins.desbloqueada ? styles.bloqueada : ""}`}
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className={styles.insigniaEmoji}>{ins.emoji}</div>
                  <div className={styles.insigniaNombre}>{ins.nombre}</div>
                  <div className={styles.insigniaDesc}>{ins.desc}</div>
                  {!ins.desbloqueada && (
                    <div className={styles.lockIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  )}
                  {ins.desbloqueada && <div className={styles.checkIcon}>✓</div>}
                </div>
              ))}
            </div>
          )}

          {/* RECOMPENSAS */}
          {tab === "recompensas" && (
            <div className={styles.recompensasWrap}>
              <div className={styles.saldoChip}>
                <span>💰</span>
                <strong>{PUNTOS_TOTALES.toLocaleString()} pts disponibles</strong>
              </div>
              <div className={styles.recompensasGrid}>
                {RECOMPENSAS.map((r, i) => (
                  <div key={r.id} className={`${styles.recompensaCard} ${!r.disponible ? styles.recompensaBloqueada : ""}`}
                    style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className={styles.recompensaEmoji}>{r.emoji}</div>
                    <div className={styles.recompensaNombre}>{r.nombre}</div>
                    <div className={styles.recompensaCosto}>{r.costo} pts</div>
                    <button className={`${styles.btnCanjear} ${!r.disponible ? styles.btnBloqueado : ""}`}
                      disabled={!r.disponible || PUNTOS_TOTALES < r.costo}>
                      {r.disponible && PUNTOS_TOTALES >= r.costo ? "Canjear" : r.disponible ? "Puntos insuficientes" : "Pronto disponible"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}