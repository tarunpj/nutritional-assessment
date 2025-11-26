const pool = require('../config/database');
const User = require('../models/User');

const generateRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear existing recommendations
    await pool.execute('DELETE FROM recommendations WHERE user_id = ?', [req.user.id]);

    const recommendations = [];
    const bmi = User.calculateBMI(user.weight, user.height);

    // BMI-based recommendations
    if (bmi < 18.5) {
      recommendations.push({
        type: 'nutrition',
        title: 'Increase Caloric Intake',
        description: 'Focus on nutrient-dense, high-calorie foods like nuts, avocados, and lean proteins.',
        priority: 'high'
      });
    } else if (bmi > 25) {
      recommendations.push({
        type: 'nutrition',
        title: 'Reduce Caloric Intake',
        description: 'Focus on low-calorie, high-fiber foods like vegetables and lean proteins.',
        priority: 'high'
      });
    }

    // Activity level recommendations
    if (user.activity_level === 'sedentary') {
      recommendations.push({
        type: 'exercise',
        title: 'Start with Light Exercise',
        description: 'Begin with 15-20 minutes of walking daily and gradually increase intensity.',
        priority: 'medium'
      });
      recommendations.push({
        type: 'exercise',
        title: 'Desk Exercises',
        description: 'Try desk stretches, wall push-ups, and stair climbing during work breaks.',
        priority: 'low'
      });
    } else if (user.activity_level === 'lightly_active') {
      recommendations.push({
        type: 'exercise',
        title: 'Increase Activity Frequency',
        description: 'Aim for 30 minutes of moderate exercise 3-4 times per week.',
        priority: 'medium'
      });
    } else if (user.activity_level === 'moderately_active') {
      recommendations.push({
        type: 'exercise',
        title: 'Add Strength Training',
        description: 'Include 2-3 strength training sessions per week for muscle building.',
        priority: 'medium'
      });
    } else if (user.activity_level === 'very_active') {
      recommendations.push({
        type: 'exercise',
        title: 'Focus on Recovery',
        description: 'Include rest days and stretching to prevent overtraining and injuries.',
        priority: 'high'
      });
    }

    // Goal-based recommendations
    if (user.goal === 'lose_weight') {
      recommendations.push({
        type: 'nutrition',
        title: 'Create Caloric Deficit',
        description: 'Aim for 500 calories below maintenance. Focus on protein and vegetables.',
        priority: 'high'
      });
      recommendations.push({
        type: 'exercise',
        title: 'Combine Cardio and Strength',
        description: 'Mix cardiovascular exercise with resistance training for optimal fat loss.',
        priority: 'medium'
      });
    } else if (user.goal === 'gain_weight') {
      recommendations.push({
        type: 'nutrition',
        title: 'Increase Protein Intake',
        description: 'Consume 1.6-2.2g protein per kg body weight to support muscle growth.',
        priority: 'high'
      });
    }

    // General recommendations
    recommendations.push({
      type: 'general',
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily for optimal health.',
      priority: 'medium'
    });

    // Additional exercise recommendations
    recommendations.push({
      type: 'exercise',
      title: 'Morning Routine',
      description: '10-minute morning stretches or yoga to boost energy and flexibility.',
      priority: 'low'
    });

    if (user.age > 40) {
      recommendations.push({
        type: 'exercise',
        title: 'Joint-Friendly Exercises',
        description: 'Focus on low-impact activities like swimming, cycling, or walking.',
        priority: 'medium'
      });
    }

    if (user.goal === 'lose_weight') {
      recommendations.push({
        type: 'exercise',
        title: 'HIIT Workouts',
        description: 'High-intensity interval training 2-3 times per week for fat burning.',
        priority: 'high'
      });
    }

    // Insert recommendations into database
    for (const rec of recommendations) {
      await pool.execute(
        'INSERT INTO recommendations (user_id, type, title, description, priority) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, rec.type, rec.title, rec.description, rec.priority]
      );
    }

    res.json({
      message: 'Recommendations generated successfully',
      recommendations
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const [recommendations] = await pool.execute(
      'SELECT * FROM recommendations WHERE user_id = ? AND is_active = TRUE ORDER BY priority DESC, created_at DESC',
      [req.user.id]
    );

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getFoodsToInclude = (user) => {
  const foods = [];
  
  if (user.goal === 'lose_weight') {
    foods.push('Leafy greens', 'Lean proteins', 'Berries', 'Greek yogurt', 'Quinoa');
  } else if (user.goal === 'gain_weight') {
    foods.push('Nuts and seeds', 'Avocados', 'Whole grains', 'Lean meats', 'Healthy oils');
  } else {
    foods.push('Balanced proteins', 'Whole grains', 'Fruits', 'Vegetables', 'Healthy fats');
  }
  
  return foods;
};

const getFoodsToAvoid = (user) => {
  const foods = ['Processed foods', 'Sugary drinks', 'Trans fats', 'Excessive alcohol'];
  
  if (user.goal === 'lose_weight') {
    foods.push('High-calorie snacks', 'Fried foods');
  }
  
  return foods;
};

const getNutritionPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dailyCalories = User.calculateCalories(
      user.weight, user.height, user.age, user.gender, user.activity_level, user.goal
    );

    const plan = {
      dailyCalories,
      macros: {
        protein: Math.round(dailyCalories * 0.25 / 4), // 25% of calories from protein
        carbs: Math.round(dailyCalories * 0.45 / 4),   // 45% from carbs
        fats: Math.round(dailyCalories * 0.30 / 9)     // 30% from fats
      },
      foodsToInclude: getFoodsToInclude(user),
      foodsToAvoid: getFoodsToAvoid(user),
      mealTiming: {
        breakfast: '25% of daily calories',
        lunch: '35% of daily calories',
        dinner: '30% of daily calories',
        snacks: '10% of daily calories'
      }
    };

    res.json({ nutritionPlan: plan });
  } catch (error) {
    console.error('Get nutrition plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  generateRecommendations,
  getRecommendations,
  getNutritionPlan
};