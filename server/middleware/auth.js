const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Middleware to check if user is authenticated
const requireAuth = async (req, res, next) => {
  try {
    // Check session first
    if (req.session && req.session.user) {
      // Verify user still exists and is active
      const user = await User.findById(req.session.user._id);
      if (user && user.isActive) {
        req.user = user;
        return next();
      } else {
        // User no longer exists or is inactive, clear session
        req.session.destroy();
      }
    }

    // Check for JWT token in header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
          return next();
        }
      } catch (jwtError) {
        logger.warn('Invalid JWT token:', jwtError.message);
      }
    }

    // Not authenticated
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({ 
        error: 'Non authentifié', 
        message: 'Veuillez vous connecter pour accéder à cette ressource.' 
      });
    }

    // Redirect to login for web requests
    req.flash('error', 'Veuillez vous connecter pour accéder à cette page.');
    res.redirect('/auth/login');
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// Middleware to check if user is guest (not authenticated)
const requireGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};

// Middleware to check premium subscription
const requirePremium = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!req.user.isPremium()) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(403).json({ 
          error: 'Abonnement premium requis',
          message: 'Cette fonctionnalité nécessite un abonnement premium.'
        });
      }
      req.flash('error', 'Cette fonctionnalité nécessite un abonnement premium.');
      return res.redirect('/dashboard');
    }

    next();
  } catch (error) {
    logger.error('Premium middleware error:', error);
    res.status(500).json({ error: 'Erreur de vérification d\'abonnement' });
  }
};

// Middleware to check admin role (for future use)
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Accès refusé',
        message: 'Droits administrateur requis.'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Erreur de vérification des droits' });
  }
};

// Middleware to set user in response locals
const setUser = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      const user = await User.findById(req.session.user._id);
      if (user && user.isActive) {
        req.user = user;
        res.locals.user = user;
        res.locals.isAuthenticated = true;
      } else {
        req.session.destroy();
        res.locals.user = null;
        res.locals.isAuthenticated = false;
      }
    } else {
      res.locals.user = null;
      res.locals.isAuthenticated = false;
    }
    next();
  } catch (error) {
    logger.error('Set user middleware error:', error);
    res.locals.user = null;
    res.locals.isAuthenticated = false;
    next();
  }
};

// Middleware to update last login time
const updateLastLogin = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { lastLoginAt: new Date() });
    }
    next();
  } catch (error) {
    logger.error('Update last login error:', error);
    next(); // Continue even if update fails
  }
};

// Rate limiting for authentication endpoints
const createAuthLimiter = (windowMs = 15 * 60 * 1000, max = 5) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Trop de tentatives',
      message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for successful requests
      return req.rateLimit?.remaining > 0;
    }
  });
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide');
  }
};

module.exports = {
  requireAuth,
  requireGuest,
  requirePremium,
  requireAdmin,
  setUser,
  updateLastLogin,
  createAuthLimiter,
  generateToken,
  verifyToken
};