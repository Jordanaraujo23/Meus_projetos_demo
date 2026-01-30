const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const loginScreen = document.getElementById('login-screen');
const backBtn = document.getElementById('back-btn');
const ui = document.getElementById('game-ui');
const scoreSpan = document.getElementById('score');

let currentGame = null;
let gameLoop = null;
let score = 0;
let gameState = {};

// --- LOGIN LOGIC ---
function fakeLogin() {
    // Independente do que for preenchido, ele passa
    loginScreen.style.display = 'none';
    overlay.style.display = 'flex';
}

// --- CORE ENGINE ---
function updateScore(points) {
    score = points;
    scoreSpan.textContent = score;
}

function returnToMenu() {
    if (gameLoop) clearInterval(gameLoop);
    canvas.style.display = 'none';
    overlay.style.display = 'flex';
    backBtn.style.display = 'none';
    ui.style.display = 'none';
    currentGame = null;
    
    // Reset canvas transform and mouse events
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    window.onclick = null;
    window.onkeydown = null;
    canvas.onmousemove = null;
    canvas.onclick = null;
}

function startGame(gameId) {
    overlay.style.display = 'none';
    canvas.style.display = 'block';
    backBtn.style.display = 'block';
    ui.style.display = 'block';
    
    canvas.width = 800;
    canvas.height = 600;
    
    score = 0;
    updateScore(0);
    currentGame = gameId;
    
    if (gameLoop) clearInterval(gameLoop);
    
    // Clear input listeners which might be active from other games
    window.onclick = null;
    window.onkeydown = null;
    canvas.onmousemove = null;
    canvas.onclick = null;

    switch(gameId) {
        case 'snake': initSnake(); break;
        case 'race': initRace(); break;
        case 'invaders': initInvaders(); break;
        case 'pong': initPong(); break;
        case 'flappy': initFlappy(); break;
        case 'breakout': initBreakout(); break;
        case 'tetris': initTetris(); break;
        case 'dino': initDino(); break;
        case 'frogger': initFrogger(); break;
        case 'mines': initMines(); break;
    }
}

