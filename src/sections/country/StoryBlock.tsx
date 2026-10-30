import type { Country } from '@/content/countries';
import type { Locale } from '@/lib/i18n';

interface StoryBlockProps {
  country: Country;
  locale?: Locale;
}

const QUOTE_KEYWORDS = [
  'tanda',
  'hormat',
  'kehormatan',
  'sakral',
  'persatuan',
  'doa',
  'adab',
  'takzim',
  'etika',
  'santun',
  'kebersamaan',
  'batin',
  'jiwa',
  'berkah',
  'pantangan',
  'tabu',
  'ambang',
  'derajat',
  'tamu',
  'jamuan',
  'respect',
  'honor',
  'sacred',
  'tradition',
  'hospitality',
  'elder',
  'custom',
  'gesture',
  'greeting',
  'blessing',
];

interface StorySections {
  lead: string;
  paragraphs: string[];
  quote: string;
}

function processStoryText(text: string): StorySections {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    return { lead: '', paragraphs: [], quote: '' };
  }

  // Lead paragraph: first 2 sentences for rich opening, or 1 if very few
  const leadCount = sentences.length >= 7 ? 2 : 1;
  const lead = sentences.slice(0, leadCount).join(' ');

  // Find evocative cultural quote
  let bestQuote = sentences[0] || '';
  let maxScore = -1;

  sentences.forEach((str, i) => {
    let score = 0;
    const lower = str.toLowerCase();
    for (const kw of QUOTE_KEYWORDS) {
      if (lower.includes(kw)) score += 2;
    }
    if (str.includes('—')) score += 1;
    if (str.length >= 40 && str.length <= 160) score += 1;
    if (i >= leadCount) score += 1;

    if (score > maxScore) {
      maxScore = score;
      bestQuote = str;
    }
  });

  // Remaining body paragraphs
  const remaining = sentences.slice(leadCount);
  let paragraphs: string[] = [];

  if (remaining.length <= 3) {
    paragraphs = remaining.length > 0 ? [remaining.join(' ')] : [];
  } else {
    const mid = Math.ceil(remaining.length / 2);
    paragraphs = [
      remaining.slice(0, mid).join(' '),
      remaining.slice(mid).join(' '),
    ];
  }

  return { lead, paragraphs, quote: bestQuote };
}

export default function StoryBlock({ country, locale = 'id' }: StoryBlockProps) {
  const { story } = country;
  if (!story?.text) {
    return null;
  }

  const { lead, paragraphs, quote } = processStoryText(story.text);

  return (
    <section className="country-block country-story" aria-labelledby="country-story-title">
      <div className="country-block__inner country-story__inner">
        <header className="country-story__header">
          <div className="country-story__kicker-wrap">
            <span className="country-story__mark" aria-hidden="true" />
            <p className="country-story__kicker">
              {locale === 'id' ? 'NARASI PERADABAN' : 'CIVILIZATION NARRATIVE'}
            </p>
          </div>
          <h2 id="country-story-title" className="country-story__title">
            {locale === 'id' ? 'Cerita' : 'Story'}
          </h2>
          <p className="country-story__subtitle">
            {locale === 'id'
              ? `Latar sejarah, tradisi bertegur sapa, dan dinamika kebudayaan di ${country.nameId}.`
              : `Historical roots, interpersonal greetings, and cultural dynamics of ${country.nameId}.`}
          </p>
        </header>

        <div className="country-story__body">
          {lead && <p className="country-story__lead">{lead}</p>}

          {paragraphs[0] && (
            <p className="country-story__paragraph">{paragraphs[0]}</p>
          )}

          {quote && (
            <blockquote className="country-story__quote">
              <p className="country-story__quote-text">“{quote}”</p>
              <cite className="country-story__quote-cite">
                {locale === 'id' ? '— Etos & Tradisi Lapangan' : '— Cultural Ethos & Field Tradition'}
              </cite>
            </blockquote>
          )}

          {paragraphs[1] && (
            <p className="country-story__paragraph">{paragraphs[1]}</p>
          )}
        </div>
      </div>
    </section>
  );
}
