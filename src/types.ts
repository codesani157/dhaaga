/**
 * DHAAGA - Core Types & Schema definitions
 */

export interface RakhiConfig {
  d: number; // dori id (0-11)
  c: number; // centrepiece id (0-15)
  j?: number; // jaali fold count (4-12)
  n?: number; // jaali depth (1-5)
  p: number[]; // palette indices [0..3]
  h?: number[]; // latkan hanging ids (up to 3)
  s: number; // seed uint32
  z?: number; // sound voice id (0-5)
}

export interface ThaalConfig {
  d?: number; // diya style id (0-2)
  s?: number; // mithai id (0-23)
  k?: boolean; // tilak done
  x?: boolean; // akshat done
  o?: boolean; // coconut included
}

export type GesturePoint = [number, number, number]; // [x, y, dt_in_16ms] in 0-1023 normalized box

export interface SchemaV1 {
  v: 1;
  t?: number; // rishta id (0-13)
  r?: number; // rivaaj id (0-8)
  g?: number; // language index
  a?: string; // receiver's name (<= 40 chars)
  b?: string; // sender's name (<= 40 chars)
  k?: RakhiConfig; // rakhi configuration
  w?: number; // wrist/sleeve style id (0-9)
  m?: string; // letter text (<= 600 chars)
  y?: string; // typing rhythm (RLE base36)
  h?: GesturePoint[]; // tying gesture quantised
  i?: GesturePoint[]; // signature strokes
  c2?: GesturePoint[]; // tier 2 handwritten letter strokes
  q?: ThaalConfig; // thaal config
  u?: string; // UPI VPA (receiver reply only)
  o?: number; // open after (minutes since 2026-01-01 UTC)
  z2?: string; // one-line memory
}

export interface PetiItem {
  id: string; // derived code e.g. RK-7H2K9F
  created_at: string;
  sender: string;
  receiver: string;
  rishta_id: number;
  letter: string;
  raw_payload: string;
  hash: string;
  rakhi_config: RakhiConfig;
  reply_payload?: string;
  year: number;
}

export type ViewType =
  | 'threshold'
  | 'rishta'
  | 'karkhana'
  | 'thaal'
  | 'bandhan'
  | 'mohar'
  | 'kholo'
  | 'vachan'
  | 'peti'
  | 'rivaaj'
  | 'ped'
  | 'baat'
  | 'selftest';

export interface RishtaInfo {
  id: number;
  slug: string;
  title_hi: string;
  title_en: string;
  desc_hi: string;
  desc_en: string;
  prompt_hi: string;
  prompt_en: string;
  is_memorial?: boolean;
  is_tree?: boolean;
  is_lumba?: boolean;
  is_self?: boolean;
}

export interface RivaajInfo {
  id: number;
  title_hi: string;
  title_en: string;
  region: string;
  desc_hi: string;
  desc_en: string;
  offering: string;
  default_dori: number;
  default_sweet: number;
}

export interface MithaiInfo {
  id: number;
  name_hi: string;
  name_en: string;
  region: string;
  color: string;
  accent: string;
  shape: 'circle' | 'diamond' | 'square' | 'ring' | 'oval' | 'spiral' | 'triangular';
}

export interface PaletteInfo {
  id: number;
  name: string;
  name_hi: string;
  colors: [string, string, string, string]; // 4 harmonious hexes
}
