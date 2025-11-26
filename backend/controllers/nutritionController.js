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
    
    // Expanded nutrition database
    const nutritionData = {
      // Fruits
      'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, rating: 'A' },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, rating: 'A' },
      'orange': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1, rating: 'A' },
      'grapes': { calories: 62, protein: 0.6, carbs: 16, fats: 0.2, rating: 'A' },
      'strawberry': { calories: 32, protein: 0.7, carbs: 8, fats: 0.3, rating: 'A' },
      'mango': { calories: 60, protein: 0.8, carbs: 15, fats: 0.4, rating: 'A' },
      
      // Vegetables
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, rating: 'A' },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, rating: 'A' },
      'carrot': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, rating: 'A' },
      'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, rating: 'A' },
      'cucumber': { calories: 16, protein: 0.7, carbs: 4, fats: 0.1, rating: 'A' },
      'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2, rating: 'A' },
      
      // Proteins
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, rating: 'A' },
      'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13, rating: 'A' },
      'tuna': { calories: 144, protein: 30, carbs: 0, fats: 1, rating: 'A' },
      'egg': { calories: 155, protein: 13, carbs: 1.1, fats: 11, rating: 'A' },
      'beef': { calories: 250, protein: 26, carbs: 0, fats: 15, rating: 'B' },
      'tofu': { calories: 76, protein: 8, carbs: 1.9, fats: 4.8, rating: 'A' },
      
      // Grains & Carbs
      'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, rating: 'B' },
      'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2, rating: 'C' },
      'pasta': { calories: 131, protein: 5, carbs: 25, fats: 1.1, rating: 'B' },
      'oatmeal': { calories: 68, protein: 2.4, carbs: 12, fats: 1.4, rating: 'A' },
      'quinoa': { calories: 120, protein: 4.4, carbs: 22, fats: 1.9, rating: 'A' },
      
      // Dairy
      'milk': { calories: 42, protein: 3.4, carbs: 5, fats: 1, rating: 'B' },
      'yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, rating: 'A' },
      'cheese': { calories: 113, protein: 7, carbs: 1, fats: 9, rating: 'C' },
      
      // Nuts & Seeds
      'almonds': { calories: 579, protein: 21, carbs: 22, fats: 50, rating: 'B' },
      'peanuts': { calories: 567, protein: 26, carbs: 16, fats: 49, rating: 'B' },
      'walnuts': { calories: 654, protein: 15, carbs: 14, fats: 65, rating: 'B' },
      
      // Fast Food
      'pizza': { calories: 266, protein: 11, carbs: 33, fats: 10, rating: 'D' },
      'burger': { calories: 295, protein: 17, carbs: 23, fats: 17, rating: 'D' },
      'fries': { calories: 365, protein: 4, carbs: 63, fats: 17, rating: 'D' },
      'sandwich': { calories: 200, protein: 10, carbs: 25, fats: 8, rating: 'C' },
      
      // Snacks
      'chips': { calories: 536, protein: 7, carbs: 53, fats: 34, rating: 'D' },
      'cookies': { calories: 502, protein: 5.9, carbs: 64, fats: 25, rating: 'D' },
      'chocolate': { calories: 546, protein: 4.9, carbs: 61, fats: 31, rating: 'D' },
      
      // Beverages
      'coffee': { calories: 2, protein: 0.3, carbs: 0, fats: 0, rating: 'A' },
      'tea': { calories: 1, protein: 0, carbs: 0.3, fats: 0, rating: 'A' },
      'soda': { calories: 41, protein: 0, carbs: 10.6, fats: 0, rating: 'D' }
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