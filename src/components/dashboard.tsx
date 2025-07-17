'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  onBack: () => void;
}

export function Dashboard({ onBack }: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-blue-300">Tableau de Bord</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">Consultations Aujourd'hui</h3>
          <div className="text-3xl font-bold text-white">0/3</div>
          <p className="text-sm text-slate-400 mt-2">Consultations utilisées</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">Agent Préféré</h3>
          <div className="text-2xl text-white">🎵</div>
          <p className="text-sm text-slate-400 mt-2">L'Accordeur de Sens</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">Total Consultations</h3>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-sm text-slate-400 mt-2">Depuis le début</p>
        </div>
      </div>
    </div>
  );
}