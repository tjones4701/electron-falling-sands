import { Game } from "./game";
import { ParticleHandler } from "./particles/_particles";

export type ParticleInstanceType = string;
export type ParticleInstance = {
  type: ParticleInstanceType;
  x: number;
  y: number;
  density?: number;
  dirty?: boolean;
}

export type ParticleArea = {
  x: number;
  y: number;
  dirty?: boolean;
  particles?: ParticleInstance[];
}


export class ParticleManager {
  public currentTick = 0;
  public particles: ParticleInstance[][] = [[]];
  public particleTypes: Record<string, ParticleHandler> = {};
  public particleAreas: ParticleArea[][] = [];
  public maxParticleAreasToUpdate = 8;
  public baseParticleHandler = new ParticleHandler(this);
  public lastTickTime = 0;
  public particleAreaSize = {
    x: 80,
    y: 60
  };
  public particleAreaCounts = {
    x: 10,
    y: 10
  };
  public game: Game;
  public size = {
    x: 800,
    y: 600
  };

  constructor(game: Game) {
    this.game = game;
  }

  getParticleArea(x: number, y: number): ParticleArea {
    const xIndex = Math.floor(x / this.particleAreaSize.x);
    const yIndex = Math.floor(y / this.particleAreaSize.y);
    return this.particleAreas[xIndex][yIndex];
  }

  markAreaDirty(particleInstance: ParticleInstance): void {
    const particleArea = this.getParticleArea(particleInstance.x, particleInstance.y);
    if (!particleArea) {
      console.error('No particle area found for particle', particleInstance);
      return;
    }
    particleArea.dirty = true;
    particleArea.particles?.push(particleInstance);
  }


  updateParticles(particles: ParticleInstance | ParticleInstance[]): void {
    if (!Array.isArray(particles)) {
      if (particles.dirty) {
        return;
      }
      this.markAreaDirty(particles);
      particles.dirty = true;
      return;
    }

    for (const particle of particles) {
      if (particle.dirty) {
        continue;
      }
      particle.dirty = true;
      this.markAreaDirty(particle);
    }
  }

  initialise(): void {
    const newParticles: ParticleInstance[][] = [];
    // Initialize the new 2D array
    for (let i = 0; i < this.size.x; i++) {
      newParticles[i] = [];
      for (let j = 0; j < this.size.y; j++) {
        newParticles[i][j] = {x:i, y:j, type:"Air"};
      }
    }
    this.particleAreaSize = {
      x: Math.ceil(this.size.x / this.particleAreaCounts.x),
      y: Math.ceil(this.size.y / this.particleAreaCounts.y)
    };


    this.particles = newParticles;
    for (let i = 0; i < this.particleAreaCounts.x; i++) {
      this.particleAreas[i] = [];
      for (let j = 0; j < this.particleAreaCounts.y; j++) {
        this.particleAreas[i][j] = {dirty: false, particles: [], x: i, y: j};
      }
    }
  }

  swapParticlePositions(oldX: number, oldY: number, newX: number, newY: number): void {
    const oldP = this.particles[oldX][oldY];
    const newP = this.particles[newX][newY];
    this.particles[oldX][oldY] = newP;
    this.particles[newX][newY] = oldP;
    oldP.x = newX;
    oldP.y = newY;
    newP.x = oldX;
    newP.y = oldY;
    this.markNeighboursDirty(oldP);
    this.markNeighboursDirty(newP);
    this.updateParticles([oldP, newP]);
  }

  removeParticle(x: number, y: number): void {
    const newParticle = this.addParticle("Air", x, y);
    this.markNeighboursDirty(newParticle);
  }

  swapParticles(particle1: ParticleInstance, particle2: ParticleInstance): void {
    this.swapParticlePositions(particle1.x, particle1.y, particle2.x, particle2.y);
  }

