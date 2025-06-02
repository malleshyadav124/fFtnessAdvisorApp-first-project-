document.addEventListener('DOMContentLoaded', () => {
    const exerciseGrid = document.getElementById('exerciseGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const exerciseModal = document.getElementById('exerciseModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalVideo = document.getElementById('modalVideo');
    const modalDifficulty = document.getElementById('modalDifficulty');
    const modalDescription = document.getElementById('modalDescription');
    const modalSteps = document.getElementById('modalSteps');

    // Sample exercise data (in production, this would come from your database)
    const exercises = [
        {
            id: 1,
            title: 'Push-ups',
            category: 'strength',
            difficulty: 'beginner',
            videoUrl: '/videos/pushups.mp4',
            thumbnail: '/images/exercises/pushups.jpg',
            description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps.',
            steps: [
                'Start in a plank position with hands slightly wider than shoulders',
                'Lower your body until your chest nearly touches the floor',
                'Push back up to the starting position',
                'Keep your core engaged throughout the movement'
            ],
            duration: '5 minutes',
            calories: '50'
        },
        {
            id: 2,
            title: 'Jump Rope',
            category: 'cardio',
            difficulty: 'intermediate',
            videoUrl: '/videos/jumprope.mp4',
            thumbnail: '/images/exercises/jumprope.jpg',
            description: 'An effective cardio exercise that improves coordination and endurance.',
            steps: [
                'Hold the rope handles with your hands at hip level',
                'Jump just high enough to clear the rope',
                'Land softly on the balls of your feet',
                'Maintain a consistent rhythm'
            ],
            duration: '10 minutes',
            calories: '100'
        },
        // Add more exercises here
    ];

    // Function to create exercise card
    function createExerciseCard(exercise) {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `
            <video class="exercise-video" poster="${exercise.thumbnail}">
                <source src="${exercise.videoUrl}" type="video/mp4">
            </video>
            <div class="exercise-info">
                <h3 class="exercise-title">${exercise.title}</h3>
                <div class="exercise-difficulty difficulty-${exercise.difficulty}">
                    ${exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                </div>
                <p class="exercise-description">${exercise.description}</p>
                <div class="exercise-details">
                    <div class="exercise-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${exercise.duration}</span>
                    </div>
                    <div class="exercise-detail-item">
                        <i class="fas fa-fire"></i>
                        <span>${exercise.calories} cal</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => showExerciseDetails(exercise));
        return card;
    }

    // Function to show exercise details in modal
    function showExerciseDetails(exercise) {
        modalTitle.textContent = exercise.title;
        modalVideo.src = exercise.videoUrl;
        modalDifficulty.textContent = exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1);
        modalDifficulty.className = `exercise-difficulty difficulty-${exercise.difficulty}`;
        modalDescription.textContent = exercise.description;
        
        modalSteps.innerHTML = '';
        exercise.steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.className = 'modal-step';
            li.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-text">${step}</div>
            `;
            modalSteps.appendChild(li);
        });

        exerciseModal.style.display = 'block';
    }

    // Function to filter exercises
    function filterExercises(category) {
        exerciseGrid.innerHTML = '';
        const filteredExercises = category === 'all' 
            ? exercises 
            : exercises.filter(exercise => 
                exercise.category === category || 
                exercise.difficulty === category
            );
        
        filteredExercises.forEach(exercise => {
            exerciseGrid.appendChild(createExerciseCard(exercise));
        });
    }

    // Event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterExercises(button.dataset.filter);
        });
    });

    closeModal.addEventListener('click', () => {
        exerciseModal.style.display = 'none';
        modalVideo.pause();
    });

    window.addEventListener('click', (e) => {
        if (e.target === exerciseModal) {
            exerciseModal.style.display = 'none';
            modalVideo.pause();
        }
    });

    // Initialize with all exercises
    filterExercises('all');
}); 