import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/consultations - Récupérer l'historique des consultations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Paramètres de filtrage
    const agentName = searchParams.get('agent') || undefined;
    const ipAddress = searchParams.get('ip') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;

    // Validation des paramètres
    if (limit > 100) {
      return NextResponse.json(
        { error: 'La limite ne peut pas dépasser 100 éléments' },
        { status: 400 }
      );
    }

    // Récupérer les consultations
    const { consultations, total } = await DatabaseService.getConsultations({
      limit,
      offset,
      agentName,
      ipAddress,
      startDate,
      endDate,
      userId
    });

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: consultations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      },
      filters: {
        agentName,
        ipAddress,
        startDate,
        endDate,
        userId
      }
    });

  } catch (error) {
    console.error('Erreur API consultations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des consultations' 
      },
      { status: 500 }
    );
  }
}