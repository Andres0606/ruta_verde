import { supabase, CategoriaResiduo } from '../config/supabase';

export class CategoriaRepository {
  // Obtener todas las categorías
  async findAll(): Promise<CategoriaResiduo[]> {
    const { data, error } = await supabase
      .from('categorias_residuos')
      .select('*')
      .order('nombre');
    
    if (error) throw new Error(`Error fetching categories: ${error.message}`);
    return data || [];
  }

  // Obtener categoría por ID
  async findById(id: number): Promise<CategoriaResiduo | null> {
    const { data, error } = await supabase
      .from('categorias_residuos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Obtener solo categorías reciclables
  async findRecyclable(): Promise<CategoriaResiduo[]> {
    const { data, error } = await supabase
      .from('categorias_residuos')
      .select('*')
      .eq('reciclable', true);
    
    if (error) throw new Error(`Error fetching recyclable categories: ${error.message}`);
    return data || [];
  }
}