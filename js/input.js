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
