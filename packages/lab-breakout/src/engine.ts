export type Brick = { x: number; y: number; active: boolean };
export type BreakoutGame = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  paddle: number;
  bricks: Brick[];
  score: number;
  lives: number;
  phase: "running" | "lost" | "won";
};
export const WIDTH = 720,
  HEIGHT = 440,
  PADDLE = 108,
  RADIUS = 7;
export function createBreakout(): BreakoutGame {
  return {
    x: WIDTH / 2,
    y: HEIGHT - 80,
    vx: 160,
    vy: -240,
    paddle: WIDTH / 2,
    score: 0,
    lives: 3,
    phase: "running",
    bricks: Array.from({ length: 28 }, (_, i) => ({
      x: 30 + (i % 7) * 95,
      y: 40 + Math.floor(i / 7) * 30,
      active: true,
    })),
  };
}
export function movePaddle(game: BreakoutGame, center: number) {
  game.paddle = Math.max(PADDLE / 2, Math.min(WIDTH - PADDLE / 2, center));
}
export function stepBreakout(game: BreakoutGame, dt: number) {
  if (game.phase !== "running") return;
  const previousY = game.y;
  game.x += game.vx * dt;
  game.y += game.vy * dt;
  if (game.x < RADIUS) {
    game.x = RADIUS;
    game.vx = Math.abs(game.vx);
  }
  if (game.x > WIDTH - RADIUS) {
    game.x = WIDTH - RADIUS;
    game.vx = -Math.abs(game.vx);
  }
  if (game.y < RADIUS) {
    game.y = RADIUS;
    game.vy = Math.abs(game.vy);
  }
  if (
    game.vy > 0 &&
    previousY + RADIUS <= HEIGHT - 30 &&
    game.y + RADIUS >= HEIGHT - 30 &&
    Math.abs(game.x - game.paddle) <= PADDLE / 2 + RADIUS
  ) {
    const angle =
      Math.max(-1, Math.min(1, (game.x - game.paddle) / (PADDLE / 2))) * 1.05;
    game.vx = Math.sin(angle) * 300;
    game.vy = -Math.cos(angle) * 300;
    game.y = HEIGHT - 30 - RADIUS;
  }
  for (const brick of game.bricks) {
    if (
      !brick.active ||
      game.x + RADIUS < brick.x ||
      game.x - RADIUS > brick.x + 85 ||
      game.y + RADIUS < brick.y ||
      game.y - RADIUS > brick.y + 20
    )
      continue;
    brick.active = false;
    game.score += 10;
    if (previousY + RADIUS <= brick.y || previousY - RADIUS >= brick.y + 20)
      game.vy *= -1;
    else game.vx *= -1;
    break;
  }
  if (game.y > HEIGHT + RADIUS) {
    game.lives--;
    if (!game.lives) {
      game.phase = "lost";
      return;
    }
    game.x = game.paddle;
    game.y = HEIGHT - 80;
    game.vx = 160;
    game.vy = -240;
  }
  if (game.bricks.every((brick) => !brick.active)) game.phase = "won";
}
