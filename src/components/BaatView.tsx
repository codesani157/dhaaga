import React from 'react';
import { ShieldCheck, Lock, HeartHandshake, AlertCircle, Sparkles } from 'lucide-react';

interface BaatViewProps {
  lang: 'hi' | 'en';
}

export const BaatView: React.FC<BaatViewProps> = ({ lang }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-[#9C5A2D]">
          {lang === 'hi' ? 'बात · सच, सादगी और सीमाएं' : 'Baat · Truth, Simplicity & Limits'}
        </span>
        <h2 className="text-3xl font-display text-[#B4271F] font-bold mt-1">
          {lang === 'hi' ? 'धागा के पीछे की सोच और सच' : 'The Philosophy & Absolute Truth of Dhaaga'}
        </h2>
        <p className="text-sm font-serif text-[#231C17]/80 mt-1 max-w-xl mx-auto">
          {lang === 'hi'
            ? 'कोई अस्पष्ट शर्तें नहीं। कोई छिपा हुआ डेटा संकलन नहीं। सब कुछ पारदर्शी और ईमानदार।'
            : 'Zero hidden terms. Zero surveillance. Fully open, private, and client-side by design.'}
        </p>
      </div>

      {/* 3 Core Truth Pillars */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[3px_3px_0px_#231C17] space-y-2">
          <div className="w-9 h-9 rounded-full bg-[#B4271F] text-[#FBF6EA] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-base text-[#231C17]">
            {lang === 'hi' ? 'शून्य सर्वर (Zero Servers)' : 'Zero Database & Servers'}
          </h3>
          <p className="text-xs font-serif text-[#231C17]/80 leading-relaxed">
            {lang === 'hi'
              ? 'आपकी चिट्ठी, थाल की पसंद और हाथ की हरकत केवल URL लिंक के अंदर संकुचित (Compressed) होती है। हमारे सर्वर पर कुछ भी सेव नहीं होता।'
              : 'Your letter, thaal items, and hand movements compress directly into the URL fragment. Nothing ever touches a database.'}
          </p>
        </div>

        <div className="bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[3px_3px_0px_#231C17] space-y-2">
          <div className="w-9 h-9 rounded-full bg-[#5F6E36] text-[#FBF6EA] flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-base text-[#231C17]">
            {lang === 'hi' ? '₹0 हमेशा के लिए (Forever Free)' : '₹0 Forever & Free'}
          </h3>
          <p className="text-xs font-serif text-[#231C17]/80 leading-relaxed">
            {lang === 'hi'
              ? 'कोई विज्ञापन नहीं, कोई प्रीमियम सब्सक्रिप्शन नहीं, कोई पेमेंट गेटवे कमीशन नहीं। शगुन सीधे पाने वाले के UPI पर जाता है।'
              : 'Zero advertisements, zero merchant fees, zero hidden upsells. Shagun transfers route directly peer-to-peer.'}
          </p>
        </div>

        <div className="bg-[#FBF6EA] border-2 border-[#231C17] p-5 rounded-xs shadow-[3px_3px_0px_#231C17] space-y-2">
          <div className="w-9 h-9 rounded-full bg-[#B5872B] text-[#FBF6EA] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-display font-bold text-base text-[#231C17]">
            {lang === 'hi' ? 'शून्य कुकीज़ व ट्रैकिंग' : 'Zero Cookies or Tracking'}
          </h3>
          <p className="text-xs font-serif text-[#231C17]/80 leading-relaxed">
            {lang === 'hi'
              ? 'कोई थर्ड-पार्टी एनालिटिक्स या ट्रैकिंग पिक्सल नहीं है। आपकी राखी पेटी केवल आपके अपने फोन/कंप्यूटर के ब्राउज़र में रहती है।'
              : 'Zero third-party trackers, pixels, or ad networks. Your Peti archive lives exclusively in your browser localStorage.'}
          </p>
        </div>
      </div>

      {/* Kya Nahin Ho Sakta (Honest Boundaries) */}
      <div className="bg-[#FBF6EA] border-2 border-[#7C1E13] p-6 rounded-xs shadow-[4px_4px_0px_#7C1E13] space-y-4">
        <div className="flex items-center gap-2 text-[#7C1E13] font-display font-bold text-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{lang === 'hi' ? 'क्या नहीं हो सकता (ईमानदार सीमाएं)' : 'What Dhaaga Cannot Do (Honest Limits)'}</span>
        </div>

        <ul className="space-y-2 text-xs font-serif text-[#231C17]/90 list-disc list-inside leading-relaxed">
          <li>
            <strong>{lang === 'hi' ? 'लिंक खो गया तो रिकवर नहीं होगा:' : 'Lost Links Cannot Be Recovered:'}</strong>{' '}
            {lang === 'hi'
              ? 'चूंकि डेटाबेस नहीं है, यदि आप लिंक खो देते हैं तो हम उसे खोजकर नहीं दे सकते। लिंक को WhatsApp चैट में सुरक्षित रखें।'
              : 'Because there is no database, we cannot search or recover a lost link. Keep it in your chat history.'}
          </li>
          <li>
            <strong>{lang === 'hi' ? 'रीड-रिसिप्ट (Read Receipts) नहीं हैं:' : 'No Read Receipts:'}</strong>{' '}
            {lang === 'hi'
              ? 'हम आपको यह नहीं बता सकते कि उन्होंने लिंक किस समय खोला, क्योंकि हम किसी की जासूसी नहीं करते।'
              : 'We do not track or alert you when the recipient opens the link.'}
          </li>
          <li>
            <strong>{lang === 'hi' ? '१९०० अक्षरों की प्राकृतिक सीमा:' : '1900-Character URL Budget:'}</strong>{' '}
            {lang === 'hi'
              ? 'WhatsApp और पुराने ब्राउज़रों में सुचारू रूप से चलने के लिए लिंक का आकार १९०० अक्षरों से छोटा रखा जाता है।'
              : 'To ensure smooth transmission across WhatsApp and SMS, URL payloads are capped at ~1.9KB.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
