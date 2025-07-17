'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAgentColors } from '@/lib/utils';

interface Agent {
  name: string;
  displayName: string;
  territory: string;
  description: string;
  icon: string;
  symptom: string;
}

interface AgentCardProps {
  agent: Agent;
  onSelect: () => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const colors = getAgentColors(agent.name);

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <div 
        className="relative p-6 rounded-xl border backdrop-blur-md transition-all duration-300 group-hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${colors.background}cc, ${colors.surface}cc)`,
          borderColor: colors.border,
        }}
      >
        {/* Frequency Indicator */}
        <div 
          className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-16 rounded-full opacity-40 animate-frequency-wave"
          style={{
            background: `linear-gradient(to top, ${colors.primary}, ${colors.secondary})`,
          }}
        />

        {/* Agent Icon */}
        <div className="text-4xl mb-4 text-center">
          {agent.icon}
        </div>

        {/* Agent Info */}
        <div className="space-y-3">
          <h3 
            className="text-xl font-bold text-center"
            style={{ color: colors.primary }}
          >
            {agent.displayName}
          </h3>

          <p 
            className="text-sm text-center italic"
            style={{ color: colors.secondary }}
          >
            {agent.territory}
          </p>

          <p className="text-sm text-slate-300 text-center leading-relaxed">
            {agent.description}
          </p>

          {/* Symptom */}
          <div 
            className="p-3 rounded-lg border-l-4 text-xs leading-relaxed"
            style={{
              backgroundColor: `${colors.secondary}15`,
              borderLeftColor: colors.secondary,
              color: '#e2e8f0',
            }}
          >
            <strong>Symptôme d'appel :</strong> "{agent.symptom}"
          </div>

          {/* Action Button */}
          <Button
            variant="agent"
            size="sm"
            className="w-full mt-4 group-hover:shadow-lg transition-all duration-200"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
            }}
          >
            <Activity className="h-4 w-4 mr-2" />
            Consulter cet agent
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Hover Effect */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          }}
        />
      </div>
    </motion.div>
  );
}