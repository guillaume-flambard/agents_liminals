const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const { requireAuth } = require('../middleware/auth');
const Agent = require('../models/Agent');
const Consultation = require('../models/Consultation');
const DailyLimit = require('../models/DailyLimit');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Trop de requêtes',
    message: 'Limite de requêtes dépassée. Veuillez réessayer plus tard.'
  }
});

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Consultation rate limiting (more restrictive)
const consultationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 consultation requests per 5 minutes
  message: {
    error: 'Trop de consultations',
    message: 'Limite de consultations dépassée. Veuillez patienter avant de consulter à nouveau.'
  }
});

// POST /api/consultations - Create new consultation
router.post('/consultations', requireAuth, consultationLimiter, [
  body('agentType')
    .isIn(['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant'])
    .withMessage('Type d\'agent invalide'),
  body('situation')
    .isLength({ min: 10, max: 2000 })
    .withMessage('La situation doit contenir entre 10 et 2000 caractères'),
  body('rituel')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Le rituel doit contenir entre 5 et 1000 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { agentType, situation, rituel } = req.body;

    // Find agent
    const agent = await Agent.findByName(agentType);
    if (!agent || !agent.isAvailable()) {
      return res.status(404).json({
        success: false,
        error: 'Agent non trouvé ou indisponible'
      });
    }

    // Check daily limits
    const userDailyLimit = req.user.getDailyConsultationLimit();
    const canConsultResult = await DailyLimit.canConsult(req.user._id, agentType, userDailyLimit);

    if (!canConsultResult.canConsult) {
      return res.status(429).json({
        success: false,
        error: 'Limite de consultation atteinte',
        message: canConsultResult.message,
        reason: canConsultResult.reason
      });
    }

    // Create consultation record
    const consultation = new Consultation({
      userId: req.user._id,
      agentType,
      input: { situation, rituel },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        n8nWebhookUrl: agent.webhookUrl
      },
      status: 'processing'
    });

    await consultation.save();

    // Increment daily limit
    await DailyLimit.incrementCount(req.user._id, agentType);

    // Call n8n webhook
    const startTime = Date.now();
    
    try {
      logger.consultation(`Starting consultation with ${agentType}`, {
        userId: req.user._id,
        consultationId: consultation._id,
        agentType
      });

      const webhookResponse = await axios.post(agent.webhookUrl, {
        situation,
        rituel,
        timestamp: consultation.createdAt.toISOString(),
        userId: req.user._id.toString(),
        consultationId: consultation._id.toString()
      }, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Agents-Liminals/2.0'
        }
      });

      const processingTime = Date.now() - startTime;

      // Update consultation with response
      await consultation.markCompleted({
        consultation: webhookResponse.data.consultation,
        signature: webhookResponse.data.signature,
        sessionId: webhookResponse.data.session_id,
        n8nExecutionId: webhookResponse.data.execution_id
      });

      consultation.metadata.processingTime = processingTime;
      await consultation.save();

      // Update agent statistics
      await agent.updateConsultationStats();

      logger.consultation(`Consultation completed successfully`, {
        userId: req.user._id,
        consultationId: consultation._id,
        agentType,
        processingTime
      });

      res.json({
        success: true,
        data: {
          consultation: consultation.toObject(),
          response: {
            consultation: webhookResponse.data.consultation,
            signature: webhookResponse.data.signature,
            sessionId: webhookResponse.data.session_id
          }
        }
      });

    } catch (webhookError) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Webhook error:', {
        error: webhookError.message,
        userId: req.user._id,
        consultationId: consultation._id,
        agentType,
        processingTime
      });

      // Mark consultation as failed
      await consultation.markFailed(webhookError.message);

      res.status(500).json({
        success: false,
        error: 'Erreur lors de la consultation',
        message: 'Le service de consultation est temporairement indisponible. Veuillez réessayer plus tard.'
      });
    }

  } catch (error) {
    logger.error('Consultation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// GET /api/consultations/limits - Get user's consultation limits
router.get('/consultations/limits', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyLimit = await DailyLimit.getOrCreate(req.user._id, today);
    const userDailyLimit = req.user.getDailyConsultationLimit();
    
    const remaining = dailyLimit.getRemainingConsultations(userDailyLimit);
    
    const limits = {};
    const agents = ['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant'];
    
    for (const agentType of agents) {
      const canConsultResult = await DailyLimit.canConsult(req.user._id, agentType, userDailyLimit);
      limits[agentType] = {
        canConsult: canConsultResult.canConsult,
        remaining: canConsultResult.remaining,
        used: dailyLimit.consultationCounts[agentType] || 0,
        message: canConsultResult.message
      };
    }

    res.json({
      success: true,
      data: {
        daily: {
          limit: userDailyLimit,
          used: dailyLimit.consultationCounts.total || 0,
          remaining: remaining.total
        },
        agents: limits
      }
    });

  } catch (error) {
    logger.error('Consultation limits API error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des limites'
    });
  }
});

// POST /api/consultations/:id/rating - Rate a consultation
router.post('/consultations/:id/rating', requireAuth, [
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Note doit être entre 1 et 5'),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Commentaire ne peut pas dépasser 1000 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { score, feedback } = req.body;

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'completed'
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation non trouvée'
      });
    }

    if (consultation.rating && consultation.rating.score) {
      return res.status(400).json({
        success: false,
        error: 'Cette consultation a déjà été évaluée'
      });
    }

    await consultation.addRating(score, feedback);

    // Update agent statistics
    const agent = await Agent.findByName(consultation.agentType);
    if (agent) {
      await agent.updateConsultationStats();
    }

    logger.consultation(`Consultation rated`, {
      userId: req.user._id,
      consultationId: consultation._id,
      score,
      feedback: feedback ? 'provided' : 'none'
    });

    res.json({
      success: true,
      message: 'Évaluation enregistrée avec succès'
    });

  } catch (error) {
    logger.error('Consultation rating API error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de l\'évaluation'
    });
  }
});

// GET /api/agents - Get all active agents
router.get('/agents', requireAuth, async (req, res) => {
  try {
    const agents = await Agent.getActiveAgents();
    
    res.json({
      success: true,
      data: agents
    });

  } catch (error) {
    logger.error('Agents API error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des agents'
    });
  }
});

// GET /api/agents/:name - Get specific agent
router.get('/agents/:name', requireAuth, async (req, res) => {
  try {
    const agent = await Agent.findByName(req.params.name);
    
    if (!agent || !agent.isAvailable()) {
      return res.status(404).json({
        success: false,
        error: 'Agent non trouvé ou indisponible'
      });
    }

    res.json({
      success: true,
      data: agent
    });

  } catch (error) {
    logger.error('Agent API error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'agent'
    });
  }
});

module.exports = router;