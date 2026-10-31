import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const expectedDatabase = process.env.EXPECT_DATABASE ?? "disconnected";
assert.ok(["connected", "disconnected"].includes(expectedDatabase));

async function verify() {
  const page = await fetch(baseUrl, { signal: AbortSignal.timeout(10_000) });
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Curiosity,/);
  assert.match(html, /href="\/projects"/);
  assert.match(html, /Skip to content/);
  const routes = [
    ["/lab", "Small ideas. Open tabs"],
    ["/lab/type-playground", "Type Playground"],
    ["/lab/liquid", "Start simulation"],
    ["/lab/lattice", "Download SVG"],
    ["/lab/cubism", "Model manifest"],
    ["/lab/breakout", "Read the game engine source"],
    ["/lab/snake", "Read the game engine source"],
    ["/projects", "Projects &amp; experiments"],
    ["/projects/kiochan-web", "Kiochan Web"],
    ["/projects/modbus-monitor", "Modbus Monitor"],
    ["/notes", "Thinking out loud"],
    ["/notes/a-theme-without-a-framework", "A shared theme"],
    [
      "/notes/from-commit-to-production",
      "Making a small deployment predictable.",
    ],
    ["/about", "Kiochan"],
    ["/contact", "conversation"],
    ["/sitemap.xml", "https://kiochan.one/projects/kiochan-web"],
    ["/robots.txt", "Sitemap: https://kiochan.one/sitemap.xml"],
  ];
  for (const [path, content] of routes) {
    const response = await fetch(new URL(path, baseUrl), {
      signal: AbortSignal.timeout(10_000),
    });
    assert.equal(response.status, 200, path);
    const body = await response.text();
    assert.ok(body.includes(content), path);
    if (path.startsWith("/lab/")) {
      assert.ok(body.includes('aria-label="Lab sidebar"'), path);
      assert.ok(body.includes(`href="https://kiochan.one${path}"`), path);
      const schema = body.match(
        /<script type="application\/ld\+json">([^<]+)<\/script>/,
      );
      assert.ok(schema, path);
      assert.equal(JSON.parse(schema[1])["@type"], "BreadcrumbList");
      assert.ok(body.includes("Further development continues here"), path);
    }
  }
  for (const path of [
    "/missing-page",
    "/projects/missing",
    "/notes/missing",
    "/lab/missing",
  ]) {
    const response = await fetch(new URL(path, baseUrl), {
      signal: AbortSignal.timeout(10_000),
    });
    assert.equal(response.status, 404, path);
    assert.match(await response.text(), /Back home/);
  }
  const stylesheet = html.match(
    /href="([^"\s]*\/_next\/static\/[^"\s]*\.css)"/,
  );
  assert.ok(stylesheet, "The page must include a generated stylesheet.");
  const css = await fetch(new URL(stylesheet[1], baseUrl), {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(css.status, 200);
  assert.match(css.headers.get("content-type") ?? "", /text\/css/);

  const health = await fetch(`${baseUrl}/api/health`, {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), {
    status: "ok",
    service: "kiochan-web",
  });

  const database = await fetch(`${baseUrl}/api/health/database`, {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(database.status, expectedDatabase === "connected" ? 200 : 503);
  assert.deepEqual(await database.json(), {
    status: expectedDatabase === "connected" ? "ok" : "unavailable",
    database: expectedDatabase,
  });
}

for (let attempt = 1; ; attempt++) {
  try {
    await verify();
    console.log(`Smoke checks passed. Database: ${expectedDatabase}.`);
    break;
  } catch (error) {
    if (attempt === 30) throw error;
    await setTimeout(1_000);
  }
}
