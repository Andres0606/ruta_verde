"use client";

import styles from "../CSS/mapa/mapa.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState } from "react";

/* Puntos de reciclaje reales/representativos de Villavicencio */
const PUNTOS = [
  { id: 1,  nombre: "EcoPunto Macarena",        tipo: "Centro",     lat: 4.152, lng: -73.636, direccion: "Cra 31 #38-22, Barrio Macarena",    items: ["Plástico","Cartón","Vidrio"],    horario: "Lun–Sáb 7am–6pm",  puntos: 20 },
  { id: 2,  nombre: "Punto Verde La Serranía",  tipo: "Centro",     lat: 4.143, lng: -73.628, direccion: "Cl 37 #22-10, La Serranía",          items: ["Metal","Plástico"],              horario: "Lun–Vie 8am–5pm",  puntos: 15 },
  { id: 3,  nombre: "ReciclaYa Suria",          tipo: "Barrio",     lat: 4.160, lng: -73.645, direccion: "Av 40 #28-05, Suria",                items: ["Plástico","Cartón","Orgánico"],  horario: "Todos los días 7am–7pm", puntos: 12 },
  { id: 4,  nombre: "EcoPunto Bello Horizonte",  tipo: "Barrio",    lat: 4.133, lng: -73.620, direccion: "Cra 14 #15-60, Bello Horizonte",     items: ["Vidrio","Metal","Cartón"],       horario: "Lun–Sáb 8am–6pm",  puntos: 18 },
  { id: 5,  nombre: "Verde Centro Comercial",   tipo: "Comercial",  lat: 4.148, lng: -73.618, direccion: "Centro Comercial Alameda, Villavicencio", items: ["Pilas","Plástico","Papel"], horario: "Todos los días 10am–9pm", puntos: 25 },
  { id: 6,  nombre: "EcoPunto Chapinero",       tipo: "Barrio",     lat: 4.165, lng: -73.653, direccion: "Cl 25 #5-10, Chapinero",             items: ["Plástico","Cartón"],             horario: "Lun–Vie 7am–5pm",  puntos: 10 },
  { id: 7,  nombre: "Punto Reciclaje Porvenir", tipo: "Barrio",     lat: 4.128, lng: -73.633, direccion: "Cra 8 #22-45, El Porvenir",          items: ["Orgánico","Plástico"],           horario: "Lun–Sáb 6am–6pm",  puntos: 12 },
  { id: 8,  nombre: "ReciclaVerde La Grama",    tipo: "Barrio",     lat: 4.156, lng: -73.625, direccion: "Cra 25 #33-12, La Grama",            items: ["Vidrio","Metal","Plástico"],     horario: "Lun–Vie 8am–4pm",  puntos: 16 },
  { id: 9,  nombre: "EcoPunto Universidad",     tipo: "Educativo",  lat: 4.139, lng: -73.641, direccion: "Unillanos Campus Barcelona",          items: ["Plástico","Papel","Pilas"],      horario: "Lun–Vie 7am–6pm",  puntos: 20 },
  { id: 10, nombre: "Verde Mercado Municipal",  tipo: "Comercial",  lat: 4.171, lng: -73.638, direccion: "Mercado Municipal de Villavicencio",  items: ["Orgánico","Cartón"],             horario: "Todos los días 5am–6pm", puntos: 15 },
  { id: 11, nombre: "ReciclaYa Barzal",         tipo: "Barrio",     lat: 4.144, lng: -73.605, direccion: "Cra 42 #16-30, Barzal Alto",         items: ["Plástico","Vidrio","Metal"],     horario: "Lun–Sáb 7am–7pm",  puntos: 22 },
  { id: 12, nombre: "EcoPunto Porfía",          tipo: "Barrio",     lat: 4.118, lng: -73.648, direccion: "Cl 12 #3-20, Porfía",                items: ["Cartón","Plástico"],             horario: "Lun–Sáb 8am–5pm",  puntos: 10 },
];

