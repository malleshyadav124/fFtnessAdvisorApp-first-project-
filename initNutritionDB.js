const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'HealthDb',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function initializeNutritionTables() {
    try {
        // Create nutrition_goals table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nutrition_goals (
                user_id INTEGER PRIMARY KEY REFERENCES users(id),
                daily_calories INTEGER,
                daily_protein INTEGER,
                daily_carbs INTEGER,
                daily_fat INTEGER,
                daily_water INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create meals table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS meals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                food_name VARCHAR(255) NOT NULL,
                calories INTEGER,
                protein INTEGER,
                carbs INTEGER,
                fat INTEGER,
                serving_size DECIMAL,
                serving_unit VARCHAR(50),
                meal_type VARCHAR(50),
                consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create water_intake table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS water_intake (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                amount INTEGER,
                consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Nutrition tables created successfully');
    } catch (err) {
        console.error('❌ Error creating nutrition tables:', err);
    } finally {
        pool.end();
    }
}

initializeNutritionTables(); 