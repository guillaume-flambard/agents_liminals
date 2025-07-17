const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Utilisateur est requis']
  },
  agentType: {
    type: String,
    required: [true, 'Type d\'agent est requis'],
    enum: ['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant'],
    index: true
  },
  input: {
    situation: {
      type: String,
      required: [true, 'Situation est requise'],
      maxlength: [2000, 'Situation ne peut pas dépasser 2000 caractères']
    },
    rituel: {
      type: String,
      required: [true, 'Rituel est requis'],
      maxlength: [1000, 'Rituel ne peut pas dépasser 1000 caractères']
    }
  },
  response: {
    consultation: {
      type: String,
      maxlength: [5000, 'Consultation ne peut pas dépasser 5000 caractères']
    },
    signature: {
      type: String,
      maxlength: [500, 'Signature ne peut pas dépasser 500 caractères']
    },
    sessionId: {
      type: String,
      index: true
    },
    n8nExecutionId: {
      type: String
    }
  },
  metadata: {
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0
    },
    n8nWebhookUrl: {
      type: String
    },
    retryCount: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  errorMessage: {
    type: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: [1000, 'Commentaire ne peut pas dépasser 1000 caractères']
    },
    ratedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
consultationSchema.index({ userId: 1, createdAt: -1 });
consultationSchema.index({ agentType: 1, createdAt: -1 });
consultationSchema.index({ status: 1, createdAt: -1 });
consultationSchema.index({ 'response.sessionId': 1 });
consultationSchema.index({ createdAt: -1 });

// Virtual for agent display name
consultationSchema.virtual('agentDisplayName').get(function() {
  const agentNames = {
    'accordeur': 'L\'Accordeur de Sens',
    'peseur': 'Le Peseur d\'Ambigus',
    'denoueur': 'Le Dénoueur',
    'evideur': 'L\'Évideur',
    'habitant': 'L\'Habitant du Creux'
  };
  return agentNames[this.agentType] || this.agentType;
});

// Virtual for processing duration in human readable format
consultationSchema.virtual('processingDuration').get(function() {
  if (!this.metadata.processingTime) return 'N/A';
  
  const ms = this.metadata.processingTime;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
});

// Static method to get user's consultations for today
consultationSchema.statics.getTodayConsultations = function(userId, agentType = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const query = {
    userId: userId,
    createdAt: {
      $gte: today,
      $lt: tomorrow
    },
    status: { $in: ['completed', 'processing', 'pending'] }
  };

  if (agentType) {
    query.agentType = agentType;
  }

  return this.find(query);
};

// Static method to count consultations by status
consultationSchema.statics.getStatusCounts = function(userId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get consultation history with pagination
consultationSchema.statics.getUserHistory = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ userId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username email');
};

// Static method to get agent usage statistics
consultationSchema.statics.getAgentStats = function(userId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: since },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$agentType',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating.score' },
        lastUsed: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Method to mark consultation as completed
consultationSchema.methods.markCompleted = function(response) {
  this.status = 'completed';
  this.response = {
    ...this.response,
    ...response
  };
  this.metadata.processingTime = Date.now() - this.createdAt.getTime();
  return this.save();
};

// Method to mark consultation as failed
consultationSchema.methods.markFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.metadata.processingTime = Date.now() - this.createdAt.getTime();
  return this.save();
};

// Method to add rating
consultationSchema.methods.addRating = function(score, feedback = '') {
  this.rating = {
    score: score,
    feedback: feedback,
    ratedAt: new Date()
  };
  return this.save();
};

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;