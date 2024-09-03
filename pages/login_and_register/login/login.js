document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-register__form');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = form.email.value.trim();
        const password = form.password.value.trim();
        const storedUser = localStorage.getItem(email);
        // const loggedInUser = localStorage.getItem('loggedInUser');

        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.password === password) {
                localStorage.setItem('loggedInUser', email);
                window.location.href = '../../film_catalogue/catalogue/catalogue.html'; 
            } else {
                alert('Incorrect password. Please try again.');
            }
        } else {
            alert('No account found with this email. Please register first.');
        }
    });
});
