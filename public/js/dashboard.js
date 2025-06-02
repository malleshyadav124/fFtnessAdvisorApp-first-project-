document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Load user profile
        const profileResponse = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to load profile');
        }

        const userData = await profileResponse.json();
        updateProfileSection(userData);

        // Load daily summary
        const summaryResponse = await fetch('/api/diet/summary/daily', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!summaryResponse.ok) {
            throw new Error('Failed to load daily summary');
        }

        const summaryData = await summaryResponse.json();
        updateSummarySection(summaryData);

        // Load fitness goals
        const goalsResponse = await fetch('/api/fitness/goals', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!goalsResponse.ok) {
            throw new Error('Failed to load fitness goals');
        }

        const goalsData = await goalsResponse.json();
        updateGoalsSection(goalsData);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data. Please try again.');
    }
});

function updateProfileSection(userData) {
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-info">
                    <h2>${userData.name}</h2>
                    <p>Age: ${userData.age} years</p>
                    <p>Weight: ${userData.weight} kg</p>
                    <p>Height: ${userData.height} cm</p>
                    <p>BMI: ${userData.bmi}</p>
                </div>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <i class="fas fa-bullseye"></i>
                    <span>Goal: ${userData.goal}</span>
                </div>
            </div>
        `;
    }
}

function updateSummarySection(summaryData) {
    const summarySection = document.querySelector('.summary-section');
    if (summarySection) {
        const { meals, water, goals } = summaryData;
        summarySection.innerHTML = `
            <div class="summary-card">
                <h3>Today's Nutrition</h3>
                <div class="nutrition-stats">
                    <div class="stat">
                        <span class="label">Calories</span>
                        <span class="value">${meals.total_calories || 0} / ${goals.daily_calories || 0}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Protein</span>
                        <span class="value">${meals.total_protein || 0}g / ${goals.daily_protein || 0}g</span>
                    </div>
                    <div class="stat">
                        <span class="label">Carbs</span>
                        <span class="value">${meals.total_carbs || 0}g / ${goals.daily_carbs || 0}g</span>
                    </div>
                    <div class="stat">
                        <span class="label">Fat</span>
                        <span class="value">${meals.total_fat || 0}g / ${goals.daily_fat || 0}g</span>
                    </div>
                </div>
            </div>
            <div class="summary-card">
                <h3>Water Intake</h3>
                <div class="water-stats">
                    <div class="stat">
                        <span class="label">Today</span>
                        <span class="value">${water.total_water || 0}ml / ${goals.daily_water || 0}ml</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${((water.total_water || 0) / (goals.daily_water || 1)) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateGoalsSection(goalsData) {
    const goalsSection = document.querySelector('.goals-section');
    if (goalsSection) {
        goalsSection.innerHTML = `
            <div class="goals-card">
                <h3>Fitness Goals</h3>
                <div class="goals-stats">
                    <div class="stat">
                        <span class="label">Weekly Workouts</span>
                        <span class="value">${goalsData.weekly_workouts || 0}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Target Weight</span>
                        <span class="value">${goalsData.target_weight || 0} kg</span>
                    </div>
                    <div class="stat">
                        <span class="label">Target Date</span>
                        <span class="value">${goalsData.target_date ? new Date(goalsData.target_date).toLocaleDateString() : 'Not set'}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Navigation
document.querySelector('.nav-toggle').addEventListener('click', () => {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Logout
document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}); 