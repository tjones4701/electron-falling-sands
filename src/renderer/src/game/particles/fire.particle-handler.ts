import { ParticleInstance } from '../particle-manager';
import { ParticleHandler } from './_particles';

type FireParticle = ParticleInstance<{
  lifespan: number;
}>;
const maxLife = 100;

export class FireParticleHandler extends ParticleHandler {
  createParticle(): Partial<ParticleInstance> {
    return {
      data: { lifespan: maxLife }
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

  update(particle: FireParticle): void {
    if (particle.data == null) {
      particle.data = { lifespan: maxLife };
    }
    particle.data.lifespan = particle.data.lifespan - 1;
    if (particle.data.lifespan <= 0) {
      this.removeParticle(particle);
      return;
    }

    const createSmoke = Math.random() > 0.98;
    // Create smoke particle when fire particle's lifespan decreases
    if (createSmoke) {
      this.createSmokeParticle(particle.x, particle.y - 2);
    }

    // Generate random positions for movement
    const moveToXPosition = particle.x + (Math.random() > 0.5 ? 1 : -1);
    const moveToYPosition = particle.y + (Math.random() > 0.5 ? 1 : -1);
    if (this.tryToMoveToPosition(particle, moveToXPosition, moveToYPosition)) {
      return;
    } else if (this.tryToMoveToPosition(particle, -moveToXPosition, -moveToYPosition)) {
      return;
    }
  }

  createSmokeParticle(x: number, y: number): void {
    this.Manager.addParticle('Smoke', x, y);
  }

  getColor(particle: FireParticle): number[] {
    const lifeSpan = particle.data?.lifespan ?? 0;
    const lifeSpanPercentage = lifeSpan / maxLife;

    const red = Math.min(200, 200 * lifeSpanPercentage);
    return [red + 55, 0, 0, 255];
  }
}
