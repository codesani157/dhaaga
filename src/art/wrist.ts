import { SKIN_TONES, SLEEVE_STYLES } from '../data/materials';

export interface WristRenderOptions {
  skinIndex?: number;
  sleeveIndex?: number;
  isMemorial?: boolean;
  isLumba?: boolean;
  showThali?: boolean;
  tilakApplied?: boolean;
}

/**
 * Handcrafted Indian hand, wrist, forearm and Puja Thali line art
 * Normalized ViewBox: 0 0 440 320
 * Wrist center tying target: (210, 160)
 */
export function renderWristSVG(options: WristRenderOptions = {}): string {
  const {
    skinIndex = 1,
    sleeveIndex = 0,
    isMemorial = false,
    isLumba = false,
    showThali = true,
    tilakApplied = false,
  } = options;

  const skin = SKIN_TONES[skinIndex % SKIN_TONES.length] || SKIN_TONES[1];
  const skinHex = skin.hex;
  const inkStroke = '#231C17';

  // Lighter palm undertone for lifelike Indian hand
  const palmUnderTone =
    skinIndex === 0
      ? '#FFEFE4'
      : skinIndex >= 7
      ? '#3F2212'
      : skinIndex >= 4
      ? '#D8996C'
      : '#F7D6B7';

  // If Memorial
  if (isMemorial) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 320" class="w-full h-full select-none pointer-events-none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="mem-wood-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#231C17" flood-opacity="0.25" />
          </filter>
        </defs>
        <!-- Vintage Wooden Frame -->
        <g filter="url(#mem-wood-shadow)">
          <rect x="50" y="20" width="340" height="270" fill="#E6D3B3" stroke="#4A2E18" stroke-width="10" rx="6" />
          <rect x="62" y="32" width="316" height="246" fill="#FBF6EA" stroke="#B5872B" stroke-width="2.5" />
          <rect x="74" y="44" width="292" height="222" fill="#231C17" fill-opacity="0.04" />
        </g>
        
        <!-- Marigold Garland across top of frame -->
        <g stroke="#231C17" stroke-width="1.2">
          ${[75, 105, 135, 165, 195, 225, 255, 285, 315, 345, 365].map((x, i) => {
            const y = 35 + Math.sin((i / 10) * Math.PI) * 16;
            const c = i % 2 === 0 ? '#DFA327' : '#E86114';
            return `<circle cx="${x}" cy="${y}" r="11" fill="${c}" /><circle cx="${x}" cy="${y}" r="5" fill="#FFF275" opacity="0.6" />`;
          }).join('')}
        </g>

        <!-- Sacred Tying Ring Marker -->
        <circle cx="210" cy="160" r="34" fill="none" stroke="#B4271F" stroke-width="2.5" stroke-dasharray="6,4" />
        <text x="210" y="165" font-family="'Martel', serif" font-size="14" font-weight="700" fill="#B4271F" text-anchor="middle">स्मृति रक्षासूत्र</text>
        <text x="210" y="225" font-family="'Kalam', cursive" font-size="17" fill="#7A5030" text-anchor="middle">सदा हमारे दिलों में अमर</text>
      </svg>
    `;
  }

  // Sleeve Geometry (Forearm left side x: 0..170)
  let sleeveSvg = '';
  switch (sleeveIndex) {
    case 1: // Traditional Silk Kurta Cuff with Zari
      sleeveSvg = `
        <path d="M 0 100 L 160 108 C 162 135 162 185 160 212 L 0 220 Z" fill="#FBF6EA" stroke="${inkStroke}" stroke-width="2.6" />
        <!-- Red Zari border with Gold Brocade -->
        <path d="M 142 108 L 160 108 C 162 135 162 185 160 212 L 142 212 Z" fill="#B4271F" stroke="${inkStroke}" stroke-width="1.8" />
        <line x1="145" y1="110" x2="145" y2="210" stroke="#DFA327" stroke-width="2" stroke-dasharray="3,2" />
        <line x1="155" y1="110" x2="155" y2="210" stroke="#DFA327" stroke-width="2" stroke-dasharray="3,2" />
        <!-- Silk wrinkle lines -->
        <path d="M 65 110 Q 90 145, 70 175" fill="none" stroke="${inkStroke}" stroke-width="1.2" opacity="0.35" />
        <path d="M 95 150 Q 120 180, 100 210" fill="none" stroke="${inkStroke}" stroke-width="1.2" opacity="0.35" />
      `;
      break;
    case 2: // Formal Blue Shirt Cuff
      sleeveSvg = `
        <path d="M 0 102 L 162 110 C 164 135 164 185 162 210 L 0 218 Z" fill="#22364E" stroke="${inkStroke}" stroke-width="2.6" />
        <path d="M 140 109 L 162 110 C 164 135 164 185 162 210 L 140 211 Z" fill="#1A2B3F" stroke="${inkStroke}" stroke-width="1.6" />
        <!-- Button -->
        <circle cx="150" cy="160" r="5" fill="#FBF6EA" stroke="${inkStroke}" stroke-width="1.5" />
        <circle cx="150" cy="160" r="2" fill="#22364E" />
      `;
      break;
    case 3: // Handknitted Woollen Sweater
      sleeveSvg = `
        <path d="M 0 98 L 162 106 C 164 135 164 185 162 214 L 0 222 Z" fill="#7C1E13" stroke="${inkStroke}" stroke-width="2.6" />
        ${[130, 137, 144, 151, 158].map((x) => `<line x1="${x}" y1="107" x2="${x}" y2="213" stroke="#DFA327" stroke-width="2" opacity="0.75" />`).join('')}
        <path d="M 40 102 Q 60 160, 40 218" fill="none" stroke="#5C140C" stroke-width="2" />
        <path d="M 75 104 Q 95 160, 75 216" fill="none" stroke="#5C140C" stroke-width="2" />
      `;
      break;
    case 4: // Fauji Olive Uniform
      sleeveSvg = `
        <path d="M 0 102 L 162 109 C 164 135 164 185 162 211 L 0 218 Z" fill="#4B582C" stroke="${inkStroke}" stroke-width="2.6" />
        <line x1="146" y1="110" x2="146" y2="210" stroke="${inkStroke}" stroke-width="2" />
        <!-- Tiranga Badge -->
        <g transform="translate(85, 145)">
          <rect x="0" y="0" width="34" height="9" fill="#E86114" />
          <rect x="0" y="9" width="34" height="9" fill="#FFFFFF" />
          <rect x="0" y="18" width="34" height="9" fill="#5F6E36" />
          <circle cx="17" cy="13.5" r="3.5" fill="none" stroke="#22364E" stroke-width="1" />
        </g>
      `;
      break;
    case 5: // Doctor / Healer White Coat
      sleeveSvg = `
        <path d="M 0 100 L 162 108 C 164 135 164 185 162 212 L 0 220 Z" fill="#FFFFFF" stroke="${inkStroke}" stroke-width="2.6" />
        <line x1="144" y1="109" x2="144" y2="211" stroke="#C7C3BA" stroke-width="2.5" />
        <path d="M 85 145 L 97 145 M 91 139 L 91 151" stroke="#B4271F" stroke-width="3" stroke-linecap="round" />
      `;
      break;
    case 6: // Traditional Lac & Glass Chooda Bangles
      sleeveSvg = `
        <g stroke-width="3.5">
          <ellipse cx="136" cy="160" rx="7" ry="51" fill="#B4271F" stroke="${inkStroke}" />
          <ellipse cx="144" cy="160" rx="7" ry="50" fill="#DFA327" stroke="${inkStroke}" />
          <ellipse cx="152" cy="160" rx="7" ry="49" fill="#5F6E36" stroke="${inkStroke}" />
          <ellipse cx="160" cy="160" rx="7" ry="48" fill="#B4271F" stroke="${inkStroke}" />
          <ellipse cx="168" cy="160" rx="7" ry="47" fill="#FFFFFF" stroke="${inkStroke}" stroke-dasharray="3,2" />
        </g>
      `;
      break;
    case 7: // Solid Steel Sarbloh Kada
      sleeveSvg = `
        <ellipse cx="158" cy="160" rx="10" ry="50" fill="#D0D0C8" stroke="${inkStroke}" stroke-width="4.5" />
        <ellipse cx="158" cy="160" rx="6" ry="46" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.7" />
      `;
      break;
    case 8: // Old Sacred Kalawa Thread
      sleeveSvg = `
        <ellipse cx="166" cy="160" rx="6" ry="46" fill="none" stroke="#B4271F" stroke-width="3.5" stroke-dasharray="5,2" />
        <ellipse cx="170" cy="160" rx="6" ry="45" fill="none" stroke="#DFA327" stroke-width="2.5" />
      `;
      break;
    case 9: // Classic Watch
      sleeveSvg = `
        <rect x="144" y="112" width="22" height="96" fill="#6A3B18" stroke="${inkStroke}" stroke-width="2" rx="3" />
        <circle cx="155" cy="160" r="18" fill="#FBF6EA" stroke="#B5872B" stroke-width="3.5" />
        <circle cx="155" cy="160" r="14" fill="#FFFFFF" stroke="${inkStroke}" stroke-width="1.2" />
        <line x1="155" y1="160" x2="155" y2="150" stroke="${inkStroke}" stroke-width="2" stroke-linecap="round" />
        <line x1="155" y1="160" x2="162" y2="160" stroke="#B4271F" stroke-width="1.8" stroke-linecap="round" />
      `;
      break;
    default:
      sleeveSvg = '';
      break;
  }

  // Lumba Bangle
  const lumbaBangle = isLumba
    ? `
      <g id="lumba-bangle" stroke-width="4">
        <ellipse cx="195" cy="160" rx="9" ry="48" fill="none" stroke="#B5872B" />
        <ellipse cx="195" cy="160" rx="7" ry="46" fill="none" stroke="#B4271F" stroke-dasharray="5,3" />
        <!-- Small dangling Ghungroo bells -->
        <circle cx="195" cy="210" r="4" fill="#DFA327" stroke="${inkStroke}" stroke-width="1" />
        <circle cx="192" cy="216" r="3.5" fill="#DFA327" stroke="${inkStroke}" stroke-width="1" />
        <circle cx="198" cy="216" r="3.5" fill="#DFA327" stroke="${inkStroke}" stroke-width="1" />
      </g>
    `
    : '';

  // Traditional Puja Thali beside the arm
  const thaliSvg = showThali
    ? `
      <!-- Auspicious Puja Thali in Top Right -->
      <g id="puja-thali" transform="translate(330, 20) scale(0.65)">
        <!-- Brass Thali Base with ornate rim -->
        <circle cx="100" cy="100" r="92" fill="#E5B23B" stroke="${inkStroke}" stroke-width="4" />
        <circle cx="100" cy="100" r="84" fill="#DFA327" stroke="#B5872B" stroke-width="2" />
        <circle cx="100" cy="100" r="76" fill="#F1E3CB" stroke="#231C17" stroke-width="1.5" />
        
        <!-- Sacred Swastik in Center of Thali -->
        <g stroke="#B4271F" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6">
          <line x1="88" y1="100" x2="112" y2="100" />
          <line x1="100" y1="88" x2="100" y2="112" />
          <line x1="112" y1="100" x2="112" y2="90" />
          <line x1="88" y1="100" x2="88" y2="110" />
          <line x1="100" y1="88" x2="110" y2="88" />
          <line x1="100" y1="112" x2="90" y2="112" />
          <circle cx="94" cy="94" r="1.5" fill="#B4271F" />
          <circle cx="106" cy="94" r="1.5" fill="#B4271F" />
          <circle cx="94" cy="106" r="1.5" fill="#B4271F" />
          <circle cx="106" cy="106" r="1.5" fill="#B4271F" />
        </g>

        <!-- Roli / Kumkum Katori -->
        <circle cx="65" cy="70" r="18" fill="#B5872B" stroke="${inkStroke}" stroke-width="2" />
        <circle cx="65" cy="70" r="14" fill="#B4271F" />
        <circle cx="65" cy="70" r="10" fill="#7C1E13" />

        <!-- Akshat (Rice) Katori -->
        <circle cx="135" cy="70" r="18" fill="#B5872B" stroke="${inkStroke}" stroke-width="2" />
        <circle cx="135" cy="70" r="14" fill="#FFF9E6" />
        ${[0, 4, -4, 2, -3].map((off, i) => `<ellipse cx="${135 + off}" cy="${70 + i * 2 - 4}" rx="2" ry="4" fill="#DFA327" transform="rotate(${i * 30} ${135 + off} ${70 + i * 2 - 4})" />`).join('')}

        <!-- Ghee Diya with flickering flame -->
        <path d="M 90 142 Q 100 152, 110 142 Q 100 134, 90 142 Z" fill="#B5872B" stroke="${inkStroke}" stroke-width="2" />
        <!-- Diya flame -->
        <path d="M 100 135 Q 94 120, 100 108 Q 106 120, 100 135 Z" fill="#E86114">
          <animate attributeName="d" dur="1.4s" repeatCount="indefinite" values="
            M 100 135 Q 94 120, 100 108 Q 106 120, 100 135 Z;
            M 100 135 Q 92 118, 101 106 Q 107 122, 100 135 Z;
            M 100 135 Q 95 122, 99 107 Q 105 119, 100 135 Z;
            M 100 135 Q 94 120, 100 108 Q 106 120, 100 135 Z
          " />
        </path>
        <circle cx="100" cy="124" r="4" fill="#FFF275" />

        <!-- Mithai (Kaju Katli) on Thali -->
        <polygon points="65,130 78,122 78,138 65,146" fill="#FBF6EA" stroke="${inkStroke}" stroke-width="1.2" />
        <polygon points="68,130 75,124 75,136 68,142" fill="#E6D3B3" opacity="0.6" />
      </g>
    `
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 320" class="w-full h-full select-none pointer-events-none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <!-- Soft realistic hand shadow on ceremonial mat -->
        <filter id="hand-depth-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="4" dy="7" stdDeviation="5" flood-color="#231C17" flood-opacity="0.2" />
        </filter>
        <!-- Natural skin tone linear gradient -->
        <linearGradient id="arm-skin-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${skinHex}" />
          <stop offset="65%" stop-color="${skinHex}" />
          <stop offset="100%" stop-color="${palmUnderTone}" />
        </linearGradient>
      </defs>

      <!-- Background: Silk Velvet Chowki Mat (लाल रेशमी चौकी) -->
      <g id="ceremonial-chowki">
        <rect x="15" y="65" width="410" height="235" rx="10" fill="#7C1E13" stroke="${inkStroke}" stroke-width="3" />
        <rect x="25" y="75" width="390" height="215" rx="6" fill="#B4271F" stroke="#DFA327" stroke-width="2.5" />
        <!-- Zardozi Gold Mat Border -->
        <rect x="33" y="83" width="374" height="199" rx="4" fill="none" stroke="#DFA327" stroke-width="1.8" stroke-dasharray="6,4" />
        <!-- Decorative corner paisley motifs -->
        <circle cx="45" cy="95" r="4" fill="#DFA327" />
        <circle cx="395" cy="95" r="4" fill="#DFA327" />
        <circle cx="45" cy="270" r="4" fill="#DFA327" />
        <circle cx="395" cy="270" r="4" fill="#DFA327" />
      </g>

      <!-- Puja Thali with Diya, Kumkum & Akshat -->
      ${thaliSvg}

      <!-- Main Anatomical Forearm, Wrist, Palm & Fingers -->
      <g id="anatomical-arm-group" filter="url(#hand-depth-shadow)">
        <!-- Arm & Hand Master Path (Forearm reaches x: 0 to 200; Palm: 200..290; Fingers: 290..395) -->
        <path d="
          M 0 112
          C 70 112, 130 120, 180 124
          C 205 126, 222 122, 240 115
          C 252 109, 260 98, 270 89
          C 277 82, 288 84, 291 94
          C 293 103, 280 116, 272 125
          C 288 125, 322 118, 356 120
          C 367 120, 372 129, 365 135
          C 353 141, 318 142, 302 143
          C 325 143, 364 140, 380 142
          C 390 143, 391 155, 380 160
          C 362 166, 316 164, 298 165
          C 322 167, 356 166, 371 170
          C 380 172, 380 183, 368 186
          C 350 190, 309 187, 292 188
          C 309 191, 336 191, 347 196
          C 355 199, 353 209, 342 211
          C 320 215, 277 212, 254 209
          C 227 205, 204 202, 180 204
          C 130 208, 70 216, 0 216
          Z
        " fill="url(#arm-skin-gradient)" stroke="${inkStroke}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />

        <!-- FINGER CREASES & NAIL BED DETAILS -->
        <!-- Thumb knuckle & polished nail -->
        <path d="M 276 91 Q 284 88, 287 96" fill="none" stroke="${inkStroke}" stroke-width="1.3" opacity="0.6" />
        <ellipse cx="286" cy="91" rx="3.5" ry="2" fill="#FFF2E8" opacity="0.65" />
        <path d="M 264 102 Q 271 107, 266 114" fill="none" stroke="${inkStroke}" stroke-width="1.4" opacity="0.5" />

        <!-- Index Finger -->
        <path d="M 296 133 L 358 131" fill="none" stroke="${inkStroke}" stroke-width="1.6" opacity="0.6" />
        <ellipse cx="358" cy="126" rx="4" ry="2.5" fill="#FFF2E8" opacity="0.6" />

        <!-- Middle Finger -->
        <path d="M 293 153 L 372 151" fill="none" stroke="${inkStroke}" stroke-width="1.6" opacity="0.6" />
        <ellipse cx="373" cy="148" rx="4.5" ry="2.5" fill="#FFF2E8" opacity="0.6" />

        <!-- Ring Finger -->
        <path d="M 290 174 L 362 174" fill="none" stroke="${inkStroke}" stroke-width="1.6" opacity="0.6" />
        <ellipse cx="363" cy="176" rx="4" ry="2.5" fill="#FFF2E8" opacity="0.6" />

        <!-- Little (Pinky) Finger -->
        <path d="M 283 196 L 338 198" fill="none" stroke="${inkStroke}" stroke-width="1.6" opacity="0.6" />
        <ellipse cx="339" cy="202" rx="3.5" ry="2.2" fill="#FFF2E8" opacity="0.6" />

        <!-- PALM & WRIST ANATOMICAL CREASES -->
        <!-- Life Line (Thenar crease) -->
        <path d="M 240 128 C 258 145, 264 180, 244 202" fill="none" stroke="${inkStroke}" stroke-width="2" opacity="0.55" />
        <!-- Head & Heart Lines -->
        <path d="M 290 135 C 275 145, 258 153, 235 156" fill="none" stroke="${inkStroke}" stroke-width="1.6" opacity="0.45" />
        <path d="M 287 160 C 272 168, 256 172, 230 170" fill="none" stroke="${inkStroke}" stroke-width="1.5" opacity="0.45" />

        <!-- Wrist flexor creases (Where Rakhi rests around x: 190..215, y: 160) -->
        <path d="M 190 131 C 197 155, 197 168, 190 194" fill="none" stroke="${inkStroke}" stroke-width="1.5" stroke-dasharray="12,3,6,2" opacity="0.45" />
        <path d="M 202 129 C 209 155, 209 168, 202 196" fill="none" stroke="${inkStroke}" stroke-width="1.8" opacity="0.5" />
        <path d="M 214 128 C 221 155, 221 168, 214 198" fill="none" stroke="${inkStroke}" stroke-width="1.5" stroke-dasharray="10,4" opacity="0.45" />
      </g>

      <!-- Sleeve Layer -->
      <g id="arm-sleeve-layer">
        ${sleeveSvg}
      </g>

      <!-- Lumba Bangle if selected -->
      ${lumbaBangle}

      <!-- Sacred Kumkum / Roli Tilak on Wrist Bone if applied -->
      ${
        tilakApplied
          ? `
            <g id="wrist-sacred-tilak" class="animate-fade-in">
              <circle cx="210" cy="160" r="6" fill="#B4271F" />
              <circle cx="210" cy="160" r="3.5" fill="#E86114" />
              <!-- Akshat (Rice grains) -->
              <ellipse cx="208" cy="158" rx="1" ry="2.5" fill="#FFF9E6" transform="rotate(25 208 158)" />
              <ellipse cx="212" cy="162" rx="1" ry="2.5" fill="#FFF9E6" transform="rotate(-30 212 162)" />
            </g>
          `
          : ''
      }
    </svg>
  `;
}
