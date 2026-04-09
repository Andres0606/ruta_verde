"use client";

import styles from "../CSS/ranking/ranking.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface RankingUser {
  id: number;
  nombre: string;
  avatar_url: string | null;
  puntos_actuales: number;
  nivel: number;
  email: string;
}

interface UsuarioActual extends RankingUser {
  puesto: number;
}

interface EstadisticaMaquina {
  id: number;
  nombre: string;
  comuna: string;
  total_entregas: number;
  puntos_otorgados: number;
}

interface EstadisticaComuna {
  comuna: string;
  total_entregas: number;
  total_puntos: number;
  usuarios_activos: number;
}

type Periodo = "semana" | "mes" | "total";

export default function RankingPage() {
  const [periodo, setPeriodo] = useState<Periodo>("total");
  const [hovered, setHovered] = useState<number | null>(null);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual | null>(null);
  const [cargando, setCargando] = useState(true);
  const [totalResiduos, setTotalResiduos] = useState<{ [key: number]: number }>({});
  const [estadisticasMaquinas, setEstadisticasMaquinas] = useState<EstadisticaMaquina[]>([]);
  const [estadisticasComunas, setEstadisticasComunas] = useState<EstadisticaComuna[]>([]);
  const [vistaEstadisticas, setVistaEstadisticas] = useState<"maquinas" | "comunas">("maquinas");

  useEffect(() => {
    cargarRanking();
    cargarUsuarioActual();
    cargarEstadisticasMaquinas();
    cargarEstadisticasComunas();
  }, [periodo]);

  const cargarRanking = async () => {
    setCargando(true);
    
    const { data: users, error } = await supabase
      .from("users")
      .select("id, nombre, avatar_url, puntos_actuales, nivel, email")
      .order("puntos_actuales", { ascending: false })
      .limit(50);
    
    if (error) {
      console.error("Error cargando ranking:", error);
    } else if (users) {
      setRanking(users);
      await cargarResiduosPorUsuario(users.map(u => u.id));
    }
    
    setCargando(false);
  };

  const cargarResiduosPorUsuario = async (usuarioIds: number[]) => {
    const { data, error } = await supabase
      .from("residuos")
      .select("usuario_id")
      .in("usuario_id", usuarioIds);
    
    if (error) {
      console.error("Error cargando residuos:", error);
    } else if (data) {
      const conteo: { [key: number]: number } = {};
      data.forEach(r => {
        conteo[r.usuario_id] = (conteo[r.usuario_id] || 0) + 1;
      });
      setTotalResiduos(conteo);
    }
  };

  const cargarUsuarioActual = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;
    
    const { data: user, error } = await supabase
      .from("users")
      .select("id, nombre, avatar_url, puntos_actuales, nivel, email")
      .eq("auth_uuid", session.user.id)
      .single();
    
    if (error) {
      console.error("Error cargando usuario actual:", error);
    } else if (user) {
      const { data: puestoData } = await supabase
        .from("users")
        .select("id")
        .gt("puntos_actuales", user.puntos_actuales || 0);
      
      const puesto = (puestoData?.length || 0) + 1;
      setUsuarioActual({ ...user, puesto });
    }
  };

  const cargarEstadisticasMaquinas = async () => {
    // Obtener todas las entregas con información de puntos de reciclaje
    const { data: entregas, error } = await supabase
      .from("entregas")
      .select(`
        punto_reciclaje_id,
        residuo_id,
        residuos:residuo_id (puntos_otorgados)
      `)
      .eq("estado_entrega", "verificada");

    if (error) {
      console.error("Error cargando estadísticas de máquinas:", error);
      return;
    }

    // Obtener información de los puntos de reciclaje
    const { data: puntosReciclaje } = await supabase
      .from("puntos_reciclaje")
      .select("id, nombre, Comuna");

    if (!puntosReciclaje) return;

    // Calcular estadísticas por máquina
    const maquinasMap = new Map<number, { nombre: string; comuna: string; total_entregas: number; puntos_otorgados: number }>();
    
    puntosReciclaje.forEach(p => {
      maquinasMap.set(p.id, {
        nombre: p.nombre,
        comuna: p.Comuna || "Sin comuna",
        total_entregas: 0,
        puntos_otorgados: 0,
      });
    });

    entregas?.forEach(entrega => {
      if (entrega.punto_reciclaje_id && maquinasMap.has(entrega.punto_reciclaje_id)) {
        const maquina = maquinasMap.get(entrega.punto_reciclaje_id)!;
        maquina.total_entregas++;
        maquina.puntos_otorgados += (entrega.residuos as any)?.puntos_otorgados || 0;
      }
    });

    const estadisticas = Array.from(maquinasMap.entries())
      .map(([id, data]) => ({
        id,
        nombre: data.nombre,
        comuna: data.comuna,
        total_entregas: data.total_entregas,
        puntos_otorgados: data.puntos_otorgados,
      }))
      .filter(m => m.total_entregas > 0)
      .sort((a, b) => b.total_entregas - a.total_entregas);

    setEstadisticasMaquinas(estadisticas);
  };

  const cargarEstadisticasComunas = async () => {
    // Obtener todas las entregas con información de comunas
    const { data: entregas, error } = await supabase
      .from("entregas")
      .select(`
        id_comuna,
        residuo_id,
        residuos:residuo_id (puntos_otorgados, usuario_id),
        usuarios:usuario_id (id)
      `)
      .eq("estado_entrega", "verificada");

    if (error) {
      console.error("Error cargando estadísticas de comunas:", error);
      return;
    }

    // Calcular estadísticas por comuna
    const comunasMap = new Map<string, { total_entregas: number; total_puntos: number; usuarios: Set<number> }>();

    entregas?.forEach(entrega => {
      const comunaId = entrega.id_comuna?.toString() || "Sin comuna";
      
      if (!comunasMap.has(comunaId)) {
        comunasMap.set(comunaId, {
          total_entregas: 0,
          total_puntos: 0,
          usuarios: new Set(),
        });
      }

      const comuna = comunasMap.get(comunaId)!;
      comuna.total_entregas++;
      comuna.total_puntos += (entrega.residuos as any)?.puntos_otorgados || 0;
      
      if ((entrega.residuos as any)?.usuario_id) {
        comuna.usuarios.add((entrega.residuos as any).usuario_id);
      }
    });

    const estadisticas = Array.from(comunasMap.entries())
      .map(([comuna, data]) => ({
        comuna: comuna === "Sin comuna" ? "No especificada" : `Comuna ${comuna}`,
        total_entregas: data.total_entregas,
        total_puntos: data.total_puntos,
        usuarios_activos: data.usuarios.size,
      }))
      .sort((a, b) => b.total_entregas - a.total_entregas);

    setEstadisticasComunas(estadisticas);
  };

  const getAvatarIniciales = (nombre: string): string => {
    return nombre
      .split(" ")
      .map(p => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const top10 = ranking.slice(0, 10);
  const maxPuntos = top10[0]?.puntos_actuales || 0;
  const coloresPodio = ["#f4c542", "#c0c0c0", "#cd7f32"];

  if (cargando) {
    return (
      <>
        <Header currentPage="ranking" />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Cargando ranking...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header currentPage="ranking" />
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div>
              <h1 className={styles.pageTitle}>Ranking Verde</h1>
              <p className={styles.pageSubtitle}>
                Los {ranking.length} recicladores más activos de Villavicencio
              </p>
            </div>
            <div className={styles.periodoSwitch}>
              {(["semana", "mes", "total"] as Periodo[]).map((p) => (
                <button 
                  key={p} 
                  className={`${styles.periodoBtn} ${periodo === p ? styles.periodoBtnActive : ""}`}
                  onClick={() => setPeriodo(p)}
                >
                  {p === "semana" ? "Esta semana" : p === "mes" ? "Este mes" : "Histórico"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {top10.length === 0 ? (
          <div className={styles.vacioContainer}>
            <p>No hay usuarios registrados aún.</p>
            <p>¡Sé el primero en comenzar a reciclar!</p>
          </div>
        ) : (
          <>
            {/* Sección de Estadísticas de Máquinas y Comunas */}
            <div className={styles.estadisticasSection}>
              <div className={styles.estadisticasHeader}>
                <h2>📊 Estadísticas de Reciclaje</h2>
                <div className={styles.estadisticasTabs}>
                  <button
                    className={`${styles.tabBtn} ${vistaEstadisticas === "maquinas" ? styles.tabActive : ""}`}
                    onClick={() => setVistaEstadisticas("maquinas")}
                  >
                    🏪 Puntos de Reciclaje
                  </button>
                  <button
                    className={`${styles.tabBtn} ${vistaEstadisticas === "comunas" ? styles.tabActive : ""}`}
                    onClick={() => setVistaEstadisticas("comunas")}
                  >
                    📍 Por Comunas
                  </button>
                </div>
              </div>

              {vistaEstadisticas === "maquinas" ? (
                <div className={styles.estadisticasGrid}>
                  {estadisticasMaquinas.length === 0 ? (
                    <p className={styles.sinDatos}>No hay entregas registradas aún</p>
                  ) : (
                    estadisticasMaquinas.map((maquina, idx) => (
                      <div key={maquina.id} className={styles.estadisticaCard}>
                        <div className={styles.estadisticaRank}>#{idx + 1}</div>
                        <div className={styles.estadisticaInfo}>
                          <div className={styles.estadisticaNombre}>{maquina.nombre}</div>
                          <div className={styles.estadisticaComuna}>📍 {maquina.comuna}</div>
                          <div className={styles.estadisticaStats}>
                            <span>📦 {maquina.total_entregas} entregas</span>
                            <span>🏆 {maquina.puntos_otorgados} pts</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className={styles.estadisticasGrid}>
                  {estadisticasComunas.length === 0 ? (
                    <p className={styles.sinDatos}>No hay entregas registradas aún</p>
                  ) : (
                    estadisticasComunas.map((comuna, idx) => (
                      <div key={comuna.comuna} className={styles.estadisticaCard}>
                        <div className={styles.estadisticaRank}>#{idx + 1}</div>
                        <div className={styles.estadisticaInfo}>
                          <div className={styles.estadisticaNombre}>{comuna.comuna}</div>
                          <div className={styles.estadisticaStats}>
                            <span>📦 {comuna.total_entregas} entregas</span>
                            <span>🏆 {comuna.total_puntos} pts</span>
                            <span>👥 {comuna.usuarios_activos} usuarios</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* PODIO TOP 3 */}
            <div className={styles.podioSection}>
              <div className={styles.podioWrap}>
                {/* 2do lugar */}
                {top10[1] && (
                  <div className={styles.podioItem} data-pos="2">
                    <div className={styles.podioAvatar} style={{ borderColor: coloresPodio[1] }}>
                      {top10[1].avatar_url ? (
                        <img src={top10[1].avatar_url} alt={top10[1].nombre} className={styles.podioAvatarImg} />
                      ) : (
                        getAvatarIniciales(top10[1].nombre)
                      )}
                    </div>
                    <div className={styles.podioMedalla}>🥈</div>
                    <div className={styles.podioNombre}>{top10[1].nombre.split(" ")[0]}</div>
                    <div className={styles.podioPuntos}>{top10[1].puntos_actuales?.toLocaleString() || 0}</div>
                    <div className={styles.podioPedestal} style={{ background: coloresPodio[1], height: 90 }}>
                      <span className={styles.pedestalNum}>2</span>
                    </div>
                  </div>
                )}

                {/* 1er lugar */}
                {top10[0] && (
                  <div className={styles.podioItem} data-pos="1">
                    <div className={styles.podioAura} />
                    <div className={styles.podioAvatar} style={{ borderColor: coloresPodio[0], width: 72, height: 72, fontSize: 22 }}>
                      {top10[0].avatar_url ? (
                        <img src={top10[0].avatar_url} alt={top10[0].nombre} className={styles.podioAvatarImg} />
                      ) : (
                        getAvatarIniciales(top10[0].nombre)
                      )}
                    </div>
                    <div className={styles.podioMedalla} style={{ fontSize: 28 }}>🥇</div>
                    <div className={styles.podioNombre} style={{ fontWeight: 700, fontSize: 16 }}>{top10[0].nombre.split(" ")[0]}</div>
                    <div className={styles.podioPuntos} style={{ fontSize: 20 }}>{top10[0].puntos_actuales?.toLocaleString() || 0}</div>
                    <div className={styles.podioPedestal} style={{ background: coloresPodio[0], height: 130 }}>
                      <span className={styles.pedestalNum}>1</span>
                    </div>
                  </div>
                )}

                {/* 3er lugar */}
                {top10[2] && (
                  <div className={styles.podioItem} data-pos="3">
                    <div className={styles.podioAvatar} style={{ borderColor: coloresPodio[2] }}>
                      {top10[2].avatar_url ? (
                        <img src={top10[2].avatar_url} alt={top10[2].nombre} className={styles.podioAvatarImg} />
                      ) : (
                        getAvatarIniciales(top10[2].nombre)
                      )}
                    </div>
                    <div className={styles.podioMedalla}>🥉</div>
                    <div className={styles.podioNombre}>{top10[2].nombre.split(" ")[0]}</div>
                    <div className={styles.podioPuntos}>{top10[2].puntos_actuales?.toLocaleString() || 0}</div>
                    <div className={styles.podioPedestal} style={{ background: coloresPodio[2], height: 68 }}>
                      <span className={styles.pedestalNum}>3</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TABLA COMPLETA */}
            <div className={styles.tablaSection}>
              <div className={styles.tablaHeader}>
                <span className={styles.thPos}>#</span>
                <span className={styles.thUsuario}>Usuario</span>
                <span className={styles.thBarra}>Progreso</span>
                <span className={styles.thPuntos}>EcoPuntos</span>
                <span className={styles.thEntregas}>Entregas</span>
                <span className={styles.thNivel}>Nivel</span>
              </div>

              {top10.map((user, i) => {
                const barPct = maxPuntos > 0 ? (user.puntos_actuales / maxPuntos) * 100 : 0;
                const isTop3 = i < 3;
                return (
                  <div key={user.id}
                    className={`${styles.tablaFila} ${isTop3 ? styles.filaDestacada : ""} ${hovered === user.id ? styles.filaHovered : ""}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onMouseEnter={() => setHovered(user.id)}
                    onMouseLeave={() => setHovered(null)}>

                    <div className={styles.tdPos}>
                      {i < 3 ? (
                        <span className={styles.medalla} style={{ background: coloresPodio[i] }}>{i + 1}</span>
                      ) : (
                        <span className={styles.posNum}>{i + 1}</span>
                      )}
                    </div>

                    <div className={styles.tdUsuario}>
                      <div className={styles.filaAvatar} style={{ background: isTop3 ? coloresPodio[i] : "#74c69d" }}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.nombre} className={styles.filaAvatarImg} />
                        ) : (
                          getAvatarIniciales(user.nombre)
                        )}
                      </div>
                      <div>
                        <div className={styles.filaNombre}>{user.nombre}</div>
                        <div className={styles.filaCiudad}>📍 Villavicencio</div>
                      </div>
                    </div>

                    <div className={styles.tdBarra}>
                      <div className={styles.barraWrap}>
                        <div className={styles.barraFill}
                          style={{ width: `${barPct}%`, background: isTop3 ? coloresPodio[i] : "#74c69d" }} />
                      </div>
                    </div>

                    <div className={styles.tdPuntos}>
                      <span className={styles.puntosVal}>{user.puntos_actuales?.toLocaleString() || 0}</span>
                      <span className={styles.puntosUnidad}>pts</span>
                    </div>

                    <div className={styles.tdEntregas}>{totalResiduos[user.id] || 0}</div>

                    <div className={styles.tdNivel}>
                      <span className={styles.nivelBadge}>Nivel {user.nivel || 1}</span>
                    </div>
                  </div>
                );
              })}

              {/* Separador "tu posición" */}
              {usuarioActual && usuarioActual.puesto > 10 && (
                <>
                  <div className={styles.separador}>
                    <div className={styles.separadorLinea} />
                    <span>Tu posición</span>
                    <div className={styles.separadorLinea} />
                  </div>

                  <div className={`${styles.tablaFila} ${styles.filaMia}`} style={{ animationDelay: "0.65s" }}>
                    <div className={styles.tdPos}>
                      <span className={styles.posNum}>{usuarioActual.puesto}</span>
                    </div>
                    <div className={styles.tdUsuario}>
                      <div className={styles.filaAvatar} style={{ background: "#74c69d" }}>
                        {usuarioActual.avatar_url ? (
                          <img src={usuarioActual.avatar_url} alt={usuarioActual.nombre} className={styles.filaAvatarImg} />
                        ) : (
                          getAvatarIniciales(usuarioActual.nombre)
                        )}
                      </div>
                      <div>
                        <div className={styles.filaNombre}>
                          {usuarioActual.nombre} <span className={styles.tuChip}>Tú</span>
                        </div>
                        <div className={styles.filaCiudad}>📍 Villavicencio</div>
                      </div>
                    </div>
                    <div className={styles.tdBarra}>
                      <div className={styles.barraWrap}>
                        <div className={styles.barraFill} style={{ width: `${(usuarioActual.puntos_actuales / maxPuntos) * 100}%`, background: "#74c69d" }} />
                      </div>
                    </div>
                    <div className={styles.tdPuntos}>
                      <span className={styles.puntosVal}>{usuarioActual.puntos_actuales?.toLocaleString() || 0}</span>
                      <span className={styles.puntosUnidad}>pts</span>
                    </div>
                    <div className={styles.tdEntregas}>{totalResiduos[usuarioActual.id] || 0}</div>
                    <div className={styles.tdNivel}>
                      <span className={styles.nivelBadge}>Nivel {usuarioActual.nivel || 1}</span>
                    </div>
                  </div>

                  <div className={styles.metaChip}>
                    <span>🎯</span>
                    {usuarioActual.puesto <= 10 ? (
                      `¡Felicidades! Estás en el top 10`
                    ) : (
                      `Necesitas ${(ranking[9]?.puntos_actuales - usuarioActual.puntos_actuales + 1).toLocaleString()} puntos más para entrar al top 10`
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}