"use client";

import styles from "../CSS/modulos/page.module.css";
import Link from "next/link";
import Header from './header';
import Footer from './footer';



export default function InicioPage() {
  return (
    <>
      <Header currentPage="inicio" />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBlob1} />
          <div className={styles.heroBlob2} />

          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Villavicencio recicla inteligente
            </div>

            <h1 className={styles.heroTitle}>
              Reciclar nunca
              <br />
              <span className={styles.heroTitleAccent}>fue tan fácil</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Clasifica tus residuos con tu cámara, encuentra puntos de reciclaje
              cercanos y gana recompensas por cada entrega que haces.
            </p>

            <div className={styles.heroActions}>
              <Link href="/register" className={styles.btnPrimary}>
                Empezar ahora
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/login" className={styles.btnSecondary}>
                Ya tengo cuenta
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>2.4t</span>
                <span className={styles.statLabel}>CO₂ ahorrado</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNumber}>840</span>
                <span className={styles.statLabel}>Usuarios activos</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNumber}>34</span>
                <span className={styles.statLabel}>Puntos de reciclaje</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.phoneCard}>
              <div className={styles.phoneScreen}>
                <div className={styles.phoneHeader}>
                  <div className={styles.phoneAvatar}>JG</div>
                  <div>
                    <div className={styles.phoneName}>Juan García</div>
                    <div className={styles.phonePoints}>🌿 1,240 puntos</div>
                  </div>
                </div>

                <div className={styles.scanArea}>
                  <div className={styles.scanCorner} data-pos="tl" />
                  <div className={styles.scanCorner} data-pos="tr" />
                  <div className={styles.scanCorner} data-pos="bl" />
                  <div className={styles.scanCorner} data-pos="br" />
                  <div className={styles.scanLine} />
                  <div className={styles.scanIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <p className={styles.scanText}>Apunta al residuo</p>
                </div>

                <div className={styles.resultChip}>
                  <span className={styles.resultEmoji}>♻️</span>
                  <div>
                    <div className={styles.resultType}>Plástico PET</div>
                    <div className={styles.resultPoints}>+15 puntos</div>
                  </div>
                  <div className={styles.resultCheck}>✓</div>
                </div>
              </div>
            </div>

            <div className={styles.floatingCard1}>
              <span>🌳</span>
              <div>
                <strong>3 árboles</strong>
                <small>equivalentes este mes</small>
              </div>
            </div>

            <div className={styles.floatingCard2}>
              <span>🏆</span>
              <div>
                <strong>Insignia desbloqueada</strong>
                <small>Reciclador Experto</small>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresInner}>
            <div className={styles.sectionTag}>Cómo funciona</div>
            <h2 className={styles.sectionTitle}>Tres pasos para impactar</h2>

            <div className={styles.featureGrid}>
              <div className={styles.featureCard} data-step="1">
                <div className={styles.featureIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <h3>Fotografía y clasifica</h3>
                <p>
                  Toma una foto de tu residuo y nuestra IA te indica al instante
                  cómo separarlo correctamente y qué hacer con él.
                </p>
                <div className={styles.featureNumber}>01</div>
              </div>

              <div className={styles.featureCard} data-step="2">
                <div className={styles.featureIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <path d="M14 14h.01M14 17h.01M17 14h.01M21 14h.01M21 17h1v1h-1M17 17h1v4M14 21h3" />
                  </svg>
                </div>
                <h3>Genera tu QR y entrega</h3>
                <p>
                  Cada residuo registrado obtiene un código QR único. Llévalo al
                  punto de reciclaje más cercano y escanéalo para confirmar.
                </p>
                <div className={styles.featureNumber}>02</div>
              </div>

              <div className={styles.featureCard} data-step="3">
                <div className={styles.featureIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3>Acumula puntos e insignias</h3>
                <p>
                  Gana EcoPuntos en cada entrega, desbloquea insignias y mira
                  en tiempo real tu huella positiva sobre el planeta.
                </p>
                <div className={styles.featureNumber}>03</div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className={styles.impact}>
          <div className={styles.impactInner}>
            <div className={styles.impactText}>
              <div className={styles.sectionTag} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)" }}>
                Impacto real
              </div>
              <h2 className={styles.impactTitle}>
                Juntos estamos cambiando Villavicencio
              </h2>
              <p className={styles.impactSubtitle}>
                Cada residuo que clasificas y entregas se convierte en datos
                verificables de impacto ambiental. Aquí el progreso de nuestra comunidad.
              </p>
              <Link href="/register" className={styles.btnLight}>
                Únete al movimiento
              </Link>
            </div>

            <div className={styles.impactCards}>
              <div className={styles.impactCard}>
                <div className={styles.impactEmoji}>🌿</div>
                <div className={styles.impactValue}>2,480 kg</div>
                <div className={styles.impactLabel}>Residuos reciclados</div>
                <div className={styles.impactBar}>
                  <div className={styles.impactBarFill} style={{ width: "74%" }} />
                </div>
              </div>

              <div className={styles.impactCard}>
                <div className={styles.impactEmoji}>☁️</div>
                <div className={styles.impactValue}>2.4 ton</div>
                <div className={styles.impactLabel}>CO₂ evitado</div>
                <div className={styles.impactBar}>
                  <div className={styles.impactBarFill} style={{ width: "61%" }} />
                </div>
              </div>

              <div className={styles.impactCard}>
                <div className={styles.impactEmoji}>🌳</div>
                <div className={styles.impactValue}>120</div>
                <div className={styles.impactLabel}>Árboles equivalentes</div>
                <div className={styles.impactBar}>
                  <div className={styles.impactBarFill} style={{ width: "48%" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>¿Listo para reciclar con propósito?</h2>
            <p className={styles.ctaSubtitle}>
              Regístrate gratis y empieza a ganar puntos desde tu primera entrega.
            </p>
            <Link href="/register" className={styles.btnPrimary}>
              Crear mi cuenta gratis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}