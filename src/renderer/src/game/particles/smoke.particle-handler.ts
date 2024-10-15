import { ParticleInstance } from '../particle-manager';
import { ParticleHandler } from './_particles';

type SmokeParticle = ParticleInstance<{
  opacity: number;
}>
const maxOpacity = 100;
export class SmokeParticleHandler extends ParticleHandler {
  createParticle(): Partial<ParticleInstance> {
    return {
      data: { opacity: maxOpacity }
    };
  }

  tryToMoveToPosition(particle, x, y): boolean {
    const newParticle = this.getParticle(x, y);
    if (newParticle == null) {
      return false;
    }

    if (newParticle.type == 'Air') {
      this.moveParticle(particle, x, y);
      return true;
    }

    return false;
  }

  update(particle: SmokeParticle): void {
    if (particle.data == null) {
      particle.data = { opacity: maxOpacity };
    }
    particle.data.opacity = particle.data.opacity - 1;
    if (particle.data.opacity <= 0) {
      this.removeParticle(particle);
      return;
    }

    const moveToYPosition = particle.y + 1;
    const moveToXPosition = this.Manager.currentTick % 2 === 0 ? particle.x - 1 : particle.x + 1;
    if (this.tryToMoveToPosition(particle, moveToXPosition, moveToYPosition)) {
      return;
    } else if (this.tryToMoveToPosition(particle, -moveToXPosition, moveToYPosition)) {
      return;
    }
  }

  getColor(particle: SmokeParticle): number[] {
    const opacity = particle.data?.opacity ?? 50;
    const gray = Math.min(255, opacity * 2.55);
    return [gray, gray, gray, 255];
  }
}
