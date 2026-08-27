import { audio } from '../core/audio';
import { DORIS, PALETTES } from '../data/materials';
import { RakhiConfig } from '../types';

export enum TyingStage {
  PLACED = 0, // Rakhi placed on wrist top
  WRAPPING = 1, // Dori threads wrapping under the wrist
  FIRST_KNOT = 2, // First knot cinched
  DOUBLE_KNOT = 3, // Second double lock-knot with tassels tied
  TILAK_BLESSED = 4, // Tilak and flower shower complete
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface TyingEngineOptions {
  wristCenterX?: number;
  wristCenterY?: number;
}

/**
 * Authentic Rakhi Tying Physics & Ritual Engine
 * Operating in 440 x 320 viewBox space with wrist center at (210, 160)
 */
export class RakhiTyingEngine {
  public wristCenterX: number = 210;
  public wristCenterY: number = 160;

  // Current Ritual Stage
  public stage: TyingStage = TyingStage.PLACED;

  // Interactive Drag Handles (in 440x320 SVG space)
  public leftHandle: { x: number; y: number } = { x: 135, y: 160 };
  public rightHandle: { x: number; y: number } = { x: 285, y: 160 };

  // Physical particles for dangling tassels
  public leftTasselParticles: Particle[] = [];
  public rightTasselParticles: Particle[] = [];

  // Recorded replay timeline
  public recordedPoints: { x: number; y: number; time: number }[] = [];

  constructor(options: TyingEngineOptions = {}) {
    if (options.wristCenterX !== undefined) this.wristCenterX = options.wristCenterX;
    if (options.wristCenterY !== undefined) this.wristCenterY = options.wristCenterY;

    this.reset();
  }

  public reset(): void {
    this.stage = TyingStage.PLACED;
    this.leftHandle = { x: this.wristCenterX - 80, y: this.wristCenterY };
    this.rightHandle = { x: this.wristCenterX + 80, y: this.wristCenterY };
    this.recordedPoints = [];

    // Initialize Tassel Particles
    this.leftTasselParticles = [];
    this.rightTasselParticles = [];
    for (let i = 0; i < 6; i++) {
      this.leftTasselParticles.push({
        x: this.wristCenterX - 10 + i * 2,
        y: this.wristCenterY + 25 + i * 7,
        vx: 0,
        vy: 0,
      });
      this.rightTasselParticles.push({
        x: this.wristCenterX + 10 - i * 2,
        y: this.wristCenterY + 25 + i * 7,
        vx: 0,
        vy: 0,
      });
    }

    const now = performance.now();
    this.recordedPoints.push({ x: this.wristCenterX, y: this.wristCenterY, time: now });
  }

  /**
   * Advance ritual to a specific step or next step
   */
  public advanceToStage(targetStage: TyingStage): void {
    if (targetStage <= this.stage) return;
    this.stage = targetStage;
    const now = performance.now();

    switch (targetStage) {
      case TyingStage.WRAPPING: {
        this.leftHandle = { x: this.wristCenterX - 45, y: this.wristCenterY + 38 };
        this.rightHandle = { x: this.wristCenterX + 45, y: this.wristCenterY + 38 };
        audio.playGhungroo();
        this.vibrate([15]);
        // Record wrapping curve
        for (let i = 0; i <= 8; i++) {
          this.recordedPoints.push({
            x: this.wristCenterX - 60 + i * 15,
            y: this.wristCenterY + Math.sin((i / 8) * Math.PI) * 40,
            time: now + i * 30,
          });
        }
        break;
      }
      case TyingStage.FIRST_KNOT: {
        this.leftHandle = { x: this.wristCenterX - 12, y: this.wristCenterY + 18 };
        this.rightHandle = { x: this.wristCenterX + 12, y: this.wristCenterY + 18 };
        audio.playKnot();
        audio.playGhungroo();
        this.vibrate([20, 30, 20]);
        this.recordedPoints.push({
          x: this.wristCenterX,
          y: this.wristCenterY + 15,
          time: now + 50,
        });
        break;
      }
      case TyingStage.DOUBLE_KNOT: {
        this.leftHandle = { x: this.wristCenterX - 18, y: this.wristCenterY + 65 };
        this.rightHandle = { x: this.wristCenterX + 18, y: this.wristCenterY + 65 };
        audio.playKnot();
        audio.playMandirGhanti();
        this.vibrate([25, 50, 40]);
        this.recordedPoints.push({
          x: this.wristCenterX,
          y: this.wristCenterY + 22,
          time: now + 50,
        });
        this.recordedPoints.push({
          x: this.wristCenterX,
          y: this.wristCenterY + 55,
          time: now + 100,
        });
        break;
      }
      case TyingStage.TILAK_BLESSED: {
        audio.playMandirGhanti();
        audio.playShankh();
        this.vibrate([40, 60, 40]);
        this.recordedPoints.push({
          x: this.wristCenterX,
          y: this.wristCenterY,
          time: now + 50,
        });
        break;
      }
    }
  }

