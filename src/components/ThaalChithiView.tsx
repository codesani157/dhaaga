import React, { useState, useRef } from 'react';
import { ThaalConfig } from '../types';
import { MITHAI_LIST } from '../data/mithai';
import { RISHTAS } from '../data/rishtas';
import { renderThaalSVG } from '../art/thaal';
import { DEVANAGARI_MAP } from '../data/strings';
import { audio } from '../core/audio';
import { ArrowRight, ArrowLeft, Check, Sparkles, Feather } from 'lucide-react';

interface ThaalChithiViewProps {
  rishtaId: number;
  receiverName: string;
  thaalConfig: ThaalConfig;
  letterText: string;
  typingRhythm: string;
  onChangeThaal: (cfg: ThaalConfig) => void;
  onChangeLetter: (letter: string, rhythm: string) => void;
  onNext: () => void;
  onBack: () => void;
  lang: 'hi' | 'en';
}

export const ThaalChithiView: React.FC<ThaalChithiViewProps> = ({
  rishtaId,
  receiverName,
  thaalConfig,
  letterText,
  typingRhythm,
  onChangeThaal,
  onChangeLetter,
  onNext,
  onBack,
  lang,
}) => {
  const [localLetter, setLocalLetter] = useState(letterText);
  const [recordRhythm, setRecordRhythm] = useState(true);
  const [suggestedWord, setSuggestedWord] = useState<string | null>(null);

  const lastKeyTime = useRef<number>(performance.now());
  const gaps = useRef<number[]>([]);

  const rishta = RISHTAS.find((r) => r.id === rishtaId) || RISHTAS[0];
  const maxChars = 600;
  const remainingInk = Math.max(0, maxChars - localLetter.length);

  // Handle letter typing and record authentic rhythm ticks (20ms units)
  const handleLetterChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= maxChars) {
      const now = performance.now();
      if (recordRhythm) {
        const deltaMs = Math.min(2000, Math.max(40, now - lastKeyTime.current));
        const tick = Math.round(deltaMs / 20);
        gaps.current.push(tick);
      }
      lastKeyTime.current = now;

      setLocalLetter(val);

      // Check phonetic IME suggestions
      const words = val.split(/\s+/);
      const lastWord = words[words.length - 1]?.toLowerCase();
      if (lastWord && DEVANAGARI_MAP[lastWord]) {
        setSuggestedWord(DEVANAGARI_MAP[lastWord]);
      } else {
        setSuggestedWord(null);
      }

      // Encode rhythm to simple compact string
      const rle = gaps.current.slice(-200).map((g) => g.toString(36)).join('');
      onChangeLetter(val, rle);

      // Play intimate Kalam ink scratch on cotton paper
      if (Math.random() > 0.35) {
        audio.playKalamScratch(1.1);
      }
    }
  };

  const handleApplySuggestion = () => {
    if (!suggestedWord) return;
    const words = localLetter.trim().split(/\s+/);
    words[words.length - 1] = suggestedWord;
    const updated = words.join(' ') + ' ';
    setLocalLetter(updated);
    setSuggestedWord(null);
    onChangeLetter(updated, typingRhythm);
    audio.playSitar(undefined, false);
  };

  const handleSweetSelect = (sweetId: number) => {
    onChangeThaal({ ...thaalConfig, s: sweetId });
    audio.playSweetPrasad();
  };

  const handlePromptAccept = (prompt: string) => {
    const updated = prompt + '\n\n' + localLetter;
    setLocalLetter(updated);
    onChangeLetter(updated, typingRhythm);
    audio.playSitar();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Title & Stage Guide */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'चरण ३ · पूजा थाल व चिट्ठी' : 'Act 3 · The Thaal & Letter'}
        </span>
        <h2 className="text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'थाल सजाएं और दिल की बात लिखें' : 'Arrange the Thaal & Write Your Letter'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5">
          {lang === 'hi'
            ? 'अपनी पसंद की मिठाई चुनें और कलाम की स्याही से चिट्ठी लिखें।'
            : 'Select festive mithai and write your heartfelt letter with natural ink.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Thaal Brass Plate & Mithai Selector */}
        <div className="lg:col-span-5">
          <div className="w-full bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[5px_5px_0px_#231C17] space-y-4">
            <div className="flex items-center justify-between border-b border-[#231C17]/15 pb-2">
              <h3 className="font-display font-bold text-base text-[#B4271F] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#DFA327]" />
                <span>{lang === 'hi' ? 'पूजा का पीतल थाल' : 'The Brass Thaal'}</span>
              </h3>
              <span className="text-xs font-serif text-[#7A5030] font-bold">
                {MITHAI_LIST[thaalConfig.s || 0]?.name_hi}
              </span>
            </div>

            {/* SVG Live Thaal */}
            <div
              className="flex items-center justify-center py-2 scale-100 sm:scale-105 animate-float-3d"
              dangerouslySetInnerHTML={{ __html: renderThaalSVG(thaalConfig, { size: 230 }) }}
            />

            {/* 24 Regional Sweets Drawer */}
            <div className="space-y-2 pt-2 border-t border-[#231C17]/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-serif text-[#231C17]">
                  {lang === 'hi' ? 'मिठाई चुनें (२४ प्रांतीय मिष्ठान):' : 'Select Mithai (24 Regional Sweets):'}
                </span>
                <span className="text-[10px] text-[#9C5A2D] font-mono">
                  {MITHAI_LIST[thaalConfig.s || 0]?.region}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {MITHAI_LIST.map((m) => {
                  const isSelected = (thaalConfig.s || 0) === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSweetSelect(m.id)}
                      className={`p-2 text-left border rounded-xs text-[11px] font-serif transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#B4271F] bg-[#F1E3CB] font-bold shadow-xs'
                          : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                      }`}
                      id={`sweet-opt-${m.id}`}
                    >
                      <div>{lang === 'hi' ? m.name_hi : m.name_en}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: The Deckle-Edge Chithi (Letter) */}
        <div className="lg:col-span-7">
          <div className="w-full bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[5px_5px_0px_#231C17] space-y-4">
            <div className="flex items-center justify-between border-b border-[#231C17]/15 pb-2">
              <h3 className="font-display font-bold text-base text-[#B4271F] flex items-center gap-1.5">
                <Feather className="w-4 h-4" />
                <span>{lang === 'hi' ? `${receiverName} के नाम चिट्ठी` : `Letter to ${receiverName}`}</span>
              </h3>

              {/* Ink Remaining Nib Counter */}
              <span className="text-xs font-serif text-[#7A5030] flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#B4271F]" />
                <span>{lang === 'hi' ? `स्याही: ${remainingInk} अक्षर शेष` : `Ink: ${remainingInk} chars`}</span>
              </span>
            </div>

            {/* Quick Opening Line Suggestion for this Rishta */}
            <div className="p-2.5 bg-[#F1E3CB]/70 border border-dashed border-[#B5872B] rounded-xs text-xs font-serif">
              <div className="flex items-center justify-between gap-2">
                <span className="italic text-[#7A5030] line-clamp-1">
                  "{lang === 'hi' ? rishta.prompt_hi : rishta.prompt_en}"
                </span>
                <button
                  type="button"
                  onClick={() => handlePromptAccept(lang === 'hi' ? rishta.prompt_hi : rishta.prompt_en)}
                  className="text-[11px] font-bold text-[#B4271F] hover:underline whitespace-nowrap cursor-pointer"
                  id="accept-ghost-prompt-btn"
                >
                  {lang === 'hi' ? 'जोड़ें +' : 'Use +'}
                </button>
              </div>
            </div>

            {/* Phonetic IME Suggestion Strip */}
            {suggestedWord && (
              <div className="flex items-center gap-2 p-2 bg-[#DCC9A6]/50 border border-[#231C17]/30 rounded-xs text-xs font-serif">
                <span className="text-[#231C17]/80">{lang === 'hi' ? 'देवनागरी सुझाव:' : 'Devanagari Suggestion:'}</span>
                <button
                  type="button"
                  onClick={handleApplySuggestion}
                  className="px-2 py-0.5 bg-[#B4271F] text-[#FBF6EA] font-bold rounded-xs cursor-pointer shadow-xs"
                  id="apply-ime-suggestion-btn"
                >
                  {suggestedWord} ↵
                </button>
              </div>
            )}

            {/* Letter Textarea with Ruled Deckle Vibe */}
            <textarea
              value={localLetter}
              onChange={handleLetterChange}
              placeholder={
                lang === 'hi'
                  ? 'यहां अपने दिल की बात लिखें... (आपकी टाइपिंग की गति भी रिकॉर्ड हो रही है)'
                  : 'Write your heartfelt letter here... (Your typing cadence is quietly preserved)'
              }
              rows={8}
              className="w-full p-4 bg-[#F1E3CB]/40 border border-[#231C17]/30 rounded-xs text-base sm:text-lg font-hand text-[#231C17] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#B4271F] resize-none"
              id="chithi-letter-textarea"
            />

            {/* Typing Cadence Helper & Toggle */}
            <div className="flex items-center justify-between text-xs font-serif text-[#231C17]/75">
              <span className="italic">
                {lang === 'hi'
                  ? 'जैसे तुम लिख रही हो, वैसे ही वो पढ़ेगा।'
                  : 'The letter will reveal itself at your natural typing rhythm.'}
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recordRhythm}
                  onChange={(e) => setRecordRhythm(e.target.checked)}
                  className="accent-[#B4271F]"
                  id="toggle-rhythm-checkbox"
                />
                <span>{lang === 'hi' ? 'गति सहेजें' : 'Preserve cadence'}</span>
              </label>
            </div>

            {/* Navigation Controls */}
            <div className="pt-3 border-t border-[#231C17]/15 flex items-center justify-between">
              <button
                onClick={onBack}
                className="px-4 py-2 border border-[#231C17]/40 text-[#231C17] rounded-xs font-serif text-xs hover:bg-[#DCC9A6]/40 cursor-pointer flex items-center gap-1.5 btn-3d-gold"
                id="thaal-back-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'पीछे' : 'Back'}</span>
              </button>

              <button
                onClick={onNext}
                className="px-6 py-2 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs btn-3d flex items-center gap-2 cursor-pointer"
                id="thaal-next-btn"
              >
                <span>{lang === 'hi' ? 'बंधन: कलाई पर बांधें (Act 4)' : 'Tie on Wrist (Act 4)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
