const mongoose = require('mongoose');
const Agent = require('../server/models/Agent');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/agents_liminals', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const agents = [
  {
    name: 'accordeur',
    displayName: 'L\'Accordeur de Sens',
    description: 'Spécialiste du territoire du flou, il aide à clarifier les situations confuses et à retrouver un sens à travers l\'harmonie intérieure.',
    territory: 'Territoire du Flou',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/accordeur',
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'Sage et harmonieux, l\'Accordeur de Sens guide avec patience et bienveillance. Il utilise des métaphores musicales et harmoniques pour clarifier les situations floues.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#3498db',
      secondaryColor: '#2c3e50',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '🎼',
      borderColor: 'rgba(52, 152, 219, 0.6)'
    },
    statistics: {
      totalConsultations: 0,
      averageRating: 0,
      totalRatings: 0
    }
  },
  {
    name: 'peseur',
    displayName: 'Le Peseur d\'Ambigus',
    description: 'Expert du territoire du doute, il aide à examiner les différentes facettes d\'une situation et à prendre des décisions éclairées.',
    territory: 'Territoire du Doute',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/peseur',
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'Analytique et équilibré, le Peseur d\'Ambigus examine chaque situation avec minutie. Il utilise des métaphores de balance et de mesure pour aider à la prise de décision.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#e74c3c',
      secondaryColor: '#c0392b',
      backgroundGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      icon: '⚖️',
      borderColor: 'rgba(231, 76, 60, 0.6)'
    },
    statistics: {
      totalConsultations: 0,
      averageRating: 0,
      totalRatings: 0
    }
  },
  {
    name: 'denoueur',
    displayName: 'Le Dénoueur',
    description: 'Maître du territoire de la friction, il aide à démêler les conflits intérieurs et à apaiser les tensions.',
    territory: 'Territoire de la Friction',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/denoueur',
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'Apaisant et résolutif, le Dénoueur dénoue les nœuds émotionnels avec délicatesse. Il utilise des métaphores de cordage et de libération pour aider à résoudre les conflits.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#f39c12',
      secondaryColor: '#e67e22',
      backgroundGradient: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
      icon: '⚡',
      borderColor: 'rgba(243, 156, 18, 0.6)'
    },
    statistics: {
      totalConsultations: 0,
      averageRating: 0,
      totalRatings: 0
    }
  },
  {
    name: 'evideur',
    displayName: 'L\'Évideur',
    description: 'Gardien du territoire du trop-plein, il aide à créer de l\'espace et à évacuer ce qui encombre l\'esprit.',
    territory: 'Territoire du Trop-Plein',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/evideur',
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'Purificateur et libérateur, l\'Évideur aide à faire le vide pour retrouver la clarté. Il utilise des métaphores de nettoyage et d\'espace pour aider à l\'allègement.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#9b59b6',
      secondaryColor: '#8e44ad',
      backgroundGradient: 'linear-gradient(135deg, #a55eea 0%, #26de81 100%)',
      icon: '🕳️',
      borderColor: 'rgba(155, 89, 182, 0.6)'
    },
    statistics: {
      totalConsultations: 0,
      averageRating: 0,
      totalRatings: 0
    }
  },
  {
    name: 'habitant',
    displayName: 'L\'Habitant du Creux',
    description: 'Sage du territoire du vide, il aide à apprivoiser le manque et à trouver la plénitude dans l\'absence.',
    territory: 'Territoire du Vide',
    webhookUrl: 'https://n8n.memoapp.eu/webhook/habitant',
    config: {
      maxDailyConsultations: 3,
      responseFormat: 'consultation',
      personality: 'Contemplatif et profond, l\'Habitant du Creux transforme le vide en possibilité. Il utilise des métaphores de contemplation et de présence pour aider à apprivoiser le manque.',
      isActive: true,
      temperature: 0.4,
      maxTokens: 500
    },
    styling: {
      primaryColor: '#34495e',
      secondaryColor: '#2c3e50',
      backgroundGradient: 'linear-gradient(135deg, #596275 0%, #2c3e50 100%)',
      icon: '◯',
      borderColor: 'rgba(52, 73, 94, 0.6)'
    },
    statistics: {
      totalConsultations: 0,
      averageRating: 0,
      totalRatings: 0
    }
  }
];

async function populateAgents() {
  try {
    // Clear existing agents
    await Agent.deleteMany({});
    console.log('Cleared existing agents');

    // Create new agents
    const createdAgents = await Agent.insertMany(agents);
    console.log(`Created ${createdAgents.length} agents:`);
    
    createdAgents.forEach(agent => {
      console.log(`- ${agent.displayName} (${agent.name})`);
    });

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error populating agents:', error);
    mongoose.connection.close();
  }
}

populateAgents();