let currentIndex = 0;
const slides = document.querySelectorAll('.carousel-images img');
const indicators = document.querySelectorAll('.carousel-indicators span');

function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length; // Wrap around
    const offset = -currentIndex * 100; // Move to the current slide
    document.querySelector('.carousel-images').style.transform = `translateX(${offset}%)`;
    updateIndicators();
}

function updateIndicators() {
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

function moveSlide(direction) {
    showSlide(currentIndex + direction);
}

// Auto change slide every 5 seconds
setInterval(() => {
    moveSlide(1);
}, 5000);

// Menu functions
function toggleMenu() {
    const menuContent = document.querySelector('.menu-content');
    menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
}

/*filmes*/
const apiKey = '75d42cadadb7fc24f5778d5fd2f7a5ea'; // Substitua pela sua chave de API do TMDb
const recommendedMovies = {};
const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []; // Carrega os filmes favoritos do localStorage
const genres = {
    comedy: 35,
    drama: 18,
    action: 28,
    horror: 27,
    thriller: 53,
    romance: 10749,
    fantasy: 14,
    'sci-fi': 878
};

// Adiciona evento ao botão de recomendação
document.getElementById('recommend-button').addEventListener('click', () => {
    const genre = document.getElementById('genre-select').value;
    if (!genre) {
        alert('Por favor, selecione um gênero!');
        return;
    }
    recommendMovie(genres[genre]);
});

// Função para buscar filmes por gênero
async function fetchMovies(genreId) {
    let allMovies = [];
    for (let page = 1; page <= 15; page++) { // Busque por até 5 páginas
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=pt-BR`);
        const data = await response.json();
        allMovies = allMovies.concat(data.results);
    }

    // Mapeia os filmes para incluir sinopses
    return allMovies.map(movie => {
        return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview ? movie.overview : "", // Sinopse em português
            poster_path: movie.poster_path
        };
    });
}

// Função para recomendar um filme
async function recommendMovie(genreId) {
    if (!recommendedMovies[genreId]) {
        recommendedMovies[genreId] = await fetchMovies(genreId);
    }

    const movies = recommendedMovies[genreId];

    if (movies.length === 0) {
        document.getElementById('recommendation').innerHTML = 'Nenhum filme disponível para este gênero.';
        return;
    }

    const randomIndex = Math.floor(Math.random() * movies.length);
    const selectedMovie = movies[randomIndex];

    document.getElementById('recommendation').innerHTML = `
        <h2>Recomendação:</h2>
        <h3>${selectedMovie.title}</h3>
        <img src="https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}" alt="${selectedMovie.title}">
        <p>${selectedMovie.overview}</p>
        <button onclick="addToFavorites(${selectedMovie.id}, '${selectedMovie.title}', '${selectedMovie.poster_path}', '${selectedMovie.overview}')">💖 Adicionar aos Favoritos</button>
    `;

    // Remove o filme recomendado da lista
    movies.splice(randomIndex, 1);

    // Se não houver mais filmes para recomendar, avise o usuário
    if (movies.length === 0) {
        alert('Já recomendamos todos os filmes desse gênero!');
    }
}

// Função para adicionar filme aos favoritos
function addToFavorites(id, title, poster_path, overview) {
    const movieExists = favoriteMovies.some(movie => movie.id === id);
    if (movieExists) {
        alert('Este filme já está na sua lista de favoritos!');
        return;
    }

    const movie = { id, title, poster_path, overview };
    favoriteMovies.push(movie);
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
    
    displayFavorites(); // Atualiza a lista de favoritos imediatamente
    alert(`Filme "${title}" adicionado aos favoritos!`);
}

// Função para exibir os filmes favoritos
function displayFavorites() {
    const favoritesContainer = document.getElementById('favorites');
    favoritesContainer.innerHTML = ''; // Limpa o container antes de adicionar os favoritos

    if (favoriteMovies.length === 0) {
        favoritesContainer.innerHTML = '<p>Nenhum filme favorito adicionado ainda.</p>';
        return;
    }

    favoriteMovies.forEach(movie => {
        favoritesContainer.innerHTML += `
            <div class="favorite-movie">
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                <h4>${movie.title}</h4>
                <button onclick="removeFromFavorites(${movie.id})">❌ Remover dos Favoritos</button>
            </div>
        `;
    });
}

// Função para remover filme dos favoritos
function removeFromFavorites(id) {
    const index = favoriteMovies.findIndex(movie => movie.id === id);
    if (index > -1) {
        favoriteMovies.splice(index, 1);
        localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
        displayFavorites(); // Atualiza a lista de favoritos
        alert('Filme removido dos favoritos!');
    }
}

// Exibe os filmes favoritos ao carregar a página
displayFavorites();
