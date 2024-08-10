let timeRemaining = 0;
let attempts = 0;
let score = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let pokemonUrls = []
let timerInterval = null;

const timerElement = document.getElementById('timer');
const gameContainer = document.getElementById('game-container');

function startTimer(duration) {
	timeRemaining = duration;
	timerElement.textContent = `Tiempo: ${ timeRemaining }s`;

	timerInterval = setInterval(() => {
		timeRemaining--;
		timerElement.textContent = `Tiempo: ${ timeRemaining }s`;

		if (timeRemaining <= 0) {
			clearInterval(timerInterval);
			disableAllCards();
			alert('¡Tiempo agotado! Inténtalo de nuevo.');
		}
	}, 1000);
}

function stopTimer() {
	if (!timerInterval) return
	console.log('Timer Interval: ', timerInterval);

	clearInterval(timerInterval);
}

function calculateScore() {
    score = (timeRemaining * 10) - (attempts * 5);
    if (score < 0) score = 0;
    return score;
}

async function fetchPokemon() {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon`);
    const data = await response.json();
    return data.results.map(pokemon => pokemon.url);
}

async function getPokemonImage(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data.sprites.front_default;
}

function getRandomSubArray(arr, max) {
	// Mezclar el array original
	const shuffledArray = arr.sort(() => 0.5 - Math.random());

	// Obtener los primeros `maxRecords` elementos del array mezclado
	return shuffledArray.slice(0, max);
}

async function setupGame(numPairs) {
    gameContainer.innerHTML = '';


		console.log('TOTAL: ', pokemonUrls.length);
		console.log('TOTAL: ', pokemonUrls);

		const imgUrls = getRandomSubArray(pokemonUrls, numPairs * 2);
    const pokemonImages = await Promise.all(imgUrls.map(url => getPokemonImage(url)));

    const cardSet = [...pokemonImages, ...pokemonImages];
    cardSet.sort(() => Math.random() - 0.5);

    gameContainer.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(numPairs * 2))}, 100px)`;
    gameContainer.style.gridTemplateRows = `repeat(${Math.ceil(Math.sqrt(numPairs * 2))}, 100px)`;

    cardSet.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = `url(${image})`;
        card.addEventListener('click', revealCard);
        gameContainer.appendChild(card);
    });

    const currentCards = document.querySelectorAll('.card').length;
    for (let i = currentCards; i < Math.pow(Math.ceil(Math.sqrt(numPairs * 2)), 2); i++) {
        const emptyCard = document.createElement('div');
        emptyCard.classList.add('card');
        gameContainer.appendChild(emptyCard);
    }
}

function checkForMatch() {
    attempts++;
    if (firstCard.dataset.image === secondCard.dataset.image) {
        firstCard.removeEventListener('click', revealCard);
        secondCard.removeEventListener('click', revealCard);
        resetBoard();
        checkAllCardsRevealed();
    } else {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('revealed');
            secondCard.classList.remove('revealed');
            resetBoard();
        }, 1000);
    }
}

function revealCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('revealed');
    this.style.setProperty('--background-image', this.dataset.image);

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function disableAllCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('disabled');
        card.removeEventListener('click', revealCard);
    });
}

function shuffleCards() {
	fetchPokemon().then(urls => {pokemonUrls = urls})

	const cards = Array.from(document.querySelectorAll('.card'));
	const shuffledCards = cards.sort(() => Math.random() - 0.5);

	gameContainer.innerHTML = '';
	shuffledCards.forEach(card => gameContainer.appendChild(card));

}

function checkAllCardsRevealed() {
    const allRevealed = Array.from(document.querySelectorAll('.card')).every(card => card.classList.contains('revealed'));
    if (allRevealed) {
        stopTimer();

				const finalScore = calculateScore();

				disableAllCards();
        showFireworks();

        setTimeout(() => {
					stopFireworks();
					alert(`¡Felicidades! Has completado el juego con una puntuación de ${finalScore} puntos en ${attempts} intentos.`);
        }, 5000);
    }
}

function showFireworks() {
    const fireworksContainer = document.getElementById('fireworks');

    const fireworks = new Fireworks.default(fireworksContainer, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 50,
        trace: 3,
        traceSpeed: 10,
        explosion: 5,
        intensity: 30,
        flickering: 50,
        lineStyle: 'round',
        hue: {
            min: 0,
            max: 360
        },
        delay: {
            min: 30,
            max: 60
        },
        rocketsPoint: {
            min: 50,
            max: 50
        },
        lineWidth: {
            explosion: {
                min: 1,
                max: 3
            },
            trace: {
                min: 1,
                max: 2
            }
        },
        brightness: {
            min: 50,
            max: 80
        },
        decay: {
            min: 0.015,
            max: 0.03
        },
        mouse: {
            click: false,
            move: false,
            max: 1
        },
        sound: {
            enable: true,
            files: [
                'explosion0.mp3',
                'explosion1.mp3',
                'explosion2.mp3'
            ],
            volume: {
                min: 4,
                max: 8
            }
        }
    });

    fireworks.start();
}

// Función para detener los fuegos artificiales
function stopFireworks() {
	const fireworksContainer = document.getElementById('fireworks');
	if (fireworksContainer.fireworks) {
		fireworksContainer.fireworks.stop();
		fireworksContainer.innerHTML = ''; // Limpiar el contenedor de fuegos artificiales
	}
}

function startGame() {

	const difficulty = document.getElementById('difficulty').value;
	let numPairs;
	let timeLimit;

	switch (difficulty) {
		case 'beginner':
			numPairs = 4;
			timeLimit = 60; // 1 minuto
			break;
		case 'basic':
			numPairs = 8;
			timeLimit = 120; // 2 minutos
			break;
		case 'intermediate':
			numPairs = 12;
			timeLimit = 180; // 3 minutos
			break;
		case 'advanced':
			numPairs = 16;
			timeLimit = 300; // 5 minutos
			break;
		default:
			numPairs = 8;
			timeLimit = 120; // 2 minutos
	}

	attempts = 0;
	score = 0;

	stopTimer();

	setupGame(numPairs);
	shuffleCards();
	startTimer(timeLimit);
}

window.addEventListener('load', shuffleCards);