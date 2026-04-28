"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const goals = [
  "Stress recovery",
  "Sleep reset",
  "Energy restoration",
  "Digestion",
  "Chronic tension",
  "General wellness",
];

const risks = [
  "Pregnancy",
  "Recent surgery",
  "Serious cardiovascular condition",
  "Anticoagulant medication",
  "Severe allergy",
  "Immune suppression",
  "Currently seeking treatment for a diagnosed disease",
  "Urgent or unstable symptoms",
  "None of the above",
];

const budgetByValue: Record<string, number | undefined> = {
  pilot: 2500,
  standard: 3500,
  private: 4500,
  unsure: undefined,
};

const travelPartySizeByValue: Record<string, number> = {
  solo: 1,
  couple: 2,
  family: 3,
  group: 6,
};

type SubmitState = "idle" | "loading" | "success" | "failure";

export function IntakeForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const selectedGoals = formData.getAll("goals").map(String);
    const selectedRisks = formData.getAll("risks").map(String);
    const budget = budgetByValue[String(formData.get("budget") ?? "")];
    const travelPartySize =
      travelPartySizeByValue[String(formData.get("travelParty") ?? "")];
    const freeTextParts = [
      String(formData.get("message") ?? "").trim(),
      `Phone or WhatsApp: ${String(formData.get("phone") ?? "").trim()}`,
      selectedRisks.length > 0 ? `Risk self-report: ${selectedRisks.join(", ")}` : "",
    ].filter(Boolean);

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      country: String(formData.get("country") ?? ""),
      ageRange: String(formData.get("ageRange") ?? ""),
      goals: selectedGoals,
      preferredTiming: String(formData.get("travelWindow") ?? ""),
      ...(budget === undefined ? {} : { budgetUsd: budget }),
      ...(travelPartySize === undefined ? {} : { travelPartySize }),
      freeText: freeTextParts.join("\n\n"),
      source: "website_intake",
      consentToContact: formData.get("privacyConsent") === "on",
    };

    setSubmitState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        lead?: { id?: string };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to submit intake. Please try again.");
      }

      setSubmitState("success");
      const leadId = data.lead?.id;
      router.push(leadId ? `/thank-you?leadId=${encodeURIComponent(leadId)}` : "/thank-you");
    } catch (error) {
      setSubmitState("failure");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit intake. Please try again.",
      );
    }
  }

  return (
    <form
      className="intake-form"
      onSubmit={handleSubmit}
    >
      <section className="form-section">
        <p className="form-kicker">1. Contact and travel basics</p>
        <div className="form-grid two">
          <label>
            <span>Full name</span>
            <input name="fullName" required autoComplete="name" />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            <span>Country</span>
            <input name="country" required autoComplete="country-name" />
          </label>
          <label>
            <span>Phone or WhatsApp</span>
            <input name="phone" required autoComplete="tel" />
          </label>
          <label>
            <span>Age range</span>
            <select name="ageRange" required defaultValue="">
              <option value="" disabled>
                Select age range
              </option>
              <option>25-34</option>
              <option>35-44</option>
              <option>45-54</option>
              <option>55-64</option>
              <option>65+</option>
            </select>
          </label>
          <label>
            <span>Planned travel window</span>
            <input name="travelWindow" placeholder="e.g. September 2026" required />
          </label>
          <label>
            <span>Travel party</span>
            <select name="travelParty" required defaultValue="">
              <option value="" disabled>
                Select party size
              </option>
              <option value="solo">Solo traveler</option>
              <option value="couple">Couple</option>
              <option value="family">Friends / family</option>
              <option value="group">Small group</option>
            </select>
          </label>
          <label>
            <span>Budget range</span>
            <select name="budget" required defaultValue="">
              <option value="" disabled>
                Select budget
              </option>
              <option value="pilot">$2,500-$3,000 pilot range</option>
              <option value="standard">$3,500-$4,000 standard range</option>
              <option value="private">$4,500+ private range</option>
              <option value="unsure">Not sure yet</option>
            </select>
          </label>
        </div>
      </section>

      <section className="form-section">
        <p className="form-kicker">2. Recovery goals</p>
        <div className="choice-grid">
          {goals.map((goal) => (
            <label className="choice-card" key={goal}>
              <input type="checkbox" name="goals" value={goal} />
              <span>{goal}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <p className="form-kicker">3. Health and risk self-report</p>
        <p className="helper-copy">
          This is not a diagnosis. It helps us decide whether the pilot can be
          reviewed safely or whether you should speak with your doctor first.
        </p>
        <div className="choice-grid risks">
          {risks.map((risk) => (
            <label className="choice-card" key={risk}>
              <input type="checkbox" name="risks" value={risk} />
              <span>{risk}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="form-section">
        <p className="form-kicker">4. Free message</p>
        <label>
          <span>What would you like us to understand?</span>
          <textarea
            name="message"
            rows={6}
            maxLength={600}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share your travel context, recovery goals, timing, or questions."
          />
        </label>
        <p className="character-count">{message.length}/600</p>
      </section>

      <section className="form-section consent-section">
        <label className="consent-line">
          <input name="privacyConsent" type="checkbox" required />
          <span>
            I agree that Eastaura may review my information to assess service
            fit and contact me about next steps.
          </span>
        </label>
        <label className="consent-line">
          <input name="nonMedicalConsent" type="checkbox" required />
          <span>
            I understand Eastaura is a wellness concierge, not emergency medical
            care, diagnosis, cure, or treatment guarantee.
          </span>
        </label>
        <button className="primary-button full" type="submit" disabled={submitState === "loading"}>
          {submitState === "loading" ? "Submitting..." : "Submit intake for human review"}
        </button>
        {submitState === "success" ? (
          <p className="helper-copy" role="status">
            Intake received. Redirecting to the thank-you page...
          </p>
        ) : null}
        {submitState === "failure" ? (
          <p className="helper-copy" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </form>
  );
}
