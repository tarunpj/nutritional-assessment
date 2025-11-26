const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, firstName, lastName, age, weight, height, gender, activityLevel, goal } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, first_name, last_name, age, weight, height, gender, activity_level, goal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, age || null, weight || null, height || null, gender || null, activityLevel || null, goal || null]
    );
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return users[0];
  }

  static async findById(id) {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  }

  static async updateProfile(userId, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    values.push(userId);
    
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static calculateBMI(weight, height) {
    return (weight / ((height / 100) ** 2)).toFixed(1);
  }

  static calculateCalories(weight, height, age, gender, activityLevel, goal) {
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    let calories = bmr * activityMultipliers[activityLevel];

    if (goal === 'lose_weight') calories -= 500;
    else if (goal === 'gain_weight') calories += 500;

    return Math.round(calories);
  }
}

module.exports = User;