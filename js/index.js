// Game Variables
let inputDir = { x: 0, y: 0 };
let speed = 8;
let score = 0;
let lives = 3;
let isPaused = false;
let lastPaintTime = 0;
let snakeArr = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let powerup = null;
let obstacles = [{ x: 8, y: 8 }, { x: 12, y: 14 }];
let currentTheme = "light";
let timer = 60; // Timer countdown in seconds
let level = 1; // Level system

// DOM Elements
const board = document.getElementById('board');
const scoreBox = document.getElementById('scoreBox');
const hiscoreBox = document.getElementById('hiscoreBox');
const timerBox = document.getElementById('timerBox');
const livesBox = document.getElementById('livesBox');
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const themeBtn = document.getElementById('theme');

// High Score Handling
let hiscore = localStorage.getItem("hiscore") || 0;
hiscoreBox.textContent = "HiScore: " + hiscore;

// Timer Handling
let timerInterval = setInterval(updateTimer, 1000);
function updateTimer() {
    if (!isPaused) {
        if (timer <= 0) {
            level++;
            score += 10; // Bonus for completing a level
            scoreBox.textContent = "Score: " + score;

            // Generate new obstacles for the next level
            generateObstacles(level);

            // Reset timer
            timer = 60;
            timerBox.textContent = "Time: " + timer + "s";

            // Increase speed for higher difficulty
            speed++;

            // Reset snake and food positions
            snakeArr = [{ x: 10, y: 10 }];
            inputDir = { x: 0, y: 0 };
            food = generateFood();
        } else {
            timer--;
            timerBox.textContent = "Time: " + timer + "s";
        }
    }
}

// Function to toggle pause
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume" : "Pause";
    if (!isPaused) main(performance.now()); // Resume game
}

// Event listeners for buttons
document.getElementById('pause').addEventListener('click', togglePause);
document.getElementById('restart').addEventListener('click', restartGame);
document.getElementById('theme').addEventListener('click', toggleTheme);

// Function to toggle pause
function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pause');
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
    if (!isPaused) {
        main(performance.now()); // Resume game if it's paused
    }
}

// Function to restart the game
function restartGame() {
    inputDir = { x: 0, y: 0 };
    speed = 8;
    score = 0;
    lives = 3; // Reset lives
    isPaused = false;
    timer = 600;// Reset timer
    level = 1; // Reset level
    snakeArr = [{ x: 10, y: 10 }]; // Reset snake
    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }; // Reset food
    obstacles = [{ x: 8, y: 8 }, { x: 12, y: 14 }]; // Reset obstacles
    powerup = null; // Reset power-ups

    scoreBox.textContent = "Score: " + score; // Update score display
    timerBox.textContent = "Time: " + timer + "s"; // Update timer display
    updateLivesDisplay(); // Update lives display

    main(performance.now()); // Restart game loop
}

// Function to toggle theme
function toggleTheme() {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    document.body.classList.toggle("dark");
    document.getElementById('theme').textContent = currentTheme === "light" ? "Dark Theme" : "Light Theme";
}



// Collision Check
function isCollide() {
    for (let i = 1; i < snakeArr.length; i++) {
        if (snakeArr[i].x === snakeArr[0].x && snakeArr[i].y === snakeArr[0].y) return true;
    }

    if (snakeArr[0].x < 0 || snakeArr[0].y < 0 || snakeArr[0].x >= 20 || snakeArr[0].y >= 20) return true;

    for (let obs of obstacles) {
        if (snakeArr[0].x === obs.x && snakeArr[0].y === obs.y) return true;
    }
    return false;
}

function updateLivesDisplay() {
    livesBox.textContent = "Lives: " + lives;
}

// Main Game Function
function main(currentTime) {
    if (isPaused) return;
    window.requestAnimationFrame(main);
    if ((currentTime - lastPaintTime) / 1000 < 1 / speed) return;
    lastPaintTime = currentTime;
    gameEngine();
}

