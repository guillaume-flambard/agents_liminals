const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/User');
const { requireGuest, createAuthLimiter, generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for auth routes
const loginLimiter = createAuthLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const registerLimiter = createAuthLimiter(60 * 60 * 1000, 3); // 3 attempts per hour

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Nom d\'utilisateur invalide (3-30 caractères, lettres, chiffres, _ et - uniquement)'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Prénom ne peut pas dépasser 50 caractères'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Nom ne peut pas dépasser 50 caractères'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date de naissance invalide')
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email ou nom d\'utilisateur requis'),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis')
];

// GET /auth/login - Show login form
router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Connexion - Agents Liminals',
    error: null,
    formData: {}
  });
});

// POST /auth/login - Process login
router.post('/login', requireGuest, loginLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Connexion - Agents Liminals',
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    const { identifier, password, remember } = req.body;

    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier);
    if (!user) {
      logger.auth(`Failed login attempt for ${identifier} - user not found`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.render('auth/login', {
        title: 'Connexion - Agents Liminals',
        error: 'Email/nom d\'utilisateur ou mot de passe incorrect',
        formData: req.body
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.auth(`Failed login attempt for ${identifier} - user inactive`, {
        userId: user._id,
        ip: req.ip
      });
      return res.render('auth/login', {
        title: 'Connexion - Agents Liminals',
        error: 'Compte désactivé. Contactez le support.',
        formData: req.body
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.auth(`Failed login attempt for ${identifier} - invalid password`, {
        userId: user._id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.render('auth/login', {
        title: 'Connexion - Agents Liminals',
        error: 'Email/nom d\'utilisateur ou mot de passe incorrect',
        formData: req.body
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create session
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      subscription: user.subscription
    };

    // Set session expiry based on "remember me"
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    logger.auth(`Successful login for ${user.username}`, {
      userId: user._id,
      ip: req.ip
    });

    // Handle API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: user.toJSON()
      });
    }

    req.flash('success', `Bienvenue, ${user.getFullName()} !`);
    res.redirect('/dashboard');

  } catch (error) {
    logger.error('Login error:', error);
    res.render('auth/login', {
      title: 'Connexion - Agents Liminals',
      error: 'Erreur de connexion. Veuillez réessayer.',
      formData: req.body
    });
  }
});

// GET /auth/register - Show registration form
router.get('/register', requireGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Inscription - Agents Liminals',
    error: null,
    formData: {}
  });
});

// POST /auth/register - Process registration
router.post('/register', requireGuest, registerLimiter, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Inscription - Agents Liminals',
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    const { email, username, password, firstName, lastName, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'nom d\'utilisateur';
      return res.render('auth/register', {
        title: 'Inscription - Agents Liminals',
        error: `Ce ${field} est déjà utilisé`,
        formData: req.body
      });
    }

    // Create new user
    const userData = {
      email: email.toLowerCase(),
      username,
      password,
      profile: {}
    };

    if (firstName) userData.profile.firstName = firstName;
    if (lastName) userData.profile.lastName = lastName;
    if (dateOfBirth) userData.profile.dateOfBirth = new Date(dateOfBirth);

    const user = new User(userData);
    await user.save();

    logger.auth(`New user registered: ${user.username}`, {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    // Auto-login after registration
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      subscription: user.subscription
    };

    // Handle API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Inscription réussie',
        token,
        user: user.toJSON()
      });
    }

    req.flash('success', 'Inscription réussie ! Bienvenue dans l\'univers des Agents Liminals.');
    res.redirect('/dashboard');

  } catch (error) {
    logger.error('Registration error:', error);
    
    let errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      errorMessage = firstError.message;
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      errorMessage = `Ce ${field === 'email' ? 'email' : 'nom d\'utilisateur'} est déjà utilisé`;
    }

    res.render('auth/register', {
      title: 'Inscription - Agents Liminals',
      error: errorMessage,
      formData: req.body
    });
  }
});

// POST /auth/logout - Logout user
router.post('/logout', (req, res) => {
  const userId = req.session?.user?._id;
  
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
    } else if (userId) {
      logger.auth(`User logged out`, { userId });
    }

    // Handle API requests
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    }

    req.flash('success', 'Déconnexion réussie');
    res.redirect('/auth/login');
  });
});

// GET /auth/logout - Logout via GET (for convenience)
router.get('/logout', (req, res) => {
  const userId = req.session?.user?._id;
  
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
    } else if (userId) {
      logger.auth(`User logged out`, { userId });
    }

    req.flash('success', 'Déconnexion réussie');
    res.redirect('/auth/login');
  });
});

// GET /auth/forgot-password - Show forgot password form
router.get('/forgot-password', requireGuest, (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Mot de passe oublié - Agents Liminals',
    error: null,
    success: null
  });
});

// POST /auth/forgot-password - Process forgot password
router.post('/forgot-password', requireGuest, [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/forgot-password', {
        title: 'Mot de passe oublié - Agents Liminals',
        error: errors.array()[0].msg,
        success: null,
        formData: req.body
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always show success message for security
    const successMessage = 'Si cet email existe, vous recevrez un lien de réinitialisation.';

    if (user && user.isActive) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      logger.auth(`Password reset requested for ${user.email}`, {
        userId: user._id,
        ip: req.ip
      });

      // TODO: Send email with reset link
      // For now, just log the token (remove in production)
      logger.info(`Password reset token for ${user.email}: ${resetToken}`);
    }

    res.render('auth/forgot-password', {
      title: 'Mot de passe oublié - Agents Liminals',
      error: null,
      success: successMessage,
      formData: {}
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.render('auth/forgot-password', {
      title: 'Mot de passe oublié - Agents Liminals',
      error: 'Erreur lors de la demande. Veuillez réessayer.',
      success: null,
      formData: req.body
    });
  }
});

module.exports = router;