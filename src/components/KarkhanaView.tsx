import React, { useState } from 'react';
import { RakhiConfig } from '../types';
import { DORIS, CENTREPIECES, PALETTES, LATKANS, SOUND_VOICES } from '../data/materials';
import { renderRakhiSVG } from '../art/rakhi';
import { generateSeed, seedToRakhiId } from '../core/prng';
import { audio } from '../core/audio';
import { RefreshCw, ArrowRight, ArrowLeft, Sliders, Sparkles, Volume2 } from 'lucide-react';

interface KarkhanaViewProps {
  config: RakhiConfig;
  onChangeConfig: (newConfig: RakhiConfig) => void;
  onNext: () => void;
  onBack: () => void;
  lang: 'hi' | 'en';
}

export const KarkhanaView: React.FC<KarkhanaViewProps> = ({
  config,
  onChangeConfig,
  onNext,
  onBack,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'dori' | 'centre' | 'palette' | 'latkan' | 'sound'>('dori');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const totalCombinations = 12 * 16 * 8 * 20 * 6; // 184,320 authentic variants

  const handleReseed = () => {
    const freshSeed = generateSeed();
    onChangeConfig({
      ...config,
      s: freshSeed,
    });
    audio.playSitar();
  };

  const handleRandomHarmonious = () => {
    const randomDori = Math.floor(Math.random() * DORIS.length);
    const randomCentre = Math.floor(Math.random() * CENTREPIECES.length);
    const randomPalette = Math.floor(Math.random() * PALETTES.length);
    const randomFolds = 4 + Math.floor(Math.random() * 9);
    const freshSeed = generateSeed();

    onChangeConfig({
      d: randomDori,
      c: randomCentre,
      p: [randomPalette],
      s: freshSeed,
      j: randomFolds,
      h: [Math.floor(Math.random() * LATKANS.length)],
      z: Math.floor(Math.random() * SOUND_VOICES.length),
    });
    audio.playMandirGhanti();
  };

  const handleDoriSelect = (id: number) => {
    onChangeConfig({ ...config, d: id });
    audio.playGhungroo();
  };

  const handleCentreSelect = (id: number) => {
    onChangeConfig({ ...config, c: id });
    audio.playGhungroo();
  };

  const handlePaletteSelect = (id: number) => {
    onChangeConfig({ ...config, p: [id] });
    audio.playGhungroo();
  };

  const handleToggleLatkan = (id: number) => {
    const current = config.h || [];
    let updated: number[];
    if (current.includes(id)) {
      updated = current.filter((x) => x !== id);
    } else {
      if (current.length >= 3) {
        updated = [...current.slice(1), id];
      } else {
        updated = [...current, id];
      }
    }
    onChangeConfig({ ...config, h: updated });
    audio.playGhungroo();
  };

  const rakhiId = seedToRakhiId(config.s);

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Title & Stage Guide */}
      <div className="text-center mb-5">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'चरण २ · कारीगर का कारखाना' : 'Act 2 · The Artisan Workbench'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'धागे और सामग्री का संयोजन' : 'Compose Thread, Craft & Palette'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5">
          {lang === 'hi'
            ? 'अपनी पसंद का धागा, सांझी जाली या लोक-कला केंद्र और प्राकृतिक रंग चुनें।'
            : 'Select braided cords, paper-cut jaali or folk motifs, and natural-dye palettes.'}
        </p>
      </div>

      {/* Main Workbench: Left Live Center + Right Drawer */}
      <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left: Live Center Preview on Unbleached Paper */}
        <div className="lg:col-span-5 bg-[#FBF6EA] border-2 border-[#231C17] p-4 sm:p-6 rounded-xs shadow-[4px_4px_0px_#231C17] flex flex-col items-center justify-between min-h-[340px] sm:min-h-[400px] relative">
          {/* Top Info Bar */}
          <div className="w-full flex items-center justify-between border-b border-[#231C17]/15 pb-2 text-xs font-mono">
            <span className="text-[#B4271F] font-bold tracking-wider">{rakhiId}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRandomHarmonious}
                className="flex items-center gap-1 text-[#5F6E36] hover:text-[#425022] cursor-pointer px-2 py-1 rounded-xs bg-[#EFE3CF]/60 border border-[#231C17]/15 text-[11px] font-serif"
                title="शुभ संयोग (Harmonious Blend)"
                id="karkhana-harmonious-btn"
              >
                <Sparkles className="w-3 h-3 text-[#DFA327]" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'संयोग' : 'Blend'}</span>
              </button>

              <button
                type="button"
                onClick={handleReseed}
                className="flex items-center gap-1 text-[#7A5030] hover:text-[#B4271F] cursor-pointer px-2 py-1 rounded-xs hover:bg-[#DCC9A6]/40 text-[11px] font-serif"
                title="कारीगर का मन (Reseed)"
                id="karkhana-reseed-btn"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{lang === 'hi' ? 'पुनः' : 'Reseed'}</span>
              </button>
            </div>
          </div>

          {/* Live Render Area: 2D Vector */}
          <div className="w-full my-auto py-2 sm:py-4 flex items-center justify-center min-h-[260px]">
            <div
              className="scale-100 sm:scale-115 md:scale-125 transition-transform"
              dangerouslySetInnerHTML={{ __html: renderRakhiSVG(config, { size: 260 }) }}
            />
          </div>

          {/* Bottom Combination Stat */}
          <div className="w-full pt-2.5 border-t border-[#231C17]/15 text-center text-[11px] font-serif text-[#231C17]/70">
            {lang === 'hi'
              ? `शुद्ध हस्त-रचित ज्यामिति · ${totalCombinations.toLocaleString('en-IN')} वास्तविक संयोजन`
              : `Handcrafted geometry · ${totalCombinations.toLocaleString()} unique combinations`}
          </div>
        </div>

        {/* Right: Craft Material Drawer */}
        <div className="lg:col-span-7 bg-[#FBF6EA] border-2 border-[#231C17] p-4 sm:p-5 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-4">
          {/* Material Category Tabs with Smooth Scroll */}
          <div className="flex border-b border-[#231C17]/20 pb-2 gap-1.5 overflow-x-auto no-scrollbar text-xs font-serif">
            {[
              { id: 'dori', label_hi: 'डोर / धागा', label_en: 'Dori (Cord)' },
              { id: 'centre', label_hi: 'केंद्र व सांझी', label_en: 'Centerpiece' },
              { id: 'palette', label_hi: 'रंग (डाई)', label_en: 'Palette' },
              { id: 'latkan', label_hi: 'लटकन', label_en: 'Hangings' },
              { id: 'sound', label_hi: 'ध्वनि', label_en: 'Sound' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xs font-bold whitespace-nowrap cursor-pointer transition-all min-h-[40px] flex items-center ${
                  activeTab === tab.id
                    ? 'bg-[#B4271F] text-[#FBF6EA] shadow-xs'
                    : 'text-[#231C17] hover:bg-[#DCC9A6]/50 bg-[#F1E3CB]/60'
                }`}
                id={`tab-${tab.id}`}
              >
                {lang === 'hi' ? tab.label_hi : tab.label_en}
              </button>
            ))}
          </div>

          {/* Tab 1: 12 Doris */}
          {activeTab === 'dori' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {DORIS.map((d) => {
                const isSelected = config.d === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleDoriSelect(d.id)}
                    className={`p-3 text-left border rounded-xs text-xs font-serif transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? 'border-[#B4271F] bg-[#F1E3CB] font-bold shadow-xs ring-1 ring-[#B4271F]'
                        : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                    }`}
                    id={`dori-opt-${d.id}`}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      {d.colors.map((c, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[11px] leading-tight">{lang === 'hi' ? d.name_hi : d.name_en}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: 16 Centrepieces + Sanjhi sliders */}
          {activeTab === 'centre' && (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {/* Sanjhi Fold & Depth Controls if Sanjhi (id 0) is selected */}
              {config.c === 0 && (
                <div className="p-3 bg-[#F1E3CB] border border-[#B5872B] rounded-xs space-y-2 text-xs font-serif">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#B4271F] flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'सांझी जाली पेपर-कट गणित:' : 'Sanjhi Paper-Cut Folds:'}
                    </span>
                    <span className="font-mono text-[#231C17] font-bold">{config.j || 8} {lang === 'hi' ? 'तह' : 'Folds'}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={config.j || 8}
                    onChange={(e) => onChangeConfig({ ...config, j: Number(e.target.value) })}
                    className="w-full accent-[#B4271F] cursor-pointer h-2 bg-[#DCC9A6] rounded-full"
                    id="sanjhi-fold-range"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CENTREPIECES.map((c) => {
                  const isSelected = config.c === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleCentreSelect(c.id)}
                      className={`p-3 text-left border rounded-xs text-xs font-serif transition-all cursor-pointer min-h-[64px] ${
                        isSelected
                          ? 'border-[#B4271F] bg-[#F1E3CB] font-bold shadow-xs ring-1 ring-[#B4271F]'
                          : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                      }`}
                      id={`centre-opt-${c.id}`}
                    >
                      <div className="font-bold text-[12px] text-[#231C17]">{lang === 'hi' ? c.name_hi : c.name_en}</div>
                      <div className="text-[10px] text-[#7A5030] mt-0.5">{c.tradition}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: 8 Palettes */}
          {activeTab === 'palette' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {PALETTES.map((p) => {
                const isSelected = config.p?.[0] === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePaletteSelect(p.id)}
                    className={`p-3 text-left border rounded-xs transition-all cursor-pointer min-h-[64px] ${
                      isSelected
                        ? 'border-[#B4271F] bg-[#F1E3CB] shadow-xs ring-1 ring-[#B4271F]'
                        : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                    }`}
                    id={`palette-opt-${p.id}`}
                  >
                    <div className="font-bold text-xs font-serif mb-1.5 text-[#231C17]">
                      {lang === 'hi' ? p.name_hi : p.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.colors.map((hex, i) => (
                        <div key={i} className="w-5 h-5 rounded-xs border border-black/20" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 4: Latkans */}
          {activeTab === 'latkan' && (
            <div className="space-y-2">
              <p className="text-xs text-[#231C17]/80 font-serif">
                {lang === 'hi'
                  ? 'अधिकतम ३ लटकन चुनें (फोन हिलाने पर लोलक की तरह झूलेंगे):'
                  : 'Select up to 3 hangings (will sway with physics):'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {LATKANS.map((l) => {
                  const isSelected = (config.h || []).includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => handleToggleLatkan(l.id)}
                      className={`p-3 text-left border rounded-xs text-xs font-serif transition-all cursor-pointer min-h-[48px] ${
                        isSelected
                          ? 'border-[#B4271F] bg-[#F1E3CB] font-bold shadow-xs ring-1 ring-[#B4271F]'
                          : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                      }`}
                      id={`latkan-opt-${l.id}`}
                    >
                      <span className="text-[11px]">{lang === 'hi' ? l.name_hi : l.name_en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 5: Sound Voice */}
          {activeTab === 'sound' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SOUND_VOICES.map((v) => {
                  const isSelected = (config.z || 0) === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        onChangeConfig({ ...config, z: v.id });
                        if (v.id === 1) audio.playGhungroo(1.2);
                        if (v.id === 2) audio.playMandirGhanti(1.0, 1.2);
                        if (v.id === 3) audio.playShankh();
                        if (v.id === 4) audio.playSitar();
                        if (v.id === 5) audio.playTanpuraDrone();
                        if (v.id === 6) audio.playAkshatShower();
                      }}
                      className={`p-3 text-left border rounded-xs text-xs font-serif transition-all cursor-pointer flex items-center justify-between min-h-[50px] ${
                        isSelected
                          ? 'border-[#B4271F] bg-[#F1E3CB] font-bold ring-1 ring-[#B4271F]'
                          : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                      }`}
                      id={`sound-opt-${v.id}`}
                    >
                      <span>{lang === 'hi' ? v.name_hi : v.name_en}</span>
                      <Volume2 className="w-3.5 h-3.5 text-[#B4271F]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-[#231C17]/15 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2.5 border border-[#231C17]/40 text-[#231C17] rounded-xs font-serif text-xs hover:bg-[#DCC9A6]/40 cursor-pointer flex items-center gap-1.5 min-h-[44px]"
              id="karkhana-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पीछे' : 'Back'}</span>
            </button>

            <button
              onClick={onNext}
              className="px-6 py-2.5 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs shadow-[2px_2px_0px_#231C17] flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5 min-h-[44px]"
              id="karkhana-next-btn"
            >
              <span>{lang === 'hi' ? 'थाल व चिट्ठी (Act 3)' : 'Thaal & Letter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