  /**
   * Handle user dragging the left thread or right thread
   */
  public updateDragHandle(handle: 'left' | 'right', x: number, y: number): void {
    if (this.stage >= TyingStage.DOUBLE_KNOT) return;

    if (handle === 'left') {
      this.leftHandle = { x, y };
    } else {
      this.rightHandle = { x, y };
    }

    const now = performance.now();
    this.recordedPoints.push({ x, y, time: now });

    // Check distance between handles or distance from center
    const distToCenterL = Math.hypot(this.leftHandle.x - this.wristCenterX, this.leftHandle.y - this.wristCenterY);
    const distToCenterR = Math.hypot(this.rightHandle.x - this.wristCenterX, this.rightHandle.y - this.wristCenterY);
    const handlesDist = Math.hypot(this.leftHandle.x - this.rightHandle.x, this.leftHandle.y - this.rightHandle.y);

    // Auto-advance stages based on physical drag positions
    if (this.stage === TyingStage.PLACED) {
      if (this.leftHandle.y > this.wristCenterY + 15 || this.rightHandle.y > this.wristCenterY + 15) {
        this.advanceToStage(TyingStage.WRAPPING);
      }
    } else if (this.stage === TyingStage.WRAPPING) {
      if (handlesDist < 35 && (this.leftHandle.y > this.wristCenterY || this.rightHandle.y > this.wristCenterY)) {
        this.advanceToStage(TyingStage.FIRST_KNOT);
      }
    } else if (this.stage === TyingStage.FIRST_KNOT) {
      if (this.leftHandle.y > this.wristCenterY + 40 || this.rightHandle.y > this.wristCenterY + 40) {
        this.advanceToStage(TyingStage.DOUBLE_KNOT);
      }
    }
  }

  /**
   * Update dangling tassel physics simulation
   */
  public stepPhysics(): void {
    if (this.stage < TyingStage.FIRST_KNOT) return;

    const leadLX = this.stage >= TyingStage.DOUBLE_KNOT ? this.wristCenterX - 12 : this.leftHandle.x;
    const leadLY = this.stage >= TyingStage.DOUBLE_KNOT ? this.wristCenterY + 24 : this.leftHandle.y;

    const leadRX = this.stage >= TyingStage.DOUBLE_KNOT ? this.wristCenterX + 12 : this.rightHandle.x;
    const leadRY = this.stage >= TyingStage.DOUBLE_KNOT ? this.wristCenterY + 24 : this.rightHandle.y;

    this.updateSingleChain(this.leftTasselParticles, leadLX, leadLY);
    this.updateSingleChain(this.rightTasselParticles, leadRX, leadRY);
  }

  private updateSingleChain(chain: Particle[], targetX: number, targetY: number): void {
    if (chain.length === 0) return;
    chain[0].x = targetX;
    chain[0].y = targetY;

    for (let i = 1; i < chain.length; i++) {
      const prev = chain[i - 1];
      const curr = chain[i];
      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      const dist = Math.hypot(dx, dy) || 1;
      const targetDist = 8;

      if (dist > targetDist) {
        const force = (dist - targetDist) * 0.4;
        curr.vx += (dx / dist) * force;
        curr.vy += (dy / dist) * force;
      }

      // Gravity & air damping
      curr.vy += 0.2;
      curr.vx *= 0.85;
      curr.vy *= 0.85;

      curr.x += curr.vx;
      curr.y += curr.vy;
    }
  }

  private vibrate(pattern: number[]): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }
}

/**
 * Generate Authentic SVG Silk & Zari Thread Artwork for the current Tying Stage
 */
