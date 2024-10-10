export class WebGLSandRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  width: number;
  height: number;
  pixelData?: Uint8Array;
  dirtyPixels?: { x: number; y: number }[];
  program?: WebGLProgram | null;
  positionLocation?: number | null;
  textureLocation?: WebGLUniformLocation | null;
  texture?: WebGLTexture | null;
  errors?:Error[] = [];

  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    this.width = width;
    this.height = height;

    if (!this.gl) {
      console.error('WebGL is not supported.');
      return;
    }

    // Array to keep track of only the "dirty" pixels (those that have changed)
    this.pixelData = new Uint8Array(width * height * 4); // RGBA format
    this.dirtyPixels = []; // List of pixels to update

    this.initShaders();
    this.createTexture();
    this.createBuffer();

    this.render(); // Initial render
  }

  initShaders(): void {
    const vertexShaderSource = `
            attribute vec2 aPosition;
            varying vec2 vTexCoord;
            void main() {
                vTexCoord = (aPosition + 1.0) / 2.0; // Map from [-1, 1] to [0, 1]
                gl_Position = vec4(aPosition, 0, 1);
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
  }

  clear(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setPixel(x, y, [0, 0, 0, 255]); // Set each pixel to black
      }
    }
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

    if (!this.dirtyPixels) {
      console.error('Dirty pixels array is not initialized');
      return;
    }

    // Add this pixel to the list of "dirty" pixels
    this.dirtyPixels.push({ x, y });
  }

  update(): void {
    if (this.errors.length > 10) {
      return;
    }
    if (!this.dirtyPixels) {
      console.error('Dirty pixels array is not initialized');
      return;
    }
    if (!this.pixelData) {
      console.error('Pixel data is not initialized');
      return;
    }
    if (this.dirtyPixels.length === 0) {
      return; // No need to update if nothing has changed
    }

    if (this.texture == null) {
      console.error('Texture is not initialized');
      return;
    }

    try {
      for (const { x, y } of this.dirtyPixels) {
        const index = (y * this.width + x) * 4;

        // Ensure index is within bounds
        if (index < 0 || index + 5 > this.pixelData.buffer.byteLength) {
          throw new Error(`Index out of bounds: ${index}, x:${x}${y}`);
        }

        const pixel = new Uint8Array(this.pixelData.buffer, index, 4);

        // Ensure the texture is bound before updating

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        // Check for errors before the call
        let error = this.gl.getError();
        if (error !== this.gl.NO_ERROR) {
          throw new Error(`WebGL error before texSubImage2D: ${error}`);
        }

        this.gl.texSubImage2D(
          this.gl.TEXTURE_2D,
          0,
          x + 1,
          y + 1,
          1,
          1,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          pixel
        );

        // Check for errors after the call
        error = this.gl.getError();
        if (error !== this.gl.NO_ERROR) {
          throw new Error(`WebGL error after texSubImage2D: ${error}`);
        }
        this.errors = [];
      }
    } catch (error) {
      this.errors.push(error);
      console.log(this.pixelData.buffer);
      console.error('Error updating dirty pixels:', error);
    }

    this.dirtyPixels = []; // Clear the dirty pixels after updating
    this.render();
  }

  render(): void {
    console.log('Rendering...');
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
}
