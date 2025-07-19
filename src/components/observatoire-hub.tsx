'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/user-profile';
import { ConsultationHistory } from '@/components/consultation-history';
import Link from 'next/link';

interface Agent {
  name: string;
  displayName: string;
  territory: string;
  description: string;
  icon: string;
  symptom: string;
}

type ViewType = 'hub' | 'profile' | 'history' | 'diagnostic' | 'consultation';

export function ObservatoireHub() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('hub');
  const [diagnosticModal, setDiagnosticModal] = useState(false);
  const [consultationModal, setConsultationModal] = useState(false);
  const [currentAgentForConsult, setCurrentAgentForConsult] = useState<string | null>(null);
  const [situationInput, setSituationInput] = useState('');
  const [rituelInput, setRituelInput] = useState('');
  const [consultationResult, setConsultationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configuration des agents
  const AGENTS_CONFIG = {
    evideur: {
      url: 'https://n8n.memoapp.eu/webhook/evideur',
      name: 'L\'Évideur',
      territory: 'Trop-Plein'
    },
    accordeur: {
      url: 'https://n8n.memoapp.eu/webhook/accordeur',
      name: 'L\'Accordeur de Sens',
      territory: 'Flou'
    },
    peseur: {
      url: 'https://n8n.memoapp.eu/webhook/peseur',
      name: 'Le Peseur d\'Ambigus',
      territory: 'Doute'
    },
    habitant: {
      url: 'https://n8n.memoapp.eu/webhook/habitant',
      name: 'L\'Habitant du Creux',
      territory: 'Vide'
    },
    denoueur: {
      url: 'https://n8n.memoapp.eu/webhook/denoueur',
      name: 'Le Dénoue-Tensions',
      territory: 'Friction'
    }
  };

  // Génération des étoiles
  const createStars = () => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push(
        <div
          key={i}
          className="absolute w-0.5 h-0.5 bg-slate-200 rounded-full opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationName: 'twinkle',
            animationDuration: '3s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      );
    }
    return stars;
  };

  // Ouverture consultation
  const openConsultation = (agentId: string, _agentName: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setCurrentAgentForConsult(agentId);
    setConsultationModal(true);
    setSituationInput('');
    setRituelInput('');
    setConsultationResult(null);
  };

  // Fermeture consultation
  const closeConsultation = () => {
    setConsultationModal(false);
    setCurrentAgentForConsult(null);
  };

  // Soumission consultation
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgentForConsult || !situationInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(AGENTS_CONFIG[currentAgentForConsult as keyof typeof AGENTS_CONFIG].url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          situation: situationInput,
          rituel: rituelInput || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        setConsultationResult(result);
      } else {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la consultation:', error);
      setConsultationResult({
        error: true,
        message: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation vers territoire
  const goToTerritory = (territory: string) => {
    const territoryAgents = {
      'trop-plein': 'evideur',
      'flou': 'accordeur',
      'doute': 'peseur',
      'vide': 'habitant',
      'friction': 'denoueur'
    };
    
    const agent = territoryAgents[territory as keyof typeof territoryAgents];
    if (agent && AGENTS_CONFIG[agent as keyof typeof AGENTS_CONFIG]) {
      openConsultation(agent, AGENTS_CONFIG[agent as keyof typeof AGENTS_CONFIG].name);
    }
  };

  // Diagnostic modal
  const openDiagnostic = () => setDiagnosticModal(true);
  const closeDiagnostic = () => setDiagnosticModal(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return <UserProfile onBack={() => setCurrentView('hub')} />;
      case 'history':
        return <ConsultationHistory onBack={() => setCurrentView('hub')} />;
      default:
        return (
          <div className="observatoire-container">
            {/* Style pour les animations */}
            <style jsx>{`
              @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              @keyframes compassSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>

            {/* Étoiles animées */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10">
              {createStars()}
            </div>

            {/* En-tête */}
            <header className="relative z-10 text-center py-15 px-5">
              <motion.h1 
                className="text-5xl text-slate-100 mb-4 font-normal tracking-wider font-serif"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textShadow: '0 3px 15px rgba(236, 240, 241, 0.3)' }}
              >
                Observatoire des États Intérieurs
              </motion.h1>
              <motion.p 
                className="text-xl text-slate-300 italic mb-8 opacity-90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Cartographie émotionnelle • Agents Liminaux • Transformations rituelles
              </motion.p>
            </header>

            {/* Section diagnostic */}
            <section className="max-w-2xl mx-auto mb-15 px-5 relative z-10">
              <div className="bg-slate-700/80 border border-slate-500/30 rounded-xl p-8 text-center backdrop-blur-sm">
                <p className="text-xl text-blue-300 mb-6 font-medium">
                  Où en es-tu en ce moment ?
                </p>
                <button
                  onClick={openDiagnostic}
                  className="bg-gradient-to-r from-blue-500 to-slate-700 text-white border-none py-4 px-8 rounded-lg text-lg cursor-pointer transition-all duration-300 font-serif tracking-wide hover:from-blue-400 hover:to-slate-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  🧭 Diagnostic d'État
                </button>
              </div>
            </section>

            {/* Carte des territoires */}
            <section className="max-w-7xl mx-auto px-5 pb-20 relative z-10">
              <h2 className="text-center text-3xl text-slate-100 mb-10 font-normal">
                Les 5 Territoires Liminaux
              </h2>

              <div className="relative w-full max-w-6xl mx-auto">
                {/* Éléments décoratifs */}
                <div className="absolute top-5 right-8 w-20 h-20 border-2 border-slate-500/30 rounded-full bg-gradient-to-br from-slate-700/80 to-slate-700/40 flex items-center justify-center text-lg text-blue-300 backdrop-blur-sm pointer-events-none"
                     style={{ 
                       animationName: 'compassSpin',
                       animationDuration: '20s',
                       animationTimingFunction: 'linear',
                       animationIterationCount: 'infinite'
                     }}>
                  <div style={{ 
                    animationName: 'compassSpin',
                    animationDuration: '20s',
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDirection: 'reverse'
                  }}>⊕</div>
                </div>

                <div className="absolute bottom-5 left-8 bg-slate-700/80 border border-slate-500/30 rounded-lg p-4 backdrop-blur-sm pointer-events-none">
                  <div className="text-blue-300 font-semibold mb-2">Légende</div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/60"></div>
                    <span className="text-slate-300 text-sm">Agents actifs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Agents secondaires</span>
                  </div>
                </div>

                {/* Constellation des territoires */}
                <div className="grid grid-cols-3 grid-rows-2 gap-10 min-h-[600px] relative">
                  {/* Territoire du Trop-Plein */}
                  <div
                    className="bg-slate-700/85 rounded-3xl p-8 cursor-pointer transition-all duration-400 overflow-hidden backdrop-blur-md border-2 border-transparent shadow-lg shadow-black/30 relative min-h-[240px] flex flex-col justify-between transform -rotate-1 hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:shadow-black/40 hover:z-10"
                    onClick={() => goToTerritory('trop-plein')}
                    style={{
                      borderColor: 'rgba(211, 84, 0, 0.3)',
                      gridColumn: '1',
                      gridRow: '1'
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 to-orange-500 opacity-70"></div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-500/80 rounded-full shadow-lg shadow-green-500/60"></div>
                    
                    <div className="text-4xl text-center mb-5 filter drop-shadow-lg">🌪️</div>
                    <h3 className="text-2xl font-semibold text-center mb-3 text-slate-100">Trop-Plein</h3>
                    <p className="text-sm leading-relaxed text-center text-slate-300 mb-5 italic">
                      Quand tout s'accumule, se mélange, se superpose. L'esprit saturé cherche l'essentiel.
                    </p>
                    <div className="border-t border-slate-500/20 pt-5">
                      <div
                        className="block bg-slate-600/60 text-slate-100 py-3 px-4 rounded-lg no-underline mb-3 transition-all duration-300 text-sm font-medium cursor-pointer bg-green-500/20 border-l-4 border-green-500 hover:bg-green-500/40"
                        onClick={(e) => openConsultation('evideur', 'L\'Évideur', e)}
                      >
                        🕳️ L'Évideur
                      </div>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg mb-3 text-sm cursor-not-allowed border-l-4 border-slate-500">
                        Le Distillateur
                      </span>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg text-sm cursor-not-allowed border-l-4 border-slate-500">
                        La Tisseuse
                      </span>
                    </div>
                  </div>

                  {/* Territoire du Flou */}
                  <div
                    className="bg-slate-700/85 rounded-3xl p-8 cursor-pointer transition-all duration-400 overflow-hidden backdrop-blur-md border-2 border-transparent shadow-lg shadow-black/30 relative min-h-[240px] flex flex-col justify-between transform rotate-1 hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:shadow-black/40 hover:z-10"
                    onClick={() => goToTerritory('flou')}
                    style={{
                      borderColor: 'rgba(133, 193, 233, 0.3)',
                      gridColumn: '3',
                      gridRow: '1'
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-purple-300 opacity-70"></div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-500/80 rounded-full shadow-lg shadow-green-500/60"></div>
                    
                    <div className="text-4xl text-center mb-5 filter drop-shadow-lg">🌫️</div>
                    <h3 className="text-2xl font-semibold text-center mb-3 text-slate-100">Flou</h3>
                    <p className="text-sm leading-relaxed text-center text-slate-300 mb-5 italic">
                      Émotions étranges, situations incompréhensibles. Ce qui ne trouve pas sa place dans l'évidence.
                    </p>
                    <div className="border-t border-slate-500/20 pt-5">
                      <div
                        className="block bg-slate-600/60 text-slate-100 py-3 px-4 rounded-lg no-underline mb-3 transition-all duration-300 text-sm font-medium cursor-pointer bg-green-500/20 border-l-4 border-green-500 hover:bg-green-500/40"
                        onClick={(e) => openConsultation('accordeur', 'L\'Accordeur de Sens', e)}
                      >
                        🎼 L'Accordeur de Sens
                      </div>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg mb-3 text-sm cursor-not-allowed border-l-4 border-slate-500">
                        Le Révélateur
                      </span>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg text-sm cursor-not-allowed border-l-4 border-slate-500">
                        L'Éclaireur
                      </span>
                    </div>
                  </div>

                  {/* Territoire du Doute */}
                  <div
                    className="bg-slate-700/85 rounded-3xl p-8 cursor-pointer transition-all duration-400 overflow-hidden backdrop-blur-md border-2 border-transparent shadow-lg shadow-black/30 relative min-h-[320px] flex flex-col justify-between transform -rotate-0.5 hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:shadow-black/40 hover:z-10"
                    onClick={() => goToTerritory('doute')}
                    style={{
                      borderColor: 'rgba(241, 196, 15, 0.3)',
                      gridColumn: '2',
                      gridRow: '1 / 3'
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-70"></div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-500/80 rounded-full shadow-lg shadow-green-500/60"></div>
                    
                    <div className="text-4xl text-center mb-5 filter drop-shadow-lg">⚖️</div>
                    <h3 className="text-2xl font-semibold text-center mb-3 text-slate-100">Doute</h3>
                    <p className="text-sm leading-relaxed text-center text-slate-300 mb-5 italic">
                      Entre deux eaux, entre deux choix. L'ambiguïté comme espace de possibilités.
                    </p>
                    <div className="border-t border-slate-500/20 pt-5">
                      <div
                        className="block bg-slate-600/60 text-slate-100 py-3 px-4 rounded-lg no-underline mb-3 transition-all duration-300 text-sm font-medium cursor-pointer bg-green-500/20 border-l-4 border-green-500 hover:bg-green-500/40"
                        onClick={(e) => openConsultation('peseur', 'Le Peseur d\'Ambigus', e)}
                      >
                        ⚖️ Le Peseur d'Ambigus
                      </div>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg mb-3 text-sm cursor-not-allowed border-l-4 border-slate-500">
                        L'Embrasseur
                      </span>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg text-sm cursor-not-allowed border-l-4 border-slate-500">
                        Le Gardien
                      </span>
                    </div>
                  </div>

                  {/* Territoire du Vide */}
                  <div
                    className="bg-slate-700/85 rounded-3xl p-8 cursor-pointer transition-all duration-400 overflow-hidden backdrop-blur-md border-2 border-transparent shadow-lg shadow-black/30 relative min-h-[240px] flex flex-col justify-between transform rotate-0.5 hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:shadow-black/40 hover:z-10"
                    onClick={() => goToTerritory('vide')}
                    style={{
                      borderColor: 'rgba(149, 165, 166, 0.3)',
                      gridColumn: '1',
                      gridRow: '2'
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-slate-600 opacity-70"></div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-500/80 rounded-full shadow-lg shadow-green-500/60"></div>
                    
                    <div className="text-4xl text-center mb-5 filter drop-shadow-lg">◯</div>
                    <h3 className="text-2xl font-semibold text-center mb-3 text-slate-100">Vide</h3>
                    <p className="text-sm leading-relaxed text-center text-slate-300 mb-5 italic">
                      L'absence qui n'est pas manque. L'espace libre où tout peut naître.
                    </p>
                    <div className="border-t border-slate-500/20 pt-5">
                      <div
                        className="block bg-slate-600/60 text-slate-100 py-3 px-4 rounded-lg no-underline mb-3 transition-all duration-300 text-sm font-medium cursor-pointer bg-green-500/20 border-l-4 border-green-500 hover:bg-green-500/40"
                        onClick={(e) => openConsultation('habitant', 'L\'Habitant du Creux', e)}
                      >
                        ◯ L'Habitant du Creux
                      </div>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg mb-3 text-sm cursor-not-allowed border-l-4 border-slate-500">
                        Le Semeur
                      </span>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg text-sm cursor-not-allowed border-l-4 border-slate-500">
                        L'Invocateur
                      </span>
                    </div>
                  </div>

                  {/* Territoire de la Friction */}
                  <div
                    className="bg-slate-700/85 rounded-3xl p-8 cursor-pointer transition-all duration-400 overflow-hidden backdrop-blur-md border-2 border-transparent shadow-lg shadow-black/30 relative min-h-[240px] flex flex-col justify-between transform -rotate-1 hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:shadow-black/40 hover:z-10"
                    onClick={() => goToTerritory('friction')}
                    style={{
                      borderColor: 'rgba(231, 76, 60, 0.3)',
                      gridColumn: '3',
                      gridRow: '2'
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 opacity-70"></div>
                    <div className="absolute top-4 right-4 w-3 h-3 bg-green-500/80 rounded-full shadow-lg shadow-green-500/60"></div>
                    
                    <div className="text-4xl text-center mb-5 filter drop-shadow-lg">⚡</div>
                    <h3 className="text-2xl font-semibold text-center mb-3 text-slate-100">Friction</h3>
                    <p className="text-sm leading-relaxed text-center text-slate-300 mb-5 italic">
                      Tensions, résistances, forces qui s'opposent. L'énergie bloquée qui demande transformation.
                    </p>
                    <div className="border-t border-slate-500/20 pt-5">
                      <div
                        className="block bg-slate-600/60 text-slate-100 py-3 px-4 rounded-lg no-underline mb-3 transition-all duration-300 text-sm font-medium cursor-pointer bg-green-500/20 border-l-4 border-green-500 hover:bg-green-500/40"
                        onClick={(e) => openConsultation('denoueur', 'Le Dénoue-Tensions', e)}
                      >
                        ⚡ Le Dénoue-Tensions
                      </div>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg mb-3 text-sm cursor-not-allowed border-l-4 border-slate-500">
                        L'Absorbe-Colères
                      </span>
                      <span className="block bg-slate-500/20 text-slate-500 py-3 px-4 rounded-lg text-sm cursor-not-allowed border-l-4 border-slate-500">
                        Le Transforme
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pied de page */}
            <footer className="text-center py-10 bg-slate-800/90 relative z-10">
              <p className="text-slate-500 text-sm mb-2">Interface rituelle pour états liminaux</p>
              <p className="text-slate-600 text-xs">Version 3.0 • Agents actifs : 5/15</p>
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative"
         style={{
           background: `
             radial-gradient(circle at 20% 80%, rgba(52, 152, 219, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(155, 89, 182, 0.1) 0%, transparent 50%),
             radial-gradient(circle at 40% 40%, rgba(211, 84, 0, 0.05) 0%, transparent 50%),
             linear-gradient(135deg, #0c1426 0%, #1a252f 50%, #2c3e50 100%)
           `
         }}>
      
      {/* Texture papier ancien */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
           style={{
             background: `
               repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(236, 240, 241, 0.01) 2px, rgba(236, 240, 241, 0.01) 4px),
               repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(236, 240, 241, 0.01) 2px, rgba(236, 240, 241, 0.01) 4px)
             `
           }}/>

      {/* Header avec logout */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('history')}
          className="text-slate-300 hover:text-white"
        >
          📚 Historique
        </Button>
        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white"
          >
            <User className="h-4 w-4 mr-2" />
            {user?.username}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-slate-300 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {renderCurrentView()}
      </main>

      {/* Modal de diagnostic */}
      {diagnosticModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-50 p-5">
          <div className="bg-slate-700/95 rounded-xl p-10 max-w-2xl w-full backdrop-blur-md border border-slate-500/30">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-blue-300 text-2xl">Diagnostic d'État Intérieur</h3>
              <button
                onClick={closeDiagnostic}
                className="text-slate-500 hover:text-slate-100 text-3xl cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <p className="leading-relaxed mb-6 text-slate-300">
              Choisis la phrase qui résonne le mieux avec ton état actuel :
            </p>

            <div className="space-y-4">
              {[
                { territory: 'trop-plein', text: '🌀 "J\'ai trop de choses dans la tête, je ne sais plus par où commencer"' },
                { territory: 'flou', text: '🎵 "Je ne comprends pas ce qui m\'arrive, rien ne fait sens"' },
                { territory: 'doute', text: '⚖️ "Je suis tiraillé(e) entre plusieurs options, je ne sais pas choisir"' },
                { territory: 'vide', text: '◯ "Je me sens vide, sans direction, comme suspendu(e)"' },
                { territory: 'friction', text: '⚡ "Quelque chose en moi résiste, je sens de la tension"' }
              ].map((option) => (
                <button
                  key={option.territory}
                  onClick={() => {
                    closeDiagnostic();
                    setTimeout(() => goToTerritory(option.territory), 300);
                  }}
                  className="block w-full bg-slate-600/80 text-slate-100 border border-slate-500/30 py-4 px-5 rounded-lg cursor-pointer transition-all duration-300 font-serif text-left hover:bg-blue-500/30 hover:border-blue-500/60"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interface de consultation */}
      {consultationModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/90 flex items-center justify-center z-50 p-5">
          <div className="bg-slate-700/95 rounded-xl p-10 max-w-3xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-md border border-slate-500/30">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-blue-300 text-xl">
                Consultation avec {currentAgentForConsult && AGENTS_CONFIG[currentAgentForConsult as keyof typeof AGENTS_CONFIG]?.name}
              </h3>
              <button
                onClick={closeConsultation}
                className="text-slate-500 hover:text-slate-100 text-3xl cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleConsultationSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-slate-300 text-sm">
                  Décris ta situation intérieure :
                </label>
                <textarea
                  value={situationInput}
                  onChange={(e) => setSituationInput(e.target.value)}
                  placeholder="Raconte ce qui se passe en toi en ce moment..."
                  className="w-full min-h-[120px] bg-slate-600/80 border border-slate-500/30 rounded-lg p-4 text-slate-100 font-serif resize-vertical"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-slate-300 text-sm">
                  Rituel accompli (optionnel) :
                </label>
                <input
                  type="text"
                  value={rituelInput}
                  onChange={(e) => setRituelInput(e.target.value)}
                  placeholder="Ex: Bougie allumée, respiration profonde..."
                  className="w-full bg-slate-600/80 border border-slate-500/30 rounded-lg p-3 text-slate-100 font-serif"
                />
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-slate-700 text-white border-none py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 font-serif hover:from-green-500 hover:to-slate-600 disabled:opacity-50"
                >
                  {isLoading ? '🔮 Consultation en cours...' : '🔮 Consulter l\'Agent'}
                </button>
                <button
                  type="button"
                  onClick={closeConsultation}
                  className="bg-slate-500/30 text-slate-100 border border-slate-500/30 py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 font-serif hover:bg-slate-500/50"
                >
                  Annuler
                </button>
              </div>
            </form>

            {consultationResult && (
              <div className="mt-6 p-5 bg-slate-600/60 rounded-lg border-l-4 border-blue-500 whitespace-pre-wrap leading-relaxed">
                {consultationResult.error ? (
                  <div className="text-red-400">
                    <strong>Erreur de consultation</strong><br />
                    {consultationResult.message}
                  </div>
                ) : (
                  <div>
                    {consultationResult.consultation && (
                      <div className="text-slate-200">
                        <strong>{consultationResult.agent || 'Agent Liminal'}</strong><br /><br />
                        {consultationResult.consultation}
                      </div>
                    )}
                    {consultationResult.effet && (
                      <div className="mt-4 text-blue-300 italic">
                        Effet: {consultationResult.effet}
                      </div>
                    )}
                    {consultationResult.signature && (
                      <div className="mt-4 text-slate-400">
                        {consultationResult.signature}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}