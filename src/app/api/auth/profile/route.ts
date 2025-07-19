import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { JWTService } from '@/lib/jwt';

// PUT /api/auth/profile - Modifier le profil utilisateur
export async function PUT(request: NextRequest) {
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
    const { name, email } = await request.json();

    // Validation des données
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nom et email requis' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email invalide' },
        { status: 400 }
      );
    }

    const updatedUser = await AuthService.updateUser(authUser.userId, { name, email });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        created_at: updatedUser.created_at,
        last_login_at: updatedUser.last_login_at,
        is_active: updatedUser.is_active
      }
    });

  } catch (error) {
    console.error('Erreur API mise à jour profil:', error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('email est déjà utilisé')) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre compte' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour du profil' 
      },
      { status: 500 }
    );
  }
}