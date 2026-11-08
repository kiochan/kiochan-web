import assert from "node:assert/strict";
import test from "node:test";
import {
  commit,
  emptyProject,
  newLayer,
  parseProject,
} from "../packages/lab-texture-array/src/project.ts";

const source = {
  id: "image",
  name: "motif.png",
  data: "data:image/png;base64,AAAA",
};
function fixture() {
  const project = emptyProject();
  project.assets = [source];
  return commit(project, {
    label: "Import image",
    size: 1024,
    layers: [newLayer(source.id)],
  });
}
test("history round-trips original sources, removed layers and current position", () => {
  const initial = fixture();
  const removed = commit(initial, {
    label: "Remove layer",
    size: 1024,
    layers: [],
  });
  removed.cursor = 1;
  const restored = parseProject(JSON.stringify(removed));
  assert.deepEqual(restored, removed);
  assert.equal(restored.assets[0].data, source.data);
  assert.equal(restored.history[restored.cursor].layers.length, 1);
});
test("editing an earlier state replaces redo and bounds retained snapshots", () => {
  let project = fixture();
  project = commit(project, {
    label: "Discarded future",
    size: 512,
    layers: [],
  });
  project.cursor = 1;
  project = commit(project, {
    ...project.history[1],
    label: "New branch",
    size: 2048,
  });
  assert.equal(project.history.length, 3);
  assert.ok(!project.history.some((f) => f.label === "Discarded future"));
  for (let i = 0; i < 110; i++)
    project = commit(project, {
      ...project.history[project.cursor],
      label: `Edit ${i}`,
    });
  assert.equal(project.history.length, 100);
  assert.equal(project.cursor, 99);
  assert.deepEqual(parseProject(JSON.stringify(project)), project);
});
test("import rejects unsupported formats, external/SVG sources, broken references and unbounded settings", () => {
  const mutations = [
    (p) => {
      p.version = 2;
    },
    (p) => {
      p.assets[0].data = "https://example.com/image.png";
    },
    (p) => {
      p.assets[0].data = "data:image/svg+xml;base64,AAAA";
    },
    (p) => {
      p.history[1].layers[0].asset = "missing";
    },
    (p) => {
      p.history[1].layers[0].columns = 999;
    },
    (p) => {
      p.history[1].layers[0].rows = 1.5;
    },
    (p) => {
      p.history[1].layers[0].size = 1;
    },
    (p) => {
      p.history[1].layers[0].opacity = null;
    },
    (p) => {
      p.history[1].size = 777;
    },
    (p) => {
      p.cursor = 100;
    },
    (p) => {
      p.assets.push(p.assets[0]);
    },
    (p) => {
      p.history[1].layers.push(p.history[1].layers[0]);
    },
  ];
  for (const mutate of mutations) {
    const project = fixture();
    mutate(project);
    assert.throws(() => parseProject(JSON.stringify(project)));
  }
});
