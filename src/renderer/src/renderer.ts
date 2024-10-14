import { Game } from './game/game';
import { GameControls } from './game/game-controls';
function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing();
  });
}

function doAThing(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#game');
  const controls = document.querySelector<HTMLDivElement>('#gameControls');
  if (!canvas) {
    throw new Error('Canvas not found');
    return;
  }
  if (!controls) {
    throw new Error('Controls not found');
    return;
  }
  const game = new Game(canvas);
  game.start();
  const gameControls = new GameControls(controls);
  gameControls.initialise(game);
}

init();
