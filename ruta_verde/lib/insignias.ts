import { supabase } from './supabaseClient';

interface Insignia {
  id: number;
  nombre: string;
  puntos_requeridos: number;
  cantidad_residuos_requerida: number;
}

interface UsuarioInsignia {
  id: number;
  usuario_id: number;
  insignia_id: number;
  fecha_obtencion: string;
}

interface InsigniaCompleta {
  id: number;
  insignia_id: number;
  fecha_obtencion: string;
  insignia: {
    id: number;
    nombre: string;
    descripcion: string;
    imagen_url: string | null;
    puntos_requeridos: number;
    cantidad_residuos_requerida: number;
  };
}

/**
 * Verifica y asigna insignias automáticamente al usuario
 */
export async function verificarYAsignarInsignias(
  usuarioId: number,
  puntosActuales: number,
  totalResiduos: number
): Promise<string[]> {
  const insigniasAsignadas: string[] = [];

  // 1. Obtener todas las insignias
  const { data: insignias, error } = await supabase
    .from('insignias')
    .select('*');

  if (error) {
    console.error('Error obteniendo insignias:', error);
    return [];
  }

  // 2. Obtener insignias que ya tiene el usuario
  const { data: insigniasUsuario } = await supabase
    .from('usuarios_insignias')
    .select('insignia_id')
    .eq('usuario_id', usuarioId);

  const insigniasUsuarioIds = new Set(insigniasUsuario?.map(i => i.insignia_id) || []);

  // 3. Verificar cada insignia
  for (const insignia of insignias) {
    // Si ya la tiene, saltar
    if (insigniasUsuarioIds.has(insignia.id)) continue;

    let cumpleRequisito = false;

    // Verificar por puntos
    if (insignia.puntos_requeridos > 0 && puntosActuales >= insignia.puntos_requeridos) {
      cumpleRequisito = true;
    }

    // Verificar por cantidad de residuos
    if (insignia.cantidad_residuos_requerida > 0 && totalResiduos >= insignia.cantidad_residuos_requerida) {
      cumpleRequisito = true;
    }

    // Asignar insignia si cumple
    if (cumpleRequisito) {
      const { error: insertError } = await supabase
        .from('usuarios_insignias')
        .insert({
          usuario_id: usuarioId,
          insignia_id: insignia.id,
          fecha_obtencion: new Date().toISOString(),
        });

      if (!insertError) {
        insigniasAsignadas.push(insignia.nombre);
        console.log(`🏅 Insignia asignada: ${insignia.nombre} al usuario ${usuarioId}`);
      }
    }
  }

  return insigniasAsignadas;
}

/**
 * Obtiene las insignias de un usuario con los detalles completos
 */
export async function getInsigniasUsuario(usuarioId: number): Promise<InsigniaCompleta[]> {
  // Primero obtener las insignias del usuario
  const { data: usuarioInsignias, error } = await supabase
    .from('usuarios_insignias')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('fecha_obtencion', { ascending: false });

  if (error) {
    console.error('Error obteniendo insignias del usuario:', error);
    return [];
  }

  if (!usuarioInsignias || usuarioInsignias.length === 0) {
    return [];
  }

  // Obtener los detalles de cada insignia
  const insigniaIds = usuarioInsignias.map(ui => ui.insignia_id);
  
  const { data: insigniasDetalle, error: detalleError } = await supabase
    .from('insignias')
    .select('*')
    .in('id', insigniaIds);

  if (detalleError) {
    console.error('Error obteniendo detalles de insignias:', error);
    return [];
  }

  // Crear un mapa de insignias por id
  const insigniasMap = new Map();
  insigniasDetalle?.forEach(insignia => {
    insigniasMap.set(insignia.id, insignia);
  });

  // Combinar los datos
  const resultado: InsigniaCompleta[] = usuarioInsignias.map(ui => ({
    id: ui.id,
    insignia_id: ui.insignia_id,
    fecha_obtencion: ui.fecha_obtencion,
    insignia: insigniasMap.get(ui.insignia_id)
  }));

  return resultado;
}