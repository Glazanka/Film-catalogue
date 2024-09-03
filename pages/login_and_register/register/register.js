document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.login-register__form');

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = event.target.email.value.trim();
        const password = event.target.password.value.trim();
        const confirmPassword = event.target['confirm-password'].value.trim();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,64}$/;

        // Check if user already exists
        const existingUser = localStorage.getItem(email);
        if (existingUser) {
            alert('An account with this email already exists. Please use a different email.');
            return;
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            alert('Password must be 8-64 characters long and include at least one uppercase letter, one lowercase letter, and one special character.');
            return;
        }

        // Check if the password is too similar to the email
        const emailLocalPart = email.split('@')[0];
        if (password.toLowerCase().includes(emailLocalPart.toLowerCase())) {
            alert('Password should not be similar to your email address. Please choose a different password.');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        // Create the user object
        const user = {
            email: email,
            password: password
        };

        // Save the user object in localStorage
        localStorage.setItem(email, JSON.stringify(user));
        alert("Registration successfull. Now log in.");
        window.location.href = '../login/login.html';
    });
});
