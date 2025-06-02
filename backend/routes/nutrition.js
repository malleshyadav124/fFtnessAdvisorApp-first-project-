const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const nutritionService = require('../services/nutritionService');

// Get nutrition goals
router.get('/goals', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM nutrition_goals WHERE user_id = $1',
            [req.user.id]
        );
        res.json(result.rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Set nutrition goals
router.post('/goals', auth, async (req, res) => {
    const { calories, protein, carbs, fat, waterGoal } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO nutrition_goals 
            (user_id, daily_calories, daily_protein, daily_carbs, daily_fat, daily_water)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) DO UPDATE SET
            daily_calories = $2,
            daily_protein = $3,
            daily_carbs = $4,
            daily_fat = $5,
            daily_water = $6,
            updated_at = CURRENT_TIMESTAMP
            RETURNING *`,
            [req.user.id, calories, protein, carbs, fat, waterGoal]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search for food items
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        
        const foodItems = await nutritionService.searchFood(query);
        res.json(foodItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to search for food items' });
    }
});

// Get food details
router.get('/food/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const foodDetails = await nutritionService.getFoodDetails(id);
        res.json(foodDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get food details' });
    }
});

// Calculate nutrition from natural language
router.post('/calculate', auth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        const nutritionInfo = await nutritionService.calculateNutrition(query);
        res.json(nutritionInfo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to calculate nutrition' });
    }
});

// Add meal
router.post('/meals', auth, async (req, res) => {
    const { name, calories, protein, carbs, fat, servingSize, servingUnit, type } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO meals 
            (user_id, food_name, calories, protein, carbs, fat, serving_size, serving_unit, meal_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [req.user.id, name, calories, protein, carbs, fat, servingSize, servingUnit, type]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get meals for today
router.get('/meals/today', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM meals 
            WHERE user_id = $1 
            AND DATE(created_at) = CURRENT_DATE
            ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add water intake
router.post('/water', auth, async (req, res) => {
    const { amount } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO water_intake (user_id, amount) VALUES ($1, $2) RETURNING *',
            [req.user.id, amount]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get water intake for today
router.get('/water/today', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT SUM(amount) as total_water 
            FROM water_intake 
            WHERE user_id = $1 
            AND DATE(created_at) = CURRENT_DATE`,
            [req.user.id]
        );
        res.json({ total_water: result.rows[0].total_water || 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get daily nutrition summary
router.get('/summary/daily', auth, async (req, res) => {
    try {
        const mealsResult = await pool.query(
            `SELECT 
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fat) as total_fat
            FROM meals 
            WHERE user_id = $1 
            AND DATE(created_at) = CURRENT_DATE`,
            [req.user.id]
        );

        const waterResult = await pool.query(
            `SELECT SUM(amount) as total_water 
            FROM water_intake 
            WHERE user_id = $1 
            AND DATE(created_at) = CURRENT_DATE`,
            [req.user.id]
        );

        const goalsResult = await pool.query(
            'SELECT * FROM nutrition_goals WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            meals: mealsResult.rows[0],
            water: waterResult.rows[0],
            goals: goalsResult.rows[0] || {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 