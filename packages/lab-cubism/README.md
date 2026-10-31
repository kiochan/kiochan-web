# Cubism Workbench

Independent workspace package: @kiochan/lab-cubism.

## Origin and maintenance

Original project: https://github.com/kiochan/react-cubism

Further development continues in this package in the Kiochan monorepo. The old repository is a historical reference. No old repository settings or contents are changed by this migration.

## Implementation

A resource-free integration boundary inspired by react-cubism, plus a working local model3.json inspector. No SDK Core, framework vendor tree, shaders, sample models, moc3 files, motions, or textures are imported from the original repository.

## Use

createCubismAdapter(bindings, shaderDirectory) supplies the basic WebGL 2 rendering path: model manifest resolution, MOC loading, texture creation, fit/zoom/pan matrices, drawing, and idempotent resource cleanup. Bindings are the host's already-initialized, authorized Cubism SDK classes; the shader directory is also host-provided. No SDK is fetched or initialized implicitly. The adapter handles model switches through the viewer's abort signal. It currently renders the base model; motion, physics, expression controls, and multi-model compositing from the historical project are not migrated.

Example host integration, after the host has initialized its licensed SDK:

```tsx
const adapter = createCubismAdapter(
  authorizedSdkBindings,
  authorizedShaderDirectory,
);
<Live2DViewer
  adapter={adapter}
  modelUrl="/authorized-models/own/model.model3.json"
/>;
```

Keep adapter identity stable between renders. The public route intentionally does not wire this example to any assets. Actual model rendering remains unverified until authorized SDK bindings and models are supplied.

The public page inspects file references locally and never uploads the manifest or follows its asset paths. It does not render Live2D models. Actual rendering remains unavailable until the host provides an authorized runtime adapter and model assets.

Open /lab/cubism using `pnpm dev` at the workspace root. Run `pnpm --filter @kiochan/lab-cubism typecheck` to check this package. Its React peer must be compatible with the host; it does not own Next.js routing or website navigation.

## Source and verification

src/viewer.tsx exports Live2DViewer, CubismAdapter, and CubismSession. The host supplies adapter({canvas, modelUrl, signal}), returning render(delta, view), resize(width,height), and dispose(). Adapters must clean up partial initialization on rejection or abort. Late results are disposed; unmount aborts loading, cancels animation, disconnects resize observation, and disposes the active session. src/manifest.ts validates Version 3 references. Authorized renderer integration is intentionally not tested against a bundled model.

The host provides semantic --kio-* CSS tokens. Shared experiment controls and canvas lifecycle live in @kiochan/lab-ui. All controls, comments, and documentation use English.
