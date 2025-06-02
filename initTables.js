const { pool } = require('./backend/db');

async function initTables() {
    try {
        // Create goals table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                text TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Goals table created successfully');

        // Create nutrition_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nutrition_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                date DATE DEFAULT CURRENT_DATE,
                meal_type VARCHAR(50),
                food_name VARCHAR(100),
                calories INTEGER,
                protein INTEGER,
                carbs INTEGER,
                fat INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Nutrition logs table created successfully');

        // Create water_intake table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS water_intake (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                date DATE DEFAULT CURRENT_DATE,
                amount_ml INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Water intake table created successfully');

        console.log('✨ All tables created successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating tables:', err);
        process.exit(1);
    }
}

initTables(); 