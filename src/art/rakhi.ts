import { RakhiConfig } from '../types';
import { DORIS, CENTREPIECES, PALETTES } from '../data/materials';
import { Mulberry32 } from '../core/prng';

export interface RakhiRenderOptions {
  size?: number;
  hangAngle?: number;
  highlightSpecular?: boolean;
}

/**
 * Generate Sanjhi paper-cut jaali path with real mirror-and-rotate geometry
 */
export function generateSanjhiJaali(folds: number = 8, depth: number = 3, seed: number = 108): string {
  const prng = new Mulberry32(seed);
  const wedgeAngle = (2 * Math.PI) / folds;
  const radius = 34;

  let pathData = '';

  // Outer scalloped perimeter
  let outerD = '';
  for (let f = 0; f < folds; f++) {
    const a1 = f * wedgeAngle;
    const aMid = a1 + wedgeAngle / 2;
    const a2 = a1 + wedgeAngle;

    const rOuter = radius + 3;
    const rNotch = radius - 2;

    const x1 = Math.cos(a1) * rNotch;
    const y1 = Math.sin(a1) * rNotch;
    const xMid = Math.cos(aMid) * rOuter;
    const yMid = Math.sin(aMid) * rOuter;
    const x2 = Math.cos(a2) * rNotch;
    const y2 = Math.sin(a2) * rNotch;

    if (f === 0) {
      outerD += `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    outerD += ` Q ${xMid.toFixed(1)} ${yMid.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  outerD += ' Z';
  pathData += outerD;

  // Inner geometric negative-space cutouts (petal & teardrop holes)
  for (let f = 0; f < folds; f++) {
    const baseAngle = f * wedgeAngle;
    const midAngle = baseAngle + wedgeAngle / 2;

    // Outer petal cutout
    const r1 = 18 + depth * 2;
    const r2 = 27;
    const px1 = Math.cos(baseAngle + wedgeAngle * 0.2) * r1;
    const py1 = Math.sin(baseAngle + wedgeAngle * 0.2) * r1;
    const px2 = Math.cos(midAngle) * r2;
    const py2 = Math.sin(midAngle) * r2;
    const px3 = Math.cos(baseAngle + wedgeAngle * 0.8) * r1;
    const py3 = Math.sin(baseAngle + wedgeAngle * 0.8) * r1;

    pathData += ` M ${px1.toFixed(1)} ${py1.toFixed(1)} Q ${px2.toFixed(1)} ${py2.toFixed(1)}, ${px3.toFixed(1)} ${py3.toFixed(1)} Z`;

    // Inner teardrop cutout
    const ir1 = 8;
    const ir2 = 14 + depth;
    const ix1 = Math.cos(midAngle - 0.15) * ir1;
    const iy1 = Math.sin(midAngle - 0.15) * ir1;
    const ix2 = Math.cos(midAngle) * ir2;
    const iy2 = Math.sin(midAngle) * ir2;
    const ix3 = Math.cos(midAngle + 0.15) * ir1;
    const iy3 = Math.sin(midAngle + 0.15) * ir1;

    pathData += ` M ${ix1.toFixed(1)} ${iy1.toFixed(1)} Q ${ix2.toFixed(1)} ${iy2.toFixed(1)}, ${ix3.toFixed(1)} ${iy3.toFixed(1)} Z`;
  }

  return pathData;
}

/**
 * Render procedural SVG Rakhi
 */
export function renderRakhiSVG(config: RakhiConfig, options: RakhiRenderOptions = {}): string {
  const size = options.size || 260;
  const hangAngle = options.hangAngle || 0;
  const dori = DORIS[config.d % DORIS.length] || DORIS[0];
  const palette = PALETTES[config.p?.[0] % PALETTES.length] || PALETTES[0];
  const colors = palette.colors;
  const prng = new Mulberry32(config.s || 108);

  const centreId = config.c % CENTREPIECES.length;
  const jaaliFolds = config.j || 8;
  const jaaliDepth = config.n || 3;

  // Dori Braided Path Left and Right
  const doriLength = 100;
  let doriSvg = '';

  // Render 2 or 3 strands with helical phase offsets
  const strandCount = dori.strands;
  const pitch = dori.twistPitch;

  for (let s = 0; s < strandCount; s++) {
    const strandColor = dori.colors[s % dori.colors.length];
    const phase = (s * (2 * Math.PI)) / strandCount;

    // Left strand
    let leftD = 'M -35 0';
    for (let x = -35; x >= -doriLength; x -= 4) {
      const y = Math.sin((x / pitch) * 2 * Math.PI + phase) * 2.8;
      leftD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    // Right strand
    let rightD = 'M 35 0';
    for (let x = 35; x <= doriLength; x += 4) {
      const y = Math.sin((x / pitch) * 2 * Math.PI + phase) * 2.8;
      rightD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    doriSvg += `<path d="${leftD}" stroke="${strandColor}" stroke-width="2.6" fill="none" stroke-linecap="round" />`;
    doriSvg += `<path d="${rightD}" stroke="${strandColor}" stroke-width="2.6" fill="none" stroke-linecap="round" />`;
  }

  // Tassel fluff at outer ends
  doriSvg += `
    <g transform="translate(-${doriLength}, 0)">
      <line x1="0" y1="0" x2="-14" y2="-4" stroke="${dori.colors[0]}" stroke-width="1.8" />
      <line x1="0" y1="0" x2="-16" y2="0" stroke="${dori.colors[1] || dori.colors[0]}" stroke-width="1.8" />
      <line x1="0" y1="0" x2="-14" y2="4" stroke="${dori.colors[2] || dori.colors[0]}" stroke-width="1.8" />
    </g>
    <g transform="translate(${doriLength}, 0)">
      <line x1="0" y1="0" x2="14" y2="-4" stroke="${dori.colors[0]}" stroke-width="1.8" />
      <line x1="0" y1="0" x2="16" y2="0" stroke="${dori.colors[1] || dori.colors[0]}" stroke-width="1.8" />
      <line x1="0" y1="0" x2="14" y2="4" stroke="${dori.colors[2] || dori.colors[0]}" stroke-width="1.8" />
    </g>
  `;

  // Centerpiece content
  let centreSvg = '';

  switch (centreId) {
    case 0: {
      // Sanjhi Paper-cut Jaali
      const jaaliPath = generateSanjhiJaali(jaaliFolds, jaaliDepth, config.s);
      centreSvg = `
        <circle r="36" fill="${colors[0]}" filter="drop-shadow(0px 2px 3px rgba(35,28,23,0.15))" />
        <path d="${jaaliPath}" fill="${colors[3]}" fill-rule="evenodd" stroke="${colors[1]}" stroke-width="0.8" />
        <circle r="6" fill="${colors[2]}" stroke="${colors[0]}" stroke-width="1.5" />
      `;
      break;
    }
    case 1: {
      // Kolam Loop
      centreSvg = `
        <circle r="32" fill="${colors[3]}" stroke="${colors[0]}" stroke-width="2" />
        <g stroke="${colors[0]}" stroke-width="2.2" fill="none">
          <circle cx="0" cy="-12" r="6" />
          <circle cx="0" cy="12" r="6" />
          <circle cx="-12" cy="0" r="6" />
          <circle cx="12" cy="0" r="6" />
          <path d="M -12 -12 Q 0 0, 12 12 M -12 12 Q 0 0, 12 -12" />
        </g>
        <circle r="4" fill="${colors[1]}" />
      `;
      break;
    }
    case 2: {
      // Ashoka Chakra Spoke Geometry
      centreSvg = `
        <circle r="32" fill="${colors[3]}" stroke="${colors[0]}" stroke-width="2.5" />
        <circle r="12" fill="${colors[1]}" />
        <g stroke="${colors[0]}" stroke-width="1.4">
          ${Array.from({ length: 16 }).map((_, idx) => {
            const rad = (idx * Math.PI * 2) / 16;
            const x1 = Math.cos(rad) * 12;
            const y1 = Math.sin(rad) * 12;
            const x2 = Math.cos(rad) * 31;
            const y2 = Math.sin(rad) * 31;
            return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
          }).join('')}
        </g>
        <circle r="5" fill="${colors[2]}" />
      `;
      break;
    }
    case 3: {
      // Bandhani Dot Cluster
      centreSvg = `
        <circle r="32" fill="${colors[0]}" />
        <g fill="${colors[3]}">
          <circle cx="0" cy="0" r="4.5" />
          ${Array.from({ length: 8 }).map((_, idx) => {
            const rad = (idx * Math.PI * 2) / 8;
            return `<circle cx="${(Math.cos(rad) * 12).toFixed(1)}" cy="${(Math.sin(rad) * 12).toFixed(1)}" r="3" />`;
          }).join('')}
          ${Array.from({ length: 12 }).map((_, idx) => {
            const rad = (idx * Math.PI * 2) / 12;
            return `<circle cx="${(Math.cos(rad) * 22).toFixed(1)}" cy="${(Math.sin(rad) * 22).toFixed(1)}" r="2.5" fill="${colors[1]}" />`;
          }).join('')}
        </g>
      `;
      break;
    }
    case 4: {
      // Shisha Mirror Work
      centreSvg = `
        <circle r="34" fill="${colors[0]}" />
        <circle r="25" fill="#E8ECEF" stroke="${colors[1]}" stroke-width="3" stroke-dasharray="3,2" />
        <!-- Specular Sweep -->
        <polygon points="-12,-20 18,-20 6,20 -24,20" fill="white" opacity="0.35" />
        <circle r="18" fill="none" stroke="${colors[2]}" stroke-width="1.8" />
      `;
      break;
    }
    case 5: {
      // Zardozi Metallic Coil Spiral
      centreSvg = `
        <circle r="32" fill="${colors[0]}" />
        <path d="M 0 0 Q 8 -10, 16 0 T 0 20 T -20 0 T 0 -24 T 24 0" fill="none" stroke="${colors[1]}" stroke-width="3" stroke-linecap="round" />
        <circle r="6" fill="${colors[2]}" />
      `;
      break;
    }
    case 6: {
      // Warli Stick Pair
      centreSvg = `
        <circle r="32" fill="${colors[3]}" stroke="${colors[0]}" stroke-width="2" />
        <g fill="${colors[0]}" stroke="${colors[0]}">
          <!-- Left figure -->
          <circle cx="-10" cy="-14" r="3.5" />
          <polygon points="-10,-10 -5,2 -15,2" />
          <polygon points="-10,6 -5,2 -15,2" />
          <line x1="-12" y1="6" x2="-14" y2="15" stroke-width="2" />
          <line x1="-8" y1="6" x2="-6" y2="15" stroke-width="2" />
          <!-- Right figure -->
          <circle cx="10" cy="-14" r="3.5" />
          <polygon points="10,-10 15,2 5,2" />
          <polygon points="10,6 15,2 5,2" />
          <line x1="8" y1="6" x2="6" y2="15" stroke-width="2" />
          <line x1="12" y1="6" x2="14" y2="15" stroke-width="2" />
          <!-- Joined Hands -->
          <line x1="-5" y1="-2" x2="5" y2="-2" stroke-width="2" />
        </g>
      `;
      break;
    }
    case 7: {
      // Madhubani Twin Fish
      centreSvg = `
        <circle r="32" fill="${colors[3]}" stroke="${colors[0]}" stroke-width="2" />
        <g fill="none" stroke="${colors[0]}" stroke-width="1.8">
          <!-- Fish 1 -->
          <path d="M -16 -6 Q 0 -14, 14 -4 Q 0 4, -16 -6 Z" fill="${colors[1]}" opacity="0.6" />
          <line x1="14" y1="-4" x2="22" y2="-10" />
          <line x1="14" y1="-4" x2="22" y2="2" />
          <!-- Fish 2 -->
          <path d="M 16 6 Q 0 14, -14 4 Q 0 -4, 16 6 Z" fill="${colors[2]}" opacity="0.6" />
          <line x1="-14" y1="4" x2="-22" y2="10" />
          <line x1="-14" y1="4" x2="-22" y2="-2" />
        </g>
        <circle cx="-6" cy="-6" r="1.5" fill="${colors[0]}" />
        <circle cx="6" cy="6" r="1.5" fill="${colors[0]}" />
      `;
      break;
    }
    case 8: {
      // Madhubani Peacock Line
      centreSvg = `
        <circle r="32" fill="${colors[3]}" stroke="${colors[0]}" stroke-width="2" />
        <g fill="none" stroke="${colors[0]}" stroke-width="1.8">
          <path d="M -8 10 Q -14 -4, -6 -14 Q 0 -16, 2 -8 Q 4 0, -4 12" />
          <circle cx="-3" cy="-14" r="2" fill="${colors[1]}" />
          <!-- Plumes -->
          <path d="M 2 -8 Q 16 -16, 20 -2" />
          <path d="M 2 -4 Q 18 -8, 22 6" />
          <path d="M 0 0 Q 14 4, 18 16" />
          <circle cx="19" cy="-2" r="2.5" fill="${colors[0]}" />
          <circle cx="21" cy="6" r="2.5" fill="${colors[1]}" />
          <circle cx="17" cy="16" r="2.5" fill="${colors[2]}" />
        </g>
      `;
      break;
    }
    case 9: {
      // Rudraksha Bead
      centreSvg = `
        <circle r="28" fill="#7A5030" stroke="#4B2D19" stroke-width="3" />
        <g stroke="#4B2D19" stroke-width="2" fill="none">
          <path d="M 0 -28 Q 12 0, 0 28" />
          <path d="M 0 -28 Q -12 0, 0 28" />
          <path d="M -28 0 Q 0 12, 28 0" />
          <circle cx="0" cy="0" r="5" fill="#DFA327" />
        </g>
      `;
      break;
    }
    case 10: {
      // Cowrie Shell
      centreSvg = `
        <circle r="30" fill="${colors[0]}" />
        <g transform="rotate(25)">
          <ellipse rx="15" ry="22" fill="#FBF6EA" stroke="${colors[2]}" stroke-width="2" />
          <line x1="0" y1="-16" x2="0" y2="16" stroke="#7A5030" stroke-width="2.5" />
          ${[-10, -5, 0, 5, 10].map(y => `<line x1="-4" y1="${y}" x2="4" y2="${y}" stroke="#7A5030" stroke-width="1.5" />`).join('')}
        </g>
      `;
      break;
    }
    case 11: {
      // Nazar Protection Ward (Evil Eye)
      centreSvg = `
        <circle r="32" fill="#22364E" />
        <circle r="22" fill="#FBF6EA" />
        <circle r="13" fill="#3B82F6" />
        <circle r="6" fill="#231C17" />
        <circle cx="2" cy="-2" r="2" fill="#FFFFFF" />
      `;
      break;
    }
    case 12: {
      // Genda Marigold Rosette
      centreSvg = `
        <circle r="32" fill="${colors[1]}" />
        <g fill="${colors[0]}" stroke="${colors[2]}" stroke-width="1">
          ${Array.from({ length: 12 }).map((_, idx) => {
            const rad = (idx * Math.PI * 2) / 12;
            const x = Math.cos(rad) * 18;
            const y = Math.sin(rad) * 18;
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" />`;
          }).join('')}
          <circle cx="0" cy="0" r="11" fill="${colors[1]}" />
          <circle cx="0" cy="0" r="5" fill="${colors[2]}" />
        </g>
      `;
      break;
    }
    case 13: {
      // Kamal Sacred Lotus
      centreSvg = `
        <circle r="32" fill="${colors[3]}" stroke="${colors[0]}" stroke-width="2" />
        <g fill="${colors[0]}" opacity="0.9">
          <path d="M 0 -18 Q 8 0, 0 16 Q -8 0, 0 -18 Z" />
          <path d="M -12 -12 Q -2 4, -14 12 Q -18 0, -12 -12 Z" />
          <path d="M 12 -12 Q 2 4, 14 12 Q 18 0, 12 -12 Z" />
        </g>
        <circle cx="0" cy="8" r="4" fill="${colors[1]}" />
      `;
      break;
    }
    case 14: {
      // Faith Mark (Om by default or graceful geometry)
      centreSvg = `
        <circle r="32" fill="${colors[0]}" />
        <circle r="27" fill="${colors[3]}" stroke="${colors[1]}" stroke-width="2" />
        <text x="0" y="8" font-family="'Martel', serif" font-size="22" font-weight="700" fill="${colors[0]}" text-anchor="middle">ॐ</text>
      `;
      break;
    }
    case 15:
    default: {
      // Bare Sacred Knot
      centreSvg = `
        <g stroke="${colors[0]}" stroke-width="4" fill="none">
          <path d="M -16 -6 Q 0 8, 16 -6" />
          <path d="M -16 6 Q 0 -8, 16 6" />
          <circle cx="0" cy="0" r="8" fill="${colors[1]}" stroke="${colors[2]}" stroke-width="2" />
        </g>
      `;
      break;
    }
  }

  // Latkan Hangings (downwards from centerpiece with pendulum angle)
  let latkanSvg = '';
  const hangings = config.h || [];
  if (hangings.length > 0) {
    const spacing = 14;
    const startX = -((hangings.length - 1) * spacing) / 2;

    hangings.forEach((hangId, idx) => {
      const hx = startX + idx * spacing;
      const hy = 32;
      const length = 28 + (idx % 2) * 6;

      latkanSvg += `
        <g transform="translate(${hx}, ${hy}) rotate(${hangAngle})">
          <line x1="0" y1="0" x2="0" y2="${length}" stroke="${colors[1]}" stroke-width="1.8" stroke-dasharray="2,2" />
          <g transform="translate(0, ${length})">
            <circle r="5" fill="${colors[0]}" />
            <circle r="2.5" fill="${colors[2]}" />
            <polygon points="-3,4 3,4 0,9" fill="${colors[1]}" />
          </g>
        </g>
      `;
    });
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-130 -60 260 140" width="${size}" height="${(size * 140) / 260}" class="overflow-visible select-none pointer-events-none">
      <g id="rakhi-dori">
        ${doriSvg}
      </g>
      <g id="rakhi-latkans">
        ${latkanSvg}
      </g>
      <g id="rakhi-centre">
        ${centreSvg}
      </g>
    </svg>
  `;
}
