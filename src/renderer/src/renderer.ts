import { Game } from './game/game';
function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing();
  });
}

function doAThing(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#game');
  if (!canvas) {
    return;
  }
  const game = new Game(canvas);
  game.start();
}

init();
