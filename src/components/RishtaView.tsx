import React, { useState } from 'react';
import { RISHTAS } from '../data/rishtas';
import { RishtaInfo } from '../types';
import { audio } from '../core/audio';
import { ArrowRight, UserCheck, Sparkles } from 'lucide-react';

interface RishtaViewProps {
  selectedRishtaId: number;
  receiverName: string;
  senderName: string;
  onSelectRishta: (rishtaId: number) => void;
  onChangeNames: (receiver: string, sender: string) => void;
  onNext: () => void;
  lang: 'hi' | 'en';
}

export const RishtaView: React.FC<RishtaViewProps> = ({
  selectedRishtaId,
  receiverName,
  senderName,
  onSelectRishta,
  onChangeNames,
  onNext,
  lang,
}) => {
  const [localReceiver, setLocalReceiver] = useState(receiverName);
  const [localSender, setLocalSender] = useState(senderName);

  const handleRishtaClick = (id: number) => {
    onSelectRishta(id);
    audio.playGhungroo();
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeNames(localReceiver.trim() || (lang === 'hi' ? 'भाई / बहना' : 'Sibling'), localSender.trim() || (lang === 'hi' ? 'स्नेही' : 'Sender'));
    onNext();
  };

  const currentRishta = RISHTAS.find((r) => r.id === selectedRishtaId) || RISHTAS[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title & Stage Guide */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'चरण १ · रिश्ता चुनें' : 'Act 1 · The Bond'}
        </span>
        <h2 className="text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'किसके लिए धागा बांध रही हो?' : 'Who is this sacred thread for?'}
        </h2>
        <p className="text-sm font-serif text-[#231C17]/80 mt-1 max-w-xl mx-auto">
          {lang === 'hi'
            ? 'रिश्ता सिर्फ भाई-बहन का नहीं — हर उस रिश्ते का है जो रक्षा, प्रेम और आदर से बंधा है।'
            : 'Raksha Bandhan is for every bond anchored in care, guardianship, and affection.'}
        </p>
      </div>

      {/* 14 Rishtas Vintage Album Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {RISHTAS.map((rishta) => {
          const isSelected = rishta.id === selectedRishtaId;
          return (
            <button
              key={rishta.id}
              type="button"
              onClick={() => handleRishtaClick(rishta.id)}
              className={`w-full h-36 sm:h-38 p-3.5 border-2 rounded-xs text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#FBF6EA] border-[#B4271F] shadow-[3px_3px_0px_#B4271F]'
                  : 'bg-[#F1E3CB]/70 border-[#231C17]/30 hover:border-[#231C17] hover:bg-[#FBF6EA]'
              }`}
              id={`rishta-card-${rishta.id}`}
            >
              {/* Photo corner accents */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#7A5030]" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#7A5030]" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#7A5030]" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#7A5030]" />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#9C5A2D] font-semibold">#{rishta.id + 1}</span>
                  {isSelected && <UserCheck className="w-4 h-4 text-[#B4271F]" />}
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-[#231C17] leading-tight">
                  {lang === 'hi' ? rishta.title_hi : rishta.title_en}
                </h3>
              </div>

              <p className="text-[11px] font-serif text-[#231C17]/70 line-clamp-2 leading-snug">
                {lang === 'hi' ? rishta.desc_hi : rishta.desc_en}
              </p>
            </button>
          );
        })}
      </div>

      {/* Names Form & Next Step Bar */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleProceed}
          className="bg-[#FBF6EA] border-2 border-[#231C17] p-5 sm:p-6 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-4"
        >
          <div className="border-b border-[#231C17]/15 pb-3">
            <h4 className="font-display text-lg font-bold text-[#B4271F] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#DFA327]" />
              <span>{lang === 'hi' ? currentRishta.title_hi : currentRishta.title_en}</span>
            </h4>
            <p className="text-xs font-serif text-[#231C17]/80">
              {lang === 'hi' ? currentRishta.desc_hi : currentRishta.desc_en}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="receiver-name-input" className="text-xs font-bold font-serif text-[#231C17]">
                {lang === 'hi' ? 'पाने वाले का नाम (Receiver)' : 'Receiver’s Name'}
              </label>
              <input
                id="receiver-name-input"
                type="text"
                maxLength={40}
                value={localReceiver}
                onChange={(e) => setLocalReceiver(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. रोहन भैया / स्नेहा' : 'e.g. Rohan / Sneha'}
                className="w-full p-2 bg-[#F1E3CB] border border-[#231C17] rounded-xs text-sm font-hand text-[#231C17] focus:outline-none focus:ring-2 focus:ring-[#B4271F]"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="sender-name-input" className="text-xs font-bold font-serif text-[#231C17]">
                {lang === 'hi' ? 'आपका नाम (Your Name / Sender)' : 'Your Name (Sender)'}
              </label>
              <input
                id="sender-name-input"
                type="text"
                maxLength={40}
                value={localSender}
                onChange={(e) => setLocalSender(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. पूजा / अमित' : 'e.g. Pooja / Amit'}
                className="w-full p-2 bg-[#F1E3CB] border border-[#231C17] rounded-xs text-sm font-hand text-[#231C17] focus:outline-none focus:ring-2 focus:ring-[#B4271F]"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs btn-3d flex items-center gap-2 cursor-pointer"
              id="rishta-next-btn"
            >
              <span>{lang === 'hi' ? 'कारीगर की मेज़ (कारखाना) चलें' : 'Proceed to Crafting Table'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
