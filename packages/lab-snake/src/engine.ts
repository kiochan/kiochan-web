export type Point = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
export type SnakeGame = {
  snake: Point[];
  direction: Direction;
  food: Point | null;
  score: number;
  phase: "running" | "lost" | "won";
};
export const COLUMNS = 24;
export const ROWS = 16;
const vectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
export function nextFood(snake: Point[], random = Math.random): Point | null {
  const free: Point[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLUMNS; x++) {
      if (!snake.some((p) => p.x === x && p.y === y)) free.push({ x, y });
    }
  return (
    free[Math.min(free.length - 1, Math.floor(random() * free.length))] ?? null
  );
}
export function createSnake(): SnakeGame {
  const snake = [
    { x: 6, y: 8 },
    { x: 5, y: 8 },
    { x: 4, y: 8 },
  ];
  return {
    snake,
    direction: "right",
    food: nextFood(snake),
    score: 0,
    phase: "running",
  };
}
export function stepSnake(
  game: SnakeGame,
  requested = game.direction,
  random = Math.random,
): SnakeGame {
  if (game.phase !== "running") return game;
  const before = vectors[game.direction],
    after = vectors[requested];
  const direction =
    before.x + after.x === 0 && before.y + after.y === 0
      ? game.direction
      : requested;
  const delta = vectors[direction];
  const head = { x: game.snake[0].x + delta.x, y: game.snake[0].y + delta.y };
  const eating = head.x === game.food?.x && head.y === game.food?.y;
  const body = eating ? game.snake : game.snake.slice(0, -1);
  if (
    head.x < 0 ||
    head.x >= COLUMNS ||
    head.y < 0 ||
    head.y >= ROWS ||
    body.some((p) => p.x === head.x && p.y === head.y)
  ) {
    return { ...game, phase: "lost" };
  }
  const snake = [head, ...body],
    food = eating ? nextFood(snake, random) : game.food;
  return {
    snake,
    direction,
    food,
    score: game.score + (eating ? 1 : 0),
    phase: food ? "running" : "won",
  };
}
