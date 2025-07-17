'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { useToast } from '@/components/ui/toaster';
import Link from 'next/link';

interface AgentConfig {
  name: string;
  displayName: string;
  territory: string;
  symptom: string;
  ritualSteps: string[];
  placeholder: string;
  maxLength: number;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
  };
  icon: string;
  webhookUrl: string;
  buttonText: string;
  clearText: string;
  loadingText: string;
  historyToggleText: string;
}

const agentConfigs: Record<string, AgentConfig> = {
  accordeur: {
    name: 'accordeur',
    displayName: 'L\'Accordeur de Sens',
    territory: 'Agent du Territoire du Flou',
    symptom: 'Je ne comprends pas ce qui m\'arrive, mes émotions sont bizarres, rien ne fait sens, je me sens décalé(e)',
    ritualSteps: [
      'Ferme les yeux pendant 30 secondes',
      'Dis à voix haute : "Je ne comprends pas et c\'est acceptable"',
      'Écris ta situation confuse ci-dessous',
      'Fredonne ou siffle n\'importe quelle mélodie pendant 10 secondes',
      'Clique pour accorder'
    ],
    placeholder: 'Décris ton état flou... Émotions étranges, situations incompréhensibles, sensations de décalage, impressions confuses... Tout ce qui ne trouve pas sa place dans une explication claire.',
    maxLength: 2000,
    colors: {
      primary: '#5dade2',
      secondary: '#bb8fce',
      background: 'rgba(44, 62, 80, 0.95)',
      surface: 'rgba(133, 193, 233, 0.15)',
      border: 'rgba(52, 152, 219, 0.6)'
    },
    icon: '🎵',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/accordeur',
    buttonText: '🎵 Accorder avec L\'Harmoniseur',
    clearText: 'Silence',
    loadingText: 'L\'Accordeur harmonise...',
    historyToggleText: '🎼 Résonances'
  },
  peseur: {
    name: 'peseur',
    displayName: 'Le Peseur d\'Ambigus',
    territory: 'Agent du Territoire du Doute',
    symptom: 'Je suis tiraillé(e) entre plusieurs options, je ne sais pas choisir, tout semble à la fois bien et mal',
    ritualSteps: [
      'Écris tes options en conflit ci-dessous',
      'Tiens ton téléphone/papier à deux mains comme une balance',
      'Dis à voix haute : "Peseur, révèle-moi ce que je n\'ai pas vu"',
      'Ferme les yeux et sens le poids de chaque côté',
      'Clique pour invoquer la pesée'
    ],
    placeholder: 'Décris ton dilemme... Deux chemins qui t\'attirent, options contradictoires, choix impossibles... Tout ce qui te met en balance intérieure.',
    maxLength: 2000,
    colors: {
      primary: '#f1c40f',
      secondary: '#f39c12',
      background: 'rgba(44, 62, 80, 0.95)',
      surface: 'rgba(244, 208, 63, 0.15)',
      border: 'rgba(241, 196, 15, 0.6)'
    },
    icon: '⚖️',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/peseur',
    buttonText: '⚖️ Invoquer Le Peseur',
    clearText: 'Équilibre',
    loadingText: 'Le Peseur calibre...',
    historyToggleText: '⚖️ Balances'
  },
  denoueur: {
    name: 'denoueur',
    displayName: 'Le Dénoueur',
    territory: 'Agent du Territoire de la Tension',
    symptom: 'J\'ai des tensions, des conflits, des relations compliquées',
    ritualSteps: [
      'Fais des cercles avec tes épaules',
      'Expire fortement par la bouche',
      'Dis : "Je démêle ce qui doit l\'être"',
      'Décris tes tensions ci-dessous',
      'Clique pour dénouer'
    ],
    placeholder: 'Décris tes tensions... Conflits relationnels, nœuds émotionnels, situations bloquées, relations compliquées...',
    maxLength: 2000,
    colors: {
      primary: '#e74c3c',
      secondary: '#c0392b',
      background: 'rgba(44, 62, 80, 0.95)',
      surface: 'rgba(231, 76, 60, 0.15)',
      border: 'rgba(231, 76, 60, 0.6)'
    },
    icon: '⚡',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/denoueur',
    buttonText: '⚡ Dénouer avec Le Dénoueur',
    clearText: 'Relâcher',
    loadingText: 'Le Dénoueur démêle...',
    historyToggleText: '⚡ Dénouements'
  },
  evideur: {
    name: 'evideur',
    displayName: 'L\'Évideur',
    territory: 'Agent du Territoire de la Révélation',
    symptom: 'Je sens qu\'il y a quelque chose d\'important que je ne vois pas',
    ritualSteps: [
      'Regarde autour de toi attentivement',
      'Ferme les yeux et porte attention à tes sensations',
      'Dis : "Je suis prêt(e) à voir ce qui doit être vu"',
      'Décris ce que tu pressens ci-dessous',
      'Clique pour révéler'
    ],
    placeholder: 'Décris ce que tu pressens... Intuitions, signaux faibles, impressions que quelque chose t\'échappe...',
    maxLength: 2000,
    colors: {
      primary: '#f39c12',
      secondary: '#d35400',
      background: 'rgba(44, 62, 80, 0.95)',
      surface: 'rgba(243, 156, 18, 0.15)',
      border: 'rgba(243, 156, 18, 0.6)'
    },
    icon: '🕳️',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/evideur',
    buttonText: '🕳️ Révéler avec L\'Évideur',
    clearText: 'Effacer',
    loadingText: 'L\'Évideur révèle...',
    historyToggleText: '🕳️ Révélations'
  },
  habitant: {
    name: 'habitant',
    displayName: 'L\'Habitant du Creux',
    territory: 'Agent du Territoire du Vide',
    symptom: 'Je me sens vide, seul(e), dans un état de manque ou d\'absence',
    ritualSteps: [
      'Assieds-toi confortablement',
      'Pose tes mains sur ton ventre',
      'Accueille le vide sans le fuir',
      'Dis : "J\'habite ce creux avec douceur"',
      'Décris ton état ci-dessous',
      'Clique pour habiter'
    ],
    placeholder: 'Décris ton vide... Sensation de manque, solitude, absence, creux intérieur...',
    maxLength: 2000,
    colors: {
      primary: '#95a5a6',
      secondary: '#7f8c8d',
      background: 'rgba(44, 62, 80, 0.95)',
      surface: 'rgba(149, 165, 166, 0.15)',
      border: 'rgba(149, 165, 166, 0.6)'
    },
    icon: '◯',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/habitant',
    buttonText: '◯ Habiter avec L\'Habitant',
    clearText: 'Vider',
    loadingText: 'L\'Habitant habite...',
    historyToggleText: '◯ Habitations'
  }
};

