import React, { useState, useEffect } from 'react';
import { ViewType, SchemaV1, RakhiConfig, ThaalConfig, GesturePoint, PetiItem } from './types';
import { decodePayload, encodePayload } from './core/codec';
import { generateSeed } from './core/prng';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ThresholdView } from './components/ThresholdView';
import { RishtaView } from './components/RishtaView';
import { KarkhanaView } from './components/KarkhanaView';
import { ThaalChithiView } from './components/ThaalChithiView';
import { BandhanView } from './components/BandhanView';
import { MoharLinkView } from './components/MoharLinkView';
import { KholoView } from './components/KholoView';
import { VachanReplyView } from './components/VachanReplyView';
import { PetiView } from './components/PetiView';
import { RivaajView } from './components/RivaajView';
import { PedView } from './components/PedView';
import { BaatView } from './components/BaatView';
import { SelftestView } from './components/SelftestView';

export function App() {
  // Navigation & Language State
  const [currentView, setCurrentView] = useState<ViewType>('threshold');
  const [lang, setLang] = useState<'hi' | 'en'>('hi');

  // Creator state (Acts 1-5)
  const [selectedRishtaId, setSelectedRishtaId] = useState<number>(0);
  const [receiverName, setReceiverName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [rakhiConfig, setRakhiConfig] = useState<RakhiConfig>({
    d: 0,
    c: 0,
    p: [0],
    s: generateSeed(),
    j: 8,
    h: [0],
    z: 0,
  });
  const [thaalConfig, setThaalConfig] = useState<ThaalConfig>({
    s: 0,
    d: 1,
    r: 1,
    a: 1,
  });
  const [letterText, setLetterText] = useState<string>('');
  const [typingRhythm, setTypingRhythm] = useState<string>('');
  const [wristSkin, setWristSkin] = useState<number>(1);
  const [wristSleeve, setWristSleeve] = useState<number>(0);
  const [recordedGesture, setRecordedGesture] = useState<GesturePoint[]>([]);

  // Receiver state (Act 6 & 7)
  const [receivedPayload, setReceivedPayload] = useState<SchemaV1 | null>(null);

  // Peti Archive state
  const [petiItems, setPetiItems] = useState<PetiItem[]>(() => {
    try {
      const saved = localStorage.getItem('dhaaga_peti_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to Peti helper
  const handleSaveToPeti = (item: PetiItem) => {
    setPetiItems((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      const updated = existing ? prev.map((x) => (x.id === item.id ? item : x)) : [item, ...prev];
      try {
        localStorage.setItem('dhaaga_peti_v1', JSON.stringify(updated));
      } catch (err) {
        console.error('LocalStorage write failed:', err);
      }
      return updated;
    });
  };

  const handleWipePeti = () => {
    setPetiItems([]);
    try {
      localStorage.removeItem('dhaaga_peti_v1');
    } catch {}
  };

  // Inspect and process incoming URL Hash
  const processIncomingHash = async () => {
    const hash = window.location.hash;
    if (hash && (hash.startsWith('#1.') || hash.startsWith('#'))) {
      const decoded = await decodePayload(hash);
      if (decoded) {
        setReceivedPayload(decoded);
        setCurrentView('kholo');
      }
    }
  };

  useEffect(() => {
    processIncomingHash();
    window.addEventListener('hashchange', processIncomingHash);
    return () => window.removeEventListener('hashchange', processIncomingHash);
  }, []);

  // Construct full payload object for link generation
  const currentCreatorPayload: SchemaV1 = {
    v: 1,
    t: selectedRishtaId,
    a: receiverName || (lang === 'hi' ? 'भाई / बहना' : 'Sibling'),
    b: senderName || (lang === 'hi' ? 'स्नेही' : 'Sender'),
    m: letterText || (lang === 'hi' ? 'सदा खुश रहो और सुरक्षित रहो।' : 'Stay blessed and protected always.'),
    r: typingRhythm || undefined,
    k: rakhiConfig,
    w: wristSkin,
    q: thaalConfig,
    h: recordedGesture.length > 0 ? recordedGesture : undefined,
  };

  const handleOpenPastedLink = async (link: string) => {
    const hashIdx = link.indexOf('#');
    const hash = hashIdx !== -1 ? link.slice(hashIdx) : link;
    const decoded = await decodePayload(hash);
    if (decoded) {
      setReceivedPayload(decoded);
      setCurrentView('kholo');
    } else {
      alert(lang === 'hi' ? 'लिंक अमान्य या दूषित है।' : 'Invalid or corrupted link format.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1E3CB] text-[#231C17] flex flex-col font-serif selection:bg-[#B4271F] selection:text-[#FBF6EA] relative overflow-x-hidden">
      {/* Top Header Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'hi' ? 'en' : 'hi'))}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        {/* Act 0: Threshold */}
        {currentView === 'threshold' && (
          <ThresholdView
            onStartCraft={() => setCurrentView('rishta')}
            onOpenLink={handleOpenPastedLink}
            lang={lang}
          />
        )}

        {/* Act 1: Rishta Selection */}
        {currentView === 'rishta' && (
          <RishtaView
            selectedRishtaId={selectedRishtaId}
            receiverName={receiverName}
            senderName={senderName}
            onSelectRishta={(id) => setSelectedRishtaId(id)}
            onChangeNames={(recv, sndr) => {
              setReceiverName(recv);
              setSenderName(sndr);
            }}
            onNext={() => setCurrentView('karkhana')}
            lang={lang}
          />
        )}

        {/* Act 2: Karkhana Craft Workbench */}
        {currentView === 'karkhana' && (
          <KarkhanaView
            config={rakhiConfig}
            onChangeConfig={(cfg) => setRakhiConfig(cfg)}
            onNext={() => setCurrentView('thaal')}
            onBack={() => setCurrentView('rishta')}
            lang={lang}
          />
        )}

        {/* Act 3: Thaal & Chithi */}
        {currentView === 'thaal' && (
          <ThaalChithiView
            rishtaId={selectedRishtaId}
            receiverName={receiverName || (lang === 'hi' ? 'भाई / बहना' : 'Sibling')}
            thaalConfig={thaalConfig}
            letterText={letterText}
            typingRhythm={typingRhythm}
            onChangeThaal={(cfg) => setThaalConfig(cfg)}
            onChangeLetter={(text, rhythm) => {
              setLetterText(text);
              setTypingRhythm(rhythm);
            }}
            onNext={() => setCurrentView('bandhan')}
            onBack={() => setCurrentView('karkhana')}
            lang={lang}
          />
        )}

        {/* Act 4: Bandhan (The Tying) */}
        {currentView === 'bandhan' && (
          <BandhanView
            rakhiConfig={rakhiConfig}
            wristSkin={wristSkin}
            wristSleeve={wristSleeve}
            isMemorial={selectedRishtaId === 11}
            isLumba={selectedRishtaId === 4}
            recordedGesture={recordedGesture}
            onChangeWristStyle={(skin, sleeve) => {
              setWristSkin(skin);
              setWristSleeve(sleeve);
            }}
            onSaveGesture={(gesture) => setRecordedGesture(gesture)}
            onNext={() => setCurrentView('mohar')}
            onBack={() => setCurrentView('thaal')}
            lang={lang}
          />
        )}

        {/* Act 5: Mohar & The Link */}
        {currentView === 'mohar' && (
          <MoharLinkView
            payload={currentCreatorPayload}
            onBack={() => setCurrentView('bandhan')}
            onSaveToPeti={handleSaveToPeti}
            lang={lang}
          />
        )}

        {/* Act 6: Kholo (The Receiver Experience) */}
        {currentView === 'kholo' && receivedPayload && (
          <KholoView
            payload={receivedPayload}
            onSaveToPeti={handleSaveToPeti}
            onGoToReply={() => setCurrentView('vachan')}
            lang={lang}
          />
        )}

        {/* Act 7: Vachan & Reply */}
        {currentView === 'vachan' && (
          <VachanReplyView
            originalPayload={receivedPayload || currentCreatorPayload}
            onSaveToPeti={handleSaveToPeti}
            onBack={() => setCurrentView(receivedPayload ? 'kholo' : 'mohar')}
            lang={lang}
          />
        )}

        {/* Rakhi Peti Archive View */}
        {currentView === 'peti' && (
          <PetiView
            petiItems={petiItems}
            onOpenItem={(item) => {
              try {
                const parsed: SchemaV1 = JSON.parse(item.raw_payload);
                setReceivedPayload(parsed);
                setCurrentView('kholo');
              } catch (e) {
                console.error(e);
              }
            }}
            onImportItem={(item) => handleSaveToPeti(item)}
            onWipePeti={handleWipePeti}
            lang={lang}
          />
        )}

        {/* 9 Traditions Rivaaj View */}
        {currentView === 'rivaaj' && <RivaajView lang={lang} />}

        {/* Tree Rakshasutra Ped View */}
        {currentView === 'ped' && <PedView lang={lang} />}

        {/* Truth & Limits Baat View */}
        {currentView === 'baat' && <BaatView lang={lang} />}

        {/* Self-Test Harness View */}
        {currentView === 'selftest' && <SelftestView lang={lang} />}
      </main>

      {/* Non-Negotiable Honest Footer */}
      <Footer lang={lang} onNavigate={(view) => setCurrentView(view)} />
    </div>
  );
}

export default App;
