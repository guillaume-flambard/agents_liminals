import { cookies } from 'next/headers';
import { User } from '@/types';

interface ServerAuthResult {
  user: User | null;
  token: string | null;
}

export async function getServerAuth(): Promise<ServerAuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return { user: null, token: null };
  }

  try {
    // Verify token with backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { user: null, token: null };
    }

    const result = await response.json();
    
    if (!result.success) {
      return { user: null, token: null };
    }

    return { user: result.data, token: token.value };
  } catch (error) {
    console.error('Server auth error:', error);
    return { user: null, token: null };
  }
}

export async function requireServerAuth(): Promise<User> {
  const { user } = await getServerAuth();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}