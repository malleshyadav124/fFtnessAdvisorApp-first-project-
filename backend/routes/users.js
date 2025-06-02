const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (pool) => {
    // Get user profile
    router.get('/profile', auth, async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT id, name, gmail, age, gender, weight, height, goal FROM users WHERE id = $1',
                [req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userData = result.rows[0];
            
            // Calculate BMI
            const heightInMeters = userData.height / 100;
            const bmi = userData.weight / (heightInMeters * heightInMeters);
            userData.bmi = bmi.toFixed(2);

            res.json(userData);
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Update user profile
    router.put('/profile', auth, async (req, res) => {
        const { name, age, gender, weight, height, goal } = req.body;
        
        try {
            const result = await pool.query(
                `UPDATE users 
                 SET name = $1, age = $2, gender = $3, weight = $4, height = $5, goal = $6
                 WHERE id = $7
                 RETURNING id, name, gmail, age, gender, weight, height, goal`,
                [name, age, gender, weight, height, goal, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Delete user account
    router.delete('/profile', auth, async (req, res) => {
        try {
            await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
            res.json({ message: 'Account deleted successfully' });
        } catch (error) {
            console.error('Error deleting account:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}; 