"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../../CSS/Dashboard/Entregas.module.css";
import dashboardStyles from "../../CSS/Dashboard/Dashboard.module.css";

interface Entrega {
  id: number;
  residuo_id: number;
  usuario_id: number;
  punto_reciclaje_id: number | null;
  fecha_entrega: string;
  codigo_verificacion: string | null;
  imagen_evidencia_url: string | null;
  estado_entrega: string;
  observaciones: string | null;
  id_comuna: number | null;
}

interface ResiduoInfo {
  id: number;
  puntos_otorgados: number;
  metodo_clasificacion: string;
  estado: string;
  qr_code: string | null;
}

interface PuntoInfo {
  nombre: string;
  direccion: string;
  Comuna: string | null;
}

interface EntregaConInfo extends Entrega {
  residuo: ResiduoInfo | null;
  punto_reciclaje: PuntoInfo | null;
}

export default function EntregasPage() {
  const [entregas, setEntregas] = useState<EntregaConInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [stats, setStats] = useState({
    totalEntregas: 0,
    puntosTotales: 0,
    entregasCompletadas: 0,
    entregasPendientes: 0,
  });

  useEffect(() => {
    loadEntregas();
  }, []);

  const loadEntregas = async () => {
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setError("No hay sesión activa");
      setLoading(false);
      return;
    }

    // Obtener usuario actual
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_uuid", session.user.id)
      .single();

    if (userError || !userData) {
      setError("Usuario no encontrado");
      setLoading(false);
      return;
    }

    console.log("Usuario ID:", userData.id);

    // Obtener entregas del usuario
    const { data: entregasData, error: entregasError } = await supabase
      .from("entregas")
      .select("*")
      .eq("usuario_id", userData.id)
      .order("fecha_entrega", { ascending: false });

    if (entregasError) {
      console.error("Error cargando entregas:", entregasError);
      setError("Error al cargar las entregas");
      setLoading(false);
      return;
    }

    if (!entregasData || entregasData.length === 0) {
      setEntregas([]);
      setStats({
        totalEntregas: 0,
        puntosTotales: 0,
        entregasCompletadas: 0,
        entregasPendientes: 0,
      });
      setLoading(false);
      return;
    }

    console.log("Entregas encontradas:", entregasData.length);

    // Obtener información de residuos y puntos de reciclaje para cada entrega
    const entregasConInfo: EntregaConInfo[] = [];
    let puntosTotal = 0;
    let completadas = 0;
    let pendientes = 0;

    for (const entrega of entregasData) {
      // Obtener residuo
      const { data: residuoData } = await supabase
        .from("residuos")
        .select("id, puntos_otorgados, metodo_clasificacion, estado, qr_code")
        .eq("id", entrega.residuo_id)
        .single();

      // Obtener punto de reciclaje si existe
      let puntoData = null;
      if (entrega.punto_reciclaje_id) {
        const { data: pData } = await supabase
          .from("puntos_reciclaje")
          .select("nombre, direccion, Comuna")
          .eq("id", entrega.punto_reciclaje_id)
          .single();
        puntoData = pData;
      }

      entregasConInfo.push({
        ...entrega,
        residuo: residuoData || null,
        punto_reciclaje: puntoData,
      });

      // Calcular estadísticas
      if (entrega.estado_entrega === "verificada") {
        completadas++;
        puntosTotal += residuoData?.puntos_otorgados || 0;
      } else if (entrega.estado_entrega === "pendiente") {
        pendientes++;
      }
    }

    setEntregas(entregasConInfo);
    setStats({
      totalEntregas: entregasData.length,
      puntosTotales: puntosTotal,
      entregasCompletadas: completadas,
      entregasPendientes: pendientes,
    });

    setLoading(false);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "verificada":
        return { text: "✅ Verificada", class: styles.estadoCompletada };
      case "pendiente":
        return { text: "⏳ Pendiente", class: styles.estadoPendiente };
      case "rechazada":
        return { text: "❌ Rechazada", class: styles.estadoRechazada };
      default:
        return { text: estado, class: "" };
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const entregasFiltradas = entregas.filter(entrega => {
    if (filtroEstado === "todas") return true;
    if (filtroEstado === "completadas") return entrega.estado_entrega === "verificada";
    if (filtroEstado === "pendientes") return entrega.estado_entrega === "pendiente";
    return true;
  });

  if (loading) {
    return (
      <div className={dashboardStyles.loadingContainer}>
        <div className={dashboardStyles.spinner} />
        <p>Cargando tus entregas...</p>
      </div>
    );
  }

  return (
    <div className={styles.entregasContainer}>
      {/* Header */}
      <header className={dashboardStyles.header}>
        <h1 className={dashboardStyles.welcomeTitle}>Mis Entregas</h1>
        <div className={dashboardStyles.userInfo}>
          <span className={dashboardStyles.userEmail}>Historial de reciclaje</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalEntregas}</span>
            <span className={styles.statLabel}>Total Entregas</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.puntosTotales}</span>
            <span className={styles.statLabel}>Puntos Ganados</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.entregasCompletadas}</span>
            <span className={styles.statLabel}>Completadas</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.entregasPendientes}</span>
            <span className={styles.statLabel}>Pendientes</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtrosContainer}>
        <button
          className={`${styles.filtroBtn} ${filtroEstado === "todas" ? styles.filtroActive : ""}`}
          onClick={() => setFiltroEstado("todas")}
        >
          Todas
        </button>
        <button
          className={`${styles.filtroBtn} ${filtroEstado === "completadas" ? styles.filtroActive : ""}`}
          onClick={() => setFiltroEstado("completadas")}
        >
          Completadas
        </button>
        <button
          className={`${styles.filtroBtn} ${filtroEstado === "pendientes" ? styles.filtroActive : ""}`}
          onClick={() => setFiltroEstado("pendientes")}
        >
          Pendientes
        </button>
      </div>

      {/* Lista de entregas */}
      {error && (
        <div className={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}

      {entregasFiltradas.length === 0 && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>♻️</div>
          <h3>No tienes entregas registradas</h3>
          <p>Comienza a reciclar y tus entregas aparecerán aquí</p>
          <button
            className={styles.btnReciclar}
            onClick={() => window.location.href = "/clasificar"}
          >
            Clasificar residuo
          </button>
        </div>
      )}

      <div className={styles.entregasList}>
        {entregasFiltradas.map((entrega) => {
          const estado = getEstadoBadge(entrega.estado_entrega);
          return (
            <div key={entrega.id} className={styles.entregaCard}>
              <div className={styles.entregaHeader}>
                <div className={styles.entregaInfo}>
                  <span className={styles.entregaId}>#ID: {entrega.id}</span>
                  <span className={estado.class}>{estado.text}</span>
                </div>
                <span className={styles.entregaFecha}>{formatFecha(entrega.fecha_entrega)}</span>
              </div>

              <div className={styles.entregaBody}>
                <div className={styles.entregaDetalle}>
                  <div className={styles.detalleRow}>
                    <span className={styles.detalleLabel}>Puntos:</span>
                    <span className={styles.detallePuntos}>+{entrega.residuo?.puntos_otorgados || 0} pts</span>
                  </div>
                  <div className={styles.detalleRow}>
                    <span className={styles.detalleLabel}>Clasificación:</span>
                    <span className={styles.detalleValor}>
                      {entrega.residuo?.metodo_clasificacion === "ia" ? "🤖 IA" : "Manual"}
                    </span>
                  </div>
                  <div className={styles.detalleRow}>
                    <span className={styles.detalleLabel}>Estado residuo:</span>
                    <span className={styles.detalleValor}>
                      {entrega.residuo?.estado === "registrado" ? "📝 Registrado" : 
                       entrega.residuo?.estado === "entregado" ? "✅ Entregado" : 
                       entrega.residuo?.estado === "procesado" ? "♻️ Procesado" : entrega.residuo?.estado}
                    </span>
                  </div>
                  
                  
                </div>

                {entrega.punto_reciclaje && (
                  <div className={styles.entregaPunto}>
                    <div className={styles.puntoInfo}>
                      <div className={styles.puntoNombre}>{entrega.punto_reciclaje.nombre}</div>
                      <div className={styles.puntoDireccion}>{entrega.punto_reciclaje.direccion}</div>
                      {entrega.punto_reciclaje.Comuna && (
                        <div className={styles.puntoComuna}>📍 {entrega.punto_reciclaje.Comuna}</div>
                      )}
                    </div>
                  </div>
                )}

                {entrega.observaciones && (
                  <div className={styles.entregaObservaciones}>
                    <span>📝</span>
                    <p>{entrega.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}