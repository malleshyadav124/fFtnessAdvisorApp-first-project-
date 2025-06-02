document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load initial data
    await loadNutritionData();
    await loadWaterIntake();

    // Add event listeners
    document.getElementById('addMealForm').addEventListener('submit', handleAddMeal);
    document.getElementById('addWaterForm').addEventListener('submit', handleAddWater);
    document.getElementById('nutritionGoalsForm').addEventListener('submit', handleUpdateGoals);
});

async function loadNutritionData() {
    try {
        const response = await fetch('/api/diet/summary/daily', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load nutrition data');
        }

        const data = await response.json();
        updateNutritionDisplay(data);
    } catch (error) {
        console.error('Error loading nutrition data:', error);
        showError('Failed to load nutrition data');
    }
}

async function loadWaterIntake() {
    try {
        const response = await fetch('/api/diet/water/today', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load water intake');
        }

        const data = await response.json();
        updateWaterDisplay(data);
    } catch (error) {
        console.error('Error loading water intake:', error);
        showError('Failed to load water intake');
    }
}

function updateNutritionDisplay(data) {
    const { meals, goals } = data;
    const nutritionDisplay = document.querySelector('.nutrition-display');
    
    if (nutritionDisplay) {
        nutritionDisplay.innerHTML = `
            <div class="nutrition-card">
                <h3>Today's Nutrition</h3>
                <div class="nutrition-stats">
                    <div class="stat">
                        <span class="label">Calories</span>
                        <span class="value">${meals.total_calories || 0} / ${goals.daily_calories || 0}</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${((meals.total_calories || 0) / (goals.daily_calories || 1)) * 100}%"></div>
                        </div>
                    </div>
                    <div class="stat">
                        <span class="label">Protein</span>
                        <span class="value">${meals.total_protein || 0}g / ${goals.daily_protein || 0}g</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${((meals.total_protein || 0) / (goals.daily_protein || 1)) * 100}%"></div>
                        </div>
                    </div>
                    <div class="stat">
                        <span class="label">Carbs</span>
                        <span class="value">${meals.total_carbs || 0}g / ${goals.daily_carbs || 0}g</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${((meals.total_carbs || 0) / (goals.daily_carbs || 1)) * 100}%"></div>
                        </div>
                    </div>
                    <div class="stat">
                        <span class="label">Fat</span>
                        <span class="value">${meals.total_fat || 0}g / ${goals.daily_fat || 0}g</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${((meals.total_fat || 0) / (goals.daily_fat || 1)) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateWaterDisplay(data) {
    const waterDisplay = document.querySelector('.water-display');
    
    if (waterDisplay) {
        waterDisplay.innerHTML = `
            <div class="water-card">
                <h3>Water Intake</h3>
                <div class="water-stats">
                    <div class="stat">
                        <span class="label">Today</span>
                        <span class="value">${data.total_water || 0}ml</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${((data.total_water || 0) / 2000) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

async function handleAddMeal(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const mealData = {
        name: formData.get('foodName'),
        calories: parseInt(formData.get('calories')),
        protein: parseInt(formData.get('protein')),
        carbs: parseInt(formData.get('carbs')),
        fat: parseInt(formData.get('fat')),
        servingSize: parseInt(formData.get('servingSize')),
        servingUnit: formData.get('servingUnit'),
        type: formData.get('mealType')
    };

    try {
        const response = await fetch('/api/diet/meals', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mealData)
        });

        if (!response.ok) {
            throw new Error('Failed to add meal');
        }

        showSuccess('Meal added successfully');
        event.target.reset();
        await loadNutritionData();
    } catch (error) {
        console.error('Error adding meal:', error);
        showError('Failed to add meal');
    }
}

async function handleAddWater(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const waterData = {
        amount: parseInt(formData.get('amount'))
    };

    try {
        const response = await fetch('/api/diet/water', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(waterData)
        });

        if (!response.ok) {
            throw new Error('Failed to add water intake');
        }

        showSuccess('Water intake added successfully');
        event.target.reset();
        await loadWaterIntake();
    } catch (error) {
        console.error('Error adding water intake:', error);
        showError('Failed to add water intake');
    }
}

async function handleUpdateGoals(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const goalsData = {
        calories: parseInt(formData.get('calories')),
        protein: parseInt(formData.get('protein')),
        carbs: parseInt(formData.get('carbs')),
        fat: parseInt(formData.get('fat')),
        waterGoal: parseInt(formData.get('waterGoal'))
    };

    try {
        const response = await fetch('/api/diet/goals', {
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
        await loadNutritionData();
    } catch (error) {
        console.error('Error updating goals:', error);
        showError('Failed to update goals');
    }
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

async function searchFood() {
    const query = document.getElementById('foodInput').value;
    if (!query) return;

    try {
        const response = await fetch(`https://api.nutritionix.com/v1_1/search/${query}?results=0:10&fields=item_name,brand_name,nf_calories,nf_total_fat,nf_protein,nf_total_carbohydrate&appId=YOUR_APP_ID&appKey=YOUR_APP_KEY`);
        const data = await response.json();
        
        const resultsContainer = document.getElementById('foodResults');
        resultsContainer.innerHTML = '';
        
        data.hits.forEach(hit => {
            const food = hit.fields;
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `
                <h3>${food.item_name}</h3>
                <p>Brand: ${food.brand_name || 'Generic'}</p>
                <p>Calories: ${food.nf_calories}</p>
                <p>Protein: ${food.nf_protein}g</p>
                <p>Carbs: ${food.nf_total_carbohydrate}g</p>
                <p>Fat: ${food.nf_total_fat}g</p>
                <button onclick="addToMeal('${food.item_name}', ${food.nf_calories})">Add to Meal</button>
            `;
            resultsContainer.appendChild(foodItem);
        });
    } catch (error) {
        console.error('Error searching food:', error);
        alert('Error searching for food. Please try again.');
    }
}

async function addToMeal(foodName, calories) {
    const mealType = document.getElementById('mealType').value;
    const quantity = document.getElementById('quantity').value;
    
    try {
        const response = await fetch('/api/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                foodName,
                calories: calories * quantity,
                mealType,
                quantity
            })
        });

        if (response.ok) {
            alert('Meal added successfully!');
            loadTodayMeals(JSON.parse(localStorage.getItem('userData')).id);
        } else {
            throw new Error('Failed to add meal');
        }
    } catch (error) {
        console.error('Error adding meal:', error);
        alert('Error adding meal. Please try again.');
    }
}

async function loadTodayMeals(userId) {
    try {
        const response = await fetch(`/api/meals/today/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const meals = await response.json();
        
        const mealsContainer = document.getElementById('todayMeals');
        mealsContainer.innerHTML = '';
        
        let totalCalories = 0;
        meals.forEach(meal => {
            totalCalories += meal.calories;
            const mealElement = document.createElement('div');
            mealElement.className = 'meal-item';
            mealElement.innerHTML = `
                <h3>${meal.mealType}</h3>
                <p>${meal.foodName} (${meal.quantity} servings)</p>
                <p>Calories: ${meal.calories}</p>
            `;
            mealsContainer.appendChild(mealElement);
        });
        
        document.getElementById('totalCalories').textContent = totalCalories;
    } catch (error) {
        console.error('Error loading meals:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    window.location.href = '/login.html';
} 