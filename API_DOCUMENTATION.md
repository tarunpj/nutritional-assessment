# Diet Assessment Tool API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "weight": 70.5,
  "height": 175,
  "gender": "male",
  "activityLevel": "moderately_active",
  "goal": "lose_weight"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "bmi": "23.0",
    "dailyCalories": 1800
  }
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "age": 30,
    "weight": 70.5,
    "height": 175,
    "gender": "male",
    "activityLevel": "moderately_active",
    "goal": "lose_weight",
    "bmi": "23.0",
    "dailyCalories": 1800
  }
}
```

#### GET /auth/profile
Get current user profile (Protected).

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "age": 30,
    "weight": 70.5,
    "height": 175,
    "gender": "male",
    "activityLevel": "moderately_active",
    "goal": "lose_weight",
    "bmi": "23.0",
    "dailyCalories": 1800
  }
}
```

### Nutrition Tracking

#### GET /nutrition/today
Get today's nutrition log (Protected).

**Response:**
```json
{
  "log": {
    "id": 1,
    "user_id": 1,
    "log_date": "2024-01-15",
    "calories_consumed": 1200,
    "protein": 80,
    "carbs": 150,
    "fats": 40,
    "water_intake": 2.5,
    "exercise_duration": 30,
    "status": "pending",
    "foodEntries": [
      {
        "id": 1,
        "food_name": "Chicken Breast",
        "quantity": 100,
        "unit": "g",
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fats": 3.6
      }
    ]
  }
}
```

#### POST /nutrition/food
Add a food entry (Protected).

**Request Body:**
```json
{
  "foodName": "Chicken Breast",
  "quantity": 100,
  "unit": "g",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fats": 3.6
}
```

**Response:**
```json
{
  "message": "Food entry added successfully",
  "entryId": 1
}
```

#### PUT /nutrition/daily-log
Update daily log (Protected).

**Request Body:**
```json
{
  "waterIntake": 2.5,
  "exerciseDuration": 30,
  "status": "completed"
}
```

**Response:**
```json
{
  "message": "Daily log updated successfully"
}
```

#### GET /nutrition/weekly-progress
Get weekly progress data (Protected).

**Response:**
```json
{
  "weeklyLogs": [
    {
      "id": 1,
      "log_date": "2024-01-15",
      "calories_consumed": 1800,
      "protein": 120,
      "carbs": 200,
      "fats": 60,
      "water_intake": 2.5,
      "exercise_duration": 30,
      "status": "completed"
    }
  ],
  "summary": {
    "compliancePercentage": "85.7",
    "avgCalories": "1750",
    "totalExercise": 180,
    "missedDays": 1
  }
}
```

#### GET /nutrition/food-info/:foodName
Get nutrition information for a specific food (Protected).

**Response:**
```json
{
  "foodName": "apple",
  "nutrition": {
    "calories": 52,
    "protein": 0.3,
    "carbs": 14,
    "fats": 0.2,
    "rating": "A"
  },
  "healthTip": "Excellent choice! This food is nutrient-dense and great for your health."
}
```

### Recommendations

#### POST /recommendations/generate
Generate personalized recommendations (Protected).

**Response:**
```json
{
  "message": "Recommendations generated successfully",
  "recommendations": [
    {
      "type": "nutrition",
      "title": "Increase Protein Intake",
      "description": "Consume 1.6-2.2g protein per kg body weight to support muscle growth.",
      "priority": "high"
    }
  ]
}
```

#### GET /recommendations
Get user recommendations (Protected).

**Response:**
```json
{
  "recommendations": [
    {
      "id": 1,
      "type": "nutrition",
      "title": "Increase Protein Intake",
      "description": "Consume 1.6-2.2g protein per kg body weight to support muscle growth.",
      "priority": "high",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### GET /recommendations/nutrition-plan
Get personalized nutrition plan (Protected).

**Response:**
```json
{
  "nutritionPlan": {
    "dailyCalories": 1800,
    "macros": {
      "protein": 112,
      "carbs": 202,
      "fats": 60
    },
    "foodsToInclude": [
      "Lean proteins",
      "Leafy greens",
      "Berries",
      "Greek yogurt",
      "Quinoa"
    ],
    "foodsToAvoid": [
      "Processed foods",
      "Sugary drinks",
      "Trans fats",
      "Excessive alcohol",
      "High-calorie snacks"
    ],
    "mealTiming": {
      "breakfast": "25% of daily calories",
      "lunch": "35% of daily calories",
      "dinner": "30% of daily calories",
      "snacks": "10% of daily calories"
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error message"
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Applies to all endpoints

## Data Validation

### User Registration
- Email: Valid email format
- Password: Minimum 6 characters
- Age: 13-120 years
- Weight: 30-300 kg
- Height: 100-250 cm
- Gender: 'male', 'female', 'other'
- Activity Level: 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
- Goal: 'lose_weight', 'maintain_weight', 'gain_weight'

### Food Entry
- Food Name: Required, non-empty string
- Quantity: Positive number
- Unit: Required, non-empty string
- Calories: Non-negative number
- Macronutrients: Optional, non-negative numbers