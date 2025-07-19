import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/consultations/[id] – Récupérer une consultation spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const consultationId = parseInt(resolvedParams.id);

    // Validation de l'ID
    if (isNaN(consultationId) || consultationId <= 0) {
      return NextResponse.json(
        { error: 'ID de consultation invalide' },
        { status: 400 }
      );
    }

    // Récupérer la consultation
    const consultation = await DatabaseService.getConsultationById(consultationId);

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error('Erreur API consultation par ID:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de la consultation' 
      },
      { status: 500 }
    );
  }
}