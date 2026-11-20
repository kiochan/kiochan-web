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

export const runActions = {
  slug: "run-actions",
  name: "Run Actions CEP",
  category: "Photoshop plugin",
  summary:
    "Queue Photoshop actions and run them on document layers from a dockable CEP panel.",
  repository: "https://github.com/kiochan/photoshop-run-actions",
  stack: ["Photoshop CEP", "JavaScript", "ExtendScript"],
  status: "Legacy CEP",
  compatibility:
    "Targets Photoshop CC 2019 and later versions that still support CEP. The unsigned ZIP requires CEP debug mode; host compatibility must be verified.",
  features: [
    {
      title: "Action queue",
      text: "Read loaded action sets, queue actions, and run them in sequence.",
    },
    {
      title: "Layer processing",
      text: "Process all layers or selected layers, with an optional history snapshot.",
    },
  ],
} as const;

export const projectCatalog = [panelTools, colorPicker, runActions] as const;

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
  "Lab projects": {
    zh: "实验室项目",
    ja: "ラボのプロジェクト",
    de: "Laborprojekte",
  },
  "Lab sidebar": {
    zh: "实验室侧栏",
    ja: "ラボのサイドバー",
    de: "Labor-Seitenleiste",
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
  "Filter by tag": {
    zh: "按标签筛选",
    ja: "タグで絞り込む",
    de: "Nach Schlagwort filtern",
  },
  "{count} of {total} experiments": {
    zh: "显示 {count} 个实验，共 {total} 个",
    ja: "全{total}件のうち{count}件を表示",
    de: "{count} von {total} Experimenten",
  },
  "Photo collages": {
    zh: "照片拼贴",
    ja: "写真コラージュ",
    de: "Fotocollagen",
  },
  "Color design": {
    zh: "色彩设计",
    ja: "配色デザイン",
    de: "Farbgestaltung",
  },
  "React · Local files": {
    zh: "React · 本地文件",
    ja: "React · ローカルファイル",
    de: "React · Lokale Dateien",
  },
  "Image Palette": {
    zh: "图片配色",
    ja: "画像の配色",
    de: "Bildpalette",
  },
  "Photo Waterfall": {
    zh: "照片瀑布流",
    ja: "写真の段組みコラージュ",
    de: "Foto-Spaltencollage",
  },
  "Photo Mosaic": {
    zh: "照片拼图",
    ja: "写真モザイク",
    de: "Fotomosaik",
  },
  "Texture Array": {
    zh: "纹理阵列",
    ja: "テクスチャ配列",
    de: "Textur-Array",
  },
  "Liquid Playground": {
    zh: "流体模拟",
    ja: "流体シミュレーション",
    de: "Flüssigkeitssimulation",
  },
  "Lattice Generator": {
    zh: "格纹生成器",
    ja: "チェック柄ジェネレーター",
    de: "Karomuster-Generator",
  },
  "Cubism Workbench": {
    zh: "Cubism 工作台",
    ja: "Cubism ワークベンチ",
    de: "Cubism-Werkbank",
  },
  Breakout: {
    zh: "打砖块",
    ja: "ブロック崩し",
    de: "Breakout",
  },
  "Quick Snake": {
    zh: "贪吃蛇",
    ja: "スネーク",
    de: "Quick Snake",
  },
  "AIM / BOUNCE / BREAK": {
    zh: "瞄准 / 反弹 / 打砖块",
    ja: "狙う / 跳ね返す / 壊す",
    de: "ZIELEN / ABPRALLEN / TREFFEN",
  },
  "MODEL MANIFEST": {
    zh: "模型清单",
    ja: "モデルマニフェスト",
    de: "MODELLMANIFEST",
  },
  TEXTURES: {
    zh: "纹理",
    ja: "テクスチャ",
    de: "TEXTUREN",
  },
  MOTIONS: {
    zh: "动作",
    ja: "モーション",
    de: "BEWEGUNGEN",
  },
  "MANIFEST ONLY / NO MODEL ASSETS": {
    zh: "仅查看清单 / 不含模型资源",
    ja: "マニフェストのみ / モデル素材なし",
    de: "NUR MANIFEST / OHNE MODELLDATEIEN",
  },
  "REPEAT / WEAVE / EXPORT": {
    zh: "重复 / 编织 / 导出",
    ja: "繰り返す / 織る / 書き出す",
    de: "WIEDERHOLEN / WEBEN / EXPORTIEREN",
  },
  "POUR / GRAVITY / FLOW": {
    zh: "倾倒 / 重力 / 流动",
    ja: "注ぐ / 重力 / 流れ",
    de: "GIESSEN / SCHWERKRAFT / FLUSS",
  },
  "STEER / GROW / REPEAT": {
    zh: "转向 / 吃食物 / 变长",
    ja: "曲がる / 伸びる / 繰り返す",
    de: "LENKEN / WACHSEN / WIEDERHOLEN",
  },
  "IMAGE / ARRAY / SEAMLESS": {
    zh: "图片 / 阵列 / 无缝",
    ja: "画像 / 配列 / シームレス",
    de: "BILD / ARRAY / NAHTLOS",
  },
  "Extract several color palettes from one image and copy the HEX codes.": {
    zh: "从一张图片提取多组配色，并直接复制 HEX 色值。",
    ja: "1 枚の画像から複数の配色を抽出し、HEX コードをコピーできます。",
    de: "Mehrere Farbpaletten aus einem Bild extrahieren und die HEX-Codes kopieren.",
  },
  "Loading image palette tool": {
    zh: "正在加载图片配色工具",
    ja: "画像の配色ツールを読み込み中",
    de: "Werkzeug für Bildpaletten wird geladen",
  },
  "Choose an image": {
    zh: "选择图片",
    ja: "画像を選択",
    de: "Bild auswählen",
  },
  "Replace image": {
    zh: "替换图片",
    ja: "画像を変更",
    de: "Bild ersetzen",
  },
  "Source image": {
    zh: "原图",
    ja: "元の画像",
    de: "Ausgangsbild",
  },
  "Drop or paste one image. It stays in your browser.": {
    zh: "也可拖入或粘贴一张图片。图片仅在浏览器内处理。",
    ja: "画像を 1 枚ドロップまたは貼り付けてください。処理はブラウザ内で行われます。",
    de: "Ein Bild ablegen oder einfügen. Es bleibt im Browser.",
  },
  "Extracting colors…": {
    zh: "正在提取颜色…",
    ja: "色を抽出中…",
    de: "Farben werden extrahiert…",
  },
  "This image could not be opened. Try a PNG, JPEG, or WebP.": {
    zh: "无法打开这张图片。请尝试 PNG、JPEG 或 WebP。",
    ja: "画像を開けませんでした。PNG、JPEG、WebP のいずれかをお試しください。",
    de: "Das Bild konnte nicht geöffnet werden. Versuche es mit PNG, JPEG oder WebP.",
  },
  "This image has no visible colors.": {
    zh: "这张图片没有可见颜色。",
    ja: "この画像には表示できる色がありません。",
    de: "Dieses Bild enthält keine sichtbaren Farben.",
  },
  "Extracted palettes": {
    zh: "提取的配色",
    ja: "抽出した配色",
    de: "Extrahierte Farbpaletten",
  },
  "Dominant colors": {
    zh: "主色",
    ja: "主要色",
    de: "Dominante Farben",
  },
  "Color accents": {
    zh: "强调色",
    ja: "アクセントカラー",
    de: "Akzentfarben",
  },
  "Light tones": {
    zh: "浅色",
    ja: "明るい色",
    de: "Helle Farbtöne",
  },
  "Deep tones": {
    zh: "深色",
    ja: "深い色",
    de: "Dunkle Farbtöne",
  },
  "Copy palette": {
    zh: "复制整组",
    ja: "配色をコピー",
    de: "Palette kopieren",
  },
  "Copy color": {
    zh: "复制色值",
    ja: "色をコピー",
    de: "Farbe kopieren",
  },
  Copied: {
    zh: "已复制",
    ja: "コピー済み",
    de: "Kopiert",
  },
  "Copied to clipboard": {
    zh: "已复制到剪贴板",
    ja: "クリップボードにコピーしました",
    de: "In die Zwischenablage kopiert",
  },
  "Clipboard unavailable. Select a HEX code to copy it manually.": {
    zh: "无法访问剪贴板，请选中 HEX 色值并手动复制。",
    ja: "クリップボードを利用できません。HEX コードを選択して手動でコピーしてください。",
    de: "Die Zwischenablage ist nicht verfügbar. Wähle einen HEX-Code aus und kopiere ihn manuell.",
  },
  "Pattern design": {
    zh: "图案设计",
    ja: "パターンデザイン",
    de: "Mustergestaltung",
  },
  Physics: {
    zh: "物理",
    ja: "物理",
    de: "Physik",
  },
  "Model inspection": {
    zh: "模型检查",
    ja: "モデル検査",
    de: "Modellprüfung",
  },
  Arcade: {
    zh: "街机",
    ja: "アーケード",
    de: "Arcade",
  },
  "Arrange full photos in balanced columns, choose a background color, and download a PNG collage.":
    {
      zh: "用等宽列完整排列照片，自选底色，然后下载 PNG 拼图。",
      ja: "写真全体を高さのそろった列に並べ、背景色を選んで PNG コラージュをダウンロードできます。",
      de: "Vollständige Fotos in ausgeglichenen Spalten anordnen, eine Hintergrundfarbe wählen und die Collage als PNG herunterladen.",
    },
  "Drop in local photos, move and resize tiles, and shuffle the layout around locked photos.":
    {
      zh: "拖入本地照片，自由移动或缩放拼图块，也可以固定照片后随机重排其余照片。",
      ja: "ローカルの写真をドロップしてタイルを移動・拡大縮小し、固定した写真を残したまま配置をシャッフルできます。",
      de: "Lokale Fotos hineinziehen, Kacheln verschieben oder in der Größe ändern und das Layout um fixierte Fotos neu mischen.",
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
  "Invalid project JSON. Choose a saved Texture Array project.": {
    zh: "工程 JSON 无效，请选择已保存的 Texture Array 工程文件。",
    ja: "プロジェクトの JSON が無効です。保存済みのテクスチャ配列プロジェクトを選択してください。",
    de: "Ungültiges Projekt-JSON. Wähle ein gespeichertes Texture-Array-Projekt.",
  },
  "Unable to decode image. Choose a valid PNG, JPEG, or WebP image.": {
    zh: "无法解码图片，请选择有效的 PNG、JPEG 或 WebP 图片。",
    ja: "画像を読み込めません。正しい PNG、JPEG、WebP 画像を選択してください。",
    de: "Das Bild konnte nicht decodiert werden. Wähle ein gültiges PNG-, JPEG- oder WebP-Bild.",
  },
  "3 × 3 check": {
    zh: "3 × 3 拼接检查",
    ja: "3 × 3 で確認",
    de: "3 × 3 prüfen",
  },
  "A pattern starts with an image.": {
    zh: "从一张图片开始创作。",
    ja: "まず画像を追加してください。",
    de: "Ein Muster beginnt mit einem Bild.",
  },
  "A project supports up to 12 source images.": {
    zh: "每个工程最多支持 12 张原图。",
    ja: "1 つのプロジェクトに元画像を 12 枚まで追加できます。",
    de: "Ein Projekt unterstützt bis zu 12 Quellbilder.",
  },
  "Add PNG, JPEG, or WebP images above.": {
    zh: "请在上方添加 PNG、JPEG 或 WebP 图片。",
    ja: "上のボタンから PNG、JPEG、WebP 画像を追加してください。",
    de: "Füge oben PNG-, JPEG- oder WebP-Bilder hinzu.",
  },
  "Add images": {
    zh: "添加图片",
    ja: "画像を追加",
    de: "Bilder hinzufügen",
  },
  "Array angle (°)": {
    zh: "阵列角度（°）",
    ja: "配列の角度 (°)",
    de: "Winkel der Anordnung (°)",
  },
  "Cancel export": {
    zh: "取消导出",
    ja: "書き出しをキャンセル",
    de: "Export abbrechen",
  },
  "Change image scaling": {
    zh: "更改图像采样方式",
    ja: "画像の拡大・縮小方式を変更",
    de: "Skalierungsmodus ändern",
  },
  "Change output size": {
    zh: "更改输出尺寸",
    ja: "出力サイズを変更",
    de: "Ausgabegröße ändern",
  },
  "Change {setting}": {
    zh: "更改{setting}",
    ja: "{setting}を変更",
    de: "{setting} ändern",
  },
  "Choose PNG, JPEG, or WebP images of up to 8 MB each.": {
    zh: "请选择 PNG、JPEG 或 WebP 图片，每张不超过 8 MB。",
    ja: "1 枚あたり 8 MB 以下の PNG、JPEG、WebP 画像を選択してください。",
    de: "Wähle PNG-, JPEG- oder WebP-Bilder mit jeweils höchstens 8 MB.",
  },
  Columns: {
    zh: "列数",
    ja: "列数",
    de: "Spalten",
  },
  "Diagonal 45°": {
    zh: "45° 斜排",
    ja: "斜め 45°",
    de: "Diagonal 45°",
  },
  "Diagonal array preset": {
    zh: "应用斜排预设",
    ja: "斜めのプリセットを適用",
    de: "Diagonales Raster anwenden",
  },
  "Drag to pan · Arrow keys to move · Fit to reset": {
    zh: "拖动平移 · 方向键移动 · 点击适应画布复位",
    ja: "ドラッグまたは矢印キーで移動 · 全体表示でリセット",
    de: "Ziehen oder Pfeiltasten zum Verschieben · Einpassen setzt die Ansicht zurück",
  },
  Duplicate: {
    zh: "复制",
    ja: "複製",
    de: "Duplizieren",
  },
  "Duplicate image identifiers.": {
    zh: "原图标识重复。",
    ja: "元画像の ID が重複しています。",
    de: "Quellbild-IDs sind doppelt vorhanden.",
  },
  "Duplicate layer": {
    zh: "复制图层",
    ja: "レイヤーを複製",
    de: "Ebene duplizieren",
  },
  "Duplicate layer identifiers.": {
    zh: "图层标识重复。",
    ja: "レイヤーの ID が重複しています。",
    de: "Ebenen-IDs sind doppelt vorhanden.",
  },
  "Edit history": {
    zh: "操作历史",
    ja: "編集履歴",
    de: "Bearbeitungsverlauf",
  },
  Fit: {
    zh: "适应画布",
    ja: "全体表示",
    de: "Einpassen",
  },
  "Fitted center spacing: X {x}% · Y {y}% of tile. Uniform seamless repeats use discrete spacing steps.":
    {
      zh: "实际中心间距：横向占画布 {x}% · 纵向占画布 {y}%。均匀无缝排列会按可用的周期档位匹配间距。",
      ja: "調整後の中心間隔はタイルに対して X {x}%、Y {y}% です。均一で継ぎ目のない繰り返しに合わせ、間隔は段階的に調整されます。",
      de: "Angepasster Abstand zwischen den Mittelpunkten, bezogen auf die Kachel: X {x} % · Y {y} %. Für eine gleichmäßige, nahtlose Wiederholung wird der Abstand stufenweise angepasst.",
    },
  "GPU context lost. Your project is still available to save. Restore the context or reload your saved project.":
    {
      zh: "GPU 上下文已丢失，工程仍可保存。请等待恢复，或重新载入已保存的工程。",
      ja: "GPU コンテキストが失われました。プロジェクトは引き続き保存できます。復旧を待つか、保存済みのプロジェクトを開き直してください。",
      de: "Der GPU-Kontext ist verloren gegangen. Du kannst dein Projekt weiterhin speichern. Warte auf die Wiederherstellung oder öffne das gespeicherte Projekt erneut.",
    },
  "GPU could not allocate the output canvas. Try a smaller resolution.": {
    zh: "GPU 无法分配输出画布，请尝试较低分辨率。",
    ja: "GPU が出力キャンバスのメモリを確保できませんでした。解像度を下げてください。",
    de: "Die GPU konnte keinen Speicher für die Ausgabezeichenfläche reservieren. Versuche es mit einer kleineren Auflösung.",
  },
  "GPU rendering failed. Try fewer images or a smaller output.": {
    zh: "GPU 渲染失败，请减少图片数量或降低输出尺寸。",
    ja: "GPU の描画に失敗しました。画像を減らすか、出力サイズを小さくしてください。",
    de: "Das Rendern auf der GPU ist fehlgeschlagen. Versuche es mit weniger Bildern oder einer kleineren Ausgabegröße.",
  },
  "Grid array": {
    zh: "规则网格",
    ja: "格子状",
    de: "Gleichmäßiges Raster",
  },
  "Grid array preset": {
    zh: "应用网格预设",
    ja: "格子状のプリセットを適用",
    de: "Gleichmäßiges Raster anwenden",
  },
  "Half-drop array": {
    zh: "错行阵列",
    ja: "半分ずらし",
    de: "Halbversatz",
  },
  "Half-drop array preset": {
    zh: "应用错行预设",
    ja: "半分ずらしのプリセットを適用",
    de: "Raster mit Halbversatz anwenden",
  },
  "Half-drop shifts neighboring rows by about half a cell. The repeat is fitted to the square edges.":
    {
      zh: "错行阵列将相邻行错开约半个单元，并匹配正方形边缘的无缝周期。",
      ja: "半分ずらしでは、隣り合う行を約半マスずらします。正方形の端で柄がつながるように調整します。",
      de: "Beim Halbversatz sind benachbarte Zeilen um etwa eine halbe Zelle versetzt. Das Muster wird so angepasst, dass es an den Kachelrändern nahtlos anschließt.",
    },
  Hide: {
    zh: "隐藏",
    ja: "非表示",
    de: "Ausblenden",
  },
  "Hide layer": {
    zh: "隐藏图层",
    ja: "レイヤーを非表示",
    de: "Ebene ausblenden",
  },
  "Horizontal spacing (%)": {
    zh: "横向间距（%）",
    ja: "横方向の間隔 (%)",
    de: "Horizontaler Abstand (%)",
  },
  "Image exceeds this GPU's {size}px texture limit.": {
    zh: "图片超过此 GPU 的 {size} 像素纹理尺寸限制。",
    ja: "画像がこの GPU のテクスチャサイズ上限 ({size} px) を超えています。",
    de: "Das Bild überschreitet die maximale Texturgröße dieser GPU von {size} px.",
  },
  "Image rotation (°)": {
    zh: "图片旋转（°）",
    ja: "画像の回転 (°)",
    de: "Bilddrehung (°)",
  },
  "Image scaling": {
    zh: "图像采样",
    ja: "画像の拡大・縮小方式",
    de: "Bildskalierung",
  },
  "Images are still loading. Please try again.": {
    zh: "图片仍在加载，请稍后重试。",
    ja: "画像を読み込み中です。しばらくしてから再試行してください。",
    de: "Die Bilder werden noch geladen. Versuche es gleich noch einmal.",
  },
  "Import {count} image(s)": {
    zh: "导入 {count} 张图片",
    ja: "画像を {count} 枚読み込む",
    de: "Bilder importieren ({count})",
  },
  "Invalid image sampling mode.": {
    zh: "图像采样模式无效。",
    ja: "画像のサンプリング方式が無効です。",
    de: "Die Methode zur Bildabtastung ist ungültig.",
  },
  "Invalid lattice settings.": {
    zh: "周期网格参数无效。",
    ja: "格子の設定が無効です。",
    de: "Die Rastereinstellungen sind ungültig.",
  },
  "Invalid layer source.": {
    zh: "图层原图引用无效。",
    ja: "レイヤーが参照する元画像が無効です。",
    de: "Das Quellbild der Ebene ist ungültig.",
  },
  "Invalid or oversized image source.": {
    zh: "原图数据无效或超过大小限制。",
    ja: "元画像が無効か、サイズ上限を超えています。",
    de: "Das Quellbild ist ungültig oder zu groß.",
  },
  "Invalid output resolution.": {
    zh: "输出分辨率无效。",
    ja: "出力解像度が無効です。",
    de: "Die Ausgabeauflösung ist ungültig.",
  },
  "Invalid project history.": {
    zh: "工程历史记录无效。",
    ja: "プロジェクトの履歴が無効です。",
    de: "Der Projektverlauf ist ungültig.",
  },
  "Invalid project setting.": {
    zh: "工程参数无效。",
    ja: "プロジェクトの設定が無効です。",
    de: "Eine Projekteinstellung ist ungültig.",
  },
  "Invalid project structure.": {
    zh: "工程文件结构无效。",
    ja: "プロジェクトの構造が無効です。",
    de: "Die Projektstruktur ist ungültig.",
  },
  "Invalid project text.": {
    zh: "工程文本字段无效。",
    ja: "プロジェクトのテキスト項目が無効です。",
    de: "Ein Textfeld im Projekt ist ungültig.",
  },
  "LAYERS & ARRAY": {
    zh: "图层与阵列",
    ja: "レイヤーと配列",
    de: "EBENEN UND ANORDNUNG",
  },
  "Later layers draw on top. Size preserves the original aspect ratio.": {
    zh: "靠后的图层显示在上方。调整大小时保留原图宽高比。",
    ja: "一覧の後ろにあるレイヤーほど手前に描画されます。サイズを変更しても元画像の縦横比は変わりません。",
    de: "Spätere Ebenen werden über früheren gezeichnet. Beim Skalieren bleibt das ursprüngliche Seitenverhältnis erhalten.",
  },
  "Loading texture editor": {
    zh: "正在加载贴图编辑器",
    ja: "テクスチャエディターを読み込み中",
    de: "Textur-Editor wird geladen",
  },
  "Local images. Editable arrays. One seamless square.": {
    zh: "本地图片，可编辑阵列，一张无缝正方形贴图。",
    ja: "ローカル画像を並べて、継ぎ目のない正方形のテクスチャを作れます。",
    de: "Ordne lokale Bilder zu einer nahtlosen quadratischen Textur an.",
  },
  "Move down": {
    zh: "下移",
    ja: "下へ移動",
    de: "Nach unten",
  },
  "Move layer down": {
    zh: "下移图层",
    ja: "レイヤーを下へ移動",
    de: "Ebene nach unten verschieben",
  },
  "Move layer up": {
    zh: "上移图层",
    ja: "レイヤーを上へ移動",
    de: "Ebene nach oben verschieben",
  },
  "Move up": {
    zh: "上移",
    ja: "上へ移動",
    de: "Nach oben",
  },
  "New project": {
    zh: "新建工程",
    ja: "新規プロジェクト",
    de: "Neues Projekt",
  },
  "No images yet.": {
    zh: "尚未添加图片。",
    ja: "画像がまだありません。",
    de: "Noch keine Bilder vorhanden.",
  },
  "Offset X (%)": {
    zh: "横向偏移（%）",
    ja: "X 方向のずれ (%)",
    de: "X-Versatz (%)",
  },
  "Offset Y (%)": {
    zh: "纵向偏移（%）",
    ja: "Y 方向のずれ (%)",
    de: "Y-Versatz (%)",
  },
  "Opacity (%)": {
    zh: "不透明度（%）",
    ja: "不透明度 (%)",
    de: "Deckkraft (%)",
  },
  "Open project": {
    zh: "打开工程",
    ja: "プロジェクトを開く",
    de: "Projekt öffnen",
  },
  "Output resolution exceeds this GPU's limit.": {
    zh: "输出分辨率超过此 GPU 的限制。",
    ja: "出力解像度がこの GPU の上限を超えています。",
    de: "Die Ausgabeauflösung überschreitet das Limit dieser GPU.",
  },
  "Output size": {
    zh: "输出尺寸",
    ja: "出力サイズ",
    de: "Ausgabegröße",
  },
  "Periodic lattice enumeration failed.": {
    zh: "周期网格生成失败。",
    ja: "周期格子の座標を列挙できませんでした。",
    de: "Die Punkte des periodischen Rasters konnten nicht ermittelt werden.",
  },
  "Pixel · Hard edges": {
    zh: "像素模式 · 保留硬边缘",
    ja: "ピクセル · くっきりした輪郭",
    de: "Pixel · Harte Kanten",
  },
  "Processing local files…": {
    zh: "正在处理本地文件…",
    ja: "ローカルファイルを処理中…",
    de: "Lokale Dateien werden verarbeitet…",
  },
  "Project exceeds the 70 MB limit.": {
    zh: "工程文件超过 70 MB 限制。",
    ja: "プロジェクトが 70 MB の上限を超えています。",
    de: "Das Projekt überschreitet das Limit von 70 MB.",
  },
  Redo: {
    zh: "重做",
    ja: "やり直す",
    de: "Wiederholen",
  },
  Remove: {
    zh: "删除",
    ja: "削除",
    de: "Entfernen",
  },
  "Remove layer": {
    zh: "删除图层",
    ja: "レイヤーを削除",
    de: "Ebene entfernen",
  },
  "Reset spacing": {
    zh: "重置间距",
    ja: "間隔をリセット",
    de: "Abstände zurücksetzen",
  },
  "Row stagger (%)": {
    zh: "行错位（%）",
    ja: "行のずれ (%)",
    de: "Zeilenversatz (%)",
  },
  Rows: {
    zh: "行数",
    ja: "行数",
    de: "Zeilen",
  },
  "Save project": {
    zh: "保存工程",
    ja: "プロジェクトを保存",
    de: "Projekt speichern",
  },
  "Shader linking failed.": {
    zh: "着色器链接失败。",
    ja: "シェーダーのリンクに失敗しました。",
    de: "Das Verknüpfen der Shader ist fehlgeschlagen.",
  },
  "Shader compilation failed.": {
    zh: "着色器编译失败。",
    ja: "シェーダーのコンパイルに失敗しました。",
    de: "Das Kompilieren des Shaders ist fehlgeschlagen.",
  },
  "Sharp balances detail and smooth edges. Pixel preserves hard pixels and may alias when reduced. Zoom reveals output pixels without extra smoothing.":
    {
      zh: "清晰模式兼顾细节与平滑边缘。像素模式保留硬像素边缘，缩小时可能产生锯齿。放大预览直接显示输出像素，不再额外柔化。",
      ja: "シャープは細部を保ちながら輪郭をなめらかにします。ピクセルはくっきりした輪郭を保ちますが、縮小時にジャギーが出ることがあります。拡大表示では出力ピクセルがそのまま表示されます。",
      de: "Scharf erhält Details und glättet Kanten. Pixel erhält harte Kanten und kann beim Verkleinern Treppeneffekte erzeugen. Beim Zoomen werden die Ausgabepixel ohne zusätzliche Glättung gezeigt.",
    },
  "Sharp · Smooth edges": {
    zh: "清晰模式 · 平滑边缘",
    ja: "シャープ · なめらかな輪郭",
    de: "Scharf · Glatte Kanten",
  },
  Show: {
    zh: "显示",
    ja: "表示",
    de: "Einblenden",
  },
  "Show layer": {
    zh: "显示图层",
    ja: "レイヤーを表示",
    de: "Ebene einblenden",
  },
  "Single tile": {
    zh: "单张贴图",
    ja: "タイル 1 枚",
    de: "Einzelne Kachel",
  },
  "Size (% of tile)": {
    zh: "大小（占画布 %）",
    ja: "サイズ (タイルに対する %)",
    de: "Größe (% der Kachel)",
  },
  "Something went wrong.": {
    zh: "操作失败，请重试。",
    ja: "問題が発生しました。",
    de: "Ein Fehler ist aufgetreten.",
  },
  "Source images exceed the project's 48 MB binary budget.": {
    zh: "原图总大小超过工程约 48 MB 的限制。",
    ja: "元画像の合計サイズがプロジェクトの上限 (48 MB) を超えています。",
    de: "Die Quellbilder überschreiten zusammen das Projektlimit von 48 MB.",
  },
  "Source images must be at most 8192px per side and 32 megapixels.": {
    zh: "原图每边最多 8192 像素，总像素数最多 3200 万。",
    ja: "元画像は各辺 8192 px 以下、合計 3200 万画素以下にしてください。",
    de: "Quellbilder dürfen höchstens 8192 px pro Seite und 32 Megapixel haben.",
  },
  "Spacing follows the rotated array axes. 100% uses the Columns and Rows baseline; higher values spread motifs apart without resizing the images.":
    {
      zh: "间距沿旋转后的阵列两轴调整。100% 使用当前列数和行数的基准间距；数值越大，图案越疏，图片本身大小不变。",
      ja: "間隔は回転後の配列の軸に沿って調整されます。100% は列数と行数で決まる基準の間隔です。値を上げると画像のサイズを保ったまま柄の間隔が広がります。",
      de: "Die Abstände folgen den gedrehten Achsen der Anordnung. Bei 100 % bestimmen die Spalten und Zeilen den Grundabstand. Höhere Werte vergrößern den Abstand der Motive bei gleichbleibender Bildgröße.",
    },
  "Square seamless texture preview": {
    zh: "正方形无缝贴图预览",
    ja: "継ぎ目のない正方形テクスチャのプレビュー",
    de: "Vorschau der nahtlosen quadratischen Textur",
  },
  "TEXTURE ARRAY / SEAMLESS WORKSPACE": {
    zh: "纹理阵列 / 无缝贴图工作区",
    ja: "テクスチャ配列 / シームレス編集",
    de: "TEXTURANORDNUNG / NAHTLOSE MUSTER",
  },
  "Texture Array editor": {
    zh: "纹理阵列编辑器",
    ja: "テクスチャ配列エディター",
    de: "Editor für Texturanordnungen",
  },
  "Texture viewport. Drag to pan, or use arrow keys. Plus and minus zoom. Home resets the view.":
    {
      zh: "贴图视口：拖动或使用方向键平移，加减键缩放，Home 键复位。",
      ja: "テクスチャの表示領域。ドラッグまたは矢印キーで移動し、プラスキーとマイナスキーで拡大・縮小します。Home キーで表示をリセットします。",
      de: "Texturansicht. Verschiebe die Ansicht durch Ziehen oder mit den Pfeiltasten. Plus und Minus ändern den Zoom. Pos1 setzt die Ansicht zurück.",
    },
  "The density limit is active; both axes are adjusted proportionally.": {
    zh: "已达到密度上限，两轴间距已按比例调整。",
    ja: "密度の上限に達したため、両方の軸で間隔を同じ比率で調整しています。",
    de: "Das Dichtelimit wurde erreicht. Die Abstände beider Achsen werden proportional angepasst.",
  },
  "The outline is the finite preview area. 3 × 3 shows nine copies; export always saves one square tile. View movement never changes your design.":
    {
      zh: "边框内是有限的预览区域。3 × 3 显示九份拼接副本，导出始终保存一张正方形贴图。移动视图不会改变设计。",
      ja: "枠内がプレビューの範囲です。3 × 3 ではタイルを 9 枚表示します。書き出されるのは正方形のタイル 1 枚です。プレビューを移動してもデザインは変わりません。",
      de: "Der Rahmen begrenzt die Vorschau. 3 × 3 zeigt neun Kopien der Kachel. Der Export speichert stets eine quadratische Kachel. Das Verschieben der Ansicht ändert das Muster nicht.",
    },
  "Too many layers.": {
    zh: "图层数量超过限制。",
    ja: "レイヤー数が上限を超えています。",
    de: "Zu viele Ebenen.",
  },
  "Transparent motifs work especially well.": {
    zh: "使用透明背景图案效果更佳。",
    ja: "背景が透明な画像が特に適しています。",
    de: "Motive mit transparentem Hintergrund eignen sich besonders gut.",
  },
  "Unable to allocate GPU resources.": {
    zh: "无法分配 GPU 资源。",
    ja: "GPU リソースを確保できませんでした。",
    de: "GPU-Ressourcen konnten nicht reserviert werden.",
  },
  "Unable to allocate image texture.": {
    zh: "无法分配图片纹理。",
    ja: "画像テクスチャのメモリを確保できませんでした。",
    de: "Für die Bildtextur konnte kein Speicher reserviert werden.",
  },
  "Unable to allocate lattice positions.": {
    zh: "无法分配阵列位置数据。",
    ja: "格子座標のメモリを確保できませんでした。",
    de: "Für die Rasterkoordinaten konnte kein Speicher reserviert werden.",
  },
  "Unable to construct a bounded periodic lattice.": {
    zh: "无法生成有界的周期网格。",
    ja: "範囲内に収まる周期格子を作成できませんでした。",
    de: "Das begrenzte periodische Raster konnte nicht erstellt werden.",
  },
  "Unable to create shader program.": {
    zh: "无法创建着色器程序。",
    ja: "シェーダープログラムを作成できませんでした。",
    de: "Das Shaderprogramm konnte nicht erstellt werden.",
  },
  "Unable to create shader.": {
    zh: "无法创建着色器。",
    ja: "シェーダーを作成できませんでした。",
    de: "Der Shader konnte nicht erstellt werden.",
  },
  "Unable to read image.": {
    zh: "无法读取图片。",
    ja: "画像を読み込めませんでした。",
    de: "Das Bild konnte nicht gelesen werden.",
  },
  Undo: {
    zh: "撤销",
    ja: "元に戻す",
    de: "Rückgängig",
  },
  "Uniform repeat: {angle}° · {count} motifs per tile. The requested angle and spacing are matched to a uniform square repeat, so the actual angle and count may adjust. Image rotation stays independent.":
    {
      zh: "均匀周期：实际角度 {angle}° · 每张贴图 {count} 个图案。请求的角度和间距会匹配为均匀的正方形周期，因此实际角度与数量可能调整。图片自身旋转独立控制。",
      ja: "均一な繰り返し: {angle}° · タイルあたり {count} 個の柄。角度と間隔は正方形のタイルで均一に繰り返すように調整されるため、実際の角度と柄の数が変わることがあります。個々の画像の回転は別に調整できます。",
      de: "Gleichmäßige Wiederholung: {angle}° · {count} Motive pro Kachel. Winkel und Abstand werden an die gleichmäßige Wiederholung der quadratischen Kachel angepasst. Der tatsächliche Winkel und die Anzahl können sich dadurch ändern. Die einzelnen Bilder lassen sich unabhängig davon drehen.",
    },
  "Unsupported texture project.": {
    zh: "不支持此贴图工程格式或版本。",
    ja: "対応していないテクスチャプロジェクトです。",
    de: "Dieses Texturprojekt wird nicht unterstützt.",
  },
  "Up to 12 layers per project. Remove a layer before importing more images.": {
    zh: "每个工程最多 12 个图层，请删除图层后再导入图片。",
    ja: "1 つのプロジェクトで使えるレイヤーは 12 枚までです。画像を追加する前にレイヤーを削除してください。",
    de: "Pro Projekt sind bis zu 12 Ebenen möglich. Entferne eine Ebene, bevor du weitere Bilder importierst.",
  },
  "Up to 12 source images per project, including images retained for undo. Start a new project to clear sources.":
    {
      zh: "每个工程最多保留 12 张原图，包含撤销所需的原图。新建工程可清空原图。",
      ja: "元に戻すために保持している画像を含め、元画像は 1 プロジェクトにつき 12 枚までです。新規プロジェクトを作成すると元画像を一括で削除できます。",
      de: "Pro Projekt sind maximal 12 Quellbilder möglich, einschließlich der Bilder, die für „Rückgängig“ gespeichert sind. Beginne ein neues Projekt, um die Quellbilder zu leeren.",
    },
  "Vertical spacing (%)": {
    zh: "纵向间距（%）",
    ja: "縦方向の間隔 (%)",
    de: "Vertikaler Abstand (%)",
  },
  "WebGL2 is unavailable. Enable hardware acceleration or use a WebGL2-capable browser.":
    {
      zh: "WebGL2 不可用，请启用硬件加速或使用支持 WebGL2 的浏览器。",
      ja: "WebGL2 を利用できません。ハードウェアアクセラレーションを有効にするか、WebGL2 対応のブラウザーを使用してください。",
      de: "WebGL2 ist nicht verfügbar. Aktiviere die Hardwarebeschleunigung oder verwende einen Browser mit WebGL2-Unterstützung.",
    },
  "Zoom in": {
    zh: "放大",
    ja: "拡大",
    de: "Vergrößern",
  },
  "Zoom out": {
    zh: "缩小",
    ja: "縮小",
    de: "Verkleinern",
  },
  Pause: {
    zh: "暂停",
    ja: "一時停止",
    de: "Pausieren",
  },
  "Start game": {
    zh: "开始游戏",
    ja: "ゲームを開始",
    de: "Spiel starten",
  },
  "Reset game": {
    zh: "重置游戏",
    ja: "ゲームをリセット",
    de: "Spiel zurücksetzen",
  },
  Ready: {
    zh: "准备就绪",
    ja: "準備完了",
    de: "Bereit",
  },
  Playing: {
    zh: "游戏中",
    ja: "プレイ中",
    de: "Spiel läuft",
  },
  Paused: {
    zh: "已暂停",
    ja: "一時停止中",
    de: "Pausiert",
  },
  "Game over": {
    zh: "游戏结束",
    ja: "ゲームオーバー",
    de: "Spiel vorbei",
  },
  "You cleared the board!": {
    zh: "你清除了所有砖块！",
    ja: "すべてのブロックを壊しました！",
    de: "Du hast alle Steine abgeräumt!",
  },
  "{status} · Score: {score} · Lives: {lives}": {
    zh: "{status} · 得分：{score} · 剩余球数：{lives}",
    ja: "{status} · スコア：{score} · 残りのボール：{lives}",
    de: "{status} · Punkte: {score} · Leben: {lives}",
  },
  "Breakout game. Left and right arrows move the paddle. Space pauses.": {
    zh: "打砖块游戏。按左右方向键移动挡板，按空格键暂停。",
    ja: "ブロック崩しゲーム。左右の矢印キーでパドルを動かし、スペースキーで一時停止します。",
    de: "Breakout. Mit den Pfeiltasten nach links und rechts steuerst du den Schläger. Die Leertaste pausiert das Spiel.",
  },
  "Use a Canvas-capable browser to play Breakout.": {
    zh: "请使用支持 Canvas 的浏览器玩打砖块。",
    ja: "ブロック崩しを遊ぶには、Canvas に対応したブラウザーを使ってください。",
    de: "Zum Spielen von Breakout brauchst du einen Browser mit Canvas-Unterstützung.",
  },
  "Start, then move the paddle with your pointer, a finger, or the left and right arrow keys. Clear all 28 bricks before losing three balls. Space pauses while the board has focus.":
    {
      zh: "开始游戏后，用鼠标、手指或左右方向键移动挡板。在用完三个球之前击碎全部 28 块砖。游戏区域获得焦点时，按空格键暂停。",
      ja: "ゲームを始めたら、ポインター、指、または左右の矢印キーでパドルを動かします。ボールを 3 個失う前に、28 個のブロックをすべて壊してください。ゲーム画面にフォーカスがある間は、スペースキーで一時停止できます。",
      de: "Starte das Spiel und bewege den Schläger mit dem Zeiger, dem Finger oder den Pfeiltasten nach links und rechts. Räume alle 28 Steine ab, bevor du drei Bälle verlierst. Solange das Spielfeld den Fokus hat, pausierst du mit der Leertaste.",
    },
  "You filled the board!": {
    zh: "你填满了整个棋盘！",
    ja: "盤面を埋め尽くしました！",
    de: "Du hast das ganze Spielfeld gefüllt!",
  },
  "{status} · Score: {score}": {
    zh: "{status} · 得分：{score}",
    ja: "{status} · スコア：{score}",
    de: "{status} · Punkte: {score}",
  },
  "Snake game. Arrow keys or WASD to steer. Space to pause.": {
    zh: "贪吃蛇游戏。按方向键或 WASD 控制方向，按空格键暂停。",
    ja: "スネークゲーム。矢印キーまたは WASD で移動方向を変え、スペースキーで一時停止します。",
    de: "Snake. Mit den Pfeiltasten oder WASD steuerst du die Schlange. Die Leertaste pausiert das Spiel.",
  },
  "Use a Canvas-capable browser to play Snake.": {
    zh: "请使用支持 Canvas 的浏览器玩贪吃蛇。",
    ja: "スネークを遊ぶには、Canvas に対応したブラウザーを使ってください。",
    de: "Zum Spielen von Snake brauchst du einen Browser mit Canvas-Unterstützung.",
  },
  "Snake direction controls": {
    zh: "贪吃蛇方向控制",
    ja: "スネークの方向操作",
    de: "Richtungssteuerung für Snake",
  },
  "Move left": {
    zh: "左移",
    ja: "左へ移動",
    de: "Nach links",
  },
  "Move right": {
    zh: "右移",
    ja: "右へ移動",
    de: "Nach rechts",
  },
  "Start, then steer with the arrow keys, WASD, or the buttons. Eat the round food. Avoid the walls and your own tail. Keys are captured only while the board has focus.":
    {
      zh: "开始游戏后，用方向键、WASD 或按钮控制贪吃蛇。吃掉圆形食物，避开墙壁和自己的尾巴。只有游戏区域获得焦点时，键盘控制才生效。",
      ja: "ゲームを始めたら、矢印キー、WASD、またはボタンで操作します。丸いエサを食べながら、壁と自分のしっぽを避けてください。キー操作は、ゲーム画面にフォーカスがある間だけ有効です。",
      de: "Starte das Spiel und steuere die Schlange mit den Pfeiltasten, WASD oder den Schaltflächen. Friss das runde Futter und weiche den Wänden und deinem eigenen Schwanz aus. Die Tasten funktionieren nur, solange das Spielfeld den Fokus hat.",
    },
  "Start simulation": {
    zh: "开始模拟",
    ja: "シミュレーションを開始",
    de: "Simulation starten",
  },
  "Add water": {
    zh: "加水",
    ja: "水を追加",
    de: "Wasser hinzufügen",
  },
  Clear: {
    zh: "清空",
    ja: "クリア",
    de: "Leeren",
  },
  "Gravity: {value}": {
    zh: "重力：{value}",
    ja: "重力：{value}",
    de: "Schwerkraft: {value}",
  },
  "Particle fluid simulation. Use Add water or tap the canvas to pour.": {
    zh: "流体粒子模拟。选择「加水」或轻点画布即可注水。",
    ja: "流体の粒子シミュレーション。「水を追加」を選ぶか、キャンバスをタップすると水を注げます。",
    de: "Partikelsimulation für Flüssigkeiten. Wähle „Wasser hinzufügen“ oder tippe auf die Zeichenfläche.",
  },
  "Your browser needs Canvas support to show this experiment.": {
    zh: "此实验需要支持 Canvas 的浏览器。",
    ja: "この実験を表示するには、Canvas に対応したブラウザーが必要です。",
    de: "Für dieses Experiment brauchst du einen Browser mit Canvas-Unterstützung.",
  },
  "{count} / {limit} particles · {status}.": {
    zh: "粒子数：{count} / {limit} · {status}。",
    ja: "粒子数：{count} / {limit} · {status}。",
    de: "{count} / {limit} Partikel · {status}.",
  },
  Running: {
    zh: "运行中",
    ja: "実行中",
    de: "Läuft",
  },
  "Tap the canvas to pour. This experiment uses a lightweight particle model to approximate fluid motion.":
    {
      zh: "轻点画布即可注水。此实验使用简化的粒子模型近似模拟流体运动。",
      ja: "キャンバスをタップすると水を注げます。この実験では、簡易的な粒子モデルで流体の動きを近似します。",
      de: "Tippe auf die Zeichenfläche, um Wasser hineinzugießen. Dieses Experiment nähert die Bewegung von Flüssigkeiten mit einem vereinfachten Partikelmodell an.",
    },
  "Repeat: {size}px": {
    zh: "重复间距：{size}px",
    ja: "繰り返し間隔：{size}px",
    de: "Wiederholungsabstand: {size} px",
  },
  "Stripe: {size}px": {
    zh: "条纹宽度：{size}px",
    ja: "ストライプ幅：{size}px",
    de: "Streifenbreite: {size} px",
  },
  "Cross stripes": {
    zh: "交叉条纹",
    ja: "交差するストライプ",
    de: "Querstreifen",
  },
  "Base color": {
    zh: "底色",
    ja: "地色",
    de: "Grundfarbe",
  },
  "Stripe color": {
    zh: "条纹颜色",
    ja: "ストライプの色",
    de: "Streifenfarbe",
  },
  "Line color": {
    zh: "线条颜色",
    ja: "ラインの色",
    de: "Linienfarbe",
  },
  "Live preview of your repeating plaid pattern": {
    zh: "重复格纹的实时预览",
    ja: "繰り返しチェック柄のライブプレビュー",
    de: "Live-Vorschau des wiederholten Karomusters",
  },
  "Preparing your pattern…": {
    zh: "正在准备图案…",
    ja: "パターンを準備しています…",
    de: "Muster wird vorbereitet…",
  },
  "Download SVG": {
    zh: "下载 SVG",
    ja: "SVG をダウンロード",
    de: "SVG herunterladen",
  },
  "Download PNG": {
    zh: "下载 PNG",
    ja: "PNG をダウンロード",
    de: "PNG herunterladen",
  },
  "PNG export failed. Try downloading the SVG instead.": {
    zh: "PNG 导出失败。请尝试下载 SVG。",
    ja: "PNG の書き出しに失敗しました。SVG のダウンロードをお試しください。",
    de: "Der PNG-Export ist fehlgeschlagen. Versuche, die SVG-Datei herunterzuladen.",
  },
  "An SVG implementation inspired by Lattice-Generator, with original design by MoonMoonCha and upstream work by Torrekie.":
    {
      zh: "本 SVG 实现受 Lattice-Generator 启发。原始设计来自 MoonMoonCha，上游实现来自 Torrekie。",
      ja: "Lattice-Generator に着想を得た SVG 実装です。原案は MoonMoonCha、上流プロジェクトの開発は Torrekie によるものです。",
      de: "Diese SVG-Implementierung ist von Lattice-Generator inspiriert. Das ursprüngliche Design stammt von MoonMoonCha, die Arbeit am Vorgängerprojekt von Torrekie.",
    },
  "CC BY 4.0 attribution": {
    zh: "CC BY 4.0 署名",
    ja: "CC BY 4.0 のクレジット",
    de: "Namensnennung nach CC BY 4.0",
  },
  "No images leave your browser.": {
    zh: "图像处理始终在浏览器中完成。",
    ja: "画像はブラウザー内だけで処理されます。",
    de: "Bilder werden ausschließlich im Browser verarbeitet.",
  },
  "Bring your own model manifest": {
    zh: "选择本地模型清单",
    ja: "ローカルのモデルマニフェストを選択",
    de: "Eigenes Modellmanifest auswählen",
  },
  "Inspect the reference names in a local .model3.json file. Inspection takes place entirely in your browser.":
    {
      zh: "查看本地 .model3.json 文件中引用的文件名。检查过程完全在浏览器中完成。",
      ja: "ローカルの .model3.json ファイルが参照するファイル名を確認できます。確認処理はすべてブラウザー内で行われます。",
      de: "Prüfe die Dateinamen, auf die eine lokale .model3.json-Datei verweist. Die Prüfung läuft vollständig in deinem Browser.",
    },
  "Model manifest": {
    zh: "模型清单",
    ja: "モデルマニフェスト",
    de: "Modellmanifest",
  },
  "Choose a manifest smaller than 1 MB.": {
    zh: "请选择小于 1 MB 的清单文件。",
    ja: "1 MB 未満のマニフェストを選択してください。",
    de: "Wähle ein Manifest mit weniger als 1 MB.",
  },
  "The manifest is not valid JSON.": {
    zh: "清单文件的 JSON 格式无效。",
    ja: "マニフェストの JSON 形式が無効です。",
    de: "Das Manifest enthält ungültiges JSON.",
  },
  "Could not read the manifest.": {
    zh: "无法读取清单文件。",
    ja: "マニフェストを読み込めませんでした。",
    de: "Das Manifest konnte nicht gelesen werden.",
  },
  "Choose a Cubism .model3.json manifest with Version 3.": {
    zh: "请选择 Version 字段为 3 的 Cubism .model3.json 清单文件。",
    ja: "Version フィールドが 3 の Cubism .model3.json マニフェストを選択してください。",
    de: "Wähle ein Cubism-Manifest (.model3.json) mit dem Wert 3 im Feld Version.",
  },
  "The manifest needs a .moc3 reference.": {
    zh: "清单必须包含 .moc3 文件引用。",
    ja: "マニフェストには .moc3 ファイルへの参照が必要です。",
    de: "Das Manifest muss auf eine .moc3-Datei verweisen.",
  },
  "Texture references must be a list of up to 64 file names.": {
    zh: "纹理引用必须是列表，最多包含 64 个文件名。",
    ja: "テクスチャ参照は、最大 64 個のファイル名を含むリストにしてください。",
    de: "Texturreferenzen müssen als Liste mit höchstens 64 Dateinamen vorliegen.",
  },
  "Manifest references": {
    zh: "清单中的引用",
    ja: "マニフェストの参照先",
    de: "Referenzen im Manifest",
  },
  Model: {
    zh: "模型",
    ja: "モデル",
    de: "Modell",
  },
  Textures: {
    zh: "纹理",
    ja: "テクスチャ",
    de: "Texturen",
  },
  Motions: {
    zh: "动作",
    ja: "モーション",
    de: "Bewegungen",
  },
  Expressions: {
    zh: "表情",
    ja: "表情",
    de: "Gesichtsausdrücke",
  },
  "The package includes viewer integration. Model rendering requires an authorized Cubism runtime adapter and your own authorized model assets.":
    {
      zh: "此软件包提供查看器的集成接口。渲染模型需要经授权的 Cubism 运行时适配器，以及你有权使用的模型资源。",
      ja: "パッケージにはビューアーとの連携機能が含まれています。モデルを描画するには、使用が許可された Cubism ランタイムアダプターと、利用権限のあるモデル素材が必要です。",
      de: "Das Paket bietet eine Viewer-Integration. Zur Anzeige des Modells brauchst du einen autorisierten Cubism-Runtime-Adapter und Modelldateien, für die du eine Nutzungsberechtigung hast.",
    },
  "Loading photo mosaic editor": {
    zh: "正在加载照片马赛克编辑器",
    ja: "フォトモザイクエディターを読み込み中",
    de: "Editor für Fotomosaike wird geladen",
  },
  "Loading photo waterfall editor": {
    zh: "正在加载瀑布流拼图编辑器",
    ja: "写真の段組みエディターを読み込み中",
    de: "Editor für Spaltencollagen wird geladen",
  },
  "Photo mosaic editor": {
    zh: "照片马赛克编辑器",
    ja: "フォトモザイクエディター",
    de: "Fotomosaik-Editor",
  },
  "Photo waterfall editor": {
    zh: "瀑布流拼图编辑器",
    ja: "写真の段組みエディター",
    de: "Editor für Spaltencollagen",
  },
  "Calculating preview…": {
    zh: "正在生成预览…",
    ja: "プレビューを生成中…",
    de: "Vorschau wird berechnet…",
  },
  "The matched preview could not be rendered.": {
    zh: "无法生成配色匹配预览。",
    ja: "色を合わせたプレビューを表示できませんでした。",
    de: "Die Vorschau mit Farbanpassung konnte nicht angezeigt werden.",
  },
  "Opening target…": {
    zh: "正在打开目标图片…",
    ja: "目標画像を開いています…",
    de: "Zielbild wird geöffnet…",
  },
  "The target could not be opened as an image.": {
    zh: "无法打开目标图片。",
    ja: "目標画像を開けませんでした。",
    de: "Die Zieldatei konnte nicht als Bild geöffnet werden.",
  },
  "Calculating photo matches…": {
    zh: "正在匹配照片颜色…",
    ja: "写真の色の一致を計算中…",
    de: "Passende Fotos werden berechnet…",
  },
  "Photos arranged by target color.": {
    zh: "已按目标图片的颜色排列照片。",
    ja: "目標画像の色に合わせて写真を配置しました。",
    de: "Die Fotos wurden nach den Farben des Zielbilds angeordnet.",
  },
  "The current layout already matches these photos.": {
    zh: "当前布局已符合这些照片的色彩匹配结果。",
    ja: "現在の配置はすでにこれらの写真に合っています。",
    de: "Das aktuelle Layout passt bereits zu diesen Fotos.",
  },
  "The photos could not be rearranged by color.": {
    zh: "无法按颜色重新排列照片。",
    ja: "写真を色に合わせて並べ替えられませんでした。",
    de: "Die Fotos konnten nicht nach Farbe neu angeordnet werden.",
  },
  "Opening photos…": {
    zh: "正在打开照片…",
    ja: "写真を開いています…",
    de: "Fotos werden geöffnet…",
  },
  "Unlock a photo to make room for the new images.": {
    zh: "请解锁一张照片，为新照片留出空间。",
    ja: "新しい画像を追加できるよう、写真の固定を解除してください。",
    de: "Löse die Fixierung eines Fotos, um Platz für die neuen Bilder zu schaffen.",
  },
  "{count} file could not be opened as a photo.": {
    zh: "有 {count} 个文件无法作为照片打开。",
    ja: "{count} 件のファイルを写真として開けませんでした。",
    de: "{count} Datei konnte nicht als Foto geöffnet werden.",
  },
  "{count} files could not be opened as photos.": {
    zh: "有 {count} 个文件无法作为照片打开。",
    ja: "{count} 件のファイルを写真として開けませんでした。",
    de: "{count} Dateien konnten nicht als Fotos geöffnet werden.",
  },
  "This mosaic can hold up to {count} photos.": {
    zh: "此马赛克拼图最多可容纳 {count} 张照片。",
    ja: "このモザイクには最大 {count} 枚の写真を配置できます。",
    de: "Dieses Mosaik bietet Platz für bis zu {count} Fotos.",
  },
  "Unlock another photo to remove this one and keep the canvas filled.": {
    zh: "请解锁另一张照片，以便移除当前照片并填满画布。",
    ja: "この写真を外してキャンバスに隙間を作らないようにするには、別の写真の固定を解除してください。",
    de: "Löse die Fixierung eines anderen Fotos, damit die Fläche beim Entfernen dieses Fotos ausgefüllt bleibt.",
  },
  "Enter whole pixel dimensions from {min} to {max}, up to {total} pixels total.":
    {
      zh: "宽高请输入 {min} 到 {max} 之间的整数，总像素数不超过 {total}。",
      ja: "幅と高さは {min}〜{max} の整数で指定してください。総画素数は {total} 以下です。",
      de: "Gib für Breite und Höhe ganze Werte von {min} bis {max} ein. Insgesamt sind bis zu {total} Pixel möglich.",
    },
  "This size cannot be filled around the locked photos. Unlock photos or try a different size.":
    {
      zh: "按此尺寸调整时，无法填满锁定照片周围的空间。请解锁部分照片，或尝试其他尺寸。",
      ja: "このサイズでは固定した写真の周りを埋められません。写真の固定を解除するか、別のサイズを試してください。",
      de: "Bei dieser Größe bleiben Lücken um die fixierten Fotos. Löse Fixierungen oder wähle eine andere Größe.",
    },
  "This canvas is too small to fit all the photos.": {
    zh: "画布太小，无法容纳所有照片。",
    ja: "すべての写真を配置するにはキャンバスが小さすぎます。",
    de: "Die Arbeitsfläche ist zu klein für alle Fotos.",
  },
  "Calculating and encoding PNG…": {
    zh: "正在计算并编码 PNG…",
    ja: "画像を計算し、PNG に変換しています…",
    de: "PNG wird berechnet und kodiert…",
  },
  "PNG download started.": {
    zh: "已开始下载 PNG。",
    ja: "PNG のダウンロードを開始しました。",
    de: "PNG-Download wurde gestartet.",
  },
  "The PNG could not be exported.": {
    zh: "无法导出 PNG。",
    ja: "PNG を書き出せませんでした。",
    de: "Das PNG konnte nicht exportiert werden.",
  },
  "That spot cannot be filled. Kept the last gapless layout.": {
    zh: "无法填满该位置，已保留上一个无缝布局。",
    ja: "その位置には隙間ができるため、直前の配置を維持しました。",
    de: "An dieser Stelle würde eine Lücke entstehen. Das letzte lückenlose Layout bleibt erhalten.",
  },
  "There is no gapless layout at that position.": {
    zh: "在该位置无法实现无缝布局。",
    ja: "その位置には隙間なく配置できません。",
    de: "An dieser Position ist kein lückenloses Layout möglich.",
  },
  "Add photos": {
    zh: "添加照片",
    ja: "写真を追加",
    de: "Fotos hinzufügen",
  },
  "Shuffle layout": {
    zh: "随机重排",
    ja: "配置をシャッフル",
    de: "Layout mischen",
  },
  Preset: {
    zh: "尺寸预设",
    ja: "サイズプリセット",
    de: "Größenvorlage",
  },
  Custom: {
    zh: "自定义",
    ja: "カスタム",
    de: "Benutzerdefiniert",
  },
  "Width (px)": {
    zh: "宽度（px）",
    ja: "幅（px）",
    de: "Breite (px)",
  },
  "Height (px)": {
    zh: "高度（px）",
    ja: "高さ（px）",
    de: "Höhe (px)",
  },
  "Apply size": {
    zh: "应用尺寸",
    ja: "サイズを適用",
    de: "Größe übernehmen",
  },
  Antialiasing: {
    zh: "抗锯齿",
    ja: "アンチエイリアス",
    de: "Kantenglättung",
  },
  "Off (nearest neighbor)": {
    zh: "关闭（最近邻）",
    ja: "オフ（最近傍法）",
    de: "Aus (Nächster Nachbar)",
  },
  Low: {
    zh: "低",
    ja: "低",
    de: "Niedrig",
  },
  Medium: {
    zh: "中",
    ja: "中",
    de: "Mittel",
  },
  High: {
    zh: "高",
    ja: "高",
    de: "Hoch",
  },
  "Replace target image": {
    zh: "更换目标图片",
    ja: "目標画像を変更",
    de: "Zielbild ersetzen",
  },
  "Choose target image": {
    zh: "选择目标图片",
    ja: "目標画像を選択",
    de: "Zielbild auswählen",
  },
  "Color strength": {
    zh: "配色强度",
    ja: "色補正の強さ",
    de: "Stärke der Farbanpassung",
  },
  "Tiles per side": {
    zh: "每边拼图块数",
    ja: "一辺あたりのタイル数",
    de: "Kacheln pro Seite",
  },
  "Apply density": {
    zh: "应用密度",
    ja: "密度を適用",
    de: "Dichte übernehmen",
  },
  "{count} tiles": {
    zh: "{count} 个拼图块",
    ja: "タイル {count} 枚",
    de: "{count} Kacheln",
  },
  "Match target brightness": {
    zh: "匹配目标亮度",
    ja: "目標画像の明るさに合わせる",
    de: "Helligkeit an Zielbild anpassen",
  },
  "Match photos again": {
    zh: "重新匹配照片",
    ja: "写真の色合わせをやり直す",
    de: "Fotos erneut abgleichen",
  },
  "Remove target": {
    zh: "移除目标图片",
    ja: "目標画像を削除",
    de: "Zielbild entfernen",
  },
  "Mosaic canvas": {
    zh: "马赛克画布",
    ja: "モザイクキャンバス",
    de: "Mosaik-Arbeitsfläche",
  },
  "Unlock a photo before adding more files.": {
    zh: "请先解锁一张照片，再添加更多文件。",
    ja: "写真の固定を解除してから、ファイルを追加してください。",
    de: "Löse die Fixierung eines Fotos, bevor du weitere Dateien hinzufügst.",
  },
  "Drop photos here": {
    zh: "将照片拖到这里",
    ja: "ここに写真をドロップ",
    de: "Fotos hier ablegen",
  },
  "Drop up to {count} images, or use Add photos to browse.": {
    zh: "最多可拖入 {count} 张图片，也可以点击「添加照片」浏览文件。",
    ja: "最大 {count} 枚の画像をドロップするか、「写真を追加」から選択してください。",
    de: "Lege bis zu {count} Bilder ab oder wähle sie über „Fotos hinzufügen“ aus.",
  },
  "Color-matched mosaic preview": {
    zh: "配色匹配后的马赛克预览",
    ja: "色を合わせたモザイクのプレビュー",
    de: "Mosaikvorschau mit Farbanpassung",
  },
  Locked: {
    zh: "已锁定",
    ja: "固定済み",
    de: "Fixiert",
  },
  "{name} (locked)": {
    zh: "{name}（已锁定）",
    ja: "{name}（固定済み）",
    de: "{name} (fixiert)",
  },
  "Resize left edge": {
    zh: "拖动左边缘调整大小",
    ja: "左端でサイズを変更",
    de: "Größe am linken Rand ändern",
  },
  "Resize right edge": {
    zh: "拖动右边缘调整大小",
    ja: "右端でサイズを変更",
    de: "Größe am rechten Rand ändern",
  },
  "Resize top edge": {
    zh: "拖动上边缘调整大小",
    ja: "上端でサイズを変更",
    de: "Größe am oberen Rand ändern",
  },
  "Resize bottom edge": {
    zh: "拖动下边缘调整大小",
    ja: "下端でサイズを変更",
    de: "Größe am unteren Rand ändern",
  },
  "Drop photos to add them": {
    zh: "松开即可添加照片",
    ja: "写真をドロップして追加",
    de: "Fotos zum Hinzufügen ablegen",
  },
  "{count} photo": {
    zh: "{count} 张照片",
    ja: "写真 {count} 枚",
    de: "{count} Foto",
  },
  "{count} photos": {
    zh: "{count} 张照片",
    ja: "写真 {count} 枚",
    de: "{count} Fotos",
  },
  "{count} locked": {
    zh: "已锁定 {count} 张",
    ja: "{count} 枚を固定",
    de: "{count} fixiert",
  },
  "Unlock photo": {
    zh: "解锁照片",
    ja: "写真の固定を解除",
    de: "Foto entsperren",
  },
  "Lock photo": {
    zh: "锁定照片",
    ja: "写真を固定",
    de: "Foto fixieren",
  },
  "Drop files onto the canvas to add them. Drag a photo to move it, or drag an edge handle to resize it. The other unlocked photos reflow around it. Arrow keys work on focused photos and handles.":
    {
      zh: "将文件拖入画布即可添加。拖动照片可移动位置，拖动边缘手柄可调整大小。其他未锁定的照片会自动重新排列。选中照片或手柄后，也可以使用方向键。",
      ja: "キャンバスにファイルをドロップして追加できます。写真をドラッグして移動し、端のハンドルをドラッグしてサイズを変えます。固定していないほかの写真は自動で並び直します。写真やハンドルにフォーカスして矢印キーでも操作できます。",
      de: "Lege Dateien zum Hinzufügen auf der Arbeitsfläche ab. Ziehe ein Foto zum Verschieben oder einen Randgriff zum Ändern der Größe. Die übrigen unfixierten Fotos ordnen sich neu an. Fokussierte Fotos und Griffe lassen sich mit den Pfeiltasten steuern.",
    },
  "Canvas width (px)": {
    zh: "画布宽度（px）",
    ja: "キャンバスの幅（px）",
    de: "Arbeitsflächenbreite (px)",
  },
  "Gap placement": {
    zh: "留白位置",
    ja: "余白の位置",
    de: "Position der Leerflächen",
  },
  Bottom: {
    zh: "底部",
    ja: "下",
    de: "Unten",
  },
  Top: {
    zh: "顶部",
    ja: "上",
    de: "Oben",
  },
  "Top and bottom": {
    zh: "顶部和底部",
    ja: "上下",
    de: "Oben und unten",
  },
  "Between photos": {
    zh: "照片之间",
    ja: "写真の間",
    de: "Zwischen den Fotos",
  },
  "Background color": {
    zh: "背景色",
    ja: "背景色",
    de: "Hintergrundfarbe",
  },
  Transparent: {
    zh: "透明背景",
    ja: "背景を透明にする",
    de: "Transparenter Hintergrund",
  },
  "Auto arrange": {
    zh: "自动排列",
    ja: "自動配置",
    de: "Automatisch anordnen",
  },
  "Exporting…": {
    zh: "正在导出…",
    ja: "書き出し中…",
    de: "Export läuft…",
  },
  "Drag photos to reorder them or move them to another column.": {
    zh: "拖动照片可以调整顺序，也可以将照片移到其他列。",
    ja: "写真をドラッグして順番を変えたり、別の列に移動したりできます。",
    de: "Ziehe Fotos, um ihre Reihenfolge zu ändern oder sie in eine andere Spalte zu verschieben.",
  },
  "Check the canvas settings": {
    zh: "请检查画布设置",
    ja: "キャンバスの設定を確認",
    de: "Prüfe die Einstellungen der Arbeitsfläche",
  },
  "Enter a valid width and column count to preview the collage.": {
    zh: "请输入有效的宽度和列数，以预览拼图。",
    ja: "コラージュをプレビューするには、有効な幅と列数を入力してください。",
    de: "Gib eine gültige Breite und Spaltenzahl ein, um die Collage anzuzeigen.",
  },
  "Photos stay in your browser.": {
    zh: "照片仅在浏览器内处理。",
    ja: "写真はブラウザー内で処理されます。",
    de: "Deine Fotos bleiben im Browser.",
  },
  "{percent}% unfilled": {
    zh: "{percent}% 留白",
    ja: "余白 {percent}%",
    de: "{percent} % freie Fläche",
  },
  "Remove {name}": {
    zh: "移除 {name}",
    ja: "{name} を削除",
    de: "{name} entfernen",
  },
  "Use a width of 120–8192 px and 1–12 columns.": {
    zh: "宽度须为 120–8192 px，列数须为 1–12。",
    ja: "幅は 120〜8192 px、列数は 1〜12 に設定してください。",
    de: "Erlaubt sind 120–8192 px Breite und 1–12 Spalten.",
  },
  "This collage is too large to export. Reduce the canvas width or add columns.":
    {
      zh: "拼图太大，无法导出。请缩小画布宽度或增加列数。",
      ja: "コラージュが大きすぎて書き出せません。幅を狭くするか、列を増やしてください。",
      de: "Die Collage ist für den Export zu groß. Verringere die Breite oder füge Spalten hinzu.",
    },
  "Could not open {files}.": {
    zh: "无法打开 {files}。",
    ja: "{files} を開けませんでした。",
    de: "Folgende Dateien konnten nicht geöffnet werden: {files}.",
  },
  "PNG export failed. Try a smaller canvas width.": {
    zh: "PNG 导出失败。请尝试缩小画布宽度。",
    ja: "PNG の書き出しに失敗しました。キャンバスの幅を狭くしてみてください。",
    de: "Der PNG-Export ist fehlgeschlagen. Versuche es mit einer kleineren Breite.",
  },
  "Waterfall collage preview": {
    zh: "瀑布流拼图预览",
    ja: "段組みコラージュのプレビュー",
    de: "Vorschau der Spaltencollage",
  },
  "Use the arrow keys to reorder this photo or move it to another column.": {
    zh: "使用方向键调整这张照片的顺序，或将它移到其他列。",
    ja: "矢印キーでこの写真の順番を変えたり、別の列に移動したりできます。",
    de: "Verschiebe dieses Foto mit den Pfeiltasten innerhalb der Spalte oder in eine andere Spalte.",
  },
  "{name}, column {column}, position {position}": {
    zh: "{name}，第 {column} 列，第 {position} 个位置",
    ja: "{name}、{column} 列目、{position} 番目",
    de: "{name}, Spalte {column}, Position {position}",
  },
  "Copy palette · {name}": {
    zh: "复制整组配色 · {name}",
    ja: "{name} の配色をコピー",
    de: "Palette kopieren · {name}",
  },
  "Copy color {color}": {
    zh: "复制色值 {color}",
    ja: "色 {color} をコピー",
    de: "Farbe {color} kopieren",
  },
  "Copied to clipboard · {colors}": {
    zh: "已复制到剪贴板 · {colors}",
    ja: "クリップボードにコピーしました · {colors}",
    de: "In die Zwischenablage kopiert · {colors}",
  },
  "Color harmony": {
    zh: "色彩搭配",
    ja: "配色の調和",
    de: "Farbharmonie",
  },
  Analogous: {
    zh: "邻近色",
    ja: "類似色",
    de: "Analog",
  },
  Complementary: {
    zh: "互补色",
    ja: "補色",
    de: "Komplementär",
  },
  Triadic: {
    zh: "三等分色",
    ja: "三色配色",
    de: "Triadisch",
  },
  Monochrome: {
    zh: "同色系",
    ja: "単色",
    de: "Monochrom",
  },
  "Auto palette": {
    zh: "自动配色",
    ja: "配色を自動生成",
    de: "Palette erzeugen",
  },
  "Square tile": {
    zh: "方形图块",
    ja: "正方形タイル",
    de: "Quadratische Kachel",
  },
  "{count} × {count} repeats · {size} × {size}px": {
    zh: "{count} × {count} 次重复 · {size} × {size}px",
    ja: "{count} × {count} 回の繰り返し · {size} × {size}px",
    de: "{count} × {count} Wiederholungen · {size} × {size} px",
  },
  "Preview / export layer": {
    zh: "预览和导出的图层",
    ja: "プレビュー・書き出しのレイヤー",
    de: "Ebene für Vorschau und Export",
  },
  "All layers": {
    zh: "所有图层",
    ja: "すべてのレイヤー",
    de: "Alle Ebenen",
  },
  "all layers": {
    zh: "所有图层",
    ja: "すべてのレイヤー",
    de: "alle Ebenen",
  },
  Background: {
    zh: "背景",
    ja: "背景",
    de: "Hintergrund",
  },
  "Vertical stripes": {
    zh: "竖向条纹",
    ja: "縦ストライプ",
    de: "Vertikale Streifen",
  },
  "Horizontal stripes": {
    zh: "横向条纹",
    ja: "横ストライプ",
    de: "Horizontale Streifen",
  },
  "Fine lines": {
    zh: "细线",
    ja: "細いライン",
    de: "Feine Linien",
  },
  "Preview 3 × 3 tiles": {
    zh: "预览 3 × 3 拼接",
    ja: "3 × 3 のタイルをプレビュー",
    de: "3 × 3 Kacheln anzeigen",
  },
  "Three by three seamless repeat": {
    zh: "3 × 3 无缝拼接",
    ja: "3 × 3 のシームレスな繰り返し",
    de: "Nahtlose 3 × 3 Wiederholung",
  },
  "{view} preview: {layer}": {
    zh: "{view}预览：{layer}",
    ja: "{view}のプレビュー：{layer}",
    de: "Vorschau ({view}): {layer}",
  },
  "{size} × {size}px seamless square. The 3 × 3 preview repeats this tile. Each download contains a single square. Select an individual layer to download it separately. Stripe and fine-line PNGs have transparent backgrounds. All-layer SVGs retain named, editable layers.":
    {
      zh: "{size} × {size}px 的无缝方形图块。3 × 3 预览重复排列这个图块。每次只下载一个方形图块。选择单个图层即可单独下载。条纹和细线图层的 PNG 背景透明。包含所有图层的 SVG 保留可编辑的命名图层。",
      ja: "{size} × {size}px のシームレスな正方形タイルです。3 × 3 のプレビューではこのタイルを繰り返します。ダウンロードされるのは正方形タイル 1 枚です。個別にダウンロードするには、対象のレイヤーを選択してください。ストライプと細線の PNG は背景が透明です。全レイヤーを含む SVG では、名前付きのレイヤーを編集できます。",
      de: "Nahtlose quadratische Kachel mit {size} × {size} px. Die 3 × 3 Vorschau wiederholt diese Kachel. Jeder Download enthält eine einzelne Kachel. Wähle eine Ebene aus, um sie separat herunterzuladen. PNG-Dateien mit Streifen oder feinen Linien haben einen transparenten Hintergrund. SVG-Dateien mit allen Ebenen behalten benannte, editierbare Ebenen.",
    },
  "Download layered SVG": {
    zh: "下载分层 SVG",
    ja: "レイヤー付き SVG をダウンロード",
    de: "SVG mit Ebenen herunterladen",
  },
  "Download layer SVG": {
    zh: "下载图层 SVG",
    ja: "レイヤーを SVG でダウンロード",
    de: "Ebene als SVG herunterladen",
  },
  "Exporting PNG…": {
    zh: "正在导出 PNG…",
    ja: "PNG を書き出しています…",
    de: "PNG wird exportiert…",
  },
  "Download square PNG": {
    zh: "下载方形 PNG",
    ja: "正方形の PNG をダウンロード",
    de: "Quadratisches PNG herunterladen",
  },
  "Download layer PNG": {
    zh: "下载图层 PNG",
    ja: "レイヤーを PNG でダウンロード",
    de: "Ebene als PNG herunterladen",
  },
  "Export needs at least one layer.": {
    zh: "导出需要至少一个图层。",
    ja: "書き出しにはレイヤーが少なくとも 1 枚必要です。",
    de: "Für den Export ist mindestens eine Ebene erforderlich.",
  },
  "Open workspace": {
    zh: "打开工作区",
    ja: "作業画面を開く",
    de: "Arbeitsbereich öffnen",
  },
  "Back to overview": {
    zh: "返回介绍页",
    ja: "概要に戻る",
    de: "Zurück zur Übersicht",
  },
  "Saved in this browser": {
    zh: "已保存到此浏览器",
    ja: "このブラウザーに保存済み",
    de: "In diesem Browser gespeichert",
  },
  "Saving project…": {
    zh: "正在保存工程…",
    ja: "プロジェクトを保存中…",
    de: "Projekt wird gespeichert…",
  },
  "Restoring saved project…": {
    zh: "正在恢复已保存的工程…",
    ja: "保存済みのプロジェクトを復元中…",
    de: "Gespeichertes Projekt wird wiederhergestellt…",
  },
  "The saved project could not be restored. Open a project, start a new one, or replace the saved copy.":
    {
      zh: "无法恢复浏览器中保存的工程，请打开工程、新建工程或替换保存的副本。",
      ja: "保存済みのプロジェクトを復元できませんでした。プロジェクトを開くか、新規作成するか、保存済みのコピーを置き換えてください。",
      de: "Das gespeicherte Projekt konnte nicht wiederhergestellt werden. Öffne ein Projekt, beginne ein neues oder ersetze die gespeicherte Kopie.",
    },
  "Browser storage is unavailable or full. Download Save project to keep your work. Workspace navigation is paused until saving succeeds.":
    {
      zh: "浏览器存储不可用或已满，请点击保存工程下载备份。保存成功前不会跳转到工作区，以免丢失修改。",
      ja: "ブラウザーの保存領域が使えないか、空きがありません。「プロジェクトを保存」でファイルをダウンロードして作業内容を保管してください。保存に成功するまで作業画面から移動できません。",
      de: "Der Browserspeicher ist nicht verfügbar oder voll. Lade über „Projekt speichern“ eine Kopie herunter, um deine Arbeit zu sichern. Du kannst den Arbeitsbereich erst verlassen, wenn das Speichern erfolgreich war.",
    },
  "Replace saved copy": {
    zh: "替换浏览器中的副本",
    ja: "保存済みのコピーを置き換える",
    de: "Gespeicherte Kopie ersetzen",
  },
  "Select all layers": {
    zh: "勾选全部图层",
    ja: "すべてのレイヤーを選択",
    de: "Alle Ebenen auswählen",
  },
  "{count} checked": {
    zh: "已勾选 {count} 层",
    ja: "{count} 枚選択済み",
    de: "{count} ausgewählt",
  },
  "Select {name}": {
    zh: "勾选 {name}",
    ja: "{name}を選択",
    de: "{name} auswählen",
  },
  "Editing {count} layer(s)": {
    zh: "正在调整 {count} 个图层",
    ja: "{count} 枚のレイヤーを編集中",
    de: "Ebenen in Bearbeitung: {count}",
  },
  "Selected layers have different parameters. Confirm to synchronize them with the first checked layer: {name}.":
    {
      zh: "所选图层的参数不一致。确认后将按照列表中第一个勾选图层 {name} 的参数同步。",
      ja: "選択したレイヤーの設定が異なります。最初にチェックされたレイヤー「{name}」に合わせるには、確認してください。",
      de: "Die ausgewählten Ebenen haben unterschiedliche Parameter. Bestätige, um sie mit der ersten ausgewählten Ebene „{name}“ abzugleichen.",
    },
  "Confirm and sync selected layers": {
    zh: "确认并同步所选图层",
    ja: "確認して選択したレイヤーを同期",
    de: "Bestätigen und ausgewählte Ebenen abgleichen",
  },
  "Selected layer parameters": {
    zh: "所选图层参数",
    ja: "選択したレイヤーの設定",
    de: "Parameter der ausgewählten Ebenen",
  },
  "Image actions affect the active layer. Parameters affect checked layers.": {
    zh: "图片操作仅影响当前图层；参数调整影响勾选的图层。",
    ja: "画像の操作はアクティブなレイヤーに適用されます。パラメーターの変更はチェックしたレイヤーに適用されます。",
    de: "Bildaktionen gelten für die aktive Ebene. Parameteränderungen gelten für die ausgewählten Ebenen.",
  },
  Layers: {
    zh: "图层",
    ja: "レイヤー",
    de: "Ebenen",
  },
  "Layer settings": {
    zh: "图层设置",
    ja: "レイヤー設定",
    de: "Ebeneneinstellungen",
  },
  "Parameter clipboard": {
    zh: "参数剪贴板",
    ja: "パラメーターのコピー・貼り付け",
    de: "Parameter kopieren und einfügen",
  },
  "Array parameters": {
    zh: "排列参数",
    ja: "配列パラメーター",
    de: "Anordnungsparameter",
  },
  "Select a layer to edit. Drop one image on a row to replace it.": {
    zh: "选中图层后编辑参数，或将单张图片拖到对应行来替换图片。",
    ja: "編集するレイヤーを選択してください。レイヤーの行に画像を 1 枚ドロップすると、画像が置き換わります。",
    de: "Wähle eine Ebene zum Bearbeiten aus. Ziehe ein einzelnes Bild auf eine Zeile, um das Bild dieser Ebene zu ersetzen.",
  },
  "Layer {number}": {
    zh: "图层 {number}",
    ja: "レイヤー {number}",
    de: "Ebene {number}",
  },
  "Hide {name}": {
    zh: "隐藏 {name}",
    ja: "{name}を非表示",
    de: "{name} ausblenden",
  },
  "Show {name}": {
    zh: "显示 {name}",
    ja: "{name}を表示",
    de: "{name} einblenden",
  },
  "Export size": {
    zh: "导出尺寸",
    ja: "書き出しサイズ",
    de: "Exportgröße",
  },
  "Square side (px)": {
    zh: "正方形边长（像素）",
    ja: "正方形の一辺 (px)",
    de: "Seitenlänge (px)",
  },
  "Pixels · PSD / PNG ZIP": {
    zh: "像素 · PSD / PNG ZIP",
    ja: "ピクセル · PSD / PNG ZIP",
    de: "Pixel · PSD / PNG ZIP",
  },
  "Choose any whole-number side from 1 to 4096 px. Width and height stay equal.":
    {
      zh: "可输入 1 至 4096 的任意整数，宽高保持一致。",
      ja: "一辺の長さは 1〜4096 px の整数で指定できます。幅と高さは同じ値になります。",
      de: "Wähle eine ganzzahlige Seitenlänge von 1 bis 4096 px. Breite und Höhe bleiben gleich.",
    },
  "Copy parameters": {
    zh: "复制参数",
    ja: "パラメーターをコピー",
    de: "Parameter kopieren",
  },
  "Paste parameters": {
    zh: "粘贴参数",
    ja: "パラメーターを貼り付け",
    de: "Parameter einfügen",
  },
  "Paste to all layers": {
    zh: "粘贴到全部图层",
    ja: "すべてのレイヤーに貼り付け",
    de: "In alle Ebenen einfügen",
  },
  "Paste layer parameters": {
    zh: "粘贴图层参数",
    ja: "レイヤーのパラメーターを貼り付け",
    de: "Ebenenparameter einfügen",
  },
  "Parameters copied from {name}.": {
    zh: "已复制图层 {name} 的参数。",
    ja: "{name}からパラメーターをコピーしました。",
    de: "Parameter aus „{name}“ kopiert.",
  },
  "Copy array settings, size, angles, offsets, opacity, and image scaling. Paste keeps each layer's image, name, visibility, and order.":
    {
      zh: "复制排列、大小、角度、偏移、透明度和缩放采样设置。粘贴时保留各图层的图片、名称、可见性和顺序。",
      ja: "配列設定、サイズ、角度、ずれ、不透明度、画像の拡大・縮小方式をコピーできます。貼り付けても各レイヤーの画像、名前、表示状態、順序は変わりません。",
      de: "Kopiere Anordnung, Größe, Winkel, Versatz, Deckkraft und Skalierungsmodus. Beim Einfügen bleiben Bild, Name, Sichtbarkeit und Reihenfolge jeder Ebene erhalten.",
    },
  "Import PSD": {
    zh: "导入 PSD",
    ja: "PSD を読み込む",
    de: "PSD importieren",
  },
  "Choose PSD layers": {
    zh: "选择 PSD 图层",
    ja: "PSD のレイヤーを選択",
    de: "PSD-Ebenen auswählen",
  },
  "Selected layers become independent images. PSD group compositing, masks, effects, blend modes, and document positions are not reproduced.":
    {
      zh: "所选图层将作为独立图片导入，不重现 PSD 组的合成效果、蒙版、特效、混合模式和文档中的位置。",
      ja: "選択したレイヤーは個別の画像として読み込まれます。PSD のグループ合成、マスク、効果、描画モード、ドキュメント内の位置は再現されません。",
      de: "Die ausgewählten Ebenen werden als eigenständige Bilder importiert. Die Verrechnung von PSD-Gruppen, Masken, Effekte, Mischmodi und Positionen im Dokument werden nicht übernommen.",
    },
  "Hidden layers can also be selected. Imported layers start visible.": {
    zh: "也可以选择隐藏图层，导入后图层默认可见。",
    ja: "非表示のレイヤーも選択できます。読み込んだレイヤーは表示された状態になります。",
    de: "Ausgeblendete Ebenen lassen sich ebenfalls auswählen. Importierte Ebenen sind zunächst sichtbar.",
  },
  "Select available": {
    zh: "选择可导入图层",
    ja: "読み込めるレイヤーを選択",
    de: "Importierbare Ebenen auswählen",
  },
  "Clear selection": {
    zh: "清空选择",
    ja: "選択を解除",
    de: "Auswahl aufheben",
  },
  Hidden: {
    zh: "已隐藏",
    ja: "非表示",
    de: "Ausgeblendet",
  },
  "No importable pixels": {
    zh: "没有可导入的像素",
    ja: "読み込めるピクセルがありません",
    de: "Keine importierbaren Pixel",
  },
  "Import selected layers": {
    zh: "导入所选图层",
    ja: "選択したレイヤーを読み込む",
    de: "Ausgewählte Ebenen importieren",
  },
  "Cancel PSD import": {
    zh: "取消导入 PSD",
    ja: "PSD の読み込みをキャンセル",
    de: "PSD-Import abbrechen",
  },
  "Choose a PSD file of up to 70 MB.": {
    zh: "请选择不超过 70 MB 的 PSD 文件。",
    ja: "70 MB 以下の PSD ファイルを選択してください。",
    de: "Wähle eine PSD-Datei mit höchstens 70 MB.",
  },
  "Choose a valid PSD file. PSB is not supported.": {
    zh: "请选择有效的 PSD 文件，暂不支持 PSB。",
    ja: "正しい PSD ファイルを選択してください。PSB には対応していません。",
    de: "Wähle eine gültige PSD-Datei. PSB wird nicht unterstützt.",
  },
  "PSD import supports 8-bit RGB documents only.": {
    zh: "PSD 导入仅支持 8 位 RGB 文档。",
    ja: "PSD の読み込みは 8 ビット RGB ドキュメントにのみ対応しています。",
    de: "Der PSD-Import unterstützt nur RGB-Dokumente mit 8 Bit.",
  },
  "PSD dimensions must be at most 8192px per side and 32 megapixels.": {
    zh: "PSD 每边最多 8192 像素，总像素不超过 3200 万。",
    ja: "PSD は各辺 8192 px 以下、合計 3200 万画素以下にしてください。",
    de: "Eine PSD darf höchstens 8192 px pro Seite und 32 Megapixel haben.",
  },
  "PSD import supports up to 256 layers and 32 nested groups.": {
    zh: "PSD 最多支持 256 个图层和 32 层嵌套组。",
    ja: "PSD の読み込みでは最大 256 レイヤー、グループの入れ子は最大 32 階層まで対応しています。",
    de: "Der PSD-Import unterstützt bis zu 256 Ebenen und 32 Verschachtelungsebenen für Gruppen.",
  },
  "This PSD has no importable pixel layers.": {
    zh: "此 PSD 中没有可导入的像素图层。",
    ja: "この PSD には読み込めるピクセルレイヤーがありません。",
    de: "Diese PSD enthält keine importierbaren Pixelebenen.",
  },
  "Select between 1 and 12 PSD layers.": {
    zh: "请选择 1 至 12 个 PSD 图层。",
    ja: "PSD のレイヤーを 1〜12 枚選択してください。",
    de: "Wähle 1 bis 12 PSD-Ebenen aus.",
  },
  "A selected PSD layer cannot be imported.": {
    zh: "所选 PSD 图层无法导入。",
    ja: "選択した PSD レイヤーのうち、読み込めないレイヤーがあります。",
    de: "Eine ausgewählte PSD-Ebene kann nicht importiert werden.",
  },
  "Unable to decode a selected PSD layer.": {
    zh: "无法解码所选 PSD 图层。",
    ja: "選択した PSD レイヤーをデコードできませんでした。",
    de: "Eine ausgewählte PSD-Ebene konnte nicht decodiert werden.",
  },
  "A selected PSD layer exceeds the 8 MB image limit.": {
    zh: "所选 PSD 图层转换后超过单张图片 8 MB 的限制。",
    ja: "選択した PSD レイヤーのうち、画像サイズの上限 (8 MB) を超えているものがあります。",
    de: "Eine ausgewählte PSD-Ebene überschreitet das Bildlimit von 8 MB.",
  },
  "Open a PSD before selecting layers.": {
    zh: "请先打开 PSD 文件再选择图层。",
    ja: "レイヤーを選択する前に PSD を開いてください。",
    de: "Öffne eine PSD, bevor du Ebenen auswählst.",
  },
  "Unable to read PSD layers.": {
    zh: "无法读取 PSD 图层。",
    ja: "PSD のレイヤーを読み込めませんでした。",
    de: "Die PSD-Ebenen konnten nicht gelesen werden.",
  },
  "PSD import timed out. Choose a smaller file.": {
    zh: "PSD 导入超时，请选择更小的文件。",
    ja: "PSD の読み込みがタイムアウトしました。サイズの小さいファイルを選択してください。",
    de: "Der PSD-Import hat zu lange gedauert. Wähle eine kleinere Datei.",
  },
  "PSD import cancelled.": {
    zh: "PSD 导入已取消。",
    ja: "PSD の読み込みをキャンセルしました。",
    de: "PSD-Import abgebrochen.",
  },
  "Drop one image to replace a layer. Drop multiple images outside the layer list to add them.":
    {
      zh: "替换图层时请拖入一张图片。批量添加请将多张图片拖到图层列表以外的编辑区域。",
      ja: "画像を 1 枚ドロップするとレイヤーの画像を置き換えられます。複数の画像を追加するには、レイヤー一覧の外側にドロップしてください。",
      de: "Ziehe ein einzelnes Bild auf eine Ebene, um ihr Bild zu ersetzen. Ziehe mehrere Bilder außerhalb der Ebenenliste in den Editor, um sie hinzuzufügen.",
    },
  "Drop one image to replace this layer. Its name and settings stay unchanged.":
    {
      zh: "松开以替换此图层的图片，保留图层名称和参数。",
      ja: "画像を 1 枚ドロップすると、このレイヤーの画像を置き換えられます。名前と設定は変わりません。",
      de: "Ziehe ein einzelnes Bild hierher, um das Bild dieser Ebene zu ersetzen. Name und Einstellungen bleiben erhalten.",
    },
  "Drop images anywhere in the editor to add layers. Drop one image onto a layer to replace it.":
    {
      zh: "将图片拖入编辑区域可批量添加图层；将单张图片拖到指定图层上可替换图片。",
      ja: "画像を編集画面にドロップするとレイヤーを追加できます。レイヤーの画像を置き換えるには、そのレイヤーに画像を 1 枚ドロップしてください。",
      de: "Ziehe Bilder in den Editor, um Ebenen hinzuzufügen. Ziehe ein einzelnes Bild auf eine Ebene, um ihr Bild zu ersetzen.",
    },
  "Layer name": {
    zh: "图层名称",
    ja: "レイヤー名",
    de: "Ebenenname",
  },
  "Rename layer": {
    zh: "重命名图层",
    ja: "レイヤー名を変更",
    de: "Ebene umbenennen",
  },
  "Edits keep original image bytes intact. Save project includes sources and up to 100 history states; editing an earlier state replaces its redo branch. The project autosaves in this browser and is not uploaded. Download Save project for a portable backup.":
    {
      zh: "编辑不会改写原图文件。保存工程会包含原图及最多 100 条历史状态；从较早状态继续编辑会替换其后的重做分支。工程会自动保存到此浏览器，不会上传。请下载保存工程文件作为可携带的备份。",
      ja: "編集しても元画像のデータは変わりません。プロジェクトには元画像と最大 100 件の履歴が含まれます。以前の履歴から編集を再開すると、それ以降の履歴は置き換わります。プロジェクトはこのブラウザーに自動保存され、アップロードされません。「プロジェクトを保存」で持ち運べるバックアップをダウンロードできます。",
      de: "Beim Bearbeiten bleiben die Originaldateien unverändert. Das Projekt enthält die Quellbilder und bis zu 100 Bearbeitungsstände. Bearbeitest du einen früheren Stand, werden die nachfolgenden Stände ersetzt. Das Projekt wird automatisch in diesem Browser gespeichert und nicht hochgeladen. Mit „Projekt speichern“ kannst du eine Sicherung als Datei herunterladen.",
    },
  "Encoding export layer {current} of {total}…": {
    zh: "正在编码导出图层 {current}/{total}…",
    ja: "書き出し用のレイヤーをエンコード中 ({current}/{total})…",
    de: "Ebene {current} von {total} für den Export wird codiert…",
  },
  "Export layered PSD": {
    zh: "导出分层 PSD",
    ja: "レイヤー付き PSD を書き出す",
    de: "PSD mit Ebenen exportieren",
  },
  "Export PNG ZIP": {
    zh: "导出 PNG ZIP",
    ja: "PNG ZIP を書き出す",
    de: "PNG als ZIP exportieren",
  },
  "Finishing image export…": {
    zh: "正在生成导出文件…",
    ja: "画像の書き出しを完了中…",
    de: "Bildexport wird abgeschlossen…",
  },
  "GPU context lost during image export. Please try again after recovery.": {
    zh: "图像导出期间 GPU 上下文丢失，请待恢复后重试。",
    ja: "画像の書き出し中に GPU コンテキストが失われました。復旧後に再試行してください。",
    de: "Beim Bildexport ging der GPU-Kontext verloren. Versuche es nach der Wiederherstellung erneut.",
  },
  "GPU rendering failed during image export.": {
    zh: "图像导出期间 GPU 渲染失败。",
    ja: "画像の書き出し中に GPU の描画に失敗しました。",
    de: "Das Rendern auf der GPU ist beim Bildexport fehlgeschlagen.",
  },
  "Invalid export image dimensions or pixels.": {
    zh: "导出图像尺寸或像素数据无效。",
    ja: "書き出す画像のサイズまたはピクセルデータが無効です。",
    de: "Die Bildabmessungen oder Pixeldaten für den Export sind ungültig.",
  },
  "Preparing export composite…": {
    zh: "正在准备导出合成图…",
    ja: "書き出し用の合成画像を準備中…",
    de: "Gesamtbild für den Export wird vorbereitet…",
  },
  "Image encoder failed. Try a smaller output size.": {
    zh: "图像编码失败，请尝试较小的输出尺寸。",
    ja: "画像のエンコードに失敗しました。出力サイズを小さくしてください。",
    de: "Die Bildcodierung ist fehlgeschlagen. Versuche es mit einer kleineren Ausgabegröße.",
  },
  "Export encoder has not started.": {
    zh: "图像编码器尚未启动。",
    ja: "書き出し用のエンコーダーが起動していません。",
    de: "Der Export-Encoder wurde noch nicht gestartet.",
  },
  "Image encoder returned no file.": {
    zh: "图像编码器未生成文件。",
    ja: "画像エンコーダーがファイルを返しませんでした。",
    de: "Der Bild-Encoder hat keine Datei zurückgegeben.",
  },
  "Export exceeds the memory limit. Use a smaller output size.": {
    zh: "导出超过内存限制，请减小输出尺寸。",
    ja: "書き出しに必要なメモリが上限を超えています。出力サイズを小さくしてください。",
    de: "Der Export überschreitet das Speicherlimit. Wähle eine kleinere Ausgabegröße.",
  },
  "Image export cancelled.": {
    zh: "已取消图像导出。",
    ja: "画像の書き出しをキャンセルしました。",
    de: "Bildexport abgebrochen.",
  },
  "PSD keeps layers, transparency, and visibility. PNG ZIP includes each transparent layer, a composite, and a visibility manifest. Exported layers keep custom names. Save project keeps original images and editable array settings.":
    {
      zh: "PSD 保留图层、透明度和可见性。PNG ZIP 包含各图层的透明 PNG、合成图和可见性清单。导出图层保留自定义名称。保存工程可保留原图和可编辑的阵列参数。",
      ja: "PSD はレイヤー、透明度、表示状態を保持します。PNG ZIP には透明度を保った各レイヤー、合成画像、表示状態のマニフェストが含まれます。書き出したレイヤーには設定した名前が付きます。プロジェクトを保存すると、元画像と編集可能な配列設定が保持されます。",
      de: "PSD erhält Ebenen, Transparenz und Sichtbarkeit. Das PNG-ZIP enthält jede Ebene mit Transparenz, ein Gesamtbild und ein Manifest mit Angaben zur Sichtbarkeit. Exportierte Ebenen behalten ihre eigenen Namen. Die Projektdatei enthält die Quellbilder und die Anordnungseinstellungen zur weiteren Bearbeitung.",
    },
  "Export supports up to 12 layers.": {
    zh: "导出最多支持 12 个图层。",
    ja: "書き出しに対応するレイヤーは 12 枚までです。",
    de: "Der Export unterstützt bis zu 12 Ebenen.",
  },
  "Unable to read image encoder response.": {
    zh: "无法读取图像编码器响应。",
    ja: "画像エンコーダーの応答を読み取れませんでした。",
    de: "Die Antwort des Bild-Encoders konnte nicht gelesen werden.",
  },
  "Unable to read export pixels from the GPU.": {
    zh: "无法从 GPU 读取图像像素。",
    ja: "書き出し用のピクセルデータを GPU から読み取れませんでした。",
    de: "Die Pixeldaten für den Export konnten nicht aus der GPU ausgelesen werden.",
  },
  "{size} × {size} · PSD / PNG ZIP": {
    zh: "{size} × {size} · 分层 PSD / PNG ZIP",
    ja: "{size} × {size} · PSD / PNG ZIP",
    de: "{size} × {size} · PSD / PNG-ZIP",
  },
};
