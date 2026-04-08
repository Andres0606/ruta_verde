import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';
import { supabase } from '@/lib/supabaseClient';

// Configuración de los modelos
const MODELOS = {
  SIMPLE: {
    endpoint: "/simple",
    nombre: "Clasificador Básico",
    categorias: ["PLASTIC", "PAPER", "GLASS", "METAL", "ORGANIC", "CARDBOARD"]
  },
  AVANZADO: {
    endpoint: "/avanzado",
    nombre: "Clasificador Avanzado",
    categorias: ["PET", "HDPE", "PVC", "LDPE", "PP", "PS", "OTHER_PLASTIC", "GLASS", "PAPER", "CARDBOARD", "ALUMINUM", "STEEL", "ORGANIC"]
  }
};

// Mapeo de categorías a nombres amigables y puntos
const MAPEO_CATEGORIAS: Record<string, { nombre: string; puntos: number; emoji: string; consejo: string }> = {
  // Modelo Simple
  'PLASTIC': { nombre: 'Plástico', puntos: 15, emoji: '♻️', consejo: 'Aplasta la botella y deposita en contenedor amarillo' },
  'PAPER': { nombre: 'Papel', puntos: 10, emoji: '📄', consejo: 'Retira grapas y deposita en contenedor azul' },
  'GLASS': { nombre: 'Vidrio', puntos: 20, emoji: '🍶', consejo: 'No rompas el vidrio, deposita en contenedor verde' },
  'METAL': { nombre: 'Metal', puntos: 25, emoji: '🥫', consejo: 'Enjuaga las latas y deposita en contenedor gris' },
  'ORGANIC': { nombre: 'Orgánico', puntos: 8, emoji: '🌿', consejo: 'Ideal para compostaje, deposita en contenedor marrón' },
  'CARDBOARD': { nombre: 'Cartón', puntos: 10, emoji: '📦', consejo: 'Dobla el cartón para reducir volumen' },
  
  // Modelo Avanzado - Plásticos específicos
  'PET': { nombre: 'PET (Botellas)', puntos: 15, emoji: '🥤', consejo: 'Botellas de agua y refrescos - ¡Altamente reciclable!' },
  'HDPE': { nombre: 'HDPE (Envases)', puntos: 15, emoji: '🧴', consejo: 'Envases de shampoo, detergente - Muy reciclable' },
  'PVC': { nombre: 'PVC', puntos: 12, emoji: '🔧', consejo: 'Tuberías, juguetes - Reciclaje especializado' },
  'LDPE': { nombre: 'LDPE (Bolsas)', puntos: 10, emoji: '🛍️', consejo: 'Bolsas de plástico - Lleva a puntos específicos' },
  'PP': { nombre: 'PP (Tapas)', puntos: 15, emoji: '🧢', consejo: 'Tapas, envases de yogur - Reciclable' },
  'PS': { nombre: 'PS (Unicel)', puntos: 8, emoji: '🥡', consejo: 'Vasos desechables, bandejas - Reciclaje limitado' },
  'OTHER_PLASTIC': { nombre: 'Otro Plástico', puntos: 10, emoji: '♻️', consejo: 'Verifica con tu centro de reciclaje local' },
  'ALUMINUM': { nombre: 'Aluminio', puntos: 25, emoji: '🥫', consejo: 'Latas de refresco - ¡Muy valioso!' },
  'STEEL': { nombre: 'Acero', puntos: 20, emoji: '🔩', consejo: 'Latas de conservas - Reciclable' },
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

    // 2. Obtener usuario
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, puntos_actuales')
      .eq('auth_uuid', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 3. Obtener imagen
    const formData = await request.formData();
    const image = formData.get('image') as File;
    if (!image) {
      return NextResponse.json({ error: 'No hay imagen' }, { status: 400 });
    }

    // 4. Obtener el modelo a usar (por defecto "simple")
    const modelo = formData.get('modelo') as string || 'simple';
    const modeloSeleccionado = modelo === 'avanzado' ? MODELOS.AVANZADO : MODELOS.SIMPLE;

    console.log(`📡 Usando modelo: ${modeloSeleccionado.nombre}`);

    // 5. Llamar a Hugging Face
    const client = await Client.connect("Andres0606/Ruta_Verde");
    const result = await client.predict(modeloSeleccionado.endpoint, { 
      imagen: image 
    });
    
    console.log('📊 Respuesta del modelo:', JSON.stringify(result.data, null, 2));
    
    // 6. PROCESAR RESPUESTA (para ambos modelos)
    const datos = result.data as any;
    let categoria = '';
    let confianza = 0;
    let modeloUsado = modeloSeleccionado.nombre;
    
    // Formato esperado: [categoria, confianza] o { label: "categoria", confidence: 0.95 }
    if (Array.isArray(datos) && datos.length >= 2) {
      // Formato: ["PLASTIC", 0.95] o ["PET", 0.92]
      categoria = String(datos[0]).toUpperCase();
      confianza = Math.round(parseFloat(String(datos[1])) * 100);
    } 
    else if (datos && typeof datos === 'object') {
      // Formato: { label: "PLASTIC", confidence: 0.95 }
      if (datos.label) {
        categoria = String(datos.label).toUpperCase();
      }
      if (datos.confidence) {
        confianza = Math.round(datos.confidence * 100);
      } else if (datos.score) {
        confianza = Math.round(datos.score * 100);
      }
    }
    else if (typeof datos === 'string') {
      // Solo texto, sin confianza
      categoria = datos.toUpperCase();
      confianza = 85; // confianza por defecto
    }
    
    // 7. Validar confianza mínima (80%)
    const CONFIANZA_MINIMA = 80;
    const esConfiable = confianza >= CONFIANZA_MINIMA;
    
    if (!esConfiable) {
      console.log(`⚠️ Confianza baja: ${confianza}% - No se generará QR`);
      return NextResponse.json({
        success: true,
        tipo: 'No identificado',
        categoria_original: categoria,
        confianza: confianza,
        puntos: 0,
        puntos_totales: dbUser.puntos_actuales,
        mensaje: `No pude identificar con certeza (${confianza}% < ${CONFIANZA_MINIMA}%). Intenta con mejor iluminación.`,
        puedeGenerarQR: false,
        modelo_usado: modeloUsado,
      });
    }
    
    // 8. Obtener información de la categoría
    const infoCategoria = MAPEO_CATEGORIAS[categoria] || {
      nombre: categoria,
      puntos: 5,
      emoji: '♻️',
      consejo: 'Deposita en el contenedor correspondiente'
    };
    
    const puntosGanados = infoCategoria.puntos;
    const nuevosPuntos = (dbUser.puntos_actuales || 0) + puntosGanados;
    
    console.log(`✅ Detectado: ${infoCategoria.nombre} con ${confianza}% confianza (${modeloUsado})`);
    console.log(`💰 Puntos: +${puntosGanados} | Total: ${nuevosPuntos}`);
    
    // 9. Guardar en BD
    const { data: residuo, error: residuoError } = await supabase
      .from('residuos')
      .insert({
        usuario_id: dbUser.id,
        categoria_id: null, // Opcional: puedes mapear a tu tabla categorias_residuos
        descripcion: `${infoCategoria.nombre} - ${confianza}% confianza (${modeloUsado})`,
        puntos_otorgados: puntosGanados,
        fecha_registro: new Date().toISOString(),
        estado: 'registrado',
        confianza_ia: confianza,
      })
      .select()
      .single();
    
    if (residuoError) {
      console.error('Error guardando residuo:', residuoError);
    }
    
    // 10. Actualizar puntos del usuario
    await supabase
      .from('users')
      .update({ puntos_actuales: nuevosPuntos })
      .eq('id', dbUser.id);
    
    // 11. Guardar historial
    await supabase
      .from('historial_puntos')
      .insert({
        usuario_id: dbUser.id,
        puntos: puntosGanados,
        concepto: `Clasificación IA (${modeloUsado}): ${infoCategoria.nombre}`,
        referencia_id: residuo?.id,
        fecha: new Date().toISOString(),
      });
    
    // 12. Generar código QR si la confianza es >= 80%
    let qrCode = null;
    if (esConfiable && residuo) {
      // Actualizar residuo con QR code
      qrCode = `QR-${residuo.id}-${Date.now()}`;
      await supabase
        .from('residuos')
        .update({ qr_code: qrCode })
        .eq('id', residuo.id);
    }
    
    // 13. Devolver resultado
    return NextResponse.json({
      success: true,
      tipo: infoCategoria.nombre,
      categoria_original: categoria,
      confianza: confianza,
      puntos: puntosGanados,
      puntos_totales: nuevosPuntos,
      mensaje: `¡Es ${infoCategoria.nombre}! Ganaste ${puntosGanados} puntos.`,
      consejo: infoCategoria.consejo,
      emoji: infoCategoria.emoji,
      puedeGenerarQR: esConfiable,
      qr_code: qrCode,
      residuo_id: residuo?.id,
      modelo_usado: modeloUsado,
      modelos_disponibles: {
        simple: MODELOS.SIMPLE.categorias,
        avanzado: MODELOS.AVANZADO.categorias.slice(0, 6) // Solo mostramos algunos
      }
    });

  } catch (error) {
    console.error('Error en API:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}