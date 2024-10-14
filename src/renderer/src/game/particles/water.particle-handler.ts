import { ParticleInstance } from '../particle-manager';
import { ParticleHandler } from './_particles';

export class WaterParticleHandler extends ParticleHandler {
  createParticle(): Partial<ParticleInstance> {
    return {
      density: 1
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
    const moveBelow = this.tryToMoveToPosition(particle, particle.x, particle.y - 1);
    if (moveBelow) {
      return;
    }
    const currentTick = this?.Manager?.currentTick ?? 0;

    const nextPosition = (particle.x + currentTick) % 2 === 0 ? -1 : 1;let nextY = particle.y - 1;
    if (this.tryToMoveToPosition(particle, particle.x + nextPosition, nextY)) {
      return;
    }
    if (this.tryToMoveToPosition(particle, particle.x - nextPosition, nextY)) {
      return;
    }
    nextY = particle.y;
    if (this.tryToMoveToPosition(particle, particle.x + nextPosition, nextY)) {
      return;
    }
    if (this.tryToMoveToPosition(particle, particle.x - nextPosition, nextY)) {
      return;
    }
  }

  getColor(): number[] {
    return [0, 0, 255, 255];
  }
}
