# Kiochan theme

Framework-independent semantic design tokens, distributed as plain CSS. This package has no React, shadcn/ui, Tailwind, or runtime dependencies.

```css
@import "@kiochan/theme/tokens.css";

.example {
  background: var(--kio-color-canvas);
  color: var(--kio-color-text);
}
```

Without an explicit `data-theme`, the root follows the operating system color scheme. Use `data-theme="light"` or `data-theme="dark"` on the document root to select a mode explicitly. The same attributes can scope tokens to a subtree.

| Token                       | Purpose                               |
| --------------------------- | ------------------------------------- |
| `--kio-color-canvas`        | Page background                       |
| `--kio-color-text`          | Primary text                          |
| `--kio-color-text-muted`    | Secondary text                        |
| `--kio-color-surface`       | Raised surfaces                       |
| `--kio-color-surface-muted` | Subtle surfaces and hover backgrounds |
| `--kio-color-brand`         | Brand emphasis and actions            |
| `--kio-color-on-brand`      | Text on brand backgrounds             |
| `--kio-color-border`        | Control and surface borders           |
| `--kio-color-focus`         | Keyboard focus indicators             |
| `--kio-color-accent`        | Secondary decorative emphasis         |
| `--kio-color-grid`          | Subtle background grid lines          |
| `--kio-color-glow`          | Translucent decorative surface light  |
| `--kio-color-danger`        | Destructive actions                   |
| `--kio-color-on-danger`     | Text on destructive backgrounds       |
| `--kio-radius-control`      | Default control corner radius         |

Consumers own their adapters. The website maps these tokens to shadcn names in `apps/web/src/styles/shadcn.css` and to Tailwind utilities in `apps/web/src/styles/tailwind.css`. Do not add shadcn variable names, component styles, CSS resets, or framework integrations to this package.
