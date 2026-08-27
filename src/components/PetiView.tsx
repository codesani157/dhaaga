import React, { useState } from 'react';
import { PetiItem, SchemaV1 } from '../types';
import { renderRakhiSVG } from '../art/rakhi';
import { RISHTAS } from '../data/rishtas';
import { audio } from '../core/audio';
import {
  Archive,
  Download,
  Upload,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface PetiViewProps {
  petiItems: PetiItem[];
  onOpenItem: (item: PetiItem) => void;
  onImportItem: (item: PetiItem) => void;
  onWipePeti: () => void;
  lang: 'hi' | 'en';
}

export const PetiView: React.FC<PetiViewProps> = ({
  petiItems,
  onOpenItem,
  onImportItem,
  onWipePeti,
  lang,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const years = Array.from(
    new Set(petiItems.map((item) => Number(item.year) || new Date(item.created_at).getFullYear()))
  ).sort((a: number, b: number) => b - a);

  const filtered = selectedYear === 'all' ? petiItems : petiItems.filter((i) => i.year === selectedYear);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed: SchemaV1 = JSON.parse(raw);
        const item: PetiItem = {
          id: `IMP-${Date.now().toString(36).toUpperCase()}`,
          created_at: new Date().toISOString(),
          sender: parsed.b || 'Sender',
          receiver: parsed.a || 'Receiver',
          rishta_id: parsed.t || 0,
          letter: parsed.m || '',
          raw_payload: raw,
          hash: '',
          rakhi_config: parsed.k || { d: 0, c: 0, p: [0], s: 108 },
          year: new Date().getFullYear(),
        };
        onImportItem(item);
        audio.playPetiBox('latch');
      } catch (err) {
        alert(lang === 'hi' ? 'फ़ाइल प्रारूप अमान्य है।' : 'Invalid .rakhi file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(petiItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dhaaga-Peti-Archive-${new Date().getFullYear()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audio.playSweetPrasad();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title & Stage Guide */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'राखी पेटी · स्मृतियों का संदूक' : 'Rakhi Peti · The Trunk of Memories'}
        </span>
        <h2 className="text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'आपकी राखी पेटी' : 'Your Sacred Rakhi Peti'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5 max-w-xl mx-auto">
          {lang === 'hi'
            ? 'आपके ब्राउज़र में सुरक्षित रखी गई राखियों की पेटी। कोई सर्वर नहीं — सारा संग्रह यहीं है।'
            : 'All your received and crafted rakhis preserved in local storage. Zero servers, pure privacy.'}
        </p>
      </div>

      {/* Peti Toolbar & Stats */}
      <div className="bg-[#FBF6EA] border-2 border-[#231C17] p-4 rounded-xs shadow-[4px_4px_0px_#231C17] mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-[#B4271F]" />
          <span className="font-display font-bold text-sm text-[#231C17]">
            {lang === 'hi' ? `कुल राखियां: ${petiItems.length}` : `Total Rakhis: ${petiItems.length}`}
          </span>
        </div>

        {/* Year Filter Buttons */}
        {years.length > 0 && (
          <div className="flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-2 py-1 rounded-xs border cursor-pointer ${
                selectedYear === 'all'
                  ? 'bg-[#B4271F] text-[#FBF6EA] border-[#B4271F]'
                  : 'bg-[#F1E3CB] border-[#231C17]/30'
              }`}
            >
              {lang === 'hi' ? 'सभी' : 'All'}
            </button>
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-1 rounded-xs border cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#B4271F] text-[#FBF6EA] border-[#B4271F]'
                    : 'bg-[#F1E3CB] border-[#231C17]/30'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs font-serif">
          <label className="px-2.5 py-1.5 bg-[#F1E3CB] hover:bg-[#DCC9A6] border border-[#231C17] rounded-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#7A5030]" />
            <span>{lang === 'hi' ? 'फ़ाइल जोड़ें (.rakhi)' : 'Import .rakhi'}</span>
            <input type="file" accept=".rakhi,.json" onChange={handleFileUpload} className="hidden" />
          </label>

          {petiItems.length > 0 && (
            <button
              onClick={handleExportAll}
              className="px-2.5 py-1.5 bg-[#F1E3CB] hover:bg-[#DCC9A6] border border-[#231C17] rounded-xs font-bold flex items-center gap-1.5 cursor-pointer"
              id="peti-export-all-btn"
            >
              <Download className="w-3.5 h-3.5 text-[#5F6E36]" />
              <span>{lang === 'hi' ? 'पूरा संग्रह डाउनलोड' : 'Export Peti'}</span>
            </button>
          )}

          {petiItems.length > 0 && (
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="px-2 py-1.5 text-[#7C1E13] hover:bg-[#7C1E13]/10 rounded-xs font-bold flex items-center gap-1 cursor-pointer"
              title="निशान मिटा दो (Wipe local storage)"
              id="peti-wipe-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Peti Items Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#FBF6EA] border-2 border-[#231C17] p-12 text-center rounded-xs shadow-[4px_4px_0px_#231C17] space-y-3">
          <Archive className="w-10 h-10 text-[#7A5030] mx-auto opacity-50" />
          <h3 className="font-display font-bold text-lg text-[#231C17]">
            {lang === 'hi' ? 'पेटी अभी खाली है' : 'Your Peti is currently empty'}
          </h3>
          <p className="text-xs font-serif text-[#231C17]/70 max-w-sm mx-auto">
            {lang === 'hi'
              ? 'जब आप कोई राखी बनाएंगे या प्राप्त करेंगे, तो वह अपने-आप इस संदूक में सहेज ली जाएगी।'
              : 'Whenever you craft or open a sacred rakhi link, it will be automatically preserved here.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const rishta = RISHTAS.find((r) => r.id === item.rishta_id) || RISHTAS[0];
            return (
              <div
                key={item.id}
                className="bg-[#FBF6EA] border-2 border-[#231C17] p-4 rounded-xs shadow-[3px_3px_0px_#231C17] flex flex-col justify-between space-y-3 relative group"
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-[#231C17]/15 pb-2 text-xs font-mono">
                  <span className="text-[#B4271F] font-bold">{item.id}</span>
                  <span className="text-[#7A5030] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </span>
                </div>

                {/* Rakhi SVG Visual */}
                <div
                  className="flex items-center justify-center py-2"
                  dangerouslySetInnerHTML={{
                    __html: renderRakhiSVG(item.rakhi_config, { size: 140 }),
                  }}
                />

                {/* Names and letter preview */}
                <div className="space-y-1">
                  <div className="font-display font-bold text-sm text-[#231C17]">
                    {item.sender} ➔ {item.receiver}
                  </div>
                  <div className="text-[11px] font-serif text-[#9C5A2D]">
                    {lang === 'hi' ? rishta.title_hi : rishta.title_en}
                  </div>
                  <p className="text-xs font-hand text-[#231C17]/80 line-clamp-2 italic">
                    "{item.letter || 'सदा खुश रहो और सुरक्षित रहो।'}"
                  </p>
                </div>

                {/* Open Button */}
                <button
                  type="button"
                  onClick={() => {
                    audio.playPetiBox('open');
                    onOpenItem(item);
                  }}
                  className="w-full py-2 bg-[#F1E3CB] hover:bg-[#B4271F] hover:text-[#FBF6EA] border border-[#231C17] text-[#231C17] font-serif font-bold text-xs rounded-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  id={`peti-open-item-${item.id}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'खोलें व रीप्ले देखें' : 'Open & Replay'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Wipe Confirmation Dialog */}
      {showWipeConfirm && (
        <div className="fixed inset-0 bg-[#231C17]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FBF6EA] border-2 border-[#B4271F] p-6 max-w-md w-full rounded-sm shadow-[6px_6px_0px_#231C17] space-y-4">
            <div className="flex items-center gap-2 text-[#B4271F] font-display font-bold text-lg">
              <ShieldAlert className="w-5 h-5" />
              <span>{lang === 'hi' ? 'निशान मिटा दो (Wipe Local Peti)?' : 'Wipe All Peti Data?'}</span>
            </div>

            <p className="text-xs font-serif text-[#231C17]/80 leading-relaxed">
              {lang === 'hi'
                ? 'यह आपके ब्राउज़र के लोकल स्टोरेज से सारी सहेजी गई राखियां और चिट्ठियां हमेशा के लिए हटा देगा। यह क्रिया वापस नहीं ली जा सकती।'
                : 'This will permanently remove all stored rakhis and letters from this browser. This cannot be undone.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeConfirm(false)}
                className="px-3 py-1.5 text-xs font-serif rounded border border-[#231C17]/30 hover:bg-[#DCC9A6]/40 cursor-pointer"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onWipePeti();
                  setShowWipeConfirm(false);
                }}
                className="px-4 py-1.5 bg-[#B4271F] text-[#FBF6EA] font-serif text-xs font-bold rounded cursor-pointer hover:bg-[#7C1E13]"
                id="confirm-wipe-btn"
              >
                {lang === 'hi' ? 'हां, सब मिटा दें' : 'Yes, Wipe Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
