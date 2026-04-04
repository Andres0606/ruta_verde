"use client";

import styles from "../CSS/Footer.module.css";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Ola decorativa superior */}
      <div className={styles.wave}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="#1a3d2b"
          />
        </svg>
      </div>

      <div className={styles.inner}>
        {/* Bloque principal */}
        <div className={styles.top}>
          {/* Logo + descripción */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 2c2.5 3 4 6.5 4 10" />
                  <path d="M12 2c-2.5 3-4 6.5-4 10" />
                  <path d="M2 12h20" />
                  <path d="M12 12c3-2.5 6.5-4 10-4" />
                </svg>
              </div>
              <span className={styles.logoText}>
                Ruta<strong>Verde</strong>
              </span>
            </Link>
            <p className={styles.brandDesc}>
              La plataforma de reciclaje inteligente de Villavicencio. Clasifica,
              entrega y gana mientras cuidas el planeta.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialBtn} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className={styles.socialBtn} aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" className={styles.socialBtn} aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navGroup}>
            <h4 className={styles.navTitle}>Plataforma</h4>
            <ul className={styles.navList}>
              <li><Link href="/clasificar">Clasificar residuos</Link></li>
              <li><Link href="/mapa">Mapa de puntos</Link></li>
              <li><Link href="/historial">Mis entregas</Link></li>
              <li><Link href="/ranking">Ranking comunitario</Link></li>
            </ul>
          </div>

          <div className={styles.navGroup}>
            <h4 className={styles.navTitle}>Cuenta</h4>
            <ul className={styles.navList}>
              <li><Link href="/perfil">Mi perfil</Link></li>
              <li><Link href="/insignias">Mis insignias</Link></li>
              <li><Link href="/impacto">Mi impacto</Link></li>
              <li><Link href="/configuracion">Configuración</Link></li>
            </ul>
          </div>

          <div className={styles.navGroup}>
            <h4 className={styles.navTitle}>Más info</h4>
            <ul className={styles.navList}>
              <li><Link href="/acerca">Acerca del proyecto</Link></li>
              <li><Link href="/guia">Guía de reciclaje</Link></li>
              <li><Link href="/aliados">Puntos aliados</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
            </ul>
          </div>
        </div>

        {/* Impacto resumen */}
        <div className={styles.impactStrip}>
          <div className={styles.impactItem}>
            <span className={styles.impactEmoji}>♻️</span>
            <div>
              <strong>2,480 kg</strong>
              <small>reciclados</small>
            </div>
          </div>
          <div className={styles.impactDivider} />
          <div className={styles.impactItem}>
            <span className={styles.impactEmoji}>☁️</span>
            <div>
              <strong>2.4 ton</strong>
              <small>CO₂ evitado</small>
            </div>
          </div>
          <div className={styles.impactDivider} />
          <div className={styles.impactItem}>
            <span className={styles.impactEmoji}>🌳</span>
            <div>
              <strong>120</strong>
              <small>árboles equiv.</small>
            </div>
          </div>
          <div className={styles.impactDivider} />
          <div className={styles.impactItem}>
            <span className={styles.impactEmoji}>👥</span>
            <div>
              <strong>840</strong>
              <small>usuarios activos</small>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} RutaVerde · Hackathon 2610 · Universidad Cooperativa de Colombia
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/privacidad">Privacidad</Link>
            <span>·</span>
            <Link href="/terminos">Términos</Link>
            <span>·</span>
            <Link href="/cookies">Cookies</Link>
          </div>
          <div className={styles.madeWith}>
            Hecho con <span className={styles.heart}>💚</span> en Villavicencio
          </div>
        </div>
      </div>
    </footer>
  );
}