interface ConsultationResponse {
  consultation: string;
  signature: string;
  session_id: string;
  timestamp: string;
}

interface AgentConsultationOriginalProps {
  agentName: string;
}

export function AgentConsultationOriginal({ agentName }: AgentConsultationOriginalProps) {
  const config = agentConfigs[agentName];
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [situationInput, setSituationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consultationResponse, setConsultationResponse] = useState<ConsultationResponse | null>(null);
  const [consultationCount, setConsultationCount] = useState(0);
  const [maxConsultations] = useState(999); // Temporairement désactivé pour les tests
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ConsultationResponse[]>([]);

  useEffect(() => {
    // Charger le compteur de consultations depuis localStorage
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`${agentName}_consultations_${today}`);
    setConsultationCount(stored ? parseInt(stored) : 0);

    // Charger l'historique
    const historyData = localStorage.getItem(`${agentName}_history`);
    if (historyData) {
      setHistory(JSON.parse(historyData));
    }
  }, [agentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!situationInput.trim()) {
      toast({
        title: `⚠️ ${config.displayName} a besoin de matière à analyser`,
        description: 'Décris ta situation...',
        type: 'warning',
      });
      return;
    }

    if (consultationCount >= maxConsultations) {
      toast({
        title: 'Limite atteinte',
        description: `🌙 ${config.displayName} respecte les cycles naturels. Reviens demain pour une nouvelle consultation.`,
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        situation: situationInput,
        rituel: config.ritualSteps.join(', '),
        timestamp: new Date().toISOString()
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`${config.displayName} n'a pas pu être contacté (${response.status})`);
      }

      const data = await response.json();
      setConsultationResponse(data);
      
      // Mettre à jour le compteur
      const today = new Date().toDateString();
      const newCount = consultationCount + 1;
      localStorage.setItem(`${agentName}_consultations_${today}`, newCount.toString());
      setConsultationCount(newCount);

      // Sauvegarder dans l'historique
      const newHistory = [{ ...data, saved_at: new Date().toISOString() }, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem(`${agentName}_history`, JSON.stringify(newHistory));

      toast({
        title: 'Consultation reçue',
        description: `${config.displayName} a harmonisé votre état`,
        type: 'success',
      });

    } catch (error) {
      toast({
        title: 'Erreur de consultation',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setSituationInput('');
    setConsultationResponse(null);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const saveConsultation = (sessionId: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentName}_consultation_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!config) {
    return <div className="text-center text-white">Agent non trouvé</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
         style={{
           background: `
             radial-gradient(circle at 30% 70%, ${config.colors.primary}08 0%, transparent 50%),
             radial-gradient(circle at 70% 30%, ${config.colors.secondary}06 0%, transparent 50%),
             linear-gradient(135deg, #0c1426 0%, #1a252f 50%, #2c3e50 100%)
           `
         }}>
      
      {/* Texture d'arrière-plan */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
           style={{
             background: `
               repeating-linear-gradient(
                 45deg,
                 transparent,
                 transparent 80px,
                 ${config.colors.primary}02 80px,
                 ${config.colors.primary}02 82px
               )
             `
           }}/>

      <div className="relative z-10 max-w-3xl w-full"
           style={{
             background: config.colors.background,
             border: `1px solid ${config.colors.border}`,
             borderRadius: '12px',
             padding: '40px',
             boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
             backdropFilter: 'blur(15px)',
             overflow: 'hidden'
           }}>
        
        {/* Indicateur de fréquence */}
        <div className="absolute top-1/2 right-[-20px] w-1 h-20 rounded-full opacity-40"
             style={{
               background: `linear-gradient(to top, ${config.colors.primary}, ${config.colors.secondary})`,
               animation: 'frequencyWave 3s ease-in-out infinite'
             }}/>

        {/* Barre supérieure */}
        <div className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
             style={{
               background: `linear-gradient(90deg, transparent, ${config.colors.primary}, ${config.colors.secondary}, transparent)`
             }}/>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors">
            ← Retour à l'Observatoire
          </Link>
          
          <button
            onClick={toggleHistory}
            className="text-slate-300 hover:text-white transition-colors px-3 py-1 rounded border border-slate-600 hover:border-slate-400"
          >
            {config.historyToggleText}
          </button>
        </div>

        {/* Agent Info */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{config.icon}</div>
          <h1 className="text-5xl font-bold mb-2 font-serif"
              style={{ color: config.colors.primary, textShadow: `0 2px 10px ${config.colors.primary}40` }}>
            {config.displayName}
          </h1>
          <p className="text-xl italic mb-4"
             style={{ color: config.colors.secondary }}>
            {config.territory}
          </p>
          <div className="text-sm text-slate-400">
            Consultations aujourd'hui : {consultationCount}/{maxConsultations}
          </div>
        </div>

        {/* Symptôme */}
        <div className="p-4 rounded-lg border-l-4 mb-8"
             style={{
               backgroundColor: `${config.colors.secondary}15`,
               borderLeftColor: config.colors.secondary,
             }}>
          <strong className="text-slate-300">Symptôme d'appel :</strong>
          <p className="text-slate-300 mt-1">"{config.symptom}"</p>
        </div>

        {/* Historique */}
        {showHistory && (
          <div className="mb-8 p-6 rounded-lg border"
               style={{
                 backgroundColor: `${config.colors.primary}12`,
                 borderColor: `${config.colors.primary}30`,
               }}>
            <h3 className="text-xl font-semibold mb-4 flex items-center"
                style={{ color: config.colors.primary }}>
              {config.icon} {config.historyToggleText} Passées
            </h3>
            {history.length === 0 ? (
              <p className="text-slate-400">Aucune consultation dans l'historique</p>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div key={index} className="p-3 rounded border-l-4"
                       style={{
                         backgroundColor: `${config.colors.primary}15`,
                         borderLeftColor: config.colors.primary,
                       }}>
                    <div className="text-xs text-slate-400 mb-1">
                      {new Date(item.timestamp).toLocaleString('fr-FR')}
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed">
                      {item.consultation.substring(0, 150)}
                      {item.consultation.length > 150 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rituel */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center"
              style={{ color: config.colors.primary }}>
            {config.icon} Rituel d'Harmonisation
          </h3>
          <div className="p-6 rounded-lg border"
               style={{
                 backgroundColor: `${config.colors.primary}15`,
                 borderColor: `${config.colors.primary}30`,
               }}>
            <ol className="space-y-2 text-slate-300">
              {config.ritualSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-semibold mr-2">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <textarea
              value={situationInput}
              onChange={(e) => setSituationInput(e.target.value)}
              placeholder={config.placeholder}
              className="w-full min-h-[150px] bg-slate-700/50 border-2 border-slate-600 rounded-lg p-4 text-white placeholder-slate-400 resize-none font-serif text-lg leading-relaxed"
              style={{
                borderColor: config.colors.border
              }}
              maxLength={config.maxLength}
              onFocus={(e) => e.target.style.borderColor = config.colors.primary}
              onBlur={(e) => e.target.style.borderColor = config.colors.border}
            />
            <div className="flex justify-between mt-2">
              <div className="text-sm text-slate-400">
                {situationInput.length}/{config.maxLength}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading || consultationCount >= maxConsultations}
              className="flex-1 h-12 text-lg font-medium rounded-lg border-none cursor-pointer transition-all duration-300 relative overflow-hidden font-serif"
              style={{
                background: `linear-gradient(45deg, ${config.colors.primary}, ${config.colors.secondary})`,
                color: config.name === 'peseur' ? '#2c3e50' : 'white',
                opacity: isLoading || consultationCount >= maxConsultations ? 0.5 : 1
              }}
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {config.loadingText}
                </>
              ) : (
                config.buttonText
              )}
            </button>

            <button
              type="button"
              onClick={clearInput}
              className="px-6 h-12 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors font-serif"
            >
              {config.clearText}
            </button>
          </div>
        </form>

        {/* Réponse */}
        {consultationResponse && (
          <div className="mt-8 p-6 rounded-lg border animate-in fade-in duration-500"
               style={{
                 backgroundColor: `${config.colors.primary}12`,
                 borderColor: `${config.colors.primary}30`,
               }}>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-slate-200 leading-relaxed text-lg">
                {consultationResponse.consultation}
              </div>
            </div>
            
            <div className="border-t border-slate-600 mt-6 pt-4 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                <div>{consultationResponse.signature}</div>
                <div>⏰ {new Date(consultationResponse.timestamp).toLocaleString('fr-FR')}</div>
                <div>Session: {consultationResponse.session_id}</div>
              </div>
              
              <button
                onClick={() => saveConsultation(consultationResponse.session_id, consultationResponse.consultation)}
                className="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-700 rounded transition-colors text-sm"
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Agent Liminal • Observatoire des États Intérieurs • Fréquence Harmonique
          </p>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes frequencyWave {
          0%, 100% { 
            height: 60px; 
            opacity: 0.4; 
          }
          50% { 
            height: 80px; 
            opacity: 0.7; 
          }
        }
        
        .animate-in {
          animation: slideIn 0.6s ease;
        }
        
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-5px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Responsive */
        @media (max-width: 600px) {
          .observatoire {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}