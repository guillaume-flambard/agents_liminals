const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  username: {
    type: String,
    required: [true, 'Nom d\'utilisateur est requis'],
    unique: true,
    trim: true,
    minlength: [3, 'Nom d\'utilisateur doit avoir au moins 3 caractères'],
    maxlength: [30, 'Nom d\'utilisateur ne peut pas dépasser 30 caractères'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [8, 'Mot de passe doit avoir au moins 8 caractères']
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'Prénom ne peut pas dépasser 50 caractères']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Nom ne peut pas dépasser 50 caractères']
    },
    dateOfBirth: {
      type: Date
    },
    preferences: {
      language: {
        type: String,
        enum: ['fr', 'en'],
        default: 'fr'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark'
      }
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    dailyConsultations: {
      type: Number,
      default: 3
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'subscription.type': 1 });
userSchema.index({ isActive: 1, lastLoginAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get full name
userSchema.methods.getFullName = function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
};

// Method to check if user has premium subscription
userSchema.methods.isPremium = function() {
  return this.subscription.type === 'premium' && 
         this.subscription.endDate && 
         this.subscription.endDate > new Date();
};

// Method to get daily consultation limit
userSchema.methods.getDailyConsultationLimit = function() {
  if (this.isPremium()) {
    return parseInt(process.env.PREMIUM_DAILY_CONSULTATION_LIMIT) || 10;
  }
  return parseInt(process.env.DEFAULT_DAILY_CONSULTATION_LIMIT) || 3;
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;