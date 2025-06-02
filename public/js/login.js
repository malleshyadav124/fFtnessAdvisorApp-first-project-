document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const gmail = document.getElementById('gmail').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gmail, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store the token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on user age
                if (data.user.age < 18) {
                    window.location.href = '/teen-dashboard';
                } else if (data.user.age >= 65) {
                    window.location.href = '/senior-dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });

    // Clear error message when user starts typing
    document.getElementById('gmail').addEventListener('input', () => {
        errorMessage.style.display = 'none';
    });
    document.getElementById('password').addEventListener('input', () => {
        errorMessage.style.display = 'none';
    });
});
