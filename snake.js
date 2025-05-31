const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const message = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const scoreDiv = document.getElementById('score');

const grid = 20;
let count = 0;
let snake, dx, dy, food, score, running, gameOver;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
    snake = [{ x: 160, y: 160 }];
    dx = grid;
    dy = 0;
    food = { x: getRandomInt(0, 20) * grid, y: getRandomInt(0, 20) * grid };
    score = 0;
    running = false;
    gameOver = false;
    scoreDiv.textContent = "";
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

function gameLoop() {
    if (!running) return;
    requestAnimationFrame(gameLoop);
    if (++count < 4) return;
    count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Check collision with food
    if (head.x === food.x && head.y === food.y) {
        score++;
        food.x = getRandomInt(0, 20) * grid;
        food.y = getRandomInt(0, 20) * grid;
    } else {
        snake.pop();
    }

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, grid-2, grid-2);

    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach((segment, i) => {
        ctx.fillRect(segment.x, segment.y, grid-2, grid-2);
        // Check self collision
        if (i !== 0 && segment.x === head.x && segment.y === head.y) {
            endGame();
        }
    });

    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        endGame();
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
