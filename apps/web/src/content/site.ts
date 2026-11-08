export const profile = {
  name: "Kiochan",
  github: "https://github.com/kiochan",
  source: "https://github.com/kiochan/kiochan-web",
  linkedin: "https://www.linkedin.com/in/xingchen-sun-275b6211b/",
  description:
    "Web projects, interactive experiments, and practical tools by Kiochan.",
};

export const home = {
  title: "Projects & experiments",
  introduction:
    "Practical tools, interactive experiments, and the source behind them. Start with Panel Tools or explore the lab.",
  aboutTitle: "Hi, I’m Kiochan.",
  aboutIntroduction:
    "I build web interfaces, interactive graphics, and Windows tools. I enjoy connecting ideas to something you can open, use, and explore.",
} as const;

export const panelTools = {
  slug: "panel-tools",
  name: "Panel Tools",
  category: "Windows desktop tool",
  summary:
    "Bring Photoshop panels close to your pointer with configurable shortcuts, panel mirroring, and real-window recall.",
  repository: "https://github.com/kiochan/photoshop-panel-tools",
  stack: ["C#", ".NET 8", "WinForms", "Windows x64"],
  status: "Experimental trial",
  compatibility:
    "Targets Photoshop 2019 and later on Windows x64. Photoshop runtime compatibility has not been verified.",
  features: [
    {
      title: "Five configurable slots",
      text: "Bind a panel, mode, and shortcut to each slot. Default Alt+1–5 shortcuts toggle summon and close or restore.",
    },
    {
      title: "Mirror or move",
      text: "Mirror a panel and forward mouse-compatible messages, or temporarily move an explicitly bound floating panel and restore its recorded position.",
    },
    {
      title: "Recovery and limits",
      text: "Recovery records support restoring moved panels. Native pen pressure, tilt, eraser, and Wintab forwarding are not implemented.",
    },
  ],
} as const;

export const colorPicker = {
  slug: "kio-color-picker",
  name: "Kio Color Picker",
  category: "Photoshop plugin",
  summary:
    "A Photoshop color picker with a hue wheel, saturation and brightness diamond, RGB sliders, and linked colors.",
  repository: "https://github.com/kiochan/kio-color-picker-photoshop",
  stack: ["Photoshop UXP", "React", "TypeScript"],
  status: "Experimental",
  compatibility:
    "Targets Windows 11 and Photoshop 2026 (27.x) with Adobe UXP WebView Support. Photoshop compatibility is still being tested.",
  features: [
    {
      title: "Color controls",
      text: "Choose colors using a hue wheel, saturation and brightness diamond, RGB sliders, or HEX input.",
    },
    {
      title: "Foreground and background",
      text: "Switch between foreground and background swatches and optionally link their colors.",
    },
  ],
} as const;

export const projectCatalog = [panelTools, colorPicker] as const;

export const about = {
  introduction:
    "I build web interfaces, interactive graphics, and practical desktop tools. My public projects connect React and TypeScript with browser rendering, native Windows APIs, and repeatable builds.",
  perspective:
    "The strongest thread across these projects is integration: connecting an interface to a rendering engine, a native window, or a release workflow. The public code shows hands-on work across these boundaries, rather than a single narrow stack.",
  skills: [
    {
      title: "React & TypeScript",
      text: "Typed component APIs, stateful controls, and reusable viewer interfaces. The public react-cubism library exposes model parameters, view transforms, and event callbacks through React.",
      evidence: "react-cubism",
      url: "https://github.com/kiochan/react-cubism/blob/dev/packages/live2d-react/src/Live2DViewer.tsx",
      tags: ["React", "TypeScript", "Component APIs"],
    },
    {
      title: "Interactive graphics",
      text: "Browser experiments combine rendering and simulation. Liquid Playground connects React controls to a WebAssembly physics engine and a canvas-based renderer.",
      evidence: "Liquid Playground",
      url: "https://github.com/kiochan/liquid-playground/blob/dev/src/components/FluidSimulation.tsx",
      tags: ["Canvas", "WebAssembly", "Simulation"],
    },
    {
      title: "Windows tooling",
      text: "Panel Tools brings C# and WinForms together with native window handling, configurable hotkeys, and panel recovery. Its Photoshop runtime compatibility remains unverified.",
      evidence: "Panel Tools",
      url: "https://github.com/kiochan/photoshop-panel-tools",
      tags: ["C#", ".NET", "WinForms", "Windows APIs"],
    },
    {
      title: "Builds & delivery",
      text: "Panel Tools uses GitHub Actions for checked Windows builds, packaged artifacts, and separate development and production publication. Build checks are kept distinct from runtime verification.",
      evidence: "Panel Tools CI",
      url: "https://github.com/kiochan/photoshop-panel-tools/blob/dev/.github/workflows/ci.yml",
      tags: ["GitHub Actions", "Packaging", "CI/CD"],
    },
  ],
  attribution:
    "Some public repositories are forks or experiments. Lattice Generator credits MoonMoonCha’s original work and describes this fork as independently maintained. Repository presence alone is not a claim of original authorship.",
  attributionUrl: "https://github.com/kiochan/lattice-generator",
} as const;

// Notes are retained as drafts while the public section is paused.
export const notes = [
  {
    slug: "a-theme-without-a-framework",
    title: "A shared theme should not choose your framework.",
    category: "Design systems",
    summary:
      "Separating the visual language from the components that happen to use it.",
    introduction:
      "A consistent website does not require every application to use the same component library. The useful boundary is between the visual decisions and the code that consumes them.",
    sections: [
      {
        heading: "Start with meaning",
        paragraphs: [
          "A canvas color, readable text, and a brand accent describe what a design needs. They do not describe a React component. Here, these decisions are plain CSS variables with a --kio- prefix, distributed by packages/theme.",
          "That package has no React, Tailwind, or shadcn dependencies. Another application can import the stylesheet and keep its own rendering model.",
        ],
      },
      {
        heading: "Let the application do the adapting",
        paragraphs: [
          "The Next.js application maps shared tokens to Tailwind utilities and shadcn variable names. These adapters belong to the application. Replacing a component library should change an adapter, not redefine the brand palette.",
          "The dependency runs in one direction: the application depends on the theme, while the theme knows nothing about the application.",
        ],
      },
      {
        heading: "Keep preference separate from color",
        paragraphs: [
          "Light, dark, and system are user preferences. The website remembers the choice locally and resolves it to a data-theme attribute. CSS supplies the colors from the shared package.",
          "JavaScript decides which mode is active; it does not duplicate the palette. That small contract remains useful when the rest of the stack changes.",
        ],
      },
    ],
  },
  {
    slug: "from-commit-to-production",
    title: "Making a small deployment predictable.",
    category: "Building for the web",
    summary:
      "Versioned images, migrations before replacement, and checks that ask useful questions.",
    introduction:
      "A personal website still deserves a repeatable release process. This site's deployment separates a few responsibilities so a release is easier to understand and recover from.",
    sections: [
      {
        heading: "Identify the release",
        paragraphs: [
          "A production push runs lint, TypeScript checks, a build, and container integration checks. The workflow publishes a website image and a migration image identified by the same commit SHA.",
          "The server deploys that exact pair. A mutable tag is convenient, but a commit-specific tag answers the important question: which code is actually being deployed?",
        ],
      },
      {
        heading: "Give the database its own lifecycle",
        paragraphs: [
          "PostgreSQL is an independent service with persistent storage. The website has its own database and restricted login. Replacing a web container does not recreate the database service.",
          "Deployment creates a backup and applies checked-in Prisma migrations before replacing the website. Schema changes must remain compatible with the previous image, because an image rollback does not undo a migration.",
        ],
      },
      {
        heading: "Check more than the process",
        paragraphs: [
          "The release checks web health, a real database query, the public page, and its generated stylesheet through HTTPS.",
          "If local health checks fail, the previous website image is restored when available. Backups still need an off-server copy and a tested restore procedure before they become a disaster-recovery plan.",
        ],
      },
    ],
  },
] as const;

