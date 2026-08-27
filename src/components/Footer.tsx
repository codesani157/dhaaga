import React from 'react';
import { ViewType } from '../types';
import { Heart, Github } from 'lucide-react';

interface FooterProps {
  lang: 'hi' | 'en';
  onNavigate: (view: ViewType) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  return (
    <footer className="w-full border-t border-[#231C17]/15 bg-[#F1E3CB] text-[#231C17] py-6 px-4 text-center text-sm font-serif no-print mt-auto">
      <div className="max-w-4xl mx-auto space-y-3">
        <p className="text-[#B4271F] font-semibold tracking-wide">
          {lang === 'hi'
            ? 'कोई सर्वर नहीं। कोई अकाउंट नहीं। कोई कुकी नहीं। तुम्हारी चिट्ठी लिंक के अंदर है — हम उसे पढ़ भी नहीं सकते।'
            : 'Zero servers. Zero accounts. Zero cookies. Your letter lives inside the link — we cannot read it.'}
        </p>

        <div className="text-xs text-[#231C17]/70 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>{lang === 'hi' ? 'मुफ़्त है, हमेशा रहेगा।' : '₹0 forever. Free by design.'}</span>
          <span>·</span>
          <button onClick={() => onNavigate('baat')} className="underline hover:text-[#B4271F] cursor-pointer" id="footer-baat-link">
            {lang === 'hi' ? 'ईमानदार सीमाएं (Limitations & Truth)' : 'Honest Limits & Privacy'}
          </button>
          <span>·</span>
          <button onClick={() => onNavigate('selftest')} className="underline hover:text-[#B4271F] cursor-pointer" id="footer-selftest-link">
            {lang === 'hi' ? 'टेस्टिंग सूट (Self-Test Harness)' : 'Self-Test Harness'}
          </button>
        </div>

        {/* Made with love by Samiran Button */}
        <div className="pt-2 flex justify-center items-center">
          <a
            href="https://github.com/codesani157"
            target="_blank"
            rel="noopener noreferrer"
            className="group min-h-[40px] px-4 py-2 bg-[#FBF6EA] hover:bg-[#B4271F] hover:text-[#FBF6EA] border-2 border-[#231C17] text-[#231C17] text-xs font-serif font-bold rounded-xs shadow-[2px_2px_0px_#231C17] inline-flex items-center gap-2 transition-all cursor-pointer active:translate-y-0.5"
            id="made-by-samiran-btn"
            title="GitHub: Samiran (codesani157)"
          >
            <Github className="w-4 h-4 text-[#231C17] group-hover:text-[#FBF6EA] transition-colors" />
            <span>made with love by Samiran</span>
            <Heart className="w-3.5 h-3.5 text-[#B4271F] fill-[#B4271F] group-hover:text-[#FBF6EA] group-hover:fill-[#FBF6EA] transition-colors" />
          </a>
        </div>

        <p className="text-xs font-hand text-[#9C5A2D] pt-0.5">
          {lang === 'hi' ? 'हाथ से बना, दिल से बंधा।' : 'Crafted by hand, bound by heart.'}
        </p>
      </div>
    </footer>
  );
};
