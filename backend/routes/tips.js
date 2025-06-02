const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (pool) => {
    // Get all tips
    router.get('/', auth, async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM tips ORDER BY created_at DESC'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching tips:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get tips by category
    router.get('/category/:category', auth, async (req, res) => {
        const { category } = req.params;
        try {
            const result = await pool.query(
                'SELECT * FROM tips WHERE category = $1 ORDER BY created_at DESC',
                [category]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching tips by category:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get personalized tips based on user's goals and progress
    router.get('/personalized', auth, async (req, res) => {
        try {
            // Get user's goals and recent progress
            const userResult = await pool.query(
                `SELECT u.goal, fg.target_weight, fg.weekly_workouts
                FROM users u
                LEFT JOIN fitness_goals fg ON u.id = fg.user_id
                WHERE u.id = $1`,
                [req.user.id]
            );

            const user = userResult.rows[0];
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get tips based on user's goal
            const tipsResult = await pool.query(
                `SELECT * FROM tips 
                WHERE category = $1 
                OR category = 'general'
                ORDER BY created_at DESC
                LIMIT 5`,
                [user.goal]
            );

            res.json(tipsResult.rows);
        } catch (error) {
            console.error('Error fetching personalized tips:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Save tip for later
    router.post('/save/:tipId', auth, async (req, res) => {
        const { tipId } = req.params;
        try {
            const result = await pool.query(
                `INSERT INTO saved_tips (user_id, tip_id)
                VALUES ($1, $2)
                ON CONFLICT (user_id, tip_id) DO NOTHING
                RETURNING *`,
                [req.user.id, tipId]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error saving tip:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get saved tips
    router.get('/saved', auth, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT t.* 
                FROM tips t
                JOIN saved_tips st ON t.id = st.tip_id
                WHERE st.user_id = $1
                ORDER BY st.created_at DESC`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching saved tips:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Remove saved tip
    router.delete('/saved/:tipId', auth, async (req, res) => {
        const { tipId } = req.params;
        try {
            await pool.query(
                'DELETE FROM saved_tips WHERE user_id = $1 AND tip_id = $2',
                [req.user.id, tipId]
            );
            res.json({ message: 'Tip removed from saved items' });
        } catch (error) {
            console.error('Error removing saved tip:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}; 