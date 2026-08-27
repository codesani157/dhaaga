import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { RakhiConfig, GesturePoint } from '../types';
import { renderWristSVG } from '../art/wrist';
import { renderRakhiSVG } from '../art/rakhi';
import { RakhiTyingEngine, TyingStage, renderSacredTyingLayerSVG } from '../feel/rope';
import { quantizeGesture } from '../core/codec';
import { SKIN_TONES, SLEEVE_STYLES } from '../data/materials';
import { audio } from '../core/audio';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  Zap,
  Flame,
  Heart,
} from 'lucide-react';

interface BandhanViewProps {
  rakhiConfig: RakhiConfig;
  wristSkin: number;
  wristSleeve: number;
  isMemorial?: boolean;
  isLumba?: boolean;
  recordedGesture?: GesturePoint[];
  onChangeWristStyle: (skin: number, sleeve: number) => void;
  onSaveGesture: (gesture: GesturePoint[]) => void;
  onNext: () => void;
  onBack: () => void;
  lang: 'hi' | 'en';
}

interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  color: string;
}

export const BandhanView: React.FC<BandhanViewProps> = ({
  rakhiConfig,
  wristSkin,
  wristSleeve,
  isMemorial = false,
  isLumba = false,
  onChangeWristStyle,
  onSaveGesture,
  onNext,
  onBack,
  lang,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RakhiTyingEngine | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [currentStage, setCurrentStage] = useState<TyingStage>(TyingStage.PLACED);
  const [isTied, setIsTied] = useState<boolean>(false);
  const [tilakApplied, setTilakApplied] = useState<boolean>(false);
  const [activeDragHandle, setActiveDragHandle] = useState<'left' | 'right' | null>(null);
  const [showStyleDrawer, setShowStyleDrawer] = useState<boolean>(false);
  const [petals, setPetals] = useState<Petal[]>([]);

  const [, setRenderTrigger] = useState(0);

  // Initialize engine
  useEffect(() => {
    engineRef.current = new RakhiTyingEngine({
      wristCenterX: 210,
      wristCenterY: 160,
    });

    const loopPhysics = () => {
      if (engineRef.current) {
        engineRef.current.stepPhysics();
        setRenderTrigger((prev) => (prev + 1) % 1000);
      }
      animFrameId.current = requestAnimationFrame(loopPhysics);
    };

    animFrameId.current = requestAnimationFrame(loopPhysics);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  // Flower Petals Effect for Tilak & Completion
  const triggerPetalShower = useCallback(() => {
    const newPetals: Petal[] = [];
    const colors = ['#DFA327', '#E86114', '#B4271F', '#FFF275', '#E5B23B'];
    for (let i = 0; i < 32; i++) {
      newPetals.push({
        id: Math.random() * 100000,
        x: 5 + Math.random() * 90,
        y: -10 - Math.random() * 30,
        size: 10 + Math.random() * 14,
        rotation: Math.random() * 360,
        speed: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setPetals(newPetals);
  }, []);

  // Petals fall loop
  useEffect(() => {
    if (petals.length === 0) return;
    const interval = setInterval(() => {
      setPetals((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            rotation: p.rotation + 3,
          }))
          .filter((p) => p.y < 120)
      );
    }, 30);
    return () => clearInterval(interval);
  }, [petals.length]);

  // State and Synchronous Refs for Cross-Element Gesture Tracking
  const activeHandleRef = useRef<'left' | 'right' | null>(null);
  const isTiedRef = useRef<boolean>(isTied);
  isTiedRef.current = isTied;

  const setActiveHandle = (handle: 'left' | 'right' | null) => {
    activeHandleRef.current = handle;
    setActiveDragHandle(handle);
  };

  // Convert client pointer to 440 x 320 SVG space
  const getSvgCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 210, y: 160 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / (rect.width || 1)) * 440;
    const y = ((clientY - rect.top) / (rect.height || 1)) * 320;
    return {
      x: Math.max(10, Math.min(430, x)),
      y: Math.max(10, Math.min(310, y)),
    };
  }, []);

  // Complete and Save Gesture
  const handleCompleteTying = useCallback(() => {
    if (!engineRef.current) return;
    setIsTied(true);
    isTiedRef.current = true;
    setCurrentStage(TyingStage.DOUBLE_KNOT);
    audio.playKnot();
    audio.playGhungroo(1.2);

    const quantized = quantizeGesture(
      engineRef.current.recordedPoints,
      { width: 440, height: 320, left: 0, top: 0 },
      3
    );
    onSaveGesture(quantized);
  }, [onSaveGesture]);

  // Comprehensive Native Touch Listeners with passive: false for explicit event cancellation & multi-element gesture continuity
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeTouchStart = (e: TouchEvent) => {
      if (isTiedRef.current || !engineRef.current || e.touches.length === 0) return;

      // Explicit event cancellation to prevent mobile viewport panning / scrolling
      if (e.cancelable) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const { x, y } = getSvgCoords(touch.clientX, touch.clientY);
      const engine = engineRef.current;

      const distL = Math.hypot(x - engine.leftHandle.x, y - engine.leftHandle.y);
      const distR = Math.hypot(x - engine.rightHandle.x, y - engine.rightHandle.y);

      let targetHandle: 'left' | 'right';
      if (distL <= 60 && distL <= distR) {
        targetHandle = 'left';
      } else if (distR <= 60) {
        targetHandle = 'right';
      } else if (x < engine.wristCenterX) {
        targetHandle = 'left';
      } else {
        targetHandle = 'right';
      }

      setActiveHandle(targetHandle);
      engine.updateDragHandle(targetHandle, x, y);
      setCurrentStage(engine.stage);

      if (engine.stage >= TyingStage.DOUBLE_KNOT && !isTiedRef.current) {
        handleCompleteTying();
      }
    };

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (isTiedRef.current || !engineRef.current || !activeHandleRef.current || e.touches.length === 0) return;

      // Explicit event cancellation across multi-element touch drag
      if (e.cancelable) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const { x, y } = getSvgCoords(touch.clientX, touch.clientY);
      const engine = engineRef.current;

      engine.updateDragHandle(activeHandleRef.current, x, y);
      setCurrentStage(engine.stage);

      if (engine.stage >= TyingStage.DOUBLE_KNOT && !isTiedRef.current) {
        handleCompleteTying();
      }
    };

    const handleNativeTouchEnd = (e: TouchEvent) => {
      if (activeHandleRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        setActiveHandle(null);
      }
    };

    const handleNativeTouchCancel = (e: TouchEvent) => {
      if (activeHandleRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        setActiveHandle(null);
      }
    };

    // Attach listeners with passive: false to allow explicit event cancellation
    container.addEventListener('touchstart', handleNativeTouchStart, { passive: false });
    window.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    window.addEventListener('touchend', handleNativeTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleNativeTouchCancel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleNativeTouchStart);
      window.removeEventListener('touchmove', handleNativeTouchMove);
      window.removeEventListener('touchend', handleNativeTouchEnd);
      window.removeEventListener('touchcancel', handleNativeTouchCancel);
    };
  }, [getSvgCoords, handleCompleteTying]);

  // Pointer drag events on interactive thread handles (Desktop mouse / stylus)
  const handlePointerDown = (handle: 'left' | 'right', e: React.PointerEvent) => {
    if (isTied) return;
    e.stopPropagation();
    setActiveHandle(handle);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeHandleRef.current || isTiedRef.current || !engineRef.current) return;
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    engineRef.current.updateDragHandle(activeHandleRef.current, x, y);
    setCurrentStage(engineRef.current.stage);

    if (engineRef.current.stage >= TyingStage.DOUBLE_KNOT && !isTiedRef.current) {
      handleCompleteTying();
    }
  };

  const handlePointerUp = () => {
    setActiveHandle(null);
  };

  // Window-level pointer listeners for desktop mouse gesture tracking across all elements
  useEffect(() => {
    const onWindowPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' && activeHandleRef.current && !isTiedRef.current && engineRef.current) {
        const { x, y } = getSvgCoords(e.clientX, e.clientY);
        engineRef.current.updateDragHandle(activeHandleRef.current, x, y);
        setCurrentStage(engineRef.current.stage);

        if (engineRef.current.stage >= TyingStage.DOUBLE_KNOT && !isTiedRef.current) {
          handleCompleteTying();
        }
      }
    };

    const onWindowPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' && activeHandleRef.current) {
        setActiveHandle(null);
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [getSvgCoords, handleCompleteTying]);

  // Step-by-Step Advance
  const handleAdvanceStep = (step: TyingStage) => {
    if (!engineRef.current) return;
    engineRef.current.advanceToStage(step);
    setCurrentStage(engineRef.current.stage);

    if (step === TyingStage.WRAPPING) {
      audio.playGhungroo(0.9);
    } else if (step === TyingStage.FIRST_KNOT) {
      audio.playKnot();
    } else if (step >= TyingStage.DOUBLE_KNOT) {
      audio.playKnot();
      handleCompleteTying();
    }
  };

  // Tilak & Blessing Action
  const handleApplyTilak = () => {
    setTilakApplied(true);
    if (engineRef.current) {
      engineRef.current.advanceToStage(TyingStage.TILAK_BLESSED);
    }
    triggerPetalShower();
    audio.playMandirGhanti(1.0, 1.4);
    audio.playShankh();
    audio.playAkshatShower();
  };

  // Auto-Tie All Ritual
  const handleAutoTie = () => {
    if (!engineRef.current) return;
    engineRef.current.advanceToStage(TyingStage.WRAPPING);
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.advanceToStage(TyingStage.FIRST_KNOT);
      }
    }, 250);
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.advanceToStage(TyingStage.DOUBLE_KNOT);
        handleCompleteTying();
        handleApplyTilak();
      }
    }, 550);
  };

  // Reset
  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
    setIsTied(false);
    setTilakApplied(false);
    setCurrentStage(TyingStage.PLACED);
    setActiveDragHandle(null);
    setPetals([]);
    audio.playGhungroo();
  };

  const skinToneId = useId();
  const sleeveStyleId = useId();

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Ceremony Header */}
      <div className="text-center mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'चरण ४ · पावन रक्षाबंधन (बंधन)' : 'Act 4 · Sacred Bandhan (The Tying)'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'सच्चे मन से कलाई पर रक्षासूत्र बांधें' : 'Bind the Sacred Rakshasutra on the Wrist'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5 max-w-xl mx-auto">
          {lang === 'hi'
            ? 'कलाई पर रेशमी डोरी लपेटें, गांठ लगाएं और शुभ रोली-अक्षत का टीका लगाएं।'
            : 'Wrap the sacred silk thread around the wrist, tie the protective knots, and apply the auspicious tilak.'}
        </p>
      </div>

      {/* Main Ceremony Card */}
      <div className="max-w-2xl mx-auto bg-[#FBF6EA] border-2 border-[#231C17] p-4 sm:p-5 rounded-xs shadow-[5px_5px_0px_#231C17] relative space-y-4">
        {/* Top Status & Sleeve Selector Bar */}
        <div className="flex items-center justify-between border-b border-[#231C17]/15 pb-2.5 text-xs font-serif">
          {/* Active Step Indicator */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#B4271F] bg-[#F1E3CB] px-2.5 py-1 border border-[#231C17]/20 rounded-xs flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#DFA327]" />
              {currentStage === TyingStage.PLACED && (lang === 'hi' ? '१. राखी कलाई पर' : '1. Rakhi Placed')}
              {currentStage === TyingStage.WRAPPING && (lang === 'hi' ? '२. डोरी लपेटी जा रही है' : '2. Wrapping under wrist')}
              {currentStage === TyingStage.FIRST_KNOT && (lang === 'hi' ? '३. पहली गांठ बंधी' : '3. First Knot')}
              {(currentStage === TyingStage.DOUBLE_KNOT || currentStage === TyingStage.TILAK_BLESSED) && (
                lang === 'hi' ? '४. रक्षासूत्र पूर्ण बंधा ✓' : '4. Rakshasutra Tied ✓'
              )}
            </span>

            {tilakApplied && (
              <span className="text-[11px] text-[#B4271F] font-bold hidden sm:flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#B4271F] fill-[#B4271F]" />
                {lang === 'hi' ? 'रोली-अक्षत टीका ✓' : 'Tilak Blessed ✓'}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowStyleDrawer(!showStyleDrawer)}
              className="text-[#7A5030] hover:text-[#B4271F] flex items-center gap-1 cursor-pointer font-serif min-h-[36px]"
              id="toggle-wrist-style-drawer-btn"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'कलाई / परिधान' : 'Sleeve & Skin'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="text-[#7C1E13] hover:text-[#B4271F] flex items-center gap-1 cursor-pointer font-serif min-h-[36px]"
              title="दोबारा बांधें (Reset)"
              id="reset-tying-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पुनः' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Style Drawer */}
        {showStyleDrawer && (
          <div className="p-3 bg-[#F1E3CB] border border-[#231C17]/20 rounded-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif animate-fade-in">
            <div>
              <label htmlFor={skinToneId} className="font-bold text-[#231C17] block mb-1">
                {lang === 'hi' ? 'त्वचा रंग (१० प्राकृतिक शेड्स):' : 'Skin Tone:'}
              </label>
              <select
                id={skinToneId}
                value={wristSkin}
                onChange={(e) => onChangeWristStyle(Number(e.target.value), wristSleeve)}
                className="w-full p-2 bg-[#FBF6EA] border border-[#231C17] rounded-xs text-xs font-serif"
              >
                {SKIN_TONES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={sleeveStyleId} className="font-bold text-[#231C17] block mb-1">
                {lang === 'hi' ? 'आस्तीन व कलाई शैली:' : 'Sleeve / Wrist Style:'}
              </label>
              <select
                id={sleeveStyleId}
                value={wristSleeve}
                onChange={(e) => onChangeWristStyle(wristSkin, Number(e.target.value))}
                className="w-full p-2 bg-[#FBF6EA] border border-[#231C17] rounded-xs text-xs font-serif"
              >
                {SLEEVE_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === 'hi' ? s.name_hi : s.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* The Authentic Ceremony Stage (SVG 440 x 320) */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full aspect-[440/320] max-h-[380px] bg-[#EFE3CF] border-2 border-[#231C17] rounded-xs flex items-center justify-center select-none overflow-hidden touch-none shadow-inner"
          id="tying-ceremony-stage"
        >
          {/* Subtle Mobile & Desktop Gesture Guidance Ribbon */}
          {!isTied && (
            <div className="absolute top-2.5 px-2.5 py-1 bg-[#231C17]/80 text-[#FFF2B2] text-[10px] sm:text-xs font-serif rounded-xs backdrop-blur-xs flex items-center gap-1.5 pointer-events-none z-30 shadow-xs animate-fade-in border border-[#FFF2B2]/20">
              <Sparkles className="w-3 h-3 text-[#DFA327] animate-pulse" />
              <span>
                {lang === 'hi'
                  ? 'स्पर्श संकेत: सुनहरे बिंदुओं को कलाई के नीचे खींचें या चरण बटन दबाएं'
                  : 'Tactile Gesture: Drag golden nodes under wrist or use step buttons'}
              </span>
            </div>
          )}

          {/* 1. Base Layer: Hand, Forearm, Chowki Mat and Puja Thali */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            dangerouslySetInnerHTML={{
              __html: renderWristSVG({
                skinIndex: wristSkin,
                sleeveIndex: wristSleeve,
                isMemorial,
                isLumba,
                showThali: true,
                tilakApplied,
              }),
            }}
          />

          {/* 2. Silk Dori Cords, Under-Wrist Wraps & Knots Layer */}
          {engineRef.current && (
            <svg
              viewBox="0 0 440 320"
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
              preserveAspectRatio="xMidYMid meet"
              dangerouslySetInnerHTML={{
                __html: renderSacredTyingLayerSVG(engineRef.current, rakhiConfig, isTied),
              }}
            />
          )}

          {/* 3. Centerpiece Rakhi Ornament (Resting firmly on wrist bone at (210, 160)) */}
          <div
            className="absolute pointer-events-none z-20"
            style={{
              left: '47.7%',
              top: '50%',
              transform: 'translate(-50%, -50%) scale(0.72)',
            }}
            dangerouslySetInnerHTML={{
              __html: renderRakhiSVG(rakhiConfig, { size: 210 }),
            }}
          />

          {/* 4. Interactive Drag Handles & Guided Motion Paths for Direct Tying */}
          {!isTied && engineRef.current && (
            <svg
              viewBox="0 0 440 320"
              className="absolute inset-0 w-full h-full pointer-events-auto z-30"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Glowing radial gradient for touch guides */}
                <radialGradient id="guide-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#DFA327" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#B4271F" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#B4271F" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* STAGE 0: PLACED - Curved Guide Arc Trails around Wrist */}
              {currentStage === TyingStage.PLACED && (
                <g className="pointer-events-none opacity-85">
                  {/* Left Arc Path */}
                  <path
                    d="M 135 160 C 135 205, 170 215, 200 205"
                    fill="none"
                    stroke="#DFA327"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    className="animate-pulse"
                  />
                  {/* Right Arc Path */}
                  <path
                    d="M 285 160 C 285 205, 250 215, 220 205"
                    fill="none"
                    stroke="#DFA327"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    className="animate-pulse"
                  />

                  {/* Directional Chevron Arrows */}
                  <polygon points="198,200 206,206 198,212" fill="#B4271F" />
                  <polygon points="222,200 214,206 222,212" fill="#B4271F" />

                  {/* Non-intrusive floating guide badges over handles */}
                  <g transform={`translate(${engineRef.current.leftHandle.x}, ${engineRef.current.leftHandle.y - 28})`}>
                    <rect x="-26" y="-12" width="52" height="18" rx="4" fill="#231C17" fillOpacity="0.8" />
                    <text x="0" y="1" fill="#FFF2B2" fontSize="9" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                      {lang === 'hi' ? '👇 खींचें' : '👇 Drag'}
                    </text>
                  </g>
                  <g transform={`translate(${engineRef.current.rightHandle.x}, ${engineRef.current.rightHandle.y - 28})`}>
                    <rect x="-26" y="-12" width="52" height="18" rx="4" fill="#231C17" fillOpacity="0.8" />
                    <text x="0" y="1" fill="#FFF2B2" fontSize="9" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                      {lang === 'hi' ? '👇 खींचें' : '👇 Drag'}
                    </text>
                  </g>
                </g>
              )}

              {/* STAGE 1: WRAPPING - Guide Inward towards Center Knot Point */}
              {currentStage === TyingStage.WRAPPING && (
                <g className="pointer-events-none opacity-85">
                  <path
                    d={`M ${engineRef.current.leftHandle.x} ${engineRef.current.leftHandle.y} Q 185 185 205 180`}
                    fill="none"
                    stroke="#DFA327"
                    strokeWidth="2.5"
                    strokeDasharray="5,3"
                  />
                  <path
                    d={`M ${engineRef.current.rightHandle.x} ${engineRef.current.rightHandle.y} Q 235 185 215 180`}
                    fill="none"
                    stroke="#DFA327"
                    strokeWidth="2.5"
                    strokeDasharray="5,3"
                  />
                  {/* Central Knot Target Aura */}
                  <circle cx="210" cy="180" r="14" fill="url(#guide-glow)" className="animate-ping" />
                  <circle cx="210" cy="180" r="6" fill="#B4271F" stroke="#FFF2B2" strokeWidth="1.5" />
                  <g transform="translate(210, 212)">
                    <rect x="-38" y="-11" width="76" height="18" rx="4" fill="#231C17" fillOpacity="0.85" />
                    <text x="0" y="2" fill="#FFF2B2" fontSize="9" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                      {lang === 'hi' ? 'गांठ बांधें' : 'Cinch Knot'}
                    </text>
                  </g>
                </g>
              )}

              {/* STAGE 2: FIRST_KNOT - Guide Downward for Double Lock Knot */}
              {currentStage === TyingStage.FIRST_KNOT && (
                <g className="pointer-events-none opacity-85">
                  <line
                    x1="210"
                    y1="180"
                    x2="210"
                    y2="230"
                    stroke="#DFA327"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                    className="animate-pulse"
                  />
                  <polygon points="205,225 210,235 215,225" fill="#B4271F" />
                  <g transform="translate(210, 252)">
                    <rect x="-42" y="-11" width="84" height="18" rx="4" fill="#231C17" fillOpacity="0.85" />
                    <text x="0" y="2" fill="#FFF2B2" fontSize="9" fontFamily="serif" textAnchor="middle" fontWeight="bold">
                      {lang === 'hi' ? '🔒 पक्की गांठ' : '🔒 Double Knot'}
                    </text>
                  </g>
                </g>
              )}

              {/* Left Dori Pull Handle with generous 48px hit target */}
              <g
                className="cursor-grab active:cursor-grabbing group"
                onPointerDown={(e) => handlePointerDown('left', e)}
              >
                {/* Large Invisible Touch-target */}
                <circle
                  cx={engineRef.current.leftHandle.x}
                  cy={engineRef.current.leftHandle.y}
                  r="32"
                  fill="transparent"
                />
                {/* Touch Feedback Ring when active */}
                {activeDragHandle === 'left' && (
                  <circle
                    cx={engineRef.current.leftHandle.x}
                    cy={engineRef.current.leftHandle.y}
                    r="24"
                    fill="none"
                    stroke="#B4271F"
                    strokeWidth="2.5"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={engineRef.current.leftHandle.x}
                  cy={engineRef.current.leftHandle.y}
                  r="16"
                  fill="#DFA327"
                  fillOpacity="0.4"
                  className="animate-pulse"
                />
                <circle
                  cx={engineRef.current.leftHandle.x}
                  cy={engineRef.current.leftHandle.y}
                  r="11"
                  fill="#DFA327"
                  stroke="#231C17"
                  strokeWidth="2"
                />
                <circle cx={engineRef.current.leftHandle.x} cy={engineRef.current.leftHandle.y} r="4" fill="#B4271F" />
              </g>

              {/* Right Dori Pull Handle with generous 48px hit target */}
              <g
                className="cursor-grab active:cursor-grabbing group"
                onPointerDown={(e) => handlePointerDown('right', e)}
              >
                {/* Large Invisible Touch-target */}
                <circle
                  cx={engineRef.current.rightHandle.x}
                  cy={engineRef.current.rightHandle.y}
                  r="32"
                  fill="transparent"
                />
                {/* Touch Feedback Ring when active */}
                {activeDragHandle === 'right' && (
                  <circle
                    cx={engineRef.current.rightHandle.x}
                    cy={engineRef.current.rightHandle.y}
                    r="24"
                    fill="none"
                    stroke="#B4271F"
                    strokeWidth="2.5"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={engineRef.current.rightHandle.x}
                  cy={engineRef.current.rightHandle.y}
                  r="16"
                  fill="#DFA327"
                  fillOpacity="0.4"
                  className="animate-pulse"
                />
                <circle
                  cx={engineRef.current.rightHandle.x}
                  cy={engineRef.current.rightHandle.y}
                  r="11"
                  fill="#DFA327"
                  stroke="#231C17"
                  strokeWidth="2"
                />
                <circle cx={engineRef.current.rightHandle.x} cy={engineRef.current.rightHandle.y} r="4" fill="#B4271F" />
              </g>
            </svg>
          )}

          {/* 5. Falling Celebratory Marigold Petals */}
          {petals.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size * 0.75}px`,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
                opacity: 0.85,
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'top 0.05s linear',
              }}
            />
          ))}

          {/* Sacred Ceremony Complete Badge */}
          {isTied && (
            <div className="absolute bottom-3 px-4 py-1.5 bg-[#5F6E36] text-[#FBF6EA] text-xs font-serif font-bold rounded-xs shadow-md flex items-center gap-2 animate-fade-in z-30">
              <Check className="w-4 h-4" />
              <span>{lang === 'hi' ? 'शुभ रक्षाबंधन · रक्षासूत्र बंध गया' : 'Sacred Rakhi Tied & Blessed ✓'}</span>
            </div>
          )}
        </div>

        {/* Guided Ritual Action Steps */}
        <div className="space-y-3">
          {/* Step Guidance Narrative */}
          <p className="text-xs text-center font-serif text-[#231C17]/85 italic min-h-[32px] flex items-center justify-center">
            {!isTied && currentStage === TyingStage.PLACED && (
              lang === 'hi'
                ? 'राखी कलाई पर सज चुकी है। डोरियों को कलाई के नीचे से लपेटने के लिए "२. डोरी लपेटें" दबाएं या सोने के बिंदुओं को खींचें।'
                : 'Rakhi is positioned. Drag the golden thread ends around the wrist or tap "Wrap Under Wrist".'
            )}
            {!isTied && currentStage === TyingStage.WRAPPING && (
              lang === 'hi'
                ? 'डोरियां कलाई के नीचे लपेट ली गई हैं। अब रक्षा का पहला पवित्र बंधन लगाने के लिए "३. पहली गांठ" दबाएं।'
                : 'Threads wrapped under the wrist. Tap "Tie First Knot" to interlock the cords.'
            )}
            {!isTied && currentStage === TyingStage.FIRST_KNOT && (
              lang === 'hi'
                ? 'पहली गांठ लग चुकी है। अब इसे पक्की गांठ व लच्छेदार बंध में सुरक्षित करने के लिए "४. पक्की गांठ" दबाएं।'
                : 'First knot tightened. Tap "Double Lock Knot" to secure the silk tassels.'
            )}
            {isTied && !tilakApplied && (
              lang === 'hi'
                ? 'रक्षासूत्र बंध गया! अब थाली से रोली और अक्षत का पावन मंगल टीका लगाएं।'
                : 'Rakhi is securely tied! Now apply the auspicious Kumkum Tilak & Akshat blessing.'
            )}
            {isTied && tilakApplied && (
              lang === 'hi'
                ? 'पावन रक्षाबंधन रस्म पूर्ण हुई। अब पत्र पर लाख की मुहर लगाकर भाई को भेजें।'
                : 'Ceremony complete. Proceed to seal the envelope with wax and send.'
            )}
          </p>

          {/* Action Step Buttons with 44px min touch target */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Step 2 Button: Wrap */}
            <button
              type="button"
              disabled={isTied || currentStage >= TyingStage.WRAPPING}
              onClick={() => handleAdvanceStep(TyingStage.WRAPPING)}
              className={`min-h-[44px] py-2 px-2 text-xs font-serif font-bold rounded-xs border-2 border-[#231C17] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
                currentStage === TyingStage.PLACED && !isTied
                  ? 'bg-[#B4271F] text-[#FBF6EA] shadow-[2px_2px_0px_#231C17] ring-2 ring-[#DFA327]'
                  : 'bg-[#FBF6EA] text-[#231C17] opacity-60'
              }`}
              id="step-wrap-dori-btn"
            >
              <span>{lang === 'hi' ? '२. डोरी लपेटें' : '2. Wrap Strands'}</span>
            </button>

            {/* Step 3 Button: First Knot */}
            <button
              type="button"
              disabled={isTied || currentStage < TyingStage.WRAPPING || currentStage >= TyingStage.FIRST_KNOT}
              onClick={() => handleAdvanceStep(TyingStage.FIRST_KNOT)}
              className={`min-h-[44px] py-2 px-2 text-xs font-serif font-bold rounded-xs border-2 border-[#231C17] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
                currentStage === TyingStage.WRAPPING && !isTied
                  ? 'bg-[#B4271F] text-[#FBF6EA] shadow-[2px_2px_0px_#231C17] ring-2 ring-[#DFA327]'
                  : 'bg-[#FBF6EA] text-[#231C17] opacity-60'
              }`}
              id="step-first-knot-btn"
            >
              <span>{lang === 'hi' ? '३. पहली गांठ' : '3. First Knot'}</span>
            </button>

            {/* Step 4 Button: Double Knot */}
            <button
              type="button"
              disabled={isTied}
              onClick={() => handleAdvanceStep(TyingStage.DOUBLE_KNOT)}
              className={`min-h-[44px] py-2 px-2 text-xs font-serif font-bold rounded-xs border-2 border-[#231C17] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
                currentStage === TyingStage.FIRST_KNOT && !isTied
                  ? 'bg-[#B4271F] text-[#FBF6EA] shadow-[2px_2px_0px_#231C17] ring-2 ring-[#DFA327]'
                  : 'bg-[#FBF6EA] text-[#231C17] opacity-60'
              }`}
              id="step-double-knot-btn"
            >
              <span>{lang === 'hi' ? '४. पक्की गांठ' : '4. Double Knot'}</span>
            </button>

            {/* Step 5 Button: Tilak & Flower Shower */}
            <button
              type="button"
              onClick={handleApplyTilak}
              className={`min-h-[44px] py-2 px-2 text-xs font-serif font-bold rounded-xs border-2 border-[#231C17] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
                tilakApplied
                  ? 'bg-[#5F6E36] text-[#FBF6EA]'
                  : isTied
                  ? 'bg-[#DFA327] text-[#231C17] shadow-[2px_2px_0px_#231C17] animate-pulse font-bold'
                  : 'bg-[#FBF6EA] text-[#231C17] opacity-80'
              }`}
              id="step-apply-tilak-btn"
            >
              <Flame className="w-3.5 h-3.5 text-[#B4271F]" />
              <span>{lang === 'hi' ? '५. रोली-तिलक' : '5. Apply Tilak'}</span>
            </button>
          </div>

          {/* Quick Auto-Tie Button */}
          {!isTied && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleAutoTie}
                className="min-h-[44px] px-5 py-2.5 bg-[#DFA327] hover:bg-[#c98e18] text-[#231C17] text-xs font-serif font-bold rounded-xs border border-[#231C17] shadow-[2px_2px_0px_#231C17] cursor-pointer inline-flex items-center gap-1.5 transition-transform active:translate-y-0.5"
                id="quick-auto-tie-all-btn"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? '⚡ संपूर्ण रस्म एक साथ करें (Auto-Tie Ceremony)' : '⚡ Complete Full Ceremony (Auto)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="pt-3 border-t border-[#231C17]/15 flex items-center justify-between">
          <button
            onClick={onBack}
            className="min-h-[44px] px-4 py-2 border border-[#231C17]/40 text-[#231C17] rounded-xs font-serif text-xs hover:bg-[#DCC9A6]/40 cursor-pointer flex items-center gap-1.5"
            id="bandhan-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'पीछे' : 'Back'}</span>
          </button>

          <button
            onClick={() => {
              if (!isTied) {
                handleAutoTie();
              }
              onNext();
            }}
            className="min-h-[44px] px-6 py-2 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs shadow-[2px_2px_0px_#231C17] flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            id="bandhan-next-btn"
          >
            <span>{lang === 'hi' ? 'मुहर व लिंक (Act 5)' : 'Seal & Link (Act 5)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
