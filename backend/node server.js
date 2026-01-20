const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// DB connection using .env
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'HealthDb',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Database connected successfully!');
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile('html/login.html', { root: 'public' });
});
app.get('/dashboard', (req, res) => {
    res.sendFile('html/dashboard.html', { root: 'public' });
});


// Login route
app.post('/login', async (req, res) => {
    const { phone, gmail } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE phone = $1 AND gmail = $2',
            [phone, gmail]
        );
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error');
    }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/fitness', require('./routes/fitness'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/tips', require('./routes/tips'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 
