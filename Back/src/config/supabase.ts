import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  categoria_id: number;
  imagen_url: string | null;
  descripcion: string | null;
  peso_estimado_kg: number | null;
  fecha_registro: string | null;
  estado: string | null;
  qr_code: string | null;
  puntos_otorgados: number | null;
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
  imagen_url: string | null;
  tipo: string | null;
  activo: boolean | null;
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

// Tipo específico para el ranking (solo los campos que necesitas)
export interface RankingUser {
  id: number;
  nombre: string;
  avatar_url: string | null;
  puntos_actuales: number | null;
  nivel: number | null;
}