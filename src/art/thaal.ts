import { ThaalConfig } from '../types';
import { MITHAI_LIST } from '../data/mithai';

export interface ThaalRenderOptions {
  size?: number;
  interactive?: boolean;
  onSelectSweet?: (sweetId: number) => void;
}

/**
 * Procedural brass Thaal SVG renderer
 */
export function renderThaalSVG(config: ThaalConfig = {}, options: ThaalRenderOptions = {}): string {
  const size = options.size || 340;
  const sweetId = typeof config.s === 'number' ? config.s : 0;
  const sweet = MITHAI_LIST[sweetId % MITHAI_LIST.length] || MITHAI_LIST[0];

  // Sweet geometry
  let sweetGeometry = '';
  switch (sweet.shape) {
    case 'diamond': // Kaju Katli
      sweetGeometry = `
        <polygon points="0,-16 22,0 0,16 -22,0" fill="${sweet.color}" stroke="${sweet.accent}" stroke-width="1.8" />
        <polygon points="-12,-4 0,-12 12,-4 0,4" fill="${sweet.accent}" opacity="0.4" />
      `;
      break;
    case 'square': // Mysore Pak / Sandesh / Chhena Poda
      sweetGeometry = `
        <rect x="-18" y="-18" width="36" height="36" fill="${sweet.color}" stroke="${sweet.accent}" stroke-width="2" rx="2" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="${sweet.accent}" stroke-width="1.5" />
      `;
      break;
    case 'ring': // Ghevar / Balushahi
      sweetGeometry = `
        <circle r="22" fill="${sweet.color}" stroke="${sweet.accent}" stroke-width="2.5" />
        <circle r="9" fill="#DCC9A6" stroke="${sweet.accent}" stroke-width="1.8" />
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `<circle cx="${(Math.cos((deg * Math.PI) / 180) * 15).toFixed(1)}" cy="${(Math.sin((deg * Math.PI) / 180) * 15).toFixed(1)}" r="2" fill="${sweet.accent}" />`).join('')}
      `;
      break;
    case 'spiral': // Jalebi / Imarti
      sweetGeometry = `
        <g stroke="${sweet.color}" stroke-width="4.5" fill="none" stroke-linecap="round">
          <circle cx="0" cy="0" r="14" />
          <path d="M -8 -8 Q 0 -18, 12 -8 Q 18 4, 6 12 Q -12 16, -14 0" />
        </g>
      `;
      break;
    case 'oval': // Modak / Thekua / Gujiya
      sweetGeometry = `
        <path d="M 0 -22 Q 18 -6, 14 14 Q 0 22, -14 14 Q -18 -6, 0 -22 Z" fill="${sweet.color}" stroke="${sweet.accent}" stroke-width="2" />
        <line x1="0" y1="-18" x2="0" y2="18" stroke="${sweet.accent}" stroke-width="1.6" />
      `;
      break;
    case 'circle':
    default: // Besan Laddoo / Rasgulla / Peda
      sweetGeometry = `
        <circle r="20" fill="${sweet.color}" stroke="${sweet.accent}" stroke-width="2" />
        ${[[-6, -6], [5, -4], [-2, 6], [8, 5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="${sweet.accent}" />`).join('')}
      `;
      break;
  }

  // Optional Coconut for Narali Purnima / Puja
  const coconutSvg = config.o
    ? `
      <g transform="translate(0, -65)">
        <ellipse rx="18" ry="24" fill="#7A5030" stroke="#4B2D19" stroke-width="2" />
        <ellipse rx="12" ry="16" fill="#FBF6EA" />
        <path d="M -4 -16 L 0 -28 L 4 -16 Z" fill="#5F6E36" />
      </g>
    `
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-150 -150 300 300" width="${size}" height="${size}" class="overflow-visible select-none">
      <defs>
        <!-- Brass hammered plate gradient -->
        <radialGradient id="brass-grad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#EED59B" />
          <stop offset="65%" stop-color="#B5872B" />
          <stop offset="100%" stop-color="#845D16" />
        </radialGradient>
        <!-- Flame glow -->
        <radialGradient id="flame-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF3B0" stop-opacity="0.9" />
          <stop offset="40%" stop-color="#DFA327" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#B4271F" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Plate Outer Shadow -->
      <circle r="138" fill="#231C17" opacity="0.12" transform="translate(3, 5)" />

      <!-- Main Brass Plate Rim -->
      <circle r="135" fill="url(#brass-grad)" stroke="#68470E" stroke-width="3" />
      <circle r="124" fill="none" stroke="#F1E3CB" stroke-width="1.5" opacity="0.6" stroke-dasharray="6,3" />
      <circle r="116" fill="url(#brass-grad)" stroke="#9C5A2D" stroke-width="1.8" />

      <!-- Diya (Center Bottom) -->
      <g transform="translate(0, 50)" id="thaal-diya">
        <!-- Diya Glow -->
        <circle cx="0" cy="-22" r="32" fill="url(#flame-glow)" />
        <!-- Clay Diya Base -->
        <path d="M -26 0 Q 0 20, 26 0 Q 30 -10, 0 -10 Q -30 -10, -26 0 Z" fill="#9C5A2D" stroke="#68470E" stroke-width="2" />
        <ellipse cx="0" cy="-6" rx="20" ry="6" fill="#DFA327" />
        <!-- Flame -->
        <path d="M 0 -8 Q 9 -22, 0 -36 Q -9 -22, 0 -8 Z" fill="#FFF275" stroke="#B4271F" stroke-width="1.5" />
        <circle cx="0" cy="-18" r="4" fill="#B4271F" opacity="0.8" />
      </g>

      <!-- Roli / Kumkum Katori (Left) -->
      <g transform="translate(-65, -10)" id="thaal-roli">
        <circle r="26" fill="#9C5A2D" stroke="#68470E" stroke-width="2" />
        <circle r="21" fill="#B4271F" stroke="#7C1E13" stroke-width="1.5" />
        <circle cx="-4" cy="-4" r="4" fill="#7C1E13" opacity="0.6" />
      </g>

      <!-- Akshat / Rice Katori (Right) -->
      <g transform="translate(65, -10)" id="thaal-akshat">
        <circle r="26" fill="#9C5A2D" stroke="#68470E" stroke-width="2" />
        <circle r="21" fill="#FBF6EA" stroke="#DCC9A6" stroke-width="1.5" />
        <!-- Individual Rice Grains -->
        ${[[-8, -6], [0, -9], [8, -5], [-7, 3], [1, 5], [9, 2], [-2, -2], [5, -12]].map(([rx, ry]) => `<ellipse cx="${rx}" cy="${ry}" rx="3.2" ry="1.4" fill="#FFFDF8" stroke="#DCC9A6" stroke-width="0.8" transform="rotate(25 ${rx} ${ry})" />`).join('')}
      </g>

      <!-- Mithai Sweet (Top Center) -->
      <g transform="translate(0, -65)" id="thaal-sweet">
        <circle r="30" fill="#231C17" opacity="0.08" transform="translate(2, 3)" />
        ${sweetGeometry}
      </g>

      <!-- Optional Coconut if set -->
      ${coconutSvg}

      <!-- Curling Agarbatti Incense Smoke (Top-Right) -->
      <g transform="translate(85, -60)" opacity="0.65">
        <line x1="0" y1="0" x2="-8" y2="28" stroke="#4B2D19" stroke-width="2" />
        <circle cx="0" cy="0" r="2.5" fill="#B4271F" />
        <path d="M 0 0 Q -10 -20, -2 -38 T -12 -65" fill="none" stroke="#DCC9A6" stroke-width="1.8" stroke-linecap="round" />
      </g>
    </svg>
  `;
}
