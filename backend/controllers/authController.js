const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = await User.create({
      email, password, firstName, lastName
    });

    const token = generateToken(userId);
    const user = await User.findById(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    
    // Calculate current BMI and calories
    const bmi = User.calculateBMI(user.weight, user.height);
    const dailyCalories = User.calculateCalories(
      user.weight, user.height, user.age, user.gender, user.activity_level, user.goal
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        activityLevel: user.activity_level,
        goal: user.goal,
        bmi,
        dailyCalories
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bmi = User.calculateBMI(user.weight, user.height);
    const dailyCalories = User.calculateCalories(
      user.weight, user.height, user.age, user.gender, user.activity_level, user.goal
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        activityLevel: user.activity_level,
        goal: user.goal,
        bmi,
        dailyCalories
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { age, weight, height, gender, activityLevel, goal } = req.body;
    
    const updated = await User.updateProfile(req.user.id, {
      age, weight, height, gender, 
      activity_level: activityLevel, 
      goal
    });
    
    if (updated) {
      const user = await User.findById(req.user.id);
      const bmi = User.calculateBMI(user.weight, user.height);
      const dailyCalories = User.calculateCalories(
        user.weight, user.height, user.age, user.gender, user.activity_level, user.goal
      );
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          ...user,
          bmi,
          dailyCalories
        }
      });
    } else {
      res.status(400).json({ error: 'Failed to update profile' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getProfile, updateProfile };