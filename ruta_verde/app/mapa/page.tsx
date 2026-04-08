"use client";

import styles from "../CSS/mapa/mapa.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PuntoReciclaje {
  id: number;
  nombre: string;
  direccion: string | null;
  tipo: string | null;
  activo: boolean | null;
  Comuna: string | null;
}

// Colores por tipo de punto
const TIPO_COLORES: Record<string, string> = {
  estacion: "#2d6a4f",
  reciclador_publico: "#40916c",
  reciclador_privado: "#f4c542",
  default: "#74c69d",
};

// Items por tipo
const getItemsPorTipo = (tipo: string | null): string[] => {
  switch (tipo) {
    case "estacion":
      return ["Plástico", "Cartón", "Vidrio", "Metal"];
    case "reciclador_publico":
      return ["Plástico", "Papel", "Cartón"];
    case "reciclador_privado":
      return ["Metal", "Electrónicos", "Vidrio"];
    default:
      return ["Plástico", "Cartón", "Vidrio"];
  }
};

// Puntos por tipo
const getPuntosPorTipo = (tipo: string | null): number => {
  switch (tipo) {
    case "estacion":
      return 20;
    case "reciclador_publico":
      return 15;
    case "reciclador_privado":
      return 25;
    default:
      return 10;
  }
};

// Emojis por item
const ITEM_EMOJIS: Record<string, string> = {
  Plástico: "♻️",
  Cartón: "📦",
  Vidrio: "🍶",
  Metal: "🥫",
  Orgánico: "🌿",
  Pilas: "🔋",
  Papel: "📄",
  Electrónicos: "💻",
};

