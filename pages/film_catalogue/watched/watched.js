document.addEventListener('DOMContentLoaded', () => {
    const watchedFilmList = document.getElementById('watched-film-list');
    const loggedInUser = localStorage.getItem('loggedInUser');

    async function fetchFilms() {
        const response = await fetch('../movies.json');
        const films = await response.json();
        return films;
    }

    async function fetchPoster(title, year) {
        const apiKey = '9821bb81'; // OMDB API key
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${apiKey}`);
        const data = await response.json();
        return data.Poster;
    }

    async function getUserAddedFilms() {
        const userFilms = [];
        for (const key in localStorage) {
            if (key.startsWith(`${loggedInUser}_added_`)) {
                userFilms.push(JSON.parse(localStorage.getItem(key)));
            }
        }
        return userFilms;
    }

    async function displayWatchedFilms(films) {
        watchedFilmList.innerHTML = '';
        for (const film of films) {
            if (film.poster === 'N/A') {
                film.poster = await fetchPoster(film.title, film.year);
            }

            const isLiked = localStorage.getItem(`${loggedInUser}_liked_${film.title}_${film.year}`) === 'true';

            const filmCard = document.createElement('div');
            filmCard.classList.add('film-card');
            filmCard.innerHTML = `
                <div class="film-poster">
                    <img src="${film.poster}" alt="${film.title} Poster">
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
                        Unwatch
                    </button>
                </div>
            `;
            watchedFilmList.appendChild(filmCard);
        }
    }


    async function loadWatchedFilms() {
        const films = await fetchFilms();
        const userAddedFilms = await getUserAddedFilms();

        // Filter watched films from both user-added and fetched films
        const watchedFilms = [
            ...films.filter(film => localStorage.getItem(`${loggedInUser}_watched_${film.title}_${film.year}`) === 'true'),
            ...userAddedFilms.filter(film => localStorage.getItem(`${loggedInUser}_watched_${film.title}_${film.year}`) === 'true')
        ];

        if (watchedFilms.length > 0) {
            await displayWatchedFilms(watchedFilms);
        } else {
            watchedFilmList.innerHTML = '<h1 class="error-message">No films have been marked as watched!</h1>';
        }
    }

    function redirectToDetailsPage(title, year) {
        const encodedTitle = encodeURIComponent(title);
        const encodedYear = encodeURIComponent(year);
        sessionStorage.setItem('lastPage', 'watched');
        window.location.href = `../details/details.html?title=${encodedTitle}&year=${encodedYear}`;
    }

    watchedFilmList.addEventListener('click', (event) => {
        const target = event.target;

        // Like Button
        if (target.closest('.button__like')) {
            const likeButton = target.closest('.button__like');
            const title = likeButton.dataset.title;
            const year = likeButton.dataset.year;
            const isLiked = localStorage.getItem(`${loggedInUser}_liked_${title}_${year}`) === 'true';

            if (isLiked) {
                localStorage.setItem(`${loggedInUser}_liked_${title}_${year}`, 'false');
                likeButton.querySelector('i').classList.replace('fas', 'far');
            } else {
                localStorage.setItem(`${loggedInUser}_liked_${title}_${year}`, 'true');
                likeButton.querySelector('i').classList.replace('far', 'fas');
            }
        }

        // Unwatch Button
        if (target.closest('.button__watched')) {
            const watchButton = target.closest('.button__watched');
            const title = watchButton.dataset.title;
            const year = watchButton.dataset.year;
            localStorage.setItem(`${loggedInUser}_watched_${title}_${year}`, 'false');

            // Reload the watched films list
            loadWatchedFilms();
        }

        // More Info Button
        if (target.closest('.button__more-info')) {
            const infoButton = target.closest('.button__more-info');
            const title = infoButton.dataset.title;
            const year = infoButton.dataset.year;
            redirectToDetailsPage(title, year);
        }
    });

    // Initial load of watched films
    loadWatchedFilms();
});
