import React from 'react';
import { RakhiConfig } from '../types';
import { Interactive3DRakhi } from './Interactive3DRakhi';
import { seedToRakhiId } from '../core/prng';
import { X, Sparkles, Box, ShieldCheck, Share2 } from 'lucide-react';
import { audio } from '../core/audio';

interface Rakhi3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RakhiConfig;
  lang: 'hi' | 'en';
}

export const Rakhi3DModal: React.FC<Rakhi3DModalProps> = ({ isOpen, onClose, config, lang }) => {
  if (!isOpen) return null;

  const rakhiId = seedToRakhiId(config.s || 108);

  const handleClose = () => {
    audio.playGhungroo();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FBF6EA] border-3 border-[#231C17] rounded-xs shadow-[8px_8px_0px_#231C17] p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#231C17] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-[#B4271F]" />
            <div>
              <h3 className="font-display font-bold text-lg text-[#B4271F] leading-tight">
                {lang === 'hi' ? '३डी स्पर्श व रत्न निरीक्षण' : '3D Tactile Rakhi Inspector'}
              </h3>
              <span className="font-mono text-xs text-[#9C5A2D] font-bold">{rakhiId}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="min-h-[40px] min-w-[40px] p-2 bg-[#F1E3CB] border border-[#231C17] hover:bg-[#B4271F] hover:text-[#FBF6EA] text-[#231C17] rounded-xs flex items-center justify-center cursor-pointer transition-colors"
            id="close-3d-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Rakhi Stage */}
        <div className="bg-[#F1E3CB]/60 border border-[#231C17]/20 rounded-xs p-3 sm:p-4 flex flex-col items-center justify-center">
          <Interactive3DRakhi
            config={config}
            size={280}
            allowExplodedView={true}
            interactiveMode={true}
            lang={lang}
          />
        </div>

        {/* Footnote */}
        <div className="mt-4 flex items-center justify-between text-xs font-serif text-[#7A5030] pt-2 border-t border-[#231C17]/15">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#DFA327]" />
            <span>{lang === 'hi' ? 'हस्त-कला व वास्तविक ज्यामिति' : 'Authentic 3D Depth & Geometry'}</span>
          </span>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 bg-[#B4271F] text-[#FBF6EA] font-serif font-bold rounded-xs cursor-pointer hover:bg-[#7C1E13]"
            id="done-3d-modal-btn"
          >
            {lang === 'hi' ? 'पूर्ण (Done)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
