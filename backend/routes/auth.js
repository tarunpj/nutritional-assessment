const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../utils/validation');

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;