type NoteBlockProps = {
  id: string;
  title: string;
  text: string;
  stamp?: string;
  subtitle?: string;
};

export default function NoteBlock({
  id,
  title,
  text,
  stamp,
  subtitle,
}: NoteBlockProps) {
  const isCulture =
    id.toLowerCase().includes('culture') ||
    title.toLowerCase().includes('budaya') ||
    title.toLowerCase().includes('culture');
  const isPeople =
    id.toLowerCase().includes('people') ||
    title.toLowerCase().includes('orang') ||
    title.toLowerCase().includes('people');
  const isEnglish = title === 'Culture' || title === 'People';

  const resolvedStamp =
    stamp ||
    (isCulture
      ? isEnglish
        ? 'CULTURAL HERITAGE ARCHIVE'
        : 'ARSIP KHAZANAH BUDAYA'
      : isPeople
        ? isEnglish
          ? 'SOCIAL DYNAMICS ARCHIVE'
          : 'ARSIP DINAMIKA SOSIAL'
        : isEnglish
          ? 'ETHNOGRAPHIC ARCHIVE'
          : 'ARSIP ETNOGRAFIS');

  const resolvedSubtitle =
    subtitle ||
    (isCulture
      ? isEnglish
        ? 'Archival record of traditional heritage, ancestral language, and cultural fabric.'
        : 'Catatan ragam tradisi, bahasa leluhur, dan identitas peradaban masyarakat.'
      : isPeople
        ? isEnglish
          ? 'Field observation of communal mores, interpersonal courtesies, and societal kinship.'
          : 'Pengamatan tata susila kemasyarakatan, interaksi warga, dan etos kekerabatan.'
        : isEnglish
          ? 'Curated field notes and ethnographic documentation.'
          : 'Catatan kuratorial lapangan dan narasi etnografis bangsa.');

  return (
    <section
      className="country-block country-note country-archive-plate"
      aria-labelledby={id}
    >
      <div className="country-block__inner country-archive-plate__inner">
        <header className="country-archive-plate__header">
          <div className="country-archive-plate__stamp">
            <span className="country-archive-plate__seal" aria-hidden="true">
              §
            </span>
            <span className="country-archive-plate__kicker">
              {resolvedStamp}
            </span>
          </div>
          <h2 id={id} className="country-archive-plate__title">
            {title}
          </h2>
          <p className="country-archive-plate__subtitle">{resolvedSubtitle}</p>
        </header>
        <div className="country-archive-plate__body">
          <p className="country-note__text country-archive-plate__text">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}
