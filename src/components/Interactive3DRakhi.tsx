import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RakhiConfig } from '../types';
import { DORIS, CENTREPIECES, PALETTES, LATKANS } from '../data/materials';
import { generateSanjhiJaali } from '../art/rakhi';
import { Mulberry32, seedToRakhiId } from '../core/prng';
import { audio } from '../core/audio';
import {
  Sparkles,
  Rotate3d,
  Layers,
  Compass,
  Sun,
  Moon,
  Flame,
  Maximize2,
  Minimize2,
  Volume2,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface Interactive3DRakhiProps {
  config: RakhiConfig;
  size?: number;
  className?: string;
  allowExplodedView?: boolean;
  interactiveMode?: boolean;
  onExplodeChange?: (exploded: boolean) => void;
  lang?: 'hi' | 'en';
}

type LightAtmosphere = 'diya' | 'moonlight' | 'darbar' | 'sunlight';

export const Interactive3DRakhi: React.FC<Interactive3DRakhiProps> = ({
  config,
  size = 280,
  className = '',
  allowExplodedView = true,
  interactiveMode = true,
  onExplodeChange,
  lang = 'hi',
}) => {
  // 3D Angles
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [rotZ, setRotZ] = useState<number>(0);

  // Interaction & Orbit
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [explodeSpacing, setExplodeSpacing] = useState<number>(35);
  const [autoFloat, setAutoFloat] = useState<boolean>(true);
  const [lightAtmosphere, setLightAtmosphere] = useState<LightAtmosphere>('diya');
  const [hasGyro, setHasGyro] = useState<boolean>(false);
  const [gyroActive, setGyroActive] = useState<boolean>(false);

  // Physics for swinging latkans
  const [tasselSway, setTasselSway] = useState<number>(0);

  // Refs for smooth animation loop
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 0,
    rotY: 0,
  });
  const targetRotRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const currentRotRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const animFrameRef = useRef<number | null>(null);
  const lastChimeTimeRef = useRef<number>(0);

  // Derived Material Data
  const dori = useMemo(() => DORIS[config.d % DORIS.length] || DORIS[0], [config.d]);
  const palette = useMemo(() => PALETTES[config.p?.[0] % PALETTES.length] || PALETTES[0], [config.p]);
  const colors = palette.colors;
  const centreId = config.c % CENTREPIECES.length;
  const jaaliFolds = config.j || 8;
  const jaaliDepth = config.n || 3;
  const rakhiId = useMemo(() => seedToRakhiId(config.s || 108), [config.s]);

  // Lighting parameters based on atmosphere
  const lightColors = useMemo(() => {
    switch (lightAtmosphere) {
      case 'diya':
        return {
          glow: 'rgba(255, 175, 40, 0.45)',
          specular: 'rgba(255, 235, 170, 0.85)',
          ambient: '#432612',
          bgHighlight: 'radial-gradient(circle at center, rgba(255, 190, 80, 0.22) 0%, transparent 70%)',
          rim: '#FFAA33',
        };
      case 'moonlight':
        return {
          glow: 'rgba(160, 210, 255, 0.4)',
          specular: 'rgba(240, 250, 255, 0.95)',
          ambient: '#1A2433',
          bgHighlight: 'radial-gradient(circle at center, rgba(180, 220, 255, 0.2) 0%, transparent 70%)',
          rim: '#C5E0FF',
        };
      case 'darbar':
        return {
          glow: 'rgba(220, 38, 38, 0.4)',
          specular: 'rgba(255, 220, 120, 0.9)',
          ambient: '#351216',
          bgHighlight: 'radial-gradient(circle at center, rgba(220, 50, 50, 0.2) 0%, transparent 70%)',
          rim: '#FFD700',
        };
      case 'sunlight':
      default:
        return {
          glow: 'rgba(255, 240, 200, 0.35)',
          specular: 'rgba(255, 255, 255, 0.85)',
          ambient: '#2D241E',
          bgHighlight: 'radial-gradient(circle at center, rgba(255, 245, 220, 0.25) 0%, transparent 70%)',
          rim: '#FFE699',
        };
    }
  }, [lightAtmosphere]);

  // Calculate Specular Sheen gradient position based on 3D rotation
  const specularPos = useMemo(() => {
    const lightX = 50 + rotY * 1.6;
    const lightY = 50 - rotX * 1.6;
    return {
      x: Math.max(0, Math.min(100, lightX)),
      y: Math.max(0, Math.min(100, lightY)),
    };
  }, [rotX, rotY]);

  // Spring & Easing Physics Loop
  useEffect(() => {
    let t = 0;
    const loop = () => {
      t += 0.025;

      if (autoFloat && !isDragging && !gyroActive) {
        targetRotRef.current = {
          x: Math.sin(t * 0.9) * 10,
          y: Math.cos(t * 0.7) * 14,
          z: Math.sin(t * 0.5) * 3,
        };
      }

      // Smooth interpolation (Lerp factor 0.12)
      const k = 0.12;
      currentRotRef.current.x += (targetRotRef.current.x - currentRotRef.current.x) * k;
      currentRotRef.current.y += (targetRotRef.current.y - currentRotRef.current.y) * k;
      currentRotRef.current.z += (targetRotRef.current.z - currentRotRef.current.z) * k;

      setRotX(currentRotRef.current.x);
      setRotY(currentRotRef.current.y);
      setRotZ(currentRotRef.current.z);

      // Latkan pendulum physics (sways with horizontal tilt and acceleration)
      const targetSway = -currentRotRef.current.y * 0.85 + Math.sin(t * 1.8) * 2;
      setTasselSway((prev) => prev + (targetSway - prev) * 0.1);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoFloat, isDragging, gyroActive]);

  // Pointer Move (Mouse / Touch tilt)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactiveMode) return;
    setIsDragging(true);
    setAutoFloat(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: targetRotRef.current.x,
      rotY: targetRotRef.current.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactiveMode) return;

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Orbit rotation with gentle sensitivity
      const newRotY = dragStartRef.current.rotY + dx * 0.45;
      const newRotX = Math.max(-50, Math.min(50, dragStartRef.current.rotX - dy * 0.45));

      targetRotRef.current.x = newRotX;
      targetRotRef.current.y = newRotY;

      // Play soft tactile sound if rotating past thresholds
      const now = performance.now();
      if (Math.abs(dx) > 60 && now - lastChimeTimeRef.current > 450) {
        audio.playGhungroo();
        lastChimeTimeRef.current = now;
      }
    } else if (!gyroActive && containerRef.current) {
      // Hover hover-tilt when not dragging
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      targetRotRef.current.y = nx * 32;
      targetRotRef.current.x = -ny * 32;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactiveMode) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging && !gyroActive) {
      // Return to soft float
      targetRotRef.current = { x: 0, y: 0, z: 0 };
    }
  };

  // Device Gyroscope Support (Tilt phone to inspect)
  const enableGyroscope = async () => {
    if (typeof window === 'undefined') return;

    if (
      typeof (DeviceOrientationEvent as any) !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setGyroActive(true);
          setAutoFloat(false);
          window.addEventListener('deviceorientation', handleDeviceOrientation);
          audio.playMandirGhanti();
        }
      } catch (err) {
        console.warn('Gyro permission error:', err);
      }
    } else if ('ondeviceorientation' in window) {
      setGyroActive(true);
      setAutoFloat(false);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      audio.playMandirGhanti();
    }
  };

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    // gamma: left to right (-90 to 90)
    // beta: front to back (-180 to 180)
    const pitch = Math.max(-45, Math.min(45, (e.beta - 45) * 0.8));
    const roll = Math.max(-45, Math.min(45, e.gamma * 0.8));

    targetRotRef.current = {
      x: -pitch,
      y: roll,
      z: roll * 0.15,
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      setHasGyro(true);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [handleDeviceOrientation]);

  // Toggle Exploded 3D Layer View
  const toggleExploded = () => {
    const next = !isExploded;
    setIsExploded(next);
    onExplodeChange?.(next);
    audio.playSitar();
  };

  // Reset 3D View
  const handleReset3D = () => {
    targetRotRef.current = { x: 0, y: 0, z: 0 };
    currentRotRef.current = { x: 0, y: 0, z: 0 };
    setRotX(0);
    setRotY(0);
    setRotZ(0);
    setAutoFloat(true);
    setIsExploded(false);
    audio.playGhungroo();
  };

  // Exploded spacing multipliers for layers
  const zChowki = isExploded ? -explodeSpacing * 1.5 : -18;
  const zDori = isExploded ? -explodeSpacing * 0.5 : 0;
  const zFiligree = isExploded ? explodeSpacing * 0.6 : 14;
  const zCentre = isExploded ? explodeSpacing * 1.3 : 28;
  const zGem = isExploded ? explodeSpacing * 2.0 : 44;
  const zLatkan = isExploded ? explodeSpacing * 0.8 : 18;
  const zAura = isExploded ? explodeSpacing * 2.5 : 55;

  // Sanjhi SVG path
  const jaaliPath = useMemo(
    () => generateSanjhiJaali(jaaliFolds, jaaliDepth, config.s),
    [jaaliFolds, jaaliDepth, config.s]
  );

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex flex-col items-center justify-center ${className}`}
      style={{
        perspective: '1200px',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Dynamic Ambient Atmosphere Backdrop */}
      <div
        className="absolute inset-0 rounded-xs pointer-events-none transition-all duration-700"
        style={{
          background: lightColors.bgHighlight,
          boxShadow: `inset 0 0 60px ${lightColors.glow}`,
        }}
      />

      {/* 3D Scene Root Canvas */}
      <div
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75"
        style={{
          width: size,
          height: (size * 140) / 260 + 60,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`,
        }}
      >
        {/* Layer -2: Velvet Silk Chowki Cushion & Ambient Occlusion Shadow (Z: -18px / -55px) */}
        <div
          className="absolute rounded-full transition-all duration-300 pointer-events-none"
          style={{
            width: size * 0.65,
            height: size * 0.65,
            transform: `translateZ(${zChowki}px)`,
            transformStyle: 'preserve-3d',
            backgroundColor: '#1E1611',
            boxShadow: `0 18px 36px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(35, 28, 23, 0.6)`,
            border: `2px solid ${colors[0]}44`,
          }}
        >
          {/* Silk Weave Texture on Cushion */}
          <div
            className="w-full h-full rounded-full opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${colors[1]} 0px, ${colors[1]} 1px, transparent 0px, transparent 4px)`,
            }}
          />
        </div>

        {/* Layer -1: Braided Dori (Cords) Left & Right (Z: 0px / -15px) */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none"
          style={{
            transform: `translateZ(${zDori}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            viewBox="-130 -60 260 140"
            width={size}
            height={(size * 140) / 260}
            className="overflow-visible"
          >
            <filter id="dori-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#18120D" floodOpacity="0.5" />
            </filter>
            <g filter="url(#dori-shadow)">
              {/* Strand 1 */}
              <path
                d="M -35 0 C -55 -8, -75 8, -100 0"
                stroke={dori.colors[0]}
                strokeWidth="3.6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 35 0 C 55 -8, 75 8, 100 0"
                stroke={dori.colors[0]}
                strokeWidth="3.6"
                fill="none"
                strokeLinecap="round"
              />
              {/* Strand 2 (Zari Metallic highlight) */}
              <path
                d="M -35 0 C -55 8, -75 -8, -100 0"
                stroke={dori.colors[1] || '#DFA327'}
                strokeWidth="2.2"
                fill="none"
                strokeDasharray="4,2"
                strokeLinecap="round"
              />
              <path
                d="M 35 0 C 55 8, 75 -8, 100 0"
                stroke={dori.colors[1] || '#DFA327'}
                strokeWidth="2.2"
                fill="none"
                strokeDasharray="4,2"
                strokeLinecap="round"
              />
              {/* Tassel Ends */}
              <g transform="translate(-100, 0)">
                <line x1="0" y1="0" x2="-14" y2="-5" stroke={dori.colors[0]} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-18" y2="0" stroke={dori.colors[1] || dori.colors[0]} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-14" y2="5" stroke={dori.colors[2] || dori.colors[0]} strokeWidth="2" strokeLinecap="round" />
              </g>
              <g transform="translate(100, 0)">
                <line x1="0" y1="0" x2="14" y2="-5" stroke={dori.colors[0]} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="18" y2="0" stroke={dori.colors[1] || dori.colors[0]} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="0" x2="14" y2="5" stroke={dori.colors[2] || dori.colors[0]} strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        </div>

        {/* Layer 1: Sanjhi / Brass Filigree Base Petals (Z: +14px / +25px) */}
        <div
          className="absolute transition-all duration-300 pointer-events-none"
          style={{
            transform: `translateZ(${zFiligree}px)`,
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))',
          }}
        >
          <svg viewBox="-50 -50 100 100" width={size * 0.46} height={size * 0.46}>
            <defs>
              <radialGradient id="base-gold" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="50%" stopColor={colors[1]} />
                <stop offset="100%" stopColor={colors[0]} />
              </radialGradient>
            </defs>
            {/* Scalloped Filigree Petals */}
            <circle r="42" fill="url(#base-gold)" stroke="#231C17" strokeWidth="1.5" />
            <path
              d={jaaliPath}
              fill={colors[3]}
              fillRule="evenodd"
              stroke={colors[1]}
              strokeWidth="0.9"
              opacity="0.95"
            />
            {/* Beaded rim */}
            {Array.from({ length: 16 }).map((_, i) => {
              const ang = (i * Math.PI * 2) / 16;
              return (
                <circle
                  key={i}
                  cx={Math.cos(ang) * 39}
                  cy={Math.sin(ang) * 39}
                  r="2.2"
                  fill="#FFF7D6"
                  stroke="#4B2D19"
                  strokeWidth="0.8"
                />
              );
            })}
          </svg>
        </div>

        {/* Layer 2: Main Artisan Centerpiece Motif (Z: +28px / +48px) */}
        <div
          className="absolute transition-all duration-300 pointer-events-none"
          style={{
            transform: `translateZ(${zCentre}px)`,
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))',
          }}
        >
          <svg viewBox="-40 -40 80 80" width={size * 0.38} height={size * 0.38}>
            {/* Centerpiece Motifs */}
            {centreId === 0 && (
              <g>
                <circle r="28" fill={colors[0]} stroke={colors[1]} strokeWidth="2" />
                <path d={jaaliPath} fill={colors[3]} stroke={colors[1]} strokeWidth="0.8" />
              </g>
            )}
            {centreId === 1 && (
              <g stroke={colors[0]} strokeWidth="2.4" fill="none">
                <circle r="26" fill={colors[3]} stroke={colors[0]} strokeWidth="2" />
                <circle cx="0" cy="-10" r="5" />
                <circle cx="0" cy="10" r="5" />
                <circle cx="-10" cy="0" r="5" />
                <circle cx="10" cy="0" r="5" />
                <path d="M -10 -10 Q 0 0, 10 10 M -10 10 Q 0 0, 10 -10" />
              </g>
            )}
            {centreId === 2 && (
              <g>
                <circle r="26" fill={colors[3]} stroke={colors[0]} strokeWidth="2" />
                <circle r="10" fill={colors[1]} />
                {Array.from({ length: 16 }).map((_, i) => {
                  const rad = (i * Math.PI * 2) / 16;
                  return (
                    <line
                      key={i}
                      x1={Math.cos(rad) * 10}
                      y1={Math.sin(rad) * 10}
                      x2={Math.cos(rad) * 25}
                      y2={Math.sin(rad) * 25}
                      stroke={colors[0]}
                      strokeWidth="1.4"
                    />
                  );
                })}
              </g>
            )}
            {centreId === 4 && (
              /* Shisha Mirror Glass */
              <g>
                <circle r="28" fill={colors[0]} stroke={colors[1]} strokeWidth="2" />
                <circle r="20" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                {/* Mirror Glass Specular Glint */}
                <polygon
                  points="-12,-18 16,-18 6,18 -22,18"
                  fill="#FFFFFF"
                  opacity="0.65"
                  style={{ mixBlendMode: 'overlay' }}
                />
              </g>
            )}
            {centreId === 5 && (
              /* Zardozi Metallic Coil */
              <g>
                <circle r="27" fill={colors[0]} stroke={colors[1]} strokeWidth="2" />
                <path
                  d="M 0 0 Q 7 -8, 14 0 T 0 16 T -16 0 T 0 -19 T 19 0"
                  fill="none"
                  stroke={colors[1]}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </g>
            )}
            {centreId === 11 && (
              /* Nazar Protection Ward (Evil Eye) */
              <g>
                <circle r="27" fill="#1E3A8A" />
                <circle r="19" fill="#F8FAFC" />
                <circle r="11" fill="#3B82F6" />
                <circle r="5" fill="#0F172A" />
                <circle cx="2" cy="-2" r="2" fill="#FFFFFF" />
              </g>
            )}
            {centreId === 14 && (
              /* Sacred ॐ Om Mark */
              <g>
                <circle r="27" fill={colors[0]} stroke={colors[1]} strokeWidth="2" />
                <circle r="22" fill={colors[3]} />
                <text
                  x="0"
                  y="7"
                  fontFamily="'Martel', serif"
                  fontSize="20"
                  fontWeight="700"
                  fill={colors[0]}
                  textAnchor="middle"
                >
                  ॐ
                </text>
              </g>
            )}
            {/* Fallback for other motifs */}
            {![0, 1, 2, 4, 5, 11, 14].includes(centreId) && (
              <g>
                <circle r="27" fill={colors[3]} stroke={colors[0]} strokeWidth="2.2" />
                <circle r="16" fill={colors[0]} />
                <circle r="8" fill={colors[1]} stroke={colors[2]} strokeWidth="1.5" />
              </g>
            )}
          </svg>
        </div>

        {/* Layer 3: Kundan Gemstone & Polished Cabochon Lens (Z: +44px / +70px) */}
        <div
          className="absolute transition-all duration-300 pointer-events-none"
          style={{
            transform: `translateZ(${zGem}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center relative shadow-lg"
            style={{
              backgroundColor: colors[2] || '#B4271F',
              boxShadow: `0 4px 10px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.5)`,
              border: `2px solid ${colors[1] || '#DFA327'}`,
            }}
          >
            {/* Gemstone Facet Highlight */}
            <div className="w-2 h-2 rounded-full bg-white/80 absolute top-1 left-1.5 filter blur-[0.5px]" />
          </div>
        </div>

        {/* Layer 4: 3D Latkan Tassels with Physical Pendulum Sway (Z: +18px) */}
        {(config.h || []).length > 0 && (
          <div
            className="absolute top-[56%] transition-all duration-300 pointer-events-none"
            style={{
              transform: `translateZ(${zLatkan}px) rotate(${tasselSway.toFixed(1)}deg)`,
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))',
            }}
          >
            <svg viewBox="-40 0 80 80" width={size * 0.35} height={size * 0.35}>
              {(config.h || []).map((_, idx) => {
                const spacing = 14;
                const startX = -(((config.h || []).length - 1) * spacing) / 2;
                const hx = startX + idx * spacing;
                const length = 28 + (idx % 2) * 6;
                return (
                  <g key={idx} transform={`translate(${hx}, 0)`}>
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2={length}
                      stroke={colors[1]}
                      strokeWidth="2"
                      strokeDasharray="2,2"
                    />
                    <circle cx="0" cy={length} r="5" fill={colors[0]} stroke={colors[1]} strokeWidth="1" />
                    <circle cx="0" cy={length} r="2.5" fill="#FFF2B2" />
                    <polygon points={`-3,${length + 4} 3,${length + 4} 0,${length + 10}`} fill={colors[1]} />
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Layer 5: Dynamic 3D Specular Shimmer Ray & Gold Dust Aura (Z: +55px / +90px) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full transition-all duration-75"
          style={{
            transform: `translateZ(${zAura}px)`,
            transformStyle: 'preserve-3d',
            background: `radial-gradient(ellipse at ${specularPos.x}% ${specularPos.y}%, ${lightColors.specular} 0%, rgba(255, 215, 0, 0.25) 25%, transparent 65%)`,
            mixBlendMode: 'color-dodge',
            opacity: isDragging ? 0.95 : 0.75,
          }}
        />

        {/* Sparkling Glint Star */}
        <div
          className="absolute w-4 h-4 pointer-events-none transition-all duration-100"
          style={{
            top: `${Math.max(20, Math.min(80, specularPos.y))}%`,
            left: `${Math.max(20, Math.min(80, specularPos.x))}%`,
            transform: `translate(-50%, -50%) translateZ(${zAura + 5}px) scale(${isDragging ? 1.3 : 1.0})`,
          }}
        >
          <Sparkles className="w-full h-full text-yellow-200 drop-shadow-[0_0_8px_rgba(255,235,120,0.9)] animate-pulse" />
        </div>
      </div>

      {/* Interactive 3D Control Bar */}
      {interactiveMode && (
        <div className="w-full max-w-[340px] mt-4 pt-3 border-t border-[#231C17]/15 flex flex-col gap-2.5 z-20">
          {/* Top Row Controls: Gyro, Explode, Reset, Light */}
          <div className="flex items-center justify-between text-xs font-serif">
            {/* Atmosphere Selector */}
            <div className="flex items-center gap-1 bg-[#F1E3CB] p-1 rounded-xs border border-[#231C17]/20">
              <button
                type="button"
                onClick={() => setLightAtmosphere('diya')}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  lightAtmosphere === 'diya' ? 'bg-[#B4271F] text-white' : 'text-[#7A5030] hover:text-[#231C17]'
                }`}
                title={lang === 'hi' ? 'दीया की रोशनी' : 'Diya Glow'}
                id="3d-light-diya"
              >
                <Flame className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLightAtmosphere('moonlight')}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  lightAtmosphere === 'moonlight' ? 'bg-[#22364E] text-white' : 'text-[#7A5030] hover:text-[#231C17]'
                }`}
                title={lang === 'hi' ? 'पूर्णिमा चंद्र' : 'Moonlight'}
                id="3d-light-moon"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLightAtmosphere('darbar')}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  lightAtmosphere === 'darbar' ? 'bg-[#7C1E13] text-white' : 'text-[#7A5030] hover:text-[#231C17]'
                }`}
                title={lang === 'hi' ? 'राज दरबार' : 'Royal Darbar'}
                id="3d-light-darbar"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLightAtmosphere('sunlight')}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  lightAtmosphere === 'sunlight' ? 'bg-[#DFA327] text-[#231C17]' : 'text-[#7A5030] hover:text-[#231C17]'
                }`}
                title={lang === 'hi' ? 'प्रातः धूप' : 'Sunlight'}
                id="3d-light-sun"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons: Gyro & 3D Layer Explode */}
            <div className="flex items-center gap-1.5">
              {hasGyro && (
                <button
                  type="button"
                  onClick={enableGyroscope}
                  className={`min-h-[32px] px-2 py-1 border rounded-xs font-serif text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    gyroActive
                      ? 'bg-[#5F6E36] text-white border-[#5F6E36]'
                      : 'bg-[#FBF6EA] border-[#231C17]/30 text-[#231C17] hover:bg-[#F1E3CB]'
                  }`}
                  title={lang === 'hi' ? 'फोन घुमाकर देखें (Gyroscope)' : 'Tilt Phone'}
                  id="3d-gyro-btn"
                >
                  <Compass className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'गायरो' : 'Gyro'}</span>
                </button>
              )}

              {allowExplodedView && (
                <button
                  type="button"
                  onClick={toggleExploded}
                  className={`min-h-[32px] px-2 py-1 border rounded-xs font-serif text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    isExploded
                      ? 'bg-[#B4271F] text-white border-[#B4271F]'
                      : 'bg-[#FBF6EA] border-[#231C17]/30 text-[#231C17] hover:bg-[#F1E3CB]'
                  }`}
                  title={lang === 'hi' ? 'परतें अलग करके देखें (3D Exploded Layers)' : 'Explode 3D Layers'}
                  id="3d-explode-btn"
                >
                  <Layers className="w-3 h-3" />
                  <span>{isExploded ? (lang === 'hi' ? 'एकत्र' : 'Collapse') : lang === 'hi' ? 'परतें' : 'Layers'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset3D}
                className="min-h-[32px] p-1.5 bg-[#FBF6EA] border border-[#231C17]/30 hover:bg-[#F1E3CB] text-[#231C17] rounded-xs cursor-pointer"
                title={lang === 'hi' ? 'पुनः केंद्र करें' : 'Reset View'}
                id="3d-reset-btn"
              >
                <Rotate3d className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Explode Distance Slider when exploded */}
          {isExploded && (
            <div className="p-2 bg-[#F1E3CB]/90 border border-[#231C17]/20 rounded-xs space-y-1 text-[11px] font-serif">
              <div className="flex items-center justify-between text-[#7A5030]">
                <span>{lang === 'hi' ? '3D परतों की दूरी (Layer Depth):' : '3D Layer Depth:'}</span>
                <span className="font-mono text-[#B4271F] font-bold">{explodeSpacing}px</span>
              </div>
              <input
                type="range"
                min="15"
                max="65"
                value={explodeSpacing}
                onChange={(e) => setExplodeSpacing(Number(e.target.value))}
                className="w-full accent-[#B4271F] cursor-pointer"
                id="3d-depth-slider"
              />
              <div className="flex justify-between text-[9px] text-[#231C17]/60 font-mono">
                <span>चौकी</span>
                <span>डोर</span>
                <span>सांझी</span>
                <span>कुंदन</span>
              </div>
            </div>
          )}

          {/* Hint */}
          <p className="text-[10px] text-center text-[#7A5030] font-serif italic">
            {lang === 'hi'
              ? 'उंगली या माउस से घुमाएं — 3D प्रकाश, धातु की चमक व लटकन का कंपन देखें'
              : 'Drag to orbit in 3D — observe dynamic gold shimmer, layer depth & pendulum physics'}
          </p>
        </div>
      )}
    </div>
  );
};
