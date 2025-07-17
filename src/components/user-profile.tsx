'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';

interface UserProfileProps {
  onBack: () => void;
}

export function UserProfile({ onBack }: UserProfileProps) {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-blue-300">Profil Utilisateur</h1>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom d'utilisateur
            </label>
            <div className="text-white bg-slate-700/50 p-3 rounded-lg">
              {user?.username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="text-white bg-slate-700/50 p-3 rounded-lg">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type d'abonnement
            </label>
            <div className="text-white bg-slate-700/50 p-3 rounded-lg">
              {user?.subscription?.type === 'premium' ? 'Premium' : 'Gratuit'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Limite quotidienne de consultations
            </label>
            <div className="text-white bg-slate-700/50 p-3 rounded-lg">
              {user?.subscription?.dailyConsultationLimit || 3} consultations par jour
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}