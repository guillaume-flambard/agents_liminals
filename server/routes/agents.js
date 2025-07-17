const express = require('express');
const Agent = require('../models/Agent');
const logger = require('../utils/logger');

const router = express.Router();

// GET /agents - List all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.getActiveAgents();
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        data: agents
      });
    }

    res.render('agents/index', {
      title: 'Agents Liminals',
      agents
    });

  } catch (error) {
    logger.error('Agents list error:', error);
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des agents'
      });
    }

    req.flash('error', 'Erreur lors du chargement des agents');
    res.redirect('/dashboard');
  }
});

// GET /agents/:agentName - Show specific agent
router.get('/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    
    // Find agent
    const agent = await Agent.findByName(agentName);
    if (!agent || !agent.isAvailable()) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(404).json({
          success: false,
          error: 'Agent non trouvé ou indisponible'
        });
      }
      req.flash('error', 'Agent non trouvé ou indisponible');
      return res.redirect('/dashboard');
    }

    // Check daily limits
    const DailyLimit = require('../models/DailyLimit');
    const userDailyLimit = req.user.getDailyConsultationLimit();
    const canConsultResult = await DailyLimit.canConsult(req.user._id, agentName, userDailyLimit);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        data: {
          agent,
          canConsult: canConsultResult
        }
      });
    }

    res.render('agents/agent', {
      title: `${agent.displayName} - Agents Liminals`,
      agent,
      canConsult: canConsultResult,
      userDailyLimit: userDailyLimit
    });

  } catch (error) {
    logger.error('Agent details error:', error);
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'agent'
      });
    }

    req.flash('error', 'Erreur lors du chargement de l\'agent');
    res.redirect('/dashboard');
  }
});

module.exports = router;