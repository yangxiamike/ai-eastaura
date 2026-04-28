import { programDays } from "@/lib/site/content";

type ProgramTimelineProps = {
  compact?: boolean;
};

export function ProgramTimeline({ compact = false }: ProgramTimelineProps) {
  const days = compact ? programDays.slice(0, 3) : programDays;

  return (
    <div className="program-timeline">
      {days.map((item) => (
        <article className="timeline-item" key={item.day}>
          <div
            className="timeline-image"
            style={{ backgroundImage: `url(${item.image})` }}
            aria-hidden="true"
          />
          <div className="timeline-copy">
            <span>{item.day}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
