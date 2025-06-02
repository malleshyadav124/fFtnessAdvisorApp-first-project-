document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load initial data
    await loadWorkouts();
    await loadExercises();
    await loadFitnessGoals();

    // Add event listeners
    document.getElementById('addWorkoutForm').addEventListener('submit', handleAddWorkout);
    document.getElementById('addExerciseForm').addEventListener('submit', handleAddExercise);
    document.getElementById('fitnessGoalsForm').addEventListener('submit', handleUpdateGoals);
});

async function loadWorkouts() {
    try {
        const response = await fetch('/api/fitness/workouts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load workouts');
        }

        const workouts = await response.json();
        updateWorkoutsDisplay(workouts);
    } catch (error) {
        console.error('Error loading workouts:', error);
        showError('Failed to load workouts');
    }
}

async function loadExercises() {
    try {
        const response = await fetch('/api/fitness/exercises', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load exercises');
        }

        const exercises = await response.json();
        updateExercisesDisplay(exercises);
    } catch (error) {
        console.error('Error loading exercises:', error);
        showError('Failed to load exercises');
    }
}

async function loadFitnessGoals() {
    try {
        const response = await fetch('/api/fitness/goals', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load fitness goals');
        }

        const goals = await response.json();
        updateGoalsDisplay(goals);
    } catch (error) {
        console.error('Error loading fitness goals:', error);
        showError('Failed to load fitness goals');
    }
}

function updateWorkoutsDisplay(workouts) {
    const workoutsDisplay = document.querySelector('.workouts-display');
    
    if (workoutsDisplay) {
        if (workouts.length === 0) {
            workoutsDisplay.innerHTML = '<p class="no-data">No workouts recorded yet</p>';
            return;
        }

        const workoutsHTML = workouts.map(workout => `
            <div class="workout-card">
                <div class="workout-header">
                    <h3>${workout.type}</h3>
                    <span class="date">${new Date(workout.created_at).toLocaleDateString()}</span>
                </div>
                <div class="workout-details">
                    <div class="stat">
                        <span class="label">Duration</span>
                        <span class="value">${workout.duration} minutes</span>
                    </div>
                    <div class="stat">
                        <span class="label">Calories Burned</span>
                        <span class="value">${workout.calories_burned} kcal</span>
                    </div>
                </div>
                ${workout.notes ? `<p class="notes">${workout.notes}</p>` : ''}
                <div class="exercises-list">
                    ${workout.exercises ? workout.exercises.map(exercise => `
                        <div class="exercise-item">
                            <span class="name">${exercise.exercise_name}</span>
                            <span class="details">${exercise.sets} sets × ${exercise.reps} reps</span>
                            ${exercise.weight ? `<span class="weight">${exercise.weight} kg</span>` : ''}
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `).join('');

        workoutsDisplay.innerHTML = workoutsHTML;
    }
}

function updateExercisesDisplay(exercises) {
    const exercisesDisplay = document.querySelector('.exercises-display');
    
    if (exercisesDisplay) {
        const exercisesHTML = exercises.map(exercise => `
            <div class="exercise-card">
                <h3>${exercise.name}</h3>
                <p class="description">${exercise.description}</p>
                <div class="exercise-details">
                    <span class="category">${exercise.category}</span>
                    <span class="difficulty">${exercise.difficulty}</span>
                </div>
                <button class="add-to-workout" data-exercise-id="${exercise.id}">
                    Add to Workout
                </button>
            </div>
        `).join('');

        exercisesDisplay.innerHTML = exercisesHTML;

        // Add event listeners to "Add to Workout" buttons
        document.querySelectorAll('.add-to-workout').forEach(button => {
            button.addEventListener('click', () => {
                const exerciseId = button.dataset.exerciseId;
                showAddExerciseForm(exerciseId);
            });
        });
    }
}

function updateGoalsDisplay(goals) {
    const goalsDisplay = document.querySelector('.goals-display');
    
    if (goalsDisplay) {
        goalsDisplay.innerHTML = `
            <div class="goals-card">
                <h3>Fitness Goals</h3>
                <div class="goals-stats">
                    <div class="stat">
                        <span class="label">Weekly Workouts</span>
                        <span class="value">${goals.weekly_workouts || 0}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Target Weight</span>
                        <span class="value">${goals.target_weight || 0} kg</span>
                    </div>
                    <div class="stat">
                        <span class="label">Target Date</span>
                        <span class="value">${goals.target_date ? new Date(goals.target_date).toLocaleDateString() : 'Not set'}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

async function handleAddWorkout(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const workoutData = {
        type: formData.get('type'),
        duration: parseInt(formData.get('duration')),
        calories_burned: parseInt(formData.get('calories_burned')),
        notes: formData.get('notes')
    };

    try {
        const response = await fetch('/api/fitness/workouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workoutData)
        });

        if (!response.ok) {
            throw new Error('Failed to add workout');
        }

        showSuccess('Workout added successfully');
        event.target.reset();
        await loadWorkouts();
    } catch (error) {
        console.error('Error adding workout:', error);
        showError('Failed to add workout');
    }
}

async function handleAddExercise(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const exerciseData = {
        workout_id: formData.get('workout_id'),
        exercise_id: formData.get('exercise_id'),
        sets: parseInt(formData.get('sets')),
        reps: parseInt(formData.get('reps')),
        weight: parseInt(formData.get('weight')),
        duration: parseInt(formData.get('duration'))
    };

    try {
        const response = await fetch(`/api/fitness/workouts/${exerciseData.workout_id}/exercises`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        });

        if (!response.ok) {
            throw new Error('Failed to add exercise');
        }

        showSuccess('Exercise added successfully');
        event.target.reset();
        await loadWorkouts();
    } catch (error) {
        console.error('Error adding exercise:', error);
        showError('Failed to add exercise');
    }
}

async function handleUpdateGoals(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const goalsData = {
        weekly_workouts: parseInt(formData.get('weekly_workouts')),
        target_weight: parseFloat(formData.get('target_weight')),
        target_date: formData.get('target_date')
    };

    try {
        const response = await fetch('/api/fitness/goals', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalsData)
        });

        if (!response.ok) {
            throw new Error('Failed to update goals');
        }

        showSuccess('Goals updated successfully');
        event.target.reset();
        await loadFitnessGoals();
    } catch (error) {
        console.error('Error updating goals:', error);
        showError('Failed to update goals');
    }
}

function showAddExerciseForm(exerciseId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add Exercise to Workout</h3>
            <form id="addExerciseForm">
                <input type="hidden" name="exercise_id" value="${exerciseId}">
                <div class="form-group">
                    <label for="sets">Sets</label>
                    <input type="number" id="sets" name="sets" required min="1">
                </div>
                <div class="form-group">
                    <label for="reps">Reps</label>
                    <input type="number" id="reps" name="reps" required min="1">
                </div>
                <div class="form-group">
                    <label for="weight">Weight (kg)</label>
                    <input type="number" id="weight" name="weight" min="0" step="0.5">
                </div>
                <div class="form-group">
                    <label for="duration">Duration (minutes)</label>
                    <input type="number" id="duration" name="duration" min="0">
                </div>
                <div class="form-actions">
                    <button type="submit">Add Exercise</button>
                    <button type="button" onclick="this.closest('.modal').remove()">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
} 