"use client";

import styles from "../CSS/clasificar/clasificar.module.css";
import Header from "../Components/header";
import Footer from "../Components/footer";
import { useState, useRef, useCallback } from "react";

const RESULTADOS_MOCK = [
  { tipo: "Plástico PET", emoji: "♻️", puntos: 15, color: "#2563eb", consejo: "Aplasta la botella antes de entregar. Ve al punto azul más cercano.", categoria: "Reciclable" },
  { tipo: "Cartón / Papel", emoji: "📦", puntos: 10, color: "#92400e", consejo: "Retira grapas o cinta adhesiva. Dobla para reducir volumen.", categoria: "Reciclable" },
  { tipo: "Vidrio", emoji: "🍶", puntos: 20, color: "#0e7490", consejo: "No mezcles colores. Llévalo al contenedor verde.", categoria: "Reciclable" },
  { tipo: "Residuo Orgánico", emoji: "🌿", puntos: 8, color: "#15803d", consejo: "Ideal para compostaje. Separa de otros residuos.", categoria: "Orgánico" },
  { tipo: "Metal / Lata", emoji: "🥫", puntos: 25, color: "#6b7280", consejo: "Enjuaga antes de entregar. Tiene alto valor de reciclaje.", categoria: "Reciclable" },
];

type Fase = "idle" | "camara" | "captura" | "analizando" | "resultado";

export default function ClasificarPage() {
  const [fase, setFase] = useState<Fase>("idle");
  const [resultado, setResultado] = useState<(typeof RESULTADOS_MOCK)[0] | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [arrastrar, setArrastrar] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Abrir cámara */
  const abrirCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setFase("camara");
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      alert("No se pudo acceder a la cámara. Intenta subir una imagen.");
    }
  };

  const cerrarCamara = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setFase("idle");
  };

  /* Capturar foto */
  const capturar = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const url = canvas.toDataURL("image/jpeg");
    setFotoUrl(url);
    cerrarCamara();
    analizar();
  };

  /* Subir imagen */
  const subirImagen = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFotoUrl(e.target?.result as string);
      analizar();
    };
    reader.readAsDataURL(file);
  };

  /* Análisis simulado */
  const analizar = () => {
    setFase("analizando");
    setTimeout(() => {
      const r = RESULTADOS_MOCK[Math.floor(Math.random() * RESULTADOS_MOCK.length)];
      setResultado(r);
      setFase("resultado");
    }, 2800);
  };

  const reiniciar = () => {
    setFase("idle");
    setResultado(null);
    setFotoUrl(null);
  };

  /* Drag & Drop */
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastrar(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) subirImagen(file);
  }, []);

  return (
    <>
      <Header currentPage="clasificar" />
      <main className={styles.main}>

        {/* Hero top */}
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div>
              <h1 className={styles.pageTitle}>Clasificar residuo</h1>
              <p className={styles.pageSubtitle}>Usa tu cámara o sube una foto para identificar el tipo de residuo</p>
            </div>
            <div className={styles.topBadge}>
              <span>🤖</span> IA activa
            </div>
          </div>
        </div>

        <div className={styles.layout}>

          {/* Panel principal */}
          <div className={styles.mainPanel}>

            {/* IDLE — zona de carga */}
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

            {/* CÁMARA activa */}
            {fase === "camara" && (
              <div className={styles.cameraContainer}>
                <video ref={videoRef} autoPlay playsInline muted className={styles.videoFeed} />
                <canvas ref={canvasRef} style={{ display: "none" }} />

                {/* Overlay de encuadre */}
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

            {/* ANALIZANDO */}
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
                  <p className={styles.analyzeLabel}>Analizando residuo…</p>
                  <div className={styles.analyzeDots}>
                    <div /><div /><div />
                  </div>
                </div>
              </div>
            )}

            {/* RESULTADO */}
            {fase === "resultado" && resultado && (
              <div className={styles.resultState}>
                {fotoUrl && (
                  <div className={styles.resultImageWrap}>
                    <img src={fotoUrl} alt="Residuo" className={styles.resultImage} />
                    <div className={styles.resultBadgeImg}>
                      <span style={{ fontSize: 28 }}>{resultado.emoji}</span>
                    </div>
                  </div>
                )}

                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <div>
                      <div className={styles.resultCat}>{resultado.categoria}</div>
                      <h2 className={styles.resultTipo}>{resultado.tipo}</h2>
                    </div>
                    <div className={styles.resultPuntosChip}>
                      <span>+{resultado.puntos}</span>
                      <small>EcoPuntos</small>
                    </div>
                  </div>

                  <div className={styles.resultConsejo}>
                    <div className={styles.consejoIcon}>💡</div>
                    <p>{resultado.consejo}</p>
                  </div>

                  <div className={styles.resultActions}>
                    <button className={styles.btnQR}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 17h.01M17 14h.01M21 14h.01M21 17h1v1h-1M17 17h1v4M14 21h3"/>
                      </svg>
                      Generar QR de entrega
                    </button>
                    <button className={styles.btnReintentar} onClick={reiniciar}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
                      </svg>
                      Clasificar otro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral — historial */}
          <div className={styles.sidePanel}>
            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Tipos de residuos</h3>
              <div className={styles.tiposList}>
                {[
                  { emoji: "♻️", label: "Plástico", color: "#2563eb" },
                  { emoji: "📦", label: "Cartón", color: "#92400e" },
                  { emoji: "🍶", label: "Vidrio", color: "#0e7490" },
                  { emoji: "🥫", label: "Metal", color: "#6b7280" },
                  { emoji: "🌿", label: "Orgánico", color: "#15803d" },
                  { emoji: "⚠️", label: "Peligroso", color: "#dc2626" },
                ].map((t) => (
                  <div key={t.label} className={styles.tipoItem}>
                    <span className={styles.tipoEmoji}>{t.emoji}</span>
                    <span className={styles.tipoLabel}>{t.label}</span>
                    <div className={styles.tipoDot} style={{ background: t.color }} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Tu sesión</h3>
              <div className={styles.sessionStats}>
                <div className={styles.sessionStat}>
                  <span className={styles.sessionNum}>0</span>
                  <span className={styles.sessionLabel}>Clasificados hoy</span>
                </div>
                <div className={styles.sessionStat}>
                  <span className={styles.sessionNum}>0</span>
                  <span className={styles.sessionLabel}>Puntos ganados</span>
                </div>
              </div>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipEmoji}>🌳</div>
              <p>Reciclar <strong>1 kg de plástico</strong> puede ahorrar hasta <strong>2 kg de CO₂</strong></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}