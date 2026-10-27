import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
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

export default function LearningDnaChart({ dna, size = 300 }: LearningDnaChartProps) {
  const data = AXES.map(({ key, label }) => ({ subject: label, value: dna[key] }));

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <p
        style={{
          color: '#f59e0b',
          fontWeight: 700,
          fontSize: 16,
          margin: '0 0 8px',
          textAlign: 'center',
        }}
      >
        🧬 Learning DNA
      </p>
      <ResponsiveContainer width="100%" height={size}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(245,158,11,0.2)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
          />
          <Radar
            name="DNA"
            dataKey="value"
            stroke="#f59e0b"
            fill="rgba(245, 158, 11, 0.3)"
            fillOpacity={1}
          />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #f59e0b', borderRadius: 8 }}
            labelStyle={{ color: '#f59e0b' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p
        style={{
          color: '#94a3b8',
          fontSize: 12,
          margin: '8px 0 0',
          textAlign: 'center',
        }}
      >
        Profil belajar Anda berdasarkan aktivitas
      </p>
    </div>
  );
}
