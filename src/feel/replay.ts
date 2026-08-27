import { GesturePoint } from '../types';
import { audio } from '../core/audio';

export interface ReplayState {
  currentPointIndex: number;
  currentX: number;
  currentY: number;
  isPlaying: boolean;
  isComplete: boolean;
  speedMultiplier: number;
}

/**
 * Replays authentic tying gestures and letter typing cadence
 */
export class GestureReplayEngine {
  private points: GesturePoint[] = [];
  private bounds: { width: number; height: number; left: number; top: number };
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isComplete: boolean = false;
  private speedMultiplier: number = 1.0;
  private timer: number | null = null;
  private onUpdateCallback?: (point: { x: number; y: number; progress: number; isComplete: boolean }) => void;

  constructor(
    points: GesturePoint[],
    bounds: { width: number; height: number; left: number; top: number }
  ) {
    this.points = points || [];
    this.bounds = bounds;
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  public start(onUpdate: (point: { x: number; y: number; progress: number; isComplete: boolean }) => void): void {
    this.stop();
    this.onUpdateCallback = onUpdate;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.isComplete = false;

    if (this.points.length === 0) {
      this.isComplete = true;
      this.isPlaying = false;
      onUpdate({ x: this.bounds.width / 2, y: this.bounds.height / 2, progress: 1, isComplete: true });
      return;
    }

    this.step();
  }

  private step = (): void => {
    if (!this.isPlaying) return;

    if (this.currentIndex >= this.points.length) {
      this.isComplete = true;
      this.isPlaying = false;
      audio.playKnot();
      if (this.onUpdateCallback) {
        const lastPt = this.points[this.points.length - 1];
        const screenX = (lastPt[0] / 1023) * this.bounds.width;
        const screenY = (lastPt[1] / 1023) * this.bounds.height;
        this.onUpdateCallback({ x: screenX, y: screenY, progress: 1, isComplete: true });
      }
      return;
    }

    const pt = this.points[this.currentIndex];
    const screenX = (pt[0] / 1023) * this.bounds.width;
    const screenY = (pt[1] / 1023) * this.bounds.height;
    const dt = Math.max(12, pt[2] * 16) / this.speedMultiplier;

    if (this.currentIndex % 14 === 0) {
      audio.playGhungroo();
    }

    if (this.onUpdateCallback) {
      this.onUpdateCallback({
        x: screenX,
        y: screenY,
        progress: (this.currentIndex + 1) / this.points.length,
        isComplete: false,
      });
    }

    this.currentIndex++;
    this.timer = window.setTimeout(this.step, dt);
  };

  public stop(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
