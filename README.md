# 🥗 Diet Assessment Tool

A comprehensive full-stack web application for tracking nutrition, managing diet plans, and monitoring health goals with AI-powered recommendations.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based login/register system
- 📊 **Interactive Dashboard** - Real-time progress tracking with charts
- 🍎 **Food Logging** - Track daily nutrition with macronutrient breakdown
- 🤖 **AI Chatbot** - Personalized nutrition advice using Groq API
- 💡 **Smart Recommendations** - Goal-based diet and exercise suggestions
- 📈 **Progress Visualization** - Weekly charts and compliance tracking
- 🌙 **Modern UI** - Clean design with light theme
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MySQL** database
- **JWT** authentication
- **Groq AI** integration
- **bcryptjs** password hashing

### Frontend
- **React 18**
- **Axios** for API calls
- **Chart.js** for visualizations
- **Responsive CSS** styling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MySQL (v8.0+)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/diet-assessment-tool.git
cd diet-assessment-tool
```

### 2. Setup Database
```sql
CREATE DATABASE diet_assessment_db;
```

Import schema:
```bash
mysql -u root -p diet_assessment_db < backend/schema.sql
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=diet_assessment_db
GROQ_API_KEY=your_groq_api_key
```

Start backend:
```bash
npm start
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 Usage

1. **Register** with email and password
2. **Complete profile** with age, weight, height, goals
3. **Track daily nutrition** by logging foods
4. **Chat with AI bot** for personalized advice
5. **View progress** with charts and recommendations
6. **Update profile** anytime to recalculate goals

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Nutrition
- `GET /api/nutrition/today` - Get today's log
- `POST /api/nutrition/food` - Add food entry
- `PUT /api/nutrition/daily-log` - Update daily progress
- `GET /api/nutrition/weekly-progress` - Weekly data
- `GET /api/nutrition/food-info/:food` - Food nutrition info

### AI & Recommendations
- `POST /api/chatbot/chat` - Chat with AI bot
- `GET /api/recommendations` - Get recommendations
- `POST /api/recommendations/generate` - Generate new recommendations

## 🗄️ Database Schema

- **users** - User profiles and authentication
- **daily_logs** - Daily nutrition tracking
- **food_entries** - Individual food records
- **recommendations** - Personalized suggestions
- **notifications** - User alerts
- **weekly_summaries** - Progress analysis

## 🤖 AI Features

- **Personalized Chatbot** using Groq API
- **Context-aware responses** based on user profile
- **Nutrition advice** and meal planning
- **Goal-specific recommendations**

## 🎯 Key Features

### Dashboard
- BMI calculation and tracking
- Daily calorie progress with circular charts
- Macronutrient breakdown (protein, carbs, fats)
- Quick-add food buttons
- Water intake and exercise tracking

### AI Chatbot
- Real-time nutrition advice
- Personalized responses based on user data
- Food recommendations and meal planning
- Health tips and motivation

### Progress Tracking
- Weekly progress charts
- Compliance percentage tracking
- Goal achievement monitoring
- Historical data visualization

## 🔒 Security

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support, email support@dietassessment.com or open an issue on GitHub.

---

Made with ❤️ for healthy living