import { ParticleInstance } from '../particle-manager';
import { ParticleHandler } from './_particles';

export class VirusParticleHandler extends ParticleHandler {
  createParticle(): Partial<ParticleInstance> {
    return {
      density: 5 // Adjust density as needed
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
    this.infectNeighbors(particle);

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

  infectNeighbors(particle: ParticleInstance): void {
    const neighbors = [
      { x: particle.x - 1, y: particle.y },
      { x: particle.x + 1, y: particle.y },
      { x: particle.x, y: particle.y - 1 },
      { x: particle.x, y: particle.y + 1 }
    ];

    for (const neighbor of neighbors) {
      const neighborParticle = this.getParticle(neighbor.x, neighbor.y);
      if (neighborParticle && neighborParticle.type !== 'Air' && neighborParticle.type !== 'Virus') {
        this.convertToVirus(neighborParticle);
      }
    }
  }

  convertToVirus(particle: ParticleInstance): void {
    this.Manager.addParticle('Virus', particle.x, particle.y);
  }

  getColor(): number[] {
    return [255, 0, 255, 255]; // Green color for virus particles
  }
}
