"use client";

import styles from "../CSS/ranking/ranking.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState } from "react";

const RANKING = [
  { pos: 1,  nombre: "María Ospina",     ciudad: "Villavicencio", puntos: 4820, entregas: 241, avatar: "MO", insignias: 6, racha: 42, tendencia: "up" },
  { pos: 2,  nombre: "Carlos Ríos",      ciudad: "Villavicencio", puntos: 4105, entregas: 198, avatar: "CR", insignias: 5, racha: 28, tendencia: "up" },
  { pos: 3,  nombre: "Luisa Moreno",     ciudad: "Villavicencio", puntos: 3780, entregas: 175, avatar: "LM", insignias: 5, racha: 35, tendencia: "down" },
  { pos: 4,  nombre: "Andrés Castro",    ciudad: "Villavicencio", puntos: 3240, entregas: 152, avatar: "AC", insignias: 4, racha: 14, tendencia: "up" },
  { pos: 5,  nombre: "Sandra Peña",      ciudad: "Villavicencio", puntos: 2980, entregas: 139, avatar: "SP", insignias: 4, racha: 21, tendencia: "same" },
  { pos: 6,  nombre: "Felipe Torres",    ciudad: "Villavicencio", puntos: 2740, entregas: 128, avatar: "FT", insignias: 3, racha: 10, tendencia: "up" },
  { pos: 7,  nombre: "Diana Gómez",      ciudad: "Villavicencio", puntos: 2510, entregas: 115, avatar: "DG", insignias: 3, racha: 18, tendencia: "down" },
  { pos: 8,  nombre: "Jorge Vargas",     ciudad: "Villavicencio", puntos: 2290, entregas: 104, avatar: "JV", insignias: 3, racha: 7,  tendencia: "same" },
  { pos: 9,  nombre: "Valentina Cruz",   ciudad: "Villavicencio", puntos: 2105, entregas: 97,  avatar: "VC", insignias: 2, racha: 12, tendencia: "up" },
  { pos: 10, nombre: "Roberto Niño",     ciudad: "Villavicencio", puntos: 1890, entregas: 88,  avatar: "RN", insignias: 2, racha: 9,  tendencia: "down" },
  // Usuario actual fuera del top 10
  { pos: 12, nombre: "Juan García",      ciudad: "Villavicencio", puntos: 1240, entregas: 47,  avatar: "JG", insignias: 3, racha: 7,  tendencia: "up", esYo: true },
];

const MEDALLAS = ["🥇", "🥈", "🥉"];

const COLORES_PODIO = [
  "#f4c542", // oro
  "#c0c0c0", // plata
  "#cd7f32", // bronce
];

type Periodo = "semana" | "mes" | "total";

