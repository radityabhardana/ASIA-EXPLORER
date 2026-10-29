import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Dna, Award } from 'lucide-react';
import type { LearningDNA } from '@/lib/learningDna';

interface LearningDnaChartProps {
  dna: LearningDNA;
  size?: number;
}

const AXES = [
  { key: 'listening' as const, label: 'Listening' },
  { key: 'reading' as const, label: 'Membaca' },
  { key: 'cultural' as const, label: 'Budaya' },
  { key: 'quizSpeed' as const, label: 'Kecepatan' },
  { key: 'consistency' as const, label: 'Konsistensi' },
];

export default function LearningDnaChart({ dna, size = 260 }: LearningDnaChartProps) {
  const data = AXES.map(({ key, label }) => ({
    subject: label,
    value: dna[key],
    fullMark: 100,
  }));

  // Find strongest dimension
  const strongest = AXES.reduce((prev, cur) => (dna[cur.key] > dna[prev.key] ? cur : prev), AXES[0]!);

  return (
    <div className="dashboard-console-card dna-chart-card">
      <div className="dashboard-console-card__header">
        <div className="dashboard-console-card__title-wrap">
          <Dna size={15} className="dashboard-console-card__icon" aria-hidden="true" />
          <span className="dashboard-console-card__title">Learning DNA</span>
        </div>
        <span className="dashboard-console-card__badge">Analisis Kognitif</span>
      </div>

      <div className="dna-chart-card__body">
        <ResponsiveContainer width="100%" height={size}>
          <RadarChart data={data} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
            <PolarGrid stroke="var(--line, #dcd1c2)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: 'var(--ink-muted, #5c6670)',
                fontSize: 11,
                fontFamily: 'var(--font-text, sans-serif)',
                fontWeight: 600,
              }}
            />
            <Radar
              name="Skor DNA"
              dataKey="value"
              stroke="var(--accent, #176b68)"
              strokeWidth={2}
              fill="var(--accent, #176b68)"
              fillOpacity={0.22}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-raised, #fffef9)',
                border: '1px solid var(--line, #dcd1c2)',
                borderRadius: '6px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(44, 38, 30, 0.08)',
                fontFamily: 'var(--font-text, sans-serif)',
                fontSize: '12px',
                color: 'var(--ink, #1a1f24)',
              }}
              formatter={(value: unknown) => [`${value} / 100`, 'Nilai Indeks']}
              labelStyle={{
                fontWeight: 600,
                color: 'var(--accent, #176b68)',
                marginBottom: '4px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="dna-chart-card__footer">
          <div className="dna-chart-card__pill">
            <Award size={13} className="dna-chart-card__pill-icon" aria-hidden="true" />
            <span>Fokus Utama: <strong>{strongest.label}</strong> ({dna[strongest.key]}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
