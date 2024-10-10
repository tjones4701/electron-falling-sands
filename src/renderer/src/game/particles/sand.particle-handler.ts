import { ParticleInstance } from "../particle-manager";
import { ParticleHandler } from "./_particles";

export class SandParticleHandler extends ParticleHandler {
    update(particle: ParticleInstance): void {
        // Simulate sand particle movement
        const below = this.getParticle(particle.x, particle.y - 1);
        // if below is null or undefined then it is at the border of the world.
        if (!below) {
            return;
        }
        const canMoveBelow = below?.type === "Air";
        if (canMoveBelow) {
            this.moveParticle(particle, particle.x, particle.y - 1);
        } else {
            const belowLeft = this.getParticleType(particle.x - 1, particle.y - 1);
            const belowRight = this.getParticleType(particle.x + 1, particle.y - 1);
            if (!belowLeft) {
                this.moveParticle(particle, particle.x - 1, particle.y - 1);
            } else if (!belowRight) {
                this.moveParticle(particle, particle.x + 1, particle.y - 1);
            }
        }
    }

    getColor(): Uint8Array {
      return new Uint8Array([255, 255, 0, 255]);
    }
}
