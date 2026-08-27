import React, { useState } from 'react';
import { ViewType } from '../types';
import { audio } from '../core/audio';
import {
  Volume2,
  VolumeX,
  Archive,
  Sparkles,
  BookOpen,
  TreePine,
  Info,
  CheckCircle2,
  Menu,
  X,
  HeartHandshake,
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  lang: 'hi' | 'en';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, lang, onToggleLang }) => {
  const [isMuted, setIsMuted] = useState(audio.muted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    audio.setMuted(nextState);
    setIsMuted(nextState);
    if (!nextState) {
      audio.playSitar();
      setTimeout(() => audio.playMandirGhanti(1.2, 0.7), 120);
    }
  };

  const handleNav = (view: ViewType) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    audio.playSitar(undefined, false);
  };

  const isCraftingActive = ['rishta', 'karkhana', 'thaal', 'bandhan', 'mohar'].includes(currentView);

  return (
    <>
      <header className="w-full border-b border-[#231C17]/15 bg-[#F1E3CB]/95 sticky top-0 z-40 backdrop-blur-md no-print shadow-xs">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Brand / Logo */}
          <button
            onClick={() => handleNav('threshold')}
            className="flex items-center gap-2 text-left cursor-pointer group focus:outline-none"
            id="nav-logo-btn"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#B4271F] font-display">
                धागा
              </span>
              <span className="text-xs sm:text-sm text-[#7A5030] font-serif tracking-wider font-semibold">
                · dhaaga
              </span>
            </div>
          </button>

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => handleNav('rishta')}
              className={`px-3 py-1.5 text-xs lg:text-sm rounded-xs font-serif transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                isCraftingActive
                  ? 'bg-[#B4271F] text-[#FBF6EA] font-semibold shadow-[2px_2px_0px_#231C17]'
                  : 'text-[#231C17] hover:bg-[#DCC9A6]/50 border border-transparent hover:border-[#231C17]/20'
              }`}
              id="nav-banao-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'राखी बनाओ' : 'Craft Rakhi'}</span>
            </button>

            <button
              onClick={() => handleNav('peti')}
              className={`px-3 py-1.5 text-xs lg:text-sm rounded-xs font-serif transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                currentView === 'peti'
                  ? 'bg-[#B4271F] text-[#FBF6EA] font-semibold shadow-[2px_2px_0px_#231C17]'
                  : 'text-[#231C17] hover:bg-[#DCC9A6]/50'
              }`}
              id="nav-peti-btn"
              title="राखी पेटी (Rakhi Peti)"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पेटी' : 'Peti'}</span>
            </button>

            <button
              onClick={() => handleNav('rivaaj')}
              className={`px-2.5 py-1.5 text-xs lg:text-sm rounded-xs font-serif transition-colors cursor-pointer flex items-center gap-1 min-h-[38px] ${
                currentView === 'rivaaj' ? 'text-[#B4271F] font-bold bg-[#DCC9A6]/40' : 'text-[#231C17] hover:bg-[#DCC9A6]/50'
              }`}
              id="nav-rivaaj-btn"
              title="9 परंपराएं (9 Traditions)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'रिवाज' : 'Traditions'}</span>
            </button>

            <button
              onClick={() => handleNav('ped')}
              className={`px-2.5 py-1.5 text-xs lg:text-sm rounded-xs font-serif transition-colors cursor-pointer flex items-center gap-1 min-h-[38px] ${
                currentView === 'ped' ? 'text-[#B4271F] font-bold bg-[#DCC9A6]/40' : 'text-[#231C17] hover:bg-[#DCC9A6]/50'
              }`}
              id="nav-ped-btn"
              title="वृक्ष रक्षासूत्र (Tree Rakhi)"
            >
              <TreePine className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पेड़' : 'Tree'}</span>
            </button>

            <button
              onClick={() => handleNav('baat')}
              className={`px-2 py-1.5 text-xs lg:text-sm rounded-xs font-serif transition-colors cursor-pointer flex items-center gap-1 min-h-[38px] ${
                currentView === 'baat' ? 'text-[#B4271F] font-bold bg-[#DCC9A6]/40' : 'text-[#231C17] hover:bg-[#DCC9A6]/50'
              }`}
              id="nav-baat-btn"
              title="बात (About & Truth)"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleNav('selftest')}
              className={`px-2 py-1 text-xs rounded-xs font-mono transition-colors cursor-pointer flex items-center gap-1 min-h-[38px] ${
                currentView === 'selftest' ? 'text-[#B4271F] font-bold bg-[#DCC9A6]' : 'text-[#7C1E13] hover:bg-[#DCC9A6]/50'
              }`}
              id="nav-selftest-btn"
              title="Self-Test Harness"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5F6E36]" />
              <span>Test</span>
            </button>

            <div className="h-5 w-px bg-[#231C17]/20 mx-1"></div>

            {/* Audio toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xs cursor-pointer transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center ${
                !isMuted ? 'text-[#B4271F] bg-[#DCC9A6]/70' : 'text-[#231C17]/60 hover:text-[#231C17]'
              }`}
              title={isMuted ? 'ध्वनि चालू करें (Turn on sound)' : 'ध्वनि बंद करें (Mute)'}
              id="nav-sound-toggle-btn"
              aria-label="Sound Toggle"
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 text-xs font-semibold rounded-xs border border-[#231C17]/30 hover:bg-[#DCC9A6]/60 cursor-pointer font-serif min-h-[38px] flex items-center"
              id="nav-lang-toggle-btn"
            >
              {lang === 'hi' ? 'EN' : 'हिन्दी'}
            </button>
          </nav>

          {/* Mobile Right Controls: Audio, Lang & Hamburger Menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xs cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center ${
                !isMuted ? 'text-[#B4271F] bg-[#DCC9A6]/70' : 'text-[#231C17]/60'
              }`}
              id="mobile-sound-toggle-btn"
              aria-label="Toggle Sound"
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 text-xs font-bold rounded-xs border border-[#231C17]/30 bg-[#FBF6EA] min-h-[38px] flex items-center"
              id="mobile-lang-toggle-btn"
            >
              {lang === 'hi' ? 'EN' : 'हिन्दी'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#231C17] hover:text-[#B4271F] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center border border-[#231C17]/20 rounded-xs bg-[#FBF6EA]"
              id="mobile-menu-toggle-btn"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#231C17]/20 bg-[#FBF6EA] px-4 py-4 space-y-2 shadow-lg animate-fade-in font-serif text-sm">
            <button
              onClick={() => handleNav('rishta')}
              className={`w-full p-3 rounded-xs flex items-center gap-3 text-left font-bold cursor-pointer ${
                isCraftingActive ? 'bg-[#B4271F] text-[#FBF6EA]' : 'bg-[#F1E3CB] text-[#231C17]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#DFA327]" />
              <span>{lang === 'hi' ? 'राखी बनाओ (Craft Rakhi)' : 'Craft Rakhi & Letter'}</span>
            </button>

            <button
              onClick={() => handleNav('peti')}
              className={`w-full p-3 rounded-xs flex items-center gap-3 text-left cursor-pointer ${
                currentView === 'peti' ? 'bg-[#B4271F] text-[#FBF6EA] font-bold' : 'hover:bg-[#F1E3CB] text-[#231C17]'
              }`}
            >
              <Archive className="w-4 h-4 text-[#7A5030]" />
              <span>{lang === 'hi' ? 'राखी पेटी (Saved Rakhis)' : 'Rakhi Peti (Archive)'}</span>
            </button>

            <button
              onClick={() => handleNav('rivaaj')}
              className={`w-full p-3 rounded-xs flex items-center gap-3 text-left cursor-pointer ${
                currentView === 'rivaaj' ? 'bg-[#B4271F] text-[#FBF6EA] font-bold' : 'hover:bg-[#F1E3CB] text-[#231C17]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#7A5030]" />
              <span>{lang === 'hi' ? '९ पावन परंपराएं (9 Traditions)' : '9 Traditions of Rakshasutra'}</span>
            </button>

            <button
              onClick={() => handleNav('ped')}
              className={`w-full p-3 rounded-xs flex items-center gap-3 text-left cursor-pointer ${
                currentView === 'ped' ? 'bg-[#B4271F] text-[#FBF6EA] font-bold' : 'hover:bg-[#F1E3CB] text-[#231C17]'
              }`}
            >
              <TreePine className="w-4 h-4 text-[#5F6E36]" />
              <span>{lang === 'hi' ? 'वृक्ष रक्षासूत्र (Tree Rakhi)' : 'Sacred Tree Rakshasutra'}</span>
            </button>

            <button
              onClick={() => handleNav('baat')}
              className={`w-full p-3 rounded-xs flex items-center gap-3 text-left cursor-pointer ${
                currentView === 'baat' ? 'bg-[#B4271F] text-[#FBF6EA] font-bold' : 'hover:bg-[#F1E3CB] text-[#231C17]'
              }`}
            >
              <Info className="w-4 h-4 text-[#7A5030]" />
              <span>{lang === 'hi' ? 'धागा की बात (Ethos & Privacy)' : 'About Dhaaga & Privacy'}</span>
            </button>

            <button
              onClick={() => handleNav('selftest')}
              className={`w-full p-3 rounded-xs flex items-center gap-3 text-left cursor-pointer text-xs font-mono ${
                currentView === 'selftest' ? 'bg-[#B4271F] text-[#FBF6EA] font-bold' : 'hover:bg-[#F1E3CB] text-[#7C1E13]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#5F6E36]" />
              <span>{lang === 'hi' ? 'प्रणाली परीक्षण (Self-Tests)' : 'System Self-Test Harness'}</span>
            </button>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Quick Action Strip for Phones */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FBF6EA]/95 border-t border-[#231C17]/20 px-3 py-2 flex items-center justify-around backdrop-blur-xs no-print shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => handleNav('threshold')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-serif cursor-pointer min-w-[50px] min-h-[44px] justify-center ${
            currentView === 'threshold' ? 'text-[#B4271F] font-bold' : 'text-[#231C17]/75'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>{lang === 'hi' ? 'देहली' : 'Home'}</span>
        </button>

        <button
          onClick={() => handleNav('rishta')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-serif cursor-pointer min-w-[64px] min-h-[44px] justify-center px-2 py-1 rounded-xs ${
            isCraftingActive ? 'bg-[#B4271F] text-[#FBF6EA] font-bold shadow-xs' : 'text-[#231C17]/75'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'hi' ? 'बनाओ' : 'Craft'}</span>
        </button>

        <button
          onClick={() => handleNav('peti')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-serif cursor-pointer min-w-[50px] min-h-[44px] justify-center ${
            currentView === 'peti' ? 'text-[#B4271F] font-bold' : 'text-[#231C17]/75'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पेटी' : 'Peti'}</span>
        </button>

        <button
          onClick={() => handleNav('rivaaj')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-serif cursor-pointer min-w-[50px] min-h-[44px] justify-center ${
            currentView === 'rivaaj' ? 'text-[#B4271F] font-bold' : 'text-[#231C17]/75'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'hi' ? 'रिवाज' : 'Tradition'}</span>
        </button>
      </div>
    </>
  );
};
