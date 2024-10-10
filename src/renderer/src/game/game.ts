import { ParticleManager } from './particle-manager';
import { SandParticleHandler } from './particles/sand.particle-handler';
import { WebGLSandRenderer } from './webglsandrenderser';

export class Game {
  renderer: WebGLSandRenderer;
  canvas: HTMLCanvasElement;
  particleManager: ParticleManager;
  isMouseDown: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new WebGLSandRenderer(canvas, canvas.width, canvas.height);
    this.initialiseParticleManager();
    this.addEventListeners();

  }

  initialiseParticleManager(): void {
    this.particleManager = new ParticleManager(this);
    this.particleManager.addParticleHandler(new SandParticleHandler(this.particleManager));
    this.particleManager.initialise();
  }

  addEventListeners(): void {
    this.canvas.addEventListener('mousemove', (event) => this.onCanvasMouseMove(event));
    this.canvas.addEventListener('mousedown', () => (this.isMouseDown = true));
    this.canvas.addEventListener('mouseup', () => (this.isMouseDown = false));
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = rect.bottom - event.clientY;
    this.particleManager.addParticle("Sand",x, y);
  }

  start(): void {
    console.log('Game started!');
    // this.renderer.clear();

    this.gameLoop();
  }

  tick(): void {
    this.particleManager.tick();
  }

  private gameLoop(): void {
    this.tick();
    this.renderer.update();
    requestAnimationFrame(() => this.gameLoop());
  }
}
