import { supabase, Residuo } from '../config/supabase';

export class ResiduoRepository {
  // Obtener todos los residuos
  async findAll(): Promise<Residuo[]> {
    const { data, error } = await supabase
      .from('residuos')
      .select('*, categorias_residuos(*), users(nombre, email)')
      .order('fecha_registro', { ascending: false });
    
    if (error) throw new Error(`Error fetching residuos: ${error.message}`);
    return data || [];
  }

  // Obtener residuo por ID
  async findById(id: number): Promise<Residuo | null> {
    const { data, error } = await supabase
      .from('residuos')
      .select('*, categorias_residuos(*), users(nombre, email)')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Obtener residuos por usuario
  async findByUsuarioId(usuarioId: number): Promise<Residuo[]> {
    const { data, error } = await supabase
      .from('residuos')
      .select('*, categorias_residuos(*)')
      .eq('usuario_id', usuarioId)
      .order('fecha_registro', { ascending: false });
    
    if (error) throw new Error(`Error fetching user residues: ${error.message}`);
    return data || [];
  }

  // Crear nuevo residuo
  async create(residuo: Omit<Residuo, 'id'>): Promise<Residuo> {
    const { data, error } = await supabase
      .from('residuos')
      .insert([{ ...residuo, fecha_registro: new Date().toISOString(), estado: 'pendiente' }])
      .select()
      .single();
    
    if (error) throw new Error(`Error creating residue: ${error.message}`);
    return data;
  }

  // Actualizar residuo
  async update(id: number, updates: Partial<Residuo>): Promise<Residuo> {
    const { data, error } = await supabase
      .from('residuos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error updating residue: ${error.message}`);
    return data;
  }

  // Actualizar estado del residuo
  async updateStatus(id: number, estado: string): Promise<Residuo> {
    return this.update(id, { estado });
  }

  // Eliminar residuo
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('residuos')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Error deleting residue: ${error.message}`);
  }
}