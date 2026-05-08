# Snake Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a classic browser-based Snake game with modular JS architecture, zero dependencies.

**Architecture:** Three JS modules — game.js (pure logic), renderer.js (Canvas drawing), input.js (keyboard) — plus a lightweight HTML entry point and CSS styling. game.js is fully unit-tested (TDD). Data flows one direction: input → game → renderer.

**Tech Stack:** HTML5 Canvas, vanilla JavaScript (ES6 modules), CSS

---

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/game.js`
- Create: `js/renderer.js`
- Create: `js/input.js`
- Create: `tests/game.test.js`

- [ ] **Step 1: Init git and create directories**

```bash
cd C:/Users/ASUS/snake-game
git init
mkdir -p css js tests
```

- [ ] **Step 2: Create index.html skeleton**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>贪吃蛇</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="game-container">
    <canvas id="game-canvas"></canvas>
    <div id="game-ui">
      <div id="score-display">得分: 0</div>
      <div id="message">按 Enter 开始游戏</div>
    </div>
  </div>
  <script type="module" src="js/game.js"></script>
  <script type="module" src="js/renderer.js"></script>
  <script type="module" src="js/input.js"></script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add index.html css/ js/ tests/
git commit -m "chore: scaffold snake-game project structure"
```

---

### Task 2: Game Core Logic (TDD)

**Files:**
- Create: `tests/game.test.js`
- Modify: `js/game.js`

- [ ] **Step 1: Write failing test for initial state**

In `tests/game.test.js`:

```javascript
// tests/game.test.js — unit tests for game.js pure logic
// Run: node --test tests/game.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, moveSnake, changeDirection, GRID_SIZE } from '../js/game.js';

describe('createGame', () => {
  it('returns initial game state with snake centered', () => {
    const game = createGame();
    const mid = Math.floor(GRID_SIZE / 2);
    assert.equal(game.snake.body.length, 3);
    assert.deepEqual(game.snake.body[0], { x: mid, y: mid });
    assert.equal(game.snake.direction, 'RIGHT');
    assert.equal(game.state, 'IDLE');
    assert.equal(game.score, 0);
  });

  it('places food somewhere not on the snake', () => {
    const game = createGame();
    const isOnSnake = game.snake.body.some(
      seg => seg.x === game.food.x && seg.y === game.food.y
    );
    assert.equal(isOnSnake, false);
  });
});
```

Run: `node --test tests/game.test.js`
Expected: FAIL — module not found

- [ ] **Step 2: Write minimal implementation**

In `js/game.js`:

```javascript
// js/game.js — pure game logic, no DOM/Canvas dependencies

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_DECREMENT = 10;
export const MIN_SPEED = 50;
export const FOODS_PER_SPEEDUP = 5;

function randomFood(snakeBody) {
  const occupied = new Set(snakeBody.map(s => `${s.x},${s.y}`));
  const candidates = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) candidates.push({ x, y });
    }
  }
  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : null;
}

export function createGame() {
  const mid = Math.floor(GRID_SIZE / 2);
  const body = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  const food = randomFood(body);
  return {
    snake: { body, direction: 'RIGHT' },
    food,
    state: 'IDLE',
    score: 0,
    foodsEaten: 0,
  };
}
```

- [ ] **Step 3: Run test to verify pass**

Run: `node --test tests/game.test.js`
Expected: PASS

- [ ] **Step 4: Write failing test for direction change**

Append to `tests/game.test.js`:

```javascript
describe('changeDirection', () => {
  it('changes to a valid perpendicular direction', () => {
    const game = createGame();
    const result = changeDirection(game, 'UP');
    assert.equal(result.snake.direction, 'UP');
  });

  it('rejects 180-degree reversal (RIGHT → LEFT)', () => {
    const game = createGame();
    const result = changeDirection(game, 'LEFT');
    assert.equal(result.snake.direction, 'RIGHT');
  });

  it('rejects 180-degree reversal (UP → DOWN)', () => {
    const game = createGame();
    changeDirection(game, 'UP');
    const result = changeDirection(game, 'DOWN');
    assert.equal(result.snake.direction, 'UP');
  });

  it('ignores same direction', () => {
    const game = createGame();
    const result = changeDirection(game, 'RIGHT');
    assert.equal(result.snake.direction, 'RIGHT');
  });
});
```

Run: `node --test tests/game.test.js`
Expected: FAIL — changeDirection not defined

- [ ] **Step 5: Implement changeDirection**

Append to `js/game.js`:

```javascript
const OPPOSITES = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

export function changeDirection(game, newDir) {
  if (OPPOSITES[newDir] !== game.snake.direction) {
    game.snake.direction = newDir;
  }
  return game;
}
```

Run: `node --test tests/game.test.js`
Expected: PASS

- [ ] **Step 6: Write failing test for movement and collision**

Append to `tests/game.test.js`:

