import { SchemaV1, GesturePoint } from '../types';

/**
 * Base64 URL safe encoder & decoder
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compress Uint8Array using native CompressionStream or fallback
 */
export async function compressBytes(data: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Response(data).body!.pipeThrough(new CompressionStream('deflate-raw'));
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      // fallback
    }
  }
  // Fallback: simple byte return (still safe base64url)
  return data;
}

/**
 * Decompress Uint8Array using native DecompressionStream or fallback
 */
export async function decompressBytes(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const stream = new Response(data).body!.pipeThrough(new DecompressionStream('deflate-raw'));
      const buffer = await new Response(stream).arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      // fallback
    }
  }
  return data;
}

/**
 * Encode SchemaV1 object into a compressed hash fragment format:
 * #1.<base64url>
 */
export async function encodePayload(payload: SchemaV1): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  const textEncoder = new TextEncoder();
  const rawBytes = textEncoder.encode(jsonStr);
  const compressed = await compressBytes(rawBytes);
  const b64 = bytesToBase64Url(compressed);
  return `1.${b64}`;
}

/**
 * Decode hash fragment string into SchemaV1 safely.
 * Will NEVER throw; returns null if corrupted or invalid.
 */
export async function decodePayload(hashStr: string): Promise<SchemaV1 | null> {
  try {
    if (!hashStr) return null;
    let cleanHash = hashStr;
    if (cleanHash.startsWith('#')) cleanHash = cleanHash.slice(1);
    if (!cleanHash.startsWith('1.')) return null;

    const b64 = cleanHash.slice(2);
    if (!b64) return null;

    const compressed = base64UrlToBytes(b64);
    let decompressed: Uint8Array;
    try {
      decompressed = await decompressBytes(compressed);
    } catch {
      decompressed = compressed;
    }

    const textDecoder = new TextDecoder();
    const jsonStr = textDecoder.decode(decompressed);
    const parsed = JSON.parse(jsonStr);

    if (typeof parsed !== 'object' || parsed === null) return null;

    // Sanitize and clamp bounds
    const sanitized: SchemaV1 = {
      v: 1,
      t: typeof parsed.t === 'number' ? Math.max(0, Math.min(13, parsed.t)) : 0,
      r: typeof parsed.r === 'number' ? Math.max(0, Math.min(8, parsed.r)) : 0,
      g: typeof parsed.g === 'number' ? Math.max(0, Math.min(12, parsed.g)) : 0,
      a: typeof parsed.a === 'string' ? parsed.a.slice(0, 40) : '',
      b: typeof parsed.b === 'string' ? parsed.b.slice(0, 40) : '',
      w: typeof parsed.w === 'number' ? Math.max(0, Math.min(9, parsed.w)) : 0,
      m: typeof parsed.m === 'string' ? parsed.m.slice(0, 600) : '',
      y: typeof parsed.y === 'string' ? parsed.y.slice(0, 800) : '',
      u: typeof parsed.u === 'string' ? parsed.u.slice(0, 64) : undefined,
      o: typeof parsed.o === 'number' ? parsed.o : undefined,
      z2: typeof parsed.z2 === 'string' ? parsed.z2.slice(0, 80) : undefined,
    };

    if (parsed.k && typeof parsed.k === 'object') {
      sanitized.k = {
        d: typeof parsed.k.d === 'number' ? Math.max(0, Math.min(11, parsed.k.d)) : 0,
        c: typeof parsed.k.c === 'number' ? Math.max(0, Math.min(15, parsed.k.c)) : 0,
        j: typeof parsed.k.j === 'number' ? Math.max(4, Math.min(12, parsed.k.j)) : 6,
        n: typeof parsed.k.n === 'number' ? Math.max(1, Math.min(5, parsed.k.n)) : 3,
        p: Array.isArray(parsed.k.p) ? parsed.k.p.slice(0, 4).map((x: any) => Number(x) || 0) : [0, 1, 2, 3],
        h: Array.isArray(parsed.k.h) ? parsed.k.h.slice(0, 3).map((x: any) => Number(x) || 0) : [],
        s: typeof parsed.k.s === 'number' ? (parsed.k.s >>> 0) : 108,
        z: typeof parsed.k.z === 'number' ? Math.max(0, Math.min(5, parsed.k.z)) : 0,
      };
    }

    if (parsed.q && typeof parsed.q === 'object') {
      sanitized.q = {
        d: typeof parsed.q.d === 'number' ? parsed.q.d : 0,
        s: typeof parsed.q.s === 'number' ? parsed.q.s : 0,
        k: Boolean(parsed.q.k),
        x: Boolean(parsed.q.x),
        o: Boolean(parsed.q.o),
      };
    }

    if (Array.isArray(parsed.h)) {
      sanitized.h = parsed.h
        .slice(0, 250)
        .filter((pt: any) => Array.isArray(pt) && pt.length >= 3)
        .map((pt: any) => [
          Math.max(0, Math.min(1023, Math.round(Number(pt[0]) || 0))),
          Math.max(0, Math.min(1023, Math.round(Number(pt[1]) || 0))),
          Math.max(0, Math.min(255, Math.round(Number(pt[2]) || 0))),
        ] as GesturePoint);
    }

    if (Array.isArray(parsed.i)) {
      sanitized.i = parsed.i
        .slice(0, 150)
        .filter((pt: any) => Array.isArray(pt) && pt.length >= 3)
        .map((pt: any) => [
          Math.max(0, Math.min(1023, Math.round(Number(pt[0]) || 0))),
          Math.max(0, Math.min(1023, Math.round(Number(pt[1]) || 0))),
          Math.max(0, Math.min(255, Math.round(Number(pt[2]) || 0))),
        ] as GesturePoint);
    }

    return sanitized;
  } catch {
    return null;
  }
}

