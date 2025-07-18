import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/consultations/stats - Récupérer les statistiques des consultations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Paramètres de filtrage
    const ipAddress = searchParams.get('ip') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Récupérer les statistiques
    const stats = await DatabaseService.getConsultationStats({
      ipAddress,
      startDate,
      endDate
    });

    return NextResponse.json({
      success: true,
      data: stats,
      filters: {
        ipAddress,
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Erreur API statistiques consultations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques' 
      },
      { status: 500 }
    );
  }
}