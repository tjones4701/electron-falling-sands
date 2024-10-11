/* eslint-disable @typescript-eslint/no-unused-vars */
import { ParticleInstance } from '../particle-manager';
import { ParticleHandler } from './_particles';

export class ConcreteParticleHandler extends ParticleHandler {
  createParticle(): Partial<ParticleInstance> {
    return {
      density: 100
    };
  }

  getColor(): number[] {
    return [128, 128, 128, 255]; // Gray color for concrete
  }
}
