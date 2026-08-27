import React, { useState, useRef } from 'react';
import { SchemaV1, PetiItem } from '../types';
import { VACHAN_PROMISES } from '../data/vachan';
import { generateQRCodeSVG } from '../core/qrcode';
import { audio } from '../core/audio';
import {
  Sparkles,
  Copy,
  Check,
  QrCode,
  ArrowLeft,
  ArrowRight,
  Heart,
  CreditCard,
  PenTool,
  Share2,
} from 'lucide-react';

interface VachanReplyViewProps {
  originalPayload: SchemaV1;
  onSaveToPeti: (item: PetiItem) => void;
  onBack: () => void;
  lang: 'hi' | 'en';
}

export const VachanReplyView: React.FC<VachanReplyViewProps> = ({
  originalPayload,
  onSaveToPeti,
  onBack,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'vachan' | 'shagun' | 'note'>('vachan');

  // Vachan state
  const [selectedPromiseId, setSelectedPromiseId] = useState<number>(0);
  const [customPromise, setCustomPromise] = useState<string>('');
  const [hasSignature, setHasSignature] = useState(false);

  // UPI Shagun state
  const [upiId, setUpiId] = useState('');
  const [shagunAmount, setShagunAmount] = useState('501');
  const [showUpiQR, setShowUpiQR] = useState(false);

  // Note amount
  const [noteAmount, setNoteAmount] = useState('1100');

  // Reply Link state
  const [replyUrl, setReplyUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const senderName = originalPayload.b || (lang === 'hi' ? 'स्नेही' : 'Sender');
  const receiverName = originalPayload.a || (lang === 'hi' ? 'भाई / बहना' : 'Recipient');

  // Handle Signature drawing on canvas
  const handleSigPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#B4271F';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleSigPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
    if (Math.random() > 0.6) {
      audio.playKalamScratch(1.2);
    }
  };

  const handleSigPointerUp = () => {
    isDrawing.current = false;
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    audio.playTear(0.3);
  };

  // Generate Reply Link
  const handleGenerateReplyLink = () => {
    const currentPromise = VACHAN_PROMISES.find((p) => p.id === selectedPromiseId);
    const promiseText = customPromise.trim() || (lang === 'hi' ? currentPromise?.text_hi : currentPromise?.text_en) || '';

    const replyPayload: SchemaV1 = {
      v: 1,
      t: originalPayload.t || 0,
      a: senderName,
      b: receiverName,
      m: `${lang === 'hi' ? 'वचन पत्र व उत्तर:' : 'Vachan & Reply:'}\n${promiseText}`,
      k: originalPayload.k || { d: 0, c: 0, p: [0], s: 108 },
    };

    const jsonStr = JSON.stringify(replyPayload);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const url = `${window.location.origin}${window.location.pathname}#1.${b64}`;
    setReplyUrl(url);
    audio.playWaxSeal('stamp');
    audio.playMandirGhanti(1.0, 1.2);
    audio.playGhungroo(1.2);
  };

  // Build standard zero-gateway UPI Deep Link
  const upiDeepLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        senderName
      )}&am=${encodeURIComponent(shagunAmount)}&cu=INR&tn=${encodeURIComponent('Rakhi Shagun via Dhaaga')}`
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Title & Stage Guide */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'चरण ७ · वचन, शगुन व जोड़ी' : 'Act 7 · Vachan, Shagun & The Return Gift'}
        </span>
        <h2 className="text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'रक्षा का सच्चा वचन व उपहार' : 'Return Gift & Sacred Promise'}
        </h2>
        <p className="text-xs font-serif text-[#231C17]/80 mt-0.5">
          {lang === 'hi'
            ? `${senderName} के लिए अपना वचन चुनें, दस्तख़त करें या सीधे UPI शगुन भेजें।`
            : `Choose a heartfelt promise for ${senderName}, sign it, or send direct zero-fee UPI Shagun.`}
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[5px_5px_0px_#231C17] space-y-5">
        {/* Category Tabs */}
        <div className="flex border-b border-[#231C17]/20 pb-2 gap-2 text-xs font-serif">
          {[
            { id: 'vachan', label_hi: 'वचन पत्र (Promises)', label_en: 'Vachan (Promises)', icon: Heart },
            { id: 'shagun', label_hi: 'शगुन UPI (Zero Fee)', label_en: 'Direct UPI Shagun', icon: CreditCard },
            { id: 'note', label_hi: 'शगुन नोट (IOU Note)', label_en: 'Handmade IOU Note', icon: PenTool },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#B4271F] text-[#FBF6EA]'
                    : 'text-[#231C17] hover:bg-[#DCC9A6]/50'
                }`}
                id={`vachan-tab-${tab.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? tab.label_hi : tab.label_en}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: 36 Vachan Promises & Signature */}
        {activeTab === 'vachan' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold font-serif text-[#231C17] block">
                {lang === 'hi' ? 'वचन चुनें (३६ आत्मीय व व्यावहारिक वचन):' : 'Select a Promise (36 Sincere Promises):'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                {VACHAN_PROMISES.map((p) => {
                  const isSelected = selectedPromiseId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPromiseId(p.id);
                        audio.playGhungroo();
                      }}
                      className={`p-2.5 text-left border rounded-xs text-xs font-serif transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#B4271F] bg-[#F1E3CB] font-bold shadow-xs'
                          : 'border-[#231C17]/20 hover:border-[#231C17] bg-[#FBF6EA]'
                      }`}
                      id={`promise-opt-${p.id}`}
                    >
                      <div className="text-[10px] text-[#9C5A2D] font-mono mb-0.5">#{p.id + 1}</div>
                      <div>{lang === 'hi' ? p.text_hi : p.text_en}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom promise textarea */}
            <div className="space-y-1">
              <label htmlFor="custom-promise-textarea" className="text-xs font-bold font-serif text-[#231C17]">
                {lang === 'hi' ? 'या अपना वचन खुद लिखें:' : 'Or write your custom promise:'}
              </label>
              <textarea
                id="custom-promise-textarea"
                value={customPromise}
                onChange={(e) => setCustomPromise(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'उदा. जब भी कोई परेशानी होगी, मैं हमेशा तुम्हारे साथ खड़ा रहूंगा।'
                    : 'e.g. I promise to always pick up your calls, no matter what.'
                }
                rows={2}
                className="w-full p-2 bg-[#F1E3CB] border border-[#231C17] rounded-xs text-xs font-hand text-[#231C17] focus:outline-none focus:ring-2 focus:ring-[#B4271F]"
              />
            </div>

            {/* Signature / Angutha Pad */}
            <div className="space-y-1 pt-2 border-t border-[#231C17]/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-serif text-[#231C17]">
                  {lang === 'hi' ? 'दस्तख़त या अंगूठा निशान (Signature Pad):' : 'Signature / Stamp Pad:'}
                </span>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-[#7C1E13] hover:underline font-serif cursor-pointer"
                  id="clear-sig-btn"
                >
                  {lang === 'hi' ? 'साफ़ करें (Clear)' : 'Clear'}
                </button>
              </div>

              <div className="w-full h-24 bg-[#F1E3CB]/60 border border-dashed border-[#231C17]/40 rounded-xs relative touch-none">
                <canvas
                  ref={sigCanvasRef}
                  width={400}
                  height={96}
                  onPointerDown={handleSigPointerDown}
                  onPointerMove={handleSigPointerMove}
                  onPointerUp={handleSigPointerUp}
                  className="w-full h-full cursor-crosshair"
                  id="signature-canvas"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-hand text-[#231C17]/40">
                    {lang === 'hi' ? 'यहां उंगली से हस्ताक्षर करें' : 'Sign with your finger here'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Zero-Gateway UPI Shagun */}
        {activeTab === 'shagun' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#F1E3CB]/80 border border-[#5F6E36] rounded-xs text-xs font-serif text-[#231C17] space-y-1">
              <div className="font-bold text-[#5F6E36]">
                {lang === 'hi' ? 'शुद्ध शून्य-शुल्क UPI शगुन' : 'Zero-Fee Direct UPI Shagun'}
              </div>
              <p className="text-[11px] text-[#231C17]/80">
                {lang === 'hi'
                  ? 'कोई मध्यस्थ नहीं। कोई गेटवे कमीशन नहीं। पैसा सीधे आपकी बहन/भाई के बैंक खाते में जाता है।'
                  : 'Zero platform cuts. Zero gateway fees. Money routes directly to their authentic bank VPA.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="upi-vpa-input" className="text-xs font-bold font-serif text-[#231C17]">
                  {lang === 'hi' ? `${senderName} की UPI ID (VPA):` : `${senderName}’s UPI VPA:`}
                </label>
                <input
                  id="upi-vpa-input"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. name@okhdfcbank"
                  className="w-full p-2 bg-[#F1E3CB] border border-[#231C17] rounded-xs text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="shagun-amount-input" className="text-xs font-bold font-serif text-[#231C17]">
                  {lang === 'hi' ? 'शगुन राशि (₹ Amount):' : 'Shagun Amount (₹):'}
                </label>
                <div className="flex gap-1.5">
                  {['251', '501', '1100', '2100'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setShagunAmount(amt)}
                      className={`px-2 py-1 border rounded-xs text-xs font-mono font-bold cursor-pointer ${
                        shagunAmount === amt
                          ? 'bg-[#B4271F] text-[#FBF6EA] border-[#B4271F]'
                          : 'bg-[#F1E3CB] border-[#231C17]/30'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {upiId && (
              <div className="pt-2 text-center space-y-2">
                <a
                  href={upiDeepLink}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#5F6E36] hover:bg-[#4a572a] text-[#FBF6EA] font-display font-bold text-sm rounded-xs shadow-xs"
                  id="upi-pay-deeplink-btn"
                >
                  <span>{lang === 'hi' ? `Google Pay / PhonePe / Paytm से ₹${shagunAmount} भेजें` : `Pay ₹${shagunAmount} via UPI App`}</span>
                </a>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowUpiQR(!showUpiQR)}
                    className="text-xs text-[#7A5030] hover:underline cursor-pointer"
                    id="toggle-upi-qr-btn"
                  >
                    {lang === 'hi' ? 'UPI QR कोड देखें' : 'Show UPI QR Code'}
                  </button>
                </div>

                {showUpiQR && (
                  <div
                    className="p-3 bg-[#FBF6EA] border border-[#231C17] rounded-xs inline-block shadow-xs"
                    dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(upiDeepLink, 180) }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Handcrafted IOU Note */}
        {activeTab === 'note' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F1E3CB] border-2 border-[#231C17] rounded-xs relative text-center space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#7C1E13] border-b border-[#231C17]/15 pb-1">
                <span>RESERVE SHAGUN OF DHAAGA</span>
                <span>PROMISE IOU</span>
              </div>

              <div className="py-3">
                <div className="text-3xl font-display font-bold text-[#B4271F]">
                  ₹{noteAmount}
                </div>
                <p className="text-xs font-hand text-[#231C17] mt-1">
                  {lang === 'hi'
                    ? `मैं ${receiverName}, ${senderName} को यह शगुन भेंट देने का वचन देता हूँ।`
                    : `I, ${receiverName}, promise to pay ${senderName} this auspicious shagun.`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                {['501', '1100', '2100', '5100'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setNoteAmount(amt)}
                    className={`px-2.5 py-0.5 border rounded-xs text-xs font-mono font-bold cursor-pointer ${
                      noteAmount === amt ? 'bg-[#B4271F] text-[#FBF6EA] border-[#B4271F]' : 'bg-[#FBF6EA]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Reply Jodi Link Button */}
        <div className="pt-3 border-t border-[#231C17]/15 space-y-3">
          <button
            type="button"
            onClick={handleGenerateReplyLink}
            className="w-full py-3 bg-[#B4271F] hover:bg-[#7C1E13] text-[#FBF6EA] font-display font-bold text-sm rounded-xs shadow-[2px_2px_0px_#231C17] cursor-pointer flex items-center justify-center gap-2"
            id="generate-reply-link-btn"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'hi' ? 'उत्तर (जोड़ी) लिंक तैयार करें' : 'Generate Jodi Reply Link'}</span>
          </button>

          {replyUrl && (
            <div className="p-3 bg-[#F1E3CB] border border-[#231C17] rounded-xs space-y-2 animate-fade-in">
              <div className="font-mono text-xs text-[#231C17] break-all max-h-20 overflow-y-auto select-all">
                {replyUrl}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(replyUrl);
                    setCopied(true);
                    audio.playGhungroo();
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-[#B4271F] text-[#FBF6EA] text-xs font-serif font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                  id="copy-reply-link-btn"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'लिंक कॉपी करें' : 'Copy Reply')}</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `✨ मैंने आपका रक्षासूत्र स्वीकार किया और अपना वचन भेजा है: ${replyUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-serif font-bold rounded-xs flex items-center gap-1"
                  id="whatsapp-reply-btn"
                >
                  <span>WhatsApp उत्तर</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Back Navigation */}
        <div className="pt-2">
          <button
            onClick={onBack}
            className="px-4 py-1.5 border border-[#231C17]/40 text-[#231C17] rounded-xs font-serif text-xs hover:bg-[#DCC9A6]/40 cursor-pointer flex items-center gap-1"
            id="vachan-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'पीछे (राखी देखें)' : 'Back to Rakhi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
