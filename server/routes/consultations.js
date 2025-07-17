const express = require('express');
const Consultation = require('../models/Consultation');
const DailyLimit = require('../models/DailyLimit');
const Agent = require('../models/Agent');
const logger = require('../utils/logger');

const router = express.Router();

// GET /consultations - List user's consultations
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const agentType = req.query.agent;
    const status = req.query.status;

    const query = { userId: req.user._id };
    if (agentType) query.agentType = agentType;
    if (status) query.status = status;

    const consultations = await Consultation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Consultation.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          consultations,
          pagination: {
            current: page,
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    }

    res.render('consultations/index', {
      title: 'Historique des consultations',
      consultations,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: { agentType, status }
    });

  } catch (error) {
    logger.error('Consultations list error:', error);
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des consultations'
      });
    }

    req.flash('error', 'Erreur lors du chargement de l\'historique');
    res.redirect('/dashboard');
  }
});

// GET /consultations/:id - Get specific consultation
router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!consultation) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(404).json({
          success: false,
          error: 'Consultation non trouvée'
        });
      }
      req.flash('error', 'Consultation non trouvée');
      return res.redirect('/consultations');
    }

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        data: consultation
      });
    }

    res.render('consultations/detail', {
      title: `Consultation ${consultation.agentDisplayName}`,
      consultation
    });

  } catch (error) {
    logger.error('Consultation detail error:', error);
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de la consultation'
      });
    }

    req.flash('error', 'Erreur lors du chargement de la consultation');
    res.redirect('/consultations');
  }
});

// POST /consultations/:id/rating - Rate a consultation
router.post('/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Note invalide (doit être entre 1 et 5)'
      });
    }
    
    const consultation = await Consultation.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        status: 'completed'
      },
      {
        rating: parseInt(rating),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation non trouvée ou non terminée'
      });
    }
    
    res.json({
      success: true,
      data: { rating: consultation.rating }
    });
    
  } catch (error) {
    logger.error('Rating consultation error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de la note'
    });
  }
});

module.exports = router;