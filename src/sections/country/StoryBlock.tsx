import type { Country } from '@/content/countries';

type StoryBlockProps = {
  country: Country;
};

export default function StoryBlock({ country }: StoryBlockProps) {
  const { story } = country;
  if (!story?.text) {
    return null;
  }

  return (
    <section className="country-block country-story" aria-labelledby="country-story-title">
      <div className="country-block__inner">
        <h2 id="country-story-title" className="country-story__title">
          Cerita
        </h2>
        <p className="country-story__text">{story.text}</p>
      </div>
    </section>
  );
}
