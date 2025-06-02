-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gmail VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    goal VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition goals table
CREATE TABLE nutrition_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    daily_calories INTEGER,
    daily_protein INTEGER,
    daily_carbs INTEGER,
    daily_fat INTEGER,
    daily_water INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    food_name VARCHAR(100) NOT NULL,
    calories INTEGER,
    protein DECIMAL(5,2),
    carbs DECIMAL(5,2),
    fat DECIMAL(5,2),
    serving_size DECIMAL(5,2),
    serving_unit VARCHAR(20),
    meal_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water intake table
CREATE TABLE water_intake (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Local food database table
CREATE TABLE food_database (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    serving_size DECIMAL(5,2) NOT NULL,
    serving_unit VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- Insert common foods into the database
INSERT INTO food_database (name, calories, protein, carbs, fat, serving_size, serving_unit, category) VALUES
('Apple', 52, 0.3, 14, 0.2, 100, 'g', 'Fruits'),
('Banana', 89, 1.1, 23, 0.3, 100, 'g', 'Fruits'),
('Chicken Breast', 165, 31, 0, 3.6, 100, 'g', 'Meat'),
('Brown Rice', 112, 2.6, 23, 0.9, 100, 'g', 'Grains'),
('Broccoli', 34, 2.8, 6.6, 0.4, 100, 'g', 'Vegetables'),
('Salmon', 208, 20, 0, 13, 100, 'g', 'Fish'),
('Eggs', 143, 13, 0.7, 9.5, 100, 'g', 'Dairy'),
('Milk', 42, 3.4, 5, 1, 100, 'ml', 'Dairy'),
('Bread', 265, 9, 49, 3.2, 100, 'g', 'Grains'),
('Yogurt', 59, 3.5, 4.7, 3.3, 100, 'g', 'Dairy');

-- Progress tracking table
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    weight DECIMAL(5,2) NOT NULL,
    steps INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diet plans table
CREATE TABLE diet_plans (
    id SERIAL PRIMARY KEY,
    age_group VARCHAR(20) NOT NULL,
    goal VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fitness tutorials table
CREATE TABLE tutorials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    video_url VARCHAR(255),
    difficulty_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User completed tutorials
CREATE TABLE user_tutorials (
    user_id INTEGER REFERENCES users(id),
    tutorial_id INTEGER REFERENCES tutorials(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tutorial_id)
);

-- Health tips table
CREATE TABLE health_tips (
    id SERIAL PRIMARY KEY,
    tip_text TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 