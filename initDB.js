require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'HealthDb',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function initDatabase() {
    const client = await pool.connect();
    try {
        console.log('🔍 Initializing database...');

        // Create food_database table
        await client.query(`
            CREATE TABLE IF NOT EXISTS food_database (
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
        `);
        console.log('✅ Created food_database table');

        // Insert sample foods
        await client.query(`
            INSERT INTO food_database (name, calories, protein, carbs, fat, serving_size, serving_unit, category) 
            VALUES 
                ('Apple', 52, 0.3, 14, 0.2, 100, 'g', 'Fruits'),
                ('Banana', 89, 1.1, 23, 0.3, 100, 'g', 'Fruits'),
                ('Chicken Breast', 165, 31, 0, 3.6, 100, 'g', 'Meat'),
                ('Brown Rice', 112, 2.6, 23, 0.9, 100, 'g', 'Grains'),
                ('Broccoli', 34, 2.8, 6.6, 0.4, 100, 'g', 'Vegetables'),
                ('Salmon', 208, 20, 0, 13, 100, 'g', 'Fish'),
                ('Eggs', 143, 13, 0.7, 9.5, 100, 'g', 'Dairy'),
                ('Milk', 42, 3.4, 5, 1, 100, 'ml', 'Dairy'),
                ('Bread', 265, 9, 49, 3.2, 100, 'g', 'Grains'),
                ('Yogurt', 59, 3.5, 4.7, 3.3, 100, 'g', 'Dairy')
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Inserted sample foods');

        // Verify the table was created and populated
        const result = await client.query('SELECT COUNT(*) FROM food_database');
        console.log(`📊 Total foods in database: ${result.rows[0].count}`);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        client.release();
        pool.end();
    }
}

initDatabase(); 