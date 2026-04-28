import Link from "next/link";
import { included, notIncluded } from "@/lib/site/content";
import { Icon } from "@/components/site/Icons";
import { ProgramTimeline } from "@/components/site/ProgramTimeline";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata = {
  title: "Program | Eastaura",
  description:
    "The 5-day TCM Wellness Reset pilot program for overseas guests seeking stress recovery and sleep reset in China.",
};

export default function ProgramPage() {
  return (
    <main>
      <section className="page-hero program-hero">
        <p className="eyebrow light">5-day / 4-night pilot</p>
        <h1>TCM Wellness Reset in China</h1>
        <p>
          A calm, translator-supported retreat flow for stress recovery, sleep
          rhythm, energy restoration, and whole-person balance.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/intake">
            Start Intake <Icon name="arrow" />
          </Link>
          <Link className="secondary-button" href="/safety">
            Read safety boundaries
          </Link>
        </div>
      </section>

      <section className="section split-section">
        <SectionHeading
          eyebrow="Sample flow"
          title="A slower itinerary, not a packed tour"
          text="The pilot assumes Shanghai arrival and Hangzhou wellness context while final partners remain to be confirmed."
        />
        <div className="program-facts">
          <article>
            <span>Pilot price range</span>
            <strong>$2,500-$3,000</strong>
          </article>
          <article>
            <span>Best fit</span>
            <strong>35-60 high-pressure professionals</strong>
          </article>
          <article>
            <span>Service model</span>
            <strong>Concierge + partners + human review</strong>
          </article>
        </div>
      </section>

      <section className="section">
        <ProgramTimeline />
      </section>

      <section className="section inclusion-grid">
        <div>
          <SectionHeading
            eyebrow="Included"
            title="What the pilot package is designed to cover"
          />
          <ul className="check-list">
            {included.map((item) => (
              <li key={item}>
                <Icon name="check" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeading eyebrow="Not included" title="What remains outside" />
          <ul className="plain-list">
            {notIncluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section suitability-grid">
        <article>
          <h2>Ideal for</h2>
          <p>
            Stressed professionals, sleep-deprived founders, executives,
            consultants, coaches, and curious travelers who want a slower
            recovery-oriented China experience with translation support.
          </p>
        </article>
        <article>
          <h2>Not suitable for</h2>
          <p>
            Urgent medical situations, unstable symptoms, people seeking
            guaranteed treatment results, or anyone unwilling to complete safety
            screening before arrival.
          </p>
        </article>
      </section>
    </main>
  );
}
