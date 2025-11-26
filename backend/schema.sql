CREATE DATABASE IF NOT EXISTS diet_assessment_db;
USE diet_assessment_db;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  gender ENUM('male', 'female', 'other'),
  activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
  goal ENUM('lose_weight', 'maintain_weight', 'gain_weight'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Daily logs table
CREATE TABLE daily_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  log_date DATE NOT NULL,
  calories_consumed INT DEFAULT 0,
  protein DECIMAL(6,2) DEFAULT 0,
  carbs DECIMAL(6,2) DEFAULT 0,
  fats DECIMAL(6,2) DEFAULT 0,
  water_intake DECIMAL(5,2) DEFAULT 0,
  exercise_duration INT DEFAULT 0,
  status ENUM('completed', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, log_date)
);

-- Food entries table
CREATE TABLE food_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  daily_log_id INT NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(6,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  calories DECIMAL(6,2) NOT NULL,
  protein DECIMAL(6,2) DEFAULT 0,
  carbs DECIMAL(6,2) DEFAULT 0,
  fats DECIMAL(6,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE CASCADE
);

-- Recommendations table
CREATE TABLE recommendations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('nutrition', 'exercise', 'general') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('reminder', 'achievement', 'warning', 'info') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weekly summaries table
CREATE TABLE weekly_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  avg_calories DECIMAL(7,2),
  compliance_percentage DECIMAL(5,2),
  missed_days INT DEFAULT 0,
  total_exercise_minutes INT DEFAULT 0,
  weight_change DECIMAL(5,2) DEFAULT 0,
  suggestions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);