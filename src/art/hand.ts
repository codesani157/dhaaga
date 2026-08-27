import { Mulberry32 } from '../core/prng';

export interface InkOptions {
  wobble?: number;
  taper?: boolean;
  strokeWidth?: number;
  seed?: number;
  overshoot?: number;
}

/**
 * Generates organic hand-inked SVG path from a set of control points.
 * Tapers ends like a traditional reed / dip pen and adds seeded wobble with no frame-jitter.
 */
export function inkPath(points: { x: number; y: number }[], options: InkOptions = {}): string {
  if (points.length < 2) return '';

  const { wobble = 1.2, taper = true, strokeWidth = 2.4, seed = 108, overshoot = 2 } = options;
  const prng = new Mulberry32(seed);

  // Perturb points with deterministic wobble
  const wobbled = points.map((p, idx) => {
    if (idx === 0 || idx === points.length - 1) {
      return {
        x: p.x + (prng.next() - 0.5) * (wobble * 0.4),
        y: p.y + (prng.next() - 0.5) * (wobble * 0.4),
      };
    }
    return {
      x: p.x + (prng.next() - 0.5) * wobble,
      y: p.y + (prng.next() - 0.5) * wobble,
    };
  });

  // Add slight corner overshoot to last segment
  if (overshoot > 0 && wobbled.length >= 2) {
    const last = wobbled[wobbled.length - 1];
    const prev = wobbled[wobbled.length - 2];
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    wobbled[wobbled.length - 1] = {
      x: last.x + (dx / len) * overshoot,
      y: last.y + (dy / len) * overshoot,
    };
  }

  // If simple stroke is enough, output smooth Bezier path
  let d = `M ${wobbled[0].x.toFixed(1)} ${wobbled[0].y.toFixed(1)}`;
  for (let i = 1; i < wobbled.length - 1; i++) {
    const xc = (wobbled[i].x + wobbled[i + 1].x) / 2;
    const yc = (wobbled[i].y + wobbled[i + 1].y) / 2;
    d += ` Q ${wobbled[i].x.toFixed(1)} ${wobbled[i].y.toFixed(1)}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
  }
  const last = wobbled[wobbled.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

  return d;
}

/**
 * Generate a hand-drawn closed rectangular box path
 */
export function inkBox(x: number, y: number, w: number, h: number, seed: number = 42): string {
  const prng = new Mulberry32(seed);
  const j = () => (prng.next() - 0.5) * 1.5;

  const p1 = { x: x + j(), y: y + j() };
  const p2 = { x: x + w + j(), y: y + j() };
  const p3 = { x: x + w + j(), y: y + h + j() };
  const p4 = { x: x + j(), y: y + h + j() };

  // Draw 4 overlapping segments
  const top = inkPath([p1, { x: x + w / 2 + j(), y: y + j() }, p2], { seed: seed + 1 });
  const right = inkPath([p2, { x: x + w + j(), y: y + h / 2 + j() }, p3], { seed: seed + 2 });
  const bottom = inkPath([p3, { x: x + w / 2 + j(), y: y + h + j() }, p4], { seed: seed + 3 });
  const left = inkPath([p4, { x: x + j(), y: y + h / 2 + j() }, p1], { seed: seed + 4 });

  return `${top} ${right} ${bottom} ${left}`;
}
