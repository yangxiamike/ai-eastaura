import Link from "next/link";
import { Icon } from "@/components/site/Icons";

export const metadata = {
  title: "Thank You | Eastaura",
  description: "Your Eastaura intake has been received for human review.",
};

export default function ThankYouPage() {
  return (
    <main>
      <section className="thank-you">
        <p className="eyebrow">Intake received</p>
        <h1>Thank you. Your request is ready for human review.</h1>
        <p>
          The Eastaura team would review your intake within 1-2 business days in
          a production flow. This is not emergency medical care. If you have
          urgent symptoms, contact local medical services.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="/program">
            Read the program <Icon name="arrow" />
          </Link>
          <Link className="secondary-button light-bg" href="/safety">
            Review safety boundaries
          </Link>
        </div>
      </section>
    </main>
  );
}
