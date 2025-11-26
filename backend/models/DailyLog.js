const pool = require('../config/database');

class DailyLog {
  static async create(userId, date) {
    const [result] = await pool.execute(
      'INSERT INTO daily_logs (user_id, log_date) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
      [userId, date]
    );
    return result.insertId;
  }

  static async findByUserAndDate(userId, date) {
    const [logs] = await pool.execute(
      'SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?',
      [userId, date]
    );
    return logs[0];
  }

  static async updateLog(logId, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    values.push(logId);
    
    const [result] = await pool.execute(
      `UPDATE daily_logs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  static async getWeeklyLogs(userId, startDate, endDate) {
    const [logs] = await pool.execute(
      'SELECT * FROM daily_logs WHERE user_id = ? AND log_date BETWEEN ? AND ? ORDER BY log_date',
      [userId, startDate, endDate]
    );
    return logs;
  }

  static async addFoodEntry(dailyLogId, foodData) {
    const { foodName, quantity, unit, calories, protein, carbs, fats } = foodData;
    
    const [result] = await pool.execute(
      'INSERT INTO food_entries (daily_log_id, food_name, quantity, unit, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [dailyLogId, foodName, quantity, unit, calories, protein, carbs, fats]
    );
    
    // Update daily log totals
    await pool.execute(
      `UPDATE daily_logs SET 
       calories_consumed = calories_consumed + ?,
       protein = protein + ?,
       carbs = carbs + ?,
       fats = fats + ?
       WHERE id = ?`,
      [calories, protein, carbs, fats, dailyLogId]
    );
    
    return result.insertId;
  }

  static async getFoodEntries(dailyLogId) {
    const [entries] = await pool.execute(
      'SELECT * FROM food_entries WHERE daily_log_id = ? ORDER BY created_at DESC',
      [dailyLogId]
    );
    return entries;
  }
}

module.exports = DailyLog;