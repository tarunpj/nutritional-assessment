const express = require('express');
const router = express.Router();
const {
  getTodayLog,
  addFoodEntry,
  updateDailyLog,
  getWeeklyProgress,
  getNutritionInfo
} = require('../controllers/nutritionController');
const { authenticateToken } = require('../middleware/auth');
const { foodEntryValidation, dailyLogValidation } = require('../utils/validation');

// GET /api/nutrition/today
router.get('/today', authenticateToken, getTodayLog);

// POST /api/nutrition/food
router.post('/food', authenticateToken, foodEntryValidation, addFoodEntry);

// PUT /api/nutrition/daily-log
router.put('/daily-log', authenticateToken, dailyLogValidation, updateDailyLog);

// GET /api/nutrition/weekly-progress
router.get('/weekly-progress', authenticateToken, getWeeklyProgress);

// GET /api/nutrition/food-info/:foodName
router.get('/food-info/:foodName', authenticateToken, getNutritionInfo);

module.exports = router;