```javascript
describe('moveSnake', () => {
  it('advances snake one cell in current direction', () => {
    const game = createGame();
    game.state = 'PLAYING';
    const oldHead = game.snake.body[0];
    const result = moveSnake(game);
    assert.equal(result.snake.body[0].x, oldHead.x + 1);
    assert.equal(result.snake.body[0].y, oldHead.y);
  });

  it('wall collision sets GAME_OVER', () => {
    const game = createGame();
    game.state = 'PLAYING';
    // place head at right wall (at GRID_SIZE - 1, direction RIGHT)
    game.snake.body = [{ x: GRID_SIZE - 1, y: 0 }];
    game.snake.direction = 'RIGHT';
    const result = moveSnake(game);
    assert.equal(result.state, 'GAME_OVER');
  });

  it('self collision sets GAME_OVER', () => {
    const game = createGame();
    game.state = 'PLAYING';
    game.snake.body = [
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 6, y: 5 },
      { x: 4, y: 5 },
    ];
    game.snake.direction = 'UP';
    const result = moveSnake(game);
    assert.equal(result.state, 'GAME_OVER');
  });

  it('eating food grows snake and increases score', () => {
    const game = createGame();
    game.state = 'PLAYING';
    // place food right in front of head
    const head = game.snake.body[0];
    game.food = { x: head.x + 1, y: head.y };
    const oldLen = game.snake.body.length;
    const result = moveSnake(game);
    assert.equal(result.snake.body.length, oldLen + 1);
    assert.equal(result.score, 1);
    assert.equal(result.foodsEaten, 1);
  });

  it('does not move when state is not PLAYING', () => {
    const game = createGame();
    // state is IDLE by default
    const result = moveSnake(game);
    assert.deepEqual(result.snake.body, game.snake.body);
  });
});
```

Run: `node --test tests/game.test.js`
Expected: FAIL — moveSnake not defined

- [ ] **Step 7: Implement moveSnake**

Append to `js/game.js`:

```javascript
export function moveSnake(game) {
  if (game.state !== 'PLAYING') return game;

  const head = game.snake.body[0];
  const dir = game.snake.direction;
  const dirs = { UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } };
  const delta = dirs[dir];
  const newHead = { x: head.x + delta.x, y: head.y + delta.y };

  // wall collision
  if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
    game.state = 'GAME_OVER';
    return game;
  }

  // self collision
  if (game.snake.body.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
    game.state = 'GAME_OVER';
    return game;
  }

  // move
  game.snake.body.unshift(newHead);

  // eat food?
  if (newHead.x === game.food.x && newHead.y === game.food.y) {
    game.score++;
    game.foodsEaten++;
    const newFood = randomFood(game.snake.body);
    if (newFood === null) {
      game.state = 'WIN';
      return game;
    }
    game.food = newFood;
  } else {
    game.snake.body.pop();
  }

  return game;
}

export function getSpeed(foodsEaten) {
  const steps = Math.floor(foodsEaten / FOODS_PER_SPEEDUP);
  return Math.max(MIN_SPEED, INITIAL_SPEED - steps * SPEED_DECREMENT);
}
```

- [ ] **Step 8: Write test for speed scaling**

Append to `tests/game.test.js`:

```javascript
describe('getSpeed', () => {
  it('returns initial speed at 0 food', () => {
    assert.equal(getSpeed(0), 150);
  });

  it('decreases after 5 food eaten', () => {
    assert.equal(getSpeed(5), 140);
  });

  it('floors at minimum speed', () => {
    assert.equal(getSpeed(100), 50);
  });
});
```

Run: `node --test tests/game.test.js`
Expected: ALL TESTS PASS

- [ ] **Step 9: Commit**

```bash
git add tests/game.test.js js/game.js
git commit -m "feat: implement game core logic with TDD"
```

---

### Task 3: Renderer

**Files:**
- Create: `js/renderer.js`

- [ ] **Step 1: Implement renderer.js**

```javascript
// js/renderer.js — Canvas rendering, no game logic

const GRID_SIZE = 20;
const CELL_PX = 25;
const CANVAS_SIZE = GRID_SIZE * CELL_PX;

const COLORS = {
  bg: '#1a1a2e',
  grid: '#16213e',
  snake: '#00ff88',
  snakeHead: '#00cc66',
  food: '#ff4444',
  text: '#ffffff',
};

let canvas, ctx;

export function initRenderer() {
  canvas = document.getElementById('game-canvas');
  if (!canvas || !canvas.getContext) {
    const msg = document.getElementById('message');
    if (msg) msg.textContent = '你的浏览器不支持 Canvas，请换用现代浏览器';
    return false;
  }
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  ctx = canvas.getContext('2d');
  return true;
}

export function render(game) {
  if (!ctx) return;

  // background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // grid
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_PX, 0);
    ctx.lineTo(i * CELL_PX, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_PX);
    ctx.lineTo(CANVAS_SIZE, i * CELL_PX);
    ctx.stroke();
  }

  // food
  if (game.food) {
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(game.food.x * CELL_PX + 2, game.food.y * CELL_PX + 2, CELL_PX - 4, CELL_PX - 4);
  }

  // snake
  game.snake.body.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snake;
    ctx.fillRect(seg.x * CELL_PX + 1, seg.y * CELL_PX + 1, CELL_PX - 2, CELL_PX - 2);
  });
}

export function updateUI(game) {
  const scoreEl = document.getElementById('score-display');
  const msgEl = document.getElementById('message');
  if (scoreEl) scoreEl.textContent = `得分: ${game.score}`;

  const messages = {
    IDLE: '按 Enter 开始游戏',
    PLAYING: '',
    PAUSED: '暂停中 — 按 Space 继续',
    GAME_OVER: '游戏结束！按 Enter 重新开始',
    WIN: '你赢了！按 Enter 重新开始',
  };
  if (msgEl && messages[game.state] !== undefined) {
    msgEl.textContent = messages[game.state];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/renderer.js
git commit -m "feat: add Canvas renderer and UI update"
```

