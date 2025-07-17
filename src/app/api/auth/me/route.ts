import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Pour le développement, retourner un utilisateur mock
    const mockUser = {
      id: 1,
      email: 'demo@agents-liminals.fr',
      name: 'Utilisateur Demo',
      isAuthenticated: true
    };

    // Structure de réponse compatible avec api-client
    return NextResponse.json({
      success: true,
      data: mockUser
    });
    
  } catch (error) {
    console.error('Erreur auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}