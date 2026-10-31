import { inspectManifest } from "./manifest.ts";
import type { CubismAdapter, CubismSession, ViewTransform } from "./viewer";

export interface CubismModel {
  update(): void;
  getCanvasWidth(): number;
  getCanvasHeight(): number;
}
export interface CubismMoc {
  createModel(): CubismModel | null;
  deleteModel(model: CubismModel): void;
  release(): void;
}
export interface CubismMatrix {
  scale(x: number, y: number): void;
  scaleRelative(x: number, y: number): void;
  translateRelative(x: number, y: number): void;
  multiplyByMatrix(matrix: CubismMatrix): void;
}
export interface CubismModelMatrix extends CubismMatrix {
  setWidth(width: number): void;
}
export interface CubismRenderer {
  initialize(model: CubismModel): void;
  startUp(gl: WebGL2RenderingContext): void;
  setIsPremultipliedAlpha(value: boolean): void;
  bindTexture(index: number, texture: WebGLTexture): void;
  setMvpMatrix(matrix: CubismMatrix): void;
  setRenderState(
    framebuffer: WebGLFramebuffer | null,
    viewport: number[],
  ): void;
  drawModel(shaderDirectory: string): void;
  release(): void;
}
export interface CubismBindings {
  CubismMoc: {
    create(data: ArrayBuffer, checkConsistency: boolean): CubismMoc | null;
  };
  CubismMatrix44: new () => CubismMatrix;
  CubismModelMatrix: new (width: number, height: number) => CubismModelMatrix;
  CubismRenderer_WebGL: new (width: number, height: number) => CubismRenderer;
}

// The caller initializes its licensed SDK before providing these bindings.
// The adapter never downloads or executes an SDK script.
export function createCubismAdapter(
  sdk: CubismBindings,
  shaderDirectory: string,
): CubismAdapter {
  return async ({ canvas, modelUrl, signal }) => {
    const manifestUrl = new URL(modelUrl, canvas.ownerDocument.baseURI);
    const resourceUrl = (file: string) => {
      const url = new URL(file, manifestUrl);
      if (
        url.origin !== manifestUrl.origin ||
        !["http:", "https:"].includes(url.protocol)
      )
        throw new Error("Model resources must use the model's HTTP origin.");
      return url;
    };
    const get = async (url: URL) => {
      const response = await fetch(url, { signal, credentials: "same-origin" });
      if (!response.ok)
        throw new Error("A model resource could not be loaded.");
      return response;
    };
    const text = await (await get(manifestUrl)).text();
    const settings = inspectManifest(text);
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
    });
    if (!gl) throw new Error("WebGL 2 is required.");
    let moc: CubismMoc | null = null,
      model: CubismModel | null = null,
      renderer: CubismRenderer | undefined;
    const textures: WebGLTexture[] = [];
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      try {
        renderer?.release();
      } finally {
        for (const texture of textures) gl.deleteTexture(texture);
        if (moc && model) moc.deleteModel(model);
        moc?.release();
      }
    };
    try {
      signal.throwIfAborted();
      moc = sdk.CubismMoc.create(
        await (await get(resourceUrl(settings.moc))).arrayBuffer(),
        true,
      );
      model = moc?.createModel() ?? null;
      if (!model) throw new Error("The SDK could not create the model.");
      renderer = new sdk.CubismRenderer_WebGL(canvas.width, canvas.height);
      renderer.initialize(model);
      renderer.startUp(gl);
      renderer.setIsPremultipliedAlpha(true);
      for (const [index, file] of settings.textures.entries()) {
        const blob = await (await get(resourceUrl(file))).blob();
        const image = await createImageBitmap(blob, {
          premultiplyAlpha: "premultiply",
        });
        try {
          signal.throwIfAborted();
          const texture = gl.createTexture();
          if (!texture) throw new Error("Could not allocate a texture.");
          textures.push(texture);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image,
          );
          renderer.bindTexture(index, texture);
        } finally {
          image.close();
        }
      }
      signal.throwIfAborted();
      const activeModel = model,
        activeRenderer = renderer;
      const session: CubismSession = {
        resize(width, height) {
          gl.viewport(0, 0, width, height);
        },
        render(_delta: number, view: ViewTransform) {
          if (disposed) return;
          const modelMatrix = new sdk.CubismModelMatrix(
            activeModel.getCanvasWidth(),
            activeModel.getCanvasHeight(),
          );
          modelMatrix.setWidth(2);
          const projection = new sdk.CubismMatrix44();
          projection.scale(1, canvas.width / canvas.height);
          projection.multiplyByMatrix(modelMatrix);
          projection.translateRelative(view.panX, view.panY);
          projection.scaleRelative(
            Math.max(0.1, Math.min(5, view.zoom)),
            Math.max(0.1, Math.min(5, view.zoom)),
          );
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          activeModel.update();
          activeRenderer.setMvpMatrix(projection);
          activeRenderer.setRenderState(null, [
            0,
            0,
            canvas.width,
            canvas.height,
          ]);
          activeRenderer.drawModel(shaderDirectory);
        },
        dispose,
      };
      return session;
    } catch (error) {
      dispose();
      throw error;
    }
  };
}
