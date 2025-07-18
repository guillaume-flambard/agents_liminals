import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
    // Tester la connexion
    const isConnected = await DatabaseService.testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Connexion à la base de données échouée' 
        },
        { status: 500 }
      );
    }

    // Tester une requête simple
    const { consultations, total } = await DatabaseService.getConsultations({ limit: 1 });
    
    return NextResponse.json({
      success: true,
      message: 'Connexion PostgresSQL établie avec succès',
      data: {
        connectionStatus: 'OK',
        totalConsultations: total,
        sampleDataExists: consultations.length > 0
      }
    });

  } catch (error) {
    console.error('Erreur test DB:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}