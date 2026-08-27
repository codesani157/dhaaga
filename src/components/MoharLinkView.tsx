import React, { useState, useEffect, useRef } from 'react';
import { SchemaV1, PetiItem } from '../types';
import { measurePayload, encodePayload } from '../core/codec';
import { generateQRCodeSVG } from '../core/qrcode';
import { seedToRakhiId } from '../core/prng';
import { getPurnimaForYear, PurnimaInfo } from '../data/purnima';
import { Rakhi3DModal } from './Rakhi3DModal';
import { audio } from '../core/audio';
import {
  Sparkles,
  Lock,
  Copy,
  Check,
  QrCode,
  Download,
  Share2,
  Calendar,
  Scale,
  ArrowLeft,
  Send,
  MessageCircle,
  Box,
} from 'lucide-react';

interface MoharLinkViewProps {
  payload: SchemaV1;
  onSaveToPeti: (item: PetiItem) => void;
  onBack: () => void;
  lang: 'hi' | 'en';
}

export const MoharLinkView: React.FC<MoharLinkViewProps> = ({
  payload,
  onSaveToPeti,
  onBack,
  lang,
}) => {
  const [fullUrl, setFullUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [show3DModal, setShow3DModal] = useState<boolean>(false);
  const [isSealed, setIsSealed] = useState<boolean>(false);
  const [sealHoldProgress, setSealHoldProgress] = useState<number>(0);
  const [useTimeLock, setUseTimeLock] = useState<boolean>(false);
  const [weightData, setWeightData] = useState<{
    totalChars: number;
    url: string;
    isOverWarning: boolean;
    isOverLimit: boolean;
    breakdown: {
      names: number;
      rakhi: number;
      letter: number;
      gesture: number;
      signature: number;
    };
  } | null>(null);

  const holdIntervalRef = useRef<number | null>(null);

  const purnima = getPurnimaForYear(2026);
  const rakhiId = seedToRakhiId(payload.k?.s || 108);
  const senderInitial = (payload.b || 'D').slice(0, 1).toUpperCase();

  // Generate URL & Payload Weight
  useEffect(() => {
    let isMounted = true;
    const compute = async () => {
      const payloadToEncode: SchemaV1 = {
        ...payload,
        l: useTimeLock ? 1787965320 : undefined,
      };

      const hash = await encodePayload(payloadToEncode);
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const url = `${origin}${pathname}#${hash}`;

      if (!isMounted) return;
      setFullUrl(url);

      const weight = await measurePayload(payloadToEncode, `${origin}${pathname}`);
      if (!isMounted) return;
      setWeightData(weight);

      // Auto-save this crafted creation to Peti
      const petiItem: PetiItem = {
        id: rakhiId,
        created_at: new Date().toISOString(),
        sender: payload.b || 'Sender',
        receiver: payload.a || 'Receiver',
        rishta_id: payload.t || 0,
        letter: payload.m || '',
        raw_payload: JSON.stringify(payloadToEncode),
        hash: hash.slice(0, 16),
        rakhi_config: payload.k || { d: 0, c: 0, p: [0], s: 108 },
        year: new Date().getFullYear(),
      };
      onSaveToPeti(petiItem);
    };

    compute();
    return () => {
      isMounted = false;
    };
  }, [payload, useTimeLock, rakhiId, onSaveToPeti]);

  // Press-and-hold Wax Seal interaction
  const handleSealPointerDown = () => {
    if (isSealed) return;
    audio.playWaxSeal('drip');
    setSealHoldProgress(10);

    let progress = 10;
    holdIntervalRef.current = window.setInterval(() => {
      progress += 15;
      setSealHoldProgress(progress);
      if (progress >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setIsSealed(true);
        audio.playWaxSeal('stamp');
        audio.playMandirGhanti(1.0, 1.2);
        audio.playGhungroo(1.2);
      }
    }, 50);
  };

  const handleSealPointerUp = () => {
    if (!isSealed) {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      setSealHoldProgress(0);
    }
  };

  // Copy URL with tactile sound
  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    audio.playSweetPrasad();
    setTimeout(() => setCopied(false), 3000);
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    const shareMessage =
      lang === 'hi'
        ? `✨ मैंने आपके लिए धागा पर अपने हाथों से पवित्र रक्षासूत्र (राखी) और पत्र तैयार किया है। इसे यहां खोलें और कलाई पर बांधें:\n${fullUrl}`
        : `✨ I have crafted a sacred handcrafted Rakshasutra (Rakhi) and letter for you on Dhaaga:\n${fullUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'hi' ? 'धागा · पवित्र रक्षासूत्र' : 'Dhaaga · Sacred Rakshasutra',
          text: shareMessage,
          url: fullUrl,
        });
        audio.playSweetPrasad();
      } catch (err) {
        // User cancelled or fallback
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // WhatsApp Share Message
  const whatsappShareText = encodeURIComponent(
    lang === 'hi'
      ? `✨ मैंने तुम्हारे लिए अपने हाथों से पवित्र रक्षासूत्र (राखी) और पत्र तैयार किया है। इसे यहां खोलें और कलाई पर बांधें:\n${fullUrl}`
      : `✨ I have crafted a sacred handcrafted Rakshasutra (Rakhi) and letter for you:\n${fullUrl}`
  );

  // Generate & Download Rakhi Patra Keepsake Card (Canvas to PNG)
  const handleDownloadPatra = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1050;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background - Unbleached vintage parchment
    ctx.fillStyle = '#FBF6EA';
    ctx.fillRect(0, 0, 1000, 1050);

    // Double Border
    ctx.strokeStyle = '#231C17';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 940, 990);
    ctx.strokeStyle = '#7A5030';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, 920, 970);

    // Decorative Floral Corner Accents
    ctx.fillStyle = '#B4271F';
    ctx.font = '32px serif';
    ctx.fillText('❖', 50, 75);
    ctx.fillText('❖', 925, 75);
    ctx.fillText('❖', 50, 995);
    ctx.fillText('❖', 925, 995);

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B4271F';
    ctx.font = 'bold 52px Rozha One, serif';
    ctx.fillText('धागा · DHAAGA', 500, 130);

    ctx.fillStyle = '#7A5030';
    ctx.font = 'italic 26px Kalam, cursive';
    ctx.fillText('रक्षाबंधन का पावन रक्षासूत्र पत्र', 500, 185);

    // Rakhi ID & Date
    ctx.fillStyle = '#231C17';
    ctx.font = '22px Khand, sans-serif';
    ctx.fillText(`Rakhi ID: ${rakhiId} · ${purnima.display_date}`, 500, 235);

    // Receiver & Sender
    ctx.fillStyle = '#231C17';
    ctx.font = 'bold 36px Kalam, cursive';
    ctx.fillText(`प्रिय ${payload.a || 'भाई / बहना'}`, 500, 310);

    ctx.font = '24px Kalam, cursive';
    ctx.fillStyle = '#4B2D19';
    // Letter snippet
    const lines = (payload.m || 'सदा खुश रहो और सुरक्षित रहो।').slice(0, 260);
    ctx.fillText(`"${lines}"`, 500, 375);

    ctx.font = 'italic 26px Kalam, cursive';
    ctx.fillText(`— सप्रेम, ${payload.b || 'स्नेही'}`, 500, 445);

    // Draw QR code onto Canvas
    const qrSvg = generateQRCodeSVG(fullUrl, 320, '#231C17', '#FBF6EA');
    const img = new Image();
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(qrSvg);
    img.onload = () => {
      ctx.drawImage(img, 340, 500, 320, 320);

      // Footnote
      ctx.fillStyle = '#7A5030';
      ctx.font = '20px Martel, serif';
      ctx.fillText('फोन के कैमरे से QR स्कैन करें — पूरी राखी, थाल व हाथ की हरकत खुलेगी।', 500, 890);

      ctx.font = '16px Martel, serif';
      ctx.fillStyle = '#9C5A2D';
      ctx.fillText('₹0 हमेशा के लिए · zero database · zero backend', 500, 930);

      // Trigger Download
      const link = document.createElement('a');
      link.download = `Rakhi-Patra-${rakhiId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      audio.playGhungroo();
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Title & Stage Guide */}
      <div className="text-center mb-5">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'चरण ५ · लाख की मुहर व लिंक' : 'Act 5 · Lac Seal & The Gift Link'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'चिट्ठी पर मुहर लगाएं और लिंक पाएं' : 'Seal the Envelope & Share the Thread'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5 max-w-xl mx-auto">
          {lang === 'hi'
            ? 'लाख की मुहर पर दबाकर रखें। इसके बाद आपका पवित्र रक्षासूत्र लिंक तैयार है।'
            : 'Press and hold the lac wax seal to stamp your initial onto the envelope.'}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-5 md:gap-6 items-start">
        {/* Left: Sealed Envelope & Lac Press */}
        <div className="md:col-span-5 bg-[#FBF6EA] border-2 border-[#231C17] p-4 sm:p-5 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-4 text-center">
          <h3 className="font-display font-bold text-base text-[#B4271F]">
            {lang === 'hi' ? 'चिट्ठी का लिफाफा (The Envelope)' : 'The Sealed Envelope'}
          </h3>

          {/* Three-fold Envelope SVG */}
          <div className="relative w-full max-w-[280px] h-[175px] mx-auto bg-[#F1E3CB] border-2 border-[#231C17] rounded-xs shadow-sm flex items-center justify-center overflow-hidden">
            {/* Crease lines */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 280 175">
                <line x1="0" y1="0" x2="140" y2="88" stroke="#231C17" strokeWidth="1.2" opacity="0.3" />
                <line x1="280" y1="0" x2="140" y2="88" stroke="#231C17" strokeWidth="1.2" opacity="0.3" />
                <line x1="0" y1="175" x2="140" y2="88" stroke="#231C17" strokeWidth="1.2" opacity="0.2" />
                <line x1="280" y1="175" x2="140" y2="88" stroke="#231C17" strokeWidth="1.2" opacity="0.2" />
              </svg>
            </div>

            {/* Postmark stamp */}
            <div className="absolute top-2 right-2 border border-[#7C1E13] px-1.5 py-0.5 rounded-xs text-[9px] font-mono text-[#7C1E13] rotate-6 opacity-80">
              SHRAVANA {purnima.year}
            </div>

            {/* Lac Seal Stamp Interaction */}
            <div
              onPointerDown={handleSealPointerDown}
              onPointerUp={handleSealPointerUp}
              onPointerLeave={handleSealPointerUp}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center select-none cursor-pointer transition-transform ${
                !isSealed ? 'hover:scale-105 active:scale-95' : 'scale-100'
              }`}
              id="lac-seal-press-target"
            >
              {/* Wax Drop Blob */}
              <div
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-[#4B2D19] flex items-center justify-center shadow-md transition-all"
                style={{
                  backgroundColor: '#7C1E13',
                  boxShadow: isSealed
                    ? '0 0 0 4px #B4271F, inset 0 2px 4px rgba(0,0,0,0.5)'
                    : `0 0 0 ${(sealHoldProgress / 100) * 6}px #B4271F`,
                }}
              >
                <span className="font-display font-bold text-2xl text-[#FBF6EA] drop-shadow-sm">
                  {senderInitial}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs font-serif text-[#7A5030] italic">
            {!isSealed
              ? lang === 'hi'
                ? 'मुहर पर उंगली दबाकर रखें (Hold to stamp seal)'
                : 'Press and hold to stamp the lac wax seal'
              : lang === 'hi'
              ? 'मुहर लग गई! चिट्ठी सील हो चुकी है।'
              : 'Sealed with your authentic impression!'}
          </p>

          {/* 3D Rakhi Touch button */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setShow3DModal(true);
                audio.playSitar();
              }}
              className="min-h-[38px] px-3.5 py-1.5 bg-[#F1E3CB] border border-[#231C17] hover:bg-[#EFE3CF] text-[#B4271F] font-serif font-bold text-xs rounded-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              id="mohar-3d-inspect-btn"
            >
              <Box className="w-3.5 h-3.5 text-[#DFA327]" />
              <span>{lang === 'hi' ? '३डी स्पर्श व रत्न निरीक्षण' : 'Inspect Rakhi in 3D'}</span>
            </button>
          </div>

          {/* Optional Shubh Muhurat Time-Lock */}
          <div className="pt-3 border-t border-[#231C17]/15 text-left space-y-2">
            <label className="flex items-center justify-between cursor-pointer select-none text-xs font-serif font-bold text-[#231C17]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#B4271F]" />
                <span>{lang === 'hi' ? 'मुहूर्त पर खुले (Time-Lock)' : 'Open at Shubh Muhurat'}</span>
              </span>
              <input
                type="checkbox"
                checked={useTimeLock}
                onChange={(e) => setUseTimeLock(e.target.checked)}
                className="accent-[#B4271F] w-4 h-4 cursor-pointer"
                id="timelock-checkbox"
              />
            </label>

            <div className="p-2.5 bg-[#F1E3CB]/70 border border-[#231C17]/20 rounded-xs text-[11px] font-serif text-[#231C17]/80 space-y-1">
              <div className="flex items-center gap-1 text-[#9C5A2D] font-bold">
                <Calendar className="w-3 h-3" />
                <span>{purnima.display_date}</span>
              </div>
              <p>
                {lang === 'hi'
                  ? `शुभ मुहूर्त: ${purnima.muhurat_start_ist} से ${purnima.muhurat_end_ist} (${purnima.bhadra_window})`
                  : `Auspicious window: ${purnima.muhurat_start_ist} – ${purnima.muhurat_end_ist}`}
              </p>
              <p className="text-[10px] text-[#7A5030] italic">
                {lang === 'hi'
                  ? 'यह ताला रस्म का है, ताला-चाबी का नहीं — सारा डेटा लिंक में ही है।'
                  : 'This lock is ritual, not cryptographic — all data lives in the URL.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: The URL, Brass Balance Meter & Sharing Channels */}
        <div className="md:col-span-7 bg-[#FBF6EA] border-2 border-[#231C17] p-4 sm:p-5 rounded-xs shadow-[4px_4px_0px_#231C17] space-y-4">
          <div className="flex items-center justify-between border-b border-[#231C17]/15 pb-2">
            <h3 className="font-display font-bold text-base text-[#B4271F] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'hi' ? 'आपका रक्षासूत्र लिंक' : 'Your Rakhi Gift Link'}</span>
            </h3>
            <span className="font-mono text-xs text-[#9C5A2D] font-bold">{rakhiId}</span>
          </div>

          {/* Link Ka Wazan (Brass Balance Scale Meter) */}
          {weightData && (
            <div className="p-3 bg-[#F1E3CB]/80 border border-[#231C17]/20 rounded-xs space-y-2 text-xs font-serif">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1 text-[#231C17]">
                  <Scale className="w-3.5 h-3.5 text-[#B5872B]" />
                  <span>{lang === 'hi' ? 'लिंक का वज़न (URL Payload Weight):' : 'Link Weight Meter:'}</span>
                </span>
                <span className="font-mono text-[#B4271F] font-bold">
                  {weightData.totalChars} / 1900 {lang === 'hi' ? 'अक्षर' : 'chars'}
                </span>
              </div>

              {/* Progress bar scale */}
              <div className="w-full h-2 bg-[#DCC9A6] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    weightData.isOverLimit
                      ? 'bg-[#B4271F]'
                      : weightData.isOverWarning
                      ? 'bg-[#DFA327]'
                      : 'bg-[#5F6E36]'
                  }`}
                  style={{ width: `${Math.min(100, (weightData.totalChars / 1900) * 100)}%` }}
                />
              </div>

              {/* Breakdown */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#7A5030] font-mono">
                <span>{lang === 'hi' ? 'नाम' : 'Names'}: {weightData.breakdown.names}b</span>
                <span>·</span>
                <span>{lang === 'hi' ? 'राखी' : 'Rakhi'}: {weightData.breakdown.rakhi}b</span>
                <span>·</span>
                <span>{lang === 'hi' ? 'चिट्ठी' : 'Letter'}: {weightData.breakdown.letter}b</span>
                <span>·</span>
                <span>{lang === 'hi' ? 'हस्त गति' : 'Gesture'}: {weightData.breakdown.gesture}b</span>
              </div>
            </div>
          )}

          {/* The URL Display Box */}
          <div className="space-y-2.5">
            <div className="p-2.5 bg-[#F1E3CB] border border-[#231C17] rounded-xs font-mono text-[11px] text-[#231C17] break-all max-h-20 overflow-y-auto select-all">
              {fullUrl || 'Generating link...'}
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
                target="_blank"
                rel="noreferrer"
                className="min-h-[44px] px-3 py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white font-serif font-bold text-xs rounded-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                id="share-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'hi' ? 'WhatsApp पर सीधे भेजें' : 'Share on WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={handleNativeShare}
                className="min-h-[44px] px-3 py-2.5 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-serif font-bold text-xs rounded-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                id="native-share-btn"
              >
                <Share2 className="w-4 h-4" />
                <span>{lang === 'hi' ? 'शेयर करें (Share Sheet)' : 'Share via App'}</span>
              </button>
            </div>

            {/* Secondary Action Buttons */}
            <div className="grid grid-cols-3 gap-2 text-xs font-serif">
              <button
                type="button"
                onClick={handleCopyLink}
                className="min-h-[40px] p-2 bg-[#FBF6EA] border border-[#231C17] hover:bg-[#F1E3CB] text-[#231C17] font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer"
                id="copy-link-btn"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#5F6E36]" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? (lang === 'hi' ? 'कॉपी!' : 'Copied!') : (lang === 'hi' ? 'कॉपी' : 'Copy')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="min-h-[40px] p-2 bg-[#FBF6EA] border border-[#231C17] hover:bg-[#F1E3CB] text-[#231C17] font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer"
                id="toggle-qr-btn"
              >
                <QrCode className="w-3.5 h-3.5 text-[#B4271F]" />
                <span className="text-[11px]">{lang === 'hi' ? 'QR कोड' : 'QR Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPatra}
                className="min-h-[40px] p-2 bg-[#FBF6EA] border border-[#231C17] hover:bg-[#F1E3CB] text-[#231C17] font-bold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer"
                id="download-patra-btn"
              >
                <Download className="w-3.5 h-3.5 text-[#5F6E36]" />
                <span className="text-[11px]">{lang === 'hi' ? 'कार्ड PNG' : 'Patra PNG'}</span>
              </button>
            </div>
          </div>

          {/* QR Code Modal / Inline View */}
          {showQR && (
            <div className="p-4 bg-[#F1E3CB] border border-[#231C17]/30 rounded-xs flex flex-col items-center gap-3 animate-fade-in">
              <div
                className="p-3 bg-[#FBF6EA] border border-[#231C17] rounded-xs shadow-xs"
                dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(fullUrl, 180) }}
              />
              <span className="text-[11px] font-serif text-[#7A5030] text-center">
                {lang === 'hi'
                  ? 'फोन के कैमरे से स्कैन करें — कोई भी ब्राउज़र सीधे खोल देगा।'
                  : 'Scan with any smartphone camera to open and replay the ritual.'}
              </span>
            </div>
          )}

          {/* Back Navigation */}
          <div className="pt-2 border-t border-[#231C17]/15">
            <button
              onClick={onBack}
              className="min-h-[40px] px-4 py-1.5 border border-[#231C17]/40 text-[#231C17] rounded-xs font-serif text-xs hover:bg-[#DCC9A6]/40 cursor-pointer flex items-center gap-1.5"
              id="mohar-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पीछे (बंधन बदलें)' : 'Back (Edit)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Rakhi Inspector Modal */}
      <Rakhi3DModal
        isOpen={show3DModal}
        onClose={() => setShow3DModal(false)}
        config={payload.k || { d: 0, c: 0, p: [0], s: 108 }}
        lang={lang}
      />
    </div>
  );
};
