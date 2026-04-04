import { supabase, User } from '../config/supabase';

// Tipo específico para ranking
interface RankingUser {
  id: number;
  nombre: string;
  avatar_url: string | null;
  puntos_actuales: number | null;
  nivel: number | null;
}

export class UserRepository {
  // Obtener todos los usuarios
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('puntos_actuales', { ascending: false });
    
    if (error) throw new Error(`Error fetching users: ${error.message}`);
    return data || [];
  }

  // Obtener usuario por ID
  async findById(id: number): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Obtener usuario por Auth UUID (para conectar con Supabase Auth)
  async findByAuthUUID(authUUID: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_uuid', authUUID)
      .single();
    
    if (error) return null;
    return data;
  }

  // Obtener usuario por email
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return null;
    return data;
  }

  // Crear nuevo usuario
  async create(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        ...user, 
        fecha_registro: new Date().toISOString(), 
        puntos_actuales: 0, 
        nivel: 1,
        rol: 'usuario'
      }])
      .select()
      .single();
    
    if (error) throw new Error(`Error creating user: ${error.message}`);
    return data;
  }

  // Actualizar usuario
  async update(id: number, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error updating user: ${error.message}`);
    return data;
  }

  // Actualizar puntos del usuario
  async updatePoints(id: number, pointsToAdd: number): Promise<User> {
    const user = await this.findById(id);
    const currentPoints = user?.puntos_actuales || 0;
    const newPoints = currentPoints + pointsToAdd;
    const newLevel = Math.floor(newPoints / 1000) + 1;
    
    const { data, error } = await supabase
      .from('users')
      .update({ puntos_actuales: newPoints, nivel: newLevel })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Error updating points: ${error.message}`);
    return data;
  }

  // Obtener ranking de usuarios
  async getRanking(limit: number = 10): Promise<RankingUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, avatar_url, puntos_actuales, nivel')
      .order('puntos_actuales', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Error fetching ranking: ${error.message}`);
    return (data as RankingUser[]) || [];
  }

  // Eliminar usuario
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Error deleting user: ${error.message}`);
  }
}