import Link from "next/link";
import {
  heroTrustItems,
  insights,
  painPoints,
  recoveryStates,
  retreatMoments,
  trustCards,
} from "@/lib/site/content";
import { Icon } from "@/components/site/Icons";
import { ProgramTimeline } from "@/components/site/ProgramTimeline";
import { SectionHeading } from "@/components/site/SectionHeading";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <span className="hero-media-left" />
          <span className="hero-media-right" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div>
            <p className="eyebrow light">China-based TCM wellness retreat</p>
            <h1>Eastaura</h1>
            <p className="hero-subtitle">
              A private China-based retreat for stress recovery, sleep reset,
              and whole-person balance.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" href="/intake">
                Start private intake <Icon name="arrow" />
              </Link>
              <Link className="secondary-button" href="/program">
                Explore the 5-day reset
              </Link>
            </div>
          </div>
          <div className="hero-note">
            <span>Private pilot</span>
            <strong>Human-reviewed intake before any recommendation.</strong>
          </div>
        </div>
        <div className="hero-trust" aria-label="Trust signals">
          {heroTrustItems.map((item) => (
            <span key={item.title}>
              <Icon name={item.icon} /> {item.title}
            </span>
          ))}
        </div>
      </section>

      <section
        className="section editorial-intro reveal-on-scroll"
        id="why-eastaura"
      >
        <div className="editorial-copy">
          <p className="eyebrow">Boutique recovery travel</p>
          <h2>A quieter China stay, shaped around restoration.</h2>
          <p>
            Eastaura is designed for overseas guests who want the depth of a
            TCM-informed experience with the service layer of a private
            retreat: translation, partner coordination, pacing, and human
            review before arrival.
          </p>
          <div className="state-strip" aria-label="Recovery state shifts">
            {recoveryStates.map((state) => (
              <span key={state.from}>
                {state.from} <Icon name="arrow" /> {state.to}
              </span>
            ))}
          </div>
        </div>
        <div className="editorial-collage" aria-hidden="true">
          <span className="collage-image primary" />
          <span className="collage-image secondary" />
          <span className="collage-caption">
            Slow itinerary. Warm translation. Clear boundaries.
          </span>
        </div>
      </section>

      <section className="section pain-section">
        <SectionHeading
          eyebrow="Understanding your state"
          title="When ordinary rest is not enough"
          text="Eastaura translates vague burnout into a slower, safer travel experience built around recovery needs overseas guests can actually understand."
        />
        <div className="pain-grid">
          {painPoints.map((point) => (
            <article key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section moments-section reveal-on-scroll">
        <div className="moments-heading">
          <SectionHeading
            eyebrow="Retreat moments"
            title="Less explanation. More felt experience."
            text="Browse the pieces that make the pilot feel like a private retreat rather than another packed itinerary."
          />
          <div className="button-row">
            <Link className="text-link" href="/program">
              View the full rhythm <Icon name="arrow" />
            </Link>
          </div>
        </div>
        <div className="moment-rail" aria-label="Retreat moment carousel">
          {retreatMoments.map((moment) => (
            <article className="moment-card" key={moment.title}>
              <span
                className="moment-image"
                style={{ backgroundImage: `url(${moment.image})` }}
              />
              <span>{moment.label}</span>
              <h3>{moment.title}</h3>
              <p>{moment.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-section journey-section reveal-on-scroll">
        <div className="journey-sticky">
          <SectionHeading
            eyebrow="The pilot program"
            title="5-Day TCM Wellness Reset"
            text="A carefully paced 5-day / 4-night flow for overseas professionals who want recovery, translation support, and human review before acceptance."
          />
          <Link className="text-link" href="/program">
            View full program details <Icon name="arrow" />
          </Link>
        </div>
        <ProgramTimeline compact />
      </section>

      <section className="section bento-section">
        <SectionHeading
          eyebrow="Trust layer"
          title="Designed for high-ticket confidence, not wellness hype"
          text="The first version of Eastaura is a concierge trust layer: transparent boundaries, selected partners, translation support, and manual decisions."
        />
        <div className="trust-bento">
          {trustCards.map((card, index) => (
            <article className={`trust-card ${card.tone}`} key={card.title}>
              <span className="card-index">0{index + 1}</span>
              <p>{card.label}</p>
              <h3>{card.title}</h3>
              <span>{card.text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section safety-home reveal-on-scroll">
        <div>
          <p className="eyebrow light">Safety layer</p>
          <h2>Premium wellness needs clear boundaries.</h2>
          <p>
            Eastaura is not emergency care, diagnosis, or a cure promise. The
            pilot stays human-led: risk flags are reviewed before any
            recommendation or acceptance decision.
          </p>
        </div>
        <div className="safety-points">
          {[
            "Non-medical wellness concierge",
            "Qualified local providers where relevant",
            "Doctor-first guidance when risk is unclear",
            "No automatic approval",
          ].map((item) => (
            <span key={item}>
              <Icon name="shield" /> {item}
            </span>
          ))}
        </div>
      </section>

      <section className="section process-section">
        <SectionHeading
          eyebrow="How it works"
          title="A human-led path from curiosity to arrival"
          align="center"
        />
        <div className="process-steps">
          {[
            "Read the program",
            "Submit intake",
            "Human review",
            "Video consultation",
            "Curated itinerary",
            "Guided experience",
          ].map((step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section insights-preview">
        <SectionHeading
          eyebrow="Insights"
          title="Clear answers before you consider travel"
          text="No fake testimonials. Just practical notes about TCM-informed wellness, safety boundaries, and how a slower China retreat can be reviewed."
        />
        <div className="insight-grid">
          {insights.slice(0, 3).map((item) => (
            <Link
              className="insight-card"
              href={`/insights/${item.slug}`}
              key={item.slug}
            >
              <span
                className="insight-image"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <span className="insight-meta">
                {item.category} - {item.readTime}
              </span>
              <strong>{item.title}</strong>
              <span>{item.summary}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <p className="eyebrow light">Start with fit, not pressure</p>
        <h2>Tell us what recovery needs to mean for you.</h2>
        <p>
          The intake is reviewed by a person before any recommendation,
          quotation, or acceptance decision.
        </p>
        <Link className="primary-button" href="/intake">
          Start Your Intake <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}