  markNeighboursDirty(particle: ParticleInstance): void {
    if (particle.x > 0) {
      const leftNeighbour = this.particles[particle.x - 1][particle.y];
      if (!leftNeighbour.dirty) {
        this.updateParticles(leftNeighbour);
      }
    }
    if (particle.x < this.size.x - 1) {
      const rightNeighbour = this.particles[particle.x + 1][particle.y];
      if (!rightNeighbour.dirty) {
      this.updateParticles(rightNeighbour);
      }
    }
    if (particle.y > 0) {
      const topNeighbour = this.particles[particle.x][particle.y - 1];
      if (!topNeighbour.dirty) {
        this.updateParticles(topNeighbour);
      }
    }
    if (particle.y < this.size.y - 1) {
      const bottomNeighbour = this.particles[particle.x][particle.y + 1];
      if (!bottomNeighbour.dirty) {
        this.updateParticles(bottomNeighbour);
      }
    }
  }

  addParticleHandler(particleHandler: ParticleHandler): void {
    const particleClassName = particleHandler.constructor.name.replace('ParticleHandler', '');
    this.particleTypes[particleClassName] = particleHandler;
  }

  getParticleTypes(): string[] {
    const keys: string[] = [];
    for (const key in this.particleTypes) {
      keys.push(key);
    }
    return keys;
  }

  getParticleHandler(type: ParticleInstanceType): ParticleHandler {
    return this.particleTypes[type] ?? this.baseParticleHandler;
  }

  addParticle(type: ParticleInstanceType, x: number, y: number): ParticleInstance {
    x = Math.floor(x);
    y = Math.floor(y);
    const handler = this.getParticleHandler(type);
    const newParticle = {
      x: x,
      y:y,
      type: type,
      dirty: false,
      ...handler.createParticle()
    };

    this.particles[x][y] = newParticle;
    this.updateParticles(newParticle);
    handler.onCreateParticle(newParticle);
    return newParticle;
  }


  getParticleColor(particle: ParticleInstance): number[] {
    const handler = this.particleTypes[particle.type];
    if (handler) {
      return handler.getColor();
    }
    return [0, 0, 0, 255];
  }

  getDirtyParticleAreas(): ParticleArea[] {
    const dirtyAreas: ParticleArea[] = [];

    for(let y = this.particleAreaCounts.y-1; y >= 0; y--) {
      for(let x = this.particleAreaCounts.x-1; x >=0; x--) {
        const particleArea = this.particleAreas[x][y];
        if (particleArea.dirty) {
          dirtyAreas.push(particleArea);
        }
      }
    }

    return dirtyAreas;
  }


  tick(): void {
    if (this.lastTickTime === 0) {
      this.lastTickTime = Date.now();
    }
    const delta = Date.now() - this.lastTickTime;
    const fps = 1000 / delta;
    this.lastTickTime = Date.now();

    if (fps < 30) {
      this.maxParticleAreasToUpdate = this.maxParticleAreasToUpdate - 10;
    } else if (fps < 45) {
      this.maxParticleAreasToUpdate = this.maxParticleAreasToUpdate + 1;
    } else if (fps >= 45) {
      this.maxParticleAreasToUpdate = this.maxParticleAreasToUpdate + 5;
    }


    if (this.maxParticleAreasToUpdate < 8) {
      this.maxParticleAreasToUpdate = 8;
    }
    if (this.maxParticleAreasToUpdate > this.particleAreaCounts.x * this.particleAreaCounts.y) {
      this.maxParticleAreasToUpdate = this.particleAreaCounts.x * this.particleAreaCounts.y;
    }

    this.currentTick = this.currentTick + 1;
    const particlesToUpdate: ParticleInstance[] = [];


    let currentUpdates = 0;
    const dirtyParticleAreas = this.getDirtyParticleAreas();

    for(const particleArea of dirtyParticleAreas) {
        currentUpdates = currentUpdates + 1;
        if (currentUpdates > this.maxParticleAreasToUpdate) {
          break;
        }
        if (!particleArea.dirty) {
          continue;
        }

        particleArea.dirty = false;

        const particles = particleArea.particles;
        if (!particles) {
          continue;
        }
        for (const particle of particles) {
          if (particle.dirty) {
            particlesToUpdate.push(particle);
          }
        }
        particleArea.particles = [];
      }


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
