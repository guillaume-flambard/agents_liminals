import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { JWTService } from '@/lib/jwt';

// POST /api/auth/change-password - Changer le mot de passe
export async function POST(request: NextRequest) {
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
    const { currentPassword, newPassword } = await request.json();

    // Validation des données
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const user = await AuthService.getUserByIdWithPassword(authUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await AuthService.verifyPassword(currentPassword, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      );
    }

    // Changer le mot de passe
    const success = await AuthService.changePassword(authUser.userId, newPassword);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erreur lors du changement de mot de passe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Erreur API changement mot de passe:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du changement de mot de passe' 
      },
      { status: 500 }
    );
  }
}