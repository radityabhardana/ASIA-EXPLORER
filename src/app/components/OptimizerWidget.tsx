import { useEffect, useState, useCallback } from 'react';
import {
  Sliders,
  AlertCircle,
  Clock,
  CheckCircle2,
  KeyRound,
  Check,
  Cpu,
} from 'lucide-react';
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
    [dna, weakSpots, progress],
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

  function renderPriorityIcon(priority: Recommendation['priority']) {
    switch (priority) {
      case 'high':
        return <AlertCircle size={14} className="optimizer-rec__icon-svg optimizer-rec__icon-svg--high" />;
      case 'medium':
        return <Clock size={14} className="optimizer-rec__icon-svg optimizer-rec__icon-svg--medium" />;
      case 'low':
      default:
        return <CheckCircle2 size={14} className="optimizer-rec__icon-svg optimizer-rec__icon-svg--low" />;
    }
  }

  return (
    <div className="dashboard-console-card optimizer-widget">
      {/* Console Card Header */}
      <div className="dashboard-console-card__header">
        <div className="dashboard-console-card__title-wrap">
          <Sliders size={15} className="dashboard-console-card__icon" aria-hidden="true" />
          <span className="dashboard-console-card__title">Rekomendasi Belajar</span>
        </div>
        <span className="dashboard-console-card__badge">
          {isAi ? 'Mode Adaptif AI' : 'Mode Algoritmik'}
        </span>
      </div>

      <div className="optimizer-widget__body">
        {/* Toggle Mode Switch */}
        <div className="optimizer-toggle">
          <div className="optimizer-toggle__info">
            <span className="optimizer-toggle__title">
              {isAi ? 'Kecerdasan Buatan (OpenAI)' : 'Aturan Heuristik Leitner'}
            </span>
            <span className="optimizer-toggle__desc">
              {isAi
                ? 'Analisis naratif berbasis model LLM'
                : 'Prioritas berdasarkan keterlambatan frasa & akurasi'}
            </span>
          </div>

          <div className="optimizer-toggle__controls">
            <span className={`optimizer-toggle__label${!isAi ? ' optimizer-toggle__label--active' : ''}`}>
              Manual
            </span>
            <button
              className={`optimizer-toggle__track${isAi ? ' optimizer-toggle__track--on' : ''}`}
              onClick={toggleMode}
              aria-label="Alihkan mode rekomendasi manual atau AI"
              type="button"
            >
              <span className={`optimizer-toggle__thumb${isAi ? ' optimizer-toggle__thumb--on' : ''}`} />
            </button>
            <span className={`optimizer-toggle__label${isAi ? ' optimizer-toggle__label--active' : ''}`}>
              AI
            </span>
          </div>
        </div>

        {/* API Key Input for AI Mode */}
        {isAi && !settings.openaiApiKey && (
          <div className="optimizer-apikey">
            <div className="optimizer-apikey__field">
              <KeyRound size={15} className="optimizer-apikey__icon" aria-hidden="true" />
              <input
                type="password"
                className="optimizer-apikey__input"
                placeholder="Masukkan OpenAI API Key..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
              />
            </div>
            <button type="button" className="dashboard-btn dashboard-btn--accent" onClick={saveApiKey}>
              <Check size={14} />
              <span>Simpan</span>
            </button>
          </div>
        )}

        {/* Recommendations List */}
        {loading ? (
          <div className="optimizer-loading" role="status">
            <Cpu size={18} className="optimizer-loading__icon" />
            <span>Menganalisis profil kognitif & rekomendasi...</span>
          </div>
        ) : (
          <div className="optimizer-recs">
            {recs.map((rec, i) => (
              <div key={i} className={`optimizer-rec optimizer-rec--${rec.priority}`}>
                <div className="optimizer-rec__icon-wrap">
                  {renderPriorityIcon(rec.priority)}
                </div>
                <div className="optimizer-rec__body">
                  <div className="optimizer-rec__header">
                    <span className={`optimizer-rec__priority-tag optimizer-rec__priority-tag--${rec.priority}`}>
                      {rec.priority === 'high' ? 'Penting' : rec.priority === 'medium' ? 'Moderat' : 'Pengayaan'}
                    </span>
                  </div>
                  <p className="optimizer-rec__msg">{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
