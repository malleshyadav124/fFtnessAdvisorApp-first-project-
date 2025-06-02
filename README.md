# Health & Fitness Advisor System

A comprehensive health and fitness advisory system with age-specific dashboards for tracking nutrition, exercise, and overall wellness.

## Features

- User registration and authentication
- Age-specific dashboards (Teen, Adult, Senior)
- Nutrition tracking with food database integration
- Water intake monitoring
- Exercise tracking
- Goal setting and progress monitoring
- Personalized health recommendations

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/health-fitness-advisor.git
   cd health-fitness-advisor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=HealthDb
   DB_PASSWORD=rootnode
   DB_PORT=5432

   # JWT Configuration
   JWT_SECRET=health_fitness_advisor_secret_key_2023
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Nutrition API Keys
   NUTRITION_API_KEY=your_nutrition_api_key_here
   FOOD_DATABASE_API_KEY=your_food_database_api_key_here

   # Exercise API Keys
   EXERCISE_API_KEY=your_exercise_api_key_here

   # Email Configuration (for notifications)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_app_password
   EMAIL_FROM=Health & Fitness Advisor <your_email@gmail.com>
   ```

4. Initialize the database:
   ```
   npm run init-db
   ```

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login with phone and Gmail

### Nutrition
- `GET /api/nutrition/goals` - Get nutrition goals
- `POST /api/nutrition/goals` - Set nutrition goals
- `GET /api/nutrition/search` - Search for food items
- `GET /api/nutrition/food/:id` - Get food details
- `POST /api/nutrition/calculate` - Calculate nutrition from natural language
- `POST /api/nutrition/meals` - Add a meal
- `GET /api/nutrition/meals/today` - Get today's meals
- `POST /api/nutrition/water` - Add water intake
- `GET /api/nutrition/water/today` - Get today's water intake
- `GET /api/nutrition/summary/daily` - Get daily nutrition summary

### Goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals` - Get all goals
- `PUT /api/goals/:id` - Update a goal

## Project Structure

```
health-fitness-advisor/
├── backend/
│   ├── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── nutrition.js
│   └── services/
│       └── nutritionService.js
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── login.js
│   │   ├── register.js
│   │   └── nutrition.js
│   └── nutrition.html
├── .env
├── config.js
├── initDB.js
├── package.json
├── README.md
└── server.js
```

## License

This project is licensed under the MIT License. 