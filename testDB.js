require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'HealthDb',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test basic connection
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL database successfully!');
        
        // Test if users table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ Users table exists');
            
            // Count users in the table
            const userCount = await client.query('SELECT COUNT(*) FROM users');
            console.log(`📊 Total users in database: ${userCount.rows[0].count}`);
        } else {
            console.log('❌ Users table does not exist');
        }
        
        // Test if food_database table exists
        const foodTableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'food_database'
            );
        `);
        
        if (foodTableCheck.rows[0].exists) {
            console.log('✅ Food database table exists');
            
            // Count foods in the table
            const foodCount = await client.query('SELECT COUNT(*) FROM food_database');
            console.log(`📊 Total foods in database: ${foodCount.rows[0].count}`);
        } else {
            console.log('❌ Food database table does not exist');
        }
        
        client.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error connecting to the database:', error);
        process.exit(1);
    }
}

testConnection(); 