export const textureArrayChinese: Record<string, string> = {
  "Invalid project JSON. Choose a saved Texture Array project.":
    "工程 JSON 无效，请选择已保存的 Texture Array 工程文件。",
  "Unable to decode image. Choose a valid PNG, JPEG, or WebP image.":
    "无法解码图片，请选择有效的 PNG、JPEG 或 WebP 图片。",
  "3 × 3 check": "3 × 3 拼接检查",
  "A layered TIFF needs a composite and at least one layer.":
    "分层 TIFF 需要合成图和至少一个图层。",
  "A pattern starts with an image.": "从一张图片开始创作。",
  "A project supports up to 12 source images.": "每个工程最多支持 12 张原图。",
  "Add PNG, JPEG, or WebP images above.":
    "请在上方添加 PNG、JPEG 或 WebP 图片。",
  "Add images": "添加图片",
  "Array angle (°)": "阵列角度（°）",
  "Cancel export": "取消导出",
  "Change image scaling": "更改图像采样方式",
  "Change output size": "更改输出尺寸",
  "Change {setting}": "更改{setting}",
  "Choose PNG, JPEG, or WebP images of up to 8 MB each.":
    "请选择 PNG、JPEG 或 WebP 图片，每张不超过 8 MB。",
  Columns: "列数",
  "Diagonal 45°": "45° 斜排",
  "Diagonal array preset": "应用斜排预设",
  "Drag to pan · Arrow keys to move · Fit to reset":
    "拖动平移 · 方向键移动 · 点击适应画布复位",
  Duplicate: "复制",
  "Duplicate image identifiers.": "原图标识重复。",
  "Duplicate layer": "复制图层",
  "Duplicate layer identifiers.": "图层标识重复。",
  "Edit history": "操作历史",
  "Edits keep original image bytes intact. Save project includes sources and up to 100 history states; editing an earlier state replaces its redo branch. Files stay in this browser tab and are not uploaded. Save before leaving or starting a new project.":
    "编辑不会改写原图文件。保存工程会包含原图及最多 100 条历史状态；从较早状态继续编辑会替换其后的重做分支。文件仅保留在当前浏览器标签页中，不会上传。离开页面或新建工程前请先保存。",
  "Encoding TIFF layer {current} of {total}…":
    "正在编码 TIFF 图层 {current}/{total}…",
  "Export layered TIFF": "导出分层 TIFF",
  "Finishing layered TIFF…": "正在生成分层 TIFF 文件…",
  Fit: "适应画布",
  "Fitted center spacing: X {x}% · Y {y}% of tile. Uniform seamless repeats use discrete spacing steps.":
    "实际中心间距：横向占画布 {x}% · 纵向占画布 {y}%。均匀无缝排列会按可用的周期档位匹配间距。",
  "GPU context lost during TIFF export. Please try again after recovery.":
    "TIFF 导出期间 GPU 上下文丢失，请待恢复后重试。",
  "GPU context lost. Your project is still available to save. Restore the context or reload your saved project.":
    "GPU 上下文已丢失，工程仍可保存。请等待恢复，或重新载入已保存的工程。",
  "GPU could not allocate the output canvas. Try a smaller resolution.":
    "GPU 无法分配输出画布，请尝试较低分辨率。",
  "GPU rendering failed during TIFF export.": "TIFF 导出期间 GPU 渲染失败。",
  "GPU rendering failed. Try fewer images or a smaller output.":
    "GPU 渲染失败，请减少图片数量或降低输出尺寸。",
  "Grid array": "规则网格",
  "Grid array preset": "应用网格预设",
  "Half-drop array": "错行阵列",
  "Half-drop array preset": "应用错行预设",
  "Half-drop shifts neighboring rows by about half a cell. The repeat is fitted to the square edges.":
    "错行阵列将相邻行错开约半个单元，并匹配正方形边缘的无缝周期。",
  Hide: "隐藏",
  "Hide layer": "隐藏图层",
  "Horizontal spacing (%)": "横向间距（%）",
  "Image exceeds this GPU's {size}px texture limit.":
    "图片超过此 GPU 的 {size} 像素纹理尺寸限制。",
  "Image rotation (°)": "图片旋转（°）",
  "Image scaling": "图像采样",
  "Images are still loading. Please try again.": "图片仍在加载，请稍后重试。",
  "Import {count} image(s)": "导入 {count} 张图片",
  "Invalid TIFF image dimensions or pixels.": "TIFF 图像尺寸或像素数据无效。",
  "Invalid image sampling mode.": "图像采样模式无效。",
  "Invalid lattice settings.": "周期网格参数无效。",
  "Invalid layer source.": "图层原图引用无效。",
  "Invalid or oversized image source.": "原图数据无效或超过大小限制。",
  "Invalid output resolution.": "输出分辨率无效。",
  "Invalid project history.": "工程历史记录无效。",
  "Invalid project setting.": "工程参数无效。",
  "Invalid project structure.": "工程文件结构无效。",
  "Invalid project text.": "工程文本字段无效。",
  "LAYERS & ARRAY": "图层与阵列",
  "Later layers draw on top. Size preserves the original aspect ratio.":
    "靠后的图层显示在上方。调整大小时保留原图宽高比。",
  "Loading texture editor": "正在加载贴图编辑器",
  "Local images. Editable arrays. One seamless square.":
    "本地图片，可编辑阵列，一张无缝正方形贴图。",
  "Move down": "下移",
  "Move layer down": "下移图层",
  "Move layer up": "上移图层",
  "Move up": "上移",
  "New project": "新建工程",
  "No images yet.": "尚未添加图片。",
  "Offset X (%)": "横向偏移（%）",
  "Offset Y (%)": "纵向偏移（%）",
  "Opacity (%)": "不透明度（%）",
  "Open project": "打开工程",
  "Output resolution exceeds this GPU's limit.":
    "输出分辨率超过此 GPU 的限制。",
  "Output size": "输出尺寸",
  "Periodic lattice enumeration failed.": "周期网格生成失败。",
  "Pixel · Hard edges": "像素模式 · 保留硬边缘",
  "Preparing TIFF composite…": "正在准备 TIFF 合成图…",
  "Processing local files…": "正在处理本地文件…",
  "Project exceeds the 70 MB limit.": "工程文件超过 70 MB 限制。",
  Redo: "重做",
  Remove: "删除",
  "Remove layer": "删除图层",
  "Reset spacing": "重置间距",
  "Row stagger (%)": "行错位（%）",
  Rows: "行数",
  "Save project": "保存工程",
  "Shader linking failed.": "着色器链接失败。",
  "Shader compilation failed.": "着色器编译失败。",
  "Sharp balances detail and smooth edges. Pixel preserves hard pixels and may alias when reduced. Zoom reveals output pixels without extra smoothing.":
    "清晰模式兼顾细节与平滑边缘。像素模式保留硬像素边缘，缩小时可能产生锯齿。放大预览直接显示输出像素，不再额外柔化。",
  "Sharp · Smooth edges": "清晰模式 · 平滑边缘",
  Show: "显示",
  "Show layer": "显示图层",
  "Single tile": "单张贴图",
  "Size (% of tile)": "大小（占画布 %）",
  "Something went wrong.": "操作失败，请重试。",
  "Source images exceed the project's 48 MB binary budget.":
    "原图总大小超过工程约 48 MB 的限制。",
  "Source images must be at most 8192px per side and 32 megapixels.":
    "原图每边最多 8192 像素，总像素数最多 3200 万。",
  "Spacing follows the rotated array axes. 100% uses the Columns and Rows baseline; higher values spread motifs apart without resizing the images.":
    "间距沿旋转后的阵列两轴调整。100% 使用当前列数和行数的基准间距；数值越大，图案越疏，图片本身大小不变。",
  "Square seamless texture preview": "正方形无缝贴图预览",
  "TEXTURE ARRAY / SEAMLESS WORKSPACE": "纹理阵列 / 无缝贴图工作区",
  "TIFF encoder failed. Try a smaller output size.":
    "TIFF 编码失败，请尝试较小的输出尺寸。",
  "TIFF encoder has not started.": "TIFF 编码器尚未启动。",
  "TIFF encoder returned no file.": "TIFF 编码器未生成文件。",
  "TIFF exceeds the 1.5 GB export limit. Use a smaller output size.":
    "TIFF 超过 1.5 GB 导出限制，请减小输出尺寸。",
  "TIFF export cancelled.": "已取消 TIFF 导出。",
  "TIFF export requires a browser with CompressionStream support.":
    "TIFF 导出需要支持 CompressionStream 的浏览器。",
  "TIFF keeps each rendered layer, its name, transparency, and visibility. Save project keeps original images and editable array settings.":
    "TIFF 保留各渲染图层、图层名称、透明区域和显示状态。保存工程则保留原图及可继续编辑的阵列参数。",
  "TIFF supports up to 12 editor layers.": "TIFF 最多支持 12 个编辑器图层。",
  "Texture Array editor": "纹理阵列编辑器",
  "Texture viewport. Drag to pan, or use arrow keys. Plus and minus zoom. Home resets the view.":
    "贴图视口：拖动或使用方向键平移，加减键缩放，Home 键复位。",
  "The density limit is active; both axes are adjusted proportionally.":
    "已达到密度上限，两轴间距已按比例调整。",
  "The outline is the finite preview area. 3 × 3 shows nine copies; export always saves one square tile. View movement never changes your design.":
    "边框内是有限的预览区域。3 × 3 显示九份拼接副本，导出始终保存一张正方形贴图。移动视图不会改变设计。",
  "Too many layers.": "图层数量超过限制。",
  "Transparent motifs work especially well.": "使用透明背景图案效果更佳。",
  "Unable to allocate GPU resources.": "无法分配 GPU 资源。",
  "Unable to allocate image texture.": "无法分配图片纹理。",
  "Unable to allocate lattice positions.": "无法分配阵列位置数据。",
  "Unable to construct a bounded periodic lattice.": "无法生成有界的周期网格。",
  "Unable to create shader program.": "无法创建着色器程序。",
  "Unable to create shader.": "无法创建着色器。",
  "Unable to read TIFF encoder response.": "无法读取 TIFF 编码器响应。",
  "Unable to read TIFF pixels from the GPU.": "无法从 GPU 读取 TIFF 像素。",
  "Unable to read image.": "无法读取图片。",
  Undo: "撤销",
  "Uniform repeat: {angle}° · {count} motifs per tile. The requested angle and spacing are matched to a uniform square repeat, so the actual angle and count may adjust. Image rotation stays independent.":
    "均匀周期：实际角度 {angle}° · 每张贴图 {count} 个图案。请求的角度和间距会匹配为均匀的正方形周期，因此实际角度与数量可能调整。图片自身旋转独立控制。",
  "Unsupported texture project.": "不支持此贴图工程格式或版本。",
  "Up to 12 layers per project. Remove a layer before importing more images.":
    "每个工程最多 12 个图层，请删除图层后再导入图片。",
  "Up to 12 source images per project, including images retained for undo. Start a new project to clear sources.":
    "每个工程最多保留 12 张原图，包含撤销所需的原图。新建工程可清空原图。",
  "Vertical spacing (%)": "纵向间距（%）",
  "WebGL2 is unavailable. Enable hardware acceleration or use a WebGL2-capable browser.":
    "WebGL2 不可用，请启用硬件加速或使用支持 WebGL2 的浏览器。",
  "Zoom in": "放大",
  "Zoom out": "缩小",
  "{size} × {size} · Layered TIFF": "{size} × {size} · 分层 TIFF",
};

export type Note = (typeof notes)[number];

