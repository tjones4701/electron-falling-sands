import { ParticleInstance } from '../particle-manager';
import { ParticleHandler } from './_particles';

export class SandParticleHandler extends ParticleHandler {
  createParticle(): Partial<ParticleInstance> {
    return {
      density: 10
    };
  }

  tryToMoveToPosition(particle, x, y): boolean {
    const newParticle = this.getParticle(x, y);
    if (newParticle == null) {
      return false;
    }

    if (particle?.density > (newParticle?.density ?? 0)) {
      this.moveParticle(particle, x, y);
      return true;
    }

    return false;
  }

  update(particle: ParticleInstance): void {
    if (this.tryToMoveToPosition(particle, particle.x, particle.y - 1)) {
      return;
    }

    const moveToYPosition = particle.y - 1;
    const moveToXPosition = this.Manager.currentTick % 2 === 0 ? particle.x - 1 : particle.x + 1;
    if (this.tryToMoveToPosition(particle, moveToXPosition, moveToYPosition)) {
      return;
    } else if (this.tryToMoveToPosition(particle, -moveToXPosition, moveToYPosition)) {
      return;
    }
  }

  getColor(): number[] {
    return [255, 255, 0, 255];
  }
}
