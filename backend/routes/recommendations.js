const express = require('express');
const router = express.Router();
const {
  generateRecommendations,
  getRecommendations,
  getNutritionPlan
} = require('../controllers/recommendationsController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/recommendations/generate
router.post('/generate', authenticateToken, generateRecommendations);

// GET /api/recommendations
router.get('/', authenticateToken, getRecommendations);

// GET /api/recommendations/nutrition-plan
router.get('/nutrition-plan', authenticateToken, getNutritionPlan);

module.exports = router;