export default function RankingPage() {
  const [periodo, setPeriodo] = useState<Periodo>("total");
  const [hovered, setHovered] = useState<number | null>(null);

  const top10 = RANKING.filter((r) => !r.esYo).slice(0, 10);
  const yo = RANKING.find((r) => r.esYo);

  const maxPuntos = top10[0].puntos;

  return (
    <>
      <Header currentPage="ranking" />
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div>
              <h1 className={styles.pageTitle}>Ranking Verde</h1>
              <p className={styles.pageSubtitle}>Los 10 recicladores más activos de Villavicencio</p>
            </div>
            <div className={styles.periodoSwitch}>
              {(["semana", "mes", "total"] as Periodo[]).map((p) => (
                <button key={p} className={`${styles.periodoBtn} ${periodo === p ? styles.periodoBtnActive : ""}`}
                  onClick={() => setPeriodo(p)}>
                  {p === "semana" ? "Esta semana" : p === "mes" ? "Este mes" : "Histórico"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.layout}>

          {/* PODIO TOP 3 */}
          <div className={styles.podioSection}>
            <div className={styles.podioWrap}>
              {/* 2do */}
              <div className={styles.podioItem} data-pos="2">
                <div className={styles.podioAvatar} style={{ borderColor: COLORES_PODIO[1] }}>
                  {top10[1].avatar}
                </div>
                <div className={styles.podioMedalla}>🥈</div>
                <div className={styles.podioNombre}>{top10[1].nombre}</div>
                <div className={styles.podioPuntos}>{top10[1].puntos.toLocaleString()}</div>
                <div className={styles.podioPedestal} style={{ background: COLORES_PODIO[1], height: 90 }}>
                  <span className={styles.pedestalNum}>2</span>
                </div>
              </div>

              {/* 1ro */}
              <div className={styles.podioItem} data-pos="1">
                <div className={styles.podioAura} />
                <div className={styles.podioAvatar} style={{ borderColor: COLORES_PODIO[0], width: 72, height: 72, fontSize: 22 }}>
                  {top10[0].avatar}
                </div>
                <div className={styles.podioMedalla} style={{ fontSize: 28 }}>🥇</div>
                <div className={styles.podioNombre} style={{ fontWeight: 700, fontSize: 16 }}>{top10[0].nombre}</div>
                <div className={styles.podioPuntos} style={{ fontSize: 20 }}>{top10[0].puntos.toLocaleString()}</div>
                <div className={styles.podioPedestal} style={{ background: COLORES_PODIO[0], height: 130 }}>
                  <span className={styles.pedestalNum}>1</span>
                </div>
              </div>

              {/* 3ro */}
              <div className={styles.podioItem} data-pos="3">
                <div className={styles.podioAvatar} style={{ borderColor: COLORES_PODIO[2] }}>
                  {top10[2].avatar}
                </div>
                <div className={styles.podioMedalla}>🥉</div>
                <div className={styles.podioNombre}>{top10[2].nombre}</div>
                <div className={styles.podioPuntos}>{top10[2].puntos.toLocaleString()}</div>
                <div className={styles.podioPedestal} style={{ background: COLORES_PODIO[2], height: 68 }}>
                  <span className={styles.pedestalNum}>3</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA COMPLETA */}
          <div className={styles.tablaSection}>

            {/* Encabezado */}
            <div className={styles.tablaHeader}>
              <span className={styles.thPos}>#</span>
              <span className={styles.thUsuario}>Usuario</span>
              <span className={styles.thBarra}>Progreso</span>
              <span className={styles.thPuntos}>EcoPuntos</span>
              <span className={styles.thEntregas}>Entregas</span>
              <span className={styles.thRacha}>Racha</span>
            </div>

            {/* Filas top 10 */}
            {top10.map((user, i) => {
              const barPct = (user.puntos / maxPuntos) * 100;
              const isTop3 = i < 3;
              return (
                <div key={user.pos}
                  className={`${styles.tablaFila} ${isTop3 ? styles.filaDestacada : ""} ${hovered === user.pos ? styles.filaHovered : ""}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onMouseEnter={() => setHovered(user.pos)}
                  onMouseLeave={() => setHovered(null)}>

                  <div className={styles.tdPos}>
                    {i < 3 ? (
                      <span className={styles.medalla} style={{ background: COLORES_PODIO[i] }}>{i + 1}</span>
                    ) : (
                      <span className={styles.posNum}>{user.pos}</span>
                    )}
                  </div>

                  <div className={styles.tdUsuario}>
                    <div className={styles.filaAvatar} style={{ background: isTop3 ? COLORES_PODIO[i] : undefined }}>
                      {user.avatar}
                    </div>
                    <div>
                      <div className={styles.filaNombre}>{user.nombre}</div>
                      <div className={styles.filaCiudad}>📍 {user.ciudad}</div>
                    </div>
                  </div>

                  <div className={styles.tdBarra}>
                    <div className={styles.barraWrap}>
                      <div className={styles.barraFill}
                        style={{ width: `${barPct}%`, background: isTop3 ? COLORES_PODIO[i] : "var(--verde-medio)" }} />
                    </div>
                  </div>

                  <div className={styles.tdPuntos}>
                    <span className={styles.puntosVal}>{user.puntos.toLocaleString()}</span>
                    <span className={styles.puntosUnidad}>pts</span>
                  </div>

                  <div className={styles.tdEntregas}>{user.entregas}</div>

                  <div className={styles.tdRacha}>
                    <span className={styles.rachaIcon}>🔥</span>
                    {user.racha}d
                  </div>
                </div>
              );
            })}

            {/* Separador "tu posición" */}
            {yo && (
              <>
                <div className={styles.separador}>
                  <div className={styles.separadorLinea} />
                  <span>Tu posición</span>
                  <div className={styles.separadorLinea} />
                </div>

                <div className={`${styles.tablaFila} ${styles.filaMia}`} style={{ animationDelay: "0.65s" }}>
                  <div className={styles.tdPos}>
                    <span className={styles.posNum}>{yo.pos}</span>
                  </div>
                  <div className={styles.tdUsuario}>
                    <div className={styles.filaAvatar} style={{ background: "var(--verde-medio)" }}>
                      {yo.avatar}
                    </div>
                    <div>
                      <div className={styles.filaNombre}>{yo.nombre} <span className={styles.tuChip}>Tú</span></div>
                      <div className={styles.filaCiudad}>📍 {yo.ciudad}</div>
                    </div>
                  </div>
                  <div className={styles.tdBarra}>
                    <div className={styles.barraWrap}>
                      <div className={styles.barraFill} style={{ width: `${(yo.puntos / maxPuntos) * 100}%`, background: "var(--verde-medio)" }} />
                    </div>
                  </div>
                  <div className={styles.tdPuntos}>
                    <span className={styles.puntosVal}>{yo.puntos.toLocaleString()}</span>
                    <span className={styles.puntosUnidad}>pts</span>
                  </div>
                  <div className={styles.tdEntregas}>{yo.entregas}</div>
                  <div className={styles.tdRacha}><span className={styles.rachaIcon}>🔥</span>{yo.racha}d</div>
                </div>

                <div className={styles.metaChip}>
                  <span>🎯</span>
                  Necesitas <strong>{(top10[9].puntos - yo.puntos + 1).toLocaleString()} puntos</strong> más para entrar al top 10
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}