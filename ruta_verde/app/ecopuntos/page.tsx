"use client";

import styles from "../CSS/ecopuntos/ecopuntos.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
  id: number;
  email: string;
  nombre: string;
  avatar_url: string | null;
  puntos_actuales: number;
  nivel: number;
  telefono: string | null;
  rol: string;
  fecha_registro: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_puntos: number;
  nivel_requerido: number;
  imagen: string;
  emoji: string;
  disponible: boolean;
  cantidad?: number;
}

interface InventarioUsuario {
  id: number;
  producto_id: number;
  cantidad: number;
}

export default function EcoPuntosPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [inventario, setInventario] = useState<InventarioUsuario[]>([]);
  const [mensajeCanje, setMensajeCanje] = useState<{ texto: string; tipo: string } | null>(null);
  const [categoria, setCategoria] = useState<"todos" | "desbloqueados" | "bloqueados">("todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Cargar usuario
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("auth_uuid", session.user.id)
      .single();

    if (userData) {
      setUser(userData);
      await cargarInventario(userData.id);
    }

    // Cargar productos de la tienda
    cargarProductos();

    setLoading(false);
  };

  const cargarInventario = async (usuarioId: number) => {
    const { data } = await supabase
      .from("inventario_usuarios")
      .select("*")
      .eq("usuario_id", usuarioId);
    
    if (data) {
      setInventario(data);
    }
  };

  const cargarProductos = () => {
    // Catálogo de productos
    const catalogo: Producto[] = [
      { 
        id: 1, 
        nombre: "Botella Reutilizable", 
        descripcion: "Botella de acero inoxidable 500ml", 
        precio_puntos: 500, 
        nivel_requerido: 2,
        imagen: "/productos/botella.png",
        emoji: "💧",
        disponible: true
      },
      { 
        id: 2, 
        nombre: "Bolsa Ecológica", 
        descripcion: "Bolsa de tela reutilizable", 
        precio_puntos: 200, 
        nivel_requerido: 1,
        imagen: "/productos/bolsa.png",
        emoji: "🛍️",
        disponible: true
      },
      { 
        id: 3, 
        nombre: "Taza Térmica", 
        descripcion: "Taza ecológica para café/té", 
        precio_puntos: 800, 
        nivel_requerido: 3,
        imagen: "/productos/taza.png",
        emoji: "☕",
        disponible: true
      },
      { 
        id: 4, 
        nombre: "Kit de Compostaje", 
        descripcion: "Inicia tu propio compost", 
        precio_puntos: 1500, 
        nivel_requerido: 5,
        imagen: "/productos/compost.png",
        emoji: "🌱",
        disponible: true
      },
      { 
        id: 5, 
        nombre: "Camiseta RutaVerde", 
        descripcion: "Camiseta oficial del programa", 
        precio_puntos: 1200, 
        nivel_requerido: 4,
        imagen: "/productos/camiseta.png",
        emoji: "👕",
        disponible: true
      },
      { 
        id: 6, 
        nombre: "Planta Decorativa", 
        descripcion: "Planta de interior purificadora", 
        precio_puntos: 600, 
        nivel_requerido: 2,
        imagen: "/productos/planta.png",
        emoji: "🪴",
        disponible: true
      },
      { 
        id: 7, 
        nombre: "Libreta Reciclada", 
        descripcion: "Cuaderno de papel reciclado", 
        precio_puntos: 300, 
        nivel_requerido: 1,
        imagen: "/productos/libreta.png",
        emoji: "📓",
        disponible: true
      },
      { 
        id: 8, 
        nombre: "Cepillo de Bambú", 
        descripcion: "Cepillo de dientes biodegradable", 
        precio_puntos: 250, 
        nivel_requerido: 1,
        imagen: "/productos/cepillo.png",
        emoji: "🪥",
        disponible: true
      },
      { 
        id: 9, 
        nombre: "Tupperware Ecológico", 
        descripcion: "Envase reutilizable para alimentos", 
        precio_puntos: 400, 
        nivel_requerido: 2,
        imagen: "/productos/tupper.png",
        emoji: "🥡",
        disponible: true
      },
      { 
        id: 10, 
        nombre: "Detergente Ecológico", 
        descripcion: "Detergente biodegradable", 
        precio_puntos: 350, 
        nivel_requerido: 2,
        imagen: "/productos/detergente.png",
        emoji: "🧴",
        disponible: true
      },
    ];
    setProductos(catalogo);
  };

  const canjearProducto = async (producto: Producto) => {
    if (!user) return;

    // Verificar nivel
    if (user.nivel < producto.nivel_requerido) {
      setMensajeCanje({ 
        texto: `Necesitas nivel ${producto.nivel_requerido} para canjear ${producto.nombre} (tu nivel: ${user.nivel})`, 
        tipo: "error" 
      });
      setTimeout(() => setMensajeCanje(null), 3000);
      return;
    }

    // Verificar puntos
    if (user.puntos_actuales < producto.precio_puntos) {
      setMensajeCanje({ 
        texto: `No tienes suficientes puntos. Te faltan ${producto.precio_puntos - user.puntos_actuales} puntos`, 
        tipo: "error" 
      });
      setTimeout(() => setMensajeCanje(null), 3000);
      return;
    }

    // Verificar si ya existe en inventario
    const itemExistente = inventario.find(i => i.producto_id === producto.id);
    
    if (itemExistente) {
      // Actualizar cantidad
      const { error } = await supabase
        .from("inventario_usuarios")
        .update({ cantidad: itemExistente.cantidad + 1 })
        .eq("id", itemExistente.id);

      if (error) {
        setMensajeCanje({ texto: "Error al canjear el producto", tipo: "error" });
        return;
      }
      
      setInventario(inventario.map(i => 
        i.id === itemExistente.id ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      // Crear nuevo registro
      const { data, error } = await supabase
        .from("inventario_usuarios")
        .insert({
          usuario_id: user.id,
          producto_id: producto.id,
          cantidad: 1,
        })
        .select()
        .single();

      if (error) {
        setMensajeCanje({ texto: "Error al canjear el producto", tipo: "error" });
        return;
      }
      
      setInventario([...inventario, data]);
    }

    // Restar puntos al usuario
    const nuevosPuntos = user.puntos_actuales - producto.precio_puntos;
    const nuevoNivel = Math.floor(nuevosPuntos / 1000) + 1;

    const { error: updateError } = await supabase
      .from("users")
      .update({ puntos_actuales: nuevosPuntos, nivel: nuevoNivel })
      .eq("id", user.id);

    if (updateError) {
      setMensajeCanje({ texto: "Error al actualizar puntos", tipo: "error" });
      return;
    }

    setUser({ ...user, puntos_actuales: nuevosPuntos, nivel: nuevoNivel });
    
    // Registrar en historial
    await supabase
      .from("historial_puntos")
      .insert({
        usuario_id: user.id,
        puntos: -producto.precio_puntos,
        concepto: `Canje: ${producto.nombre}`,
        fecha: new Date().toISOString(),
      });

    setMensajeCanje({ 
      texto: `¡Canjeaste ${producto.nombre} por ${producto.precio_puntos} puntos!`, 
      tipo: "success" 
    });
    setTimeout(() => setMensajeCanje(null), 3000);
  };

  const getCantidadProducto = (productoId: number): number => {
    const item = inventario.find(i => i.producto_id === productoId);
    return item?.cantidad || 0;
  };

  const productosFiltrados = productos.filter(producto => {
    if (categoria === "desbloqueados") {
      return user && user.nivel >= producto.nivel_requerido;
    }
    if (categoria === "bloqueados") {
      return user && user.nivel < producto.nivel_requerido;
    }
    return true;
  });

  const getNivelNombre = (nivel: number): string => {
    if (nivel <= 2) return "Principiante";
    if (nivel <= 4) return "Activo";
    if (nivel <= 6) return "Experto";
    if (nivel <= 8) return "Maestro";
    return "Leyenda";
  };

  if (loading) {
    return (
      <>
        <Header currentPage="ecopuntos" />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Cargando tienda...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header currentPage="ecopuntos" />
      <main className={styles.main}>

        {/* Mensaje de canje */}
        {mensajeCanje && (
          <div className={`${styles.mensajeCanje} ${styles[mensajeCanje.tipo === "success" ? "mensajeSuccess" : "mensajeError"]}`}>
            {mensajeCanje.texto}
          </div>
        )}

        {/* Hero con puntos del usuario */}
        <div className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroInner}>
            <div className={styles.perfil}>
              <div className={styles.avatar}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.nombre} className={styles.avatarImg} />
                ) : (
                  user?.nombre?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div>
                <div className={styles.nivel}>
                  <span className={styles.nivelDot} />
                  Nivel {user?.nivel} - {getNivelNombre(user?.nivel || 1)}
                </div>
                <h1 className={styles.nombreUsuario}>{user?.nombre}</h1>
                <p className={styles.ciudadUsuario}>📍 Villavicencio, Meta</p>
              </div>
            </div>

            <div className={styles.puntosGrande}>
              <div className={styles.puntosNumero}>{user?.puntos_actuales?.toLocaleString() || 0}</div>
              <div className={styles.puntosLabel}>EcoPuntos disponibles</div>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{inventario.reduce((sum, i) => sum + i.cantidad, 0)}</span>
                <span className={styles.heroStatLabel}>Productos canjeados</span>
              </div>
              <div className={styles.heroStatDiv} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{productos.filter(p => user && user.nivel >= p.nivel_requerido).length}</span>
                <span className={styles.heroStatLabel}>Productos disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tienda */}
        <div className={styles.tiendaContainer}>
          <div className={styles.tiendaHeader}>
            <h2>🎁 Tienda de Recompensas</h2>
            <p>Canjea tus EcoPuntos por productos ecológicos</p>
          </div>

          {/* Filtros */}
          <div className={styles.filtrosTienda}>
            <button
              className={`${styles.filtroBtn} ${categoria === "todos" ? styles.filtroActive : ""}`}
              onClick={() => setCategoria("todos")}
            >
              Todos
            </button>
            <button
              className={`${styles.filtroBtn} ${categoria === "desbloqueados" ? styles.filtroActive : ""}`}
              onClick={() => setCategoria("desbloqueados")}
            >
              Desbloqueados
            </button>
            <button
              className={`${styles.filtroBtn} ${categoria === "bloqueados" ? styles.filtroActive : ""}`}
              onClick={() => setCategoria("bloqueados")}
            >
              Bloqueados
            </button>
          </div>

          {/* Grid de productos */}
          <div className={styles.productosGrid}>
            {productosFiltrados.map((producto) => {
              const estaDesbloqueado = user && user.nivel >= producto.nivel_requerido;
              const tienePuntos = user && user.puntos_actuales >= producto.precio_puntos;
              const cantidadObtenida = getCantidadProducto(producto.id);
              
              return (
                <div 
                  key={producto.id} 
                  className={`${styles.productoCard} ${!estaDesbloqueado ? styles.productoBloqueado : ""}`}
                >
                  <div className={styles.productoEmoji}>{producto.emoji}</div>
                  <h3 className={styles.productoNombre}>{producto.nombre}</h3>
                  <p className={styles.productoDescripcion}>{producto.descripcion}</p>
                  
                  <div className={styles.productoRequisitos}>
                    <span className={styles.requisitoNivel}>
                      ⭐ Nivel {producto.nivel_requerido}
                    </span>
                    <span className={styles.requisitoPuntos}>
                      💰 {producto.precio_puntos} pts
                    </span>
                  </div>

                  {cantidadObtenida > 0 && (
                    <div className={styles.cantidadObtenida}>
                      ✨ Ya tienes {cantidadObtenida} unidad(es)
                    </div>
                  )}

                  {!estaDesbloqueado ? (
                    <div className={styles.bloqueadoInfo}>
                      <div className={styles.lockIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                      <span>Desbloquea en nivel {producto.nivel_requerido}</span>
                    </div>
                  ) : (
                    <button
                      className={`${styles.btnCanjear} ${!tienePuntos ? styles.btnBloqueado : ""}`}
                      onClick={() => canjearProducto(producto)}
                      disabled={!tienePuntos}
                    >
                      {tienePuntos ? `Canjear (${producto.precio_puntos} pts)` : "Puntos insuficientes"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {productosFiltrados.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay productos en esta categoría</p>
            </div>
          )}
        </div>

        {/* Mi Inventario */}
        {inventario.length > 0 && (
          <div className={styles.inventarioContainer}>
            <h2>📦 Mi Inventario</h2>
            <p>Productos que ya has canjeado</p>
            <div className={styles.inventarioGrid}>
              {inventario.map(item => {
                const producto = productos.find(p => p.id === item.producto_id);
                if (!producto) return null;
                return (
                  <div key={item.id} className={styles.inventarioItem}>
                    <div className={styles.inventarioEmoji}>{producto.emoji}</div>
                    <div className={styles.inventarioInfo}>
                      <div className={styles.inventarioNombre}>{producto.nombre}</div>
                      <div className={styles.inventarioCantidad}>Cantidad: {item.cantidad}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}