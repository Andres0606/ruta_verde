"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "../../CSS/Dashboard/Perfil.module.css";
import dashboardStyles from "../../CSS/Dashboard/Dashboard.module.css";
import { QRCodeSVG } from "qrcode.react";
import AvatarUpload from "../../Components/AvatarUpload";

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
  auth_uuid: string | null;
}

export default function PerfilPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return;
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_uuid", session.user.id)
      .single();

    if (error) {
      console.error("Error cargando usuario:", error);
    } else if (userData) {
      setUser(userData);
      setAvatarUrl(userData.avatar_url);
      setForm({
        nombre: userData.nombre || "",
        telefono: userData.telefono || "",
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        nombre: form.nombre,
        telefono: form.telefono || null,
      })
      .eq("auth_uuid", session.user.id);

    if (error) {
      console.error("Error actualizando perfil:", error);
      alert("Error al actualizar el perfil");
    } else {
      setSuccessMessage("Perfil actualizado correctamente");
      setEditing(false);
      loadUserData();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    }

    setSaving(false);
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    
    setDownloading(true);
    
    try {
      const svg = qrRef.current.querySelector('svg');
      if (!svg) return;
      
      // Crear un canvas para convertir SVG a PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qr-${user?.nombre || 'usuario'}.png`;
        link.href = pngUrl;
        link.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      };
      
      img.onerror = () => {
        setDownloading(false);
        alert('Error al generar la imagen');
      };
      
      img.src = url;
    } catch (error) {
      console.error('Error al descargar QR:', error);
      alert('Error al descargar el QR');
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={dashboardStyles.loadingContainer}>
        <div className={dashboardStyles.spinner} />
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className={styles.perfilContainer}>
      <header className={dashboardStyles.header}>
        <h1 className={dashboardStyles.welcomeTitle}>Mi Perfil</h1>
        <div className={dashboardStyles.userInfo}>
          <span className={dashboardStyles.userEmail}>{user?.email}</span>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar"
              className={dashboardStyles.avatar}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className={dashboardStyles.avatar}>
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {successMessage && (
        <div className={styles.successMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {successMessage}
        </div>
      )}

      <div className={styles.perfilCard}>
        <div className={styles.avatarSection}>
          <AvatarUpload 
            userId={user?.auth_uuid || ""}
            avatarUrl={avatarUrl}
            onUpload={(url: string) => setAvatarUrl(url)}
          />
          <h2 className={styles.perfilNombre}>{user?.nombre}</h2>
          <p className={styles.perfilRol}>
            {user?.rol === "ciudadano" ? "♻️ Ciudadano Reciclador" : `👑 ${user?.rol}`}
          </p>
        </div>

        <div className={styles.perfilInfo}>
          <div className={styles.infoSection}>
            <h3>Información Personal</h3>
            
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Correo Electrónico
              </div>
              <div className={styles.infoValue}>{user?.email}</div>
            </div>

            {editing ? (
              <>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Nombre Completo
                  </div>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Teléfono
                  </div>
                  <input
                    type="tel"
                    className={styles.editInput}
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Tu teléfono"
                  />
                </div>

                <div className={styles.editButtons}>
                  <button 
                    className={styles.cancelBtn}
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        nombre: user?.nombre || "",
                        telefono: user?.telefono || "",
                      });
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Nombre Completo
                  </div>
                  <div className={styles.infoValue}>{user?.nombre}</div>
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Teléfono
                  </div>
                  <div className={styles.infoValue}>
                    {user?.telefono || "No especificado"}
                  </div>
                </div>

                <button 
                  className={styles.editBtn}
                  onClick={() => setEditing(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
                    <path d="M4 20h16"/>
                  </svg>
                  Editar Perfil
                </button>
              </>
            )}
          </div>

          <div className={styles.infoSection}>
            <h3>Estadísticas</h3>
            
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{user?.puntos_actuales || 0}</div>
                <div className={styles.statLabel}>Puntos Totales</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>Nivel {user?.nivel || 1}</div>
                <div className={styles.statLabel}>Rango</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>
                  {Math.floor((user?.puntos_actuales || 0) / 1000)}
                </div>
                <div className={styles.statLabel}>Niveles Completados</div>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Miembro desde
              </div>
              <div className={styles.infoValue}>
                {formatDate(user?.fecha_registro || "")}
              </div>
            </div>
          </div>

          {/* Sección Mi QR */}
          <div className={styles.infoSection}>
            <h3>Mi QR de Reciclaje</h3>
            <div className={styles.qrSection}>
              <div className={styles.qrContainer} ref={qrRef}>
                {user && (
                  <QRCodeSVG 
                    value={`${window.location.origin}/reciclar/${user.auth_uuid}`}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1a3d2b"
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
              <p className={styles.qrDescription}>
                Escanea este QR en las máquinas de reciclaje para recibir tus puntos
              </p>
              <button 
                className={styles.downloadQrBtn}
                onClick={downloadQR}
                disabled={downloading}
              >
                {downloading ? "⏳ Generando..." : "📥 Descargar QR"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}