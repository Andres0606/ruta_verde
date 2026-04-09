"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { verificarYAsignarInsignias, getInsigniasUsuario } from "@/lib/insignias";
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

interface InsigniaCompleta {
  id: number;
  insignia_id: number;
  fecha_obtencion: string;
  insignia: {
    id: number;
    nombre: string;
    descripcion: string;
    imagen_url: string | null;
    puntos_requeridos: number;
    cantidad_residuos_requerida: number;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [insignias, setInsignias] = useState<InsigniaCompleta[]>([]);
  const [totalResiduos, setTotalResiduos] = useState(0);
  const [nuevasInsignias, setNuevasInsignias] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
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
      
      // Cargar total de residuos
      await loadTotalResiduos(userData.id);
      
      // Verificar y cargar insignias
      await verificarYAsignarInsignias(userData.id, userData.puntos_actuales || 0, totalResiduos);
      await loadUserInsignias(userData.id);
    }

    setLoading(false);
  };

  const loadTotalResiduos = async (usuarioId: number) => {
    const { count, error } = await supabase
      .from("residuos")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", usuarioId);
    
    if (!error) {
      setTotalResiduos(count || 0);
      return count || 0;
    }
    return 0;
  };

  const loadUserInsignias = async (usuarioId: number) => {
    const insigniasData = await getInsigniasUsuario(usuarioId);
    setInsignias(insigniasData);
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

  // Función para obtener el ícono de la insignia
  const getInsigniaIcon = (nombre: string): string => {
    const iconos: Record<string, string> = {
      "Primer Reciclaje": "🎉",
      "Eco Amateur": "🌱",
      "Eco Experto": "🌟",
      "Reciclador Frecuente": "♻️",
      "Guardian del Planeta": "🛡️",
    };
    return iconos[nombre] || "🏅";
  };

  return (
    <>
      {/* Notificación de nuevas insignias */}
      {nuevasInsignias.length > 0 && (
        <div className={styles.notificacionInsignias}>
          <div className={styles.notificacionContent}>
            <span className={styles.notificacionIcon}>🏅</span>
            <div>
              <strong>¡Nuevas insignias desbloqueadas!</strong>
              <p>Has obtenido: {nuevasInsignias.join(", ")}</p>
            </div>
          </div>
        </div>
      )}

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
          {insignias.length} de 5 insignias desbloqueadas
        </p>
        
        {insignias.length > 0 ? (
          <div className={styles.insigniasGrid}>
            {insignias.map((item) => (
              <div key={item.id} className={`${styles.insigniaItem} ${styles.insigniaUnlocked}`}>
                <div className={styles.insigniaIcon}>
                  {getInsigniaIcon(item.insignia.nombre)}
                </div>
                <div className={styles.insigniaInfo}>
                  <div className={styles.insigniaNombre}>{item.insignia.nombre}</div>
                  <div className={styles.insigniaDescripcion}>{item.insignia.descripcion}</div>
                  <div className={styles.insigniaFecha}>
                    Obtenida el {new Date(item.fecha_obtencion).toLocaleDateString("es-CO")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.sinInsignias}>
            <p>🎯 ¡Comienza a reciclar para ganar tus primeras insignias!</p>
          </div>
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