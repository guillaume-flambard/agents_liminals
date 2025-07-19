import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { JWTService } from '@/lib/jwt';
import { UserLogin } from '@/types/user';

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

    // Authentifier l'utilisateur
    const userSession = await AuthService.authenticateUser({ 
      email: loginIdentifier, 
      password 
    });

    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    console.log('Connexion réussie pour:', { loginIdentifier });

    // Générer un vrai token JWT
    const token = JWTService.generateToken({
      userId: userSession.id,
      email: userSession.email,
      name: userSession.name
    });

    // Créer la réponse avec le token dans un cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: userSession.id,
          email: userSession.email,
          name: userSession.name,
          isAuthenticated: userSession.isAuthenticated,
          lastLogin: new Date().toISOString()
        },
        token
      }
    });

    // Définir le cookie d'authentification
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    });

    return response;
    
  } catch (error) {
    console.error('Erreur auth/login:', error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('désactivé')) {
        return NextResponse.json(
          { success: false, error: 'Compte désactivé' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}