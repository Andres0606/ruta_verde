import { NextResponse } from 'next/server';
import { Client } from '@gradio/client';

export async function GET() {
  try {
    console.log('1. Iniciando prueba de IA...');
    
    // Descargar imagen de prueba
    const response = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
    const imageBlob = await response.blob();
    
    console.log('2. Imagen descargada, tamaño:', imageBlob.size);
    
    // Crear archivo
    const file = new File([imageBlob], "test.png", { type: "image/png" });
    
    // Conectar a Hugging Face
    console.log('3. Conectando a Hugging Face...');
    const client = await Client.connect("Andres0606/Ruta_Verde");
    
    console.log('4. Enviando imagen para predicción...');
    const result = await client.predict("/simple", {
      imagen: file,
    });
    
    console.log('5. Resultado recibido:', JSON.stringify(result, null, 2));
    
    // Devolver la respuesta completa
    return NextResponse.json({
      success: true,
      resultado: result,
      tipo_de_data: typeof result.data,
      es_objeto: result.data && typeof result.data === 'object',
      datos: result.data,
    });
    
  } catch (error) {
    console.error('Error en test:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}