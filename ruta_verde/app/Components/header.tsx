"use client";

import styles from "../CSS/Header.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        {/* Nav principal */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <Link
            href="/clasificar"
            className={`${styles.navLink} ${currentPage === "clasificar" ? styles.active : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Clasificar
          </Link>

          <Link
            href="/mapa"
            className={`${styles.navLink} ${currentPage === "mapa" ? styles.active : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Mapa
          </Link>

          <Link
            href="/ecopuntos"
            className={`${styles.navLink} ${currentPage === "puntos" ? styles.active : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            EcoPuntos
          </Link>

          <Link
            href="/ranking"
            className={`${styles.navLink} ${currentPage === "ranking" ? styles.active : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            Ranking
          </Link>
        </nav>

        {/* Acciones */}
        <div className={styles.actions}>
          <Link href="/Login" className={styles.btnLogin}>
            Iniciar sesión
          </Link>
          <Link href="/Register" className={styles.btnRegister}>
            Registrarse
          </Link>
        </div>

        {/* Hamburguesa */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Overlay mobile */}
      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}