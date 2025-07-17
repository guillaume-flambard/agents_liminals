import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Données reçues pour inscription:', body);
    
    const { email, password, name, username } = body;
    
    // Utiliser username si name n'est pas fourni
    const displayName = name || username;

    // Validation basique
    if (!email || !password || !displayName) {
      console.log('Validation échouée - champs manquants:', { email: !!email, password: !!password, name: !!name, username: !!username, displayName: !!displayName });
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format email invalide' },
        { status: 400 }
      );
    }

    // Validation mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Pour le développement, simuler un enregistrement réussi
    console.log('Inscription réussie pour:', { email, displayName });

    const newUser = {
      id: Date.now(),
      email,
      name: displayName,
      isAuthenticated: true,
      createdAt: new Date().toISOString()
    };

    // Structure de réponse compatible avec api-client
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: newUser,
        token: 'demo-jwt-token-' + Date.now()
      }
    });
    
  } catch (error) {
    console.error('Erreur auth/register:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}