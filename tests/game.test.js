// tests/game.test.js — unit tests for game.js pure logic
// Run: node --test tests/game.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, changeDirection, moveSnake, getSpeed, GRID_SIZE } from '../js/game.js';

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
    // place head at right wall, direction RIGHT
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
    const result = moveSnake(game);
    assert.deepEqual(result.snake.body, game.snake.body);
  });
});

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
