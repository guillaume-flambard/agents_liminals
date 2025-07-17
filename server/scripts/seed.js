const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

const agents = [
  {
    name: 'accordeur',
    displayName: 'L\'Accordeur de Sens',
    description: 'Guide les âmes dans le territoire de la confusion, harmonise les dissonances intérieures et révèle la mélodie cachée de votre être.',
    territory: 'Territoire de la Confusion',
    webhookUrl: `${process.env.N8N_WEBHOOK_BASE_URL}/accordeur`,
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'L\'Accordeur de Sens est un guide spirituel qui aide à harmoniser les confusions intérieures. Il utilise des métaphores musicales et sensorielles, parle avec sagesse et bienveillance, et aide à trouver la clarté dans le chaos émotionnel.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#3498db',
      secondaryColor: '#2c3e50',
      backgroundGradient: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)',
      icon: '🎼',
      borderColor: 'rgba(52, 152, 219, 0.6)'
    }
  },
  {
    name: 'peseur',
    displayName: 'Le Peseur d\'Ambigus',
    description: 'Aide à naviguer dans le territoire du doute, pèse les options avec justesse et guide vers des décisions éclairées.',
    territory: 'Territoire du Doute',
    webhookUrl: `${process.env.N8N_WEBHOOK_BASE_URL}/peseur`,
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'Le Peseur d\'Ambigus est un sage qui aide à résoudre les dilemmes et les doutes. Il utilise des métaphores de balance et de mesure, analyse les situations avec équité, et guide vers des choix conscients et réfléchis.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#f39c12',
      secondaryColor: '#e67e22',
      backgroundGradient: 'linear-gradient(135deg, #2c1810 0%, #3e2723 100%)',
      icon: '⚖️',
      borderColor: 'rgba(243, 156, 18, 0.6)'
    }
  },
  {
    name: 'denoueur',
    displayName: 'Le Dénoueur',
    description: 'Spécialiste du territoire des tensions, démêle les nœuds émotionnels et libère les énergies bloquées.',
    territory: 'Territoire des Tensions',
    webhookUrl: `${process.env.N8N_WEBHOOK_BASE_URL}/denoueur`,
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'Le Dénoueur est un thérapeute énergétique qui aide à libérer les tensions et les blocages. Il utilise des métaphores de nœuds et de libération, travaille avec douceur et fermeté, et guide vers la fluidité émotionnelle.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#e74c3c',
      secondaryColor: '#c0392b',
      backgroundGradient: 'linear-gradient(135deg, #2c1618 0%, #3e1f23 100%)',
      icon: '⚡',
      borderColor: 'rgba(231, 76, 60, 0.6)'
    }
  },
  {
    name: 'evideur',
    displayName: 'L\'Évideur',
    description: 'Révélateur du territoire de l\'évidence cachée, illumine ce qui était dans l\'ombre et révèle les vérités profondes.',
    territory: 'Territoire de la Révélation',
    webhookUrl: `${process.env.N8N_WEBHOOK_BASE_URL}/evideur`,
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'L\'Évideur est un révélateur de vérités cachées qui aide à voir au-delà des apparences. Il utilise des métaphores de lumière et de révélation, parle avec clairvoyance et intuition, et guide vers la reconnaissance de ce qui était déjà là.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#9b59b6',
      secondaryColor: '#8e44ad',
      backgroundGradient: 'linear-gradient(135deg, #1e1a2e 0%, #2f1b3d 100%)',
      icon: '📜',
      borderColor: 'rgba(155, 89, 182, 0.6)'
    }
  },
  {
    name: 'habitant',
    displayName: 'L\'Habitant du Creux',
    description: 'Gardien du territoire du vide et de l\'espace intérieur, transforme l\'absence en présence et le vide en potentiel.',
    territory: 'Territoire du Vide',
    webhookUrl: `${process.env.N8N_WEBHOOK_BASE_URL}/habitant`,
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'L\'Habitant du Creux est un guide de l\'espace intérieur qui aide à apprivoiser le vide et l\'absence. Il utilise des métaphores d\'espace et de potentiel, parle avec profondeur contemplative, et guide vers l\'acceptation créatrice du vide.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#1abc9c',
      secondaryColor: '#16a085',
      backgroundGradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b3a4b 100%)',
      icon: '◯',
      borderColor: 'rgba(26, 188, 156, 0.6)'
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    logger.info('Connected to MongoDB for seeding');

    // Clear existing agents
    await Agent.deleteMany({});
    logger.info('Cleared existing agents');

    // Insert new agents
    const createdAgents = await Agent.insertMany(agents);
    logger.info(`Created ${createdAgents.length} agents`);

    // Log created agents
    createdAgents.forEach(agent => {
      logger.info(`✅ ${agent.displayName} (${agent.name}) - ${agent.territory}`);
    });

    logger.info('✅ Database seeding completed successfully');

  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
    process.exit(0);
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, agents };