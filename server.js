const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
require('dotenv').config();

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// PostgreSQL Database Setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'HealthDb',
  password: 'rootnode',
  port: 5432,
});

// Database Connection Test
pool.connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection error', err);
  });

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123'; // Use a consistent secret

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token provided in request');
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({ message: 'Invalid token' });
        }
        console.log('Token verified successfully for user:', user.id);
        req.user = user;
        next();
    });
};

// Import Routes and Pass the pool
const authRoutes = require('./backend/routes/auth')(pool);
const userRoutes = require('./backend/routes/users')(pool);
const dietRoutes = require('./backend/routes/diet')(pool);
const fitnessRoutes = require('./backend/routes/fitness')(pool);
const progressRoutes = require('./backend/routes/progress')(pool);
const tipsRoutes = require('./backend/routes/tips')(pool);

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tips', tipsRoutes);

app.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { name, phone, gmail, age, password, gender, weight, height, goal } = req.body;

        // Validate required fields
        if (!name || !phone || !gmail || !age || !password || !gender || !weight || !height || !goal) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(gmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate phone number (basic validation)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        // Validate age
        if (age < 13 || age > 120) {
            return res.status(400).json({
                success: false,
                message: 'Age must be between 13 and 120'
            });
        }

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE phone = $1 OR gmail = $2',
            [phone, gmail]
        );

        if (userExists.rows.length > 0) {
            console.log('User already exists:', phone, gmail);
            return res.status(400).json({
                success: false,
                message: 'User with this phone or Gmail already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        console.log('Inserting new user:', name, phone, gmail, age);
        const result = await pool.query(
            'INSERT INTO users (name, phone, gmail, age, password, gender, weight, height, goal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, gmail, age',
            [name, phone, gmail, age, hashedPassword, gender, weight, height, goal]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, gmail: user.gmail }, JWT_SECRET);

        console.log('User registered successfully:', user.id);
        res.json({
            success: true,
            message: 'Registration successful',
            user: { ...user, token }
        });
    } catch (err) {
        console.error('Registration error details:', err);
        res.status(500).json({
            success: false,
            message: 'Error during registration: ' + err.message
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE gmail = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('No user found with these credentials');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.rows[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('User found:', user.id);
        
        const token = jwt.sign({ id: user.id, gmail: user.gmail }, JWT_SECRET);
        console.log('Token generated successfully');

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                gmail: user.gmail,
                age: user.age,
                weight: user.weight,
                height: user.height
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
});

// Protected routes
app.get('/api/profile', require('./backend/middleware/auth'), async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, age, weight, height, gender, goal FROM users WHERE id = $1',
            [req.user.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = result.rows[0];
        
        // Calculate BMI
        const heightInMeters = userData.height / 100;
        const bmi = userData.weight / (heightInMeters * heightInMeters);
        
        // Add BMI to response
        userData.bmi = bmi.toFixed(2);
        
        res.json(userData);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Goal text is required' });
        }

        const result = await pool.query(
            'INSERT INTO goals (user_id, text, completed) VALUES ($1, $2, $3) RETURNING id, text, completed',
            [req.user.id, text.trim(), false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/goals', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, text, completed FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;

        const result = await pool.query(
            'UPDATE goals SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [completed, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Nutrition endpoints
app.get('/api/nutrition/summary/daily', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const meals = await pool.query(`
            SELECT 
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fat) as total_fat
            FROM nutrition_logs 
            WHERE user_id = $1 AND date = $2
        `, [req.user.id, today]);

        res.json({
            meals: {
                total_calories: meals.rows[0].total_calories || 0,
                total_protein: meals.rows[0].total_protein || 0,
                total_carbs: meals.rows[0].total_carbs || 0,
                total_fat: meals.rows[0].total_fat || 0
            }
        });
    } catch (error) {
        console.error('Error fetching nutrition summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/nutrition/log', authenticateToken, async (req, res) => {
    try {
        const { meal_type, food_name, calories, protein, carbs, fat } = req.body;
        const result = await pool.query(`
            INSERT INTO nutrition_logs 
            (user_id, meal_type, food_name, calories, protein, carbs, fat)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [req.user.id, meal_type, food_name, calories, protein, carbs, fat]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error logging nutrition' });
    }
});

// Water intake endpoints
app.get('/api/nutrition/water/today', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const water = await pool.query(`
            SELECT SUM(amount_ml) as total_water
            FROM water_intake
            WHERE user_id = $1 AND date = $2
        `, [req.user.id, today]);

        res.json({
            total_water: water.rows[0].total_water || 0
        });
    } catch (error) {
        console.error('Error fetching water intake:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/nutrition/water/log', authenticateToken, async (req, res) => {
    try {
        const { amount_ml } = req.body;
        if (!amount_ml || amount_ml <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const today = new Date().toISOString().split('T')[0];
        const result = await pool.query(`
            INSERT INTO water_intake (user_id, amount_ml, date)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [req.user.id, amount_ml, today]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error logging water intake:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

// Dashboard routes
app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

app.get('/teen-dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'teen-dashboard.html'));
});

app.get('/senior-dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'senior-dashboard.html'));
});

// Add a route to check authentication status
app.get('/api/auth/check', authenticateToken, (req, res) => {
    res.json({ 
        authenticated: true,
        user: req.user
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Visit http://localhost:${PORT} to access the application`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', error);
    }
}); 