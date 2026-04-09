"use client";

import styles from "../CSS/clasificar/clasificar.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

type Fase = "idle" | "camara" | "captura" | "analizando" | "resultado";

interface ResultadoReal {
  success: boolean;
  tipo: string;
  categoria_original?: string;
  confianza: number;
  puntos: number;
  puntos_totales?: number;
  mensaje?: string;
  consejo?: string;
  emoji?: string;
  puedeGenerarQR?: boolean;
  qr_code?: string;
  residuo_id?: number;
  modelo_usado?: string;
}

interface PuntoReciclaje {
  id: number;
  nombre: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  horario_atencion: string | null;
  contacto_telefono: string | null;
  contacto_email: string | null;
  tipo: string | null;
  activo: boolean | null;
  Comuna: string;
}

export default function ClasificarPage() {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("idle");
  const [resultado, setResultado] = useState<ResultadoReal | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [arrastrar, setArrastrar] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [modeloActivo, setModeloActivo] = useState<"simple" | "avanzado">("simple");
  const [mostrarQR, setMostrarQR] = useState(false);
  const [qrGenerado, setQrGenerado] = useState<string | null>(null);
  const [puntosReciclaje, setPuntosReciclaje] = useState<PuntoReciclaje[]>([]);
  const [cargandoPuntos, setCargandoPuntos] = useState(true);
  const [comunaFiltro, setComunaFiltro] = useState<string>("todas");
  const [puntoExpandido, setPuntoExpandido] = useState<number | null>(null);
  
  // Estados para escaneo QR
  const [mostrarEscanerQR, setMostrarEscanerQR] = useState(false);
  const [verificandoQR, setVerificandoQR] = useState(false);
  const [mensajeQR, setMensajeQR] = useState<{ texto: string; tipo: "success" | "error" | "info" } | null>(null);
  const [codigoQRManual, setCodigoQRManual] = useState("");
  
  // Estados para selección de punto de reciclaje
  const [mostrarSelectorPuntos, setMostrarSelectorPuntos] = useState(false);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<number | null>(null);
  const [qrEscaneadoTemp, setQrEscaneadoTemp] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Función para obtener el ID de comuna basado en el nombre
  const obtenerIdComuna = (comuna: string): number | null => {
    const mapaComunas: Record<string, number> = {
      'Comuna 1': 1,
      'Comuna 2': 2,
      'Comuna 3': 3,
      'Comuna 4': 4,
      'Comuna 5': 5,
      'Comuna 6': 6,
      'Comuna 7': 7,
      'Comuna 8': 8,
    };
    return mapaComunas[comuna] || null;
  };

  const cargarPuntosReciclaje = async () => {
    setCargandoPuntos(true);
    try {
      const { data: puntos, error } = await supabase
        .from('puntos_reciclaje')
        .select('*')
        .eq('activo', true);

      if (error) {
        console.error('Error al cargar puntos:', error);
        setPuntosReciclaje([]);
      } else {
        setPuntosReciclaje(puntos || []);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setPuntosReciclaje([]);
    } finally {
      setCargandoPuntos(false);
    }
  };

  useEffect(() => {
    const verificarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/Login');
        return;
      }

      setAccessToken(session.access_token);

      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uuid', session.user.id)
        .single();

      setUsuario(dbUser);
      await cargarPuntosReciclaje();
      setCargandoUsuario(false);
    };

    verificarAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAccessToken(session.access_token);
      } else {
        router.push('/Login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const comunasUnicas = ["todas", ...Array.from(new Set(puntosReciclaje.map(p => p.Comuna)))];
  const puntosFiltrados = comunaFiltro === "todas"
    ? puntosReciclaje
    : puntosReciclaje.filter(p => p.Comuna === comunaFiltro);

  const abrirCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setFase("camara");
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setErrorMsg("No se pudo acceder a la cámara. Intenta subir una imagen.");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const cerrarCamara = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setFase("idle");
  };

  const capturar = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], "foto.jpg", { type: "image/jpeg" });
        setFotoUrl(URL.createObjectURL(blob));
        cerrarCamara();
        await analizarConIA(file);
      }
    }, "image/jpeg", 0.9);
  };

  const subirImagen = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFotoUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    await analizarConIA(file);
  };

  const analizarConIA = async (file: File) => {
    setFase("analizando");
    setErrorMsg(null);
    setMostrarQR(false);
    setQrGenerado(null);

    if (!accessToken) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg('Debes iniciar sesión primero');
        setFase("idle");
        return;
      }
      setAccessToken(session.access_token);
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('modelo', modeloActivo);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al analizar la imagen');
      }

      setResultado(data);
      setFase("resultado");

      if (data.puedeGenerarQR && data.qr_code) {
        setQrGenerado(data.qr_code);
      }

    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Error al analizar. Intenta de nuevo.');
      setFase("idle");
      setFotoUrl(null);
    }
  };

  // ✅ FUNCIÓN PARA REGISTRAR ENTREGA CON PUNTO DE RECICLAJE Y ID COMUNA
  const registrarEntregaConPunto = async (codigoQR: string, puntoId: number) => {
    setVerificandoQR(true);
    setMensajeQR(null);
    
    try {
      // Limpiar el código QR y extraer el UUID
      let usuarioUUID = codigoQR.trim();
      const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
      const match = usuarioUUID.match(uuidRegex);
      if (match) {
        usuarioUUID = match[0];
      }
      
      // Buscar al usuario dueño del QR
      const { data: usuarioDuenno, error: usuarioError } = await supabase
        .from('users')
        .select('id, nombre, puntos_actuales, auth_uuid')
        .eq('auth_uuid', usuarioUUID)
        .single();

      if (usuarioError || !usuarioDuenno) {
        setMensajeQR({ texto: `❌ Usuario no encontrado.`, tipo: "error" });
        setVerificandoQR(false);
        return;
      }

      // Obtener información del punto de reciclaje seleccionado (incluye comuna)
      const { data: puntoInfo, error: puntoError } = await supabase
        .from('puntos_reciclaje')
        .select('nombre, Comuna')
        .eq('id', puntoId)
        .single();

      if (puntoError) {
        console.error("Error al obtener punto:", puntoError);
      }

      // Obtener el ID de la comuna
      const idComuna = puntoInfo ? obtenerIdComuna(puntoInfo.Comuna) : null;

      // Buscar residuo registrado
      const { data: residuoPendiente, error: residuoError } = await supabase
        .from('residuos')
        .select('*')
        .eq('usuario_id', usuarioDuenno.id)
        .eq('estado', 'registrado')
        .order('fecha_registro', { ascending: false })
        .limit(1)
        .single();

      if (residuoError || !residuoPendiente) {
        setMensajeQR({ texto: `❌ El usuario no tiene residuos registrados.`, tipo: "error" });
        setVerificandoQR(false);
        return;
      }

      const puntosGanados = residuoPendiente.puntos_otorgados || 100;
      
      // 1. Registrar la entrega con el punto de reciclaje seleccionado y el id_comuna
      const { error: entregaError } = await supabase
        .from('entregas')
        .insert({
          residuo_id: residuoPendiente.id,
          usuario_id: usuarioDuenno.id,
          punto_reciclaje_id: puntoId,
          id_comuna: idComuna, // ✅ ID de la comuna
          codigo_verificacion: codigoQR,
          imagen_evidencia_url: null,
          estado_entrega: 'verificada',
          observaciones: `Residuo entregado en ${puntoInfo?.nombre || 'punto de reciclaje'} (Comuna: ${puntoInfo?.Comuna || 'N/A'}) - ID Comuna: ${idComuna}`
        });
      
      if (entregaError) {
        console.error("Error:", entregaError);
        setMensajeQR({ texto: `❌ Error: ${entregaError.message}`, tipo: "error" });
        setVerificandoQR(false);
        return;
      }

      // 2. Actualizar residuo a entregado
      await supabase
        .from('residuos')
        .update({ estado: 'entregado' })
        .eq('id', residuoPendiente.id);

      // 3. Registrar historial
      await supabase
        .from('historial_puntos')
        .insert({
          usuario_id: usuarioDuenno.id,
          puntos: puntosGanados,
          concepto: `Reciclaje completado - Punto: ${puntoInfo?.nombre || 'Punto de reciclaje'} (Comuna: ${puntoInfo?.Comuna || 'N/A'}, ID Comuna: ${idComuna})`,
          referencia_id: residuoPendiente.id,
          fecha: new Date().toISOString()
        });

      // 4. Actualizar puntos
      const nuevosPuntos = (usuarioDuenno.puntos_actuales || 0) + puntosGanados;
      await supabase
        .from('users')
        .update({ puntos_actuales: nuevosPuntos })
        .eq('id', usuarioDuenno.id);

      if (usuarioDuenno.id === usuario?.id) {
        setUsuario({ ...usuario, puntos_actuales: nuevosPuntos });
      }

      setMensajeQR({ 
        texto: `🎉 ¡Reciclaje completado! ${usuarioDuenno.nombre} ha recibido ${puntosGanados} puntos. Entrega en: ${puntoInfo?.nombre || 'Punto'} (${puntoInfo?.Comuna || 'Comuna N/A'}) - ID Comuna: ${idComuna}`, 
        tipo: "success" 
      });
      
      setTimeout(() => {
        cerrarEscanerQR();
        setMostrarSelectorPuntos(false);
        setPuntoSeleccionado(null);
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      setMensajeQR({ texto: "❌ Error al procesar.", tipo: "error" });
    } finally {
      setVerificandoQR(false);
    }
  };

  // Función que se llama al escanear el QR
  const handleQREscaneado = (decodedText: string) => {
    if (!verificandoQR) {
      html5QrCodeRef.current?.stop();
      setQrEscaneadoTemp(decodedText);
      setMostrarSelectorPuntos(true);
      setMensajeQR({ texto: "Selecciona el punto de reciclaje donde se entrega el residuo", tipo: "info" });
    }
  };

  // Iniciar escáner QR
  const iniciarScannerQR = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    }

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleQREscaneado,
        (errorMessage) => {}
      );
    } catch (err) {
      console.error("Error al iniciar escáner:", err);
      setMensajeQR({ texto: "No se pudo iniciar la cámara.", tipo: "error" });
    }
  };

  const abrirEscanerQR = async () => {
    setMostrarEscanerQR(true);
    setMensajeQR(null);
    setCodigoQRManual("");
    setMostrarSelectorPuntos(false);
    setPuntoSeleccionado(null);
    
    setTimeout(async () => {
      await iniciarScannerQR();
    }, 500);
  };

  const cerrarEscanerQR = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (error) {}
      html5QrCodeRef.current = null;
    }
    setMostrarEscanerQR(false);
    setMensajeQR(null);
    setVerificandoQR(false);
    setCodigoQRManual("");
    setMostrarSelectorPuntos(false);
    setPuntoSeleccionado(null);
  };

  const ingresarQRManual = async () => {
    if (!codigoQRManual.trim()) {
      setMensajeQR({ texto: "Por favor ingresa un código QR", tipo: "error" });
      return;
    }
    setQrEscaneadoTemp(codigoQRManual.trim());
    setMostrarSelectorPuntos(true);
    setMensajeQR({ texto: "Selecciona el punto de reciclaje donde se entrega el residuo", tipo: "info" });
  };

  const reiniciar = () => {
    setFase("idle");
    setResultado(null);
    setFotoUrl(null);
    setErrorMsg(null);
    setMostrarQR(false);
    setQrGenerado(null);
  };

  const generarQR = () => {
    if (qrGenerado) {
      setMostrarQR(true);
    } else if (resultado?.puedeGenerarQR === false || (resultado?.confianza && resultado.confianza < 80)) {
      alert(`⚠️ Confianza baja (${resultado.confianza}%). Se requiere mínimo 80% para generar QR.`);
    } else {
      alert('No hay un QR disponible para este residuo.');
    }
  };

  const getEmojiPorTipo = (tipo: string, categoriaOriginal?: string): string => {
    if (categoriaOriginal === 'GLASS') return '🍶';
    if (categoriaOriginal === 'PLASTIC') return '♻️';
    if (categoriaOriginal === 'PAPER') return '📄';
    if (categoriaOriginal === 'METAL') return '🥫';
    if (categoriaOriginal === 'ORGANIC') return '🌿';
    if (categoriaOriginal === 'CARDBOARD') return '📦';
    if (categoriaOriginal === 'PET') return '🥤';
    if (categoriaOriginal === 'ALUMINUM') return '🥫';
    if (tipo === 'Vidrio') return '🍶';
    if (tipo === 'Plástico') return '♻️';
    if (tipo === 'Papel') return '📄';
    if (tipo === 'Metal') return '🥫';
    if (tipo === 'Orgánico') return '🌿';
    if (tipo === 'Cartón') return '📦';
    return '♻️';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastrar(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) subirImagen(file);
  }, [accessToken, modeloActivo]);

  if (cargandoUsuario) {
    return (
      <>
        <Header currentPage="clasificar" />
        <main className={styles.main}>
          <div className={styles.loadingState}>Cargando...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header currentPage="clasificar" />
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div>
              <h1 className={styles.pageTitle}>Clasificar residuo</h1>
              <p className={styles.pageSubtitle}>Usa tu cámara o sube una foto para identificar el tipo de residuo</p>
            </div>
            <div className={styles.topBadge}>
              <span>🤖</span> IA activa
              {usuario && (
                <span style={{ marginLeft: 12, background: '#2d6a4f', padding: '4px 8px', borderRadius: 20 }}>
                  🪙 {usuario.puntos_actuales || 0} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className={styles.errorBanner}>⚠️ {errorMsg}</div>
        )}

        <div className={styles.layout}>
          <div className={styles.mainPanel}>
            {fase === "idle" && (
              <div
                className={`${styles.dropZone} ${arrastrar ? styles.dropping : ""}`}
                onDragOver={(e) => { e.preventDefault(); setArrastrar(true); }}
                onDragLeave={() => setArrastrar(false)}
                onDrop={onDrop}
              >
                <div className={styles.dropIcon}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <h2 className={styles.dropTitle}>Fotografía tu residuo</h2>
                <p className={styles.dropHint}>Arrastra una imagen aquí o elige una opción</p>

                <div className={styles.modelSelector}>
                  <label className={`${styles.modelLabel} ${modeloActivo === "simple" ? styles.modelActive : ""}`}>
                    <input type="radio" value="simple" checked={modeloActivo === "simple"} onChange={() => setModeloActivo("simple")} />
                    <div className={styles.modelInfo}>
                      <span className={styles.modelName}>🔍 Modelo Simple</span>
                      <small>Plástico, Papel, Vidrio, Metal, Orgánico</small>
                    </div>
                  </label>
                  <label className={`${styles.modelLabel} ${modeloActivo === "avanzado" ? styles.modelActive : ""}`}>
                    <input type="radio" value="avanzado" checked={modeloActivo === "avanzado"} onChange={() => setModeloActivo("avanzado")} />
                    <div className={styles.modelInfo}>
                      <span className={styles.modelName}>🎯 Modelo Avanzado</span>
                      <small>PET, HDPE, PVC, LDPE, PP, PS, Aluminio, Acero...</small>
                    </div>
                  </label>
                </div>

                <div className={styles.dropActions}>
                  <button className={styles.btnCamera} onClick={abrirCamara}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Abrir cámara
                  </button>
                  <button className={styles.btnUpload} onClick={() => inputRef.current?.click()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Subir imagen
                  </button>
                </div>
                <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f); }} />

                <div className={styles.dropTip}>
                  <span>💡</span> Apunta directo al residuo con buena iluminación para mejores resultados
                </div>
              </div>
            )}

            {fase === "camara" && (
              <div className={styles.cameraContainer}>
                <video ref={videoRef} autoPlay playsInline muted className={styles.videoFeed} />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className={styles.cameraOverlay}>
                  <div className={styles.scanFrame}>
                    <div className={styles.corner} data-pos="tl" />
                    <div className={styles.corner} data-pos="tr" />
                    <div className={styles.corner} data-pos="bl" />
                    <div className={styles.corner} data-pos="br" />
                    <div className={styles.scanBeam} />
                  </div>
                  <p className={styles.cameraHint}>Centra el residuo en el encuadre</p>
                </div>
                <div className={styles.cameraControls}>
                  <button className={styles.btnClose} onClick={cerrarCamara}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <button className={styles.btnShutter} onClick={capturar}>
                    <div className={styles.shutterInner} />
                  </button>
                  <div style={{ width: 48 }} />
                </div>
              </div>
            )}

            {fase === "analizando" && (
              <div className={styles.analyzeState}>
                {fotoUrl && <img src={fotoUrl} alt="Captura" className={styles.captureThumb} />}
                <div className={styles.analyzeOverlay}>
                  <div className={styles.analyzeRing}>
                    <div className={styles.analyzeRingInner}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#74c69d" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                  </div>
                  <p className={styles.analyzeLabel}>
                    Analizando con {modeloActivo === "simple" ? "Modelo Simple" : "Modelo Avanzado"}...
                  </p>
                  <div className={styles.analyzeDots}>
                    <div /><div /><div />
                  </div>
                </div>
              </div>
            )}

            {fase === "resultado" && resultado && (
              <div className={styles.resultState}>
                {fotoUrl && (
                  <div className={styles.resultImageWrap}>
                    <img src={fotoUrl} alt="Residuo" className={styles.resultImage} />
                    <div className={styles.resultBadgeImg}>
                      <span style={{ fontSize: 28 }}>{resultado.emoji || getEmojiPorTipo(resultado.tipo, resultado.categoria_original)}</span>
                    </div>
                    <div className={`${styles.confianzaBadge} ${resultado.confianza >= 80 ? styles.confianzaAlta : styles.confianzaBaja}`}>
                      {resultado.confianza}% confianza
                    </div>
                  </div>
                )}

                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <div>
                      <div className={styles.resultCat}>
                        {resultado.categoria_original === 'GLASS' ? 'Vidrio' :
                         resultado.categoria_original === 'PAPER' ? 'Papel' :
                         resultado.categoria_original === 'PLASTIC' ? 'Plástico' :
                         resultado.categoria_original === 'METAL' ? 'Metal' :
                         resultado.categoria_original === 'ORGANIC' ? 'Orgánico' :
                         resultado.categoria_original === 'CARDBOARD' ? 'Cartón' :
                         resultado.categoria_original === 'PET' ? 'PET' :
                         resultado.categoria_original === 'ALUMINUM' ? 'Aluminio' :
                         resultado.tipo}
                      </div>
                      <h2 className={styles.resultTipo}>{resultado.tipo}</h2>
                    </div>
                    <div className={styles.resultPuntosChip}>
                      <span>+{resultado.puntos}</span>
                      <small>EcoPuntos</small>
                    </div>
                  </div>

                  <div className={styles.resultConsejo}>
                    <div className={styles.consejoIcon}>💡</div>
                    <p>{resultado.consejo || resultado.mensaje || `¡Es ${resultado.tipo}!`}</p>
                  </div>

                  {resultado.confianza < 80 && (
                    <div className={styles.warningBanner}>
                      ⚠️ Confianza baja ({resultado.confianza}%). Se requiere mínimo 80% para generar QR.
                    </div>
                  )}

                  {mostrarQR && qrGenerado && (
                    <div className={styles.qrContainer}>
                      <div className={styles.qrCard}>
                        <h4>📱 Código QR de entrega</h4>
                        <div className={styles.qrCode}>{qrGenerado}</div>
                        <p>Presenta este código en el punto de reciclaje para recibir tus puntos</p>
                        <button
                          className={styles.btnCopiar}
                          onClick={() => { navigator.clipboard.writeText(qrGenerado); alert('Código copiado'); }}
                        >
                          📋 Copiar código
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={styles.resultActions}>
                    <button
                      className={`${styles.btnQR} ${resultado.confianza < 80 ? styles.btnDisabled : ""}`}
                      onClick={generarQR}
                      disabled={resultado.confianza < 80}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 17h.01M17 14h.01M21 14h.01M21 17h1v1h-1M17 17h1v4M14 21h3"/>
                      </svg>
                      {resultado.confianza >= 80 ? "Generar QR de entrega" : "Confianza insuficiente"}
                    </button>
                    <button className={styles.btnReintentar} onClick={reiniciar}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
                      </svg>
                      Clasificar otro
                    </button>
                  </div>

                  <div className={styles.escaneoQRSeccion}>
                    <div className={styles.escaneoQRHeader}>
                      <span className={styles.escaneoQRIcon}>🏪</span>
                      <h4>Punto de Reciclaje - Escanear QR</h4>
                    </div>
                    <p className={styles.escaneoQRDescripcion}>
                      Escanea el código QR del usuario para registrar la entrega del residuo y otorgar sus EcoPuntos.
                    </p>
                    <button className={styles.btnEscanearQR} onClick={abrirEscanerQR}>
                      <span>📱</span> Escanear QR de usuario
                    </button>
                  </div>

                  <div className={styles.modelInfoFooter}>
                    <small>🔬 Clasificado con: {resultado.modelo_usado || (modeloActivo === "simple" ? "Modelo Simple" : "Modelo Avanzado")}</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.sidePanel}>
            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>♻️ Tipos de residuos</h3>
              <div className={styles.tiposList}>
                {[
                  { emoji: "♻️", label: "Plástico", caneca: "Caneca Azul", color: "#2563eb", ejemplo: "Botellas, envases, bolsas" },
                  { emoji: "📦", label: "Cartón y Papel", caneca: "Caneca Café", color: "#92400e", ejemplo: "Cajas, periódicos, cuadernos" },
                  { emoji: "🍶", label: "Vidrio", caneca: "Caneca Verde", color: "#0e7490", ejemplo: "Botellas, frascos, tarros" },
                  { emoji: "🥫", label: "Metal", caneca: "Caneca Gris", color: "#6b7280", ejemplo: "Latas, aluminio, acero" },
                  { emoji: "🌿", label: "Orgánico", caneca: "Caneca Negra", color: "#15803d", ejemplo: "Restos de comida, cáscaras" },
                  { emoji: "⚡", label: "Residuos Electrónicos", caneca: "Punto Limpio", color: "#dc2626", ejemplo: "Pilas, cables, celulares" },
                  { emoji: "💊", label: "Residuos Peligrosos", caneca: "Punto Especial", color: "#f59e0b", ejemplo: "Químicos, medicamentos" },
                ].map((t) => (
                  <div key={t.label} className={styles.tipoItem}>
                    <span className={styles.tipoEmoji}>{t.emoji}</span>
                    <div className={styles.tipoInfo}>
                      <div className={styles.tipoLabelRow}>
                        <span className={styles.tipoLabel}>{t.label}</span>
                        <span className={styles.canecaBadge} style={{ backgroundColor: t.color }}>
                          {t.caneca}
                        </span>
                      </div>
                      <span className={styles.tipoEjemplo}>{t.ejemplo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>📊 Tu progreso</h3>
              <div className={styles.sessionStats}>
                <div className={styles.sessionStat}>
                  <span className={styles.sessionNum}>{usuario?.puntos_actuales || 0}</span>
                  <span className={styles.sessionLabel}>Puntos totales</span>
                </div>
                <div className={styles.sessionStat}>
                  <span className={styles.sessionNum}>{usuario?.nivel || 1}</span>
                  <span className={styles.sessionLabel}>Nivel</span>
                </div>
              </div>
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>
                📍 Puntos de reciclaje
                <span className={styles.puntosContadorInline}>({puntosFiltrados.length})</span>
              </h3>

              {puntosReciclaje.length > 0 && (
                <select
                  className={styles.puntosSelect}
                  value={comunaFiltro}
                  onChange={(e) => {
                    setComunaFiltro(e.target.value);
                    setPuntoExpandido(null);
                  }}
                >
                  {comunasUnicas.map((comuna) => (
                    <option key={comuna} value={comuna}>
                      {comuna === "todas" ? "Todas las comunas" : comuna}
                    </option>
                  ))}
                </select>
              )}

              {cargandoPuntos && (
                <div className={styles.puntosCargando}>
                  <div className={styles.puntosCargandoSpinner} />
                  Cargando puntos...
                </div>
              )}

              {!cargandoPuntos && (
                <div className={styles.puntosList}>
                  {puntosFiltrados.length === 0 && (
                    <p className={styles.puntosVacio}>No hay puntos disponibles en esta comuna.</p>
                  )}

                  {puntosFiltrados.map((punto) => (
                    <div
                      key={punto.id}
                      className={`${styles.puntoItem} ${puntoExpandido === punto.id ? styles.puntoItemActivo : ""}`}
                      onClick={() => setPuntoExpandido(puntoExpandido === punto.id ? null : punto.id)}
                    >
                      <div className={styles.puntoItemHeader}>
                        <div>
                          <p className={styles.puntoNombre}>{punto.nombre}</p>
                          <p className={styles.puntoComuna}>{punto.Comuna}</p>
                        </div>
                        <span className={`${styles.puntoChevron} ${puntoExpandido === punto.id ? styles.puntoChevronAbierto : ""}`}>
                          ▼
                        </span>
                      </div>

                      {puntoExpandido === punto.id && (
                        <div className={styles.puntoDetalle}>
                          {punto.direccion && (
                            <div className={styles.puntoDetalleRow}>
                              <span className={styles.puntoDetalleIcon}>📍</span>
                              <p className={styles.puntoDetalleTexto}>{punto.direccion}</p>
                            </div>
                          )}
                          {punto.tipo && (
                            <div className={styles.puntoDetalleRow}>
                              <span className={styles.puntoDetalleIcon}>🏷️</span>
                              <p className={styles.puntoDetalleTexto} style={{ textTransform: "capitalize" }}>{punto.tipo}</p>
                            </div>
                          )}
                          {punto.horario_atencion && (
                            <div className={styles.puntoDetalleRow}>
                              <span className={styles.puntoDetalleIcon}>🕐</span>
                              <p className={styles.puntoDetalleTexto}>{punto.horario_atencion}</p>
                            </div>
                          )}
                          {punto.contacto_telefono && (
                            <div className={styles.puntoDetalleRow}>
                              <span className={styles.puntoDetalleIcon}>📞</span>
                              <p className={styles.puntoDetalleTexto}>{punto.contacto_telefono}</p>
                            </div>
                          )}
                          {punto.contacto_email && (
                            <div className={styles.puntoDetalleRow}>
                              <span className={styles.puntoDetalleIcon}>✉️</span>
                              <p className={styles.puntoDetalleTexto}>{punto.contacto_email}</p>
                            </div>
                          )}
                          {punto.latitud && punto.longitud && (
                            <button
                              className={styles.puntoMapaBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://maps.google.com/?q=${punto.latitud},${punto.longitud}`, '_blank');
                              }}
                            >
                              🗺️ Abrir en Google Maps
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!cargandoPuntos && puntosReciclaje.length > 0 && (
                <p className={styles.puntosHint}>
                  💡 Haz clic en un punto para ver más detalles
                </p>
              )}
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipEmoji}>🌳</div>
              <p>Reciclar <strong>1 kg de plástico</strong> puede ahorrar hasta <strong>2 kg de CO₂</strong></p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal del escáner QR con selector de puntos */}
      {mostrarEscanerQR && (
        <div className={styles.modalOverlay} onClick={cerrarEscanerQR}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🏪 Punto de Reciclaje - Escanear QR</h3>
              <button className={styles.modalClose} onClick={cerrarEscanerQR}>✕</button>
            </div>
            
            {!mostrarSelectorPuntos ? (
              <>
                <div className={styles.qrScannerContainer}>
                  <div id="qr-reader" style={{ width: "100%" }}></div>
                </div>

                <div className={styles.qrManualSection}>
                  <div className={styles.qrManualDivider}>
                    <span>O ingresa el UUID manualmente</span>
                  </div>
                  <div className={styles.qrManualInput}>
                    <input
                      type="text"
                      placeholder="Ej: 03fe25f4-631b-42ae-b88d-30a30df077ce"
                      value={codigoQRManual}
                      onChange={(e) => setCodigoQRManual(e.target.value)}
                      className={styles.qrManualInputField}
                    />
                    <button
                      className={styles.btnManualVerificar}
                      onClick={ingresarQRManual}
                      disabled={verificandoQR}
                    >
                      Verificar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.selectorPuntosContainer}>
                <h4>📍 Selecciona el punto de reciclaje</h4>
                <div className={styles.listaPuntosSelector}>
                  {puntosReciclaje.map((punto) => (
                    <button
                      key={punto.id}
                      className={`${styles.puntoSelectorBtn} ${puntoSeleccionado === punto.id ? styles.puntoSelectorActive : ""}`}
                      onClick={() => {
                        setPuntoSeleccionado(punto.id);
                        registrarEntregaConPunto(qrEscaneadoTemp, punto.id);
                      }}
                    >
                      <strong>{punto.nombre}</strong>
                      <small>📍 Comuna: {punto.Comuna}</small>
                      {punto.direccion && <span>📌 {punto.direccion}</span>}
                    </button>
                  ))}
                </div>
                <button 
                  className={styles.btnVolverEscaner}
                  onClick={() => {
                    setMostrarSelectorPuntos(false);
                    setMensajeQR(null);
                    iniciarScannerQR();
                  }}
                >
                  ← Volver a escanear
                </button>
              </div>
            )}

            {verificandoQR && (
              <div className={styles.qrVerificando}>
                <div className={styles.spinner}></div>
                <p>Procesando entrega...</p>
              </div>
            )}
            
            {mensajeQR && !mostrarSelectorPuntos && (
              <div className={`${styles.qrMensaje} ${styles[`qrMensaje${mensajeQR.tipo}`]}`}>
                {mensajeQR.texto}
              </div>
            )}
            
            <div className={styles.modalFooter}>
              <button className={styles.btnCerrarQR} onClick={cerrarEscanerQR}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}