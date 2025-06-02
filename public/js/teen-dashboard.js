document.addEventListener('DOMContentLoaded', () => {
    // Handle resource button clicks
    const resourceButtons = document.querySelectorAll('.resource-btn');
    resourceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const resourceTitle = button.parentElement.querySelector('h3').textContent;
            showResourceContent(resourceTitle);
        });
    });
});

function showResourceContent(title) {
    let content = '';
    
    switch(title) {
        case 'Nutrition Guide':
            content = `
                <h3>Teen Nutrition Guide</h3>
                <ul>
                    <li>Eat a balanced diet with plenty of fruits and vegetables</li>
                    <li>Include lean proteins like chicken, fish, and beans</li>
                    <li>Choose whole grains over refined grains</li>
                    <li>Stay hydrated with water (aim for 8 glasses daily)</li>
                    <li>Limit sugary drinks and processed foods</li>
                </ul>
            `;
            break;
            
        case 'Exercise Tips':
            content = `
                <h3>Teen Exercise Guide</h3>
                <ul>
                    <li>Get at least 60 minutes of physical activity daily</li>
                    <li>Include both cardio and strength training</li>
                    <li>Try team sports or group activities</li>
                    <li>Start with proper warm-up and cool-down</li>
                    <li>Listen to your body and rest when needed</li>
                </ul>
            `;
            break;
            
        case 'Mental Health':
            content = `
                <h3>Teen Mental Health Resources</h3>
                <ul>
                    <li>Practice stress management techniques</li>
                    <li>Maintain a regular sleep schedule</li>
                    <li>Stay connected with friends and family</li>
                    <li>Consider talking to a counselor if needed</li>
                    <li>Take breaks from social media</li>
                </ul>
            `;
            break;
            
        case 'Sleep Guide':
            content = `
                <h3>Teen Sleep Guide</h3>
                <ul>
                    <li>Aim for 8-10 hours of sleep per night</li>
                    <li>Maintain a consistent sleep schedule</li>
                    <li>Create a relaxing bedtime routine</li>
                    <li>Keep your bedroom cool and dark</li>
                    <li>Avoid screens 1 hour before bed</li>
                </ul>
            `;
            break;
    }
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'resource-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle close button
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Add modal styles
const style = document.createElement('style');
style.textContent = `
    .resource-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        position: relative;
    }
    
    .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    
    .modal-content h3 {
        color: #2c3e50;
        margin-bottom: 20px;
    }
    
    .modal-content ul {
        list-style-type: none;
        padding: 0;
    }
    
    .modal-content li {
        margin-bottom: 10px;
        padding-left: 20px;
        position: relative;
    }
    
    .modal-content li:before {
        content: "•";
        color: #00b894;
        position: absolute;
        left: 0;
    }
`;
document.head.appendChild(style); 