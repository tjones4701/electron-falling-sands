import { ParticleManager } from './particle-manager';
import { ConcreteParticleHandler } from './particles/concrete.particle-handler copy';
import { SandParticleHandler } from './particles/sand.particle-handler';
import { VineParticleHandler } from './particles/vine-particle-handler';
import { VirusParticleHandler } from './particles/virus.particle-handler';
import { WaterParticleHandler } from './particles/water.particle-handler';
import { WebGLSandRenderer } from './webglsandrenderser';

export class Game {
  renderer: WebGLSandRenderer;
  canvas: HTMLCanvasElement;
  particleManager?: ParticleManager;
  inputs: {
    [key: string]: boolean;
  } = {};
  currentParticleType: string = 'Sand';
  lastTickTime = 0;
  mouseInputs: {
    left: boolean;
    right: boolean;
    middle: boolean;
    x: number;
    y: number
  } = { left: false, right: false, middle: false, x: 0,y: 0 };

  cursorRadius = 4;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new WebGLSandRenderer(canvas, canvas.width, canvas.height);
    this.initialiseParticleManager();
    this.addEventListeners();
  }

  initialiseParticleManager(): void {
    this.particleManager = new ParticleManager(this);
    this.particleManager.addParticleHandler(new SandParticleHandler(this.particleManager));
    this.particleManager.addParticleHandler(new WaterParticleHandler(this.particleManager));
    this.particleManager.addParticleHandler(new VineParticleHandler(this.particleManager));
    this.particleManager.addParticleHandler(new ConcreteParticleHandler(this.particleManager));
    this.particleManager.addParticleHandler(new VirusParticleHandler(this.particleManager));
    this.particleManager.initialise();
  }

  addEventListeners(): void {
    this.inputs = {};
    const document = this.canvas.ownerDocument;
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.onKeydown(event.key);
    });
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      this.onKeyup(event.key);
    });
    this.canvas.addEventListener('mousemove', (event) => this.onCanvasMouseMove(event));
    this.mouseInputs = { left: false, right: false, middle: false, x: 0, y: 0 };

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseInputs.left = true;
      if (e.button === 1) this.mouseInputs.middle = true;
      if (e.button === 2) this.mouseInputs.right = true;
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseInputs.left = false;
      if (e.button === 1) this.mouseInputs.middle = false;
      if (e.button === 2) this.mouseInputs.right = false;
    });

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const zoomFactor = 1.1;
      if (event.deltaY < 0) {
        this.renderer.zoomIn(zoomFactor);
      } else {
        this.renderer.zoomOut(zoomFactor);
      }
    });
  }

  changeParticleType(inc: number): void {
    const particleTypes = this.particleManager?.getParticleTypes();
    if (!particleTypes) {
      return;
    }
    const currentParticleTypeIndex = particleTypes.indexOf(this.currentParticleType);
    if (currentParticleTypeIndex + inc >= particleTypes.length) {
      this.currentParticleType = particleTypes[0];
    } else {
      this.currentParticleType = particleTypes[currentParticleTypeIndex + inc];
    }
  }

  onKeydown(key: string): void {
    this.inputs[key] = true;
    const particleTypes = this.particleManager?.getParticleTypes();
    if (!particleTypes) {
      return;
    }
    if (key == 'ArrowUp') {
      this.changeParticleType(1);
    } else if (key == 'ArrowDown') {
      this.changeParticleType(-1);
    }

  }
  onKeyup(key: string): void {
    this.inputs[key] = false;
  }

  onCanvasMouseMove(event: MouseEvent): void {
    const oldX = this.mouseInputs.x;
    const oldY = this.mouseInputs.y;

    let particleType: string | null = null;
    if (this.mouseInputs.left) {
      particleType = this.currentParticleType;
    }
    if (this.mouseInputs.right) {
      particleType = "Air";
    }


    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left);
    const y = (rect.bottom - event.clientY);

    this.mouseInputs.x = x;
    this.mouseInputs.y = y;

    const deltaX = this.mouseInputs.x - oldX;
    const deltaY = this.mouseInputs.y - oldY;


    if (this.mouseInputs.middle) {
      this.renderer.moveCamera(-deltaX, -deltaY);
    }

    const position = this.renderer.translateCoordinates(x, y);
    if (particleType) {
      for (let dx = -this.cursorRadius; dx <= this.cursorRadius; dx++) {
        for (let dy = -this.cursorRadius; dy <= this.cursorRadius; dy++) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= this.cursorRadius) {
            if (particleType == 'Air') {
              this.particleManager?.removeParticle(position.x + dx, position.y + dy);
            } else {
              this.particleManager?.addParticle(particleType, position.x + dx, position.y + dy);
            }
          }
        }
      }
    }
  }

  start(): void {
    this.gameLoop();
  }

  tick(delta:number): void {
    for(const type in this.particleManager?.particleTypes) {
      const handler = this.particleManager?.particleTypes[type];
      handler.tick(delta);
    }

    this.particleManager?.tick();
  }

  private gameLoop(): void {
    if (this.lastTickTime === 0) {
      this.lastTickTime = Date.now();
    }
    const delta = Date.now() - this.lastTickTime;

    this.tick(delta);
    this.renderer.update();
    this.renderer.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}
