/**
 * Deterministic PRNG using Mulberry32 algorithm.
 * Guarantees that seed S renders identically on every browser and device forever.
 */

export class Mulberry32 {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Returns float in [0, 1) */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns integer in [min, max] inclusive */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns float in [min, max) */
  rangeFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Returns random element from array deterministically */
  pick<T>(items: T[]): T {
    if (!items || items.length === 0) return items[0];
    const index = Math.floor(this.next() * items.length);
    return items[index];
  }
}

/** Helper to generate a random 32-bit unsigned integer */
export function generateSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

/** Create a short readable ID e.g. RK-7H2K9F from a seed */
export function seedToRakhiId(seed: number): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let num = (seed ^ 0xa5a5a5a5) >>> 0;
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[num % chars.length];
    num = Math.floor(num / chars.length);
  }
  return `RK-${code}`;
}
