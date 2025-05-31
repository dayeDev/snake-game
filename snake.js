const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const message = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const scoreDiv = document.getElementById('score');
const livesDiv = document.getElementById('lives');

const grid = 20;
let count = 0;
let snake, dx, dy, food, score, running, gameOver, lives, cellFlash;

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
    livesDiv.innerHTML += `<span style="color:#fff; font-size:0.9em; margin-left:8px;">(${lives}/3)</span>`;
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
    cellFlash = 0;
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

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawApple(x, y, flash = false) {
    // 사과 몸통
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + grid/2, y + grid/2, grid/2-2, 0, 2 * Math.PI);
    ctx.fillStyle = flash ? '#ff5252' : '#ff1744';
    ctx.shadowColor = '#fff176';
    ctx.shadowBlur = flash ? 20 : 10;
    ctx.fill();
    // 사과 꼭지
    ctx.beginPath();
    ctx.moveTo(x + grid/2, y + grid/2 - 8);
    ctx.lineTo(x + grid/2, y + grid/2 - 14);
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 사과 잎
    ctx.beginPath();
    ctx.arc(x + grid/2 + 4, y + grid/2 - 13, 3, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#00e676';
    ctx.fill();
    ctx.restore();
}

function drawSnakeEye(head, dx, dy) {
    ctx.save();
    ctx.fillStyle = '#fff';
    let eyeOffsetX = dx === grid ? 6 : dx === -grid ? -6 : 0;
    let eyeOffsetY = dy === grid ? 6 : dy === -grid ? -6 : 0;
    // 두 눈 위치
    ctx.beginPath();
    ctx.arc(head.x + grid/2 + eyeOffsetX - 3, head.y + grid/2 + eyeOffsetY - 3, 2.2, 0, 2 * Math.PI);
    ctx.arc(head.x + grid/2 + eyeOffsetX + 3, head.y + grid/2 + eyeOffsetY - 3, 2.2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

function gameLoop() {
    if (!running) return;
    requestAnimationFrame(gameLoop);
    if (++count < 4) return;
    count = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy, color: snakeColors[score % snakeColors.length] };
    snake.unshift(head);

    // Check collision with food
    let ateFood = false;
    if (head.x === food.x && head.y === food.y) {
        score++;
        ateFood = true;
        food.x = getRandomInt(0, 20) * grid;
        food.y = getRandomInt(0, 20) * grid;
        food.color = foodColors[getRandomInt(0, foodColors.length)];
        cellFlash = 6;
    } else {
        snake.pop();
    }

    // Draw food (사과)
    drawApple(food.x, food.y, cellFlash > 0);
    if (cellFlash > 0) cellFlash--;

    // Draw snake (알록달록 원)
    snake.forEach((segment, i) => {
        ctx.beginPath();
        ctx.arc(segment.x + grid/2, segment.y + grid/2, grid/2-2, 0, 2 * Math.PI);
        ctx.fillStyle = snakeColors[i % snakeColors.length];
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    // Draw eyes on head
    drawSnakeEye(head, dx, dy);

    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            running = false;
            loseLife();
        }
    }

    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        running = false;
        loseLife();
    }

    // Draw score & lives (하단 우측)
    scoreDiv.innerHTML = `<span style="float:right;">목숨: ${lives}/3</span><span style="float:left;">Score: ${score}</span><div style="clear:both"></div>`;
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
