import { ParticleInstance } from '../particle-manager';
import { ParticleHandler } from './_particles';

export class VineParticleHandler extends ParticleHandler {
  vinesToUpdate = 5;
  currentIndex = 0;
  knownVines: Array<number>[] = [];

  createParticle(): Partial<ParticleInstance> {
    return {
      density: 100
    };
  }

  onCreateParticle(particle: ParticleInstance): void {
    if (particle.type === 'Vine') {
      this.knownVines.push([particle.x, particle.y]);
    }
  }

  isGoodSpotToGrow(x: number, y: number): boolean {
    const particle = this.getParticle(x, y);
    const otherDensity = particle?.density ?? 0;
    if (otherDensity > 0) {
      return false;
    }

    const neighbours = this.getNeighbours(x, y);
    const numberOfVines = neighbours.filter((neighbour) => neighbour.type === 'Vine').length;
    const growthChance = (1 - (numberOfVines / 4)) - 0.15;
    if (Math.random() > growthChance) {
      return false;
    }

    return (particle?.density ?? 0) === 0;
  }

  tryToGrow(particle: ParticleInstance): void {

    const directions = [
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 } // down
    ];

    for(const direction of directions) {
      const newX = particle.x + direction.dx;
      const newY = particle.y + direction.dy;
      if (this.isGoodSpotToGrow(newX, newY)) {
        this.Manager.addParticle('Vine', newX, newY);
        return;
      }
    }

  }

  updateVine(particle: ParticleInstance): void {
    this.tryToGrow(particle);
  }

  updateVines(): void {
    let vinesToUpdate = 100;
    if (this.knownVines.length === 0) {
      return;
    }
    if (this.knownVines.length < vinesToUpdate) {
      vinesToUpdate = this.knownVines.length;
    }
    if (vinesToUpdate > this.vinesToUpdate) {
      vinesToUpdate = this.vinesToUpdate;
    }
    for (let i = 0; i < vinesToUpdate; i++) {
      const randomIndex = Math.floor(Math.random() * this.knownVines.length);
      const vine = this.knownVines[randomIndex];
      const particle = this.getParticle(vine[0], vine[1]);
      if (particle?.type === 'Vine') {
        this.updateVine(particle);
      } else {
        this.knownVines.splice(randomIndex, 1);
      }
    }
  }

  tick(): void {
    if (this.currentIndex >= this.Manager.size.x * this.Manager.size.y) {
      this.currentIndex = 0;
    }
    const x = this.currentIndex % this.Manager.size.x;
    const y = Math.floor(this.currentIndex / this.Manager.size.x);
    const particle = this.getParticle(x, y);
    if (particle?.type === 'Vine') {
      this.knownVines.push([x, y]);
    }
    this.currentIndex++;

    this.updateVines();
  }

  getColor(): number[] {
    return [0, 255, 0, 255];
  }
}
