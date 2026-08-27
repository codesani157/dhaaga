import React, { useState, useRef, useEffect } from 'react';
import { ViewType } from '../types';
import { audio } from '../core/audio';
import { Card3DTilt } from './Card3DTilt';
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

  // Kolam dot coordinates (symmetric 3x3 pulli grid)
  const dots = [
    { id: 0, x: 100, y: 50 },
    { id: 1, x: 150, y: 50 },
    { id: 2, x: 200, y: 50 },
    { id: 3, x: 100, y: 100 },
    { id: 4, x: 150, y: 100 },
    { id: 5, x: 200, y: 100 },
    { id: 6, x: 100, y: 150 },
    { id: 7, x: 150, y: 150 },
    { id: 8, x: 200, y: 150 },
  ];

  const handleDotTouch = (dotId: number) => {
    if (!kolamConnected.includes(dotId)) {
      const next = [...kolamConnected, dotId];
      setKolamConnected(next);
      // Play sequential Indian classical Sitar note
      audio.playSitar(undefined, true);

      // Check if user connected enough dots to complete the auspicious loop
      if (next.length >= 5) {
        audio.playMandirGhanti(1.0, 1.3);
        audio.playTanpuraDrone();
        audio.playGhungroo(1.2);
        setIsOpen(true);
      }
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
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh] perspective-1200">
      {/* Threshold / Chaukhat Container with 3D Tilt & Lighting */}
      <Card3DTilt
        maxTilt={5}
        perspective={1200}
        scaleHover={1.01}
        enableGlare={true}
        className="w-full max-w-xl"
      >
        <div className="w-full bg-[#FBF6EA] border-2 border-[#231C17] p-6 sm:p-8 rounded-sm shadow-[5px_5px_0px_#231C17] relative transition-all duration-700">
          {/* Decorative 3D Diya Lamps at Arch Top */}
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
                  : 'Complete the threshold kolam loop (drag through the dots):'}
              </p>

              <div
                className="relative w-[300px] h-[200px] border border-dashed border-[#B5872B] bg-[#F1E3CB]/60 rounded-xs touch-none select-none flex items-center justify-center shadow-inner"
                onPointerDown={() => {
                  isDragging.current = true;
                }}
                onPointerUp={() => {
                  isDragging.current = false;
                }}
                id="threshold-kolam-canvas"
              >
                <svg className="w-full h-full pointer-events-none">
                  {/* Connected strokes */}
                  {kolamConnected.length > 1 && (
                    <path
                      d={kolamConnected.reduce((acc, id, idx) => {
                        const dot = dots[id];
                        return idx === 0 ? `M ${dot.x} ${dot.y}` : `${acc} L ${dot.x} ${dot.y}`;
                      }, '')}
                      stroke="#B4271F"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>

                {/* Dot targets */}
                {dots.map((d) => (
                  <button
                    key={d.id}
                    onPointerEnter={() => isDragging.current && handleDotTouch(d.id)}
                    onPointerDown={() => handleDotTouch(d.id)}
                    style={{ left: `${d.x - 14}px`, top: `${d.y - 14}px` }}
                    className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      kolamConnected.includes(d.id) ? 'scale-125' : 'hover:scale-110'
                    }`}
                    aria-label={`Dot ${d.id}`}
                    id={`kolam-dot-${d.id}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        kolamConnected.includes(d.id)
                          ? 'bg-[#B4271F] ring-2 ring-[#DFA327] shadow-[0_0_8px_#DFA327]'
                          : 'bg-[#7C1E13]/60'
                      }`}
                    />
                  </button>
                ))}
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
      </Card3DTilt>

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