/**
 * Measure the payload length and breakdown for the Link Ka Wazan balance scale
 */
export async function measurePayload(payload: SchemaV1, baseUrl: string = window.location.origin): Promise<{
  totalChars: number;
  url: string;
  isOverWarning: boolean;
  isOverLimit: boolean;
  breakdown: {
    names: number;
    rakhi: number;
    letter: number;
    gesture: number;
    signature: number;
  };
}> {
  const hash = await encodePayload(payload);
  const fullUrl = `${baseUrl}/#${hash}`;
  const totalChars = fullUrl.length;

  const namesLen = (payload.a?.length || 0) + (payload.b?.length || 0);
  const letterLen = payload.m?.length || 0;
  const gesturePts = payload.h?.length || 0;
  const sigPts = payload.i?.length || 0;

  return {
    totalChars,
    url: fullUrl,
    isOverWarning: totalChars > 1600,
    isOverLimit: totalChars > 1900,
    breakdown: {
      names: Math.round(namesLen * 1.5),
      rakhi: 35,
      letter: Math.round(letterLen * 1.8),
      gesture: Math.round(gesturePts * 3.5),
      signature: Math.round(sigPts * 3.5),
    },
  };
}

/**
 * Downsample and quantise tying gesture with Ramer-Douglas-Peucker
 */
export function quantizeGesture(
  points: { x: number; y: number; time: number }[],
  bounds: { width: number; height: number; left: number; top: number },
  epsilon: number = 3
): GesturePoint[] {
  if (points.length === 0) return [];

  // Normalize points to 0-1023 box
  const normalized = points.map((p, idx) => {
    const nx = Math.max(0, Math.min(1023, Math.round(((p.x - bounds.left) / bounds.width) * 1023)));
    const ny = Math.max(0, Math.min(1023, Math.round(((p.y - bounds.top) / bounds.height) * 1023)));
    const dt = idx === 0 ? 0 : Math.min(255, Math.max(1, Math.round((p.time - points[idx - 1].time) / 16)));
    return { x: nx, y: ny, dt };
  });

  // Simplify using distance threshold
  const filtered: GesturePoint[] = [];
  let prev = normalized[0];
  filtered.push([prev.x, prev.y, prev.dt]);

  for (let i = 1; i < normalized.length; i++) {
    const curr = normalized[i];
    const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    if (dist >= epsilon || i === normalized.length - 1) {
      filtered.push([curr.x, curr.y, curr.dt]);
      prev = curr;
    }
  }

  // Cap at 180 points to respect 1.2KB payload budget
  if (filtered.length > 180) {
    const step = filtered.length / 180;
    const sampled: GesturePoint[] = [];
    for (let i = 0; i < 180; i++) {
      sampled.push(filtered[Math.floor(i * step)]);
    }
    return sampled;
  }

  return filtered;
}
