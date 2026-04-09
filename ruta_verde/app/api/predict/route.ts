import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';
import { supabase } from '@/lib/supabaseClient';

const MODELOS = {
  SIMPLE: {
    endpoint: "/simple",
    nombre: "Clasificador Básico",
  },
  AVANZADO: {
    endpoint: "/avanzado",
    nombre: "Clasificador Avanzado",
  }
};

// Mapeo de categorías de IA a IDs de la base de datos
const MAPEO_IA_A_CATEGORIA: Record<string, { id: number; nombre: string; puntos: number; emoji: string; consejo: string }> = {
  'PLASTIC': { id: 1, nombre: 'Plástico PET', puntos: 15, emoji: '♻️', consejo: 'Enjuagar, aplastar y depositar en bolsa blanca' },
  'PAPER': { id: 3, nombre: 'Papel y Cartón', puntos: 10, emoji: '📄', consejo: 'Doblar, no arrugar, depositar en bolsa azul' },
  'GLASS': { id: 2, nombre: 'Vidrio', puntos: 20, emoji: '🍶', consejo: 'Enjuagar, retirar tapas, depositar en bolsa verde' },
  'METAL': { id: 11, nombre: 'Metal / Lata', puntos: 25, emoji: '🥫', consejo: 'Latas de aluminio, acero - Enjuagar y aplastar' },
  'ORGANIC': { id: 4, nombre: 'Orgánico', puntos: 8, emoji: '🌿', consejo: 'Depositar en bolsa negra o compostera' },
  'CARDBOARD': { id: 3, nombre: 'Cartón / Papel', puntos: 10, emoji: '📦', consejo: 'Doblar el cartón para reducir volumen' },
  'PET': { id: 1, nombre: 'Plástico PET', puntos: 15, emoji: '🥤', consejo: 'Botellas de plástico - Enjuagar y aplastar' },
  'HDPE': { id: 1, nombre: 'Plástico HDPE', puntos: 15, emoji: '🧴', consejo: 'Envases de shampoo, detergente - Enjuagar' },
  'PVC': { id: 1, nombre: 'Plástico PVC', puntos: 12, emoji: '🔧', consejo: 'Reciclaje especializado' },
  'LDPE': { id: 1, nombre: 'Plástico LDPE', puntos: 10, emoji: '🛍️', consejo: 'Bolsas plásticas - Llevar a puntos específicos' },
  'PP': { id: 1, nombre: 'Plástico PP', puntos: 15, emoji: '🧢', consejo: 'Tapas, envases de yogur - Reciclable' },
  'PS': { id: 1, nombre: 'Plástico PS', puntos: 8, emoji: '🥡', consejo: 'Unicel - Reciclaje limitado' },
  'OTHER_PLASTIC': { id: 1, nombre: 'Otro Plástico', puntos: 10, emoji: '♻️', consejo: 'Verifica con tu centro de reciclaje' },
  'ALUMINUM': { id: 11, nombre: 'Metal / Lata', puntos: 25, emoji: '🥫', consejo: 'Latas de aluminio - ¡Muy valioso!' },
  'STEEL': { id: 11, nombre: 'Metal / Lata', puntos: 20, emoji: '🔩', consejo: 'Latas de conservas - Reciclable' },
};

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

    // 2. Obtener usuario de la BD
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, puntos_actuales, auth_uuid')
      .eq('auth_uuid', user.id)
      .single();

    if (dbError || !dbUser) {
      console.error('Error usuario:', dbError);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 3. Obtener imagen
    const formData = await request.formData();
    const image = formData.get('image') as File;
    if (!image) {
      return NextResponse.json({ error: 'No hay imagen' }, { status: 400 });
    }

    // 4. Modelo seleccionado
    const modelo = formData.get('modelo') as string || 'simple';
    const modeloSeleccionado = modelo === 'avanzado' ? MODELOS.AVANZADO : MODELOS.SIMPLE;

    // 5. Llamar a Hugging Face
    const client = await Client.connect("Andres0606/Ruta_Verde");
    const result = await client.predict(modeloSeleccionado.endpoint, { imagen: image });
    
    const datos = result.data as any;
    let categoriaIA = 'PLASTIC';
    let confianza = 90;
    
    if (Array.isArray(datos) && datos.length >= 2) {
      categoriaIA = String(datos[0]).toUpperCase();
      confianza = Math.round(parseFloat(String(datos[1])) * 100);
    } else if (datos && typeof datos === 'object') {
      if (datos.label) categoriaIA = String(datos.label).toUpperCase();
      if (datos.confidence) confianza = Math.round(datos.confidence * 100);
      else if (datos.score) confianza = Math.round(datos.score * 100);
    }
    
    const CONFIANZA_MINIMA = 80;
    const esConfiable = confianza >= CONFIANZA_MINIMA;
    
    // 6. Obtener información de la categoría mapeada
    const infoCategoria = MAPEO_IA_A_CATEGORIA[categoriaIA] || MAPEO_IA_A_CATEGORIA['PLASTIC'];
    const puntosGanados = infoCategoria.puntos;
    
    console.log(`✅ Detectado: ${infoCategoria.nombre} (ID: ${infoCategoria.id}) con ${confianza}% confianza`);
    
    // 7. Guardar residuo en la BD con estado 'registrado' (valor permitido por el CHECK)
    const { data: residuo, error: residuoError } = await supabase
      .from('residuos')
      .insert({
        usuario_id: dbUser.id,
        categoria_id: infoCategoria.id,
        fecha_registro: new Date().toISOString(),
        estado: 'registrado',  // ✅ VALOR CORRECTO - permitido por el CHECK constraint
        puntos_otorgados: puntosGanados,
        metodo_clasificacion: modeloSeleccionado.nombre,
        qr_code: user.id,
      })
      .select()
      .single();
    
    if (residuoError) {
      console.error('❌ Error guardando residuo:', residuoError);
      return NextResponse.json({ 
        success: false, 
        error: `Error al guardar: ${residuoError.message}` 
      }, { status: 500 });
    }
    
    console.log(`✅ Residuo guardado con ID: ${residuo.id} - Estado: registrado`);
    
    // 8. Devolver respuesta
    return NextResponse.json({
      success: true,
      tipo: infoCategoria.nombre,
      categoria_original: categoriaIA,
      confianza: confianza,
      puntos: puntosGanados,
      puntos_totales: dbUser.puntos_actuales,
      mensaje: esConfiable 
        ? `¡Es ${infoCategoria.nombre}! Guarda este QR y preséntalo en un punto de reciclaje para recibir ${puntosGanados} puntos.`
        : `Confianza baja (${confianza}%). Intenta con mejor iluminación.`,
      consejo: infoCategoria.consejo,
      emoji: infoCategoria.emoji,
      puedeGenerarQR: esConfiable,
      qr_code: user.id,
      residuo_id: residuo.id,
      modelo_usado: modeloSeleccionado.nombre,
    });

  } catch (error) {
    console.error('❌ Error en API:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}