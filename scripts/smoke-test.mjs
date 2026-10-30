import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const expectedDatabase = process.env.EXPECT_DATABASE ?? "disconnected";
assert.ok(["connected", "disconnected"].includes(expectedDatabase));

async function verify() {
  const page = await fetch(baseUrl, { signal: AbortSignal.timeout(10_000) });
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Hello, world\./);
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
