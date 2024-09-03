document.addEventListener('DOMContentLoaded', () => {
    const filmList = document.getElementById('film-list');
    const userAddedSection = document.getElementById('user-added-films');
    const loggedInUser = localStorage.getItem('loggedInUser');
    const watchedFilmsButton = document.getElementById('watched-films-button');
    const favouriteFilmsButton = document.getElementById('favourite-films-button');
    let filmsData = []; // Store films data globally

    // Sorting buttons
    const sortAscButton = document.getElementById('sort-asc');
    const sortDescButton = document.getElementById('sort-desc');

    // Redirect based on login status
    watchedFilmsButton.addEventListener('click', () => {
        if (loggedInUser) {
            window.location.href = '../watched/watched.html';
        } else {
            window.location.href = "../../login_and_register/login/login.html";
        }
    });

    favouriteFilmsButton.addEventListener('click', () => {
        if (loggedInUser) {
            window.location.href = '../favourites/favourites.html';
        } else {
            window.location.href = "../../login_and_register/login/login.html";
        }
    });

    // Display authentication buttons or user info
    const authContainer = document.getElementById('auth-container');
    if (loggedInUser) {
        const userName = loggedInUser.split('@')[0];
        authContainer.innerHTML = `
            <span class="action-color bold user" id="user-name"><span class="white">User :</span> ${userName}</span>
            <button id="button--logout" class="button__action">Logout</button>
        `;
        document.getElementById('button--logout').addEventListener('click', handleLogout);
    } else {
        authContainer.innerHTML = `
            <a class="button__action" id="button--login" href="../../login_and_register/login/login.html">LOG IN</a>
            <a class="button__action" id="button--register" href="../../login_and_register/register/register.html">REGISTER</a>
        `;
    }

    // Fetch films from JSON file
    async function fetchFilms() {
        const response = await fetch('../movies.json');
        const films = await response.json();
        return films;
    }
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.querySelector('.nav--catalogue').classList.toggle('active');
    });

    // Fetch poster from OMDB
    async function fetchPoster(title, year) {
        const apiKey = '9821bb81'; // OMDB key
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${apiKey}`);
        const data = await response.json();

        // Return the poster if it exists and is valid, otherwise return the default poster
        return data.Poster !== 'N/A' && data.Poster ? data.Poster : 'default.jpeg';
    }

    // Get user-added films
    function getAllUserAddedFilms() {
        const allUserFilms = [];
        for (const key in localStorage) {
            if (key.includes('_added_')) {
                allUserFilms.push(JSON.parse(localStorage.getItem(key)));
            }
        }
        return allUserFilms;
    }

    // Sort films by title
    function sortFilms(order) {
        const sortedFilms = [...filmsData]; // Spread operator to clone the array
        sortedFilms.sort((a, b) => {
            if (order === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });
        displayFilms(sortedFilms);
    }

    // Display films
    async function displayFilms(films, isUserAddedSection = false) {
        const section = isUserAddedSection ? userAddedSection : filmList;
        section.innerHTML = ''; // Clear the list

        for (const film of films) {
            if (film.poster === 'N/A') {
                film.poster = await fetchPoster(film.title, film.year);
            }

            let isLiked = false;
            let isWatched = false;
            let canDelete = false;

            if (loggedInUser) {
                isLiked = localStorage.getItem(`${loggedInUser}_liked_${film.title}_${film.year}`) === 'true';
                isWatched = localStorage.getItem(`${loggedInUser}_watched_${film.title}_${film.year}`) === 'true';
                canDelete = film.addedBy === loggedInUser;
            }

            const filmCard = document.createElement('div');
            filmCard.classList.add('film-card');
            filmCard.innerHTML = `
                <div class="film-poster">
                    <img src="${film.poster}" alt="${film.title} Poster">
                    ${canDelete ? `<button class="button__delete" data-title="${film.title}" data-year="${film.year}"><i class="fas fa-trash"></i></button>` : ''}
                    <button class="button__like" data-title="${film.title}" data-year="${film.year}">
                        <i class="fa${isLiked ? 's' : 'r'} fa-heart"></i>
                    </button>
                </div>
                <div class="film-title-rating">
                    <h2 class="film-title">${film.title}</h2>
                    <p class="film-rating"><strong>Rating:</strong> ${film.rating}</p>
                </div>
                <div class="button__action-wrapper">
                    <button class="button__action-l button__more-info" data-title="${film.title}" data-year="${film.year}">More Info</button>
                    <button class="button__action-r button__watched" data-title="${film.title}" data-year="${film.year}">
                        ${isWatched ? 'Unwatch' : 'Mark as watched'}
                    </button>
                </div>
            `;
            section.appendChild(filmCard);
        }

        // Add event listeners after rendering the films
        section.querySelectorAll('.button__like').forEach(button => {
            button.addEventListener('click', handleLike);
        });

        section.querySelectorAll('.button__watched').forEach(button => {
            button.addEventListener('click', handleWatched);
        });

        section.querySelectorAll('.button__delete').forEach(button => {
            button.addEventListener('click', handleDelete);
        });

        section.querySelectorAll('.button__more-info').forEach(button => {
            button.addEventListener('click', handleMoreInfo);
        });

        if (isUserAddedSection) {
            const heading = document.createElement('h2');
            heading.textContent = 'Films Added by Users';
            heading.classList.add("user-films-heading")

            userAddedSection.insertBefore(heading, userAddedSection.firstChild);
        } else if (loggedInUser && !isUserAddedSection) {
            const addFilmButtonContainer = document.createElement('div');
            addFilmButtonContainer.id = 'button--add-film--container';
            addFilmButtonContainer.innerHTML = `
                <button class="button__action" id="button-add-film"> Add Film </button>    
            `
            section.appendChild(addFilmButtonContainer);
            const addFilmButton = document.querySelector('#button-add-film');
            addFilmButton.addEventListener('click', openAddFilmModal);
        }
    }

    // Open Add Film Modal
    function openAddFilmModal() {
        const modal = document.createElement('div');
        modal.id = 'add-film-modal';
        const currYear = new Date().getFullYear();
        modal.innerHTML = `
            <div class="modal-content">
                <span id="modal-close" class="modal-close">&times;</span>
                <h2>Add a New Film</h2>
                <form id="modal-add-film-form">
                    <label for="title">Title:</label>
                    <input type="text" id="modal-title" name="title" required>
                    <label for="duration">Duration:</label>
                    <input type="number" id="modal-duration" name="duration" required>
                    <label for="releaseYear">Release Year:</label>
                    <input type="number" id="modal-releaseYear" name="releaseYear" min=1888 max=${currYear} required>
                    <label for="director">Director:</label>
                    <input type="text" id="modal-director" name="director" required>
                    <label for="rating">Rating:</label>
                    <input min=1 max=10 type="number" id="modal-rating" name="rating" required>
                    <button type="submit" class="button__action">Add Film</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal on click of close button or outside the modal content
        document.getElementById('modal-close').addEventListener('click', closeAddFilmModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeAddFilmModal();
            }
        });

        // Handle form submission inside the modal
        document.getElementById('modal-add-film-form').addEventListener('submit', handleAddFilmFromModal);
    }

    // Close Add Film Modal
    function closeAddFilmModal() {
        const modal = document.getElementById('add-film-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }

    // Handle adding a film from the modal
    async function handleAddFilmFromModal(event) {
        event.preventDefault();

        const title = event.target.title.value.trim();
        const duration = event.target.duration.value.trim();
        const releaseYear = event.target.releaseYear.value.trim();
        const director = event.target.director.value.trim();
        const rating = event.target.rating.value.trim();
        const year = new Date(releaseYear).getFullYear();
        const poster = await fetchPoster(title, year);

        const userFilm = {
            title: title,
            year: year,
            poster: poster,
            duration: duration,
            releaseYear: releaseYear,
            director: director,
            rating: rating,
            addedBy: loggedInUser
        };

        const filmKey = `${loggedInUser}_added_${title}_${year}`;
        localStorage.setItem(filmKey, JSON.stringify(userFilm));

        displayFilms(getAllUserAddedFilms(), true);

        closeAddFilmModal();
    }

    // Handle user logout
    function handleLogout() {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('loggedInUser');
            window.location.reload(); // Refresh page on logout
        }
    }

    // Handle liking a film
    function handleLike(event) {
        const button = event.target.closest('.button__like');
        const title = button.getAttribute('data-title');
        const year = button.getAttribute('data-year');
        const key = `${loggedInUser}_liked_${title}_${year}`;
        const isLiked = localStorage.getItem(key) === 'true';

        if (!loggedInUser) {
            window.location.href = "../../login_and_register/login/login.html";
            return;
        }
        if (isLiked) {
            localStorage.removeItem(key);
            button.innerHTML = '<i class="far fa-heart"></i>';
        } else {
            localStorage.setItem(key, 'true');
            button.innerHTML = '<i class="fas fa-heart"></i>';
        }
    }

    // Handle marking a film as watched
    function handleWatched(event) {
        const button = event.target.closest('.button__watched');
        const title = button.getAttribute('data-title');
        const year = button.getAttribute('data-year');
        const key = `${loggedInUser}_watched_${title}_${year}`;
        const isWatched = localStorage.getItem(key) === 'true';
        if (!loggedInUser) {
            window.location.href = "../../login_and_register/login/login.html";
            return;
        }
        if (isWatched) {
            localStorage.removeItem(key);
            button.textContent = 'Mark as watched';
        } else {
            localStorage.setItem(key, 'true');
            button.textContent = 'Unwatch';
        }
    }

    // Handle deleting a film
    function handleDelete(event) {
        const button = event.target.closest('.button__delete');
        const title = button.getAttribute('data-title');
        const year = button.getAttribute('data-year');
        const key = `${loggedInUser}_added_${title}_${year}`;

        if (confirm('Are you sure you want to remove this film?')) {
            localStorage.removeItem(key);
            displayFilms(getAllUserAddedFilms(), true);
        }
    }

    // Handle "More Info" button click
    function handleMoreInfo(event) {
        const button = event.target.closest('.button__more-info');
        const title = button.getAttribute('data-title');
        const year = button.getAttribute('data-year');
        sessionStorage.setItem('lastPage', 'catalogue')

        // Redirect to details.html with query parameters for title and year
        window.location.href = `../details/details.html?title=${encodeURIComponent(title)}&year=${encodeURIComponent(year)}`;
    }

    // Main initialization function
    
    async function initialize() {
        filmsData = await fetchFilms();

        displayFilms(filmsData); // Display original films
        displayFilms(getAllUserAddedFilms(), true); // Display user-added films
    }

    // Sorting event listeners
    sortAscButton.addEventListener('click', () => sortFilms('asc'));
    sortDescButton.addEventListener('click', () => sortFilms('desc'));

    initialize();
});
