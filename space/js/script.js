const gameContainer = document.getElementById('game-container');
const spaceship = document.getElementById('spaceship');
const startButton = document.getElementById('start-button');
const scoreDisplay = document.getElementById('score');
let spaceshipPosition = gameContainer.clientWidth / 2 - spaceship.clientWidth / 2;
let projectiles = [];
let aliens = [];
let alienSpeed = 1;
let gameInterval;
let score = 0;

document.addEventListener('keydown', moveSpaceship);
document.addEventListener('keydown', shootProjectile);
startButton.addEventListener('click', startGame);

function moveSpaceship(event) {
    if (event.key === 'ArrowLeft' && spaceshipPosition > 0) {
        spaceshipPosition -= 10;
    } else if (event.key === 'ArrowRight' && spaceshipPosition < gameContainer.clientWidth - spaceship.clientWidth) {
        spaceshipPosition += 10;
    }
    spaceship.style.left = `${spaceshipPosition}px`;
}

function shootProjectile(event) {
    if (event.key === ' ') {
        const projectile = document.createElement('div');
        projectile.classList.add('projectile');
        projectile.style.left = `${spaceshipPosition + spaceship.clientWidth / 2 - 2.5}px`;
        projectile.style.bottom = '70px';
        gameContainer.appendChild(projectile);
        projectiles.push(projectile);
    }
}

function createAliens() {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 11; j++) {
            const alien = document.createElement('div');
            alien.classList.add('alien');
            alien.style.left = `${j * 50 + 10}px`;
            alien.style.top = `${i * 50 + 10}px`;
            gameContainer.appendChild(alien);
            aliens.push(alien);
        }
    }
}

function moveAliens() {
    aliens.forEach(alien => {
        let top = parseInt(alien.style.top);
        alien.style.top = `${top + alienSpeed}px`;
        if (top + alien.clientHeight >= gameContainer.clientHeight) {
            clearInterval(gameInterval);
            alert('Game Over');
            resetGame();
        }
    });
}

function moveProjectiles() {
    projectiles.forEach((projectile, index) => {
        let bottom = parseInt(projectile.style.bottom);
        projectile.style.bottom = `${bottom + 5}px`;
        if (bottom > gameContainer.clientHeight) {
            projectile.remove();
            projectiles.splice(index, 1);
        }
    });
}

function checkCollisions() {
    projectiles.forEach((projectile, pIndex) => {
        aliens.forEach((alien, aIndex) => {
            if (isColliding(projectile, alien)) {
                alien.remove();
                projectile.remove();
                aliens.splice(aIndex, 1);
                projectiles.splice(pIndex, 1);
                updateScore();
            }
        });
    });
}

function isColliding(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
        aRect.top > bRect.bottom ||
        aRect.bottom < bRect.top ||
        aRect.right < bRect.left ||
        aRect.left > bRect.right
    );
}

function gameLoop() {
    moveAliens();
    moveProjectiles();
    checkCollisions();
    if (aliens.length === 0) {
        clearInterval(gameInterval);
        alert('You Win!');
        resetGame();
    }
}

function startGame() {
    resetGame();
    createAliens();
    gameInterval = setInterval(gameLoop, 100);
}

function resetGame() {
    clearInterval(gameInterval);
    aliens.forEach(alien => alien.remove());
    projectiles.forEach(projectile => projectile.remove());
    aliens = [];
    projectiles = [];
    score = 0;
    scoreDisplay.textContent = score;
}

function updateScore() {
    score += 10;
    scoreDisplay.textContent = score;
}