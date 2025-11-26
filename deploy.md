# Deployment Guide

## Quick Start Commands

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
CREATE DATABASE diet_assessment_db;
USE diet_assessment_db;
source backend/schema.sql;
```

### 3. Environment Configuration
Create `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=diet_assessment_db
NODE_ENV=development
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Build

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve build folder with nginx or similar
```

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: diet_assessment_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: rootpassword
      DB_NAME: diet_assessment_db
      JWT_SECRET: your_jwt_secret
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

## Testing the Application

### 1. Register a New User
- Go to http://localhost:3000/register
- Fill in all required fields
- Submit the form

### 2. Login
- Use the registered credentials
- Should redirect to dashboard

### 3. Test Features
- Add food entries
- Check calorie progress
- Use nutrition chatbot
- Generate recommendations
- View weekly progress

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in .env
   - Ensure database exists

2. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in .env

3. **CORS Errors**
   - Verify proxy in frontend package.json
   - Check CORS configuration in backend

4. **Build Errors**
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

### Port Conflicts
If ports 3000 or 5000 are in use:
```bash
# Backend - change PORT in .env
PORT=5001

# Frontend - start with different port
PORT=3001 npm start
```