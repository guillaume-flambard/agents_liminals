import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  // Générer un token JWT
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);
  }

  // Vérifier et décoder un token JWT
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('Token JWT invalide:', error);
      return null;
    }
  }

  // Extraire le token depuis les headers de la requête
  static extractTokenFromRequest(request: NextRequest): string | null {
    // Vérifier le header Authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Vérifier les cookies
    const tokenFromCookie = request.cookies.get('auth-token')?.value;
    if (tokenFromCookie) {
      return tokenFromCookie;
    }

    return null;
  }

  // Obtenir l'utilisateur authentifié depuis la requête
  static getAuthenticatedUser(request: NextRequest): JWTPayload | null {
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      return null;
    }

    return this.verifyToken(token);
  }

  // Middleware pour vérifier l'authentification
  static requireAuth(request: NextRequest): { user: JWTPayload } | { error: string; status: number } {
    const user = this.getAuthenticatedUser(request);
    
    if (!user) {
      return {
        error: 'Token d\'authentification requis',
        status: 401
      };
    }

    return { user };
  }
}