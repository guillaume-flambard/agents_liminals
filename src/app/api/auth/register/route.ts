import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { UserCreate } from '@/types/user';

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

    // Créer l'utilisateur dans la base de données
    const user = await AuthService.createUser({ 
      email, 
      name: displayName, 
      password 
    });

    console.log('Inscription réussie pour:', { email, displayName });

    // Structure de réponse compatible avec api-client
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAuthenticated: true,
          createdAt: user.created_at
        },
        token: 'demo-jwt-token-' + user.id
      }
    });
    
  } catch (error) {
    console.error('Erreur auth/register:', error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('existe déjà')) {
        return NextResponse.json(
          { success: false, error: 'Un compte avec cet email existe déjà' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}