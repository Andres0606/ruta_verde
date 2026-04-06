"use client";

import styles from "../CSS/Register/Register.module.css";
import Link from "next/link";
import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

/* ========================
   Tipos
   ======================== */
interface FormState {
  nombre: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
  terminos: boolean;
}

interface FormErrors {
  nombre?: string;
  telefono?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terminos?: string;
}

/* ========================
   Helpers de validación
   ======================== */
function checkPasswordRules(pwd: string) {
  return {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    lower:   /[a-z]/.test(pwd),
    number:  /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
}

function getStrengthLevel(rules: ReturnType<typeof checkPasswordRules>): number {
  return Object.values(rules).filter(Boolean).length;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.nombre.trim()) errors.nombre = "El nombre es requerido";
  if (!form.email.trim()) errors.email = "El correo es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Correo no válido";
  const rules = checkPasswordRules(form.password);
  if (!form.password) errors.password = "La contraseña es requerida";
  else if (!rules.length || !rules.number || !rules.special)
    errors.password = "La contraseña no cumple los requisitos";
  if (!form.confirmPassword) errors.confirmPassword = "Confirma tu contraseña";
  else if (form.password !== form.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";
  if (!form.terminos) errors.terminos = "Debes aceptar los términos";
  return errors;
}

/* ========================
   Icono de check para reglas
   ======================== */
function CheckIcon({ size = 8 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ========================
   COMPONENTE PRINCIPAL
   ======================== */
export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    nombre: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
    terminos: false,
  });

  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirm, setShowConfirm]          = useState(false);
  const [loading, setLoading]                  = useState(false);
  const [errors, setErrors]                    = useState<FormErrors>({});
  const [touched, setTouched]                  = useState<Record<string, boolean>>({});
  const [passwordFocused, setPasswordFocused]  = useState(false);
  const [generalError, setGeneralError]        = useState<string | null>(null);

  const pwdRules = useMemo(() => checkPasswordRules(form.password), [form.password]);
  const strengthLevel = useMemo(() => getStrengthLevel(pwdRules), [pwdRules]);

  const strengthLabels = ["", "Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"];
  const strengthColors = ["", "#d9534f", "#e67e22", "#f0ad4e", "#40916c", "#1a3d2b"];

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error al editar
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setGeneralError(null);
  };

  const blur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateForm(form);
    setErrors(errs);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setGeneralError(null);
  
  const errs = validateForm(form);
  setErrors(errs);
  setTouched({ nombre: true, telefono: true, email: true, password: true, confirmPassword: true, terminos: true });
  
  if (Object.keys(errs).length > 0) return;
  
  setLoading(true);

  // 1. Registrar en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        nombre: form.nombre,
      },
    },
  });

  if (authError) {
    setGeneralError(authError.message);
    setLoading(false);
    return;
  }

  if (authData.user) {
    // 2. PRIMERO: Verificar si ya existe en la tabla users
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", form.email)
      .single();

    if (existingUser) {
      // El usuario ya existe, solo actualizar el auth_uuid
      console.log("Usuario ya existe, actualizando auth_uuid...");
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
  auth_uuid: authData.user.id,
  telefono: form.telefono || null
})
        .eq("email", form.email);
      
      if (updateError) {
        console.error("Error al actualizar:", updateError);
        setGeneralError("Error al vincular tu cuenta. Contacta a soporte.");
        setLoading(false);
        return;
      }
      
      console.log("Usuario actualizado correctamente");
      router.push("/Login?registered=true");
      return;
    }
    
    // 3. Si no existe, crear nuevo registro
    console.log("Creando nuevo usuario...");
    const { error: dbError } = await supabase.from("users").insert({
      auth_uuid: authData.user.id,
      email: form.email,
      nombre: form.nombre,
      telefono: form.telefono || null,
      puntos_actuales: 0,
      nivel: 1,
      rol: "ciudadano",
      fecha_registro: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Error al guardar en users:", dbError);
      
      // Si es error de duplicado, intentar actualizar
      if (dbError.code === "23505") {
        console.log("Error de duplicado, intentando actualizar...");
        const { error: updateError } = await supabase
          .from("users")
          .update({ auth_uuid: authData.user.id })
          .eq("email", form.email);
        
        if (updateError) {
          setGeneralError("Error al crear tu perfil. Contacta a soporte.");
        } else {
          router.push("/Login?registered=true");
        }
      } else {
        setGeneralError("Error al crear tu perfil. Por favor, contacta a soporte.");
      }
      setLoading(false);
      return;
    }

    console.log("Usuario creado exitosamente");
    router.push("/Login?registered=true");
  }
};

  const isFormValid = Object.keys(validateForm(form)).length === 0;

  /* Partículas */
  const particles = [
    { id: 1, size: 3, left: 15, top: 70, pdur: 9,  pdelay: 0,  px:  25, py: -55, px2: -10, py2: -130 },
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

      {/* ===== PANEL IZQUIERDO ===== */}
      <div className={styles.visual}>
        <div className={styles.bigCircle} />
        <div className={styles.grid} />

        {glows.map((g) => (
          <div
            key={g.id}
            className={styles.glowOrb}
            style={{
              width: g.w, height: g.h,
              left: `${g.left}%`, top: `${g.top}%`,
              transform: "translate(-50%, -50%)",
              ["--gdur" as string]: `${g.gdur}s`,
              ["--gdelay" as string]: `${g.gdelay}s`,
              ["--gx" as string]: `${g.gx}px`,
              ["--gy" as string]: `${g.gy}px`,
            }}
          />
        ))}

        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              width: p.size, height: p.size,
              left: `${p.left}%`, top: `${p.top}%`,
              ["--pdur" as string]: `${p.pdur}s`,
              ["--pdelay" as string]: `${p.pdelay}s`,
              ["--px" as string]: `${p.px}px`,
              ["--py" as string]: `${p.py}px`,
              ["--px2" as string]: `${p.px2}px`,
              ["--py2" as string]: `${p.py2}px`,
            }}
          />
        ))}

        {/* SVG botánico decorativo */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}
          viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M 80 750 Q 150 500 300 350 Q 420 230 500 80" stroke="#74c69d" strokeWidth="1" fill="none"/>
          <path d="M 80 750 Q 200 600 350 450 Q 480 320 560 150" stroke="#74c69d" strokeWidth="0.7" fill="none"/>
          <path d="M 30 800 Q 120 580 260 420 Q 380 280 460 100" stroke="#74c69d" strokeWidth="0.5" fill="none"/>
          <path d="M 300 350 Q 240 380 200 420" stroke="#74c69d" strokeWidth="0.6" fill="none"/>
          <path d="M 300 350 Q 350 380 390 430" stroke="#74c69d" strokeWidth="0.6" fill="none"/>
          <path d="M 350 450 Q 290 470 260 510" stroke="#74c69d" strokeWidth="0.5" fill="none"/>
          <path d="M 350 450 Q 400 475 430 520" stroke="#74c69d" strokeWidth="0.5" fill="none"/>
          <circle cx="300" cy="350" r="4" stroke="#74c69d" strokeWidth="0.8" fill="none"/>
          <circle cx="350" cy="450" r="3" stroke="#74c69d" strokeWidth="0.7" fill="none"/>
          <circle cx="420" cy="320" r="3.5" stroke="#74c69d" strokeWidth="0.6" fill="none"/>
        </svg>

        <div className={styles.visualContent}>
          <div className={styles.visualTag}>
            <div className={styles.visualTagDot} />
            <span className={styles.visualTagText}>Únete hoy · Es gratis</span>
          </div>

          <h2 className={styles.visualHeading}>
            Empieza a
            <em>reciclar.</em>
          </h2>

          <p className={styles.visualSub}>
            Crea tu cuenta y sé parte del movimiento de reciclaje más grande de Villavicencio.
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
            <h1 className={styles.formTitle}>Crea tu cuenta</h1>
            <p className={styles.formSubtitle}>Únete gratis a la comunidad recicladora</p>
          </div>

          {/* Error general */}
          {generalError && (
            <div className={styles.errorMessage}>
              {generalError}
            </div>
          )}

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Fila: Nombre + Teléfono */}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="nombre">Nombre</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    id="nombre"
                    type="text"
                    className={`${styles.input} ${touched.nombre && errors.nombre ? styles.inputError : ""} ${touched.nombre && !errors.nombre && form.nombre ? styles.inputSuccess : ""}`}
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={(e) => set("nombre", e.target.value)}
                    onBlur={() => blur("nombre")}
                    autoComplete="given-name"
                  />
                </div>
                {touched.nombre && errors.nombre && (
                  <span className={styles.fieldError}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {errors.nombre}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="telefono">Teléfono <span style={{fontWeight:400, opacity:0.6}}>(opcional)</span></label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <input
                    id="telefono"
                    type="tel"
                    className={styles.input}
                    placeholder="300 000 0000"
                    value={form.telefono}
                    onChange={(e) => set("telefono", e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className={`${styles.input} ${touched.email && errors.email ? styles.inputError : ""} ${touched.email && !errors.email && form.email ? styles.inputSuccess : ""}`}
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={() => blur("email")}
                  autoComplete="email"
                />
              </div>
              {touched.email && errors.email && (
                <span className={styles.fieldError}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Contraseña */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${touched.password && errors.password ? styles.inputError : ""} ${touched.password && !errors.password && form.password ? styles.inputSuccess : ""}`}
                  placeholder="Mín. 8 caracteres"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  onBlur={() => { blur("password"); setPasswordFocused(false); }}
                  onFocus={() => setPasswordFocused(true)}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Indicador de fortaleza — aparece al enfocar o si tiene contenido */}
              {(passwordFocused || form.password.length > 0) && (
                <div className={styles.passwordStrength}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div className={styles.strengthBars}>
                      {[1,2,3,4,5].map((i) => (
                        <div
                          key={i}
                          className={`${styles.strengthBar} ${i <= strengthLevel ? styles[`active${strengthLevel}` as keyof typeof styles] : ""}`}
                          style={i <= strengthLevel ? { background: strengthColors[strengthLevel] } : {}}
                        />
                      ))}
                    </div>
                    {form.password.length > 0 && (
                      <span style={{ fontSize: "11px", color: strengthColors[strengthLevel], fontWeight: 600, marginLeft: 10, whiteSpace: "nowrap" }}>
                        {strengthLabels[strengthLevel]}
                      </span>
                    )}
                  </div>
                  <div className={styles.strengthRules}>
                    {[
                      { key: "length",  label: "Mínimo 8 caracteres" },
                      { key: "upper",   label: "Una mayúscula" },
                      { key: "lower",   label: "Una minúscula" },
                      { key: "number",  label: "Un número" },
                      { key: "special", label: "Un carácter especial (!@#$...)" },
                    ].map(({ key, label }) => {
                      const ok = pwdRules[key as keyof typeof pwdRules];
                      return (
                        <div key={key} className={`${styles.strengthRule} ${ok ? styles.passed : ""}`}>
                          <div className={styles.strengthRuleIcon}>
                            {ok && <CheckIcon size={8} />}
                          </div>
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {touched.password && errors.password && !passwordFocused && (
                <span className={styles.fieldError}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  className={`${styles.input} ${touched.confirmPassword && errors.confirmPassword ? styles.inputError : ""} ${touched.confirmPassword && !errors.confirmPassword && form.confirmPassword ? styles.inputSuccess : ""}`}
                  placeholder="Repite la contraseña"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  onBlur={() => blur("confirmPassword")}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.togglePass} onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                  {showConfirm ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <span className={styles.fieldError}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {errors.confirmPassword}
                </span>
              )}
              {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && (
                <span className={styles.fieldSuccess}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Las contraseñas coinciden
                </span>
              )}
            </div>

            {/* Términos y condiciones */}
            <label className={styles.termsField} htmlFor="terminos">
              <input
                type="checkbox"
                id="terminos"
                className={styles.termsCheckbox}
                checked={form.terminos}
                onChange={(e) => { set("terminos", e.target.checked); blur("terminos"); }}
              />
              <div className={`${styles.termsBox} ${form.terminos ? styles.termsBoxChecked : ""}`}>
                {form.terminos && <CheckIcon size={9} />}
              </div>
              <span className={styles.termsText}>
                Acepto los{" "}
                <Link href="/terminos" className={styles.termsLink} onClick={(e) => e.stopPropagation()}>
                  Términos de servicio
                </Link>{" "}
                y la{" "}
                <Link href="/privacidad" className={styles.termsLink} onClick={(e) => e.stopPropagation()}>
                  Política de privacidad
                </Link>{" "}
                de RutaVerde
              </span>
            </label>
            {touched.terminos && errors.terminos && (
              <span className={styles.fieldError} style={{ marginTop: -8 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {errors.terminos}
              </span>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              className={`${styles.btnSubmit} ${loading ? styles.btnLoading : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <svg className={styles.btnArrow} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>

            <div className={styles.divider}><span>o regístrate con</span></div>

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
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className={styles.switchLink}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}