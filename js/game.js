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

const OPPOSITES = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

export function changeDirection(game, newDir) {
  if (OPPOSITES[newDir] !== game.snake.direction) {
    game.snake.direction = newDir;
  }
  return game;
}

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
