"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../CSS/Dashboard/Dashboard.module.css";

interface UserData {
  id: number;
  email: string;
  nombre: string;
  avatar_url: string | null;
  puntos_actuales: number;
  nivel: number;
  telefono: string | null;
  rol: string;
}

interface Insignia {
  id: number;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  puntos_requeridos: number;
  cantidad_residuos_requerida: number;
  categoria_requerida_id: number | null;
}

interface UsuarioInsignia {
  id: number;
  usuario_id: number;
  insignia_id: number;
  fecha_obtencion: string;
  insignia?: Insignia;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [misInsignias, setMisInsignias] = useState<number[]>([]);
  const [totalResiduos, setTotalResiduos] = useState(0);

  useEffect(() => {
    loadUserData();
    loadInsignias();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return;
    }

    // Obtener datos del usuario
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_uuid", session.user.id)
      .single();

    if (error) {
      console.error("Error cargando usuario:", error);
    } else if (userData) {
      setUser(userData);
      setUserPoints(userData.puntos_actuales || 0);
      setUserLevel(userData.nivel || 1);
      
      // Cargar insignias del usuario
      await loadUserInsignias(userData.id);
      
      // Cargar total de residuos
      await loadTotalResiduos(userData.id);
    }

    setLoading(false);
  };

  const loadUserInsignias = async (usuarioId: number) => {
    const { data, error } = await supabase
      .from("usuarios_insignias")
      .select("insignia_id")
      .eq("usuario_id", usuarioId);
    
    if (error) {
      console.error("Error cargando insignias del usuario:", error);
    } else if (data) {
      setMisInsignias(data.map(i => i.insignia_id));
    }
  };

  const loadInsignias = async () => {
    const { data, error } = await supabase
      .from("insignias")
      .select("*")
      .order("puntos_requeridos", { ascending: true });
    
    if (error) {
      console.error("Error cargando insignias:", error);
    } else if (data) {
      setInsignias(data);
    }
  };

  const loadTotalResiduos = async (usuarioId: number) => {
    const { count, error } = await supabase
      .from("residuos")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", usuarioId);
    
    if (error) {
      console.error("Error cargando total residuos:", error);
    } else {
      setTotalResiduos(count || 0);
    }
  };

  // Verificar si una insignia está desbloqueada
  const isInsigniaUnlocked = (insignia: Insignia): boolean => {
    // Si ya la tiene el usuario
    if (misInsignias.includes(insignia.id)) return true;
    
    // Verificar por puntos
    if (insignia.puntos_requeridos > 0 && userPoints >= insignia.puntos_requeridos) {
      return true;
    }
    
    // Verificar por cantidad de residuos
    if (insignia.cantidad_residuos_requerida > 0 && totalResiduos >= insignia.cantidad_residuos_requerida) {
      return true;
    }
    
    return false;
  };

  // Obtener progreso hacia una insignia
  const getInsigniaProgress = (insignia: Insignia): number => {
    if (insignia.puntos_requeridos > 0) {
      return Math.min(100, (userPoints / insignia.puntos_requeridos) * 100);
    }
    if (insignia.cantidad_residuos_requerida > 0) {
      return Math.min(100, (totalResiduos / insignia.cantidad_residuos_requerida) * 100);
    }
    return 0;
  };

  const pointsToNextLevel = 1000 - (userPoints % 1000);
  const progressPercent = (userPoints % 1000) / 10;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando tu información...</p>
      </div>
    );
  }

  // Insignias desbloqueadas y bloqueadas
  const insigniasDesbloqueadas = insignias.filter(i => isInsigniaUnlocked(i));
  const insigniasBloqueadas = insignias.filter(i => !isInsigniaUnlocked(i));

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.welcomeTitle}>
          ¡Hola, {user?.nombre || "Usuario"}! 👋
        </h1>
        <div className={styles.userInfo}>
          <span className={styles.userEmail}>{user?.email}</span>
          <div className={styles.avatar}>
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{userPoints}</span>
            <span className={styles.statLabel}>Puntos Totales</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>Nivel {userLevel}</span>
            <span className={styles.statLabel}>Reciclador</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>♻️</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalResiduos}</span>
            <span className={styles.statLabel}>Residuos Reciclados</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌍</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{Math.floor(totalResiduos * 0.5)}</span>
            <span className={styles.statLabel}>CO₂ Ahorrado (kg)</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <h3>Progreso al siguiente nivel</h3>
          <span>{pointsToNextLevel} puntos para nivel {userLevel + 1}</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Insignias Section */}
      <div className={styles.insigniasCard}>
        <h3>🏅 Mis Insignias</h3>
        <p className={styles.insigniasSubtitle}>
          {insigniasDesbloqueadas.length} de {insignias.length} insignias desbloqueadas
        </p>
        
        {insigniasDesbloqueadas.length > 0 && (
          <div className={styles.insigniasGrid}>
            {insigniasDesbloqueadas.map((insignia) => (
              <div key={insignia.id} className={`${styles.insigniaItem} ${styles.insigniaUnlocked}`}>
                <div className={styles.insigniaIcon}>
                  {insignia.nombre === "Primer Reciclaje" && "🎉"}
                  {insignia.nombre === "Eco Amateur" && "🌱"}
                  {insignia.nombre === "Eco Experto" && "🌟"}
                  {insignia.nombre === "Reciclador Frecuente" && "♻️"}
                  {insignia.nombre === "Guardian del Planeta" && "🛡️"}
                  {!insignia.nombre.includes("Primer") && !insignia.nombre.includes("Eco") && !insignia.nombre.includes("Reciclador") && !insignia.nombre.includes("Guardian") && "🏅"}
                </div>
                <div className={styles.insigniaInfo}>
                  <div className={styles.insigniaNombre}>{insignia.nombre}</div>
                  <div className={styles.insigniaDescripcion}>{insignia.descripcion}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {insigniasBloqueadas.length > 0 && (
          <>
            <h4 className={styles.insigniasSubtitle2}>Próximas insignias</h4>
            <div className={styles.insigniasGrid}>
              {insigniasBloqueadas.map((insignia) => {
                const progress = getInsigniaProgress(insignia);
                return (
                  <div key={insignia.id} className={`${styles.insigniaItem} ${styles.insigniaLocked}`}>
                    <div className={styles.insigniaIcon}>
                      {insignia.nombre === "Primer Reciclaje" && "🎉"}
                      {insignia.nombre === "Eco Amateur" && "🌱"}
                      {insignia.nombre === "Eco Experto" && "🌟"}
                      {insignia.nombre === "Reciclador Frecuente" && "♻️"}
                      {insignia.nombre === "Guardian del Planeta" && "🛡️"}
                      {!insignia.nombre.includes("Primer") && !insignia.nombre.includes("Eco") && !insignia.nombre.includes("Reciclador") && !insignia.nombre.includes("Guardian") && "🔒"}
                    </div>
                    <div className={styles.insigniaInfo}>
                      <div className={styles.insigniaNombre}>{insignia.nombre}</div>
                      <div className={styles.insigniaDescripcion}>{insignia.descripcion}</div>
                      <div className={styles.insigniaProgress}>
                        <div className={styles.insigniaProgressBar}>
                          <div 
                            className={styles.insigniaProgressFill} 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className={styles.insigniaProgressText}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className={styles.activityCard}>
        <h3>Actividad Reciente</h3>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>🎉</div>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>¡Bienvenido a RutaVerde!</p>
              <p className={styles.activityDate}>Comienza a reciclar y gana puntos</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}