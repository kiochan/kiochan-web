import assert from "node:assert/strict";
import test from "node:test";
import { createLattice } from "../packages/lab-texture-array/src/layout.ts";
import {
  commit,
  copyLayerParameters,
  emptyProject,
  newLayer,
  parseProject,
  pasteLayerParameters,
  replaceLayerImage,
} from "../packages/lab-texture-array/src/project.ts";

const source = {
  id: "image",
  name: "motif.png",
  data: "data:image/png;base64,AAAA",
};
function fixture() {
  const project = emptyProject();
  project.assets = [{ ...source }];
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

test("version-one projects upgrade every historical layer without changing original images", () => {
  const project = fixture();
  project.version = 1;
  for (const frame of project.history)
    for (const layer of frame.layers) {
      delete layer.layoutAngle;
      delete layer.sampling;
    }
  const upgraded = parseProject(JSON.stringify(project));
  assert.equal(upgraded.version, 4);
  assert.equal(upgraded.history[1].layers[0].layoutAngle, 0);
  assert.equal(upgraded.history[1].layers[0].sampling, "sharp");
  assert.deepEqual(upgraded.assets, project.assets);
});

test("fractional positive and negative array angles and sampling modes survive history round trips", () => {
  let project = fixture();
  for (const layoutAngle of [-180, -37.25, 0, 45, 89.5, 180]) {
    project = commit(project, {
      ...project.history[project.cursor],
      label: `Array angle ${layoutAngle}`,
      layers: [
        {
          ...project.history[project.cursor].layers[0],
          layoutAngle,
          sampling: "pixel",
        },
      ],
    });
  }
  assert.deepEqual(parseProject(JSON.stringify(project)), project);
});
test("import rejects unsupported formats, external/SVG sources, broken references and unbounded settings", () => {
  const mutations = [
    (p) => {
      p.version = 5;
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
      p.history[1].layers[0].layoutAngle = 181;
    },
    (p) => {
      p.history[1].layers[0].layoutAngle = null;
    },
    (p) => {
      delete p.history[1].layers[0].layoutAngle;
    },
    (p) => {
      p.history[1].layers[0].sampling = "unknown";
    },
    (p) => {
      p.history[1].layers[0].spacingX = 0;
    },
    (p) => {
      p.history[1].layers[0].spacingY = 4.01;
    },
    (p) => {
      p.history[1].layers[0].spacingX = null;
    },
    (p) => {
      delete p.history[1].layers[0].spacingY;
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

test("periodic diagonal lattices cover corners and have no large empty regions", () => {
  for (const layoutAngle of [
    -180, -75, -45, -15, 0, 15, 30, 37.25, 45, 60, 89.5, 135, 180,
  ]) {
    const lattice = createLattice({
      columns: 4,
      rows: 4,
      layoutAngle,
      stagger: 0,
    });
    assert.ok(
      lattice.count >= 12 && lattice.count <= 20,
      `Bounded density at ${layoutAngle}`,
    );
    let largestGap = 0;
    for (let y = 0; y <= 32; y++)
      for (let x = 0; x <= 32; x++) {
        let distance = Infinity;
        for (let i = 0; i < lattice.count; i++) {
          const dx = Math.abs(x / 32 - lattice.positions[i * 2]);
          const dy = Math.abs(y / 32 - lattice.positions[i * 2 + 1]);
          distance = Math.min(
            distance,
            Math.hypot(Math.min(dx, 1 - dx), Math.min(dy, 1 - dy)),
          );
        }
        largestGap = Math.max(largestGap, distance);
      }
    assert.ok(
      largestGap < 0.2,
      `Oversized empty region at ${layoutAngle}: ${largestGap}`,
    );
  }
  const diagonal = createLattice({
    columns: 4,
    rows: 4,
    layoutAngle: 45,
    stagger: 0,
  });
  assert.equal(diagonal.angle, 45);
  assert.equal(diagonal.count, 18);
});

test("lattice basis neighbors stay equally spaced across both square seams", () => {
  for (const [columns, rows, layoutAngle, stagger, spacingX, spacingY] of [
    [4, 4, 45, 0],
    [3, 7, 37.25, 0.5],
    [1, 32, -66, 1],
    [32, 1, 76, 0.25],
    [1, 1, 45, 0],
    [32, 32, 44.5, 0.5],
    [4, 4, 0, 0.5],
    [4, 4, 45, 0, 2, 0.5],
    [8, 5, 37.25, 0.5, 0.75, 2.25],
    [32, 32, 45, 0.5, 0.5, 0.5],
    [1, 1, -60, 1, 4, 4],
  ]) {
    const lattice = createLattice({
      columns,
      rows,
      layoutAngle,
      stagger,
      spacingX,
      spacingY,
    });
    const [a, b, c, d] = lattice.frequencies;
    const det = a * d - b * c;
    assert.equal(lattice.count, det);
    assert.ok(det > 0 && det <= 2048);
    const positions = [];
    for (let i = 0; i < lattice.count; i++)
      positions.push([lattice.positions[i * 2], lattice.positions[i * 2 + 1]]);
    for (const [x, y] of positions.slice(0, 32)) {
      for (const [dx, dy] of [
        [d / det, -c / det],
        [-b / det, a / det],
        [1, 0],
        [0, 1],
      ]) {
        const nx = (((x + dx) % 1) + 1) % 1,
          ny = (((y + dy) % 1) + 1) % 1;
        assert.ok(
          positions.some(([px, py]) => {
            const vx = Math.abs(px - nx),
              vy = Math.abs(py - ny);
            return (
              Math.hypot(Math.min(vx, 1 - vx), Math.min(vy, 1 - vy)) < 1e-6
            );
          }),
          "Each translated neighbor must exist, including seam crossings",
        );
      }
    }
  }
});

test("version-two projects retain requested angles and source data when upgrading to uniform repeats", () => {
  const project = fixture();
  project.version = 2;
  project.history[1].layers[0].layoutAngle = 37.25;
  const next = parseProject(JSON.stringify(project));
  assert.equal(next.version, 4);
  assert.equal(next.history[1].layers[0].layoutAngle, 37.25);
  assert.deepEqual(next.assets, project.assets);
});

test("horizontal and vertical spacing independently change pitch without changing the requested motif size", () => {
  const settings = {
    columns: 4,
    rows: 4,
    layoutAngle: 0,
    stagger: 0,
    spacingX: 1,
    spacingY: 1,
  };
  const base = createLattice(settings);
  const wide = createLattice({ ...settings, spacingX: 2 });
  const tall = createLattice({ ...settings, spacingY: 2 });
  assert.equal(wide.spacingX, base.spacingX * 2);
  assert.equal(wide.spacingY, base.spacingY);
  assert.equal(tall.spacingX, base.spacingX);
  assert.equal(tall.spacingY, base.spacingY * 2);
  assert.equal(wide.count, base.count / 2);
  assert.equal(tall.count, base.count / 2);
  const diagonal = createLattice({ ...settings, layoutAngle: 45 });
  const diagonalWide = createLattice({
    ...settings,
    layoutAngle: 45,
    spacingX: 2,
  });
  const diagonalDenseY = createLattice({
    ...settings,
    layoutAngle: 45,
    spacingY: 0.5,
  });
  assert.equal(diagonalWide.angle, 45);
  assert.equal(diagonalWide.spacingX, diagonal.spacingX * 2);
  assert.equal(diagonalWide.spacingY, diagonal.spacingY);
  assert.equal(diagonalDenseY.spacingX, diagonal.spacingX);
  assert.equal(diagonalDenseY.spacingY, diagonal.spacingY / 2);
  const project = fixture(),
    layer = project.history[1].layers[0];
  const edited = commit(project, {
    ...project.history[1],
    label: "Change spacing",
    layers: [{ ...layer, spacingX: 1.75, spacingY: 0.8 }],
  });
  assert.equal(edited.history[edited.cursor].layers[0].size, layer.size);
  assert.deepEqual(parseProject(JSON.stringify(edited)), edited);
});

test("old project histories default both spacings to 100 percent", () => {
  for (const version of [1, 2, 3]) {
    const project = fixture();
    project.version = version;
    for (const frame of project.history)
      for (const layer of frame.layers) {
        delete layer.spacingX;
        delete layer.spacingY;
      }
    const upgraded = parseProject(JSON.stringify(project));
    assert.equal(upgraded.version, 4);
    assert.equal(upgraded.history[1].layers[0].spacingX, 1);
    assert.equal(upgraded.history[1].layers[0].spacingY, 1);
    assert.deepEqual(upgraded.assets, project.assets);
  }
});

test("extreme spacing stays bounded and reports proportional density limiting", () => {
  const dense = createLattice({
    columns: 32,
    rows: 32,
    layoutAngle: 45,
    stagger: 0.5,
    spacingX: 0.5,
    spacingY: 0.5,
  });
  assert.ok(dense.densityLimited);
  assert.ok(dense.count <= 2048);
  for (const spacingX of [0.5, 1, 4])
    for (const spacingY of [0.5, 1, 4]) {
      const lattice = createLattice({
        columns: 32,
        rows: 1,
        layoutAngle: -67.25,
        stagger: 1,
        spacingX,
        spacingY,
      });
      assert.ok(lattice.count > 0 && lattice.count <= 2048);
      assert.ok(
        [...lattice.positions].every(
          (value) => Number.isFinite(value) && value >= 0 && value < 1,
        ),
      );
    }
});

test("replacing a selected image preserves its settings, duplicates, history and saved sources", () => {
  let project = fixture();
  const original = {
    ...project.history[1].layers[0],
    name: "Custom motif",
    rotation: -32.75,
    spacingX: 1.75,
    opacity: 0.45,
    visible: false,
  };
  const duplicate = { ...original, id: "duplicate" };
  project = commit(project, {
    ...project.history[1],
    label: "Configure layers",
    layers: [original, duplicate],
  });
  const replacement = {
    ...source,
    id: "replacement",
    name: "replacement.webp",
    data: "data:image/webp;base64,BBBB",
  };
  const next = replaceLayerImage(project, original.id, replacement);
  const layers = next.history[next.cursor].layers;
  assert.deepEqual(layers[0], { ...original, asset: replacement.id });
  assert.deepEqual(layers[1], duplicate);
  assert.deepEqual(next.history[next.cursor - 1].layers[0], original);
  assert.deepEqual(project.assets, [source]);
  assert.deepEqual(next.assets, [source, replacement]);
  assert.deepEqual(parseProject(JSON.stringify(next)), next);
  const undone = { ...next, cursor: next.cursor - 1 };
  const branched = replaceLayerImage(undone, duplicate.id, {
    ...replacement,
    id: "branch",
  });
  assert.equal(branched.history.length, next.history.length);
  assert.equal(branched.history[branched.cursor].layers[0].asset, source.id);
  assert.equal(branched.history[branched.cursor].layers[1].asset, "branch");
  assert.equal(replaceLayerImage(project, "missing", replacement), project);
});

test("layer names round-trip through history while unnamed projects remain compatible", () => {
  const project = fixture();
  assert.equal(
    parseProject(JSON.stringify(project)).history[1].layers[0].name,
    undefined,
  );
  const layer = project.history[1].layers[0];
  const renamed = commit(project, {
    ...project.history[1],
    label: "Rename layer",
    layers: [{ ...layer, name: "Foreground petals" }],
  });
  assert.equal(renamed.history[renamed.cursor - 1].layers[0].name, undefined);
  assert.deepEqual(parseProject(JSON.stringify(renamed)), renamed);
  for (const name of ["", "x".repeat(201), 42, null]) {
    const invalid = structuredClone(renamed);
    invalid.history[invalid.cursor].layers[0].name = name;
    assert.throws(() => parseProject(JSON.stringify(invalid)));
  }
});

test("replacing an unnamed layer preserves its displayed source name", () => {
  const project = fixture();
  const layer = project.history[project.cursor].layers[0];
  const next = replaceLayerImage(project, layer.id, {
    ...source,
    id: "new-source",
    name: "new-file.png",
  });
  assert.equal(next.history[next.cursor].layers[0].name, source.name);
  assert.equal(project.history[project.cursor].layers[0].name, undefined);
  assert.deepEqual(parseProject(JSON.stringify(next)), next);
});

test("parameter copy is a snapshot and paste preserves target identity, source, name, visibility and order", () => {
  let project = fixture();
  const sourceLayer = {
    ...project.history[1].layers[0],
    name: "Source",
    columns: 7,
    rows: 3,
    spacingX: 1.75,
    spacingY: 0.8,
    size: 0.23,
    rotation: -32.75,
    layoutAngle: 45,
    sampling: "pixel",
    x: 0.2,
    y: 0.3,
    stagger: 0.5,
    opacity: 0.45,
  };
  const target = {
    ...newLayer("target-image"),
    name: "Target",
    visible: false,
  };
  project = commit(
    {
      ...project,
      assets: [...project.assets, { ...source, id: "target-image" }],
    },
    {
      ...project.history[1],
      label: "Configure layers",
      layers: [sourceLayer, target],
    },
  );
  const parameters = copyLayerParameters(sourceLayer);
  assert.deepEqual(
    Object.keys(parameters).sort(),
    [
      "columns",
      "rows",
      "spacingX",
      "spacingY",
      "size",
      "rotation",
      "layoutAngle",
      "sampling",
      "x",
      "y",
      "stagger",
      "opacity",
    ].sort(),
  );
  sourceLayer.columns = 9;
  assert.equal(parameters.columns, 7);
  const next = pasteLayerParameters(project, [target.id], parameters);
  assert.equal(next.history.length, project.history.length + 1);
  assert.deepEqual(next.history[next.cursor].layers, [
    sourceLayer,
    { ...target, ...parameters },
  ]);
  assert.equal(next.assets, project.assets);
  assert.deepEqual(next.history[next.cursor - 1].layers[1], target);
  assert.deepEqual(parseProject(JSON.stringify(next)), next);
  assert.equal(pasteLayerParameters(next, [target.id], parameters), next);
  assert.equal(pasteLayerParameters(project, ["missing"], parameters), project);
  const all = pasteLayerParameters(
    project,
    [sourceLayer.id, target.id],
    parameters,
  );
  assert.equal(all.history.length, project.history.length + 1);
  for (const layer of all.history[all.cursor].layers)
    assert.deepEqual(copyLayerParameters(layer), parameters);
  const branched = pasteLayerParameters(
    { ...next, cursor: project.cursor },
    [sourceLayer.id, target.id],
    parameters,
  );
  assert.equal(branched.history.length, next.history.length);
});
