import { Game } from './game';
import { ControlsManager } from './ui/controls-manager';
import { Button } from './ui/elements/button.control';
import { Label } from './ui/elements/label.control';

export class GameControls extends ControlsManager {
  game?: Game;

  initialise(game: Game): void {
    this.game = game;
    if (this.game == undefined) {
      return;
    }

    const particleTypes = this.game?.particleManager?.getParticleTypes();
    if (!particleTypes) {
      return;
    }
    const resetButton = new Button(this);
    resetButton.setText('Reset');
    resetButton.onClick = (): void => {
      this.game?.reset();
    };

    const increaseSizeButton = new Button(this);
    increaseSizeButton.setText('+ Size');

    const sizeLabel = new Label(this);
    sizeLabel.setText(`Size: ${this.game.cursorRadius}`);

    const decreaseSizeButton = new Button(this);
    decreaseSizeButton.setText('- Size');
    decreaseSizeButton.onClick = (): void => {
      if (!this.game) {
        return;
      }
      this.game.cursorRadius -= 1;
      if (this.game.cursorRadius < 1) {
        this.game.cursorRadius = 1;
      }
      sizeLabel.setText(`Size: ${this.game.cursorRadius}`);
    };

    increaseSizeButton.onClick = (): void => {
      if (!this.game) {
        return;
      }
      this.game.cursorRadius += 1;
      sizeLabel.setText(`Size: ${this.game.cursorRadius}`);
    };

    for (const type in particleTypes) {
      const button = new Button(this);
      button.setText(particleTypes[type]);
      button.onClick = (): void => {
        this.game?.setParticleType(particleTypes[type]);
      };
    }
  }
}
