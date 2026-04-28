type EastauraLogoProps = {
  className?: string;
};

export function EastauraLogo({ className }: EastauraLogoProps) {
  return (
    <span
      className={["eastaura-logo", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <span className="eastaura-logo-aura" />
      <span className="eastaura-logo-sun" />
      <span className="eastaura-logo-word">Eastaura</span>
    </span>
  );
}