// --- GAME 1: SNAKE (ULTRA ENHANCED) ---
function initSnake() {
    const gridSize = 25;
    let snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 1, dy = 0;
    let particles = [];
    let frame = 0;
    
    function moveFood() {
        food.x = Math.floor(Math.random() * (canvas.width / gridSize));
        food.y = Math.floor(Math.random() * (canvas.height / gridSize));
    }

    window.onkeydown = (e) => {
        const keys = {ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0]};
        if(keys[e.key]) {
            const [newDx, newDy] = keys[e.key];
            if(newDx !== -dx || newDy !== -dy) { dx = newDx; dy = newDy; }
        }
    };

    gameLoop = setInterval(() => {
        frame++;
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        
        if (head.x < 0 || head.x >= canvas.width/gridSize || head.y < 0 || head.y >= canvas.height/gridSize || 
            snake.some(s => s.x === head.x && s.y === head.y)) {
            alert('GAME OVER! Score: ' + score);
            returnToMenu();
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            updateScore(score + 10);
            moveFood();
            for(let i=0; i<15; i++) particles.push({
                x: head.x * gridSize + gridSize/2, y: head.y * gridSize + gridSize/2,
                vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12,
                life: 30, color: '#00ffff'
            });
        } else {
            snake.pop();
        }

        // --- DRAWING ---
        // Dark metallic background
        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cyber Grid with perspective-like fade
        for(let x=0; x<canvas.width; x+=gridSize) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 + Math.sin(frame*0.05 + x)*0.02})`;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for(let y=0; y<canvas.height; y+=gridSize) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 + Math.cos(frame*0.05 + y)*0.02})`;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw Particles
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life/30;
            ctx.fillRect(p.x, p.y, 3, 3);
            if(p.life <= 0) particles.splice(i, 1);
        });
        ctx.globalAlpha = 1;

        // Draw Snake Body Trail
        snake.forEach((p, i) => {
            const isHead = i === 0;
            const progress = i / snake.length;
            
            // Neon Glow
            ctx.shadowBlur = isHead ? 30 : 15 - (progress * 10);
            ctx.shadowColor = isHead ? '#00ffff' : '#ff00ff';
            
            // Body Gradient
            const grad = ctx.createLinearGradient(p.x*gridSize, p.y*gridSize, (p.x+1)*gridSize, (p.y+1)*gridSize);
            if (isHead) {
                grad.addColorStop(0, '#00ffff'); grad.addColorStop(1, '#0088ff');
            } else {
                grad.addColorStop(0, `hsl(${180 + progress*100}, 100%, 50%)`);
                grad.addColorStop(1, `hsl(${200 + progress*100}, 100%, 30%)`);
            }
            
            ctx.fillStyle = grad;
            const size = gridSize - 4 - (progress * 8); // Tapers the tail
            const offset = (gridSize - size) / 2;
            
            ctx.beginPath();
            ctx.roundRect(p.x * gridSize + offset, p.y * gridSize + offset, size, size, isHead ? 10 : 5);
            ctx.fill();

            if(isHead) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'white';
                const eyeSize = 5;
                if(dx === 1) { ctx.fillRect(p.x*gridSize+18, p.y*gridSize+6, eyeSize, eyeSize); ctx.fillRect(p.x*gridSize+18, p.y*gridSize+14, eyeSize, eyeSize); }
                else if(dx === -1) { ctx.fillRect(p.x*gridSize+2, p.y*gridSize+6, eyeSize, eyeSize); ctx.fillRect(p.x*gridSize+2, p.y*gridSize+14, eyeSize, eyeSize); }
                else if(dy === -1) { ctx.fillRect(p.x*gridSize+6, p.y*gridSize+2, eyeSize, eyeSize); ctx.fillRect(p.x*gridSize+14, p.y*gridSize+2, eyeSize, eyeSize); }
                else { ctx.fillRect(p.x*gridSize+6, p.y*gridSize+18, eyeSize, eyeSize); ctx.fillRect(p.x*gridSize+14, p.y*gridSize+18, eyeSize, eyeSize); }
            }
        });

        // Draw Food (Energy Core)
        const pulse = Math.sin(frame * 0.2) * 4;
        ctx.shadowBlur = 20 + pulse;
        ctx.shadowColor = '#ff00ff';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, 6 + pulse/2, 0, Math.PI*2);
        ctx.fill();
        
        // Energy rings around food
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, 12 - pulse, 0, Math.PI*2);
        ctx.stroke();

        // Scanlines effect (Arcade feel)
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(18, 16, 16, 0.1)';
        for(let i=0; i<canvas.height; i+=4) ctx.fillRect(0, i, canvas.width, 1);
        
    }, 100);
}

// --- GAME 2: RACE ---
function initRace() {
    let carX = 400;
    let obstacles = [];
    let speed = 5;
    
    window.onkeydown = (e) => {
        if(e.key === 'ArrowLeft') carX -= 30;
        if(e.key === 'ArrowRight') carX += 30;
    };

    gameLoop = setInterval(() => {
        if (Math.random() < 0.05) obstacles.push({x: Math.random() * 700 + 50, y: -50});
        
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'white';
        ctx.setLineDash([20, 20]);
        ctx.beginPath(); ctx.moveTo(400, 0); ctx.lineTo(400, 600); ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        ctx.fillStyle = 'red';
        ctx.fillRect(carX, 500, 40, 60);

        ctx.fillStyle = 'yellow';
        obstacles.forEach((o, i) => {
            o.y += speed;
            ctx.fillRect(o.x, o.y, 40, 60);
            if (o.y > 500 && o.y < 560 && Math.abs(o.x - carX) < 40) {
                alert('CRASH! Score: ' + score);
                returnToMenu();
            }
            if (o.y > 600) {
                obstacles.splice(i, 1);
                updateScore(score + 1);
            }
        });
        speed += 0.001;
    }, 20);
}

// --- GAME 3: INVADERS ---
function initInvaders() {
    let px = 400;
    let bullets = [];
    let enemies = [];
    for(let i=0; i<8; i++) for(let j=0; j<4; j++) enemies.push({x: 100 + i*80, y: 50 + j*50, alive: true});

    window.onkeydown = (e) => {
        if(e.key === 'ArrowLeft') px -= 20;
        if(e.key === 'ArrowRight') px += 20;
        if(e.key === ' ') bullets.push({x: px + 15, y: 540});
    };

    gameLoop = setInterval(() => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0';
        ctx.fillRect(px, 550, 40, 20);

        bullets.forEach((b, i) => {
            b.y -= 10;
            ctx.fillStyle = 'white';
            ctx.fillRect(b.x, b.y, 5, 10);
            enemies.forEach(e => {
                if(e.alive && b.x > e.x && b.x < e.x+40 && b.y > e.y && b.y < e.y+30) {
                    e.alive = false;
                    bullets.splice(i, 1);
                    updateScore(score + 50);
                }
            });
        });

        ctx.fillStyle = 'red';
        enemies.forEach(e => {
            if(e.alive) ctx.fillRect(e.x, e.y, 40, 30);
        });
        
        if(enemies.every(e => !e.alive)) { alert('WINNER!'); returnToMenu(); }
    }, 30);
}

