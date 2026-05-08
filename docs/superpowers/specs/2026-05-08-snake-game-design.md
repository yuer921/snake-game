# Snake Game Design Spec

2026-05-08 | Classic browser-based snake game

## Overview

A classic Snake game built with pure web technologies (HTML/CSS/JS) that runs directly in the browser with zero dependencies. The player controls a snake with arrow keys/WASD, eats food to grow, and must avoid walls and self-collision.

## Architecture

```
snake-game/
├── index.html          -- Entry point, DOM skeleton
├── css/
│   └── style.css       -- Layout, canvas styling, UI
├── js/
│   ├── game.js         -- Core logic: snake state, food, score, collision detection
│   ├── renderer.js     -- Canvas rendering: snake, food, grid, score
│   └── input.js        -- Keyboard input: direction control, pause, restart
└── tests/
    └── game.test.js    -- Unit tests for game.js
```

## Component Design

### game.js (Pure Logic)

- **Snake**: `{ body: [{x, y}, ...], direction: 'UP'|'DOWN'|'LEFT'|'RIGHT' }`
- **Food**: `{ x, y }`
- **State**: `'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'`
- **Constraint**: 180-degree direction reversal is rejected
- **Movement**: Insert new head in current direction, remove tail (unless food eaten)
- **Collision**: Wall collision or self-collision → GAME_OVER
- **Score**: +1 per food, display in canvas
- **Speed**: Start 150ms interval, decrease by 10ms per 5 food eaten, floor at 50ms
- **Win condition**: Snake fills entire grid → Win

### renderer.js (Canvas Drawing)

- Clears canvas, draws grid background
- Renders food with distinct color
- Renders snake body segments
- Displays score text on canvas
- Does not touch game state or input

### input.js (Keyboard Handling)

- Arrow keys / WASD → change direction (reject 180°)
- Space → pause/resume
- Enter → restart from IDLE or GAME_OVER
- Window blur → auto-pause

## Data Flow

```
input.js ──(direction)──▶ game.js ──(state)──▶ renderer.js
                ▲                         │
                └──(game over/restart)────┘
```

## Error Handling & Edge Cases

- **No food placement**: Snake fills entire grid → Win state
- **No Canvas support**: Display fallback text message
- **Window loses focus**: Auto-pause to prevent surprise death
- **Rapid input**: Multiple keypresses per frame, take last valid input only

## Testing Strategy

`game.test.js` covers:
- Initial state: snake position, direction
- Direction change: valid and rejected 180° reversal
- Movement: normal advance, wall collision, self collision
- Eating: body grows, new food not on snake, score increment
- Speed scaling: accelerates every 5 food, floor at 50ms

Renderer and input layers are verified manually — they have browser dependencies that make unit testing impractical.
