import React, { useState, useEffect, useRef } from 'react';
import { SchemaV1, PetiItem } from '../types';
import { PaperTearSimulator } from '../feel/tear';
import { ParticleSystem } from '../feel/particles';
import { GestureReplayEngine } from '../feel/replay';
import { renderWristSVG } from '../art/wrist';
import { renderRakhiSVG } from '../art/rakhi';
import { renderThaalSVG } from '../art/thaal';
import { MITHAI_LIST } from '../data/mithai';
import { seedToRakhiId } from '../core/prng';
import { audio } from '../core/audio';
import {
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  ArrowRight,
  Download,
  Archive,
  Volume2,
  VolumeX,
  Heart,
  Flame,
} from 'lucide-react';

interface KholoViewProps {
  payload: SchemaV1;
  onSaveToPeti: (item: PetiItem) => void;
  onGoToReply: () => void;
  lang: 'hi' | 'en';
}

export const KholoView: React.FC<KholoViewProps> = ({ payload, onSaveToPeti, onGoToReply, lang }) => {
  // Stages: 'envelope' -> 'tear' -> 'rasm' -> 'replay' -> 'letter' -> 'done'
  const [stage, setStage] = useState<'envelope' | 'tear' | 'rasm' | 'replay' | 'letter' | 'done'>('envelope');

  // Rasm sub-steps
  const [aartiRotations, setAartiRotations] = useState(0);
  const [hasTilak, setHasTilak] = useState(false);
  const [hasAkshat, setHasAkshat] = useState(false);
  const [mithaiBites, setMithaiBites] = useState(0);

  // Replay state
  const [replaySpeed, setReplaySpeed] = useState<number>(1.0);
  const [replayProgress, setReplayProgress] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayPoint, setReplayPoint] = useState<{ x: number; y: number } | null>(null);

  // Letter reveal state
  const [revealedChars, setRevealedChars] = useState(0);
  const [isLetterTyping, setIsLetterTyping] = useState(false);

  // Canvas Refs
  const tearCanvasRef = useRef<HTMLCanvasElement>(null);
  const tearSimRef = useRef<PaperTearSimulator | null>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleSysRef = useRef<ParticleSystem | null>(null);
  const replayEngineRef = useRef<GestureReplayEngine | null>(null);
  const letterTimerRef = useRef<number | null>(null);

  const senderName = payload.b || (lang === 'hi' ? 'स्नेही' : 'Sender');
  const receiverName = payload.a || (lang === 'hi' ? 'भाई / बहना' : 'Recipient');
  const sweet = MITHAI_LIST[payload.q?.s || payload.k?.d || 0] || MITHAI_LIST[0];
  const rakhiId = seedToRakhiId(payload.k?.s || 108);

  // Init Tear and Particles
  useEffect(() => {
    tearSimRef.current = new PaperTearSimulator(320, 180);
    particleSysRef.current = new ParticleSystem(360, 300);

    let animId: number;
    const loop = () => {
      if (particlesCanvasRef.current && particleSysRef.current) {
        const ctx = particlesCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 360, 300);
          particleSysRef.current.update();
          particleSysRef.current.render(ctx);
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle Paper Tear Drag
  const handleTearPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!tearSimRef.current || !tearCanvasRef.current) return;
    const rect = tearCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tearSimRef.current.addPoint(x, y, 1.2);

    const ctx = tearCanvasRef.current.getContext('2d');
    if (ctx) {
      tearSimRef.current.render(ctx);
    }

    if (tearSimRef.current.isTorn) {
      audio.playWaxSeal('crack');
      audio.playMandirGhanti(1.0, 1.1);
      setTimeout(() => setStage('rasm'), 400);
    }
  };

  // Aarti Circle Tracking (Clockwise tracking)
  const aartiAngle = useRef<number | null>(null);
  const aartiAcc = useRef<number>(0);

  const handleAartiPointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const angle = Math.atan2(y - cy, x - cx);
    if (aartiAngle.current !== null) {
      let delta = angle - aartiAngle.current;
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;

      // Clockwise accumulation
      if (delta > 0) {
        aartiAcc.current += delta;
        const fullTurns = Math.floor(aartiAcc.current / (2 * Math.PI));
        if (fullTurns > aartiRotations) {
          setAartiRotations(fullTurns);
          audio.playAartiBell();
        }
      }
    }
    aartiAngle.current = angle;
  };

  // Tilak Press
  const handleTilakPress = () => {
    setHasTilak(true);
    audio.playMandirGhanti(1.2, 0.9);
    audio.playAkshatShower();
    if (particleSysRef.current) {
      particleSysRef.current.spawnAkshat(180, 80, 10);
    }
  };

  // Akshat Scatter
  const handleAkshatFlick = () => {
    setHasAkshat(true);
    audio.playAkshatShower();
    audio.playGhungroo(1.2);
    if (particleSysRef.current) {
      particleSysRef.current.spawnAkshat(180, 120, 32);
    }
  };

  // Mithai Tasting
  const handleMithaiBite = () => {
    const nextBite = Math.min(2, mithaiBites + 1);
    setMithaiBites(nextBite);
    audio.playSweetPrasad();
    if (particleSysRef.current) {
      particleSysRef.current.spawnCrumbs(180, 160, sweet.color, 14);
    }
  };

  // Trigger Replay of Recorded Hand Motion
  const startReplay = () => {
    setStage('replay');
    setIsReplaying(true);
    setReplayProgress(0);
    audio.playGhungroo(1.0);

    const gesturePoints = payload.h || [];
    replayEngineRef.current = new GestureReplayEngine(gesturePoints, {
      width: 440,
      height: 320,
      left: 0,
      top: 0,
    });
    replayEngineRef.current.setSpeed(replaySpeed);

    replayEngineRef.current.start(({ x, y, progress, isComplete }) => {
      setReplayPoint({ x, y });
      setReplayProgress(progress);
      if (isComplete) {
        setIsReplaying(false);
        audio.playKnot();
        audio.playMandirGhanti(1.0, 1.2);
      }
    });
  };

  // Trigger Rhythmic Letter Reveal
  const startLetterReveal = () => {
    setStage('letter');
    const fullText = payload.m || (lang === 'hi' ? 'सदा खुश रहो और सुरक्षित रहो।' : 'Stay blessed and protected always.');
    setRevealedChars(0);
    setIsLetterTyping(true);

    let idx = 0;
    const typeStep = () => {
      if (idx < fullText.length) {
        idx++;
        setRevealedChars(idx);
        if (idx % 6 === 0) audio.playKalamScratch(0.85);
        letterTimerRef.current = window.setTimeout(typeStep, 35);
      } else {
        setIsLetterTyping(false);
      }
    };
    typeStep();
  };

  const skipLetterTyping = () => {
    if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
    const fullText = payload.m || '';
    setRevealedChars(fullText.length);
    setIsLetterTyping(false);
  };

  // Download .rakhi file
  const handleDownloadRakhiFile = () => {
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rakhi-${rakhiId}.rakhi`;
    a.click();
    URL.revokeObjectURL(url);
    audio.playGhungroo();
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Title & Stage Guide */}
      <div className="text-center mb-5">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'खोलें · रक्षासूत्र व रस्म' : 'Kholo · Receive & Replay'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-display text-[#B4271F] font-bold mt-1">
          {senderName} {lang === 'hi' ? 'ने आपके लिए रक्षासूत्र भेजा है' : 'has sent you a Rakhi'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5 max-w-xl mx-auto">
          {lang === 'hi'
            ? 'लिफाफा खोलें, रस्म निभाएं और उनके हाथ की असली हरकत का रीप्ले देखें।'
            : 'Tear open the envelope, partake in the ritual, and watch their true hand motion.'}
        </p>
      </div>

      {/* Main Receiving Stage */}
      <div className="max-w-xl mx-auto bg-[#FBF6EA] border-2 border-[#231C17] p-4 sm:p-5 rounded-xs shadow-[5px_5px_0px_#231C17] space-y-4 relative">
        {/* Particle Canvas Overlay for Akshat & Crumbs */}
        <canvas
          ref={particlesCanvasRef}
          width={360}
          height={300}
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
        />

        {/* 1. Envelope Arrival Stage */}
        {stage === 'envelope' && (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="relative w-full max-w-[300px] h-[190px] mx-auto bg-[#F1E3CB] border-2 border-[#231C17] rounded-xs shadow-sm flex flex-col justify-between p-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#7C1E13]">
                <span>DHAAGA POST</span>
                <span className="border border-[#7C1E13] px-1 rounded-xs">₹0 FREE</span>
              </div>

              <div className="text-left font-hand text-lg text-[#231C17]">
                <div>{lang === 'hi' ? 'प्रिय' : 'To'} {receiverName}</div>
                <div className="text-xs text-[#7A5030] font-serif">
                  {lang === 'hi' ? `भेजने वाले: ${senderName}` : `From: ${senderName}`}
                </div>
              </div>

              {/* Red Lac Wax Seal */}
              <div className="w-12 h-12 rounded-full bg-[#7C1E13] border-2 border-[#4B2D19] text-[#FBF6EA] font-display font-bold text-lg flex items-center justify-center mx-auto shadow-sm">
                {(senderName[0] || 'D').toUpperCase()}
              </div>
            </div>

            <button
              onClick={() => setStage('tear')}
              className="min-h-[44px] px-6 py-2.5 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs shadow-[2px_2px_0px_#231C17] cursor-pointer"
              id="kholo-open-envelope-btn"
            >
              {lang === 'hi' ? 'लिफाफा फाड़ें (Tear Open)' : 'Tear Open Envelope'}
            </button>
          </div>
        )}

        {/* 2. Paper Tear Stage */}
        {stage === 'tear' && (
          <div className="text-center space-y-3 py-2 animate-fade-in">
            <p className="text-xs font-serif text-[#7C1E13] font-bold">
              {lang === 'hi'
                ? 'उंगली से लिफाफे के किनारे को फाड़ें (Drag across the flap):'
                : 'Drag your finger across the flap to tear it open:'}
            </p>

            <div className="relative w-full max-w-[320px] h-[180px] mx-auto bg-[#F1E3CB] border-2 border-[#231C17] rounded-xs overflow-hidden touch-none select-none">
              <canvas
                ref={tearCanvasRef}
                width={320}
                height={180}
                onPointerMove={handleTearPointerMove}
                className="w-full h-full cursor-crosshair"
                id="tear-canvas"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-serif text-[#231C17]/40">
                — {lang === 'hi' ? 'यहां से फाड़ें' : 'Tear here'} —
              </div>
            </div>

            <button
              onClick={() => setStage('rasm')}
              className="text-xs text-[#7A5030] hover:text-[#B4271F] underline font-serif cursor-pointer min-h-[36px] flex items-center justify-center mx-auto"
              id="skip-tear-btn"
            >
              {lang === 'hi' ? 'सीधा रस्म पर जाएं (Skip Tear)' : 'Skip Tear'}
            </button>
          </div>
        )}

        {/* 3. The Rasm Rituals (Aarti, Tilak, Akshat, Mithai) */}
        {stage === 'rasm' && (
          <div className="space-y-4 py-2 animate-fade-in">
            <div className="text-center">
              <span className="text-xs font-bold text-[#B4271F] font-serif uppercase tracking-wider">
                {lang === 'hi' ? 'पवित्र रक्षाबंधन रस्म' : 'The Sacred Ritual'}
              </span>
              <p className="text-xs text-[#231C17]/80 font-serif mt-0.5">
                {lang === 'hi'
                  ? 'दीये की आरती उतारें, माथे पर तिलक लगाएं और मिठाई का भोग लगाएं।'
                  : 'Circle the aarti diya, apply kumkum tilak, and share mithai.'}
              </p>
            </div>

            {/* Interactive Thaal Ritual Stage */}
            <div
              onPointerMove={handleAartiPointerMove}
              className="relative w-full h-[250px] bg-[#F1E3CB]/40 border border-[#231C17]/30 rounded-xs flex items-center justify-center select-none overflow-hidden touch-none"
              id="rasm-interactive-thaal"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: renderThaalSVG(payload.q || {}, { size: 240 }),
                }}
              />

              {/* Tilak Visual on Thaal / Forehead */}
              {hasTilak && (
                <div className="absolute top-8 w-6 h-8 rounded-full bg-[#B4271F] border border-[#7C1E13] shadow-xs flex items-center justify-center animate-fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFFDF8]" />
                </div>
              )}
            </div>

            {/* Ritual Step Buttons with min 44px touch targets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-serif">
              <button
                type="button"
                onClick={() => {
                  setAartiRotations((prev) => prev + 1);
                  audio.playMandirGhanti();
                }}
                className={`min-h-[44px] p-2 border rounded-xs font-bold cursor-pointer transition-colors flex items-center justify-center ${
                  aartiRotations >= 3 ? 'bg-[#5F6E36] text-[#FBF6EA] border-[#5F6E36]' : 'bg-[#FBF6EA] border-[#231C17]'
                }`}
                id="rasm-aarti-btn"
              >
                {lang === 'hi' ? `आरती (${aartiRotations}/3)` : `Aarti (${aartiRotations}/3)`}
              </button>

              <button
                type="button"
                onClick={handleTilakPress}
                className={`min-h-[44px] p-2 border rounded-xs font-bold cursor-pointer transition-colors flex items-center justify-center ${
                  hasTilak ? 'bg-[#B4271F] text-[#FBF6EA] border-[#B4271F]' : 'bg-[#FBF6EA] border-[#231C17]'
                }`}
                id="rasm-tilak-btn"
              >
                {lang === 'hi' ? (hasTilak ? 'तिलक लगा ✓' : 'तिलक लगाएं') : hasTilak ? 'Tilak Done ✓' : 'Apply Tilak'}
              </button>

              <button
                type="button"
                onClick={handleAkshatFlick}
                className={`min-h-[44px] p-2 border rounded-xs font-bold cursor-pointer transition-colors flex items-center justify-center ${
                  hasAkshat ? 'bg-[#DFA327] text-[#231C17] border-[#DFA327]' : 'bg-[#FBF6EA] border-[#231C17]'
                }`}
                id="rasm-akshat-btn"
              >
                {lang === 'hi' ? (hasAkshat ? 'अक्षत न्योछावर ✓' : 'अक्षत छिड़कें') : hasAkshat ? 'Akshat ✓' : 'Scatter Rice'}
              </button>

              <button
                type="button"
                onClick={handleMithaiBite}
                className={`min-h-[44px] p-2 border rounded-xs font-bold cursor-pointer transition-colors flex items-center justify-center ${
                  mithaiBites > 0 ? 'bg-[#7A5030] text-[#FBF6EA] border-[#7A5030]' : 'bg-[#FBF6EA] border-[#231C17]'
                }`}
                id="rasm-mithai-btn"
              >
                {lang === 'hi'
                  ? mithaiBites >= 2
                    ? 'मिठाई खाई ✓'
                    : 'मिठाई चखें'
                  : mithaiBites >= 2
                  ? 'Sweet Done ✓'
                  : 'Taste Sweet'}
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={startReplay}
                className="min-h-[44px] px-6 py-2.5 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs shadow-[2px_2px_0px_#231C17] cursor-pointer flex items-center justify-center gap-2 mx-auto transition-transform active:translate-y-0.5"
                id="proceed-to-replay-btn"
              >
                <Sparkles className="w-4 h-4 text-[#DFA327]" />
                <span>{lang === 'hi' ? 'राखी बांधने की असली हरकत देखें' : 'Watch Her True Hand Replay'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. THE REPLAY — The Payoff */}
        {stage === 'replay' && (
          <div className="space-y-4 py-2 animate-fade-in">
            <div className="text-center">
              <span className="text-xs font-mono font-bold text-[#B4271F] uppercase tracking-wider">
                {lang === 'hi' ? 'हस्त-गति रीप्ले' : 'True Hand Motion Replay'}
              </span>
              <p className="text-xs text-[#7A5030] font-hand italic mt-0.5">
                "{lang === 'hi' ? 'यह उनके हाथ की असली हरकत है' : 'This is the true recorded motion of their hand'}"
              </p>
            </div>

            {/* Replay Visual Area (SVG 440 x 320) */}
            <div
              className="relative w-full aspect-[440/320] max-h-[350px] bg-[#EFE3CF] border-2 border-[#231C17] rounded-xs flex items-center justify-center select-none overflow-hidden shadow-inner"
              id="replay-stage"
            >
              {/* Background Hand & Thali */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                dangerouslySetInnerHTML={{
                  __html: renderWristSVG({
                    skinIndex: payload.w || 1,
                    sleeveIndex: payload.w || 0,
                    showThali: true,
                    tilakApplied: !isReplaying,
                  }),
                }}
              />

              {/* Replaying Sacred Thread Gesture */}
              {replayPoint && (
                <svg
                  viewBox="0 0 440 320"
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Moving Silk Strand to pointer */}
                  <path
                    d={`M 210 160 Q ${(210 + replayPoint.x) / 2} ${Math.max(160, replayPoint.y) + 15} ${replayPoint.x} ${replayPoint.y}`}
                    fill="none"
                    stroke="#B4271F"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 210 160 Q ${(210 + replayPoint.x) / 2} ${Math.max(160, replayPoint.y) + 15} ${replayPoint.x} ${replayPoint.y}`}
                    fill="none"
                    stroke="#DFA327"
                    strokeWidth="1.8"
                    strokeDasharray="4,3"
                  />
                  <circle
                    cx={replayPoint.x}
                    cy={replayPoint.y}
                    r={8}
                    fill="#DFA327"
                    stroke="#231C17"
                    strokeWidth={2}
                    className="animate-ping"
                  />
                  <circle
                    cx={replayPoint.x}
                    cy={replayPoint.y}
                    r={5}
                    fill="#B4271F"
                  />
                </svg>
              )}

              {/* Authentic Tied Rakhi when replay completes */}
              {!isReplaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in z-20">
                  <svg
                    viewBox="0 0 440 320"
                    className="w-full h-full absolute inset-0 overflow-visible"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Under-wrist cords */}
                    <ellipse cx="210" cy="160" rx="25" ry="45" fill="none" stroke="#B4271F" strokeWidth="4.5" strokeLinecap="round" />
                    <ellipse cx="210" cy="160" rx="25" ry="45" fill="none" stroke="#DFA327" strokeWidth="2" strokeDasharray="6,4" />
                    <ellipse cx="212" cy="160" rx="27" ry="47" fill="none" stroke="#7C1E13" strokeWidth="3" />
                    
                    {/* Sacred Double Knot Body */}
                    <ellipse cx="205" cy="182" rx="9" ry="6" fill="#B4271F" stroke="#231C17" strokeWidth="1.5" transform="rotate(-15 205 182)" />
                    <ellipse cx="215" cy="182" rx="9" ry="6" fill="#7C1E13" stroke="#231C17" strokeWidth="1.5" transform="rotate(15 215 182)" />
                    <circle cx="210" cy="182" r="6" fill="#DFA327" stroke="#231C17" strokeWidth="1.5" />

                    {/* Dangling Silk Latkan Tassels */}
                    <path d="M 205 186 Q 198 215, 195 240" fill="none" stroke="#B4271F" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 215 186 Q 222 215, 225 240" fill="none" stroke="#7C1E13" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="195" cy="240" r="4.5" fill="#DFA327" stroke="#231C17" strokeWidth="1" />
                    <circle cx="225" cy="240" r="4.5" fill="#DFA327" stroke="#231C17" strokeWidth="1" />
                    <line x1="195" y1="244" x2="193" y2="256" stroke="#B4271F" strokeWidth="1.5" />
                    <line x1="195" y1="244" x2="197" y2="256" stroke="#DFA327" strokeWidth="1.5" />
                    <line x1="225" y1="244" x2="223" y2="256" stroke="#7C1E13" strokeWidth="1.5" />
                    <line x1="225" y1="244" x2="227" y2="256" stroke="#DFA327" strokeWidth="1.5" />
                  </svg>
                </div>
              )}

              {/* Centered Rakhi Emblem at (210, 160) */}
              <div
                className="absolute pointer-events-none z-30"
                style={{
                  left: '47.7%',
                  top: '50%',
                  transform: 'translate(-50%, -50%) scale(0.72)',
                }}
                dangerouslySetInnerHTML={{
                  __html: renderRakhiSVG(payload.k || { d: 0, c: 0, p: [0], s: 108 }, { size: 210 }),
                }}
              />
            </div>

            {/* Replay Controls & Speed Toggles */}
            <div className="flex items-center justify-between text-xs font-serif pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startReplay}
                  className="min-h-[38px] px-3 py-1 bg-[#FBF6EA] border border-[#231C17] hover:bg-[#F1E3CB] rounded-xs font-bold flex items-center gap-1 cursor-pointer"
                  id="replay-again-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'फिर से देखो' : 'Replay'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = replaySpeed === 1.0 ? 0.5 : 1.0;
                    setReplaySpeed(next);
                    if (replayEngineRef.current) replayEngineRef.current.setSpeed(next);
                  }}
                  className={`min-h-[38px] px-2.5 py-1 border rounded-xs font-mono font-bold cursor-pointer ${
                    replaySpeed === 0.5 ? 'bg-[#B4271F] text-[#FBF6EA] border-[#B4271F]' : 'bg-[#FBF6EA] border-[#231C17]'
                  }`}
                  id="replay-speed-toggle-btn"
                >
                  {replaySpeed === 0.5 ? (lang === 'hi' ? '0.5x' : '0.5x') : '1.0x'}
                </button>
              </div>

              <button
                type="button"
                onClick={startLetterReveal}
                className="min-h-[38px] px-4 py-1.5 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold rounded-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-transform active:translate-y-0.5"
                id="proceed-to-letter-btn"
              >
                <span>{lang === 'hi' ? 'चिट्ठी पढ़ें' : 'Read Letter'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 5. The Letter Reveal */}
        {stage === 'letter' && (
          <div className="space-y-4 py-2 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#231C17]/15 pb-2">
              <h3 className="font-display font-bold text-base text-[#B4271F]">
                {senderName} {lang === 'hi' ? 'की चिट्ठी' : '’s Letter'}
              </h3>
              {isLetterTyping && (
                <button
                  type="button"
                  onClick={skipLetterTyping}
                  className="text-xs font-serif text-[#7A5030] hover:underline cursor-pointer"
                  id="skip-letter-typing-btn"
                >
                  {lang === 'hi' ? 'पूरा पत्र तुरंत देखें (Skip)' : 'Reveal All'}
                </button>
              )}
            </div>

            {/* Letter Text Paper */}
            <div className="p-4 sm:p-5 bg-[#F1E3CB]/60 border border-[#231C17]/30 rounded-xs min-h-[160px] font-hand text-base sm:text-lg text-[#231C17] leading-relaxed whitespace-pre-wrap select-text">
              {(payload.m || (lang === 'hi' ? 'सदा खुश रहो और सुरक्षित रहो।' : 'Stay blessed and protected always.')).slice(
                0,
                revealedChars
              )}
              {isLetterTyping && <span className="inline-block w-2 h-5 bg-[#B4271F] ml-1 animate-pulse" />}
            </div>

            {/* Controls: Save to Peti & Proceed to Vachan Reply */}
            <div className="pt-3 border-t border-[#231C17]/15 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSaveToPeti({
                      id: rakhiId,
                      created_at: new Date().toISOString(),
                      sender: senderName,
                      receiver: receiverName,
                      rishta_id: payload.t || 0,
                      letter: payload.m || '',
                      raw_payload: JSON.stringify(payload),
                      hash: window.location.hash || '',
                      rakhi_config: payload.k || { d: 0, c: 0, p: [0], s: 108 },
                      year: new Date().getFullYear(),
                    });
                    audio.playGhungroo();
                  }}
                  className="min-h-[40px] px-3 py-1.5 bg-[#FBF6EA] border border-[#231C17] hover:bg-[#F1E3CB] text-xs font-serif font-bold rounded-xs flex items-center gap-1.5 cursor-pointer"
                  id="save-to-peti-btn"
                >
                  <Archive className="w-3.5 h-3.5 text-[#B4271F]" />
                  <span>{lang === 'hi' ? 'पेटी में रखें' : 'Save to Peti'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadRakhiFile}
                  className="min-h-[40px] px-3 py-1.5 bg-[#FBF6EA] border border-[#231C17] hover:bg-[#F1E3CB] text-xs font-serif font-bold rounded-xs flex items-center gap-1.5 cursor-pointer"
                  id="download-rakhi-file-btn"
                >
                  <Download className="w-3.5 h-3.5 text-[#5F6E36]" />
                  <span>{lang === 'hi' ? '.rakhi फ़ाइल' : '.rakhi File'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onGoToReply}
                className="min-h-[40px] px-5 py-2 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs shadow-[2px_2px_0px_#231C17] flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
                id="proceed-to-vachan-reply-btn"
              >
                <span>{lang === 'hi' ? 'वचन व शगुन उपहार भेजें (Act 7)' : 'Send Vachan & Reply'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