// --- GAME 4: TETRIS (Simplified) ---
function initTetris() {
    const COLS = 10, ROWS = 20, SIZE = 30;
    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let pos = {x: 3, y: 0};

    window.onkeydown = (e) => {
        if(e.key === 'ArrowLeft' && pos.x > 0) pos.x--;
        if(e.key === 'ArrowRight' && pos.x < COLS-4) pos.x++;
    };

    gameLoop = setInterval(() => {
        pos.y++;
        if (pos.y >= ROWS) {
            pos = {x: 3, y: 0};
            updateScore(score + 100);
        }

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(250, 0);
        
        ctx.strokeStyle = '#333';
        for(let r=0; r<ROWS; r++) for(let c=0; c<COLS; c++) ctx.strokeRect(c*SIZE, r*SIZE, SIZE, SIZE);

        ctx.fillStyle = 'cyan';
        for(let i=0; i<4; i++) ctx.fillRect((pos.x+i)*SIZE, pos.y*SIZE, SIZE-2, SIZE-2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }, 200);
}

// --- GAME 5: PONG ---
function initPong() {
    let py = 250, cy = 250;
    let bx = 400, by = 300, bdx = 5, bdy = 5;

    canvas.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        py = e.clientY - rect.top - 50;
    };

    gameLoop = setInterval(() => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        bx += bdx; by += bdy;
        if(by < 0 || by > 600) bdy *= -1;
        
        if(bx < 30 && by > py && by < py+100) bdx *= -1.1;
        if(bx > 770 && by > cy && by < cy+100) bdx *= -1.1;

        if(bx < 0 || bx > 800) { alert('FIM DE JOGO'); returnToMenu(); }

        cy += (by - (cy + 50)) * 0.1;

        ctx.fillStyle = 'white';
        ctx.fillRect(10, py, 20, 100);
        ctx.fillRect(770, cy, 20, 100);
        ctx.fillRect(bx, by, 10, 10);
        updateScore(score + 1);
    }, 1000/60);
}

// --- GAME 6: BREAKOUT ---
function initBreakout() {
    let paddleX = 350;
    let ball = {x: 400, y: 500, dx: 4, dy: -4};
    let bricks = [];
    for(let r=0; r<5; r++) for(let c=0; c<10; c++) bricks.push({x: 50+c*70, y: 50+r*30, active: true});

    canvas.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        paddleX = e.clientX - rect.left - 50;
    };

    gameLoop = setInterval(() => {
        ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ball.x += ball.dx; ball.y += ball.dy;
        if(ball.x < 0 || ball.x > 800) ball.dx *= -1;
        if(ball.y < 0) ball.dy *= -1;
        if(ball.y > 540 && ball.x > paddleX && ball.x < paddleX+100) ball.dy *= -1;
        if(ball.y > 600) { returnToMenu(); }

        ctx.fillStyle = 'orange';
        bricks.forEach(b => {
            if(b.active) {
                ctx.fillRect(b.x, b.y, 60, 20);
                if(ball.x > b.x && ball.x < b.x+60 && ball.y > b.y && ball.y < b.y+20) {
                    b.active = false; ball.dy *= -1; updateScore(score + 10);
                }
            }
        });

        ctx.fillStyle = 'white';
        ctx.fillRect(paddleX, 550, 100, 15);
        ctx.beginPath(); ctx.arc(ball.x, ball.y, 8, 0, Math.PI*2); ctx.fill();
    }, 1000/60);
}

