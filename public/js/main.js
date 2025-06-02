document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar functionality
    initSidebar();
    // Load user profile
    loadUserProfile();
    // Set up event listeners
    setupEventListeners();
});

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const currentPage = window.location.pathname.split('/')[1] || 'dashboard';

    // Set active page
    document.querySelectorAll('.sidebar-link').forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
        }
    });

    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
            sidebar.classList.add('collapsed');
        }
    });
}

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to load profile');
        }

        const userData = await response.json();
        updateUserProfile(userData);
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Handle error appropriately
    }
}

function updateUserProfile(userData) {
    const userNameElement = document.getElementById('sidebarUserName');
    if (userNameElement) {
        userNameElement.textContent = userData.name || 'User';
    }
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('data-page') !== 'logout') {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                navigateToPage(page);
            }
        });
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

function navigateToPage(page) {
    window.location.href = `/${page}`;
}

// Handle window resize
window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth > 768) {
        sidebar.classList.remove('collapsed');
    }
});

// Add token to all API requests
function addAuthHeader(headers = {}) {
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Update all fetch calls to include the token
async function makeAuthenticatedRequest(url, options = {}) {
    const headers = addAuthHeader(options.headers || {});
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
    }
    
    return response;
} 