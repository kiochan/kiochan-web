import type { Frame, Layer } from "./project";

const vertex = `#version 300 es
precision highp float;
uniform vec2 counts;
uniform vec2 dimensions;
uniform vec2 offset;
uniform float angle;
uniform float layoutAngle;
uniform float stagger;
out vec2 uv;
void main() {
  vec2 corners[6] = vec2[6](vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1));
  uv = corners[gl_VertexID];
  int copies = int(counts.x * counts.y);
  int item = gl_InstanceID % copies;
  int wrap = gl_InstanceID / copies;
  float row = floor(float(item) / counts.x);
  vec2 center = (vec2(mod(float(item), counts.x), row) + .5) / counts;
  center.x += mod(row, 2.) * stagger / counts.x;
  vec2 relative = center - .5;
  center = mat2(cos(layoutAngle), sin(layoutAngle), -sin(layoutAngle), cos(layoutAngle)) * relative + .5;
  center = fract(center + offset);
  vec2 p = (uv - .5) * dimensions;
  p = mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * p;
  p += center + vec2(float(wrap % 3) - 1., float(wrap / 3) - 1.);
  gl_Position = vec4(p.x * 2. - 1., 1. - p.y * 2., 0., 1.);
}`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D image;
uniform float opacity;
uniform bool pixelMode;
in vec2 uv;
out vec4 color;
float cubic(float x) {
  x = abs(x);
  if (x <= 1.) return (1.5 * x - 2.5) * x * x + 1.;
  if (x < 2.) return ((-.5 * x + 2.5) * x - 4.) * x + 2.;
  return 0.;
}
vec4 sharpSample(ivec2 size) {
  vec2 at = uv * vec2(size) - .5;
  ivec2 base = ivec2(floor(at));
  vec2 fraction = fract(at);
  vec4 result = vec4(0.);
  for (int y = -1; y <= 2; y++) {
    for (int x = -1; x <= 2; x++) {
      vec4 value = texelFetch(image, clamp(base + ivec2(x, y), ivec2(0), size - 1), 0);
      result += value * cubic(float(x) - fraction.x) * cubic(float(y) - fraction.y);
    }
  }
  return result;
}
void main() {
  ivec2 size = textureSize(image, 0);
  vec2 dx = dFdx(uv), dy = dFdy(uv);
  float footprint = max(length(dx * vec2(size)), length(dy * vec2(size)));
  vec4 c;
  if (pixelMode) c = texelFetch(image, clamp(ivec2(floor(uv * vec2(size))), ivec2(0), size - 1), 0);
  else {
    c = textureGrad(image, uv, dx, dy);
    if (footprint < 1.25) c = mix(sharpSample(size), c, smoothstep(.75, 1.25, footprint));
  }
  // Filter premultiplied samples, then bound cubic overshoot at alpha edges.
  c = clamp(c, 0., 1.);
  c.rgb = min(c.rgb, vec3(c.a));
  color = c * opacity;
}`;
const screenVertex = `#version 300 es
out vec2 uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  uv = p;
  gl_Position = vec4(p * 2. - 1., 0., 1.);
}`;
const screenFragment = `#version 300 es
precision highp float;
uniform sampler2D image;
uniform float repeats;
in vec2 uv;
out vec4 color;
void main() { color = texture(image, uv * repeats); }`;

export class TextureRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private screen: WebGLProgram;
  private target: WebGLTexture;
  private framebuffer: WebGLFramebuffer;
  private textures = new Map<
    string,
    { texture: WebGLTexture; width: number; height: number }
  >();
  private resolution = 0;
  private anisotropy: EXT_texture_filter_anisotropic | null;
  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl)
      throw new Error(
        "WebGL2 is unavailable. Enable hardware acceleration or use a WebGL2-capable browser.",
      );
    this.gl = gl;
    this.anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");
    this.program = this.link(vertex, fragment);
    this.screen = this.link(screenVertex, screenFragment);
    const target = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!target || !framebuffer)
      throw new Error("Unable to allocate GPU resources.");
    this.target = target;
    this.framebuffer = framebuffer;
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }
  private link(vs: string, fs: string) {
    const gl = this.gl;
    const program = gl.createProgram();
    if (!program) throw new Error("Unable to create shader program.");
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vs],
      [gl.FRAGMENT_SHADER, fs],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Unable to create shader.");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        gl.deleteProgram(program);
        throw new Error(message ?? "Shader compilation failed.");
      }
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      throw new Error("Shader linking failed.");
    }
    return program;
  }
  upload(id: string, image: ImageBitmap) {
    const gl = this.gl;
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    if (image.width > max || image.height > max)
      throw new Error(`Image exceeds this GPU's ${max}px texture limit.`);
    const texture = gl.createTexture();
    if (!texture) throw new Error("Unable to allocate image texture.");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // ImageBitmap uploads use the bitmap's premultiplied-alpha decode option.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (this.anisotropy) {
      gl.texParameterf(
        gl.TEXTURE_2D,
        this.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
        Math.min(
          8,
          gl.getParameter(this.anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT),
        ),
      );
    }
    gl.generateMipmap(gl.TEXTURE_2D);
    const previous = this.textures.get(id);
    if (previous) gl.deleteTexture(previous.texture);
    this.textures.set(id, {
      texture,
      width: image.width,
      height: image.height,
    });
  }
  retain(ids: Set<string>) {
    for (const [id, value] of this.textures)
      if (!ids.has(id)) {
        this.gl.deleteTexture(value.texture);
        this.textures.delete(id);
      }
  }
  has(id: string) {
    return this.textures.has(id);
  }
  render(frame: Frame, repeats: number, present = true) {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const size = frame.size;
    if (
      size >
      Math.min(
        gl.getParameter(gl.MAX_TEXTURE_SIZE),
        gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      )
    )
      throw new Error("Output resolution exceeds this GPU's limit.");
    if (this.resolution !== size) {
      this.canvas.width = this.canvas.height = size;
      gl.bindTexture(gl.TEXTURE_2D, this.target);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        size,
        size,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      this.resolution = size;
    }
    gl.viewport(0, 0, size, size);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.target,
      0,
    );
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error(
        "GPU could not allocate the output canvas. Try a smaller resolution.",
      );
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook.
    gl.useProgram(this.program);
    for (const layer of frame.layers) if (layer.visible) this.drawLayer(layer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!present) {
      if (gl.getError() !== gl.NO_ERROR)
        throw new Error("GPU rendering failed during TIFF export.");
      return;
    }
    gl.disable(gl.BLEND);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook.
    gl.useProgram(this.screen);
    gl.bindTexture(gl.TEXTURE_2D, this.target);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1f(gl.getUniformLocation(this.screen, "repeats"), repeats);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (gl.getError() !== gl.NO_ERROR)
      throw new Error(
        "GPU rendering failed. Try fewer images or a smaller output.",
      );
  }
  private drawLayer(layer: Layer) {
    const source = this.textures.get(layer.asset);
    if (!source) return;
    const gl = this.gl;
    const at = (name: string) => gl.getUniformLocation(this.program, name);
    const aspect = source.width / source.height;
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform2f(at("counts"), layer.columns, layer.rows);
    gl.uniform2f(
      at("dimensions"),
      layer.size * Math.min(1, aspect),
      layer.size * Math.min(1, 1 / aspect),
    );
    gl.uniform2f(at("offset"), layer.x, layer.y);
    gl.uniform1f(at("angle"), (layer.rotation * Math.PI) / 180);
    gl.uniform1f(at("layoutAngle"), (layer.layoutAngle * Math.PI) / 180);
    gl.uniform1i(at("pixelMode"), layer.sampling === "pixel" ? 1 : 0);
    gl.uniform1f(at("stagger"), layer.stagger);
    gl.uniform1f(at("opacity"), layer.opacity);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, layer.columns * layer.rows * 9);
  }
  readTile(): Uint8Array<ArrayBuffer> {
    const gl = this.gl;
    if (gl.isContextLost())
      throw new Error(
        "GPU context lost during TIFF export. Please try again after recovery.",
      );
    const size = this.resolution;
    const pixels = new Uint8Array(size * size * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    try {
      gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      if (gl.getError() !== gl.NO_ERROR)
        throw new Error("Unable to read TIFF pixels from the GPU.");
    } finally {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    // Flip WebGL's bottom-up rows and convert premultiplied alpha to straight RGBA.
    const stride = size * 4;
    const row = new Uint8Array(stride);
    for (let y = 0; y < Math.floor(size / 2); y++) {
      const top = y * stride,
        bottom = (size - y - 1) * stride;
      row.set(pixels.subarray(top, top + stride));
      pixels.copyWithin(top, bottom, bottom + stride);
      pixels.set(row, bottom);
    }
    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      for (let c = 0; c < 3; c++)
        pixels[i + c] = alpha
          ? Math.min(255, Math.round((pixels[i + c] * 255) / alpha))
          : 0;
    }
    return pixels;
  }
  dispose() {
    const gl = this.gl;
    for (const source of this.textures.values())
      gl.deleteTexture(source.texture);
    this.textures.clear();
    gl.deleteTexture(this.target);
    gl.deleteFramebuffer(this.framebuffer);
    gl.deleteProgram(this.program);
    gl.deleteProgram(this.screen);
  }
}
