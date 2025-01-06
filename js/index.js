// Game Variables
let inputDir = {x: 0, y: 0};
let speed = 8;
let score = 0;
let lives = 3;
let isPaused = false;
let lastPaintTime = 0;
let snakeArr = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let powerup = null;
let obstacles = [{x: 8, y: 8}, {x: 12, y: 14}];
let currentTheme = "light";
let timer = 60; // Timer countdown
let level = 1;  // Level System
let isGhostMode = false; // Ghost Mode (no collision)
let powerupItem = null; // For power-ups (e.g. increase score)

// DOM Elements
const board = document.getElementById('board');
const scoreBox = document.getElementById('scoreBox');
const hiscoreBox = document.getElementById('hiscoreBox');
const timerBox = document.getElementById('timerBox');

// High Score Handling
let hiscore = localStorage.getItem("hiscore") || 0;
hiscoreBox.textContent = "HiScore: " + hiscore;

// Timer Handling
let timerInterval = setInterval(updateTimer, 1000);
function updateTimer() {
    if (timer <= 0) {
        clearInterval(timerInterval);
        alert("Time's Up! Game Over!");
        location.reload();
    } else {
        timer--;
        timerBox.textContent = "Time: " + timer + "s";
    }
}

// Theme Toggle
document.getElementById('theme').addEventListener('click', () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    document.body.classList.toggle("dark");
    board.classList.toggle("dark");
});

// Pause/Resume Functionality
document.getElementById('pause').addEventListener('click', () => {
    isPaused = !isPaused;
    if (!isPaused) {
        window.requestAnimationFrame(main);
    }
});

// Restart Functionality
document.getElementById('restart').addEventListener('click', () => {
    location.reload();
});

// Main Game Function
function main(currentTime) {
    if (isPaused) return;
    window.requestAnimationFrame(main);
    if ((currentTime - lastPaintTime) / 1000 < 1 / speed) return;
    lastPaintTime = currentTime;
    gameEngine();
}

// Collision Check
function isCollide() {
    for (let i = 1; i < snakeArr.length; i++) {
        if (snakeArr[i].x === snakeArr[0].x && snakeArr[i].y === snakeArr[0].y) return true;
    }
    if (
        snakeArr[0].x < 0 || 
        snakeArr[0].y < 0 || 
        snakeArr[0].x >= 20 || 
        snakeArr[0].y >= 20
    ) return true;

    for (let obs of obstacles) {
        if (snakeArr[0].x === obs.x && snakeArr[0].y === obs.y) return true;
    }
    return false;
}

// Game Engine
function gameEngine() {
    // Collision Handling
    if (isCollide()) {
        lives--;
        if (lives === 0) {
            alert("Game Over! Your Score: " + score);
            location.reload();
        }
        snakeArr = [{x: 10, y: 10}];
        inputDir = {x: 0, y: 0};
        return;
    }

    // Food Eaten
    if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
        score++;
        scoreBox.textContent = "Score: " + score;

        // Update High Score
        if (score > hiscore) {
            hiscore = score;
            localStorage.setItem("hiscore", hiscore);
            hiscoreBox.textContent = "HiScore: " + hiscore;
        }

        food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
        snakeArr.unshift({...snakeArr[0]});

        // Add Power-Up on milestones
        if (score % 5 === 0) {
            speed++;
            powerup = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
        }

        // Increase Level
        if (score % 10 === 0) {
            level++;
            generateObstacles(level);
        }
    }

    // Power-Up Eaten
    if (powerup && snakeArr[0].x === powerup.x && snakeArr[0].y === powerup.y) {
        powerup = null;
        score += 5; // Bonus Points
        scoreBox.textContent = "Score: " + score;
    }

    // Move Snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = {...snakeArr[i]};
    }
    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    renderBoard();
}

// Render Game Elements
function renderBoard() {
    board.innerHTML = '';

    // Snake
    snakeArr.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y + 1;
        snakeElement.style.gridColumnStart = segment.x + 1;
        snakeElement.classList.add(index === 0 ? 'head' : 'snake');
        board.appendChild(snakeElement);
    });

    // Food
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y + 1;
    foodElement.style.gridColumnStart = food.x + 1;
    foodElement.classList.add('food');
    board.appendChild(foodElement);

    // Power-Up
    if (powerup) {
        const powerupElement = document.createElement('div');
        powerupElement.style.gridRowStart = powerup.y + 1;
        powerupElement.style.gridColumnStart = powerup.x + 1;
        powerupElement.classList.add('powerup');
        board.appendChild(powerupElement);
    }

    // Obstacles
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
    obstacles = [];
    for (let i = 0; i < level; i++) {
        obstacles.push({
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
        });
    }
}

// Event Listeners for Controls
window.addEventListener('keydown', e => {
    if (isPaused) return;
    switch (e.key) {
        case 'ArrowUp': inputDir = {x: 0, y: -1}; break;
        case 'ArrowDown': inputDir = {x: 0, y: 1}; break;
        case 'ArrowLeft': inputDir = {x: -1, y: 0}; break;
        case 'ArrowRight': inputDir = {x: 1, y: 0}; break;
    }
});

// Touch Controls for Mobile
let startX, startY, endX, endY;

document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    handleSwipe();
});

function handleSwipe() {
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) inputDir = {x: 1, y: 0};
        else inputDir = {x: -1, y: 0};
    } else {
        // Vertical swipe
        if (diffY > 0) inputDir = {x: 0, y: 1};
        else inputDir = {x: 0, y: -1};
    }
}

// Prevent Default Scrolling on Touch
document.body.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});

// Start Game
window.requestAnimationFrame(main);