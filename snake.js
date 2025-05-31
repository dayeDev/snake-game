const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const message = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const scoreDiv = document.getElementById('score');
const livesDiv = document.getElementById('lives');

const grid = 20;
let count = 0;
let snake, dx, dy, food, score, running, gameOver, lives;

// 컬러풀한 스네이크와 먹이
const snakeColors = ['#43c6ac', '#ff5e62', '#ffb347', '#fff176', '#6a82fb', '#fc5c7d'];
const foodColors = ['#ff1744', '#ff9100', '#00e676', '#2979ff', '#f50057'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function drawLives() {
    livesDiv.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        livesDiv.innerHTML += '<span class="life"></span>';
    }
}

function resetGame() {
    snake = [{ x: 160, y: 160 }];
    dx = grid;
    dy = 0;
    food = { x: getRandomInt(0, 20) * grid, y: getRandomInt(0, 20) * grid, color: foodColors[getRandomInt(0, foodColors.length)] };
    score = 0;
    running = false;
    gameOver = false;
    lives = 3;
    scoreDiv.textContent = "";
    drawLives();
}

function startGame() {
    resetGame();
    running = true;
    overlay.classList.add('hidden');
    gameLoop();
}

function endGame() {
    running = false;
    gameOver = true;
    message.textContent = `Game Over! Score: ${score}`;
    startBtn.textContent = "Restart";
    overlay.classList.remove('hidden');
}

function loseLife() {
    lives--;
    drawLives();
    if (lives > 0) {
        // 잠깐 멈췄다가 재시작
        setTimeout(() => {
            snake = [{ x: 160, y: 160 }];
            dx = grid;
            dy = 0;
            food = { x: getRandomInt(0, 20) * grid, y: getRandomInt(0, 20) * grid, color: foodColors[getRandomInt(0, foodColors.length)] };
            running = true;
            gameLoop();
        }, 800);
    } else {
        endGame();
    }
}

function gameLoop() {
    if (!running) return;
    requestAnimationFrame(gameLoop);
    if (++count < 4) return;
    count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy, color: snakeColors[score % snakeColors.length] };
    snake.unshift(head);

    // Check collision with food
    if (head.x === food.x && head.y === food.y) {
        score++;
        food.x = getRandomInt(0, 20) * grid;
        food.y = getRandomInt(0, 20) * grid;
        food.color = foodColors[getRandomInt(0, foodColors.length)];
    } else {
        snake.pop();
    }

    // Draw food (알록달록 원)
    ctx.beginPath();
    ctx.arc(food.x + grid/2, food.y + grid/2, grid/2-2, 0, 2 * Math.PI);
    ctx.fillStyle = food.color;
    ctx.shadowColor = '#fff176';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake (알록달록 원)
    snake.forEach((segment, i) => {
        ctx.beginPath();
        ctx.arc(segment.x + grid/2, segment.y + grid/2, grid/2-2, 0, 2 * Math.PI);
        ctx.fillStyle = snakeColors[i % snakeColors.length];
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Check self collision
        if (i !== 0 && segment.x === head.x && segment.y === head.y) {
            running = false;
            loseLife();
        }
    });

    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        running = false;
        loseLife();
    }

    // Draw score
    scoreDiv.textContent = `Score: ${score}`;
}

document.addEventListener('keydown', e => {
    if (!running) return;
    if (e.key === 'ArrowLeft' && dx === 0) {
        dx = -grid; dy = 0;
    } else if (e.key === 'ArrowUp' && dy === 0) {
        dx = 0; dy = -grid;
    } else if (e.key === 'ArrowRight' && dx === 0) {
        dx = grid; dy = 0;
    } else if (e.key === 'ArrowDown' && dy === 0) {
        dx = 0; dy = grid;
    }
});

startBtn.onclick = startGame;

// 초기화
resetGame();
