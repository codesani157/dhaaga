import React, { useState, useRef, useEffect } from 'react';
import { RakhiConfig } from '../types';
import { Interactive3DRakhi } from './Interactive3DRakhi';
import { Rakhi3DModal } from './Rakhi3DModal';
import { audio } from '../core/audio';
import { Sparkles, Box, Minimize2, Maximize2, Rotate3d, Compass } from 'lucide-react';

interface Floating3DCompanionProps {
  config: RakhiConfig;
  lang: 'hi' | 'en';
  showOnViews?: boolean;
}

export const Floating3DCompanion: React.FC<Floating3DCompanionProps> = ({
  config,
  lang,
  showOnViews = true,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showFullModal, setShowFullModal] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!showOnViews) return null;

  return (
    <>
      {/* Floating 3D Rakhi Portal in bottom-right corner */}
      <div
        className={`fixed bottom-4 right-4 z-40 transition-all duration-500 ease-out select-none ${
          isMinimized ? 'translate-y-2' : ''
        }`}
      >
        <div
          className={`relative bg-[#FBF6EA] border-2 border-[#231C17] rounded-xs shadow-[4px_4px_0px_#231C17] transition-all duration-300 ${
            isMinimized
              ? 'p-2 flex items-center gap-2 hover:bg-[#F1E3CB] cursor-pointer'
              : 'p-3 w-[180px] sm:w-[210px] flex flex-col items-center'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header Controls */}
          <div className="w-full flex items-center justify-between border-b border-[#231C17]/15 pb-1.5 mb-1 text-[10px] font-mono">
            <div className="flex items-center gap-1 text-[#B4271F] font-bold">
              <Box className="w-3 h-3 text-[#DFA327] animate-pulse" />
              <span>3D Live</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setShowFullModal(true);
                  audio.playSitar();
                }}
                className="p-1 text-[#231C17] hover:text-[#B4271F] hover:bg-[#F1E3CB] rounded-xs cursor-pointer"
                title={lang === 'hi' ? '३डी विस्तार' : 'Full 3D'}
                id="floating-3d-expand-btn"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMinimized(!isMinimized);
                  audio.playGhungroo();
                }}
                className="p-1 text-[#231C17] hover:text-[#B4271F] hover:bg-[#F1E3CB] rounded-xs cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
                id="floating-3d-minimize-btn"
              >
                {isMinimized ? <Rotate3d className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* 3D Mini Interactive Stage */}
          {!isMinimized ? (
            <div className="w-full flex flex-col items-center justify-center py-1">
              <div className="w-full h-[120px] sm:h-[135px] flex items-center justify-center overflow-hidden">
                <Interactive3DRakhi
                  config={config}
                  size={140}
                  allowExplodedView={false}
                  interactiveMode={true}
                  lang={lang}
                />
              </div>
              <p className="text-[9px] text-[#7A5030] font-serif text-center mt-1 italic">
                {lang === 'hi' ? 'स्पर्श करें या घुमाएं' : 'Drag to tilt in 3D'}
              </p>
            </div>
          ) : (
            <div
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#B4271F]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DFA327]" />
              <span>{lang === 'hi' ? '३डी राखी' : '3D Rakhi'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Full 3D Inspector Modal */}
      <Rakhi3DModal
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        config={config}
        lang={lang}
      />
    </>
  );
};
