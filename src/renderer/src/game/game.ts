import { WebGLSandRenderer } from './webglsandrenderser';

export class Game {
  renderer: WebGLSandRenderer;
  canvas: HTMLCanvasElement;
  isMouseDown: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new WebGLSandRenderer(canvas, canvas.width, canvas.height);
    this.addEventListeners();
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
    this.renderer.setPixel(x, y, [255, 255, 255, 255]);
  }

  start(): void {
    console.log('Game started!');
    // this.renderer.clear();

    this.gameLoop();
  }

  private gameLoop(): void {
    this.renderer.update();
    requestAnimationFrame(() => this.gameLoop());
  }
}
