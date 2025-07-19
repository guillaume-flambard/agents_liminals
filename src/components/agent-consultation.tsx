'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, RotateCcw, History, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/auth-provider';
import { useToast } from '@/components/ui/toaster';
import { getAgentColors, getAgentIcon } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface AgentConfig {
  name: string;
  displayName: string;
  territory: string;
  symptom: string;
  ritualSteps: string[];
  placeholder: string;
  maxLength: number;
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
  },
  peseur: {
    name: 'peseur',
    displayName: 'Le Peseur d\'Ambigus',
    territory: 'Territoire du Doute',
    symptom: 'Je suis tiraillé(e) entre plusieurs options, je ne sais pas quoi choisir',
    ritualSteps: [
      'Pose tes mains sur ton cœur',
      'Respire profondément 3 fois',
      'Énonce à voix haute : "Je pèse mes options avec sagesse"',
      'Décris ton dilemme ci-dessous',
      'Clique pour peser'
    ],
    placeholder: 'Décris ton dilemme... Quelles sont les options ? Qu\'est-ce qui te tire dans différentes directions ? Quels sont tes doutes ?',
    maxLength: 2000,
  },
  denoueur: {
    name: 'denoueur',
    displayName: 'Le Dénoueur',
    territory: 'Territoire de la Tension',
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
  },
  evideur: {
    name: 'evideur',
    displayName: 'L\'Évideur',
    territory: 'Territoire de la Révélation',
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
  },
  habitant: {
    name: 'habitant',
    displayName: 'L\'Habitant du Creux',
    territory: 'Territoire du Vide',
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
  },
};

const consultationSchema = z.object({
  situation: z.string().min(10, 'Décris ta situation en au moins 10 caractères').max(2000, 'Maximum 2000 caractères'),
});

type ConsultationForm = z.infer<typeof consultationSchema>;

interface ConsultationResponse {
  consultation: string;
  signature: string;
  sessionId: string;
}

interface AgentConsultationProps {
  agentName: string;
}

export function AgentConsultation({ agentName }: AgentConsultationProps) {
  const config = agentConfigs[agentName];
  const colors = getAgentColors(agentName);
  const icon = getAgentIcon(agentName);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [consultationResponse, setConsultationResponse] = useState<ConsultationResponse | null>(null);
  const [consultationCount, setConsultationCount] = useState(0);
  const [maxConsultations] = useState(3);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ConsultationForm>({
    resolver: zodResolver(consultationSchema),
  });

  const situationValue = watch('situation', '');

  useEffect(() => {
    // Load consultation count from localStorage (temporary until we have API)
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`${agentName}_consultations_${today}`);
    setConsultationCount(stored ? parseInt(stored) : 0);
  }, [agentName]);

  const onSubmit = async (data: ConsultationForm) => {
    if (!data.situation.trim()) {
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
      const rituel = config.ritualSteps.join(', ');
      
      const response = await apiClient.post('/api/consultations', {
        agentType: agentName,
        situation: data.situation,
        rituel,
      });

      if (response.data.success) {
        setConsultationResponse(response.data.data.response);
        
        // Update consultation count
        const today = new Date().toDateString();
        const newCount = consultationCount + 1;
        localStorage.setItem(`${agentName}_consultations_${today}`, newCount.toString());
        setConsultationCount(newCount);

        toast({
          title: '✨ Consultation reçue',
          description: `${config.displayName} a harmonisé votre état`,
          type: 'success',
        });
      } else {
        throw new Error(response.data.error || 'Erreur lors de la consultation');
      }

    } catch (error) {
      console.error('Erreur consultation:', error);
      
      let errorMessage = 'Une erreur est survenue';
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = `⏰ ${config.displayName} prend plus de temps que prévu. Réessayez dans un moment.`;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = `🔌 Impossible de contacter ${config.displayName}. Vérifiez votre connexion.`;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: '❌ Erreur de consultation',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    reset();
    setConsultationResponse(null);
  };

  if (!config) {
    return <div>Agent non trouvé</div>;
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <div 
          className="relative rounded-xl border backdrop-blur-md p-8 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${colors.background}cc, ${colors.surface}cc)`,
            borderColor: colors.border,
          }}
        >
          {/* Frequency Indicator */}
          <div 
            className="absolute right-6 top-1/2 -translate-y-1/2 w-1 h-20 rounded-full opacity-40 animate-frequency-wave"
            style={{
              background: `linear-gradient(to top, ${colors.primary}, ${colors.secondary})`,
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'Observatoire
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <History className="h-4 w-4 mr-2" />
              Résonances
            </Button>
          </div>

          {/* Agent Info */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{icon}</div>
            <h1 
              className="text-4xl font-bold mb-2 font-serif"
              style={{ color: colors.primary }}
            >
              {config.displayName}
            </h1>
            <p 
              className="text-xl italic mb-4"
              style={{ color: colors.secondary }}
            >
              {config.territory}
            </p>
            <div className="text-sm text-slate-400">
              Consultations aujourd'hui : {consultationCount}/{maxConsultations}
            </div>
          </div>

          {/* Symptom */}
          <div 
            className="p-4 rounded-lg border-l-4 mb-8"
            style={{
              backgroundColor: `${colors.secondary}15`,
              borderLeftColor: colors.secondary,
            }}
          >
            <strong className="text-slate-300">Symptôme d'appel :</strong>
            <p className="text-slate-300 mt-1">"{config.symptom}"</p>
          </div>

          {/* Ritual */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: colors.primary }}>
              {icon} Rituel d'Harmonisation
            </h3>
            <div 
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: `${colors.primary}15`,
                borderColor: `${colors.primary}30`,
              }}
            >
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Textarea
                {...register('situation')}
                placeholder={config.placeholder}
                className="min-h-[150px] bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 resize-none"
                maxLength={config.maxLength}
              />
              <div className="flex justify-between mt-2">
                <div>
                  {errors.situation && (
                    <p className="text-red-400 text-sm">{errors.situation.message}</p>
                  )}
                </div>
                <div className="text-sm text-slate-400">
                  {situationValue.length}/{config.maxLength}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading || consultationCount >= maxConsultations}
                className="flex-1 h-12 text-lg font-medium"
                style={{
                  background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    L'Agent harmonise...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    {config.name === 'accordeur' ? 'Accorder' : 
                     config.name === 'peseur' ? 'Peser' : 
                     config.name === 'denoueur' ? 'Dénouer' : 
                     config.name === 'evideur' ? 'Révéler' : 'Habiter'}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={clearInput}
                className="px-6 h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Effacer
              </Button>
            </div>
          </form>

          {/* Response */}
          {consultationResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 p-6 rounded-lg border"
              style={{
                backgroundColor: `${colors.primary}12`,
                borderColor: `${colors.primary}30`,
              }}
            >
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-line text-slate-200 leading-relaxed">
                  {consultationResponse.consultation}
                </div>
              </div>
              
              <div className="border-t border-slate-600 mt-6 pt-4 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  <div>{consultationResponse.signature}</div>
                  <div>Session: {consultationResponse.sessionId}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    <Star className="h-4 w-4 mr-1" />
                    Évaluer
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              Agent Liminal • Observatoire des États Intérieurs • Fréquence Harmonique
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}