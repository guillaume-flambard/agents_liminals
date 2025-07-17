const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nom de l\'agent est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    enum: ['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant']
  },
  displayName: {
    type: String,
    required: [true, 'Nom d\'affichage est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description est requise'],
    maxlength: [500, 'Description ne peut pas dépasser 500 caractères']
  },
  territory: {
    type: String,
    required: [true, 'Territoire est requis'],
    maxlength: [100, 'Territoire ne peut pas dépasser 100 caractères']
  },
  webhookUrl: {
    type: String,
    required: [true, 'URL webhook est requise'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL webhook doit être une URL valide'
    }
  },
  config: {
    maxDailyConsultations: {
      type: Number,
      default: 3,
      min: [1, 'Minimum 1 consultation par jour'],
      max: [10, 'Maximum 10 consultations par jour']
    },
    responseFormat: {
      type: String,
      default: 'consultation'
    },
    personality: {
      type: String,
      maxlength: [2000, 'Personnalité ne peut pas dépasser 2000 caractères']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    temperature: {
      type: Number,
      default: 0.4,
      min: 0,
      max: 1
    },
    maxTokens: {
      type: Number,
      default: 500,
      min: 100,
      max: 2000
    }
  },
  styling: {
    primaryColor: {
      type: String,
      default: '#3498db',
      match: [/^#[0-9a-fA-F]{6}$/, 'Couleur primaire doit être un code hexadécimal valide']
    },
    secondaryColor: {
      type: String,
      default: '#2c3e50',
      match: [/^#[0-9a-fA-F]{6}$/, 'Couleur secondaire doit être un code hexadécimal valide']
    },
    backgroundGradient: {
      type: String,
      default: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)'
    },
    icon: {
      type: String,
      default: '🎭'
    },
    borderColor: {
      type: String,
      default: 'rgba(52, 152, 219, 0.6)'
    }
  },
  statistics: {
    totalConsultations: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes
agentSchema.index({ 'config.isActive': 1 });
agentSchema.index({ 'statistics.totalConsultations': -1 });

// Virtual for full webhook URL
agentSchema.virtual('fullWebhookUrl').get(function() {
  return `${process.env.N8N_WEBHOOK_BASE_URL}/${this.name}`;
});

// Virtual for consultation count today
agentSchema.virtual('consultationsToday').get(async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const Consultation = mongoose.model('Consultation');
  return await Consultation.countDocuments({
    agentType: this.name,
    createdAt: {
      $gte: today,
      $lt: tomorrow
    },
    status: { $in: ['completed', 'processing', 'pending'] }
  });
});

// Static method to get all active agents
agentSchema.statics.getActiveAgents = function() {
  return this.find({ 'config.isActive': true }).sort({ name: 1 });
};

// Static method to find agent by name
agentSchema.statics.findByName = function(name) {
  return this.findOne({ name: name.toLowerCase() });
};

// Static method to get agent statistics
agentSchema.statics.getAgentStats = async function() {
  return await this.aggregate([
    {
      $match: { 'config.isActive': true }
    },
    {
      $project: {
        name: 1,
        displayName: 1,
        'statistics.totalConsultations': 1,
        'statistics.averageRating': 1,
        'statistics.lastUsed': 1
      }
    },
    {
      $sort: { 'statistics.totalConsultations': -1 }
    }
  ]);
};

// Method to update statistics after consultation
agentSchema.methods.updateConsultationStats = async function() {
  const Consultation = mongoose.model('Consultation');
  
  // Get total consultations for this agent
  const totalConsultations = await Consultation.countDocuments({
    agentType: this.name,
    status: 'completed'
  });

  // Get average rating
  const ratingStats = await Consultation.aggregate([
    {
      $match: {
        agentType: this.name,
        status: 'completed',
        'rating.score': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating.score' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  // Update statistics
  this.statistics.totalConsultations = totalConsultations;
  this.statistics.lastUsed = new Date();

  if (ratingStats.length > 0) {
    this.statistics.averageRating = Math.round(ratingStats[0].avgRating * 10) / 10;
    this.statistics.totalRatings = ratingStats[0].totalRatings;
  }

  return await this.save();
};

// Method to check if agent is available
agentSchema.methods.isAvailable = function() {
  return this.config.isActive;
};

// Method to get agent color scheme
agentSchema.methods.getColorScheme = function() {
  return {
    primary: this.styling.primaryColor,
    secondary: this.styling.secondaryColor,
    background: this.styling.backgroundGradient,
    border: this.styling.borderColor,
    icon: this.styling.icon
  };
};

// Method to get webhook configuration
agentSchema.methods.getWebhookConfig = function() {
  return {
    url: this.webhookUrl,
    fullUrl: this.fullWebhookUrl,
    config: {
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      personality: this.config.personality
    }
  };
};

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;