import React, { useState, useRef, useEffect } from 'react';
import { ViewType } from '../types';
import { audio } from '../core/audio';
import { Sparkles, MailOpen, ArrowRight, Flame } from 'lucide-react';

interface ThresholdViewProps {
  onStartCraft: () => void;
  onOpenLink: (link: string) => void;
  lang: 'hi' | 'en';
}

export const ThresholdView: React.FC<ThresholdViewProps> = ({ onStartCraft, onOpenLink, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [kolamConnected, setKolamConnected] = useState<number[]>([]);
  const [pastedLink, setPastedLink] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const isDragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPointerPos, setCurrentPointerPos] = useState<{ x: number; y: number } | null>(null);

  // Kolam dot coordinates (symmetric 3x3 pulli grid on 300x200 canvas)
  const dots = [
    { id: 0, x: 75, y: 45 },
    { id: 1, x: 150, y: 45 },
    { id: 2, x: 225, y: 45 },
    { id: 3, x: 75, y: 100 },
    { id: 4, x: 150, y: 100 },
    { id: 5, x: 225, y: 100 },
    { id: 6, x: 75, y: 155 },
    { id: 7, x: 150, y: 155 },
    { id: 8, x: 225, y: 155 },
  ];

  const handleDotTouch = (dotId: number) => {
    setKolamConnected((prev) => {
      if (prev.includes(dotId)) return prev;
      const next = [...prev, dotId];
      // Play sequential Indian classical Sitar note
      audio.playSitar(undefined, true);
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
      } catch {}

      // Check if user connected enough dots to complete the auspicious loop
      if (next.length >= 5) {
        audio.playMandirGhanti(1.0, 1.3);
        audio.playTanpuraDrone();
        audio.playGhungroo(1.2);
        setIsOpen(true);
      }
      return next;
    });
  };

  const getSvgCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((clientX - rect.left) / rect.width) * 300;
    const y = ((clientY - rect.top) / rect.height) * 200;
    return { x: Math.max(0, Math.min(300, x)), y: Math.max(0, Math.min(200, y)) };
  };

  const checkDotIntersection = (x: number, y: number) => {
    // 44px generous hit radius
    for (const dot of dots) {
      const dist = Math.hypot(dot.x - x, dot.y - y);
      if (dist <= 44) {
        handleDotTouch(dot.id);
        break;
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    isDragging.current = true;
    try {
      if (svgRef.current) {
        svgRef.current.setPointerCapture(e.pointerId);
      }
    } catch {}
    const coords = getSvgCoords(e.clientX, e.clientY);
    if (coords) {
      setCurrentPointerPos(coords);
      checkDotIntersection(coords.x, coords.y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const coords = getSvgCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (isDragging.current) {
      setCurrentPointerPos(coords);
      checkDotIntersection(coords.x, coords.y);
    }
  };

  const handlePointerUp = (e?: React.PointerEvent<SVGSVGElement>) => {
    isDragging.current = false;
    setCurrentPointerPos(null);
    if (e && svgRef.current) {
      try {
        if (svgRef.current.hasPointerCapture(e.pointerId)) {
          svgRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
  };

  const handleDirectEnter = () => {
    setIsOpen(true);
    audio.playMandirGhanti(1.0, 1.2);
    audio.playTanpuraDrone();
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedLink.trim()) {
      onOpenLink(pastedLink.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
      {/* Threshold / Chaukhat Container */}
      <div className="w-full max-w-xl bg-[#FBF6EA] border-2 border-[#231C17] p-6 sm:p-8 rounded-sm shadow-[5px_5px_0px_#231C17] relative transition-all duration-700">
        {/* Decorative Diya Lamps at Arch Top */}
          <div className="absolute -top-3.5 left-6 flex items-center gap-1 bg-[#231C17] text-[#DFA327] px-2.5 py-0.5 rounded-full border border-[#DFA327]/60 shadow-md animate-diya-glow">
            <Flame className="w-3.5 h-3.5 fill-[#DFA327]" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#FFF2B2]">शुभ मंगल</span>
          </div>

          <div className="absolute -top-3.5 right-6 flex items-center gap-1 bg-[#231C17] text-[#DFA327] px-2.5 py-0.5 rounded-full border border-[#DFA327]/60 shadow-md animate-diya-glow">
            <Flame className="w-3.5 h-3.5 fill-[#DFA327]" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#FFF2B2]">पवित्र रक्षा</span>
          </div>

          {/* Arch Header */}
          <div className="text-center pb-4 border-b border-[#231C17]/20 mb-6 pt-1">
            <span className="text-xs uppercase tracking-widest text-[#9C5A2D] font-mono">
              {lang === 'hi' ? 'चौखट · देहरी' : 'The Threshold'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-display text-[#B4271F] mt-1 font-bold">
              {lang === 'hi' ? 'धागा' : 'Dhaaga'}
            </h1>
            <p className="text-sm font-serif text-[#231C17]/80 mt-1 italic">
              {lang === 'hi'
                ? 'राखी बांधी जाती है, भेजी नहीं जाती। इसलिए यहां तुम खुद बांधोगी।'
                : 'A rakhi is tied, never merely sent. Here, you tie it with your own hand.'}
            </p>
          </div>

          {/* Kolam Interaction Area */}
          {!isOpen ? (
            <div className="flex flex-col items-center py-6">
              <p className="text-xs text-[#7C1E13] font-serif mb-3 font-semibold animate-pulse">
                {lang === 'hi'
                  ? 'देहली पर कोलम का फेरा पूरा करो (बिंदुओं को जोड़ें):'
                  : 'Complete the threshold kolam loop (drag or click the dots):'}
              </p>

              {/* Kolam SVG Canvas (Direct Hardware Coordinates) */}
              <div className="relative flex flex-col items-center">
                <svg
                  ref={svgRef}
                  viewBox="0 0 300 200"
                  className="w-[300px] h-[200px] border border-dashed border-[#B5872B] bg-[#F1E3CB]/70 rounded-xs touch-none select-none shadow-inner cursor-crosshair overflow-visible"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  id="threshold-kolam-canvas"
                >
                  {/* Background grid guide lines (subtle sacred geometry) */}
                  <line x1="75" y1="45" x2="225" y2="45" stroke="#DFA327" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="75" y1="100" x2="225" y2="100" stroke="#DFA327" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="75" y1="155" x2="225" y2="155" stroke="#DFA327" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="75" y1="45" x2="75" y2="155" stroke="#DFA327" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="150" y1="45" x2="150" y2="155" stroke="#DFA327" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="225" y1="45" x2="225" y2="155" stroke="#DFA327" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />

                  {/* Dynamic live dragging line to cursor/finger */}
                  {kolamConnected.length > 0 && currentPointerPos && isDragging.current && (
                    <line
                      x1={dots[kolamConnected[kolamConnected.length - 1]].x}
                      y1={dots[kolamConnected[kolamConnected.length - 1]].y}
                      x2={currentPointerPos.x}
                      y2={currentPointerPos.y}
                      stroke="#DFA327"
                      strokeWidth="3"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Connected strokes */}
                  {kolamConnected.length > 1 && (
                    <path
                      d={kolamConnected.reduce((acc, id, idx) => {
                        const dot = dots[id];
                        return idx === 0 ? `M ${dot.x} ${dot.y}` : `${acc} L ${dot.x} ${dot.y}`;
                      }, '')}
                      stroke="#B4271F"
                      strokeWidth="4.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Dot Elements with generous touch targets */}
                  {dots.map((d) => {
                    const isConnected = kolamConnected.includes(d.id);
                    return (
                      <g
                        key={d.id}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDotTouch(d.id);
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleDotTouch(d.id);
                          handlePointerDown(e);
                        }}
                        onPointerEnter={() => {
                          if (isDragging.current) {
                            handleDotTouch(d.id);
                          }
                        }}
                      >
                        {/* Invisible 56px hitbox circle */}
                        <circle cx={d.x} cy={d.y} r="28" fill="transparent" />

                        {/* Outer Glow Ring if connected */}
                        {isConnected && (
                          <circle
                            cx={d.x}
                            cy={d.y}
                            r="12"
                            fill="none"
                            stroke="#DFA327"
                            strokeWidth="3"
                            className="animate-pulse"
                          />
                        )}

                        {/* Visible Dot Core */}
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r={isConnected ? 8 : 6}
                          fill={isConnected ? '#B4271F' : '#7C1E13'}
                          stroke={isConnected ? '#FFF2B2' : '#B5872B'}
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Progress counter */}
              <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-[#7A5030]">
                <span>{lang === 'hi' ? 'प्रगति:' : 'Progress:'}</span>
                <span className="font-bold text-[#B4271F]">{kolamConnected.length} / 5</span>
                {kolamConnected.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setKolamConnected([]);
                      audio.playTear(0.5);
                    }}
                    className="ml-2 underline text-[#7C1E13] hover:text-[#B4271F] cursor-pointer"
                    id="threshold-reset-kolam-btn"
                  >
                    {lang === 'hi' ? 'पुनः बनाएं' : 'Reset'}
                  </button>
                )}
              </div>

              {/* Quick Bypass Link */}
              <button
                onClick={handleDirectEnter}
                className="mt-5 text-xs text-[#7A5030] hover:text-[#B4271F] underline font-serif cursor-pointer"
                id="threshold-direct-enter-btn"
              >
                {lang === 'hi' ? 'सीधा अंदर आ जाओ (Skip ritual)' : 'Enter directly (Skip threshold)'}
              </button>
            </div>
          ) : (
            /* Door Opened State */
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="p-4 bg-[#F1E3CB]/60 border border-[#231C17]/20 rounded-xs text-sm font-serif space-y-2">
                <div className="flex items-center gap-2 text-[#5F6E36] font-bold">
                  <Sparkles className="w-4 h-4 text-[#DFA327] animate-pulse" />
                  <span>{lang === 'hi' ? 'चौखट खुल गई' : 'The doors have opened'}</span>
                </div>
                <p className="text-xs text-[#231C17]/80">
                  {lang === 'hi'
                    ? 'सामग्री चुनो, अपने हाथ से कलाई पर बांधो, चिट्ठी लिखो। तुम्हारी हर हरकत एक अनूठे लिंक में बदल जाएगी।'
                    : 'Choose materials, wrap the thread around the wrist with your own gesture, and write your letter. Everything compresses into a link.'}
                </p>
              </div>

              {/* Two Main Doors */}
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={onStartCraft}
                  className="p-5 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] border-2 border-[#231C17] rounded-xs btn-3d transition-all cursor-pointer flex flex-col items-start gap-2 group"
                  id="door-banao-btn"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-xl font-bold">
                      {lang === 'hi' ? 'राखी बनाओ' : 'Craft a Rakhi'}
                    </span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-xs font-serif text-[#FBF6EA]/80 text-left">
                    {lang === 'hi' ? 'सामग्री, थाल, कलाई व हाथ से बांधना' : 'Materials, Thaal, Wrist & Hand Tying'}
                  </span>
                </button>

                <button
                  onClick={() => setShowPasteModal(true)}
                  className="p-5 bg-[#FBF6EA] hover:bg-[#F1E3CB] text-[#231C17] border-2 border-[#231C17] rounded-xs btn-3d-gold transition-all cursor-pointer flex flex-col items-start gap-2 group"
                  id="door-kholo-btn"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-xl font-bold">
                      {lang === 'hi' ? 'राखी खोलो' : 'Open a Rakhi'}
                    </span>
                    <MailOpen className="w-5 h-5 text-[#B4271F] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-serif text-[#231C17]/70 text-left">
                    {lang === 'hi' ? 'अगर किसी ने लिंक भेजा है तो यहां पेस्ट करें' : 'Paste received link to open & replay'}
                  </span>
                </button>
              </div>
            </div>
          )}

        {/* Honest Truth Manifesto */}
        <div className="mt-8 pt-4 border-t border-[#231C17]/15 text-center text-xs font-serif text-[#231C17]/70 space-y-1">
          <p>{lang === 'hi' ? '₹0 हमेशा के लिए · शून्य डेटाबेस · शून्य विज्ञापन' : '₹0 forever · Zero Database · Zero Ads'}</p>
          <p className="text-[11px] text-[#7A5030]">
            {lang === 'hi'
              ? 'WhatsApp या संदेश में भेजा गया लिंक ही पूरी राखी है।'
              : 'The link you send over messaging IS the entire gift.'}
          </p>
        </div>
      </div>

      {/* Paste Link Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-[#231C17]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FBF6EA] border-2 border-[#231C17] p-6 max-w-md w-full rounded-sm shadow-[6px_6px_0px_#231C17]">
            <h3 className="text-xl font-display text-[#B4271F] font-bold mb-2">
              {lang === 'hi' ? 'आई हुई राखी का लिंक पेस्ट करें' : 'Paste Received Rakhi Link'}
            </h3>
            <p className="text-xs text-[#231C17]/80 font-serif mb-4">
              {lang === 'hi'
                ? 'लिंक के हैश (#1...) में ही चिट्ठी, थाल और उनके हाथ की असली हरकत सुरक्षित है।'
                : 'The link hash (#1...) contains the letter, thaal, and their recorded hand movement.'}
            </p>

            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <textarea
                value={pastedLink}
                onChange={(e) => setPastedLink(e.target.value)}
                placeholder="https://...#1.xxxxxx"
                rows={3}
                className="w-full p-2.5 bg-[#F1E3CB] border border-[#231C17] rounded-xs font-mono text-xs text-[#231C17] focus:outline-none focus:ring-2 focus:ring-[#B4271F]"
                required
                id="paste-link-textarea"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-3 py-1.5 text-xs font-serif rounded border border-[#231C17]/30 hover:bg-[#DCC9A6]/40 cursor-pointer"
                  id="paste-modal-cancel-btn"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#B4271F] text-[#FBF6EA] font-serif text-xs font-bold rounded cursor-pointer hover:bg-[#7C1E13]"
                  id="paste-modal-submit-btn"
                >
                  {lang === 'hi' ? 'राखी खोलें' : 'Open Rakhi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
