export class WebGLSandRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  width: number;
  height: number;
  pixelData?: Uint8Array;
  dirtyRegions?: { [key: number]: boolean };
  program?: WebGLProgram | null;
  positionLocation?: number | null;
  textureLocation?: WebGLUniformLocation | null;
  cameraLocation?: WebGLUniformLocation | null;
  texture?: WebGLTexture | null;
  errors?: Error[] = [];

  zoom = 1;
  cameraPosition = { x: 0, y: 0 };
  regionSize = 32; // Configurable size of dirty regions

  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    this.width = width;
    this.height = height;

    if (!this.gl) {
      console.error('WebGL is not supported.');
      return;
    }

    // Array to keep track of only the "dirty" regions (those that have changed)
    this.pixelData = new Uint8Array(width * height * 4); // RGBA format
    this.dirtyRegions = {}; // Dictionary to store dirty regions by key

    this.initShaders();
    this.createTexture();
    this.createBuffer();

    this.render(); // Initial render
  }

  moveCamera(x, y): void {
    this.cameraPosition.x += x;
    this.cameraPosition.y += y;
  }

  setZoom(zoom): void {
    this.zoom = zoom;
  }

  zoomIn(factor): void {
    this.zoom *= factor;
  }
  zoomOut(factor): void {
    this.zoom /= factor;
  }

  initShaders(): void {
    const vertexShaderSource = `
            attribute vec2 aPosition;
            uniform vec2 uCamera;
            uniform float uZoom;
            varying vec2 vTexCoord;
            void main() {
                vec2 position = (aPosition - uCamera) * uZoom;
                vTexCoord = (aPosition + 1.0) / 2.0; // Map from [-1, 1] to [0, 1]
                gl_Position = vec4(position, 0, 1);
            }
        `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      void main() {
        gl_FragColor = texture2D(uTexture, vTexCoord);
      }
      `;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error('Shader creation failed.');
      return;
    }

    this.program = this.createProgram(vertexShader, fragmentShader);
    if (!this.program) {
      console.error('Program creation failed.');
      return;
    }

    this.gl.useProgram(this.program);

    this.positionLocation = this.gl.getAttribLocation(this.program, 'aPosition');
    if (this.positionLocation === -1) {
      console.error('Failed to get the storage location of aPosition');
      return;
    }

    this.textureLocation = this.gl.getUniformLocation(this.program, 'uTexture');
    if (!this.textureLocation) {
      console.error('Failed to get the storage location of uTexture');
      return;
    }

    this.cameraLocation = this.gl.getUniformLocation(this.program, 'uCamera');
    if (!this.cameraLocation) {
      console.error('Failed to get the storage location of uCamera');
      return;
    }

    const normalizedCameraX = this.cameraPosition.x / this.width;
    const normalizedCameraY = this.cameraPosition.y / this.height;
    this.gl.uniform2f(this.cameraLocation, normalizedCameraX, normalizedCameraY);

    const zoomLocation = this.gl.getUniformLocation(this.program, 'uZoom');
    if (zoomLocation === null) {
      console.error('Failed to get the storage location of uZoom');
      return;
    }
    this.gl.uniform1f(zoomLocation, this.zoom);
  }

  clear(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setPixel(x, y, [0, 0, 0, 255]); // Set each pixel to black
      }
    }
  }

  normaliseCoordinates(x, y): { x: number; y: number } {
    return {
      x: (x / this.width) * 2 - 1,
      y: (y / this.height) * 2 - 1
    };
  }

  /**
   * Given an x and y position on the canvas, translate it to the WebGL coordinate system based on the camera position and zoom
   * @param x
   * @param y
   * @returns
   */
  translateCoordinates(x, y): { x: number; y: number } {
    const newX = ((x - this.width / 2) / this.zoom) + (this.cameraPosition.x / 2) + (this.width / 2);
    const newY = ((y - this.height / 2) / this.zoom) + (this.cameraPosition.y / 2) + (this.height / 2);

    return {
      x: newX,
      y: newY
    };
  }

  createShader(type, source): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) {
      console.error('Shader creation failed:', type);
      return null;
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  createProgram(vertexShader, fragmentShader): WebGLProgram | null {
    const program = this.gl.createProgram();
    if (!program) {
      console.error('Program creation failed');
      return null;
    }
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link failed:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  createTexture(): void {
    this.texture = this.gl.createTexture();
    if (!this.texture) {
      console.error('Texture creation failed');
      return;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    // Initialize the texture with the correct size and format
    const initialPixelData = new Uint8Array(this.width * this.height * 4);
    initialPixelData.fill(0); // Fill with black (RGBA: 0, 0, 0, 255)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.width,
      this.height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      initialPixelData
    );

    // Define texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    // Clear the canvas with black color
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    if (!this.pixelData) {
      console.error('Pixel data is not initialized');
      return;
    }
  }

  createBuffer(): void {
    const positionBuffer = this.gl.createBuffer();
    if (!positionBuffer) {
      console.error('Buffer creation failed');
      return;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    if (this.positionLocation == null) {
      console.error('Position location is not initialized');
      return;
    }
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }

  // Set the color of a specific pixel (x, y), where color is [r, g, b, a] array
  setPixel(x, y, color): void {
    if (!this.pixelData) {
      console.error('Pixel data is not initialized');
      return;
    }

    const index = (y * this.width + x) * 4;
    this.pixelData[index] = color[0]; // Red
    this.pixelData[index + 1] = color[1]; // Green
    this.pixelData[index + 2] = color[2]; // Blue
    this.pixelData[index + 3] = color[3]; // Alpha

    if (!this.dirtyRegions) {
      console.error('Dirty regions dictionary is not initialized');
      return;
    }

    // Calculate the region key that this pixel falls into
    const regionX = Math.floor(x / this.regionSize) * this.regionSize;
    const regionY = Math.floor(y / this.regionSize) * this.regionSize;
    const regionKey = regionY * this.width + regionX;

    // Mark the region as dirty
    this.dirtyRegions[regionKey] = true;
  }

  update(): void {
    if (this.errors == null) {
      this.errors = [];
    }
    if (this.errors.length > 10) {
      return;
    }
    if (!this.dirtyRegions || !this.pixelData) {
      console.error('Dirty regions or pixel data is not initialized');
      return;
    }
    if (Object.keys(this.dirtyRegions).length === 0) {
      return; // No need to update if nothing has changed
    }

    if (this.texture == null) {
      console.error('Texture is not initialized');
      return;
    }

    try {
      for (const key in this.dirtyRegions) {
        if (Object.prototype.hasOwnProperty.call(this.dirtyRegions, key)) {
          const regionX = parseInt(key) % this.width;
          const regionY = Math.floor(parseInt(key) / this.width);
          const regionWidth = Math.min(this.regionSize, this.width - regionX);
          const regionHeight = Math.min(this.regionSize, this.height - regionY);

          // Extract pixel data for the entire dirty region
          const dirtyRegionData = new Uint8Array(regionWidth * regionHeight * 4);
          for (let y = regionY; y < regionY + regionHeight; y++) {
            for (let x = regionX; x < regionX + regionWidth; x++) {
              const srcIndex = (y * this.width + x) * 4;
              const dstIndex = ((y - regionY) * regionWidth + (x - regionX)) * 4;
              dirtyRegionData.set(this.pixelData.slice(srcIndex, srcIndex + 4), dstIndex);
            }
          }

          // Update the texture using a single texSubImage2D call
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
          this.gl.texSubImage2D(
            this.gl.TEXTURE_2D,
            0,
            regionX,
            regionY,
            regionWidth,
            regionHeight,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            dirtyRegionData
          );
        }
      }

      this.errors = [];
    } catch (error) {
      if (error instanceof Error) {
        this.errors.push(error);
      }
      console.log(this.pixelData.buffer);
      console.error('Error updating dirty regions:', error);
    }

    this.dirtyRegions = {}; // Clear the dirty regions after updating
    this.render();
  }

  render(): void {
    // Set background color to light grey
    this.gl.clearColor(0.9, 0.9, 0.9, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Update camera and zoom uniforms
    if (this.program && this.gl) {
      this.gl.useProgram(this.program);
      const cameraLocation = this.gl.getUniformLocation(this.program, 'uCamera');
      const zoomLocation = this.gl.getUniformLocation(this.program, 'uZoom');
      if (cameraLocation && zoomLocation) {
        const normalizedCameraX = this.cameraPosition.x / this.width;
        const normalizedCameraY = this.cameraPosition.y / this.height;
        this.gl.uniform2f(cameraLocation, normalizedCameraX, normalizedCameraY);
        this.gl.uniform1f(zoomLocation, this.zoom);
      }
    }

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}
