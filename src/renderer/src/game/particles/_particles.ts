import { ParticleInstance, ParticleManager } from "../particle-manager";

export class ParticleHandler
{
    Manager: ParticleManager;
    constructor(manager: ParticleManager) {
        this.Manager = manager;
    }

    moveParticle(particle: ParticleInstance, x: number, y: number): void {
        const oldX = particle.x;
        const oldY = particle.y;
        particle.x = x;
        particle.y = y;
        const existingParticle = this.getParticle(x, y);
        if (existingParticle == undefined) {
            return;
        }
        this.Manager.particles[oldX][oldY] = existingParticle;
        this.Manager.particles[x][y] = particle;
        this.Manager.updateParticles([particle, existingParticle]);
    }

    getParticle(x: number, y: number): ParticleInstance | undefined {
        return this.Manager.particles[x]?.[y];
    }

    getParticleType(x: number, y: number): string {
        return this.getParticle(x, y)?.type ?? "";
    }

    getColor(): Uint8Array {
        return new Uint8Array([0, 0, 0, 255]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(_particle: ParticleInstance): void {
        return;
    }
}
