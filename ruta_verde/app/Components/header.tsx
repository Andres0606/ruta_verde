"use client";

import styles from "../CSS/Header.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // Obtener nombre de la tabla users
        const { data: userData } = await supabase
          .from("users")
          .select("nombre")
          .eq("auth_uuid", session.user.id)
          .single();
        
        if (userData) {
          setUserName(userData.nombre);
        } else {
          setUserName(session.user.email?.split('@')[0] || "Usuario");
        }
      }
    };

    checkSession();

    // Escuchar cambios en autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        // Recargar nombre
        supabase
          .from("users")
          .select("nombre")
          .eq("auth_uuid", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUserName(data.nombre);
          });
      } else {
        setUser(null);
        setUserName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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

        {/* Acciones - Cambia según si hay sesión */}
        <div className={styles.actions}>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.btnDashboard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-7H9v7H4a2 2 0 0 1-2-2z" />
                </svg>
                Dashboard
              </Link>
              <div className={styles.userMenu}>
                <button onClick={handleLogout} className={styles.btnLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/Login" className={styles.btnLogin}>
                Iniciar sesión
              </Link>
              <Link href="/Register" className={styles.btnRegister}>
                Registrarse
              </Link>
            </>
          )}
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