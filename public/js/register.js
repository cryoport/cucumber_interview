document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    
    // Check if user is already logged in
    const token = localStorage.getItem('userToken');
    if (token) {
        window.location.href = 'dashboard.html';
    }
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Basic validation
        if (!firstName.trim()) {
            errorMessage.textContent = 'First name is required';
            errorMessage.classList.add('visible');
            return;
        }
        
        if (!lastName.trim()) {
            errorMessage.textContent = 'Last name is required';
            errorMessage.classList.add('visible');
            return;
        }
        
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.classList.add('visible');
            return;
        }
        
        try {
            errorMessage.textContent = '';
            errorMessage.classList.remove('visible');
            
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    firstName, 
                    lastName, 
                    email, 
                    phone, 
                    password 
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            // Store user info in localStorage
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', `${firstName} ${lastName}`);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            errorMessage.textContent = error.message || 'Registration failed. Please try again.';
            errorMessage.classList.add('visible');
            console.error('Registration error:', error);
        }
    });
});
