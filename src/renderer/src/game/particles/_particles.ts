import { ParticleInstance, ParticleManager } from "../particle-manager";

export class ParticleHandler
{
    Manager: ParticleManager;
    constructor(manager: ParticleManager) {
        this.Manager = manager;
    }

    getNeighbours(x: number, y: number): ParticleInstance[] {
        const neighbours: ParticleInstance[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }

                const neighbour = this.getParticle(x + dx, y + dy);
                if (neighbour) {
                    neighbours.push(neighbour);
                }
            }
        }

        return neighbours;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCreateParticle(_particle: ParticleInstance): void {
        return;
    }

    createParticle(): Partial<ParticleInstance> {
        return {
            density: 0,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    tick(_delta: number): void {

    }

    moveParticle(particle: ParticleInstance, x: number, y: number): void {
      this.Manager.swapParticlePositions(particle.x, particle.y, x, y);
    }

    removeParticle(particle:ParticleInstance): void {
        this.Manager.removeParticle(particle.x,particle.y);
    }

    getParticle(x: number, y: number): ParticleInstance | undefined {
        return this.Manager.particles[x]?.[y];
    }

    getParticleType(x: number, y: number): string {
        return this.getParticle(x, y)?.type ?? "";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getColor(_particle: ParticleInstance): number[] {
        return [0, 0, 0, 255];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_particle: ParticleInstance): void {
        return;
    }
}
