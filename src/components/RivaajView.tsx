import React, { useState } from 'react';
import { RIVAAJ_TRADITIONS } from '../data/rivaaj';
import { audio } from '../core/audio';
import { BookOpen, Sparkles, MapPin } from 'lucide-react';

interface RivaajViewProps {
  lang: 'hi' | 'en';
}

export const RivaajView: React.FC<RivaajViewProps> = ({ lang }) => {
  const [selectedRivaajId, setSelectedRivaajId] = useState<number>(0);

  const current = RIVAAJ_TRADITIONS.find((r) => r.id === selectedRivaajId) || RIVAAJ_TRADITIONS[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'परंपराएं · भारत के ९ अंचल' : '9 Authentic Regional Traditions'}
        </span>
        <h2 className="text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'रक्षाबंधन के ९ विविध रूप व इतिहास' : 'Regional Rites & Living Heritage'}
        </h2>
        <p className="text-sm font-serif text-[#231C17]/80 mt-1 max-w-xl mx-auto">
          {lang === 'hi'
            ? 'श्रावण पूर्णिमा पर केवल भाई-बहन ही नहीं — समुद्र, गोवंश, प्रकृति और समाज को भी रक्षासूत्र बांधा जाता है।'
            : 'Explore the diverse threads of Shravana Purnima across India — from fishing seas to sacred trees.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: 9 Traditions Sidebar List */}
        <div className="lg:col-span-4 bg-[#FBF6EA] border-2 border-[#231C17] p-4 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-2">
          <div className="font-display font-bold text-sm text-[#B4271F] border-b border-[#231C17]/15 pb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'hi' ? 'परंपरा सूची' : 'Tradition Index'}</span>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {RIVAAJ_TRADITIONS.map((r) => {
              const isSelected = r.id === selectedRivaajId;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRivaajId(r.id);
                    audio.playGhungroo();
                  }}
                  className={`w-full p-2.5 text-left border rounded-xs text-xs font-serif transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#B4271F] bg-[#F1E3CB] font-bold shadow-xs'
                      : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                  }`}
                  id={`rivaaj-list-item-${r.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9C5A2D] font-mono">#{r.id + 1}</span>
                    <span className="text-[10px] text-[#7A5030] flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{r.region}</span>
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#231C17] mt-0.5">
                    {lang === 'hi' ? r.title_hi : r.title_en}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Deep Dive Article Reader */}
        <div className="lg:col-span-8 bg-[#FBF6EA] border-2 border-[#231C17] p-6 sm:p-8 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-5">
          {/* Article Header */}
          <div className="border-b border-[#231C17]/15 pb-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#9C5A2D] uppercase font-bold">
                {current.region} · {lang === 'hi' ? current.when_hi : current.when_en}
              </span>
              <span className="text-xs font-serif text-[#5F6E36] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'जीवंत रिवाज' : 'Living Lore'}</span>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#B4271F]">
              {lang === 'hi' ? current.title_hi : current.title_en}
            </h3>

            <p className="text-sm font-serif italic text-[#7A5030]">
              {lang === 'hi' ? current.subtitle_hi : current.subtitle_en}
            </p>
          </div>

          {/* Historical & Cultural Body */}
          <div className="space-y-4 font-serif text-sm text-[#231C17] leading-relaxed">
            <div className="p-4 bg-[#F1E3CB]/60 border-l-4 border-[#B4271F] rounded-r-xs">
              <p className="font-medium text-xs sm:text-sm">
                {lang === 'hi' ? current.desc_hi : current.desc_en}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-display font-bold text-base text-[#7C1E13]">
                {lang === 'hi' ? 'शिल्प व अनुष्ठान विधि' : 'The Sacred Craft & Ritual'}
              </h4>
              <p className="text-xs sm:text-sm text-[#231C17]/90 leading-relaxed">
                {lang === 'hi' ? current.ritual_hi : current.ritual_en}
              </p>
            </div>

            {/* Cultural Provenance & Respect Note */}
            <div className="pt-4 border-t border-[#231C17]/15 text-xs text-[#7A5030] font-serif italic">
              {lang === 'hi'
                ? `स्रोत व प्रामाणिकता: ${current.provenance}`
                : `Provenance & Heritage: ${current.provenance}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
