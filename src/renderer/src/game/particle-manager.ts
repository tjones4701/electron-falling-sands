import { Game } from "./game";
import { ParticleHandler } from "./particles/_particles";

export type ParticleInstanceType = string;
export type ParticleInstance = {
  type: ParticleInstanceType;
  x: number;
  y: number;
  dirty?: boolean;
}


export class ParticleManager {
  public particles: ParticleInstance[][] = [[]];
  private particleTypes: Record<string, ParticleHandler> = {};
  public particleUpdates: ParticleInstance[] = [];
  public game: Game;

  constructor(game: Game) {
    this.game = game;
    // Initialize the 2D array
    for (let i = 0; i < 800; i++) {
      this.particles[i] = [];
      for (let j = 0; j < 600; j++) {
        this.particles[i][j] = {
          type: "Air",
          x: i,
          y: j
        };
      }
    }
  }

  updateParticles(particles: ParticleInstance | ParticleInstance[]): void {
    if (!Array.isArray(particles)) {
      particles = [particles];
    }

    for (const particle of particles) {
      if (particle.dirty) {
        return;
      }
      particle.dirty = true;
      this.particleUpdates.push(particle);
    }
  }

  initialise(): void {
    const newParticles: ParticleInstance[][] = [];
    // Initialize the new 2D array
    for (let i = 0; i < 800; i++) {
      newParticles[i] = [];
      for (let j = 0; j < 600; j++) {
        newParticles[i][j] = {x:i, y:j, type:"Air"};
      }
    }

    this.particles = newParticles;
  }

  addParticleHandler(particleHandler: ParticleHandler): void {
    const particleClassName = particleHandler.constructor.name.replace('ParticleHandler', '');
    this.particleTypes[particleClassName] = particleHandler;
  }

  getParticleHandler(type: ParticleInstanceType): ParticleHandler {
    return this.particleTypes[type];
  }

  addParticle(type: ParticleInstanceType, x: number, y: number): void {
    const newParticle = {
        type: type,
        x: x,
        y: y
      };
      this.particles[x][y] = newParticle;
      this.updateParticles(newParticle);
  }


  getParticleColor(particle: ParticleInstance): Uint8Array {
    const handler = this.particleTypes[particle.type];
    if (handler) {
      return handler.getColor();
    }
    return new Uint8Array([0, 0, 0, 255]);
  }


  tick(): void {
    const particlesToUpdate = [...this.particleUpdates];

    this.particleUpdates = [];
    for (const particle of particlesToUpdate) {
      particle.dirty = false;
      const handler = this.particleTypes[particle.type];
      if (handler) {
        handler.update(particle);
      }
      this.game.renderer.setPixel(particle.x, particle.y, this.getParticleColor(particle));
    }
  }
}
