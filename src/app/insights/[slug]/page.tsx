import Link from "next/link";
import { notFound } from "next/navigation";
import { getInsight, insights } from "@/lib/site/content";
import { Icon } from "@/components/site/Icons";

type InsightPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return insights.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: InsightPageProps) {
  const { slug } = await params;
  const article = getInsight(slug);

  if (!article) {
    return {
      title: "Insight | Eastaura",
    };
  }

  return {
    title: `${article.title} | Eastaura`,
    description: article.summary,
  };
}

export default async function InsightDetailPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const article = getInsight(slug);

  if (!article) {
    notFound();
  }

  const related = insights
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <main>
      <article className="article-shell">
        <Link className="text-link" href="/insights">
          Back to insights
        </Link>
        <p className="insight-meta">
          {article.category} - {article.readTime} - {article.published}
        </p>
        <h1>{article.title}</h1>
        <p className="article-summary">{article.summary}</p>
        <div
          className="article-image"
          style={{ backgroundImage: `url(${article.image})` }}
          aria-hidden="true"
        />
        <div className="article-body">
          {article.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="section related-section">
        <h2>Related reading</h2>
        <div className="insight-grid">
          {related.map((item) => (
            <Link
              className="insight-card"
              href={`/insights/${item.slug}`}
              key={item.slug}
            >
              <span
                className="insight-image"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <span className="insight-meta">{item.category}</span>
              <strong>{item.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="final-cta compact">
        <p className="eyebrow light">Ready for human review?</p>
        <h2>Start with a careful intake.</h2>
        <Link className="primary-button" href="/intake">
          Start Intake <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}
