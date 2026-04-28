import Link from "next/link";
import { insights } from "@/lib/site/content";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata = {
  title: "Insights | Eastaura",
  description:
    "Editorial notes about TCM-informed wellness, recovery travel, safety screening, and Eastaura boundaries.",
};

export default function InsightsPage() {
  return (
    <main>
      <section className="page-hero insights-hero">
        <p className="eyebrow light">Eastaura insights</p>
        <h1>Read before you travel for recovery</h1>
        <p>
          Practical, non-hyped notes on stress recovery, sleep reset,
          translation support, and the boundaries of TCM-informed wellness.
        </p>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Editorial library"
          title="Transparent answers, not fake proof"
          text="These sample articles are designed to become the first SEO and trust-building layer for overseas guests."
        />
        <div className="insight-grid large">
          {insights.map((item) => (
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
    </main>
  );
}