// Game Engine
function gameEngine() {
    if (isCollide()) {
        lives--;
        updateLivesDisplay();
        if (lives === 0) {
            alert("Game Over! Your Score: " + score);
            location.reload();
        }
        snakeArr = [{ x: 10, y: 10 }];
        inputDir = { x: 0, y: 0 };
        return;
    }

    if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
        score++;
        scoreBox.textContent = "Score: " + score;

        if (score > hiscore) {
            hiscore = score;
            localStorage.setItem("hiscore", hiscore);
            hiscoreBox.textContent = "HiScore: " + hiscore;
        }

        food = generateFood();
        snakeArr.unshift({ ...snakeArr[0] });

        if (score % 5 === 0) {
            speed++;
            powerup = generateFood();
        }

        if (score % 10 === 0) {
            level++;
            generateObstacles(level);
        }
    }

    if (powerup && snakeArr[0].x === powerup.x && snakeArr[0].y === powerup.y) {
        powerup = null;
        score += 5;
        scoreBox.textContent = "Score: " + score;
    }

    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = { ...snakeArr[i] };
    }
    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    renderBoard();
}

// Render Game Elements
function renderBoard() {
    board.innerHTML = '';

    snakeArr.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y + 1;
        snakeElement.style.gridColumnStart = segment.x + 1;
        snakeElement.classList.add(index === 0 ? 'head' : 'snake');
        board.appendChild(snakeElement);
    });

    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y + 1;
    foodElement.style.gridColumnStart = food.x + 1;
    foodElement.classList.add('food');
    board.appendChild(foodElement);

    if (powerup) {
        const powerupElement = document.createElement('div');
        powerupElement.style.gridRowStart = powerup.y + 1;
        powerupElement.style.gridColumnStart = powerup.x + 1;
        powerupElement.classList.add('powerup');
        board.appendChild(powerupElement);
    }

    obstacles.forEach(obs => {
        const obsElement = document.createElement('div');
        obsElement.style.gridRowStart = obs.y + 1;
        obsElement.style.gridColumnStart = obs.x + 1;
        obsElement.classList.add('obstacle');
        board.appendChild(obsElement);
    });
}

// Obstacle Generation
function generateObstacles(level) {
    let newObstacles = [];
    for (let i = 0; i < level; i++) {
        newObstacles.push(generateFood());
    }
    return newObstacles;
}

// Generate Random Food
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
        };
    } while (
        snakeArr.some(seg => seg.x === newFood.x && seg.y === newFood.y) ||
        obstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y)
    );
    return newFood;
}

// Event Listeners for Controls
window.addEventListener('keydown', e => {
    if (isPaused) return;
    switch (e.key) {
        case 'ArrowUp': inputDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': inputDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': inputDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': inputDir = { x: 1, y: 0 }; break;
    }
});

// Gesture Variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Add event listeners for touch gestures
board.addEventListener('touchstart', handleTouchStart, false);
board.addEventListener('touchmove', handleTouchMove, false);
board.addEventListener('touchend', handleTouchEnd, false);

// Touch start event
function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

// Touch move event (optional for live feedback, not used here)
function handleTouchMove(e) {
    const touch = e.touches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
}

// Touch end event
function handleTouchEnd() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && inputDir.x !== -1) {
            inputDir = { x: 1, y: 0 }; // Swipe right
        } else if (deltaX < 0 && inputDir.x !== 1) {
            inputDir = { x: -1, y: 0 }; // Swipe left
        }
    } else {
        // Vertical swipe
        if (deltaY > 0 && inputDir.y !== -1) {
            inputDir = { x: 0, y: 1 }; // Swipe down
        } else if (deltaY < 0 && inputDir.y !== 1) {
            inputDir = { x: 0, y: -1 }; // Swipe up
        }
    }

    // Reset touch coordinates
    touchStartX = touchStartY = touchEndX = touchEndY = 0;
}


// Start Game
window.requestAnimationFrame(main);
