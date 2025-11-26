const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const pool = require('../config/database');

const getTodayLog = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let log = await DailyLog.findByUserAndDate(req.user.id, today);
    
    if (!log) {
      const logId = await DailyLog.create(req.user.id, today);
      log = await DailyLog.findByUserAndDate(req.user.id, today);
    }

    const foodEntries = await DailyLog.getFoodEntries(log.id);
    
    res.json({
      log: {
        ...log,
        foodEntries
      }
    });
  } catch (error) {
    console.error('Get today log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addFoodEntry = async (req, res) => {
  try {
    const { foodName, quantity, unit, calories, protein, carbs, fats } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    let log = await DailyLog.findByUserAndDate(req.user.id, today);
    if (!log) {
      const logId = await DailyLog.create(req.user.id, today);
      log = await DailyLog.findByUserAndDate(req.user.id, today);
    }

    const entryId = await DailyLog.addFoodEntry(log.id, {
      foodName, quantity, unit, calories, protein, carbs, fats
    });

    res.status(201).json({
      message: 'Food entry added successfully',
      entryId
    });
  } catch (error) {
    console.error('Add food entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateDailyLog = async (req, res) => {
  try {
    const { waterIntake, exerciseDuration, status } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    let log = await DailyLog.findByUserAndDate(req.user.id, today);
    if (!log) {
      const logId = await DailyLog.create(req.user.id, today);
      log = await DailyLog.findByUserAndDate(req.user.id, today);
    }

    const updateData = {};
    if (waterIntake !== undefined) updateData.water_intake = waterIntake;
    if (exerciseDuration !== undefined) updateData.exercise_duration = exerciseDuration;
    if (status !== undefined) updateData.status = status;

    await DailyLog.updateLog(log.id, updateData);

    res.json({ message: 'Daily log updated successfully' });
  } catch (error) {
    console.error('Update daily log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getWeeklyProgress = async (req, res) => {
  try {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];

    const logs = await DailyLog.getWeeklyLogs(req.user.id, startDate, endDate);
    
    // Calculate weekly summary
    const totalDays = logs.length;
    const completedDays = logs.filter(log => log.status === 'completed').length;
    const compliancePercentage = totalDays > 0 ? (completedDays / 7) * 100 : 0;
    const avgCalories = logs.reduce((sum, log) => sum + log.calories_consumed, 0) / Math.max(totalDays, 1);
    const totalExercise = logs.reduce((sum, log) => sum + log.exercise_duration, 0);

    res.json({
      weeklyLogs: logs,
      summary: {
        compliancePercentage: compliancePercentage.toFixed(1),
        avgCalories: avgCalories.toFixed(0),
        totalExercise,
        missedDays: 7 - totalDays
      }
    });
  } catch (error) {
    console.error('Get weekly progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getNutritionInfo = async (req, res) => {
  try {
    const { foodName } = req.params;
    
    // Simple nutrition database - in production, use a real API
    const nutritionData = {
      'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, rating: 'A' },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, rating: 'A' },
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, rating: 'A' },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, rating: 'B' },
      'pizza': { calories: 266, protein: 11, carbs: 33, fats: 10, rating: 'D' },
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, rating: 'A' },
      'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13, rating: 'A' },
      'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2, rating: 'C' }
    };

    const food = nutritionData[foodName.toLowerCase()];
    
    if (!food) {
      return res.status(404).json({ error: 'Food not found in database' });
    }

    res.json({
      foodName,
      nutrition: food,
      healthTip: getHealthTip(food.rating)
    });
  } catch (error) {
    console.error('Get nutrition info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getHealthTip = (rating) => {
  const tips = {
    'A': 'Excellent choice! This food is nutrient-dense and great for your health.',
    'B': 'Good choice! This food provides decent nutrition with moderate calories.',
    'C': 'Okay choice. Consider portion control and balance with healthier options.',
    'D': 'Limit consumption. High in calories or low in nutrients.'
  };
  return tips[rating] || 'No rating available';
};

module.exports = {
  getTodayLog,
  addFoodEntry,
  updateDailyLog,
  getWeeklyProgress,
  getNutritionInfo
};