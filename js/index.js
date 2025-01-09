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

// Function to restart the game
function restartGame() {
    inputDir = { x: 0, y: 0 };
    speed = 8;
    score = 0;
    lives = 3; // Reset lives
    isPaused = false;
    timer = 600; // Reset timer
    level = 1; // Reset level
    snakeArr = [{ x: 10, y: 10 }]; // Reset snake
    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }; // Reset food
    obstacles = [{ x: 8, y: 8 }, { x: 12, y: 14 }]; // Reset obstacles
    powerup = null; // Reset power-ups

    scoreBox.textContent = "Score: " + score; // Update score display
    timerBox.textContent = "Time: " + timer + "s"; // Update timer display
    updateLivesDisplay(); // Update lives display

    renderBoard(); // Force render of game state when restarting
    main(performance.now()); // Restart game loop
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
    obstacles.forEach(obs => {
        const obsElement = document.createElement('div');
        obsElement.style.gridRowStart = obs.y + 1;
        obsElement.style.gridColumnStart = obs.x + 1;
        obsElement.classList.add('obstacle');
        board.appendChild(obsElement);
    });
}

// Game restart and reset function
function restartGame() {
    inputDir = { x: 0, y: 0 }; // Reset direction
    score = 0; // Reset score
    lives = 3; // Reset lives
    timer = 600; // Reset timer
    level = 1; // Reset level
    snakeArr = [{ x: 10, y: 10 }]; // Reset snake position
    food = generateFood(); // Generate new food
    obstacles = generateObstacles(level); // Generate obstacles
    scoreBox.textContent = "Score: " + score;
    timerBox.textContent = "Time: " + timer + "s";
    updateLivesDisplay(); // Update lives display
    renderBoard(); // Render the board with initial game state
    main(performance.now()); // Start the game loop
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

// Function to generate obstacles based on the level
function generateObstacles(level) {
    let newObstacles = [];
    let obstacleCount = 2 * level; // Increase obstacles with each level
    for (let i = 0; i < obstacleCount; i++) {
        newObstacles.push(generateFood());
    }
    return newObstacles;
}

// Update the display of the lives
function updateLivesDisplay() {
    livesBox.textContent = "Lives: " + lives;
}

// Event listeners for user control (e.g., arrow keys for movement)
window.addEventListener('keydown', e => {
    if (isPaused) return; // Prevent movement if game is paused
    switch (e.key) {
        case 'ArrowUp': inputDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': inputDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': inputDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': inputDir = { x: 1, y: 0 }; break;
    }
});

let touchStartX = 0;
let touchStartY = 0;

// Track touch start position
window.addEventListener('touchstart', (e) => {
    // Get touch start position
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

// Track touch end position and detect swipe direction
window.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    // Check for swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
            inputDir = { x: 1, y: 0 }; // Right
        } else {
            inputDir = { x: -1, y: 0 }; // Left
        }
    } else {
        // Vertical swipe
        if (diffY > 0) {
            inputDir = { x: 0, y: 1 }; // Down
        } else {
            inputDir = { x: 0, y: -1 }; // Up
        }
    }
});


// Game start logic
restartGame();
