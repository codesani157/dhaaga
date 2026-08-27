import React, { useState } from 'react';
import { audio } from '../core/audio';
import { TreePine, Download, Check, Sparkles, Heart } from 'lucide-react';

interface PedViewProps {
  lang: 'hi' | 'en';
}

export const PedView: React.FC<PedViewProps> = ({ lang }) => {
  const [selectedTree, setSelectedTree] = useState(0);
  const [isTied, setIsTied] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [treeLocation, setTreeLocation] = useState('');

  const trees = [
    { id: 0, name_hi: 'पीपल (Peepal)', name_en: 'Sacred Fig (Peepal)', bot: 'Ficus religiosa', oxygen: '24 hrs O2' },
    { id: 1, name_hi: 'नीम (Neem)', name_en: 'Neem', bot: 'Azadirachta indica', oxygen: 'Natural healer' },
    { id: 2, name_hi: 'बरगद (Banyan)', name_en: 'Banyan (Bargad)', bot: 'Ficus benghalensis', oxygen: 'Centuries of shade' },
    { id: 3, name_hi: 'खेजड़ी (Khejri)', name_en: 'Khejri (Bishnoi Tree)', bot: 'Prosopis cineraria', oxygen: 'Desert lifeline' },
    { id: 4, name_hi: 'साल (Sal)', name_en: 'Sal', bot: 'Shorea robusta', oxygen: 'Sacred grove' },
    { id: 5, name_hi: 'अमलतास (Amaltas)', name_en: 'Golden Shower (Amaltas)', bot: 'Cassia fistula', oxygen: 'Summer blooms' },
  ];

  const handleTieTree = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTied(true);
    audio.playMandirGhanti();
  };

  const handlePrintTag = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#5F6E36]">
          {lang === 'hi' ? 'चिपको व विश्नोई परंपरा · वृक्ष रक्षासूत्र' : 'Tree Rakshasutra · The Living Pledge'}
        </span>
        <h2 className="text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'प्रकृति व वृक्ष को रक्षासूत्र बांधें' : 'Bind a Sacred Thread to a Living Tree'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5 max-w-lg mx-auto">
          {lang === 'hi'
            ? 'चिपको आंदोलन और खेजड़ली के ३६३ शहीदों की स्मृति में — पेड़ को सहोदर मानकर उसकी रक्षा का संकल्प लें।'
            : 'In the lineage of Chipko and Bishnoi martyrs — take a vow of guardianship for a tree.'}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left: Tree & Pledge Form */}
        <div className="md:col-span-6 bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-4">
          <h3 className="font-display font-bold text-base text-[#5F6E36] flex items-center gap-1.5 border-b border-[#231C17]/15 pb-2">
            <TreePine className="w-4 h-4" />
            <span>{lang === 'hi' ? 'वृक्ष चयन व संकल्प पत्र' : 'Tree Selection & Pledge'}</span>
          </h3>

          {/* Tree selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-serif text-[#231C17] block">
              {lang === 'hi' ? 'वृक्ष प्रजाति चुनें:' : 'Select Tree Species:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {trees.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTree(t.id)}
                  className={`p-2 text-left border rounded-xs text-xs font-serif transition-all cursor-pointer ${
                    selectedTree === t.id
                      ? 'border-[#5F6E36] bg-[#F1E3CB] font-bold shadow-xs'
                      : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                  }`}
                  id={`tree-opt-${t.id}`}
                >
                  <div className="text-[12px]">{lang === 'hi' ? t.name_hi : t.name_en}</div>
                  <div className="text-[10px] text-[#7A5030] italic font-serif">{t.bot}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleTieTree} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label htmlFor="ped-guardian-name" className="text-xs font-bold font-serif text-[#231C17]">
                {lang === 'hi' ? 'रक्षक का नाम (Your Name):' : 'Guardian Name:'}
              </label>
              <input
                id="ped-guardian-name"
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. सुनीता / राहुल' : 'e.g. Rahul / Sunita'}
                className="w-full p-2 bg-[#F1E3CB] border border-[#231C17] rounded-xs text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ped-location-input" className="text-xs font-bold font-serif text-[#231C17]">
                {lang === 'hi' ? 'वृक्ष का स्थान / बगीचा:' : 'Tree Location / Neighborhood:'}
              </label>
              <input
                id="ped-location-input"
                type="text"
                value={treeLocation}
                onChange={(e) => setTreeLocation(e.target.value)}
                placeholder={lang === 'hi' ? 'उदा. घर के सामने का पार्क / गांव की देहरी' : 'e.g. Neighborhood park'}
                className="w-full p-2 bg-[#F1E3CB] border border-[#231C17] rounded-xs text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#5F6E36] hover:bg-[#4a572a] text-[#FBF6EA] font-display font-bold text-xs rounded-xs shadow-[2px_2px_0px_#231C17] cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              id="ped-tie-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'वृक्ष को रक्षासूत्र बांधें' : 'Bind Sacred Thread to Tree'}</span>
            </button>
          </form>
        </div>

        {/* Right: Printable Certificate / Tree Tag */}
        <div className="md:col-span-6 bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-4">
          <div className="flex items-center justify-between border-b border-[#231C17]/15 pb-2">
            <h3 className="font-display font-bold text-base text-[#B4271F]">
              {lang === 'hi' ? 'वृक्ष रक्षा पत्र (Tree Tag)' : 'Printable Tree Tag'}
            </h3>
            {isTied && (
              <button
                onClick={handlePrintTag}
                className="px-2.5 py-1 bg-[#F1E3CB] hover:bg-[#DCC9A6] border border-[#231C17] text-xs font-serif font-bold rounded-xs flex items-center gap-1 cursor-pointer no-print"
                id="ped-print-btn"
              >
                <Download className="w-3 h-3" />
                <span>{lang === 'hi' ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
              </button>
            )}
          </div>

          {/* Printable Tag Preview */}
          <div className="p-5 bg-[#F1E3CB] border-2 border-dashed border-[#5F6E36] rounded-xs text-center space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#5F6E36] font-bold">
              वृक्ष रक्षासूत्र पत्र · TREE RAKSHA PLEDGE
            </div>

            <div className="w-12 h-12 rounded-full bg-[#5F6E36] text-[#FBF6EA] flex items-center justify-center mx-auto shadow-xs">
              <TreePine className="w-6 h-6" />
            </div>

            <div className="font-display font-bold text-lg text-[#231C17]">
              {lang === 'hi' ? trees[selectedTree].name_hi : trees[selectedTree].name_en}
            </div>
            <div className="text-xs font-serif italic text-[#7A5030]">{trees[selectedTree].bot}</div>

            <p className="text-xs font-hand text-[#231C17] leading-relaxed pt-2 border-t border-[#231C17]/15">
              "{lang === 'hi'
                ? `मैं ${guardianName || 'प्रकृति प्रेमी'}, यह संकल्प लेता/लेती हूँ कि ${
                    treeLocation || 'इस पावन वृक्ष'
                  } की छाया, हरियाली और जीवन की आजीवन रक्षा करूँगा/करूँगी।`
                : `I, ${guardianName || 'Guardian'}, take a solemn pledge to protect and nurture this living tree.`}"
            </p>

            <div className="text-[10px] font-mono text-[#7A5030] pt-2">
              DHAAGA TREE LINEAGE · ₹0 FREE HERITAGE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
