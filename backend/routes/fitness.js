const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (pool) => {
    // Get workout history
    router.get('/workouts', auth, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT * FROM workouts 
                WHERE user_id = $1 
                ORDER BY created_at DESC`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching workouts:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Add new workout
    router.post('/workouts', auth, async (req, res) => {
        const { type, duration, calories_burned, notes } = req.body;
        try {
            const result = await pool.query(
                `INSERT INTO workouts 
                (user_id, type, duration, calories_burned, notes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [req.user.id, type, duration, calories_burned, notes]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error adding workout:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get exercise library
    router.get('/exercises', auth, async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM exercises ORDER BY name'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Add exercise to workout
    router.post('/workouts/:workoutId/exercises', auth, async (req, res) => {
        const { workoutId } = req.params;
        const { exercise_id, sets, reps, weight, duration } = req.body;
        try {
            const result = await pool.query(
                `INSERT INTO workout_exercises 
                (workout_id, exercise_id, sets, reps, weight, duration)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [workoutId, exercise_id, sets, reps, weight, duration]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error adding exercise to workout:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get workout details
    router.get('/workouts/:workoutId', auth, async (req, res) => {
        const { workoutId } = req.params;
        try {
            const workoutResult = await pool.query(
                'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
                [workoutId, req.user.id]
            );

            if (workoutResult.rows.length === 0) {
                return res.status(404).json({ error: 'Workout not found' });
            }

            const exercisesResult = await pool.query(
                `SELECT we.*, e.name as exercise_name, e.description
                FROM workout_exercises we
                JOIN exercises e ON we.exercise_id = e.id
                WHERE we.workout_id = $1`,
                [workoutId]
            );

            res.json({
                ...workoutResult.rows[0],
                exercises: exercisesResult.rows
            });
        } catch (error) {
            console.error('Error fetching workout details:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Get fitness goals
    router.get('/goals', auth, async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM fitness_goals WHERE user_id = $1',
                [req.user.id]
            );
            res.json(result.rows[0] || {});
        } catch (error) {
            console.error('Error fetching fitness goals:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Set fitness goals
    router.post('/goals', auth, async (req, res) => {
        const { weekly_workouts, target_weight, target_date } = req.body;
        try {
            const result = await pool.query(
                `INSERT INTO fitness_goals 
                (user_id, weekly_workouts, target_weight, target_date)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id) DO UPDATE SET
                weekly_workouts = $2,
                target_weight = $3,
                target_date = $4,
                updated_at = CURRENT_TIMESTAMP
                RETURNING *`,
                [req.user.id, weekly_workouts, target_weight, target_date]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error setting fitness goals:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}; 