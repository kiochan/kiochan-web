import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { experiments } from "../apps/web/src/content/lab.ts";
import {
  about,
  home,
  notes,
  panelTools,
  textureArrayChinese,
  translations,
} from "../apps/web/src/content/site.ts";
import {
  formatTextureText,
  localizeTextureText,
  textureFieldLabels,
} from "../packages/lab-texture-array/src/localization.ts";

test("every translated phrase has all three non-English variants", () => {
  for (const [source, variants] of Object.entries(translations)) {
    for (const language of ["zh", "ja", "de"]) {
      assert.ok(variants[language]?.trim(), `${language}: ${source}`);
    }
  }
});

test("texture editor Chinese covers controls, accessibility, errors and parameterized messages", async () => {
  const require = createRequire(
    new URL("../apps/web/package.json", import.meta.url),
  );
  const ts = require("typescript");
  const root = new URL("../packages/lab-texture-array/src/", import.meta.url);
  const keys = new Set(textureFieldLabels);
  for (const name of await readdir(root)) {
    if (!/\.(ts|tsx)$/.test(name) || name.endsWith(".d.ts")) continue;
    const source = ts.createSourceFile(
      name,
      await readFile(new URL(name, root), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node) {
      if (
        ts.isNewExpression(node) &&
        node.expression.getText(source) === "Error" &&
        node.arguments?.[0] &&
        ts.isStringLiteral(node.arguments[0])
      )
        keys.add(node.arguments[0].text);
      if (ts.isCallExpression(node)) {
        const callee = node.expression.getText(source);
        if (
          [
            "t",
            "format",
            "formatTextureText",
            "onProgress",
            "setError",
          ].includes(callee)
        ) {
          const value = node.arguments[0];
          if (value && ts.isStringLiteral(value) && /[A-Za-z]/.test(value.text))
            keys.add(value.text);
        }
      }
      if (name === "index.tsx" && ts.isJsxText(node))
        assert.ok(
          !/[A-Za-z]/.test(node.getText(source)),
          `Untranslated JSX: ${node.getText(source).trim()}`,
        );
      if (
        name === "index.tsx" &&
        ts.isJsxAttribute(node) &&
        node.name.getText(source) === "aria-label"
      )
        assert.ok(
          !node.initializer || !ts.isStringLiteral(node.initializer),
          "Accessibility copy must use the translator",
        );
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  for (const key of keys)
    assert.ok(
      textureArrayChinese[key]?.trim(),
      `Missing texture translation: ${key}`,
    );
  assert.ok(keys.size > 90);
  for (const [english, chinese] of Object.entries(textureArrayChinese)) {
    assert.match(chinese, /[\u3400-\u9fff]/, english);
    const placeholders = (text) =>
      [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    assert.deepEqual(
      placeholders(english),
      placeholders(chinese),
      `Placeholder mismatch: ${english}`,
    );
  }
});

test("texture translations format live progress and stored history without modifying source text", () => {
  const translate = (text) => textureArrayChinese[text] ?? text;
  assert.equal(
    localizeTextureText("Import 3 image(s)", translate),
    "导入 3 张图片",
  );
  assert.equal(
    localizeTextureText("Encoding TIFF layer 2 of 12…", translate),
    "正在编码 TIFF 图层 2/12…",
  );
  assert.equal(
    localizeTextureText("Change horizontal spacing (%)", translate),
    "更改横向间距（%）",
  );
  assert.equal(
    localizeTextureText(
      "Image exceeds this GPU's 8192px texture limit.",
      translate,
    ),
    "图片超过此 GPU 的 8192 像素纹理尺寸限制。",
  );
  assert.equal(
    formatTextureText("{size} × {size} · Layered TIFF", translate, {
      size: 1024,
    }),
    "1024 × 1024 · 分层 TIFF",
  );
  assert.equal(
    localizeTextureText("My custom history label", translate),
    "My custom history label",
  );
  const history = { label: "Change vertical spacing (%)" };
  assert.equal(
    localizeTextureText(history.label, translate),
    "更改纵向间距（%）",
  );
  assert.equal(history.label, "Change vertical spacing (%)");
});

test("editorial cards and detail pages have complete translations", () => {
  const phrases = [
    ...Object.values(home),
    panelTools.category,
    panelTools.summary,
    panelTools.status,
    panelTools.compatibility,
    ...panelTools.features.flatMap((feature) => [feature.title, feature.text]),
    about.introduction,
    about.perspective,
    about.attribution,
    ...about.skills.flatMap((skill) => [skill.title, skill.text]),
    ...notes.flatMap((note) => [
      note.title,
      note.category,
      note.summary,
      note.introduction,
      ...note.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
      ]),
    ]),
    ...experiments.flatMap((experiment) => [
      experiment.description,
      experiment.category,
    ]),
  ];
  for (const phrase of phrases) {
    if (phrase === "Live2D") continue;
    assert.ok(translations[phrase], `Missing translation: ${phrase}`);
  }
});
