import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

export const Ambient3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });
  const sparklesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(223, 163, 39, ',  // Haldi Gold #DFA327
      'rgba(180, 39, 31, ',   // Kumkum Crimson #B4271F
      'rgba(255, 235, 150, ', // Zari Bright Gold
      'rgba(192, 96, 42, ',   // Gerua Amber #C0602A
      'rgba(241, 227, 203, ', // Chandan Cream
    ];

    const count = Math.min(50, Math.floor((width * height) / 24000));
    const particles: Particle[] = Array.from({ length: count }, () => {
      const z = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        vx: (Math.random() - 0.5) * (0.25 + z * 0.4),
        vy: -0.2 - Math.random() * (0.35 + z * 0.45),
        size: 1.2 + z * 2.8,
        alpha: 0.2 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.015 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouseRef.current.targetX = clientX / width;
      mouseRef.current.targetY = clientY / height;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 2.5;
        sparklesRef.current.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);

    let t = 0;

    const render = () => {
      t += 0.02;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const mx = (mouseRef.current.x - 0.5) * 40;
      const my = (mouseRef.current.y - 0.5) * 30;

      // Dynamic Diya Warmth Spotlight
      const diyaX = mouseRef.current.x * width;
      const diyaY = mouseRef.current.y * height;
      const diyaRadius = Math.max(width, height) * 0.4;
      const diyaGlow = ctx.createRadialGradient(diyaX, diyaY, 0, diyaX, diyaY, diyaRadius);
      diyaGlow.addColorStop(0, 'rgba(255, 215, 100, 0.08)');
      diyaGlow.addColorStop(0.4, 'rgba(223, 163, 39, 0.03)');
      diyaGlow.addColorStop(1, 'rgba(241, 227, 203, 0)');

      ctx.fillStyle = diyaGlow;
      ctx.fillRect(0, 0, width, height);

      // 3D Particles with Parallax
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(t + p.pulsePhase) * 0.2;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        const renderX = p.x + mx * (0.2 + p.z * 0.8);
        const renderY = p.y + my * (0.2 + p.z * 0.8);

        const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulsePhase) * 0.4) * (0.4 + p.z * 0.6);
        const renderSize = p.size * (0.8 + Math.sin(p.pulsePhase * 0.8) * 0.2);

        ctx.beginPath();
        ctx.arc(renderX, renderY, renderSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(renderX, renderY, renderSize, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.fill();
      }

      // Render Click Sparkles
      for (let i = sparklesRef.current.length - 1; i >= 0; i--) {
        const s = sparklesRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.06;
        s.vx *= 0.96;
        s.life -= 0.03;

        if (s.life <= 0) {
          sparklesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5 * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.life})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none opacity-90 transition-opacity"
      aria-hidden="true"
    />
  );
};