---

### Task 4: Input Handling

**Files:**
- Create: `js/input.js`

- [ ] **Step 1: Implement input.js**

```javascript
// js/input.js — keyboard input handling

const KEY_MAP = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  w: 'UP', W: 'UP', s: 'DOWN', S: 'DOWN', a: 'LEFT', A: 'LEFT', d: 'RIGHT', D: 'RIGHT',
};

export function setupInput({ onDirection, onPause, onRestart }) {
  document.addEventListener('keydown', (e) => {
    const dir = KEY_MAP[e.key];
    if (dir) {
      e.preventDefault();
      onDirection(dir);
      return;
    }
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      onPause();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onRestart();
    }
  });

  window.addEventListener('blur', () => {
    onPause();
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add js/input.js
git commit -m "feat: add keyboard input handling with auto-pause on blur"
```

---

### Task 5: Integration & Main Loop

**Files:**
- Modify: `index.html`
- Create: `css/style.css`

- [ ] **Step 1: Update index.html with main game bootstrap**

Replace the `<script>` section in `index.html`:

```html
  <script type="module">
    import { createGame, moveSnake, changeDirection, getSpeed, INITIAL_SPEED } from './js/game.js';
    import { initRenderer, render, updateUI } from './js/renderer.js';
    import { setupInput } from './js/input.js';

    const canvasReady = initRenderer();
    if (!canvasReady) throw new Error('Canvas not supported');

    let game = createGame();
    let timerId = null;
    let currentSpeed = INITIAL_SPEED;

    function loop() {
      game = moveSnake(game);
      render(game);
      updateUI(game);

      // speed recalculation: restart with new interval if speed changed
      const newSpeed = getSpeed(game.foodsEaten);
      if (newSpeed !== currentSpeed) {
        currentSpeed = newSpeed;
        clearInterval(timerId);
        if (game.state === 'PLAYING') {
          timerId = setInterval(loop, currentSpeed);
        }
      }

      if (game.state === 'GAME_OVER' || game.state === 'WIN') {
        clearInterval(timerId);
        timerId = null;
        render(game);
        updateUI(game);
      }
    }

    function startLoop() {
      clearInterval(timerId);
      currentSpeed = getSpeed(game.foodsEaten);
      timerId = setInterval(loop, currentSpeed);
    }

    function restartLoop() {
      clearInterval(timerId);
      timerId = setInterval(loop, currentSpeed);
    }

    setupInput({
      onDirection(dir) {
        game = changeDirection(game, dir);
      },
      onPause() {
        if (game.state === 'PLAYING') {
          game.state = 'PAUSED';
          clearInterval(timerId);
          timerId = null;
          render(game);
          updateUI(game);
        } else if (game.state === 'PAUSED') {
          game.state = 'PLAYING';
          restartLoop();
        }
      },
      onRestart() {
        if (game.state === 'IDLE' || game.state === 'GAME_OVER' || game.state === 'WIN') {
          game = createGame();
          game.state = 'PLAYING';
          render(game);
          updateUI(game);
          startLoop();
        }
      },
    });

    render(game);
    updateUI(game);
  </script>
```

- [ ] **Step 2: Create style.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0f0f23;
  color: #ffffff;
  font-family: 'Segoe UI', system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

#game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

#game-canvas {
  border: 2px solid #00ff88;
  border-radius: 4px;
}

#game-ui {
  text-align: center;
}

#score-display {
  font-size: 20px;
  font-weight: bold;
  color: #00ff88;
  margin-bottom: 8px;
}

#message {
  font-size: 14px;
  color: #aaa;
  min-height: 20px;
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: integrate game loop, input, and styling"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Run all tests**

```bash
node --test tests/game.test.js
```
Expected: ALL TESTS PASS

- [ ] **Step 2: Manual smoke test checklist**

Open `index.html` in browser and verify:
- [ ] Game starts on Enter press
- [ ] Arrow keys control direction
- [ ] Snake eats food → grows + score increases
- [ ] Wall collision → "游戏结束" message
- [ ] Self collision → "游戏结束" message
- [ ] Space pauses and resumes
- [ ] Enter restarts after game over
- [ ] Speed increases noticeably after eating 5+ food

- [ ] **Step 3: Final commit (if any fixes)**

```bash
git add -A
git commit -m "chore: final verification and polish"
```
