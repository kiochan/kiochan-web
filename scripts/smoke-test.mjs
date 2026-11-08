import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const expectedDatabase = process.env.EXPECT_DATABASE ?? "disconnected";
assert.ok(["connected", "disconnected"].includes(expectedDatabase));

async function verify() {
  const page = await fetch(baseUrl, { signal: AbortSignal.timeout(10_000) });
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Projects &amp; experiments/);
  assert.ok(html.indexOf("Panel Tools") < html.indexOf('id="home-about"'));
  assert.ok(html.includes('href="/projects/panel-tools"'));
  assert.match(html, /href="\/projects"/);
  assert.match(html, /Skip to content/);
  const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
  assert.ok(header);
  const mainNavigation = header.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(mainNavigation);
  assert.deepEqual(
    [...mainNavigation.matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
    ["/projects", "/lab", "/about", "/contact"],
  );
  assert.ok(!header.includes('href="/notes"'));
  assert.ok(!html.includes('href="/notes'));
  const routes = [
    ["/lab", "Small ideas. Open tabs"],
    ["/lab/liquid", "Start simulation"],
    ["/lab/lattice", "Download layered SVG"],
    ["/lab/texture-array", "Texture Array"],
    ["/lab/cubism", "Model manifest"],
    ["/lab/breakout", "Read the game engine source"],
    ["/lab/snake", "Read the game engine source"],
    ["/projects", "Panel Tools"],
    ["/releases", "Panel Tools"],
    [
      "/projects/panel-tools",
      "Photoshop runtime compatibility has not been verified.",
    ],
    ["/about", "Kiochan"],
    ["/contact", "conversation"],
    ["/sitemap.xml", "https://kiochan.one/projects"],
    ["/robots.txt", "Sitemap: https://kiochan.one/sitemap.xml"],
  ];
  for (const [path, content] of routes) {
    const response = await fetch(new URL(path, baseUrl), {
      signal: AbortSignal.timeout(10_000),
    });
    assert.equal(response.status, 200, path);
    const body = await response.text();
    assert.ok(body.includes(content), path);
    if (path === "/projects") {
      assert.ok(body.includes('href="/projects/panel-tools"'));
      assert.ok(body.includes("Source on GitHub"));
      assert.ok(body.includes('href="https://github.com/kiochan/kiochan-web"'));
      assert.ok(!body.includes("Kiochan Web"));
      assert.ok(!body.includes('href="/projects/kiochan-web"'));
    }
    if (path === "/projects/panel-tools") {
      assert.ok(body.includes('href="#releases"'));
      assert.ok(body.includes("Release notes &amp; downloads"));
      assert.ok(!body.includes('href="/releases/panel-tools"'));
    }
    if (path === "/about") {
      for (const skill of [
        "React &amp; TypeScript",
        "Interactive graphics",
        "Windows tooling",
        "Builds &amp; delivery",
      ]) {
        assert.ok(body.includes(skill), skill);
      }
      assert.ok(
        body.includes(
          'href="https://github.com/kiochan/react-cubism/blob/dev/packages/live2d-react/src/Live2DViewer.tsx"',
        ),
      );
    }
    if (path === "/sitemap.xml") {
      assert.ok(body.includes("/lab/texture-array"));
      assert.ok(!body.includes("/projects/kiochan-web"));
      assert.ok(body.includes("/projects/panel-tools"));
      assert.ok(!body.includes("/notes"));
      assert.ok(!body.includes("https://kiochan.one/releases"));
    }
    if (path === "/lab") {
      assert.equal((body.match(/data-lab-card="/g) ?? []).length, 6);
      for (const name of [
        "Liquid Playground",
        "Lattice Generator",
        "Texture Array",
        "Cubism Workbench",
        "Breakout",
        "Quick Snake",
      ]) {
        assert.ok(body.includes(`aria-label="Play ${name} preview"`), name);
      }
    }
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
    "/notes",
    "/notes/a-theme-without-a-framework",
    "/notes/from-commit-to-production",
    "/lab/missing",
    "/lab/type-playground",
    "/projects/modbus-monitor",
    "/projects/kiochan-web",
  ]) {
    const response = await fetch(new URL(path, baseUrl), {
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.text();
    if (path.startsWith("/projects/")) {
      assert.ok([200, 404].includes(response.status), path);
      assert.match(body, /<meta[^>]+name="robots"[^>]+content="noindex"[^>]*>/);
    } else {
      assert.equal(response.status, 404, path);
    }
    assert.match(body, /Back home/);
  }
  for (const [legacy, canonical] of [
    ["/releases", "/projects"],
    ["/releases/panel-tools", "/projects/panel-tools"],
  ]) {
    const response = await fetch(new URL(legacy, baseUrl), {
      redirect: "manual",
    });
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), canonical);
  }
  // Next.js may already have streamed the shell for runtime notFound().
  // Require its not-found UI and noindex marker, not a normal content success.
  const missingRelease = await fetch(new URL("/releases/missing", baseUrl));
  assert.ok([200, 404].includes(missingRelease.status));
  const missingReleaseHtml = await missingRelease.text();
  assert.match(missingReleaseHtml, /Back home/);
  assert.match(
    missingReleaseHtml,
    /<meta[^>]+name="robots"[^>]+content="noindex"[^>]*>/,
  );
  assert.equal(
    (await fetch(new URL("/api/releases/missing/dev", baseUrl))).status,
    404,
  );
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