// --- GAME 7: FLAPPY ---
function initFlappy() {
    let birdY = 300, velocity = 0;
    let pipes = [];
    
    window.onclick = () => velocity = -8;
    window.onkeydown = (e) => { if(e.key === ' ' || e.key === 'ArrowUp') velocity = -8; };

    gameLoop = setInterval(() => {
        ctx.fillStyle = 'skyblue'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        velocity += 0.4; birdY += velocity;
        if(birdY > 600 || birdY < 0) returnToMenu();

        if(Math.random() < 0.02) pipes.push({x: 800, h: Math.random()*300+100});

        ctx.fillStyle = 'green';
        pipes.forEach((p, i) => {
            p.x -= 5;
            ctx.fillRect(p.x, 0, 50, p.h);
            ctx.fillRect(p.x, p.h+150, 50, 600);
            
            if(p.x < 100 && p.x > 50 && (birdY < p.h || birdY > p.h+150)) returnToMenu();
            if(p.x === 50) updateScore(score + 1);
        });

        ctx.fillStyle = 'yellow';
        ctx.fillRect(50, birdY, 30, 30);
    }, 30);
}

// --- GAME 8: DINO RUN ---
function initDino() {
    let dy = 0, dv = 0, isJumping = false;
    let obs = [];

    window.onclick = window.onkeydown = () => { if(!isJumping) { dv = -15; isJumping = true; } };

    gameLoop = setInterval(() => {
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black'; ctx.fillRect(0, 500, 800, 2);

        dv += 1; dy += dv;
        if(dy > 0) { dy = 0; dv = 0; isJumping = false; }

        if(Math.random() < 0.03) obs.push({x: 800});

        ctx.fillStyle = 'red';
        obs.forEach(o => {
            o.x -= 8;
            ctx.fillRect(o.x, 460, 30, 40);
            if(o.x < 80 && o.x > 50 && dy > -40) returnToMenu();
        });
        
        ctx.fillStyle = 'black';
        ctx.fillRect(50, 460 + dy, 40, 40);
        updateScore(score + 1);
    }, 30);
}

// --- GAME 9: FROGGER ---
function initFrogger() {
    let frog = {x: 380, y: 550};
    let cars = [];
    for(let i=0; i<5; i++) cars.push({x: Math.random()*800, y: 100 + i*80, s: (Math.random()+1)*4});

    window.onkeydown = (e) => {
        if(e.key === 'ArrowUp') frog.y -= 40;
        if(e.key === 'ArrowDown') frog.y += 40;
        if(e.key === 'ArrowLeft') frog.x -= 40;
        if(e.key === 'ArrowRight') frog.x += 40;
    };

    gameLoop = setInterval(() => {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'green'; ctx.fillRect(0, 540, 800, 60); ctx.fillRect(0, 0, 800, 60);

        ctx.fillStyle = 'red';
        cars.forEach(c => {
            c.x += c.s; if(c.x > 800) c.x = -100;
            ctx.fillRect(c.x, c.y, 60, 30);
            if(frog.x < c.x+60 && frog.x+30 > c.x && frog.y < c.y+30 && frog.y+30 > c.y) returnToMenu();
        });

        ctx.fillStyle = 'lime';
        ctx.fillRect(frog.x, frog.y, 30, 30);
        if(frog.y < 50) { updateScore(score + 1000); frog = {x: 380, y: 550}; }
    }, 30);
}

// --- GAME 10: MINESWEEPER ---
function initMines() {
    const COLS=10, ROWS=10, SIZE=50;
    let grid = [];
    for(let i=0; i<COLS*ROWS; i++) grid.push({mine: Math.random()<0.15, open: false});

    canvas.onclick = (e) => {
        let rect = canvas.getBoundingClientRect();
        let x = Math.floor((e.clientX - rect.left - 150) / SIZE);
        let y = Math.floor((e.clientY - rect.top - 50) / SIZE);
        if(x>=0 && x<COLS && y>=0 && y<ROWS) {
            let cell = grid[y*COLS + x];
            if(!cell.open) {
                cell.open = true;
                if(cell.mine) { alert('BOOM!'); returnToMenu(); }
                else updateScore(score + 10);
            }
        }
    };

    gameLoop = setInterval(() => {
        ctx.fillStyle = '#222'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(150, 50);
        grid.forEach((c, i) => {
            let x = (i % COLS) * SIZE, y = Math.floor(i / COLS) * SIZE;
            ctx.fillStyle = c.open ? (c.mine ? 'red' : '#444') : '#888';
            ctx.fillRect(x, y, SIZE-2, SIZE-2);
        });
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }, 100);
}
