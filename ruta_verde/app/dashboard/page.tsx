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

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    
    // Obtener sesión actual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return;
    }

    // Obtener datos de la tabla users
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
    }

    setLoading(false);
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
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Residuos Reciclados</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌍</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>0</span>
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