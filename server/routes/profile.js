const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// GET /profile - User profile page
router.get('/', async (req, res) => {
  try {
    res.render('profile/index', {
      title: 'Mon Profil',
      user: req.user
    });
  } catch (error) {
    logger.error('Profile page error:', error);
    req.flash('error', 'Erreur lors du chargement du profil');
    res.redirect('/dashboard');
  }
});

// POST /profile/update - Update profile information
router.post('/update', async (req, res) => {
  try {
    const { firstName, lastName, email, username, bio } = req.body;
    
    // Vérifier si l'email/username existe déjà
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ],
      _id: { $ne: req.user._id }
    });
    
    if (existingUser) {
      req.flash('error', 'Cet email ou nom d\'utilisateur est déjà utilisé');
      return res.redirect('/profile');
    }
    
    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(req.user._id, {
      email,
      username,
      'profile.firstName': firstName,
      'profile.lastName': lastName,
      'profile.bio': bio
    });
    
    req.flash('success', 'Profil mis à jour avec succès');
    res.redirect('/profile');
    
  } catch (error) {
    logger.error('Profile update error:', error);
    req.flash('error', 'Erreur lors de la mise à jour du profil');
    res.redirect('/profile');
  }
});

// POST /profile/change-password - Change password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Vérifier le mot de passe actuel
    const user = await User.findById(req.user._id);
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      req.flash('error', 'Mot de passe actuel incorrect');
      return res.redirect('/profile');
    }
    
    // Vérifier la correspondance des nouveaux mots de passe
    if (newPassword !== confirmPassword) {
      req.flash('error', 'Les nouveaux mots de passe ne correspondent pas');
      return res.redirect('/profile');
    }
    
    // Vérifier la force du mot de passe
    if (newPassword.length < 8) {
      req.flash('error', 'Le mot de passe doit contenir au moins 8 caractères');
      return res.redirect('/profile');
    }
    
    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Mettre à jour le mot de passe
    await User.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });
    
    req.flash('success', 'Mot de passe modifié avec succès');
    res.redirect('/profile');
    
  } catch (error) {
    logger.error('Password change error:', error);
    req.flash('error', 'Erreur lors du changement de mot de passe');
    res.redirect('/profile');
  }
});

// POST /profile/preferences - Update preferences
router.post('/preferences', async (req, res) => {
  try {
    const { emailNotifications, consultationReminders, preferredAgent } = req.body;
    
    const preferences = {
      emailNotifications: emailNotifications === 'on',
      consultationReminders: consultationReminders === 'on',
      preferredAgent: preferredAgent || null
    };
    
    await User.findByIdAndUpdate(req.user._id, {
      'profile.preferences.notifications': emailNotifications === 'on',
      'profile.preferences.preferredAgent': preferredAgent || null
    });
    
    req.flash('success', 'Préférences mises à jour avec succès');
    res.redirect('/profile');
    
  } catch (error) {
    logger.error('Preferences update error:', error);
    req.flash('error', 'Erreur lors de la mise à jour des préférences');
    res.redirect('/profile');
  }
});

// DELETE /profile/delete - Delete account
router.delete('/delete', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Supprimer toutes les données utilisateur
    await Promise.all([
      User.findByIdAndDelete(userId),
      // Supprimer les consultations
      require('../models/Consultation').deleteMany({ userId }),
      // Supprimer les limites quotidiennes
      require('../models/DailyLimit').deleteMany({ userId })
    ]);
    
    // Détruire la session
    req.session.destroy();
    
    res.json({ success: true });
    
  } catch (error) {
    logger.error('Account deletion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la suppression du compte' 
    });
  }
});

module.exports = router;