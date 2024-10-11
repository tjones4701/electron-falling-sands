import { ParticleInstance } from "../particle-manager";
import { ParticleHandler } from "./_particles";

export class WaterParticleHandler extends ParticleHandler {

  createParticle(): Partial<ParticleInstance> {
    return {
      density: 1
    };
  }
  canMove(particle): boolean {
    return this.getParticleType(particle.x, particle.y - 1) === "Air";
  }
  canMoveToPosition(x, y): boolean {
    return this.getParticleType(x, y) === "Air";
  }
  update(particle: ParticleInstance): void {
    // Simulate water particle movement
    const below = this.getParticle(particle.x, particle.y - 1);
    if (!below) {
      return;
    }
    const canMoveBelow = below?.type === "Air";
    if (canMoveBelow) {
      this.moveParticle(particle, particle.x, particle.y - 1);
    } else {
      const moveToYPosition = particle.y - 1;
      const moveToXPositionLeft = particle.x - 1;
      const moveToXPositionRight = particle.x + 1;

      const canMoveLeft = this.canMoveToPosition(moveToXPositionLeft, moveToYPosition);
      const canMoveRight = this.canMoveToPosition(moveToXPositionRight, moveToYPosition);

      if (canMoveLeft && canMoveRight) {
        // Randomly choose left or right if both are possible
        if (Math.random() < 0.5) {
          this.moveParticle(particle, moveToXPositionLeft, moveToYPosition);
        } else {
          this.moveParticle(particle, moveToXPositionRight, moveToYPosition);
        }
      } else if (canMoveLeft) {
        this.moveParticle(particle, moveToXPositionLeft, moveToYPosition);
      } else if (canMoveRight) {
        this.moveParticle(particle, moveToXPositionRight, moveToYPosition);
      } else {
        // Water can also move sideways if it can't move down
        const sideMoveXPositionLeft = particle.x - 1;
        const sideMoveXPositionRight = particle.x + 1;

        const canMoveSideLeft = this.canMoveToPosition(sideMoveXPositionLeft, particle.y);
        const canMoveSideRight = this.canMoveToPosition(sideMoveXPositionRight, particle.y);

        if (canMoveSideLeft && canMoveSideRight) {
          // Randomly choose left or right if both are possible
          if (Math.random() < 0.5) {
            this.moveParticle(particle, sideMoveXPositionLeft, particle.y);
          } else {
            this.moveParticle(particle, sideMoveXPositionRight, particle.y);
          }
        } else if (canMoveSideLeft) {
          this.moveParticle(particle, sideMoveXPositionLeft, particle.y);
        } else if (canMoveSideRight) {
          this.moveParticle(particle, sideMoveXPositionRight, particle.y);
        }
      }
    }
  }

  getColor(): number[] {
    return [0, 0, 255, 255];
  }
}
