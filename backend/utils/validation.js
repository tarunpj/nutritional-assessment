const { body } = require('express-validator');

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('age').isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120'),
  body('weight').isFloat({ min: 30, max: 300 }).withMessage('Weight must be between 30 and 300 kg'),
  body('height').isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100 and 250 cm'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('activityLevel').isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Invalid activity level'),
  body('goal').isIn(['lose_weight', 'maintain_weight', 'gain_weight']).withMessage('Invalid goal')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const foodEntryValidation = [
  body('foodName').trim().isLength({ min: 1 }).withMessage('Food name is required'),
  body('quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be greater than 0'),
  body('unit').trim().isLength({ min: 1 }).withMessage('Unit is required'),
  body('calories').isFloat({ min: 0 }).withMessage('Calories must be a positive number'),
  body('protein').optional().isFloat({ min: 0 }).withMessage('Protein must be a positive number'),
  body('carbs').optional().isFloat({ min: 0 }).withMessage('Carbs must be a positive number'),
  body('fats').optional().isFloat({ min: 0 }).withMessage('Fats must be a positive number')
];

const dailyLogValidation = [
  body('waterIntake').optional().isFloat({ min: 0 }).withMessage('Water intake must be a positive number'),
  body('exerciseDuration').optional().isInt({ min: 0 }).withMessage('Exercise duration must be a positive integer'),
  body('status').optional().isIn(['completed', 'pending']).withMessage('Status must be completed or pending')
];

module.exports = {
  registerValidation,
  loginValidation,
  foodEntryValidation,
  dailyLogValidation
};