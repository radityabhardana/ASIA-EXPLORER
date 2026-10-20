type NoteBlockProps = {
  id: string;
  title: string;
  text: string;
};

export default function NoteBlock({ id, title, text }: NoteBlockProps) {
  return (
    <section className="country-block country-note" aria-labelledby={id}>
      <div className="country-block__inner">
        <h2 id={id}>{title}</h2>
        <p className="country-note__text">{text}</p>
      </div>
    </section>
  );
}