export function readingTime(note: Note) {
  const text = [
    note.introduction,
    ...note.sections.flatMap((s) => s.paragraphs),
  ].join(" ");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

// Browser-selected translations; English remains the static rendering default.
export const translations: Record<
  string,
  { zh: string; ja: string; de: string }
> = {
  "Find me on GitHub": {
    zh: "在 GitHub 找到我",
    ja: "GitHub で見る",
    de: "Auf GitHub finden",
  },
  "Browse public repositories": {
    zh: "浏览公开仓库",
    ja: "公開リポジトリを見る",
    de: "Öffentliche Repositories ansehen",
  },
  "Original project": {
    zh: "原始项目",
    ja: "元のプロジェクト",
    de: "Ursprüngliches Projekt",
  },
  "Package source & README": {
    zh: "包源码与 README",
    ja: "パッケージのソースと README",
    de: "Paketquellcode & README",
  },

  "Practical tools, interactive experiments, and the source behind them. Start with Panel Tools or explore the lab.":
    {
      zh: "实用工具、交互实验，以及它们背后的源码。从 Panel Tools 开始，或到实验室动手试试。",
      ja: "実用的なツール、インタラクティブな実験、そしてそのソース。Panel Tools を見たり、ラボで試したりできます。",
      de: "Praktische Werkzeuge, interaktive Experimente und der Quellcode dahinter. Starte mit Panel Tools oder entdecke das Labor.",
    },
  "Hi, I’m Kiochan.": {
    zh: "你好，我是 Kiochan。",
    ja: "こんにちは、Kiochan です。",
    de: "Hallo, ich bin Kiochan.",
  },
  "I build web interfaces, interactive graphics, and Windows tools. I enjoy connecting ideas to something you can open, use, and explore.":
    {
      zh: "我构建网页界面、交互图形和 Windows 工具，喜欢把想法变成可以打开、使用和探索的东西。",
      ja: "ウェブ UI、インタラクティブなグラフィックス、Windows ツールを作っています。アイデアを、開いて使って試せるものにするのが好きです。",
      de: "Ich entwickle Weboberflächen, interaktive Grafiken und Windows-Werkzeuge. Ich mache aus Ideen gerne etwas, das man öffnen, nutzen und erkunden kann.",
    },
  "More about me": {
    zh: "更多关于我",
    ja: "私について詳しく",
    de: "Mehr über mich",
  },

  "Windows desktop tool": {
    zh: "Windows 桌面工具",
    ja: "Windows デスクトップツール",
    de: "Windows-Desktopwerkzeug",
  },
  "Experimental trial": {
    zh: "实验性试用",
    ja: "実験的な試用版",
    de: "Experimentelle Testversion",
  },
  "Selected project": {
    zh: "精选项目",
    ja: "注目のプロジェクト",
    de: "Ausgewähltes Projekt",
  },
  "View project": {
    zh: "查看项目",
    ja: "プロジェクトを見る",
    de: "Projekt ansehen",
  },
  "Tools to use. Ideas to explore.": {
    zh: "实用工具，探索想法。",
    ja: "使えるツール。試せるアイデア。",
    de: "Werkzeuge nutzen. Ideen erkunden.",
  },
  "Read the source, try an experiment, or explore Panel Tools for Photoshop.": {
    zh: "阅读源码、体验实验，或了解为 Photoshop 开发的 Panel Tools。",
    ja: "ソースを読み、実験を試し、Photoshop 向けの Panel Tools をご覧ください。",
    de: "Lies den Quellcode, probiere ein Experiment aus oder entdecke Panel Tools für Photoshop.",
  },
  "Bring Photoshop panels close to your pointer with configurable shortcuts, panel mirroring, and real-window recall.":
    {
      zh: "通过可配置快捷键、面板镜像与真实窗口召回，将 Photoshop 面板带到指针附近。",
      ja: "設定可能なショートカット、パネルのミラー表示、実ウィンドウの呼び出しで Photoshop パネルをポインターの近くへ。",
      de: "Photoshop-Panels per konfigurierbaren Tastenkürzeln, Spiegelung und Fensterabruf in die Nähe des Mauszeigers bringen.",
    },
  "Targets Photoshop 2019 and later on Windows x64. Photoshop runtime compatibility has not been verified.":
    {
      zh: "面向 Windows x64 上的 Photoshop 2019 及更高版本。Photoshop 运行兼容性尚未验证。",
      ja: "Windows x64 の Photoshop 2019 以降を対象としています。Photoshop 上での動作互換性は未検証です。",
      de: "Ziel ist Photoshop 2019 und neuer unter Windows x64. Die Laufzeitkompatibilität mit Photoshop ist noch nicht verifiziert.",
    },
  "Five configurable slots": {
    zh: "五个可配置槽位",
    ja: "5つの設定可能なスロット",
    de: "Fünf konfigurierbare Plätze",
  },
  "Bind a panel, mode, and shortcut to each slot. Default Alt+1–5 shortcuts toggle summon and close or restore.":
    {
      zh: "为每个槽位绑定面板、模式和快捷键。默认 Alt+1–5 切换召出与关闭或恢复。",
      ja: "各スロットにパネル、モード、ショートカットを設定できます。既定の Alt+1–5 で呼び出しと終了・復元を切り替えます。",
      de: "Jedem Platz ein Panel, einen Modus und ein Tastenkürzel zuweisen. Alt+1–5 schaltet standardmäßig zwischen Aufrufen und Schließen bzw. Wiederherstellen um.",
    },
  "Mirror or move": {
    zh: "镜像或移动",
    ja: "ミラー表示または移動",
    de: "Spiegeln oder verschieben",
  },
  "Mirror a panel and forward mouse-compatible messages, or temporarily move an explicitly bound floating panel and restore its recorded position.":
    {
      zh: "镜像面板并转发兼容鼠标的消息，或临时移动已明确绑定的浮动面板，然后恢复其记录位置。",
      ja: "パネルをミラー表示してマウス互換メッセージを転送するか、明示的に登録したフローティングパネルを一時移動し、記録した位置へ復元します。",
      de: "Ein Panel spiegeln und mauskompatible Nachrichten weiterleiten oder ein ausdrücklich zugeordnetes schwebendes Panel vorübergehend verschieben und seine gespeicherte Position wiederherstellen.",
    },
  "Recovery and limits": {
    zh: "恢复与限制",
    ja: "復元と制限",
    de: "Wiederherstellung und Grenzen",
  },
  "Recovery records support restoring moved panels. Native pen pressure, tilt, eraser, and Wintab forwarding are not implemented.":
    {
      zh: "恢复记录用于还原被移动的面板。尚未实现原生压感、倾斜、橡皮擦及 Wintab 转发。",
      ja: "復元記録で移動したパネルを戻せます。ネイティブの筆圧、傾き、消しゴム、Wintab の転送は未実装です。",
      de: "Wiederherstellungsdaten helfen beim Zurücksetzen verschobener Panels. Native Weiterleitung von Stiftdruck, Neigung, Radierer und Wintab ist nicht implementiert.",
    },
  "Skills in practice": {
    zh: "实践中的技能",
    ja: "実践でのスキル",
    de: "Kompetenzen in der Praxis",
  },
  "Grounded in public code": {
    zh: "以公开代码为依据",
    ja: "公開コードに基づいて",
    de: "Auf öffentlichen Code gestützt",
  },
  "View the code": { zh: "查看代码", ja: "コードを見る", de: "Code ansehen" },
  "Origins & attribution": {
    zh: "来源与署名",
    ja: "由来とクレジット",
    de: "Herkunft und Namensnennung",
  },
  "I build web interfaces, interactive graphics, and practical desktop tools. My public projects connect React and TypeScript with browser rendering, native Windows APIs, and repeatable builds.":
    {
      zh: "我构建网页界面、交互图形和实用桌面工具。公开项目将 React、TypeScript 与浏览器渲染、原生 Windows API 及可重复构建连接起来。",
      ja: "ウェブ UI、インタラクティブなグラフィックス、実用的なデスクトップツールを作っています。公開プロジェクトでは React と TypeScript をブラウザー描画、Windows API、再現可能なビルドと組み合わせています。",
      de: "Ich entwickle Weboberflächen, interaktive Grafiken und praktische Desktopwerkzeuge. Meine öffentlichen Projekte verbinden React und TypeScript mit Browserdarstellung, nativen Windows-APIs und wiederholbaren Builds.",
    },
  "The strongest thread across these projects is integration: connecting an interface to a rendering engine, a native window, or a release workflow. The public code shows hands-on work across these boundaries, rather than a single narrow stack.":
    {
      zh: "这些项目最突出的共同点是集成：将界面连接到渲染引擎、原生窗口或发布流程。公开代码展示了跨越这些边界的实际工作，而不仅限于单一技术栈。",
      ja: "これらのプロジェクトに共通する強みは、UI と描画エンジン、ネイティブウィンドウ、リリース工程をつなぐ統合です。公開コードからは、ひとつの技術領域にとどまらない実装経験が読み取れます。",
      de: "Der stärkste gemeinsame Faden ist Integration: Oberflächen mit Rendering-Engines, nativen Fenstern oder Release-Abläufen verbinden. Der öffentliche Code zeigt praktische Arbeit über diese Grenzen hinweg.",
    },
  "React & TypeScript": {
    zh: "React 与 TypeScript",
    ja: "React と TypeScript",
    de: "React & TypeScript",
  },
  "Typed component APIs, stateful controls, and reusable viewer interfaces. The public react-cubism library exposes model parameters, view transforms, and event callbacks through React.":
    {
      zh: "类型化组件 API、有状态控件与可复用查看器界面。公开的 react-cubism 库通过 React 暴露模型参数、视图变换和事件回调。",
      ja: "型付きコンポーネント API、状態を持つ操作部、再利用できるビューアー。公開の react-cubism ライブラリは、モデルパラメーター、表示変換、イベントコールバックを React で提供します。",
      de: "Typisierte Komponenten-APIs, zustandsbehaftete Steuerungen und wiederverwendbare Viewer. Die öffentliche react-cubism-Bibliothek stellt Modellparameter, Ansichtstransformationen und Ereignis-Callbacks über React bereit.",
    },
  "Interactive graphics": {
    zh: "交互图形",
    ja: "インタラクティブグラフィックス",
    de: "Interaktive Grafik",
  },
  "Browser experiments combine rendering and simulation. Liquid Playground connects React controls to a WebAssembly physics engine and a canvas-based renderer.":
    {
      zh: "浏览器实验结合渲染与模拟。Liquid Playground 将 React 控件连接到 WebAssembly 物理引擎和基于 Canvas 的渲染器。",
      ja: "ブラウザーの実験で描画とシミュレーションを組み合わせています。Liquid Playground は React の操作部を WebAssembly 物理エンジンと Canvas 描画につなぎます。",
      de: "Browserexperimente verbinden Darstellung und Simulation. Liquid Playground verbindet React-Steuerungen mit einer WebAssembly-Physikengine und einem Canvas-Renderer.",
    },
  "Windows tooling": {
    zh: "Windows 工具开发",
    ja: "Windows ツール開発",
    de: "Windows-Werkzeuge",
  },
  "Panel Tools brings C# and WinForms together with native window handling, configurable hotkeys, and panel recovery. Its Photoshop runtime compatibility remains unverified.":
    {
      zh: "Panel Tools 结合 C#、WinForms、原生窗口操作、可配置快捷键和面板恢复。其 Photoshop 运行兼容性仍未验证。",
      ja: "Panel Tools は C# と WinForms に、ネイティブウィンドウ操作、設定可能なホットキー、パネル復元を組み合わせています。Photoshop 上での動作互換性は未検証です。",
      de: "Panel Tools verbindet C# und WinForms mit nativer Fenstersteuerung, konfigurierbaren Hotkeys und Panel-Wiederherstellung. Die Photoshop-Laufzeitkompatibilität ist noch nicht verifiziert.",
    },
  "Builds & delivery": {
    zh: "构建与交付",
    ja: "ビルドと配布",
    de: "Builds & Auslieferung",
  },
  "Panel Tools uses GitHub Actions for checked Windows builds, packaged artifacts, and separate development and production publication. Build checks are kept distinct from runtime verification.":
    {
      zh: "Panel Tools 使用 GitHub Actions 执行 Windows 构建检查、产物打包以及独立的开发和正式渠道发布。构建检查与运行时验证明确区分。",
      ja: "Panel Tools は GitHub Actions で Windows ビルドの検証、成果物のパッケージ化、開発版と正式版の個別公開を行います。ビルド検証と実行時検証は区別しています。",
      de: "Panel Tools nutzt GitHub Actions für geprüfte Windows-Builds, Pakete und getrennte Entwicklungs- und Produktionsveröffentlichungen. Build-Prüfungen und Laufzeitverifikation bleiben getrennt.",
    },
  "Some public repositories are forks or experiments. Lattice Generator credits MoonMoonCha’s original work and describes this fork as independently maintained. Repository presence alone is not a claim of original authorship.":
    {
      zh: "部分公开仓库是派生项目或实验。Lattice Generator 注明原作者 MoonMoonCha，并说明该分支独立维护。仓库存在本身并不代表原创归属。",
      ja: "公開リポジトリにはフォークや実験もあります。Lattice Generator は MoonMoonCha の原作を明記し、このフォークを独立して保守していると説明しています。リポジトリの所有だけで原作者であるとは主張しません。",
      de: "Einige öffentliche Repositories sind Forks oder Experimente. Lattice Generator nennt MoonMoonCha als Urheber und beschreibt den Fork als unabhängig gepflegt. Ein Repository zu besitzen bedeutet nicht, dessen ursprünglicher Autor zu sein.",
    },
  "Hi, I’m Kiochan. I build things for the web, explore practical ideas, and make tools to try.":
    {
      zh: "你好，我是 Kiochan。我构建网页项目、探索实用想法，也开发可以动手体验的工具。",
      ja: "こんにちは、Kiochan です。ウェブで動くものを作り、実用的なアイデアを試し、使えるツールを開発しています。",
      de: "Hallo, ich bin Kiochan. Ich entwickle fürs Web, erprobe praktische Ideen und baue Werkzeuge zum Ausprobieren.",
    },
  "This page may have moved, or the address may be incomplete. Find your way back to the projects and experiments.":
    {
      zh: "页面可能已移动，或地址不完整。请返回项目和实验继续浏览。",
      ja: "ページが移動したか、アドレスが不完全かもしれません。プロジェクトや実験から探してみてください。",
      de: "Die Seite wurde möglicherweise verschoben oder die Adresse ist unvollständig. Zurück zu den Projekten und Experimenten.",
    },

  "Source on GitHub": {
    zh: "GitHub 源码",
    ja: "GitHub のソース",
    de: "Quellcode auf GitHub",
  },
  "Explore runnable experiments in the lab or browse public repositories on GitHub.":
    {
      zh: "在实验室体验可运行的实验，或在 GitHub 浏览公开仓库。",
      ja: "ラボで実験を試したり、GitHub で公開リポジトリを閲覧できます。",
      de: "Probiere Experimente im Labor aus oder stöbere in den öffentlichen Repositories auf GitHub.",
    },
  "The source for this website is available on GitHub.": {
    zh: "本网站的源码可在 GitHub 查看。",
    ja: "このサイトのソースは GitHub で公開しています。",
    de: "Der Quellcode dieser Website ist auf GitHub verfügbar.",
  },
  "Website issues": {
    zh: "网站问题反馈",
    ja: "サイトの不具合報告",
    de: "Website-Probleme melden",
  },

  "A personal corner of the internet": {
    zh: "互联网中的个人角落",
    ja: "インターネットの小さな居場所",
    de: "Ein persönlicher Ort im Internet",
  },
  "Curiosity,": {
    zh: "好奇心，",
    ja: "好奇心を、",
    de: "Neugier,",
  },
  "turned into": {
    zh: "化为",
    ja: "かたちにする",
    de: "verwandelt in",
  },
  "code.": {
    zh: "代码。",
    ja: "コード。",
    de: "Code.",
  },
  "Hi, I’m Kiochan. I build things for the web, explore practical ideas, and keep notes along the way.":
    {
      zh: "你好，我是 Kiochan。我构建网页项目，探索实用想法，并记录过程。",
      ja: "こんにちは、Kiochan です。ウェブで動くものを作り、実用的なアイデアを試し、その過程を記録しています。",
      de: "Hallo, ich bin Kiochan. Ich entwickle fürs Web, erprobe praktische Ideen und halte meine Erfahrungen fest.",
    },
  "Explore the lab": {
    zh: "探索实验室",
    ja: "ラボを探索",
    de: "Das Labor entdecken",
  },
  "A little about me": {
    zh: "关于我",
    ja: "私について",
    de: "Über mich",
  },
  "experiments / one home": {
    zh: "个实验 / 一个家",
    ja: "の実験 / ひとつの場所",
    de: "Experimente / ein Zuhause",
  },
  "Enter the lab ↗": {
    zh: "进入实验室 ↗",
    ja: "ラボへ ↗",
    de: "Zum Labor ↗",
  },
  "01 / Selected work": {
    zh: "01 / 精选项目",
    ja: "01 / ピックアップ",
    de: "01 / Ausgewählte Projekte",
  },
  "Things I’ve been making.": {
    zh: "最近在做的东西。",
    ja: "最近作っているもの。",
    de: "Woran ich arbeite.",
  },
  "All projects": {
    zh: "所有项目",
    ja: "すべてのプロジェクト",
    de: "Alle Projekte",
  },
  "A few guiding principles": {
    zh: "一些基本原则",
    ja: "大切にしていること",
    de: "Ein paar Leitgedanken",
  },
  "Useful over complicated.": {
    zh: "实用胜于复杂。",
    ja: "複雑さより使いやすさ。",
    de: "Nützlich statt kompliziert.",
  },
  "Room to keep exploring.": {
    zh: "为探索留出空间。",
    ja: "探求を続ける余地。",
    de: "Raum zum Weiterentdecken.",
  },
  "Clear interfaces, small boundaries, and tools that earn their place. This site is a place to put those ideas into practice.":
    {
      zh: "清晰的界面、明确的边界，以及真正有用的工具。这个网站是实践这些想法的地方。",
      ja: "わかりやすい画面、小さく明確な境界、役に立つ道具。このサイトで、その考えを実践しています。",
      de: "Klare Oberflächen, überschaubare Grenzen und Werkzeuge, die sich bewähren. Auf dieser Website setze ich diese Ideen um.",
    },
  "More about this space": {
    zh: "了解这个空间",
    ja: "この場所について",
    de: "Mehr über diesen Ort",
  },
  "02 / From the notebook": {
    zh: "02 / 笔记摘录",
    ja: "02 / ノートから",
    de: "02 / Aus dem Notizbuch",
  },
  "Notes on the process.": {
    zh: "过程中的笔记。",
    ja: "制作の過程を記録。",
    de: "Notizen zum Entstehen.",
  },
  "All notes": {
    zh: "所有笔记",
    ja: "すべてのノート",
    de: "Alle Notizen",
  },
  Lab: {
    zh: "实验室",
    ja: "ラボ",
    de: "Labor",
  },
  Projects: {
    zh: "项目",
    ja: "プロジェクト",
    de: "Projekte",
  },
  Releases: {
    zh: "发布",
    ja: "リリース",
    de: "Releases",
  },
  Notes: {
    zh: "笔记",
    ja: "ノート",
    de: "Notizen",
  },
  About: {
    zh: "关于",
    ja: "紹介",
    de: "Über mich",
  },
  Contact: {
    zh: "联系",
    ja: "連絡先",
    de: "Kontakt",
  },
  "Made with care. Always a work in progress.": {
    zh: "用心构建，持续完善。",
    ja: "丁寧に作り、少しずつ育てています。",
    de: "Mit Sorgfalt gemacht. Immer in Arbeit.",
  },
  "Get in touch": {
    zh: "联系我",
    ja: "連絡する",
    de: "Kontakt aufnehmen",
  },
  "About this site": {
    zh: "关于本站",
    ja: "このサイトについて",
    de: "Über diese Website",
  },
  "Keep in touch": {
    zh: "保持联系",
    ja: "つながる",
    de: "In Verbindung bleiben",
  },
  "A question, an idea, a hello.": {
    zh: "问题、想法，或一句你好。",
    ja: "質問も、アイデアも、ご挨拶も。",
    de: "Eine Frage, eine Idee, ein Hallo.",
  },
  "Find a way to connect": {
    zh: "找到联系方式",
    ja: "連絡先を見る",
    de: "Kontaktmöglichkeiten",
  },
  "Behind the projects": {
    zh: "项目背后",
    ja: "プロジェクトの背景",
    de: "Hinter den Projekten",
  },
  "Hello, I’m Kiochan": {
    zh: "你好，我是 Kiochan",
    ja: "こんにちは、Kiochan です",
    de: "Hallo, ich bin Kiochan",
  },
  "This is where I collect what I’m building and write down the ideas worth keeping.":
    {
      zh: "这里收集我正在构建的项目，并记录值得保留的想法。",
      ja: "作っているものをまとめ、残しておきたいアイデアを書き留める場所です。",
      de: "Hier sammle ich meine Projekte und halte Ideen fest, die es wert sind.",
    },
  "My interests meet around web development, practical tools, and making software easier to live with. Some projects start with a useful problem; others start with a simple question: what happens if I try this?":
    {
      zh: "我关注网页开发、实用工具，以及如何让软件更易用。有些项目始于实际问题，有些则始于一个简单的问题：试试这个会怎样？",
      ja: "ウェブ開発や実用的なツール、使いやすいソフトウェアに関心があります。身近な課題から始まるものも、「試したらどうなる？」という疑問から始まるものもあります。",
      de: "Mich interessieren Webentwicklung, praktische Werkzeuge und Software, die den Alltag erleichtert. Manche Projekte beginnen mit einem konkreten Problem, andere mit der Frage: Was passiert, wenn ich das ausprobiere?",
    },
  "Think of this space as a working notebook. Projects have context, notes describe actual decisions, and there is always room for the next experiment.":
    {
      zh: "把这里当作一本持续更新的工作笔记：项目有背景，笔记记录真实决策，也始终为下一个实验留有空间。",
      ja: "ここは制作中のノートのような場所です。プロジェクトの背景や実際の判断を記し、次の実験の余地も残しています。",
      de: "Dieser Ort ist ein Arbeitsnotizbuch. Projekte bekommen Kontext, Notizen erklären konkrete Entscheidungen, und das nächste Experiment hat immer Platz.",
    },
  "Find me on GitHub ↗": {
    zh: "在 GitHub 找到我 ↗",
    ja: "GitHub で見る ↗",
    de: "Auf GitHub finden ↗",
  },
  "About this space": {
    zh: "关于这个空间",
    ja: "この場所について",
    de: "Über diesen Ort",
  },
  "Small pieces. Clear boundaries.": {
    zh: "小模块，清晰边界。",
    ja: "小さな部品。明確な境界。",
    de: "Kleine Bausteine. Klare Grenzen.",
  },
  "A shared palette, independent of the UI library.": {
    zh: "独立于 UI 库的共享配色。",
    ja: "UI ライブラリに依存しない共通パレット。",
    de: "Eine gemeinsame Palette, unabhängig von der UI-Bibliothek.",
  },
  "Public pages that do not need a database to render.": {
    zh: "无需数据库即可渲染的公开页面。",
    ja: "データベースなしで表示できる公開ページ。",
    de: "Öffentliche Seiten, die ohne Datenbank gerendert werden.",
  },
  "A remembered theme preference, with system mode by default.": {
    zh: "记住主题偏好，默认跟随系统。",
    ja: "テーマ設定を保存し、初期設定ではシステムに合わせます。",
    de: "Gespeicherte Theme-Einstellung, standardmäßig dem System folgend.",
  },
  "Versioned releases, with checks before deployment.": {
    zh: "带版本的发布，部署前完成检查。",
    ja: "バージョン付きリリースとデプロイ前の検証。",
    de: "Versionierte Releases mit Prüfungen vor dem Deployment.",
  },
  "Explore the site project →": {
    zh: "查看网站项目 →",
    ja: "サイトのプロジェクトを見る →",
    de: "Zum Website-Projekt →",
  },
  "Say hello": {
    zh: "打个招呼",
    ja: "ご挨拶",
    de: "Hallo sagen",
  },
  "Good things start": {
    zh: "美好的事情",
    ja: "よいことは",
    de: "Gute Dinge beginnen",
  },
  "with a conversation": {
    zh: "始于一次交流",
    ja: "会話から始まる",
    de: "mit einem Gespräch",
  },
  "Have a question, spotted a bug, or want to share an idea? You can find me on GitHub or LinkedIn. For something project-specific, its issue tracker is the best place to start.":
    {
      zh: "有问题、发现了缺陷，或想分享想法？可以在 GitHub 或 LinkedIn 找到我。与具体项目有关的问题，建议从该项目的 Issues 开始。",
      ja: "質問、不具合、アイデアがあれば GitHub や LinkedIn へどうぞ。個別のプロジェクトに関する内容は、その Issues から始めるのがおすすめです。",
      de: "Fragen, einen Fehler gefunden oder eine Idee? Du findest mich auf GitHub oder LinkedIn. Für projektspezifische Themen ist der jeweilige Issue-Tracker der beste Einstieg.",
    },
  "Connect on LinkedIn": {
    zh: "在 LinkedIn 联系我",
    ja: "LinkedIn でつながる",
    de: "Auf LinkedIn vernetzen",
  },
  "Kiochan on GitHub": {
    zh: "GitHub 上的 Kiochan",
    ja: "GitHub の Kiochan",
    de: "Kiochan auf GitHub",
  },
  "Start with a project.": {
    zh: "从项目开始。",
    ja: "プロジェクトから始める。",
    de: "Mit einem Projekt beginnen.",
  },
  "A little context makes it easier to have a useful conversation. Include the project, what you tried, and what you expected.":
    {
      zh: "提供一些背景有助于交流。请说明项目、尝试过的操作，以及预期结果。",
      ja: "背景があると話が進めやすくなります。プロジェクト名、試したこと、期待した結果を添えてください。",
      de: "Etwas Kontext hilft weiter: Nenne das Projekt, was du ausprobiert hast und welches Ergebnis du erwartet hast.",
    },
  "Questions, ideas, and issue reports": {
    zh: "问题、想法与缺陷报告",
    ja: "質問・アイデア・不具合報告",
    de: "Fragen, Ideen und Fehlermeldungen",
  },
  "The work": {
    zh: "作品",
    ja: "制作物",
    de: "Die Arbeit",
  },
  "Projects & experiments": {
    zh: "项目与实验",
    ja: "プロジェクトと実験",
    de: "Projekte & Experimente",
  },
  "A curated look at things I’ve built and explored. Each project has a little context and a path to the source.":
    {
      zh: "精选构建和探索过的项目，每个项目都附有背景介绍与源码入口。",
      ja: "作ったものや試したものをまとめました。各プロジェクトに背景とソースへのリンクがあります。",
      de: "Eine Auswahl meiner Projekte und Experimente, jeweils mit etwas Kontext und einem Weg zum Quellcode.",
    },
  "There’s more in the archive.": {
    zh: "归档中还有更多。",
    ja: "ほかの制作物もあります。",
    de: "Im Archiv gibt es mehr.",
  },
  "Browse public repositories ↗": {
    zh: "浏览公开仓库 ↗",
    ja: "公開リポジトリを見る ↗",
    de: "Öffentliche Repositories ansehen ↗",
  },
  "← All projects": {
    zh: "← 所有项目",
    ja: "← すべてのプロジェクト",
    de: "← Alle Projekte",
  },
  "Explore the source": {
    zh: "查看源码",
    ja: "ソースを見る",
    de: "Quellcode ansehen",
  },
  "A closer look": {
    zh: "进一步了解",
    ja: "詳しく見る",
    de: "Genauer betrachtet",
  },
  "Questions about this project?": {
    zh: "对这个项目有疑问？",
    ja: "このプロジェクトについて質問がありますか？",
    de: "Fragen zu diesem Projekt?",
  },
  "The notebook": {
    zh: "笔记本",
    ja: "ノートブック",
    de: "Das Notizbuch",
  },
  "Thinking out loud": {
    zh: "思考随笔",
    ja: "考えを書き留める",
    de: "Gedanken festhalten",
  },
  "Short notes on design decisions, useful boundaries, and the process of making things for the web.":
    {
      zh: "关于设计决策、实用边界和网页构建过程的简短笔记。",
      ja: "設計の判断、役立つ境界、ウェブ制作の過程についての短い記録。",
      de: "Kurze Notizen zu Designentscheidungen, sinnvollen Grenzen und der Arbeit fürs Web.",
    },
  "← All notes": {
    zh: "← 所有笔记",
    ja: "← すべてのノート",
    de: "← Alle Notizen",
  },
  "min read": {
    zh: "分钟阅读",
    ja: "分で読めます",
    de: "Min. Lesezeit",
  },
  "See these ideas in this website’s project →": {
    zh: "在网站项目中了解这些想法 →",
    ja: "サイトのプロジェクトで実例を見る →",
    de: "Diese Ideen im Website-Projekt ansehen →",
  },
  "In this note": {
    zh: "本文目录",
    ja: "このノートの内容",
    de: "In dieser Notiz",
  },
  "The lab": {
    zh: "实验室",
    ja: "ラボ",
    de: "Das Labor",
  },
  "Small ideas. Open tabs": {
    zh: "小想法，新窗口",
    ja: "小さなアイデア。開いたタブ",
    de: "Kleine Ideen. Offene Tabs",
  },
  "A home for the useful, the curious, and the just-for-fun. These are little projects to open and play with, all in one place.":
    {
      zh: "实用、好奇与纯粹乐趣的集合。在这里打开这些小项目，动手试试。",
      ja: "便利なもの、気になるもの、遊びのためのもの。開いて試せる小さなプロジェクトを集めています。",
      de: "Ein Ort für Nützliches, Neugieriges und Spaßprojekte. Kleine Projekte zum Öffnen und Ausprobieren, alle an einem Platz.",
    },
  "An evolving collection. More experiments will find their way here.": {
    zh: "持续更新的集合，更多实验会陆续加入。",
    ja: "少しずつ増えていく実験のコレクションです。",
    de: "Eine wachsende Sammlung. Weitere Experimente kommen hinzu.",
  },
  "All experiments": {
    zh: "所有实验",
    ja: "すべての実験",
    de: "Alle Experimente",
  },
  "Small projects, one home.": {
    zh: "小项目，一个家。",
    ja: "小さなプロジェクト、ひとつの場所。",
    de: "Kleine Projekte, ein Zuhause.",
  },
  "An evolving collection of things to try.": {
    zh: "持续增加的可体验项目。",
    ja: "試せるものを少しずつ増やしています。",
    de: "Eine wachsende Sammlung zum Ausprobieren.",
  },
  "Switch experiment": {
    zh: "切换实验",
    ja: "実験を切り替える",
    de: "Experiment wechseln",
  },
  "Open experiment": {
    zh: "打开实验",
    ja: "実験を開く",
    de: "Experiment öffnen",
  },
  "Read the game engine source · TypeScript": {
    zh: "阅读游戏引擎源码 · TypeScript",
    ja: "ゲームエンジンのソースを読む · TypeScript",
    de: "Spielengine-Quellcode lesen · TypeScript",
  },
  "This is the engine running above. Input, rendering, and React controls live alongside it in the project package.":
    {
      zh: "这是上方实际运行的引擎。输入处理、渲染和 React 控件位于同一个项目包中。",
      ja: "上で動いているエンジンです。入力処理、描画、React の操作部分も同じパッケージにあります。",
      de: "Dies ist die oben laufende Engine. Eingabe, Darstellung und React-Steuerung liegen im selben Projektpaket.",
    },
  "Further development continues here, in the Kiochan monorepo.": {
    zh: "后续开发在 Kiochan monorepo 中继续。",
    ja: "今後の開発は Kiochan のモノレポで続きます。",
    de: "Die Weiterentwicklung findet hier im Kiochan-Monorepo statt.",
  },
  "Original project ↗": {
    zh: "原始项目 ↗",
    ja: "元のプロジェクト ↗",
    de: "Ursprüngliches Projekt ↗",
  },
  "Package source & README ↗": {
    zh: "包源码与 README ↗",
    ja: "パッケージのソースと README ↗",
    de: "Paketquellcode & README ↗",
  },
  "Built to be used": {
    zh: "为使用而构建",
    ja: "使うためのソフトウェア",
    de: "Zum Verwenden gebaut",
  },
  "Fresh builds": {
    zh: "最新构建",
    ja: "最新ビルド",
    de: "Aktuelle Builds",
  },
  "Downloads, release notes, and the details worth reading before you install.":
    {
      zh: "下载、发布说明，以及安装前值得了解的信息。",
      ja: "ダウンロード、リリースノート、インストール前に確認したい情報。",
      de: "Downloads, Release-Notizen und Details, die du vor der Installation lesen solltest.",
    },
  "Prod · publication channel": {
    zh: "Prod · 正式发布渠道",
    ja: "Prod · 公開チャンネル",
    de: "Prod · Veröffentlichungskanal",
  },
  "Dev · development builds": {
    zh: "Dev · 开发构建",
    ja: "Dev · 開発ビルド",
    de: "Dev · Entwicklungsbuilds",
  },
  "Latest only, in each channel": {
    zh: "每个渠道仅保留最新版",
    ja: "各チャンネルの最新版のみ",
    de: "Nur die neueste Version je Kanal",
  },
  "Software release": {
    zh: "软件发布",
    ja: "ソフトウェアリリース",
    de: "Software-Release",
  },
  "Release notes & downloads": {
    zh: "发布说明与下载",
    ja: "リリースノートとダウンロード",
    de: "Release-Notizen & Downloads",
  },
  "Nothing published yet.": {
    zh: "暂未发布。",
    ja: "まだ公開されていません。",
    de: "Noch nichts veröffentlicht.",
  },
  "When a release is published, its latest downloads and installation notes will appear here. Production and development are kept separate.":
    {
      zh: "发布后，最新下载与安装说明会显示在这里。正式与开发渠道相互独立。",
      ja: "公開されると、最新のダウンロードとインストール手順がここに表示されます。正式版と開発版は別々です。",
      de: "Nach einer Veröffentlichung erscheinen hier die neuesten Downloads und Installationshinweise. Produktion und Entwicklung bleiben getrennt.",
    },
  "Explore the projects": {
    zh: "探索项目",
    ja: "プロジェクトを見る",
    de: "Projekte entdecken",
  },
  "A successful build is not the same as runtime compatibility. Check the release notes for supported targets, verification status, and known limitations.":
    {
      zh: "构建成功不代表运行时兼容。请阅读发布说明中的支持平台、验证状态及已知限制。",
      ja: "ビルド成功は動作互換性を保証しません。対応環境、検証状況、既知の制限はリリースノートをご確認ください。",
      de: "Ein erfolgreicher Build garantiert keine Laufzeitkompatibilität. Unterstützte Plattformen, Prüfstatus und bekannte Einschränkungen stehen in den Release-Notizen.",
    },
  "← All releases": {
    zh: "← 所有发布",
    ja: "← すべてのリリース",
    de: "← Alle Releases",
  },
  "The latest, in two channels": {
    zh: "两个渠道，各自最新",
    ja: "2つのチャンネルの最新版",
    de: "Das Neueste aus zwei Kanälen",
  },
  Version: {
    zh: "版本",
    ja: "バージョン",
    de: "Version",
  },
  Published: {
    zh: "发布时间",
    ja: "公開日",
    de: "Veröffentlicht",
  },
  "Latest download": {
    zh: "最新下载",
    ja: "最新版ダウンロード",
    de: "Neuester Download",
  },
  "SHA256 checksum": {
    zh: "SHA256 校验和",
    ja: "SHA256 チェックサム",
    de: "SHA256-Prüfsumme",
  },
  "Compatibility targets": {
    zh: "兼容目标",
    ja: "対応環境",
    de: "Zielplattformen",
  },
  "Only the latest build is retained in this channel. This download address stays the same when a new build is published.":
    {
      zh: "此渠道仅保留最新构建。新构建发布后，下载地址保持不变。",
      ja: "このチャンネルには最新ビルドのみを保持します。新しいビルドが公開されてもダウンロード先は変わりません。",
      de: "Dieser Kanal behält nur den neuesten Build. Die Downloadadresse bleibt bei einer neuen Veröffentlichung gleich.",
    },
  "Skip to content": {
    zh: "跳转到内容",
    ja: "本文へスキップ",
    de: "Zum Inhalt springen",
  },
  "404 / A wrong turn": {
    zh: "404 / 走错路了",
    ja: "404 / 道を間違えたようです",
    de: "404 / Falsch abgebogen",
  },
  "Nothing here. Plenty to explore.": {
    zh: "这里没有内容，还有更多可探索。",
    ja: "ここにはありませんが、ほかにも探索できます。",
    de: "Hier ist nichts. Aber viel zu entdecken.",
  },
  "This page may have moved, or the address may be incomplete. Find your way back to the projects and notes.":
    {
      zh: "页面可能已移动，或地址不完整。请返回项目和笔记继续浏览。",
      ja: "ページが移動したか、アドレスが不完全かもしれません。プロジェクトやノートから探してみてください。",
      de: "Die Seite wurde möglicherweise verschoben oder die Adresse ist unvollständig. Zurück zu den Projekten und Notizen.",
    },
  "Back home": {
    zh: "返回首页",
    ja: "ホームへ戻る",
    de: "Zur Startseite",
  },
  "Explore projects": {
    zh: "探索项目",
    ja: "プロジェクトを見る",
    de: "Projekte entdecken",
  },
  "Please wait. The content will appear here.": {
    zh: "请稍候，内容即将显示。",
    ja: "しばらくお待ちください。ここに内容が表示されます。",
    de: "Bitte warten. Der Inhalt erscheint hier.",
  },
  "Loading page": {
    zh: "正在加载页面",
    ja: "ページを読み込み中",
    de: "Seite wird geladen",
  },
  "Loading experiment": {
    zh: "正在加载实验",
    ja: "実験を読み込み中",
    de: "Experiment wird geladen",
  },
  "Manifest inspection": {
    zh: "清单检查",
    ja: "マニフェストの確認",
    de: "Manifest-Prüfung",
  },
  "Illustrated preview": {
    zh: "示意预览",
    ja: "イメージプレビュー",
    de: "Illustrative Vorschau",
  },
  "Reduced motion enabled": {
    zh: "已启用减少动态效果",
    ja: "動きを減らす設定が有効です",
    de: "Bewegung reduziert",
  },
  "Hover or focus to preview": {
    zh: "悬停或聚焦以预览",
    ja: "ホバーまたはフォーカスでプレビュー",
    de: "Für Vorschau zeigen oder fokussieren",
  },
  "Preview before you open": {
    zh: "打开前预览",
    ja: "開く前にプレビュー",
    de: "Vorschau vor dem Öffnen",
  },
  "Motion off": {
    zh: "动态效果已关闭",
    ja: "動きはオフ",
    de: "Bewegung aus",
  },
  "Pause preview": {
    zh: "暂停预览",
    ja: "プレビューを一時停止",
    de: "Vorschau pausieren",
  },
  "Play preview": {
    zh: "播放预览",
    ja: "プレビューを再生",
    de: "Vorschau abspielen",
  },
  Theme: {
    zh: "主题",
    ja: "テーマ",
    de: "Design",
  },
  Light: {
    zh: "浅色",
    ja: "ライト",
    de: "Hell",
  },
  Dark: {
    zh: "深色",
    ja: "ダーク",
    de: "Dunkel",
  },
  Auto: {
    zh: "自动",
    ja: "自動",
    de: "Automatisch",
  },
  Language: {
    zh: "语言",
    ja: "言語",
    de: "Sprache",
  },
  "Personal website": {
    zh: "个人网站",
    ja: "個人サイト",
    de: "Persönliche Website",
  },
  "This website": {
    zh: "本站",
    ja: "このサイト",
    de: "Diese Website",
  },
  "A home for the things I build.": {
    zh: "为我的作品安个家。",
    ja: "作ったものの居場所。",
    de: "Ein Zuhause für meine Projekte.",
  },
  "An evolving personal site with a shared visual language and a straightforward path from code to production.":
    {
      zh: "一个持续完善的个人网站，采用共享视觉语言，并建立从代码到生产的清晰流程。",
      ja: "共通のビジュアルと、コードから本番までの明快な流れを備えた、成長する個人サイト。",
      de: "Eine wachsende persönliche Website mit gemeinsamer Gestaltung und einem klaren Weg vom Code in den Betrieb.",
    },
  "This is the project you are visiting: a place to collect work and document the decisions behind it. The website uses Next.js and React, with a pnpm workspace that leaves room for other applications.":
    {
      zh: "你正在访问的就是这个项目：收集作品并记录背后决策的地方。网站采用 Next.js 和 React，使用 pnpm 工作区为其他应用保留空间。",
      ja: "今ご覧のサイト自体がこのプロジェクトです。制作物とその判断を記録します。Next.js と React を使い、pnpm ワークスペースで他のアプリも追加できる構成です。",
      de: "Dies ist das Projekt, das du gerade besuchst: ein Ort für Arbeiten und die Entscheidungen dahinter. Die Website nutzt Next.js und React in einem pnpm-Workspace mit Platz für weitere Anwendungen.",
    },
  "One visual language": {
    zh: "统一的视觉语言",
    ja: "ひとつのビジュアル言語",
    de: "Eine gemeinsame Gestaltung",
  },
  "A framework-independent CSS package owns the palette. The website adapts its tokens to Tailwind and local shadcn/ui components. Future applications can share the colors without sharing a UI runtime.":
    {
      zh: "独立于框架的 CSS 包管理配色。网站将其令牌适配到 Tailwind 和本地 shadcn/ui 组件。未来应用可以共享配色，而无需共享 UI 运行时。",
      ja: "フレームワークに依存しない CSS パッケージが配色を管理します。サイト側で Tailwind とローカルの shadcn/ui に対応させるため、別のアプリも UI ランタイムを共有せず同じ色を使えます。",
      de: "Ein unabhängiges CSS-Paket verwaltet die Palette. Die Website passt dessen Tokens an Tailwind und lokale shadcn/ui-Komponenten an. Weitere Anwendungen können Farben ohne gemeinsame UI-Laufzeit teilen.",
    },
  "A production foundation": {
    zh: "生产环境基础",
    ja: "本番環境の基盤",
    de: "Eine Grundlage für den Betrieb",
  },
  "Prisma provides PostgreSQL access. Website and database containers have separate lifecycles, while GitHub Actions checks and deploys versioned images with migration and health checks.":
    {
      zh: "Prisma 提供 PostgreSQL 访问。网站和数据库容器具有独立生命周期；GitHub Actions 检查并部署带版本的镜像，执行迁移和健康检查。",
      ja: "Prisma が PostgreSQL へのアクセスを担います。サイトとデータベースのコンテナは別々のライフサイクルを持ち、GitHub Actions がバージョン付きイメージの検証、移行、ヘルスチェックとデプロイを行います。",
      de: "Prisma ermöglicht den PostgreSQL-Zugriff. Website und Datenbank haben getrennte Container-Lebenszyklen. GitHub Actions prüft und deployt versionierte Images mit Migrationen und Zustandsprüfungen.",
    },
  "Content first": {
    zh: "内容优先",
    ja: "コンテンツを第一に",
    de: "Inhalte zuerst",
  },
  "Public pages render statically and remain available without a database connection. Light, dark, or system preference is remembered in the browser.":
    {
      zh: "公开页面静态渲染，无需数据库连接也可访问。浏览器会记住浅色、深色或跟随系统的偏好。",
      ja: "公開ページは静的に描画され、データベース接続なしでも利用できます。ライト、ダーク、システム設定の選択はブラウザーに保存されます。",
      de: "Öffentliche Seiten werden statisch gerendert und bleiben ohne Datenbankverbindung verfügbar. Der Browser merkt sich Hell, Dunkel oder die Systemeinstellung.",
    },
  "Design systems": {
    zh: "设计系统",
    ja: "デザインシステム",
    de: "Designsysteme",
  },
  "A shared theme should not choose your framework.": {
    zh: "共享主题不应替你选择框架。",
    ja: "共通テーマはフレームワークを選ばない。",
    de: "Ein gemeinsames Theme sollte kein Framework vorgeben.",
  },
  "Separating the visual language from the components that happen to use it.": {
    zh: "将视觉语言与使用它的组件分离。",
    ja: "見た目のルールを、それを使うコンポーネントから切り離す。",
    de: "Die Gestaltung von den Komponenten trennen, die sie verwenden.",
  },
  "A consistent website does not require every application to use the same component library. The useful boundary is between the visual decisions and the code that consumes them.":
    {
      zh: "一致的网站体验不要求所有应用采用同一个组件库。真正有用的边界在于视觉决策与使用这些决策的代码之间。",
      ja: "統一感のために、すべてのアプリで同じコンポーネントライブラリを使う必要はありません。大切なのは、見た目の判断と、それを利用するコードの境界です。",
      de: "Ein konsistenter Auftritt erfordert nicht in jeder Anwendung dieselbe Komponentenbibliothek. Die sinnvolle Grenze liegt zwischen visuellen Entscheidungen und dem Code, der sie nutzt.",
    },
  "Start with meaning": {
    zh: "从语义开始",
    ja: "意味から始める",
    de: "Mit Bedeutung beginnen",
  },
  "A canvas color, readable text, and a brand accent describe what a design needs. They do not describe a React component. Here, these decisions are plain CSS variables with a --kio- prefix, distributed by packages/theme.":
    {
      zh: "画布颜色、可读文字和品牌强调色描述设计需要什么，而非 React 组件。在这里，这些决策是以 --kio- 为前缀的普通 CSS 变量，由 packages/theme 分发。",
      ja: "背景色、読みやすい文字、ブランドのアクセントは、React 部品ではなくデザインの要件です。ここでは --kio- 接頭辞の CSS 変数として packages/theme から配布します。",
      de: "Hintergrundfarbe, lesbarer Text und Markenakzent beschreiben Designanforderungen, keine React-Komponente. Hier sind sie einfache CSS-Variablen mit dem Präfix --kio- aus packages/theme.",
    },
  "That package has no React, Tailwind, or shadcn dependencies. Another application can import the stylesheet and keep its own rendering model.":
    {
      zh: "这个包不依赖 React、Tailwind 或 shadcn。其他应用可以导入样式表，同时保留自己的渲染模型。",
      ja: "このパッケージは React、Tailwind、shadcn に依存しません。他のアプリはスタイルシートを読み込み、独自の描画方式を使えます。",
      de: "Das Paket hängt weder von React noch von Tailwind oder shadcn ab. Andere Anwendungen können das Stylesheet importieren und ihr eigenes Rendering beibehalten.",
    },
  "Let the application do the adapting": {
    zh: "由应用负责适配",
    ja: "適応はアプリ側で行う",
    de: "Die Anwendung übernimmt die Anpassung",
  },
  "The Next.js application maps shared tokens to Tailwind utilities and shadcn variable names. These adapters belong to the application. Replacing a component library should change an adapter, not redefine the brand palette.":
    {
      zh: "Next.js 应用将共享令牌映射到 Tailwind 工具类和 shadcn 变量名。这些适配器属于应用。更换组件库应修改适配器，而非重新定义品牌配色。",
      ja: "Next.js アプリが共通トークンを Tailwind ユーティリティと shadcn の変数名へ対応させます。アダプターはアプリの責務です。ライブラリの交換時は、配色ではなくアダプターを変更します。",
      de: "Die Next.js-Anwendung ordnet gemeinsame Tokens den Tailwind-Utilities und shadcn-Variablen zu. Diese Adapter gehören zur Anwendung. Ein Bibliothekswechsel sollte den Adapter ändern, nicht die Markenpalette.",
    },
  "The dependency runs in one direction: the application depends on the theme, while the theme knows nothing about the application.":
    {
      zh: "依赖是单向的：应用依赖主题，而主题不需要了解应用。",
      ja: "依存は一方向です。アプリはテーマに依存しますが、テーマはアプリを知りません。",
      de: "Die Abhängigkeit läuft in eine Richtung: Die Anwendung kennt das Theme, das Theme kennt die Anwendung nicht.",
    },
  "Keep preference separate from color": {
    zh: "将偏好与颜色分离",
    ja: "設定と色を分ける",
    de: "Präferenz und Farbe trennen",
  },
  "Light, dark, and system are user preferences. The website remembers the choice locally and resolves it to a data-theme attribute. CSS supplies the colors from the shared package.":
    {
      zh: "浅色、深色和跟随系统属于用户偏好。网站在本地记住选择，并将其解析为 data-theme 属性。CSS 从共享包提供颜色。",
      ja: "ライト、ダーク、システムは利用者の設定です。サイトは選択をローカルに保存し、data-theme 属性へ反映します。色は共通パッケージの CSS が提供します。",
      de: "Hell, Dunkel und System sind Nutzereinstellungen. Die Website speichert die Wahl lokal und setzt sie als data-theme-Attribut um. CSS liefert die Farben aus dem gemeinsamen Paket.",
    },
  "JavaScript decides which mode is active; it does not duplicate the palette. That small contract remains useful when the rest of the stack changes.":
    {
      zh: "JavaScript 决定当前模式，不重复定义配色。即使技术栈其他部分变化，这个小约定仍然有用。",
      ja: "JavaScript は有効なモードを決め、配色を重複定義しません。この小さな約束は、他の技術が変わっても役立ちます。",
      de: "JavaScript bestimmt den aktiven Modus, ohne die Palette zu duplizieren. Diese kleine Vereinbarung bleibt auch bei Änderungen am restlichen Stack nützlich.",
    },
  "Building for the web": {
    zh: "网页构建",
    ja: "ウェブ制作",
    de: "Fürs Web entwickeln",
  },
  "Making a small deployment predictable.": {
    zh: "让小型部署变得可预测。",
    ja: "小さなデプロイを予測可能に。",
    de: "Kleine Deployments vorhersehbar machen.",
  },
  "Versioned images, migrations before replacement, and checks that ask useful questions.":
    {
      zh: "带版本的镜像、替换前的迁移，以及有实际意义的检查。",
      ja: "バージョン付きイメージ、置き換え前の移行、意味のある検証。",
      de: "Versionierte Images, Migrationen vor dem Austausch und aussagekräftige Prüfungen.",
    },
  "A personal website still deserves a repeatable release process. This site's deployment separates a few responsibilities so a release is easier to understand and recover from.":
    {
      zh: "个人网站也值得拥有可重复的发布流程。本站部署将职责分离，让发布更易理解，也更易恢复。",
      ja: "個人サイトにも再現可能なリリース手順は大切です。このサイトでは責務を分け、リリースを理解しやすく、復旧しやすくしています。",
      de: "Auch eine persönliche Website verdient einen wiederholbaren Release-Prozess. Die getrennten Zuständigkeiten erleichtern hier das Verständnis und die Wiederherstellung.",
    },
  "Identify the release": {
    zh: "标识发布版本",
    ja: "リリースを特定する",
    de: "Das Release identifizieren",
  },
  "A production push runs lint, TypeScript checks, a build, and container integration checks. The workflow publishes a website image and a migration image identified by the same commit SHA.":
    {
      zh: "推送到生产分支会运行 lint、TypeScript 检查、构建和容器集成检查。工作流发布由相同提交 SHA 标识的网站镜像和迁移镜像。",
      ja: "本番ブランチへの push で lint、TypeScript、ビルド、コンテナ統合検証を実行します。同じコミット SHA のサイト用イメージと移行用イメージを公開します。",
      de: "Ein Push in den Produktionszweig startet Lint, TypeScript-Prüfungen, Build und Container-Integrationstests. Der Workflow veröffentlicht Website- und Migrationsimage mit derselben Commit-SHA.",
    },
  "The server deploys that exact pair. A mutable tag is convenient, but a commit-specific tag answers the important question: which code is actually being deployed?":
    {
      zh: "服务器部署这对确切的镜像。可变标签虽方便，但提交专属标签能够回答关键问题：实际部署的是哪份代码？",
      ja: "サーバーはその組み合わせを正確にデプロイします。可変タグは便利ですが、コミット固有のタグなら、どのコードを配置したかがわかります。",
      de: "Der Server deployt genau dieses Paar. Ein veränderliches Tag ist bequem, ein commitbezogenes Tag beantwortet jedoch die Frage, welcher Code tatsächlich deployt wird.",
    },
  "Give the database its own lifecycle": {
    zh: "为数据库提供独立生命周期",
    ja: "データベースに独自のライフサイクルを",
    de: "Der Datenbank einen eigenen Lebenszyklus geben",
  },
  "PostgreSQL is an independent service with persistent storage. The website has its own database and restricted login. Replacing a web container does not recreate the database service.":
    {
      zh: "PostgreSQL 是具有持久化存储的独立服务。网站使用专属数据库与受限账户。替换网页容器不会重建数据库服务。",
      ja: "PostgreSQL は永続ストレージを持つ独立サービスです。サイト専用のデータベースと制限されたログインを用意し、ウェブコンテナの交換ではデータベースを作り直しません。",
      de: "PostgreSQL ist ein unabhängiger Dienst mit persistentem Speicher. Die Website hat eine eigene Datenbank und einen eingeschränkten Zugang. Ein neuer Webcontainer erstellt den Datenbankdienst nicht neu.",
    },
  "Deployment creates a backup and applies checked-in Prisma migrations before replacing the website. Schema changes must remain compatible with the previous image, because an image rollback does not undo a migration.":
    {
      zh: "部署会先创建备份并应用已纳入版本管理的 Prisma 迁移，再替换网站。架构变更须与上一个镜像兼容，因为回滚镜像不会撤销迁移。",
      ja: "デプロイではバックアップと管理済みの Prisma 移行を先に行い、その後サイトを置き換えます。イメージのロールバックでは移行を取り消せないため、スキーマは旧イメージとの互換性を保ちます。",
      de: "Vor dem Austausch der Website erstellt das Deployment ein Backup und wendet eingecheckte Prisma-Migrationen an. Schemaänderungen müssen zum vorherigen Image passen, da ein Image-Rollback keine Migration rückgängig macht.",
    },
  "Check more than the process": {
    zh: "不只检查进程",
    ja: "プロセス以外も確認する",
    de: "Mehr als den Prozess prüfen",
  },
  "The release checks web health, a real database query, the public page, and its generated stylesheet through HTTPS.":
    {
      zh: "发布会检查网站健康状态、真实数据库查询、公开页面，以及通过 HTTPS 提供的生成样式表。",
      ja: "リリース時はウェブの状態、実際のデータベースクエリ、公開ページ、生成された CSS の HTTPS 配信を確認します。",
      de: "Die Release-Prüfung umfasst Webzustand, eine echte Datenbankabfrage, die öffentliche Seite und ihr generiertes Stylesheet über HTTPS.",
    },
  "If local health checks fail, the previous website image is restored when available. Backups still need an off-server copy and a tested restore procedure before they become a disaster-recovery plan.":
    {
      zh: "本地健康检查失败时，会在可用的情况下恢复上一个网站镜像。备份还需要异地副本与经过测试的恢复流程，才能成为灾难恢复方案。",
      ja: "ローカルのヘルスチェックに失敗した場合、利用可能なら前のサイトイメージを復元します。災害復旧計画とするには、別サーバーへのコピーと復元手順の検証も必要です。",
      de: "Scheitern lokale Zustandsprüfungen, wird nach Möglichkeit das vorherige Website-Image wiederhergestellt. Für einen Notfallplan brauchen Backups außerdem eine externe Kopie und ein getestetes Wiederherstellungsverfahren.",
    },
  Simulation: {
    zh: "模拟",
    ja: "シミュレーション",
    de: "Simulation",
  },
  "Creative tools": {
    zh: "创作工具",
    ja: "制作ツール",
    de: "Kreativwerkzeuge",
  },
  "Build seamless square textures from local images with GPU arrays, a movable canvas, and editable project history.":
    {
      zh: "使用本地图片、GPU 阵列、可移动画布和可编辑工程历史，制作无缝正方形贴图。",
      ja: "ローカル画像、GPU 配列、移動できるキャンバス、編集履歴を使って、シームレスな正方形テクスチャを作成できます。",
      de: "Nahtlose quadratische Texturen aus lokalen Bildern mit GPU-Arrays, verschiebbarer Zeichenfläche und bearbeitbarem Projektverlauf erstellen.",
    },
  Games: {
    zh: "游戏",
    ja: "ゲーム",
    de: "Spiele",
  },
  "Pour particles, change gravity, and play with a lightweight fluid-like simulation.":
    {
      zh: "倾倒粒子、改变重力，体验轻量流体模拟。",
      ja: "粒子を注ぎ、重力を変えて、軽量な流体風シミュレーションで遊べます。",
      de: "Partikel einfüllen, die Schwerkraft ändern und eine einfache Flüssigkeitssimulation ausprobieren.",
    },
  "Design a repeating plaid, adjust its rhythm and colors, and export SVG or PNG.":
    {
      zh: "设计重复格纹，调整节奏与颜色，导出 SVG 或 PNG。",
      ja: "繰り返すチェック柄を作り、間隔や色を調整して SVG や PNG に書き出せます。",
      de: "Ein wiederholendes Karomuster gestalten, Rhythmus und Farben anpassen und als SVG oder PNG exportieren.",
    },
  "Inspect a local Cubism model manifest and explore the resource-free viewer integration.":
    {
      zh: "检查本地 Cubism 模型清单，探索不含资源的查看器集成。",
      ja: "ローカルの Cubism モデルマニフェストを調べ、リソースを含まないビューアー連携を確認できます。",
      de: "Ein lokales Cubism-Modellmanifest prüfen und die ressourcenfreie Viewer-Integration erkunden.",
    },
  "A small brick-breaking game rebuilt for the browser, with readable TypeScript source.":
    {
      zh: "为浏览器重建的打砖块小游戏，附有可阅读的 TypeScript 源码。",
      ja: "ブラウザー向けに作り直した小さなブロック崩し。TypeScript のソースも読めます。",
      de: "Ein kleines, für den Browser neu gebautes Breakout-Spiel mit lesbarem TypeScript-Quellcode.",
    },
  "A keyboard and touch-friendly Snake game with food, collision handling, and source to explore.":
    {
      zh: "支持键盘和触控的贪吃蛇，包含食物、碰撞处理与可阅读源码。",
      ja: "キーボードとタッチ対応のスネークゲーム。食べ物、衝突判定、読めるソースを備えています。",
      de: "Ein Snake-Spiel für Tastatur und Touch, mit Futter, Kollisionserkennung und Quellcode zum Erkunden.",
    },
  "Prod channel": {
    zh: "正式渠道",
    ja: "正式版チャンネル",
    de: "Produktionskanal",
  },
  "Dev channel": {
    zh: "开发渠道",
    ja: "開発版チャンネル",
    de: "Entwicklungskanal",
  },
  "A development build. Expect changes and unverified behavior.": {
    zh: "开发构建，可能存在变更及未经验证的行为。",
    ja: "開発ビルドです。変更や未検証の動作が含まれる場合があります。",
    de: "Ein Entwicklungsbuild. Änderungen und ungeprüftes Verhalten sind zu erwarten.",
  },
  "The current published build. Read its verification notes before installing.":
    {
      zh: "当前正式发布的构建。安装前请阅读验证说明。",
      ja: "現在公開中のビルドです。インストール前に検証状況をご確認ください。",
      de: "Der aktuell veröffentlichte Build. Vor der Installation bitte die Prüfhinweise lesen.",
    },
};
