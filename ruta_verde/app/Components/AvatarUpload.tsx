"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  onUpload: (url: string) => void;
}

export default function AvatarUpload({ userId, avatarUrl, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError("Solo se permiten imágenes");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setError("La imagen debe ser menor a 2MB");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('auth_uuid', userId);

      if (updateError) throw updateError;

      onUpload(publicUrl);
      
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div style={{ position: 'relative' }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #74c69d'
            }}
          />
        ) : (
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: '#e8f5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #74c69d'
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#74c69d" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        )}
        
        <label style={{ cursor: 'pointer', marginTop: '8px', display: 'block' }}>
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: '#74c69d',
              color: '#1a3d2b',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {uploading ? "Subiendo..." : "📷 Cambiar foto"}
          </span>
        </label>
      </div>
      {error && (
        <p style={{ color: '#ff4747', fontSize: '12px', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}