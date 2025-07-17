'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConsultationHistoryProps {
  onBack: () => void;
}

export function ConsultationHistory({ onBack }: ConsultationHistoryProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-blue-300">Historique des Consultations</h1>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
        <div className="text-center text-slate-400 py-8">
          <p>Votre historique de consultations apparaîtra ici.</p>
          <p className="text-sm mt-2">Consultez un agent pour commencer votre historique.</p>
        </div>
      </div>
    </div>
  );
}