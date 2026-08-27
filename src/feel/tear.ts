import { audio } from '../core/audio';

export interface TearPoint {
  x: number;
  y: number;
  fibers: { len: number; angle: number }[];
}

/**
 * Canvas Paper-Tear Simulation with realistic fibrous rip
 */
export class PaperTearSimulator {
  public tearPoints: TearPoint[] = [];
  public isTorn: boolean = false;
  public width: number;
  public height: number;

  constructor(width: number = 320, height: number = 220) {
    this.width = width;
    this.height = height;
  }

  public reset(): void {
    this.tearPoints = [];
    this.isTorn = false;
  }

  public addPoint(x: number, y: number, velocity: number = 1): void {
    if (this.isTorn) return;

    // Generate small fibrous tears
    const fiberCount = Math.floor(Math.random() * 4) + 2;
    const fibers = [];
    for (let i = 0; i < fiberCount; i++) {
      fibers.push({
        len: Math.random() * 5 + 2,
        angle: Math.random() * Math.PI * 2,
      });
    }

    this.tearPoints.push({ x, y, fibers });
    audio.playTear(Math.min(2, velocity));

    // Check if tear completed edge-to-edge
    if (this.tearPoints.length > 12) {
      const minX = Math.min(...this.tearPoints.map(p => p.x));
      const maxX = Math.max(...this.tearPoints.map(p => p.x));
      if (maxX - minX > this.width * 0.75) {
        this.isTorn = true;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.tearPoints.length < 2) return;

    ctx.save();
    ctx.strokeStyle = '#231C17';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(this.tearPoints[0].x, this.tearPoints[0].y);
    for (let i = 1; i < this.tearPoints.length; i++) {
      ctx.lineTo(this.tearPoints[i].x, this.tearPoints[i].y);
    }
    ctx.stroke();

    // Render tiny paper fibers along the rip
    ctx.strokeStyle = '#DCC9A6';
    ctx.lineWidth = 1.2;
    for (const pt of this.tearPoints) {
      for (const fib of pt.fibers) {
        const fx = pt.x + Math.cos(fib.angle) * fib.len;
        const fy = pt.y + Math.sin(fib.angle) * fib.len;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(fx, fy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