export function renderSacredTyingLayerSVG(
  engine: RakhiTyingEngine,
  config: RakhiConfig,
  isTiedFully: boolean = false
): string {
  const cx = engine.wristCenterX; // 210
  const cy = engine.wristCenterY; // 160
  const dori = DORIS[config.d % DORIS.length] || DORIS[0];
  const palette = PALETTES[config.p?.[0] % PALETTES.length] || PALETTES[0];
  const primaryColor = dori.colors[0] || '#B4271F';
  const zariGold = dori.colors[1] || '#DFA327';
  const secondaryColor = dori.colors[2] || '#7C1E13';

  const stage = isTiedFully ? TyingStage.TILAK_BLESSED : engine.stage;

  // 1. UNDER-WRIST CORDS (Doris passing beneath forearm)
  let underWristSvg = '';
  if (stage >= TyingStage.WRAPPING) {
    underWristSvg = `
      <!-- Under-wrist braided cords with depth shadow -->
      <g id="under-wrist-cords" opacity="0.95">
        <!-- Shadow beneath the arm -->
        <ellipse cx="${cx}" cy="${cy}" rx="26" ry="46" fill="none" stroke="#231C17" stroke-width="6" opacity="0.25" />
        <!-- Main red silk loop hugging wrist curves -->
        <ellipse cx="${cx}" cy="${cy}" rx="25" ry="45" fill="none" stroke="${primaryColor}" stroke-width="4.5" stroke-linecap="round" />
        <!-- Zari gold spiral thread -->
        <ellipse cx="${cx}" cy="${cy}" rx="25" ry="45" fill="none" stroke="${zariGold}" stroke-width="2" stroke-dasharray="6,4" />
        <!-- Second reinforcing coil if knotted -->
        ${
          stage >= TyingStage.FIRST_KNOT
            ? `
              <ellipse cx="${cx + 2}" cy="${cy}" rx="27" ry="47" fill="none" stroke="${secondaryColor}" stroke-width="3.5" />
              <ellipse cx="${cx - 2}" cy="${cy}" rx="23" ry="43" fill="none" stroke="${zariGold}" stroke-width="1.8" stroke-dasharray="4,3" />
            `
            : ''
        }
      </g>
    `;
  }

  // 2. ACTIVE DRAGGING STRANDS / EXTENDED DORIS
  let activeDoriSvg = '';
  if (stage === TyingStage.PLACED) {
    // Doris resting out to the left and right across the wrist
    const lh = engine.leftHandle;
    const rh = engine.rightHandle;
    activeDoriSvg = `
      <!-- Left Dori Strand -->
      <path d="M ${cx - 30} ${cy} Q ${lh.x + 20} ${lh.y + 10}, ${lh.x} ${lh.y}" fill="none" stroke="${primaryColor}" stroke-width="4" stroke-linecap="round" />
      <path d="M ${cx - 30} ${cy} Q ${lh.x + 20} ${lh.y + 10}, ${lh.x} ${lh.y}" fill="none" stroke="${zariGold}" stroke-width="2" stroke-dasharray="5,3" />
      
      <!-- Right Dori Strand -->
      <path d="M ${cx + 30} ${cy} Q ${rh.x - 20} ${rh.y + 10}, ${rh.x} ${rh.y}" fill="none" stroke="${primaryColor}" stroke-width="4" stroke-linecap="round" />
      <path d="M ${cx + 30} ${cy} Q ${rh.x - 20} ${rh.y + 10}, ${rh.x} ${rh.y}" fill="none" stroke="${zariGold}" stroke-width="2" stroke-dasharray="5,3" />
      
      <!-- Golden bell beads at ends -->
      <circle cx="${lh.x}" cy="${lh.y}" r="6" fill="${zariGold}" stroke="#231C17" stroke-width="1.5" />
      <circle cx="${rh.x}" cy="${rh.y}" r="6" fill="${zariGold}" stroke="#231C17" stroke-width="1.5" />
    `;
  } else if (stage === TyingStage.WRAPPING) {
    const lh = engine.leftHandle;
    const rh = engine.rightHandle;
    activeDoriSvg = `
      <!-- Left dori wrapping under and crossing -->
      <path d="M ${cx - 24} ${cy + 40} Q ${cx - 10} ${cy + 48}, ${lh.x} ${lh.y}" fill="none" stroke="${primaryColor}" stroke-width="4" stroke-linecap="round" />
      <path d="M ${cx - 24} ${cy + 40} Q ${cx - 10} ${cy + 48}, ${lh.x} ${lh.y}" fill="none" stroke="${zariGold}" stroke-width="2" stroke-dasharray="4,3" />

      <!-- Right dori wrapping under and crossing -->
      <path d="M ${cx + 24} ${cy + 40} Q ${cx + 10} ${cy + 48}, ${rh.x} ${rh.y}" fill="none" stroke="${primaryColor}" stroke-width="4" stroke-linecap="round" />
      <path d="M ${cx + 24} ${cy + 40} Q ${cx + 10} ${cy + 48}, ${rh.x} ${rh.y}" fill="none" stroke="${zariGold}" stroke-width="2" stroke-dasharray="4,3" />

      <!-- Golden bead tips -->
      <circle cx="${lh.x}" cy="${lh.y}" r="6" fill="${zariGold}" stroke="#231C17" stroke-width="1.5" />
      <circle cx="${rh.x}" cy="${rh.y}" r="6" fill="${zariGold}" stroke="#231C17" stroke-width="1.5" />
    `;
  }

  // 3. SACRED KNOT & SWAYING TASSELS (Double Knot & Beyond)
  let knotSvg = '';
  if (stage >= TyingStage.FIRST_KNOT) {
    // Interlocking sacred knot geometry at bottom of wrist
    const knotY = cy + 22;
    knotSvg = `
      <g id="sacred-cinched-knot">
        <!-- Interlocking Knot Loop Body -->
        <ellipse cx="${cx - 5}" cy="${knotY}" rx="9" ry="6" fill="${primaryColor}" stroke="#231C17" stroke-width="1.5" transform="rotate(-15 ${cx - 5} ${knotY})" />
        <ellipse cx="${cx + 5}" cy="${knotY}" rx="9" ry="6" fill="${secondaryColor}" stroke="#231C17" stroke-width="1.5" transform="rotate(15 ${cx + 5} ${knotY})" />
        <circle cx="${cx}" cy="${knotY}" r="7" fill="${zariGold}" stroke="#231C17" stroke-width="1.8" />
        <circle cx="${cx}" cy="${knotY}" r="3" fill="${primaryColor}" />

        ${
          stage >= TyingStage.DOUBLE_KNOT
            ? `
              <!-- Double Lock Knot Bow Wings -->
              <path d="M ${cx} ${knotY} C ${cx - 28} ${knotY - 8}, ${cx - 28} ${knotY + 18}, ${cx} ${knotY + 4}" fill="${primaryColor}" stroke="#231C17" stroke-width="1.5" />
              <path d="M ${cx} ${knotY} C ${cx + 28} ${knotY - 8}, ${cx + 28} ${knotY + 18}, ${cx} ${knotY + 4}" fill="${secondaryColor}" stroke="#231C17" stroke-width="1.5" />
              <circle cx="${cx}" cy="${knotY + 4}" r="5" fill="${zariGold}" stroke="#231C17" stroke-width="1.5" />
            `
            : ''
        }
      </g>
    `;
  }

  // 4. DANGLING SILK LATKAN TASSELS (Physics-driven chains)
  let tasselsSvg = '';
  if (stage >= TyingStage.DOUBLE_KNOT) {
    const leftPoints = engine.leftTasselParticles;
    const rightPoints = engine.rightTasselParticles;

    const renderChain = (particles: Particle[], color: string) => {
      if (particles.length === 0) return '';
      const pathD = particles.reduce((acc, p, idx) => {
        return idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }, '');
      const tip = particles[particles.length - 1];

      return `
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <path d="${pathD}" fill="none" stroke="${zariGold}" stroke-width="1.2" stroke-dasharray="3,3" />
        <!-- Latkan bead & golden cone fringe -->
        <g transform="translate(${tip.x.toFixed(1)}, ${tip.y.toFixed(1)})">
          <circle cx="0" cy="0" r="4.5" fill="${zariGold}" stroke="#231C17" stroke-width="1" />
          <circle cx="0" cy="5" r="3" fill="${color}" />
          <!-- Silk thread fringe -->
          <line x1="-3" y1="7" x2="-5" y2="18" stroke="${color}" stroke-width="1.5" />
          <line x1="0" y1="7" x2="0" y2="20" stroke="${zariGold}" stroke-width="1.5" />
          <line x1="3" y1="7" x2="5" y2="18" stroke="${color}" stroke-width="1.5" />
        </g>
      `;
    };

    tasselsSvg = `
      <g id="dangling-latkans">
        ${renderChain(leftPoints, primaryColor)}
        ${renderChain(rightPoints, secondaryColor)}
      </g>
    `;
  }

  return `
    <g id="sacred-tying-ritual-layer">
      ${underWristSvg}
      ${activeDoriSvg}
      ${knotSvg}
      ${tasselsSvg}
    </g>
  `;
}
