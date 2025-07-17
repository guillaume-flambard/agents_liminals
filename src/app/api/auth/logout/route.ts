import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Pour le développement, simuler une déconnexion réussie
    // En production, ceci invaliderait le token/session
    
    console.log('Déconnexion utilisateur');

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    console.error('Erreur auth/logout:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}