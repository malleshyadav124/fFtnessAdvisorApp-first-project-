const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (pool) => {
    // Get weight history
    router.get('/weight', auth, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT weight, recorded_at 
                FROM weight_history 
                WHERE user_id = $1 
                ORDER BY recorded_at DESC`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching weight history:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Record weight
    router.post('/weight', auth, async (req, res) => {
        const { weight } = req.body;
        try {
            const result = await pool.query(
                `INSERT INTO weight_history (user_id, weight)
                VALUES ($1, $2)
                RETURNING *`,
                [req.user.id, weight]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error recording weight:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get progress summary
    router.get('/summary', auth, async (req, res) => {
        try {
            // Get weight progress
            const weightResult = await pool.query(
                `SELECT 
                    MIN(weight) as starting_weight,
                    MAX(weight) as current_weight,
                    MIN(recorded_at) as start_date,
                    MAX(recorded_at) as last_recorded
                FROM weight_history 
                WHERE user_id = $1`,
                [req.user.id]
            );

            // Get workout progress
            const workoutResult = await pool.query(
                `SELECT 
                    COUNT(*) as total_workouts,
                    SUM(duration) as total_duration,
                    SUM(calories_burned) as total_calories_burned
                FROM workouts 
                WHERE user_id = $1`,
                [req.user.id]
            );

            // Get nutrition progress
            const nutritionResult = await pool.query(
                `SELECT 
                    AVG(calories) as avg_daily_calories,
                    AVG(protein) as avg_daily_protein,
                    AVG(carbs) as avg_daily_carbs,
                    AVG(fat) as avg_daily_fat
                FROM meals 
                WHERE user_id = $1 
                AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
                [req.user.id]
            );

            res.json({
                weight: weightResult.rows[0],
                workouts: workoutResult.rows[0],
                nutrition: nutritionResult.rows[0]
            });
        } catch (error) {
            console.error('Error fetching progress summary:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get monthly progress
    router.get('/monthly', auth, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT 
                    DATE_TRUNC('month', recorded_at) as month,
                    AVG(weight) as avg_weight,
                    COUNT(DISTINCT w.id) as workout_count,
                    SUM(w.duration) as total_duration,
                    SUM(w.calories_burned) as total_calories_burned
                FROM weight_history wh
                LEFT JOIN workouts w ON 
                    DATE_TRUNC('month', w.created_at) = DATE_TRUNC('month', wh.recorded_at)
                    AND w.user_id = wh.user_id
                WHERE wh.user_id = $1
                GROUP BY DATE_TRUNC('month', recorded_at)
                ORDER BY month DESC`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching monthly progress:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}; 