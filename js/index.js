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
let growthPowerup = null; // Tracks the position of the growth power-up
let growthPowerupFrequency = 0.1; // 10% chance of appearing when food is eaten
let growthMultiplier = 3; // How many segments the snake grows


// DOM Elements
const board = document.getElementById('board');
const scoreBox = document.getElementById('scoreBox');
const hiscoreBox = document.getElementById('hiscoreBox');
const timerBox = document.getElementById('timerBox');
const livesBox = document.getElementById('livesBox');
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const themeBtn = document.getElementById('theme');
const gameOverScreen = document.getElementById('gameOverScreen');


// Hamburger menu toggle functionality
const hamburger = document.querySelector('.hamburger');
const actions = document.querySelector('.actions');

hamburger.addEventListener('click', () => {
    actions.classList.toggle('show'); // Toggle visibility of buttons
});

// High Score Handling
let hiscore = localStorage.getItem("hiscore") || 0;
hiscoreBox.textContent = "HiScore: " + hiscore;

// Timer Handling
let timerInterval = setInterval(updateTimer, 1000);

// Update the timer with the selected difficulty setting
function updateTimer() {
    if (!isPaused) {
        if (timer <= 0) {
            level++;
            score += 10; // Bonus for completing a level
            scoreBox.textContent = "Score: " + score;

            // Reset timer
            timer = currentSettings.timer;
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

// Difficulty Settings with Fixed Obstacles
let difficultySettings = {
    easy: {
        speed: 6,
        obstacleFrequency: 0.1, // 10% chance of obstacle generation
        obstacleCount: 2, // Fixed 2 obstacles for easy mode
        powerupFrequency: 0.2, // 20% chance of power-up generation
        timer: 900, // More time on easy mode
    },
    medium: {
        speed: 8,
        obstacleFrequency: 0.3, // 30% chance of obstacle generation
        obstacleCount: 4, // Fixed 4 obstacles for medium mode
        powerupFrequency: 0.3, // 30% chance of power-up generation
        timer: 600, // Standard time
    },
    hard: {
        speed: 10,
        obstacleFrequency: 0.5, // 50% chance of obstacle generation
        obstacleCount: 6, // Fixed 6 obstacles for hard mode
        powerupFrequency: 0.5, // 50% chance of power-up generation
        timer: 300, // Less time on hard mode
    }
};

// Set initial game settings to medium difficulty
let currentDifficulty = "medium";
let currentSettings = difficultySettings[currentDifficulty];

// Update game settings when difficulty changes
document.getElementById('difficulty').addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    currentSettings = difficultySettings[currentDifficulty];
    resetGameForNewDifficulty();
});

function generateGrowthPowerup() {
    let newPowerup;
    do {
        newPowerup = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
        };
    } while (
        snakeArr.some(seg => seg.x === newPowerup.x && seg.y === newPowerup.y) ||
        obstacles.some(obs => obs.x === newPowerup.x && obs.y === newPowerup.y) ||
        (food.x === newPowerup.x && food.y === newPowerup.y)
    );
    return newPowerup;
}


// Reset game for new difficulty
function resetGameForNewDifficulty() {
    speed = currentSettings.speed;
    timer = currentSettings.timer;
    score = 0;
    level = 1;
    snakeArr = [{ x: 10, y: 10 }];
    food = generateFood();
    obstacles = generateObstacles(level);  // Generate a fixed number of obstacles based on difficulty
    powerup = null;

    scoreBox.textContent = "Score: " + score;
    timerBox.textContent = "Time: " + timer + "s";
    updateLivesDisplay();

    renderBoard(); // Force render of game state when resetting game
    main(performance.now()); // Start the game loop
}

// Generate Obstacles based on the current difficulty
function generateObstacles(level) {
    let newObstacles = [];
    let obstacleCount = currentSettings.obstacleCount; // Get fixed obstacle count based on difficulty
    for (let i = 0; i < obstacleCount; i++) {
        newObstacles.push(generateFood()); // Generate obstacles at random positions
    }
    return newObstacles;
}

// Function to toggle theme
function toggleTheme() {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
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
    console.log("Lives updated:", lives);  // Debugging line
    livesBox.textContent = "Lives: " + lives;
}

function gameOver() {
    console.log("Game Over triggered");  // Debugging line
    gameOverScreen.style.display = 'flex';
    isPaused = true;
    window.removeEventListener('keydown', handleMovement);
    setTimeout(() => {
        restartGame();
    }, 2000);
}


// Main Game Function
function main(currentTime) {
    if (isPaused) return;
    window.requestAnimationFrame(main);
    if ((currentTime - lastPaintTime) / 1000 < 1 / speed) return;
    lastPaintTime = currentTime;
    gameEngine();
}

