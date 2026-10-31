export type Particle = { x: number; y: number; px: number; py: number };
export const WIDTH = 720;
export const HEIGHT = 440;
export const LIMIT = 480;
const RADIUS = 18;
const EDGE = 8;

export function pour(particles: Particle[], x: number, y: number, count = 30) {
  for (let i = 0; i < count && particles.length < LIMIT; i++) {
    const cx = Math.max(EDGE, Math.min(WIDTH - EDGE, x + ((i % 6) - 2.5) * 7));
    const cy = Math.max(
      EDGE,
      Math.min(HEIGHT - EDGE, y - Math.floor(i / 6) * 7),
    );
    particles.push({ x: cx, y: cy, px: cx, py: cy });
  }
}

export function stepFluid(particles: Particle[], gravity: number) {
  for (const p of particles) {
    const vx = Math.max(-8, Math.min(8, (p.x - p.px) * 0.985));
    const vy = Math.max(-8, Math.min(8, (p.y - p.py) * 0.985));
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + gravity * 0.045;
  }
  // A spatial grid bounds the neighborhood search for density relaxation.
  for (let pass = 0; pass < 2; pass++) {
    const grid = new Map<string, Particle[]>();
    for (const p of particles) {
      const key = `${Math.floor(p.x / RADIUS)},${Math.floor(p.y / RADIUS)}`;
      const bucket = grid.get(key) ?? [];
      bucket.push(p);
      grid.set(key, bucket);
    }
    for (const p of particles) {
      const cx = Math.floor(p.x / RADIUS),
        cy = Math.floor(p.y / RADIUS);
      const neighbors: { p: Particle; q: number; dx: number; dy: number }[] =
        [];
      let density = 0,
        nearDensity = 0;
      for (let x = -1; x <= 1; x++)
        for (let y = -1; y <= 1; y++) {
          for (const other of grid.get(`${cx + x},${cy + y}`) ?? []) {
            if (other === p) continue;
            const dx = other.x - p.x,
              dy = other.y - p.y;
            const d = Math.hypot(dx, dy);
            if (d < 0.001 || d >= RADIUS) continue;
            const q = 1 - d / RADIUS;
            density += q * q;
            nearDensity += q * q * q;
            neighbors.push({ p: other, q, dx: dx / d, dy: dy / d });
          }
        }
      const pressure = Math.max(-0.1, (density - 3) * 0.18);
      const nearPressure = nearDensity * 0.35;
      for (const n of neighbors) {
        const force = Math.max(
          -0.3,
          Math.min(1.5, (pressure * n.q + nearPressure * n.q * n.q) * 0.5),
        );
        const dx = n.dx * force,
          dy = n.dy * force;
        n.p.x += dx;
        n.p.y += dy;
        p.x -= dx;
        p.y -= dy;
      }
    }
    for (const p of particles) {
      p.x = Math.max(EDGE, Math.min(WIDTH - EDGE, p.x));
      p.y = Math.max(EDGE, Math.min(HEIGHT - EDGE, p.y));
    }
  }
}
