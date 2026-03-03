const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

// Profile update (username + optional profile picture)
router.put(
  '/profile',
  authMiddleware,
  authController.profileUpload,
  authController.updateProfile
);

// Change password
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