/// Game Engine
function gameEngine() {
    if (isCollide()) {
        lives--;
        updateLivesDisplay();
        
        if (lives === 0) {
            gameOver();
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

    // Move the snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = { ...snakeArr[i] };
    }
    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    renderBoard();
}

// Add Event Listener for Movement
document.addEventListener('keydown', handleMovement);

// Handle Snake Direction
function handleMovement(event) {
    // Prevent opposite direction from being pressed (e.g., if moving right, don't allow left)
    if (event.key === "ArrowUp" && inputDir.y !== 1) {
        inputDir = { x: 0, y: -1 };
    } else if (event.key === "ArrowDown" && inputDir.y !== -1) {
        inputDir = { x: 0, y: 1 };
    } else if (event.key === "ArrowLeft" && inputDir.x !== 1) {
        inputDir = { x: -1, y: 0 };
    } else if (event.key === "ArrowRight" && inputDir.x !== -1) {
        inputDir = { x: 1, y: 0 };
    }
}


// Function to display the Game Over screen
function gameOver() {
    // Display the Game Over screen
    gameOverScreen.style.display = 'flex';
    
    // Update the final score in the Game Over popup
    document.getElementById('finalScore').textContent = score;

    // Stop the game
    isPaused = true;

    // Disable key events
    window.removeEventListener('keydown', handleMovement);

    // Optional: Restart game after a delay
    setTimeout(() => {
        restartGame();
    }, 5000); // Restart after 5 seconds
}


// Game restart and reset function
function restartGame() {
    inputDir = { x: 0, y: 0 };
    score = 0;
    lives = 3;
    isPaused = false;
    timer = 600;
    level = 1;
    snakeArr = [{ x: 10, y: 10 }];
    food = generateFood();
    obstacles = generateObstacles(level);

    scoreBox.textContent = "Score: " + score;
    timerBox.textContent = "Time: " + timer + "s";
    updateLivesDisplay(); 
    renderBoard();

    gameOverScreen.style.display = 'none'; // Hide game over screen
    main(performance.now()); // Restart the game loop
}

// Generate a random position for the food (ensuring it doesn't overlap with the snake or obstacles)
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

// Function to render the game elements on the board
function renderBoard() {
    board.innerHTML = ''; // Clear the board before rendering again

    // Render Snake
    snakeArr.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y + 1;
        snakeElement.style.gridColumnStart = segment.x + 1;
        snakeElement.classList.add(index === 0 ? 'head' : 'snake'); // Make the head different
        board.appendChild(snakeElement);
    });

    // Render Food
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y + 1;
    foodElement.style.gridColumnStart = food.x + 1;
    foodElement.classList.add('food');
    board.appendChild(foodElement);

    // Render Obstacles
    obstacles.forEach((obs) => {
        const obstacleElement = document.createElement('div');
        obstacleElement.style.gridRowStart = obs.y + 1;
        obstacleElement.style.gridColumnStart = obs.x + 1;
        obstacleElement.classList.add('obstacle');
        board.appendChild(obstacleElement);
    });

    // Render Power-ups
    if (powerup) {
        const powerupElement = document.createElement('div');
        powerupElement.style.gridRowStart = powerup.y + 1;
        powerupElement.style.gridColumnStart = powerup.x + 1;
        powerupElement.classList.add('powerup');
        board.appendChild(powerupElement);
    }
}

// Variables for gesture detection
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const swipeThreshold = 50; // Minimum swipe distance to trigger movement

// Add touch event listeners for swipe gestures
board.addEventListener('touchstart', (event) => {
    // Get initial touch position
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, false);

board.addEventListener('touchmove', (event) => {
    // Prevent scrolling during touch move
    event.preventDefault();
}, false);

board.addEventListener('touchend', (event) => {
    // Get the end touch position
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;

    // Determine the swipe direction
    handleSwipeGesture();
}, false);

// Function to handle swipe gestures and set the snake's direction
function handleSwipeGesture() {
    let swipeDistanceX = touchEndX - touchStartX;
    let swipeDistanceY = touchEndY - touchStartY;

    if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) && Math.abs(swipeDistanceX) > swipeThreshold) {
        // Horizontal swipe
        if (swipeDistanceX > 0 && inputDir.x !== -1) {
            inputDir = { x: 1, y: 0 }; // Right
        } else if (swipeDistanceX < 0 && inputDir.x !== 1) {
            inputDir = { x: -1, y: 0 }; // Left
        }
    } else if (Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX) && Math.abs(swipeDistanceY) > swipeThreshold) {
        // Vertical swipe
        if (swipeDistanceY > 0 && inputDir.y !== -1) {
            inputDir = { x: 0, y: 1 }; // Down
        } else if (swipeDistanceY < 0 && inputDir.y !== 1) {
            inputDir = { x: 0, y: -1 }; // Up
        }
    }
}


// Initialize the game
main(performance.now());
