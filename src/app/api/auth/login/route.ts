import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Données reçues pour connexion:', body);
    
    const { email, password, username } = body;
    
    // Utiliser username si email n'est pas fourni (permet connexion par username ou email)
    const loginIdentifier = email || username;

    // Validation basique
    if (!loginIdentifier || !password) {
      console.log('Validation échouée:', { email: !!email, username: !!username, password: !!password });
      return NextResponse.json(
        { success: false, error: 'Identifiant et mot de passe requis' },
        { status: 400 }
      );
    }

    // Pour le développement, accepter n'importe quel login valide
    console.log('Connexion réussie pour:', { loginIdentifier });

    const user = {
      id: 1,
      email: email || `${username}@demo.com`, // Générer un email si connexion par username
      name: username || 'Utilisateur Demo',
      isAuthenticated: true,
      lastLogin: new Date().toISOString()
    };

    // Structure de réponse compatible avec api-client
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user,
        token: 'demo-jwt-token-' + Date.now()
      }
    });
    
  } catch (error) {
    console.error('Erreur auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}