# 🚀 Setup Guide

## Prerequisites

- **Node.js** v16 or higher
- **MySQL** v8.0 or higher  
- **Git**
- **Groq API Key** (free at https://console.groq.com)

## Step-by-Step Setup

### 1. Clone & Navigate
```bash
git clone https://github.com/yourusername/diet-assessment-tool.git
cd diet-assessment-tool
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE diet_assessment_db;
exit

# Import schema
mysql -u root -p diet_assessment_db < backend/schema.sql
```

### 3. Backend Configuration
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=diet_assessment_db
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key_from_console_groq_com
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

### 5. Start Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `DB_HOST` | MySQL host | Yes |
| `DB_USER` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `DB_NAME` | Database name | Yes |
| `GROQ_API_KEY` | Groq AI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Getting Groq API Key
1. Visit https://console.groq.com
2. Sign up for free account
3. Go to API Keys section
4. Create new API key
5. Copy key to `.env` file

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials
mysql -u root -p
```

**Port Already in Use**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

**Missing Dependencies**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS Errors**
- Check proxy setting in `frontend/package.json`
- Verify backend is running on correct port

### Database Issues

**Schema Import Failed**
```bash
# Check file path
ls backend/schema.sql

# Import with full path
mysql -u root -p diet_assessment_db < /full/path/to/backend/schema.sql
```

**Connection Refused**
```bash
# Start MySQL service
sudo systemctl start mysql

# Check MySQL status
sudo systemctl status mysql
```

## 🚀 Production Deployment

### Environment Setup
```env
NODE_ENV=production
JWT_SECRET=super_secure_production_secret
DB_HOST=your_production_db_host
GROQ_API_KEY=your_production_groq_key
```

### Build Frontend
```bash
cd frontend
npm run build
```

### PM2 Process Manager
```bash
npm install -g pm2
pm2 start backend/server.js --name diet-app
pm2 startup
pm2 save
```

## 📊 Database Schema

Tables created automatically:
- `users` - User accounts and profiles
- `daily_logs` - Daily nutrition tracking
- `food_entries` - Individual food records
- `recommendations` - AI-generated suggestions
- `notifications` - User notifications
- `weekly_summaries` - Progress summaries

## 🔒 Security Notes

- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Configure firewall rules
- Regular database backups
- Update dependencies regularly

## 📞 Need Help?

- Check existing GitHub issues
- Create new issue with error details
- Include environment info and logs