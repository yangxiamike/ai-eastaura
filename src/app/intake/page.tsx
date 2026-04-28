import { IntakeForm } from "@/components/site/IntakeForm";
import { Icon } from "@/components/site/Icons";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata = {
  title: "Start Intake | Eastaura",
  description:
    "Submit a safety-aware Eastaura intake for human review before any wellness retreat recommendation.",
};

export default function IntakePage() {
  return (
    <main>
      <section className="page-hero intake-hero">
        <p className="eyebrow light">Start intake</p>
        <h1>Fit first. Pressure never.</h1>
        <p>
          Tell us your travel basics, recovery goals, budget range, and any
          safety flags. The prototype form routes to a confirmation page only.
        </p>
      </section>

      <section className="section intake-layout">
        <div>
          <SectionHeading
            eyebrow="Human review"
            title="A premium intake should feel calm, not clinical"
            text="We ask for enough context to review service fit without turning this into an unnecessary medical record collection."
          />
          <IntakeForm />
        </div>
        <aside className="intake-aside">
          <Icon name="lock" />
          <h2>What happens next</h2>
          <p>
            A person reviews the intake within 1-2 business days. High-risk or
            unclear situations may require doctor consultation before travel.
          </p>
          <ul>
            <li>No emergency care</li>
            <li>No diagnosis or cure promises</li>
            <li>No automatic approval</li>
            <li>No payment in this prototype</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
