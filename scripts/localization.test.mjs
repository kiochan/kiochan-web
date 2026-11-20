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
  translations,
} from "../apps/web/src/content/site.ts";
import {
  formatTextureText,
  localizeTextureText,
  textureFieldLabels,
} from "../packages/lab-texture-array/src/localization.ts";

const translatedLanguages = ["zh", "ja", "de"];
const placeholders = (text) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

test("every translated phrase has all three non-English variants", () => {
  for (const [source, variants] of Object.entries(translations)) {
    for (const language of translatedLanguages) {
      assert.ok(variants[language]?.trim(), `${language}: ${source}`);
      assert.deepEqual(
        placeholders(variants[language]),
        placeholders(source),
        `Placeholder mismatch (${language}): ${source}`,
      );
    }
  }
});

test("texture editor translations cover controls, accessibility, errors and parameterized messages", async () => {
  const require = createRequire(
    new URL("../apps/web/package.json", import.meta.url),
  );
  const ts = require("typescript");
  const root = new URL("../packages/lab-texture-array/src/", import.meta.url);
  const keys = new Set([...textureFieldLabels, "Loading texture editor"]);
  function addMessage(node) {
    if (!node) return;
    if (ts.isStringLiteral(node) && /[A-Za-z]/.test(node.text))
      keys.add(node.text);
    if (ts.isConditionalExpression(node)) {
      addMessage(node.whenTrue);
      addMessage(node.whenFalse);
    }
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) {
      addMessage(node.left);
      addMessage(node.right);
    }
  }
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
        node.expression.getText(source) === "Error"
      )
        addMessage(node.arguments?.[0]);
      if (ts.isCallExpression(node)) {
        const callee = node.expression.getText(source);
        if (
          [
            "t",
            "format",
            "formatTextureText",
            "onProgress",
            "renderLabel",
            "setError",
          ].includes(callee)
        ) {
          addMessage(node.arguments[0]);
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
  assert.ok(keys.size > 90);
  for (const key of keys)
    assert.ok(
      Object.hasOwn(translations, key),
      `Missing texture translation: ${key}`,
    );
});

test("texture translations format live progress and stored history without modifying source text", () => {
  const translate = (text) => translations[text]?.zh ?? text;
  assert.equal(
    localizeTextureText("Import 3 image(s)", translate),
    "导入 3 张图片",
  );
  assert.equal(
    localizeTextureText("Encoding export layer 2 of 12…", translate),
    "正在编码导出图层 2/12…",
  );
  assert.equal(
    localizeTextureText(
      "Encoding export layer 2 of 12…",
      (text) => translations[text]?.ja ?? text,
    ),
    "書き出し用のレイヤーをエンコード中 (2/12)…",
  );
  assert.equal(
    localizeTextureText(
      "Encoding export layer 2 of 12…",
      (text) => translations[text]?.de ?? text,
    ),
    "Ebene 2 von 12 für den Export wird codiert…",
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
    formatTextureText("{size} × {size} · PSD / PNG ZIP", translate, {
      size: 1024,
    }),
    "1024 × 1024 · 分层 PSD / PNG ZIP",
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
  assert.equal(
    localizeTextureText(
      history.label,
      (text) => translations[text]?.ja ?? text,
    ),
    "縦方向の間隔 (%)を変更",
  );
  assert.equal(
    localizeTextureText(
      history.label,
      (text) => translations[text]?.de ?? text,
    ),
    "Vertikaler Abstand (%) ändern",
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
      experiment.name,
      experiment.description,
      experiment.category,
      ...experiment.tags,
    ]),
    "Lab sidebar",
    "Lab projects",
    "React · Local files",
    "{count} of {total} experiments",
  ];
  for (const phrase of phrases) {
    if (phrase === "Live2D") continue;
    assert.ok(translations[phrase], `Missing translation: ${phrase}`);
  }
});
