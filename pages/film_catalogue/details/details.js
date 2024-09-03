document.addEventListener('DOMContentLoaded', async () => {
    const filmDetailsSection = document.getElementById('film-details');
    const commentSection = document.getElementById('comment-section');
    const backButton = document.querySelector('.back__button');
    const apiKey = '9821bb81';
    const defaultPoster = '../../../default_poster/default.jpeg';

    // Function to fetch film details from OMDB API
    async function fetchFilmDetails(title, year) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${apiKey}`);
            const film = await response.json();
            return film;
        } catch (error) {
            console.error('Error fetching film details:', error);
            return null;
        }
    }

    // Function to display film details
    function displayFilmDetails(film) {
        if (film && film.Response === "True") {
            filmDetailsSection.innerHTML = `
                <div class="film-details__left">
                    <img src="${film.Poster !== "N/A" ? film.Poster : defaultPoster}" alt="${film.Title} Poster">
                </div>
                <div class="film-details__right">
                    <h1>${film.Title}</h1>
                    <p><strong>Year:</strong> ${film.Year}</p>
                    <p><strong>Genre:</strong> ${film.Genre}</p>
                    <p><strong>Rating:</strong> ${film.imdbRating}</p>
                    <p><strong>Director:</strong> ${film.Director}</p>
                    <p><strong>Plot:</strong> ${film.Plot}</p>
                </div>
            `;
        } else {
            filmDetailsSection.innerHTML = `<p>Movie not found. Please try again.</p>`;
        }
    }

    // Function to display user-added film details
    function displayUserFilmDetails(userFilm) {
        filmDetailsSection.innerHTML = `
            <div class="film-details__left">
                <img src="${userFilm.poster || defaultPoster}" alt="${userFilm.title} Poster">
            </div>
            <div class="film-details__right">
                <h1>${userFilm.title}</h1>
                <p><strong>Year:</strong> ${userFilm.year}</p>
                <p><strong>Duration:</strong> ${userFilm.duration || 'N/A'}</p>
                <p><strong>Director:</strong> ${userFilm.director || 'N/A'}</p>
                <p><strong>Rating:</strong> ${userFilm.rating || 'N/A'}</p>
            </div>
        `;
    }

    // Function to display all comments for a film
    function displayComments(title, year) {
        const commentsKey = `comments_${title}_${year}`;
        const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
        const loggedInUser = localStorage.getItem('loggedInUser');

        let commentsHTML = '<h2>Comments</h2>';
        if (comments.length > 0) {
            comments.forEach((comment, index) => {
                const isAuthor = loggedInUser && loggedInUser.split('@')[0] === comment.author;
                commentsHTML += `
                    <div class="comment">
                        <p><strong>${comment.author}</strong> <em>${comment.date}</em></p>
                        <p>${comment.text}</p>
                    </div>
                `;
            });
        } else {
            commentsHTML += `<p>No comments yet. Be the first to comment!</p>`;
        }

        commentSection.innerHTML = commentsHTML;
    }

    // Function to add comment section only if last page was 'favourites'
    function addCommentSection(title, year) {
        const lastPage = sessionStorage.getItem('lastPage');
        if (lastPage === 'favourites') {
            const commentFormHTML = `
                <h2>Leave a Comment</h2>
                <textarea class="textarea--comment" id="comment-text" rows="4" maxlength="200" placeholder="Enter your comment here: "></textarea>
                <div class="button-wrapper"> 
                    <button class="button__action" id="submit-comment">Submit Comment</button>
                </div>
            `;
            commentSection.innerHTML += commentFormHTML;

            const submitCommentButton = document.getElementById('submit-comment');
            submitCommentButton.addEventListener('click', () => {
                // const loggedInUser = localStorage.getItem('loggedInUser');
                // if (!loggedInUser) {
                //     window.location.href = '../../login_and_register/login/login.html'; // Redirect to login page if not logged in
                //     return;
                // }

                const commentText = document.getElementById('comment-text').value;
                if (commentText.trim()) {
                    saveComment(title, year, commentText);
                    document.getElementById('comment-text').value = '';
                    displayComments(title, year);
                } else {
                    alert('Please enter a comment before submitting.');
                }
            });
        } else {
            commentSection.innerHTML += `<p>To add a comment, please visit this film from your "Favourites" page.</p>`;
        }
    }

    // Function to save the comment to localStorage
    function saveComment(title, year, text) {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const author = loggedInUser.split('@')[0]; // Get username from email
        const date = new Date().toLocaleString(); // Current date and time

        const commentsKey = `comments_${title}_${year}`;
        const comments = JSON.parse(localStorage.getItem(commentsKey)) || [];
        comments.push({ author, date, text });
        localStorage.setItem(commentsKey, JSON.stringify(comments));
        window.location.reload();
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const year = urlParams.get('year');

    // Check if the film is user-added
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userFilmKey = `${loggedInUser}_added_${title}_${year}`;
    const userFilm = JSON.parse(localStorage.getItem(userFilmKey));

    if (userFilm) {
        const omdbFilm = await fetchFilmDetails(title, year);

        // If the title and year match an OMDB film, use OMDB data; otherwise, use user-provided data
        if (omdbFilm && omdbFilm.Response === "True" && omdbFilm.Title.toLowerCase() === userFilm.title.toLowerCase() && omdbFilm.Year === userFilm.year.toString()) {
            displayFilmDetails(omdbFilm);
        } else {
            // Display user-provided film details and default poster if OMDb data mismatches
            displayUserFilmDetails({
                ...userFilm,
                poster: defaultPoster // Use default poster if OMDB data is not matching
            });
        }

        displayComments(userFilm.title, userFilm.year);
        addCommentSection(userFilm.title, userFilm.year);
    } else if (title && year) {
        const film = await fetchFilmDetails(title, year);
        displayFilmDetails(film);
        displayComments(title, year);
        addCommentSection(title, year);
    } else {
        filmDetailsSection.innerHTML = `<p>Invalid movie selection. Please go back and try again.</p>`;
    }

    // Set back button based on last visited page
    const lastPage = sessionStorage.getItem('lastPage');
    if (lastPage === 'favourites') {
        backButton.href = '../favourites/favourites.html';
    } else if (lastPage === 'watched') {
        backButton.href = '../watched/watched.html';
    } else {
        backButton.href = '../catalogue/catalogue.html'; // Default back button location
    }
});