export default function MapaPage() {
  const [puntos, setPuntos] = useState<PuntoReciclaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [filtroComuna, setFiltroComuna] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [comunas, setComunas] = useState<string[]>([]);

  // Cargar puntos desde Supabase
  useEffect(() => {
    cargarPuntos();
  }, []);

  const cargarPuntos = async () => {
    setCargando(true);
    
    const { data, error } = await supabase
      .from("puntos_reciclaje")
      .select("id, nombre, direccion, tipo, activo, Comuna")
      .eq("activo", true)
      .order("Comuna", { ascending: true })
      .order("nombre", { ascending: true });
    
    if (error) {
      console.error("Error cargando puntos:", error);
    } else if (data) {
      setPuntos(data);
      if (data.length > 0) {
        setSeleccionado(data[0].id);
      }
      const comunasUnicas = [...new Set(data.map(p => p.Comuna).filter(Boolean))] as string[];
      setComunas(["Todos", ...comunasUnicas.sort()]);
    }
    
    setCargando(false);
  };

  // Calcular puntos filtrados
  const tipos = ["Todos", ...Array.from(new Set(puntos.map((p) => p.tipo || "Otro")))];
  
  const puntosFiltrados = puntos.filter((p) => {
    const matchTipo = filtroTipo === "Todos" || p.tipo === filtroTipo;
    const matchComuna = filtroComuna === "Todos" || p.Comuna === filtroComuna;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.direccion?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
      (p.Comuna?.toLowerCase().includes(busqueda.toLowerCase()) ?? false);
    return matchTipo && matchComuna && matchBusqueda;
  });

  const puntoSeleccionado = puntos.find((p) => p.id === seleccionado);
  
  const getTipoNombre = (tipo: string | null): string => {
    switch (tipo) {
      case "estacion": return "Estación";
      case "reciclador_publico": return "Reciclador Público";
      case "reciclador_privado": return "Reciclador Privado";
      default: return tipo || "Punto Verde";
    }
  };

  if (cargando) {
    return (
      <>
        <Header currentPage="mapa" />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Cargando puntos de reciclaje...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header currentPage="mapa" />
      <main className={styles.main}>

        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div>
              <h1 className={styles.pageTitle}>Puntos de Reciclaje</h1>
              <p className={styles.pageSubtitle}>{puntos.length} puntos de reciclaje en Villavicencio</p>
            </div>
            <div className={styles.topStats}>
              <div className={styles.topStat}><strong>{puntos.length}</strong><span>Puntos activos</span></div>
              <div className={styles.topStat}><strong>{tipos.length - 1}</strong><span>Tipos</span></div>
              <div className={styles.topStat}><strong>{comunas.length - 1}</strong><span>Comunas</span></div>
            </div>
          </div>
        </div>

        <div className={styles.layout}>

          {/* Sidebar - Filtros */}
          <div className={styles.sidebar}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                className={styles.searchInput} 
                placeholder="Buscar por nombre, dirección o comuna..."
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
              />
            </div>

            {/* Filtro por Tipo */}
            <div className={styles.filtroSection}>
              <label className={styles.filtroLabel}>Filtrar por tipo:</label>
              <div className={styles.filtros}>
                {tipos.map((t) => (
                  <button 
                    key={t} 
                    className={`${styles.filtroBtn} ${filtroTipo === t ? styles.filtroActive : ""}`}
                    onClick={() => setFiltroTipo(t)}
                    style={filtroTipo === t && t !== "Todos" ? { background: TIPO_COLORES[t] || TIPO_COLORES.default, borderColor: TIPO_COLORES[t] || TIPO_COLORES.default, color: "#fff" } : {}}
                  >
                    {t === "estacion" ? "Estación" : 
                     t === "reciclador_publico" ? "Reciclador Público" :
                     t === "reciclador_privado" ? "Reciclador Privado" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por Comuna */}
            {comunas.length > 1 && (
              <div className={styles.filtroSection}>
                <label className={styles.filtroLabel}>Filtrar por comuna:</label>
                <div className={styles.filtros}>
                  {comunas.map((c) => (
                    <button 
                      key={c} 
                      className={`${styles.filtroBtn} ${filtroComuna === c ? styles.filtroActive : ""}`}
                      onClick={() => setFiltroComuna(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de puntos */}
            <div className={styles.lista}>
              {puntosFiltrados.map((p) => (
                <div
                  key={p.id}
                  className={`${styles.listaItem} ${seleccionado === p.id ? styles.listaItemActive : ""}`}
                  onClick={() => setSeleccionado(p.id)}
                >
                  <div className={styles.listaNum} style={{ background: TIPO_COLORES[p.tipo || "default"] }}>
                    {p.id}
                  </div>
                  <div className={styles.listaInfo}>
                    <div className={styles.listaNombre}>{p.nombre}</div>
                    <div className={styles.listaDireccion}>{p.direccion || "Dirección no disponible"}</div>
                    {p.Comuna && (
                      <div className={styles.listaComuna}>📍 Comuna: {p.Comuna}</div>
                    )}
                    <div className={styles.listaTags}>
                      {getItemsPorTipo(p.tipo).slice(0, 3).map((item) => (
                        <span key={item} className={styles.listaTag}>{ITEM_EMOJIS[item]} {item}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.listaPuntos}>
                    <strong>+{getPuntosPorTipo(p.tipo)}</strong>
                    <small>pts</small>
                  </div>
                </div>
              ))}
              {puntosFiltrados.length === 0 && (
                <div className={styles.noResults}>
                  No hay puntos que coincidan con tu búsqueda
                </div>
              )}
            </div>
          </div>

          {/* Panel de detalle */}
          <div className={styles.detallePanel}>
            {puntoSeleccionado ? (
              <div className={styles.detalleCard}>
                <div className={styles.detalleBadge} style={{ background: TIPO_COLORES[puntoSeleccionado.tipo || "default"] }}>
                  {getTipoNombre(puntoSeleccionado.tipo)}
                </div>
                <div className={styles.detalleBody}>
                  <h3 className={styles.detalleNombre}>{puntoSeleccionado.nombre}</h3>
                  
                  {puntoSeleccionado.direccion && (
                    <div className={styles.detalleDireccion}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {puntoSeleccionado.direccion}
                    </div>
                  )}
                  
                  {puntoSeleccionado.Comuna && (
                    <div className={styles.detalleComuna}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Comuna: {puntoSeleccionado.Comuna}
                    </div>
                  )}
                  
                  <div className={styles.detalleItems}>
                    <strong>Materiales que reciben:</strong>
                    <div className={styles.detalleItemsList}>
                      {getItemsPorTipo(puntoSeleccionado.tipo).map((item) => (
                        <span key={item} className={styles.detalleItem}>{ITEM_EMOJIS[item]} {item}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.detallePuntosCard}>
                    <div className={styles.detallePuntos}>
                      <span>+{getPuntosPorTipo(puntoSeleccionado.tipo)}</span>
                      <small>EcoPuntos por visita</small>
                    </div>
                  </div>

                  <button 
                    className={styles.btnRuta}
                    onClick={() => {
                      if (puntoSeleccionado.direccion) {
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(puntoSeleccionado.direccion + ", Villavicencio, Meta, Colombia")}`, '_blank');
                      } else {
                        alert("Este punto no tiene dirección registrada");
                      }
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Abrir en Google Maps
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.detalleEmpty}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <p>Selecciona un punto de reciclaje para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}