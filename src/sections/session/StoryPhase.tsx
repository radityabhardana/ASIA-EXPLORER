import { useState, useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Volume2, ArrowRight, Sparkles } from 'lucide-react';
import { speak, cancelSpeech } from '@/lib/speech';

export interface StoryPanel {
  id: string;
  title: string;
  body: string;
  funFact: string;
  funFactLabel: string;
  backgroundVariant: 'kenali' | 'budaya' | 'bahasa' | 'kuliner';
}

interface StoryPhaseProps {
  countryId: string;
  countryName: string;
  speechLang: string;
  panels: StoryPanel[];
  onComplete: () => void;
}

function StoryPanelView({
  panel,
  index,
  total,
  speechLang,
  onNext,
}: {
  panel: StoryPanel;
  index: number;
  total: number;
  speechLang: string;
  onNext: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const handleListen = () => {
    cancelSpeech();
    speak(panel.body, { lang: speechLang, rate: 0.9 });
  };

  return (
    <div
      ref={containerRef}
      className={`story-panel story-panel--${panel.backgroundVariant}`}
      id={`story-panel-${panel.id}`}
    >
      <span className="story-panel__number" aria-hidden="true">
        {index + 1} / {total}
      </span>

      <div className="story-panel__content">
        {/* Headline */}
        <motion.h2
          className="story-panel__headline"
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
        >
          {panel.title}
        </motion.h2>

        {/* Body */}
        <motion.p
          className="story-panel__body"
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        >
          {panel.body}
        </motion.p>

        {/* Fun Fact flip card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.45, ease: 'easeOut' }}
        >
          <div
            className="story-panel__fun-fact"
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={flipped ? `Fakta: ${panel.funFact}` : `Klik untuk melihat ${panel.funFactLabel}`}
          >
            <div className={`story-panel__fun-fact-inner${flipped ? ' story-panel__fun-fact-inner--flipped' : ''}`}>
              <div className="story-panel__fun-fact-front">
                <Sparkles size={16} aria-hidden="true" />
                <span>{panel.funFactLabel}</span>
              </div>
              <div className="story-panel__fun-fact-back">{panel.funFact}</div>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="story-panel__buttons"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
        >
          <button type="button" className="story-panel__btn-listen" onClick={handleListen} aria-label="Dengarkan narasi ini">
            <Volume2 size={15} aria-hidden="true" />
            Dengarkan
          </button>
          <button type="button" className="story-panel__btn-next" onClick={onNext} aria-label={index + 1 < total ? 'Panel berikutnya' : 'Selesai dan lanjut'}>
            {index + 1 < total ? 'Lanjut' : 'Mulai Quest'}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function StoryPhase({ countryId: _countryId, countryName: _countryName, speechLang, panels, onComplete }: StoryPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    cancelSpeech();
    if (currentIndex + 1 < panels.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const currentPanel = panels[currentIndex];
  if (!currentPanel) return null;

  return (
    <div className="story-phase">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPanel.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ width: '100%' }}
        >
          <StoryPanelView
            panel={currentPanel}
            index={currentIndex}
            total={panels.length}
            speechLang={speechLang}
            onNext={handleNext}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
