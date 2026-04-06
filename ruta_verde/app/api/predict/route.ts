import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // 1. Autenticación
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Obtener usuario
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, puntos_actuales')
      .eq('auth_uuid', user.id)
      .single();

    // 3. Obtener imagen
    const formData = await request.formData();
    const image = formData.get('image') as File;
    if (!image) {
      return NextResponse.json({ error: 'No hay imagen' }, { status: 400 });
    }

    // 4. Llamar a Hugging Face
    const client = await Client.connect("Andres0606/Ruta_Verde");
    const result = await client.predict("/simple", { imagen: image });
    
    // 5. ✅ LO ÚNICO QUE IMPORTA - PROCESAR RESPUESTA
    const datos = result.data as any[];
    let categoria = '';
    let confianza = 0;
    
    if (Array.isArray(datos) && datos.length >= 2) {
      categoria = String(datos[0]); // "GLASS", "PAPER", "PLASTIC", etc.
      confianza = Math.round(parseFloat(String(datos[1])) * 100);
    }
    
    // 6. Mapeo DIRECTO de lo que devuelve el modelo
    let nombreMostrar = categoria;
    let puntosGanados = 10;
    
    switch(categoria) {
      case 'GLASS':
        nombreMostrar = 'Vidrio';
        puntosGanados = 20;
        break;
      case 'PAPER':
        nombreMostrar = 'Papel / Cartón';
        puntosGanados = 10;
        break;
      case 'PLASTIC':
        nombreMostrar = 'Plástico';
        puntosGanados = 15;
        break;
      case 'METAL':
        nombreMostrar = 'Metal';
        puntosGanados = 25;
        break;
      case 'ORGANIC':
        nombreMostrar = 'Orgánico';
        puntosGanados = 8;
        break;
      default:
        nombreMostrar = categoria;
        puntosGanados = 5;
    }
    
    console.log(`✅ API detectó: ${nombreMostrar} (${confianza}%)`);

    // 7. Guardar en BD
    const nuevosPuntos = (dbUser?.puntos_actuales || 0) + puntosGanados;
    
    if (dbUser) {
      await supabase
        .from('users')
        .update({ puntos_actuales: nuevosPuntos })
        .eq('id', dbUser.id);
    }
    
    await supabase
      .from('residuos')
      .insert({
        usuario_id: dbUser?.id,
        descripcion: `${nombreMostrar} - ${confianza}% confianza IA`,
        puntos_otorgados: puntosGanados,
        fecha_registro: new Date().toISOString(),
      });

    // 8. 🟢 DEVOLVER RESULTADO LIMPIO
    return NextResponse.json({
      success: true,
      tipo: nombreMostrar,
      categoria_original: categoria,
      confianza: confianza,
      puntos: puntosGanados,
      puntos_totales: nuevosPuntos,
      mensaje: `¡Es ${nombreMostrar}! Ganaste ${puntosGanados} puntos.`
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}