const TIPO_COLORES: Record<string, string> = {
  Centro: "#2d6a4f",
  Barrio: "#40916c",
  Comercial: "#f4c542",
  Educativo: "#2563eb",
};

const ITEM_EMOJIS: Record<string, string> = {
  Plástico: "♻️", Cartón: "📦", Vidrio: "🍶", Metal: "🥫",
  Orgánico: "🌿", Pilas: "🔋", Papel: "📄",
};

// Grilla visual del mapa (SVG proporcional aprox a Villavicencio)
function MapaVisual({ puntos, seleccionado, onSelect }: {
  puntos: typeof PUNTOS;
  seleccionado: number | null;
  onSelect: (id: number) => void;
}) {
  // Normalizar coordenadas al canvas SVG
  const minLat = 4.110, maxLat = 4.180, minLng = -73.660, maxLng = -73.595;
  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 720 + 40;
  const toY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * 420 + 40;

  return (
    <div className={styles.mapaWrapper}>
      <svg viewBox="0 0 800 500" className={styles.mapaSvg} xmlns="http://www.w3.org/2000/svg">
        {/* Fondo */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(45,106,79,0.08)" strokeWidth="1"/>
          </pattern>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1a3d2b" floodOpacity="0.25"/>
          </filter>
        </defs>

        <rect width="800" height="500" fill="#eaf5ee" rx="20"/>
        <rect width="800" height="500" fill="url(#grid)" rx="20"/>

        {/* Ríos simulados */}
        <path d="M 80 200 Q 200 180 340 160 Q 460 145 600 175 Q 680 185 740 200" stroke="#93c5fd" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5"/>
        <path d="M 40 380 Q 180 360 320 340 Q 440 325 560 355" stroke="#93c5fd" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.4"/>

        {/* Vías principales */}
        <path d="M 0 250 L 800 250" stroke="#d1fae5" strokeWidth="12" strokeDasharray="none" opacity="0.6"/>
        <path d="M 400 0 L 400 500" stroke="#d1fae5" strokeWidth="8" opacity="0.5"/>
        <path d="M 100 100 L 700 400" stroke="#d1fae5" strokeWidth="6" opacity="0.35"/>

        {/* Marcadores */}
        {puntos.map((p) => {
          const x = toX(p.lng);
          const y = toY(p.lat);
          const isSelected = seleccionado === p.id;
          const color = TIPO_COLORES[p.tipo] || "#2d6a4f";
          return (
            <g key={p.id} onClick={() => onSelect(p.id)} style={{ cursor: "pointer" }}>
              {isSelected && (
                <circle cx={x} cy={y} r="28" fill={color} opacity="0.15">
                  <animate attributeName="r" values="20;32;20" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite"/>
                </circle>
              )}
              <circle cx={x} cy={y} r={isSelected ? 16 : 13} fill={color} filter="url(#shadow)" opacity="0.95"/>
              <circle cx={x} cy={y} r={isSelected ? 16 : 13} fill="none" stroke="#fff" strokeWidth="2.5"/>
              <text x={x} y={y + 5} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
                {p.id}
              </text>
              {isSelected && (
                <text x={x} y={y - 22} textAnchor="middle" fontSize="11" fill={color} fontWeight="700"
                  style={{ filter: "drop-shadow(0 1px 2px white)" }}>
                  {p.nombre}
                </text>
              )}
            </g>
          );
        })}

        {/* Etiqueta ciudad */}
        <text x="400" y="480" textAnchor="middle" fontSize="13" fill="#2d6a4f" fontWeight="600" opacity="0.6">
          Villavicencio, Meta
        </text>
      </svg>
    </div>
  );
}

export default function MapaPage() {
  const [seleccionado, setSeleccionado] = useState<number | null>(1);
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");

  const puntoSeleccionado = PUNTOS.find((p) => p.id === seleccionado);
  const tipos = ["Todos", ...Array.from(new Set(PUNTOS.map((p) => p.tipo)))];

  const puntosFiltrados = PUNTOS.filter((p) => {
    const matchTipo = filtroTipo === "Todos" || p.tipo === filtroTipo;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.direccion.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusqueda;
  });

  return (
    <>
      <Header currentPage="mapa" />
      <main className={styles.main}>

        {/* Top */}
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div>
              <h1 className={styles.pageTitle}>Mapa de puntos</h1>
              <p className={styles.pageSubtitle}>34 puntos de reciclaje en Villavicencio</p>
            </div>
            <div className={styles.topStats}>
              <div className={styles.topStat}><strong>34</strong><span>Puntos activos</span></div>
              <div className={styles.topStat}><strong>4</strong><span>Tipos</span></div>
            </div>
          </div>
        </div>

        <div className={styles.layout}>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Búsqueda */}
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className={styles.searchInput} placeholder="Buscar punto..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            {/* Filtros */}
            <div className={styles.filtros}>
              {tipos.map((t) => (
                <button key={t} className={`${styles.filtroBtn} ${filtroTipo === t ? styles.filtroActive : ""}`}
                  onClick={() => setFiltroTipo(t)}
                  style={filtroTipo === t && t !== "Todos" ? { background: TIPO_COLORES[t], borderColor: TIPO_COLORES[t], color: "#fff" } : {}}>
                  {t}
                </button>
              ))}
            </div>

            {/* Lista */}
            <div className={styles.lista}>
              {puntosFiltrados.map((p) => (
                <div key={p.id}
                  className={`${styles.listaItem} ${seleccionado === p.id ? styles.listaItemActive : ""}`}
                  onClick={() => setSeleccionado(p.id)}>
                  <div className={styles.listaNum} style={{ background: TIPO_COLORES[p.tipo] }}>{p.id}</div>
                  <div className={styles.listaInfo}>
                    <div className={styles.listaNombre}>{p.nombre}</div>
                    <div className={styles.listaDireccion}>{p.direccion}</div>
                    <div className={styles.listaTags}>
                      {p.items.slice(0, 3).map((item) => (
                        <span key={item} className={styles.listaTag}>{ITEM_EMOJIS[item]} {item}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.listaPuntos}>
                    <strong>+{p.puntos}</strong>
                    <small>pts</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa + detalle */}
          <div className={styles.mapaArea}>
            <MapaVisual puntos={puntosFiltrados} seleccionado={seleccionado} onSelect={setSeleccionado} />

            {/* Tarjeta detalle */}
            {puntoSeleccionado && (
              <div className={styles.detalleCard}>
                <div className={styles.detalleBadge} style={{ background: TIPO_COLORES[puntoSeleccionado.tipo] }}>
                  {puntoSeleccionado.tipo}
                </div>
                <div className={styles.detalleBody}>
                  <div className={styles.detalleLeft}>
                    <h3 className={styles.detalleNombre}>{puntoSeleccionado.nombre}</h3>
                    <div className={styles.detalleDireccion}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {puntoSeleccionado.direccion}
                    </div>
                    <div className={styles.detalleHorario}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {puntoSeleccionado.horario}
                    </div>
                    <div className={styles.detalleItems}>
                      {puntoSeleccionado.items.map((item) => (
                        <span key={item} className={styles.detalleItem}>{ITEM_EMOJIS[item]} {item}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.detalleRight}>
                    <div className={styles.detallePuntos}>
                      <span>+{puntoSeleccionado.puntos}</span>
                      <small>EcoPuntos</small>
                    </div>
                    <button className={styles.btnRuta}>Cómo llegar →</button>
                  </div>
                </div>
              </div>
            )}

            {/* Leyenda */}
            <div className={styles.leyenda}>
              {Object.entries(TIPO_COLORES).map(([tipo, color]) => (
                <div key={tipo} className={styles.leyendaItem}>
                  <div className={styles.leyendaDot} style={{ background: color }} />
                  <span>{tipo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}