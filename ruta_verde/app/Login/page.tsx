"use client";

import styles from "../CSS/Login/Login.module.css";
import Link from "next/link";
import { useState } from "react";

// ← Ya NO se importa Header, esta página es full-viewport sin navbar

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // Partículas generadas matemáticamente para evitar hidratación mismatch
  const particles = [
    { id: 1, size: 3, left: 15, top: 70, pdur: 9, pdelay: 0,   px:  25, py: -55, px2: -10, py2: -130 },
    { id: 2, size: 2, left: 30, top: 55, pdur: 13, pdelay: -3, px: -15, py: -70, px2:  20, py2: -150 },
    { id: 3, size: 4, left: 50, top: 80, pdur: 11, pdelay: -6, px:  30, py: -45, px2: -20, py2: -110 },
    { id: 4, size: 2, left: 65, top: 60, pdur: 15, pdelay: -2, px: -20, py: -80, px2:  10, py2: -170 },
    { id: 5, size: 3, left: 80, top: 75, pdur: 10, pdelay: -8, px:  15, py: -60, px2: -15, py2: -140 },
    { id: 6, size: 2, left: 22, top: 40, pdur: 14, pdelay: -5, px: -25, py: -50, px2:  25, py2: -120 },
    { id: 7, size: 4, left: 45, top: 30, pdur: 12, pdelay: -1, px:  20, py: -90, px2: -10, py2: -160 },
    { id: 8, size: 2, left: 70, top: 45, pdur: 16, pdelay: -7, px: -10, py: -65, px2:  15, py2: -145 },
    { id: 9, size: 3, left: 88, top: 25, pdur: 11, pdelay: -4, px:  10, py: -75, px2: -20, py2: -155 },
    { id:10, size: 2, left:  8, top: 85, pdur: 13, pdelay: -9, px:  30, py: -40, px2:  -5, py2: -105 },
  ];

  const glows = [
    { id: 1, w: 300, h: 300, left: 5,  top: 50, gdur: 10, gdelay:  0, gx:  20, gy: -30 },
    { id: 2, w: 220, h: 220, left: 55, top: 20, gdur: 14, gdelay: -5, gx: -15, gy:  25 },
    { id: 3, w: 180, h: 180, left: 30, top: 75, gdur:  9, gdelay: -8, gx:  25, gy: -20 },
  ];

  return (
    <div className={styles.page}>

      {/* ===== PANEL IZQUIERDO — visual animado ===== */}
      <div className={styles.visual}>
        {/* Fondo decorativo */}
        <div className={styles.bigCircle} />
        <div className={styles.grid} />

        {/* Orbs de luz pulsante */}
        {glows.map((g) => (
          <div
            key={g.id}
            className={styles.glowOrb}
            style={{
              width: g.w,
              height: g.h,
              left: `${g.left}%`,
              top: `${g.top}%`,
              transform: "translate(-50%, -50%)",
              ["--gdur" as string]: `${g.gdur}s`,
              ["--gdelay" as string]: `${g.gdelay}s`,
              ["--gx" as string]: `${g.gx}px`,
              ["--gy" as string]: `${g.gy}px`,
            }}
          />
        ))}

        {/* Partículas flotantes */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              ["--pdur" as string]: `${p.pdur}s`,
              ["--pdelay" as string]: `${p.pdelay}s`,
              ["--px" as string]: `${p.px}px`,
              ["--py" as string]: `${p.py}px`,
              ["--px2" as string]: `${p.px2}px`,
              ["--py2" as string]: `${p.py2}px`,
            }}
          />
        ))}

        {/* SVG de trazo botánico decorativo */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}
          viewBox="0 0 600 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Líneas orgánicas tipo hoja */}
          <path d="M 80 750 Q 150 500 300 350 Q 420 230 500 80" stroke="#74c69d" strokeWidth="1" fill="none"/>
          <path d="M 80 750 Q 200 600 350 450 Q 480 320 560 150" stroke="#74c69d" strokeWidth="0.7" fill="none"/>
          <path d="M 30 800 Q 120 580 260 420 Q 380 280 460 100" stroke="#74c69d" strokeWidth="0.5" fill="none"/>
          {/* Venas de hoja */}
          <path d="M 300 350 Q 240 380 200 420" stroke="#74c69d" strokeWidth="0.6" fill="none"/>
          <path d="M 300 350 Q 350 380 390 430" stroke="#74c69d" strokeWidth="0.6" fill="none"/>
          <path d="M 350 450 Q 290 470 260 510" stroke="#74c69d" strokeWidth="0.5" fill="none"/>
          <path d="M 350 450 Q 400 475 430 520" stroke="#74c69d" strokeWidth="0.5" fill="none"/>
          {/* Círculos en los nodos */}
          <circle cx="300" cy="350" r="4" stroke="#74c69d" strokeWidth="0.8" fill="none"/>
          <circle cx="350" cy="450" r="3" stroke="#74c69d" strokeWidth="0.7" fill="none"/>
          <circle cx="420" cy="320" r="3.5" stroke="#74c69d" strokeWidth="0.6" fill="none"/>
        </svg>

        {/* Contenido textual */}
        <div className={styles.visualContent}>
          <div className={styles.visualTag}>
            <div className={styles.visualTagDot} />
            <span className={styles.visualTagText}>Villavicencio · Meta</span>
          </div>

          <h2 className={styles.visualHeading}>
            Cada residuo
            <em>cuenta.</em>
          </h2>

          <p className={styles.visualSub}>
            Únete a la comunidad de recicladores y transforma tus hábitos en impacto real para tu ciudad.
          </p>

          <div className={styles.visualStats}>
            <div className={styles.visualStat}>
              <strong>840+</strong>
              <span>usuarios activos</span>
            </div>
            <div className={styles.visualStat}>
              <strong>34</strong>
              <span>puntos de reciclaje</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PANEL DERECHO — formulario ===== */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>

          {/* Logo */}
          <Link href="/" className={styles.formLogo}>
            <div className={styles.formLogoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 2c2.5 3 4 6.5 4 10" />
                <path d="M12 2c-2.5 3-4 6.5-4 10" />
                <path d="M2 12h20" />
                <path d="M12 12c3-2.5 6.5-4 10-4" />
              </svg>
            </div>
            <span className={styles.formLogoText}>Ruta<strong>Verde</strong></span>
          </Link>

          {/* Títulos */}
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Bienvenido de nuevo</h1>
            <p className={styles.formSubtitle}>Ingresa a tu cuenta para continuar reciclando</p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Correo electrónico
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="password">
                  Contraseña
                </label>
                <Link href="/recuperar" className={styles.forgotLink}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.togglePass}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.btnSubmit} ${loading ? styles.btnLoading : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg
                    className={styles.btnArrow}
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            <div className={styles.divider}>
              <span>o continúa con</span>
            </div>

            <button type="button" className={styles.btnGoogle}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
          </form>

          <p className={styles.switchText}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className={styles.switchLink}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}