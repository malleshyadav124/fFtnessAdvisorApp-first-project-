document.addEventListener('DOMContentLoaded', () => {
    const foodGrid = document.getElementById('foodGrid');
    const foodSearch = document.getElementById('foodSearch');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const foodDetailsModal = document.getElementById('foodDetailsModal');
    const closeModal = document.getElementById('closeModal');
    const backToDashboard = document.getElementById('backToDashboard');

    // Sample food data (in production, this would come from your database)
    const foodData = [
        {
            id: 1,
            name: 'Oatmeal',
            category: 'breakfast',
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
            calories: 150,
            protein: 5,
            carbs: 27,
            fat: 3
        },
        {
            id: 2,
            name: 'Grilled Chicken',
            category: 'lunch',
            image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6
        },
        {
            id: 3,
            name: 'Salmon',
            category: 'dinner',
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
            calories: 208,
            protein: 22,
            carbs: 0,
            fat: 13
        },
        {
            id: 4,
            name: 'Greek Yogurt',
            category: 'snacks',
            image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
            calories: 100,
            protein: 10,
            carbs: 6,
            fat: 0
        }
    ];

    // Display food items
    function displayFoods(foods) {
        foodGrid.innerHTML = '';
        foods.forEach(food => {
            const foodCard = document.createElement('div');
            foodCard.className = 'food-card';
            foodCard.innerHTML = `
                <img src="${food.image}" alt="${food.name}" class="food-image">
                <h3 class="food-name">${food.name}</h3>
                <div class="nutrition-info">
                    <div class="nutrition-item">
                        <i class="fas fa-fire"></i>
                        <span>${food.calories} cal</span>
                    </div>
                    <div class="nutrition-item">
                        <i class="fas fa-drumstick-bite"></i>
                        <span>${food.protein}g protein</span>
                    </div>
                </div>
                <button class="add-to-meal-btn" onclick="showFoodDetails(${food.id})">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
            `;
            foodGrid.appendChild(foodCard);
        });
    }

    // Filter foods by category
    function filterFoods(category) {
        if (category === 'all') {
            return foodData;
        }
        return foodData.filter(food => food.category === category);
    }

    // Search foods
    function searchFoods(query) {
        return foodData.filter(food => 
            food.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Show food details in modal
    window.showFoodDetails = function(foodId) {
        const food = foodData.find(f => f.id === foodId);
        if (food) {
            document.getElementById('modalFoodName').textContent = food.name;
            document.getElementById('modalFoodImage').src = food.image;
            document.getElementById('modalCalories').textContent = food.calories;
            document.getElementById('modalProtein').textContent = food.protein;
            document.getElementById('modalCarbs').textContent = food.carbs;
            document.getElementById('modalFat').textContent = food.fat;
            foodDetailsModal.style.display = 'block';
        }
    };

    // Event Listeners
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;
            displayFoods(filterFoods(category));
        });
    });

    foodSearch.addEventListener('input', (e) => {
        const query = e.target.value;
        const filteredFoods = searchFoods(query);
        displayFoods(filteredFoods);
    });

    closeModal.addEventListener('click', () => {
        foodDetailsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === foodDetailsModal) {
            foodDetailsModal.style.display = 'none';
        }
    });

    backToDashboard.addEventListener('click', () => {
        window.location.href = '/dashboard';
    });

    // Initialize with all foods
    displayFoods(foodData);
}); 