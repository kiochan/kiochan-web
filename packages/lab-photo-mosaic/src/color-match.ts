import type { Cell, Rect, Size } from "./layout";

export type Color = readonly [number, number, number];
export type ColorField = Size & { data: Uint8ClampedArray };

export function averageColor(data: Uint8ClampedArray): Color {
  let red = 0;
  let green = 0;
  let blue = 0;
  let weight = 0;
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    red += data[index] * alpha;
    green += data[index + 1] * alpha;
    blue += data[index + 2] * alpha;
    weight += alpha;
  }
  return weight ? [red / weight, green / weight, blue / weight] : [0, 0, 0];
}

function luminance([red, green, blue]: Color) {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function colorDifference(a: Color, b: Color) {
  return (
    2 * (luminance(a) - luminance(b)) ** 2 +
    (a[0] - a[1] - (b[0] - b[1])) ** 2 +
    (a[2] - a[1] - (b[2] - b[1])) ** 2
  );
}

// Minimum-cost one-to-one assignment. Rows are tile positions and columns
// are available photos. An augmenting path extends the matching each round.
function assign(cost: number[][]) {
  const count = cost.length;
  const rows = new Float64Array(count + 1);
  const columns = new Float64Array(count + 1);
  const matched = new Int32Array(count + 1);
  const from = new Int32Array(count + 1);
  for (let row = 1; row <= count; row++) {
    matched[0] = row;
    const distance = new Float64Array(count + 1).fill(Number.POSITIVE_INFINITY);
    const visited = new Uint8Array(count + 1);
    let column = 0;
    do {
      visited[column] = 1;
      const active = matched[column];
      let delta = Number.POSITIVE_INFINITY;
      let next = 0;
      for (let candidate = 1; candidate <= count; candidate++) {
        if (visited[candidate]) continue;
        const reduced =
          cost[active - 1][candidate - 1] - rows[active] - columns[candidate];
        if (reduced < distance[candidate]) {
          distance[candidate] = reduced;
          from[candidate] = column;
        }
        if (distance[candidate] < delta) {
          delta = distance[candidate];
          next = candidate;
        }
      }
      for (let candidate = 0; candidate <= count; candidate++) {
        if (visited[candidate]) {
          rows[matched[candidate]] += delta;
          columns[candidate] -= delta;
        } else {
          distance[candidate] -= delta;
        }
      }
      column = next;
    } while (matched[column]);
    do {
      const previous = from[column];
      matched[column] = matched[previous];
      column = previous;
    } while (column);
  }
  const result = new Int32Array(count);
  for (let column = 1; column <= count; column++)
    result[matched[column] - 1] = column - 1;
  return result;
}

export function matchTiles(
  layout: Cell[],
  pinned: ReadonlySet<string>,
  targetColor: (cell: Cell) => Color | null,
  photoColor: (id: string, aspect: number) => Color,
): Cell[] {
  const movable = layout.filter(({ id }) => !pinned.has(id));
  if (movable.length < 2) return layout;
  const cost = movable.map((cell) => {
    const target = targetColor(cell);
    return movable.map(({ id }) => {
      const penalty = id === cell.id ? 0 : 0.0001;
      return (
        (target
          ? colorDifference(target, photoColor(id, cell.width / cell.height))
          : 0) + penalty
      );
    });
  });
  const assignment = assign(cost);
  if (assignment.every((photo, index) => photo === index)) return layout;
  let index = 0;
  return layout.map((cell) =>
    pinned.has(cell.id)
      ? cell
      : { ...cell, id: movable[assignment[index++]].id },
  );
}

export function regionColor(
  field: ColorField,
  rect: Rect,
  size: Size,
): Color | null {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;
  for (let row = 0; row < 6; row++) {
    const y = Math.min(
      field.height - 1,
      Math.floor(
        ((rect.y + ((row + 0.5) * rect.height) / 6) * field.height) /
          size.height,
      ),
    );
    for (let column = 0; column < 6; column++) {
      const x = Math.min(
        field.width - 1,
        Math.floor(
          ((rect.x + ((column + 0.5) * rect.width) / 6) * field.width) /
            size.width,
        ),
      );
      const index = (y * field.width + x) * 4;
      const weight = field.data[index + 3];
      red += field.data[index] * weight;
      green += field.data[index + 1] * weight;
      blue += field.data[index + 2] * weight;
      alpha += weight;
    }
  }
  return alpha ? [red / alpha, green / alpha, blue / alpha] : null;
}

export function samplingAxis(length: number, samples: number) {
  const indexes = new Uint16Array(length);
  const weights = new Float32Array(length);
  for (let index = 0; index < length; index++) {
    const position = Math.min(
      samples - 1,
      Math.max(0, ((index + 0.5) * samples) / length - 0.5),
    );
    indexes[index] = Math.floor(position);
    weights[index] = position - indexes[index];
  }
  return { indexes, weights, last: samples - 1 };
}

export function tintPixels(
  pixels: Uint8ClampedArray,
  rect: Rect,
  source: Color,
  field: ColorField,
  horizontal: ReturnType<typeof samplingAxis>,
  vertical: ReturnType<typeof samplingAxis>,
  strength: number,
  matchBrightness = false,
) {
  const data = field.data;
  let index = 0;
  for (let y = rect.y; y < rect.y + rect.height; y++) {
    const row = vertical.indexes[y];
    const top = row * field.width;
    const bottom = Math.min(row + 1, vertical.last) * field.width;
    const dy = vertical.weights[y];
    for (let x = rect.x; x < rect.x + rect.width; x++, index += 4) {
      if (!pixels[index + 3]) continue;
      const left = horizontal.indexes[x];
      const right = Math.min(left + 1, horizontal.last);
      const dx = horizontal.weights[x];
      const a = 4 * (top + left);
      const b = 4 * (top + right);
      const c = 4 * (bottom + left);
      const d = 4 * (bottom + right);
      // Weight the four samples by alpha before mixing their colors.
      const wa = (1 - dx) * (1 - dy) * data[a + 3];
      const wb = dx * (1 - dy) * data[b + 3];
      const wc = (1 - dx) * dy * data[c + 3];
      const wd = dx * dy * data[d + 3];
      const weight = wa + wb + wc + wd;
      if (!weight) continue;
      const blend = (strength * weight) / 255;
      const mixed = (channel: number) => {
        const target =
          (data[a + channel] * wa +
            data[b + channel] * wb +
            data[c + channel] * wc +
            data[d + channel] * wd) /
          weight;
        const original = pixels[index + channel];
        const detail = 0.3 * (original - source[channel]);
        return original + blend * (target + detail - original);
      };
      const red = mixed(0);
      const green = mixed(1);
      const blue = mixed(2);
      if (matchBrightness) {
        pixels[index] = red;
        pixels[index + 1] = green;
        pixels[index + 2] = blue;
        continue;
      }
      const light =
        0.2126 * pixels[index] +
        0.7152 * pixels[index + 1] +
        0.0722 * pixels[index + 2];
      const mixedLight = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      const low = Math.min(red, green, blue) - mixedLight;
      const high = Math.max(red, green, blue) - mixedLight;
      // Scale chroma into gamut before rounding so clipping cannot shift luminance.
      const scale = Math.min(
        1,
        low < 0 ? light / -low : 1,
        high > 0 ? (255 - light) / high : 1,
      );
      pixels[index] = light + (red - mixedLight) * scale;
      pixels[index + 1] = light + (green - mixedLight) * scale;
      pixels[index + 2] = light + (blue - mixedLight) * scale;
    }
  }
}
