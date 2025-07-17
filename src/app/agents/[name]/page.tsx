import { notFound, redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/auth/server-auth';
import { AgentConsultationOriginal } from '@/components/agent-consultation-original';

const VALID_AGENTS = ['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant'];

interface AgentPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({ params }: AgentPageProps) {
  const { name } = await params;
  const agentNames = {
    accordeur: 'L\'Accordeur de Sens',
    peseur: 'Le Peseur d\'Ambigus',
    denoueur: 'Le Dénoueur',
    evideur: 'L\'Évideur',
    habitant: 'L\'Habitant du Creux',
  };

  const displayName = agentNames[name as keyof typeof agentNames];

  if (!displayName) {
    return {
      title: 'Agent non trouvé - Agents Liminals',
    };
  }

  return {
    title: `${displayName} - Agents Liminals`,
    description: `Consultation avec ${displayName}, votre guide dans ce territoire émotionnel`,
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { user } = await getServerAuth();

  if (!user) {
    redirect('/auth/login');
  }

  const { name } = await params;
  
  if (!VALID_AGENTS.includes(name)) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <AgentConsultationOriginal agentName={name} />
    </main>
  );
}