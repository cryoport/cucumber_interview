document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    // Check if user is already logged in
    const token = localStorage.getItem('userToken');
    if (token) {
        window.location.href = 'dashboard.html';
    }
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            errorMessage.textContent = '';
            errorMessage.classList.remove('visible');
            
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store token in localStorage
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userEmail', email);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            errorMessage.textContent = 'Invalid email or password';
            errorMessage.classList.add('visible');
            console.error('Login error:', error);
        }
    });
});
