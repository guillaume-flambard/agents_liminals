import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { JWTService } from '@/lib/jwt';

// GET /api/consultations/stats - Récupérer les statistiques des consultations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Vérifier si c'est pour les stats utilisateur ou globales
    const userStats = searchParams.get('user') === 'true';
    
    if (userStats) {
      // Vérifier l'authentification pour les stats utilisateur
      const authResult = JWTService.requireAuth(request);
      if ('error' in authResult) {
        return NextResponse.json(
          { error: authResult.error },
          { status: authResult.status }
        );
      }

      const { user: authUser } = authResult;
      const stats = await AuthService.getUserStats(authUser.userId);
      
      return NextResponse.json({
        success: true,
        stats
      });
    } else {
      // Statistiques globales (ancien comportement)
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
    }

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