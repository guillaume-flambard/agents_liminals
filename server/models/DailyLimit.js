const mongoose = require('mongoose');

const dailyLimitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  consultationCounts: {
    accordeur: {
      type: Number,
      default: 0,
      min: 0
    },
    peseur: {
      type: Number,
      default: 0,
      min: 0
    },
    denoueur: {
      type: Number,
      default: 0,
      min: 0
    },
    evideur: {
      type: Number,
      default: 0,
      min: 0
    },
    habitant: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Compound unique index
dailyLimitSchema.index({ userId: 1, date: 1 }, { unique: true });

// TTL index to automatically delete old records after 60 days
dailyLimitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

// Virtual for formatted date
dailyLimitSchema.virtual('formattedDate').get(function() {
  const [year, month, day] = this.date.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR');
});

// Static method to get or create daily limit record
dailyLimitSchema.statics.getOrCreate = async function(userId, date = null) {
  if (!date) {
    date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  let dailyLimit = await this.findOne({ userId, date });
  
  if (!dailyLimit) {
    dailyLimit = new this({
      userId,
      date,
      consultationCounts: {
        accordeur: 0,
        peseur: 0,
        denoueur: 0,
        evideur: 0,
        habitant: 0,
        total: 0
      }
    });
    await dailyLimit.save();
  }

  return dailyLimit;
};

// Static method to increment consultation count
dailyLimitSchema.statics.incrementCount = async function(userId, agentType, date = null) {
  if (!date) {
    date = new Date().toISOString().split('T')[0];
  }

  const validAgents = ['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant'];
  if (!validAgents.includes(agentType)) {
    throw new Error(`Type d'agent invalide: ${agentType}`);
  }

  const updateQuery = {
    $inc: {
      [`consultationCounts.${agentType}`]: 1,
      'consultationCounts.total': 1
    }
  };

  const options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };

  return await this.findOneAndUpdate(
    { userId, date },
    updateQuery,
    options
  );
};

// Static method to check if user can consult with specific agent
dailyLimitSchema.statics.canConsult = async function(userId, agentType, userDailyLimit = 3) {
  const today = new Date().toISOString().split('T')[0];
  const dailyLimit = await this.getOrCreate(userId, today);
  
  const agentCount = dailyLimit.consultationCounts[agentType] || 0;
  const totalCount = dailyLimit.consultationCounts.total || 0;

  // Check per-agent limit (max 3 per agent per day)
  if (agentCount >= 3) {
    return {
      canConsult: false,
      reason: 'agent_limit',
      message: `Limite quotidienne atteinte pour cet agent (${agentCount}/3)`
    };
  }

  // Check total daily limit based on user subscription
  if (totalCount >= userDailyLimit) {
    return {
      canConsult: false,
      reason: 'total_limit',
      message: `Limite quotidienne totale atteinte (${totalCount}/${userDailyLimit})`
    };
  }

  return {
    canConsult: true,
    remaining: {
      agent: 3 - agentCount,
      total: userDailyLimit - totalCount
    }
  };
};

// Static method to get weekly statistics
dailyLimitSchema.statics.getWeeklyStats = async function(userId) {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  return await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

// Static method to get monthly statistics
dailyLimitSchema.statics.getMonthlyStats = async function(userId) {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(today.getMonth() - 1);

  const startDate = monthAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalConsultations: { $sum: '$consultationCounts.total' },
        avgPerDay: { $avg: '$consultationCounts.total' },
        accordeurTotal: { $sum: '$consultationCounts.accordeur' },
        peseurTotal: { $sum: '$consultationCounts.peseur' },
        denoueurTotal: { $sum: '$consultationCounts.denoueur' },
        evideurTotal: { $sum: '$consultationCounts.evideur' },
        habitantTotal: { $sum: '$consultationCounts.habitant' },
        activeDays: { $sum: { $cond: [{ $gt: ['$consultationCounts.total', 0] }, 1, 0] } }
      }
    }
  ]);
};

// Method to get remaining consultations for the day
dailyLimitSchema.methods.getRemainingConsultations = function(userDailyLimit = 3) {
  const remaining = {};
  const agents = ['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant'];
  
  agents.forEach(agent => {
    const used = this.consultationCounts[agent] || 0;
    remaining[agent] = Math.max(0, 3 - used); // Max 3 per agent
  });

  const totalUsed = this.consultationCounts.total || 0;
  remaining.total = Math.max(0, userDailyLimit - totalUsed);

  return remaining;
};

// Method to check if any consultations were made today
dailyLimitSchema.methods.hasConsultationsToday = function() {
  return (this.consultationCounts.total || 0) > 0;
};

const DailyLimit = mongoose.model('DailyLimit', dailyLimitSchema);

module.exports = DailyLimit;