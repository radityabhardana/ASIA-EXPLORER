import { useEffect, useState, useCallback } from 'react';
import type { LearningDNA, WeakSpot } from '@/lib/learningDna';
import {
  getOptimizerSettings,
  saveOptimizerSettings,
  getManualRecommendations,
  getAIRecommendations,
  type OptimizerSettings,
  type Recommendation,
  type ProgressData,
} from '@/lib/aiOptimizer';
import '@/styles/optimizer.css';

interface OptimizerWidgetProps {
  profileId: string;
  dna: LearningDNA | null;
  weakSpots: WeakSpot[];
  progress: ProgressData;
}

const PRIORITY_ICON: Record<Recommendation['priority'], string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

export default function OptimizerWidget({
  dna,
  weakSpots,
  progress,
}: OptimizerWidgetProps) {
  const [settings, setSettings] = useState<OptimizerSettings>(getOptimizerSettings);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecs = useCallback(
    async (s: OptimizerSettings) => {
      if (s.mode === 'ai' && s.openaiApiKey) {
        setLoading(true);
        const result = await getAIRecommendations(s.openaiApiKey, dna, weakSpots);
        setRecs(result.slice(0, 3));
        setLoading(false);
      } else {
        setRecs(getManualRecommendations(dna, weakSpots, progress).slice(0, 3));
      }
    },
    [dna, weakSpots, progress]
  );

  useEffect(() => {
    void fetchRecs(settings);
  }, [settings, fetchRecs]);

  function toggleMode() {
    const next: OptimizerSettings = {
      ...settings,
      mode: settings.mode === 'manual' ? 'ai' : 'manual',
      lastUpdated: Date.now(),
    };
    saveOptimizerSettings(next);
    setSettings(next);
  }

  function saveApiKey() {
    if (!apiKeyInput.trim()) return;
    const next: OptimizerSettings = {
      ...settings,
      openaiApiKey: apiKeyInput.trim(),
      lastUpdated: Date.now(),
    };
    saveOptimizerSettings(next);
    setSettings(next);
    setApiKeyInput('');
  }

  const isAi = settings.mode === 'ai';

  return (
    <div className="optimizer-widget">
      <h2>🧠 Rekomendasi Belajar</h2>

      {/* Toggle */}
      <div className="optimizer-toggle">
        <span className={`optimizer-toggle__label${!isAi ? ' optimizer-toggle__label--active' : ''}`}>
          Manual
        </span>
        <button
          className={`optimizer-toggle__track${isAi ? ' optimizer-toggle__track--on' : ''}`}
          onClick={toggleMode}
          aria-label="Toggle AI mode"
          type="button"
        >
          <span className={`optimizer-toggle__thumb${isAi ? ' optimizer-toggle__thumb--on' : ''}`} />
        </button>
        <span className={`optimizer-toggle__label${isAi ? ' optimizer-toggle__label--active' : ''}`}>
          AI
        </span>
      </div>

      {/* API Key input (AI mode, no key yet) */}
      {isAi && !settings.openaiApiKey && (
        <div className="optimizer-apikey">
          <input
            type="password"
            placeholder="Masukkan OpenAI API Key..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
          />
          <button type="button" onClick={saveApiKey}>
            Simpan
          </button>
        </div>
      )}

      {/* Recommendations */}
      {loading ? (
        <div className="optimizer-loading">Memuat rekomendasi AI…</div>
      ) : (
        <div className="optimizer-recs">
          {recs.map((rec, i) => (
            <div key={i} className={`optimizer-rec optimizer-rec--${rec.priority}`}>
              <span className="optimizer-rec__icon">{PRIORITY_ICON[rec.priority]}</span>
              <div className="optimizer-rec__body">
                <p className="optimizer-rec__msg">{rec.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
