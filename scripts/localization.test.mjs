import assert from "node:assert/strict";
import { test } from "node:test";
import { experiments } from "../apps/web/src/content/lab.ts";
import {
  about,
  home,
  notes,
  panelTools,
  translations,
} from "../apps/web/src/content/site.ts";

test("every translated phrase has all three non-English variants", () => {
  for (const [source, variants] of Object.entries(translations)) {
    for (const language of ["zh", "ja", "de"]) {
      assert.ok(variants[language]?.trim(), `${language}: ${source}`);
    }
  }
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
