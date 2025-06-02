// Import required modules
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize the router
const router = express.Router();

// Export router with pool parameter
module.exports = (pool) => {
    // Registration route
    router.post('/register', async (req, res) => {
        const { name, phone, gmail, age, gender, weight, height, goal, password } = req.body;

        try {
            // Check if user already exists
            const userCheck = await pool.query(
                'SELECT * FROM users WHERE gmail = $1 OR phone = $2',
                [gmail, phone]
            );

            if (userCheck.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'User with this email or phone number already exists' 
                });
            }

            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Insert new user
            const result = await pool.query(
                `INSERT INTO users (name, gmail, phone, age, gender, weight, height, goal, password) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                 RETURNING id, name, gmail, age`,
                [name, gmail, phone, age, gender, weight, height, goal, passwordHash]
            );

            const user = result.rows[0];

            // Determine age group
            let ageGroup;
            if (age < 18) {
                ageGroup = 'teen';
            } else if (age < 60) {
                ageGroup = 'adult';
            } else {
                ageGroup = 'senior';
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.gmail },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send response
            res.status(201).json({
                success: true,
                ageGroup,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    gmail: user.gmail,
                    age: user.age
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    });

    // Login route
    router.post('/login', async (req, res) => {
        try {
            console.log('Login attempt received:', req.body);
            const { gmail, password } = req.body;

            if (!gmail || !password) {
                console.log('Missing credentials:', { gmail: !!gmail, password: !!password });
                return res.status(400).json({ 
                    success: false, 
                    error: 'Email and password are required' 
                });
            }

            // Find user by email
            console.log('Searching for user with gmail:', gmail);
            const result = await pool.query(
                'SELECT * FROM users WHERE gmail = $1',
                [gmail]
            );

            if (result.rows.length === 0) {
                console.log('No user found with gmail:', gmail);
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid email or password' 
                });
            }

            const user = result.rows[0];
            console.log('User found:', { id: user.id, name: user.name });

            // Verify password
            console.log('Verifying password...');
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                console.log('Invalid password for user:', user.id);
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid email or password' 
                });
            }

            // Generate JWT token
            console.log('Generating token for user:', user.id);
            const token = jwt.sign(
                { id: user.id, email: user.gmail },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Determine age group
            let ageGroup;
            if (user.age < 18) {
                ageGroup = 'teen';
            } else if (user.age < 60) {
                ageGroup = 'adult';
            } else {
                ageGroup = 'senior';
            }

            console.log('Login successful for user:', user.id);
            // Send response
            res.json({
                success: true,
                ageGroup,
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
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            res.status(500).json({ 
                success: false, 
                error: 'Server error during login',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};
