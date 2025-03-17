document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const menuScreen = document.getElementById('menu-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startBtn = document.getElementById('start-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const quitBtn = document.getElementById('quit-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const restartBtn = document.getElementById('restart-btn');
    const quitGameBtn = document.getElementById('quit-game-btn');
    const finalScoreDisplay = document.getElementById('final-score');
    const topScoresList = document.getElementById('top-scores');
    const leaderboardList = document.getElementById('leaderboard-list');
    const nameSaveScreen = document.getElementById('name-save-screen');
    const nameInput = document.getElementById('name-input');
    const nameOkBtn = document.getElementById('name-ok-btn');
    const scoreDisplay = document.getElementById('score-display');

    const dinoImg = new Image();
    dinoImg.src = 'assets/dino.png';
    const obstacleImg = new Image();
    obstacleImg.src = 'assets/obstacle.png';
    const powerupImg = new Image();
    powerupImg.src = 'assets/powerup.png';

    const jumpSound = new Audio('sounds/jump.wav');
    const powerupSound = new Audio('sounds/powerup.wav');
    const gameOverSound = new Audio('sounds/gameover.wav');

    let dino = { x: 175, y: 375, width: 50, height: 50 };
    let obstacles = [];
    let powerups = [];
    let mouseX = 175;
    let mouseY = 375;
    let score = 0;
    let gameSpeed = 5;
    let gameRunning = false;
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    canvas.width = 400;
    canvas.height = 800;

    function drawDino() {
        ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    function drawPowerups() {
        powerups.forEach(powerup => {
            ctx.drawImage(powerupImg, powerup.x, powerup.y, powerup.width, powerup.height);
        });
    }

    function updateDino() {
        dino.x = mouseX - dino.width / 2;
        dino.y = mouseY - dino.height / 2;
    }

    function updateObstacles() {
        obstacles.forEach(obstacle => {
            obstacle.y += gameSpeed;
        });
        obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);

        if (Math.random() < 0.02) {
            obstacles.push({
                x: Math.random() * (canvas.width - 50),
                y: -50,
                width: 50,
                height: 50
            });
        }
    }

    function updatePowerups() {
        powerups.forEach(powerup => {
            powerup.y += gameSpeed;
        });
        powerups = powerups.filter(powerup => powerup.y < canvas.height);

        if (Math.random() < 0.01 && powerups.length === 0) {
            powerups.push({
                x: Math.random() * (canvas.width - 30),
                y: -30,
                width: 30,
                height: 30
            });
        }
    }

    function checkCollisions() {
        obstacles.forEach(obstacle => {
            if (dino.x < obstacle.x + obstacle.width &&
                dino.x + dino.width > obstacle.x &&
                dino.y < obstacle.y + obstacle.height &&
                dino.y + dino.height > obstacle.y) {
                gameOver();
            }
        });

        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            if (dino.x < powerup.x + powerup.width &&
                dino.x + dino.width > powerup.x &&
                dino.y < powerup.y + powerup.height &&
                dino.y + dino.height > powerup.y) {
                powerups.splice(i, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                powerupSound.currentTime = 0;
                powerupSound.play();
            }
        }
    }

    function gameOver() {
        gameRunning = false;
        gameOverSound.play();
        canvas.style.display = 'none';
        nameSaveScreen.style.display = 'block';
    }

    function displayTopScores() {
        leaderboard.sort((a, b) => b.score - a.score);
        topScoresList.innerHTML = '';
        for (let i = 0; i < Math.min(5, leaderboard.length); i++) {
            const li = document.createElement('li');
            li.textContent = `${leaderboard[i].name}: ${leaderboard[i].score}`;
            topScoresList.appendChild(li);
        }
    }

    function displayLeaderboard() {
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboardList.innerHTML = '';
        for (let i = 0; i < leaderboard.length; i++) {
            const li = document.createElement('li');
            li.textContent = `${leaderboard[i].name}: ${leaderboard[i].score}`;
            leaderboardList.appendChild(li);
        }
    }

    function saveScore(playerName) {
        if (playerName) {
            leaderboard.push({ name: playerName, score: score });
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
            displayTopScores();
        }
    }

    function gameLoop() {
        if (gameRunning) {
            scoreDisplay.style.display = 'block';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateDino();
            updateObstacles();
            updatePowerups();
            checkCollisions();
            drawDino();
            drawObstacles();
            drawPowerups();
            gameSpeed = 5 + score / 100;
            requestAnimationFrame(gameLoop);
        } else {
            scoreDisplay.style.display = 'none';
        }
    }

    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    startBtn.addEventListener('click', () => {
        menuScreen.style.display = 'none';
        canvas.style.display = 'block';
        gameRunning = true;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gameSpeed = 5;
        obstacles = [];
        powerups = [];
        gameLoop();
    });

    leaderboardBtn.addEventListener('click', () => {
        menuScreen.style.display = 'none';
        leaderboardScreen.style.display = 'block';
        displayLeaderboard();
    });

    quitBtn.addEventListener('click', () => {
        window.close();
    });

    backToMenuBtn.addEventListener('click', () => {
        leaderboardScreen.style.display = 'none';
        menuScreen.style.display = 'block';
    });
restartBtn.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        canvas.style.display = 'block';
        gameRunning = true;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gameSpeed = 5;
        obstacles = [];
        powerups = [];
        gameLoop();
    });

    quitGameBtn.addEventListener('click', () => {
        menuScreen.style.display = 'block';
        gameOverScreen.style.display = 'none';
    });

    nameOkBtn.addEventListener('click', () => {
        const playerName = nameInput.value.trim();
        saveScore(playerName);
        nameSaveScreen.style.display = 'none';
        gameOverScreen.style.display = 'block';
        finalScoreDisplay.textContent = score;
        displayTopScores();
    });
});