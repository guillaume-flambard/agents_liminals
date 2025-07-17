const express = require('express');
const Agent = require('../models/Agent');
const DailyLimit = require('../models/DailyLimit');
const Consultation = require('../models/Consultation');
const logger = require('../utils/logger');

const router = express.Router();

// GET /dashboard - Main dashboard/observatory
router.get('/', async (req, res) => {
  try {
    // Get active agents
    const agents = await Agent.getActiveAgents();
    
    // Get user's daily limits
    const today = new Date().toISOString().split('T')[0];
    const dailyLimit = await DailyLimit.getOrCreate(req.user._id, today);
    
    // Get remaining consultations
    const userDailyLimit = req.user.getDailyConsultationLimit();
    const remainingConsultations = dailyLimit.getRemainingConsultations(userDailyLimit);
    const remaining = remainingConsultations.total;
    
    // Get recent consultations
    const recentConsultations = await Consultation.find({
      userId: req.user._id,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'username');

    // Get weekly statistics
    const weeklyStats = await DailyLimit.getWeeklyStats(req.user._id);

    res.render('dashboard/index', {
      title: 'Observatoire - Agents Liminals',
      agents,
      dailyLimit,
      remaining,
      recentConsultations,
      weeklyStats,
      userDailyLimit
    });

  } catch (error) {
    logger.error('Dashboard error:', error);
    req.flash('error', 'Erreur lors du chargement du tableau de bord');
    res.redirect('/');
  }
});

// GET /dashboard/stats - User statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get consultation statistics
    const totalConsultations = await Consultation.countDocuments({
      userId,
      status: 'completed'
    });

    // Get agent usage statistics
    const agentStats = await Consultation.getAgentStats(userId);
    
    // Get monthly statistics
    const monthlyStats = await DailyLimit.getMonthlyStats(userId);
    
    // Get status counts
    const statusCounts = await Consultation.getStatusCounts(userId);

    // Get recent activity
    const recentActivity = await Consultation.find({
      userId,
      status: { $in: ['completed', 'failed'] }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('agentType status createdAt rating');

    res.json({
      success: true,
      data: {
        totalConsultations,
        agentStats,
        monthlyStats: monthlyStats[0] || {},
        statusCounts,
        recentActivity
      }
    });

  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router;