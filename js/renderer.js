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
