import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { JWTService } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authResult = JWTService.requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user: authUser } = authResult;
    const user = await AuthService.getUserById(authUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Structure de réponse compatible avec la page profile
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
        is_active: user.is_active
      }
    });
    
  } catch (error) {
    console.error('Erreur auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}