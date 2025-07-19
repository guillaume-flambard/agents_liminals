import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Déconnexion utilisateur');

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

    // Supprimer le cookie d'authentification
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immédiatement
    });

    return response;
    
  } catch (error) {
    console.error('Erreur auth/logout:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}