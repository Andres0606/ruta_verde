import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente básico - funciona en cualquier entorno
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== TIPOS DE LAS TABLAS ====================

export interface User {
  id: number;
  email: string;
  nombre: string;
  avatar_url: string | null;
  puntos_actuales: number | null;
  nivel: number | null;
  fecha_registro: string | null;
  ciudad: string | null;
  telefono: string | null;
  rol: string | null;
  auth_uuid: string | null;
}

export interface CategoriaResiduo {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_icono: string | null;
  reciclable: boolean | null;
  instrucciones_separacion: string | null;
}

export interface Residuo {
  id: number;
  usuario_id: number;
  categoria_id: number | null;
  fecha_registro: string | null;
  estado: string | null;
  puntos_otorgados: number | null;
  metodo_clasificacion: string | null;
  imagen_url?: string | null;
  descripcion?: string | null;
  peso_estimado_kg?: number | null;
  qr_code?: string | null;
}

export interface Entrega {
  id: number;
  residuo_id: number;
  usuario_id: number;
  punto_reciclaje_id: number | null;
  fecha_entrega: string | null;
  codigo_verificacion: string | null;
  imagen_evidencia_url: string | null;
  estado_entrega: string | null;
  observaciones: string | null;
}

export interface PuntoReciclaje {
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

export interface HistorialPunto {
  id: number;
  usuario_id: number;
  puntos: number;
  concepto: string;
  referencia_id: number | null;
  fecha: string | null;
}

export interface ImpactoAmbiental {
  id: number;
  usuario_id: number;
  total_residuos_reciclados: number | null;
  total_pesos_kg: number | null;
  co2_ahorrado_kg: number | null;
  arboles_equivalentes: number | null;
  ultima_actualizacion: string | null;
}

export interface Insignia {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  puntos_requeridos: number | null;
  cantidad_residuos_requerida: number | null;
  categoria_requerida_id: number | null;
}

export interface UsuarioInsignia {
  id: number;
  usuario_id: number;
  insignia_id: number;
  fecha_obtencion: string | null;
}

export interface RankingUser {
  id: number;
  nombre: string;
  avatar_url: string | null;
  puntos_actuales: number | null;
  nivel: number | null;
}