export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  type: 'rice' | 'crumb' | 'petal';
  color: string;
  size: number;
  settled: boolean;
  bounces: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public width: number = 360;
  public height: number = 300;

  constructor(width: number = 360, height: number = 300) {
    this.width = width;
    this.height = height;
  }

  public clear(): void {
    this.particles = [];
  }

  /** Scatter Akshat rice grains with natural scatter physics */
  public spawnAkshat(originX: number, originY: number, count: number = 24): void {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = Math.random() * 5 + 3;
      this.particles.push({
        x: originX + (Math.random() - 0.5) * 12,
        y: originY + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        type: 'rice',
        color: '#FFFDF8',
        size: 3.5,
        settled: false,
        bounces: 0,
      });
    }
  }

  /** Scatter sweet crumbs */
  public spawnCrumbs(originX: number, originY: number, color: string = '#DFA327', count: number = 14): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: originX + (Math.random() - 0.5) * 16,
        y: originY + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 - 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        type: 'crumb',
        color,
        size: Math.random() * 2.5 + 1.2,
        settled: false,
        bounces: 0,
      });
    }
  }

  /** Update physics */
  public update(): void {
    const floorY = this.height - 25;

    for (const p of this.particles) {
      if (p.settled) continue;

      p.vy += 0.22; // Gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      // Floor collision
      if (p.y >= floorY) {
        p.y = floorY;
        p.bounces++;
        if (p.bounces < 2) {
          p.vy = -p.vy * 0.35;
          p.vx *= 0.6;
        } else {
          p.settled = true;
          p.vx = 0;
          p.vy = 0;
        }
      }
    }
  }

  /** Render to 2D Canvas */
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'rice') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#DCC9A6';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'crumb') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }
}
