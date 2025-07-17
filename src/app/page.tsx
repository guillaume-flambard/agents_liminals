'use client';

import { useAuth } from '@/lib/auth/auth-provider';
import { ObservatoireHub } from '@/components/observatoire-hub';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <ObservatoireHub />
    </main>
  );
}