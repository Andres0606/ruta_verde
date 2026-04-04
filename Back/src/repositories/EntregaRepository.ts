import { supabase, Entrega } from '../config/supabase';

export class EntregaRepository {
  // Obtener todas las entregas
  async findAll(): Promise<Entrega[]> {
    const { data, error } = await supabase
      .from('entregas')
      .select('*, residuos(*), users(nombre, email), puntos_reciclaje(*)')
      .order('fecha_entrega', { ascending: false });
    
    if (error) throw new Error(`Error fetching entregas: ${error.message}`);
    return data || [];
  }

  // Obtener entrega por ID
  async findById(id: number): Promise<Entrega | null> {
    const { data, error } = await supabase
      .from('entregas')
      .select('*, residuos(*), users(*), puntos_reciclaje(*)')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Obtener entregas por usuario
  async findByUsuarioId(usuarioId: number): Promise<Entrega[]> {
    const { data, error } = await supabase
      .from('entregas')
      .select('*, residuos(*), puntos_reciclaje(*)')
      .eq('usuario_id', usuarioId)
      .order('fecha_entrega', { ascending: false });
    
    if (error) throw new Error(`Error fetching user deliveries: ${error.message}`);
    return data || [];
  }

  // Crear nueva entrega
  async create(entrega: Omit<Entrega, 'id'>): Promise<Entrega> {
    const { data, error } = await supabase
      .from('entregas')
      .insert([{ ...entrega, fecha_entrega: new Date().toISOString(), estado_entrega: 'pendiente' }])
      .select()
      .single();
    
    if (error) throw new Error(`Error creating delivery: ${error.message}`);
    return data;
  }

  // Actualizar entrega
  async update(id: number, updates: Partial<Entrega>): Promise<Entrega> {
    const { data, error } = await supabase
      .from('entregas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error updating delivery: ${error.message}`);
    return data;
  }

  // Verificar entrega por código
  async verifyDelivery(codigo: string): Promise<Entrega | null> {
    const { data, error } = await supabase
      .from('entregas')
      .update({ estado_entrega: 'verificada' })
      .eq('codigo_verificacion', codigo)
      .eq('estado_entrega', 'pendiente')
      .select()
      .single();
    
    if (error) return null;
    return data;
  }
}