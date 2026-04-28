import Link from "next/link";
import { safetyFaqs } from "@/lib/site/content";
import { Icon } from "@/components/site/Icons";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata = {
  title: "Safety and Boundaries | Eastaura",
  description:
    "Eastaura safety screening, non-medical boundaries, and privacy notes for overseas wellness travelers.",
};

export default function SafetyPage() {
  return (
    <main>
      <section className="page-hero safety-hero">
        <p className="eyebrow light">Safety before sales</p>
        <h1>Clear boundaries for a calmer decision</h1>
        <p>
          Eastaura is a wellness concierge. We do not diagnose, cure, promise
          outcomes, or replace emergency medical care.
        </p>
        <Link className="primary-button" href="/intake">
          Start safety-aware intake <Icon name="arrow" />
        </Link>
      </section>

      <section className="section safety-panel">
        <SectionHeading
          eyebrow="High-risk situations"
          title="Speak with your doctor first when risk is unclear"
          text="The prototype intake flags these items for human review and may lead to a respectful no or a request for medical guidance before travel."
        />
        <div className="risk-grid">
          {[
            "Pregnancy",
            "Recent surgery",
            "Serious cardiovascular condition",
            "Anticoagulant medication",
            "Severe allergy",
            "Immune suppression",
            "Treatment for a diagnosed disease",
            "Urgent or unstable symptoms",
          ].map((item) => (
            <span key={item}>
              <Icon name="shield" /> {item}
            </span>
          ))}
        </div>
      </section>

      <section className="section faq-section">
        <SectionHeading
          eyebrow="FAQ"
          title="What we can and cannot do"
          align="center"
        />
        <div className="accordion-list">
          {safetyFaqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
