const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)[0].message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID invalide';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `Ce ${field} est déjà utilisé`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Une erreur inattendue s\'est produite';
  }

  // Handle API requests vs web requests
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // For web requests, render error page or redirect
  if (statusCode === 404) {
    return res.status(404).render('errors/404', {
      title: 'Page non trouvée',
      url: req.originalUrl
    });
  }

  if (statusCode === 403) {
    req.flash('error', message);
    return res.redirect('/dashboard');
  }

  if (statusCode === 401) {
    req.flash('error', 'Veuillez vous connecter pour accéder à cette page.');
    return res.redirect('/auth/login');
  }

  // Generic error page
  res.status(statusCode).render('errors/error', {
    title: 'Erreur',
    statusCode,
    message,
    showDetails: process.env.NODE_ENV === 'development'
  });
};

module.exports = errorHandler;