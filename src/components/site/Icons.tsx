type IconProps = {
  name:
    | "arrow"
    | "check"
    | "shield"
    | "language"
    | "leaf"
    | "lock"
    | "menu"
    | "instagram"
    | "facebook"
    | "tiktok";
  className?: string;
};

export function Icon({ name, className = "" }: IconProps) {
  const common = {
    className: `icon ${className}`.trim(),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    );
  }

  if (name === "language") {
    return (
      <svg {...common}>
        <path d="M4 5h8" />
        <path d="M8 5v14" />
        <path d="M5 9c1.8 3 4.2 4.8 7 5.5" />
        <path d="M11 9c-1.1 2.4-3.3 4.6-6.5 6.5" />
        <path d="M14 19l3.5-8L21 19" />
        <path d="M15.4 16h4.2" />
      </svg>
    );
  }

  if (name === "leaf") {
    return (
      <svg {...common}>
        <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z" />
        <path d="M5 19c3.5-4.5 7.5-7.5 12-9" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg {...common}>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.2" />
        <path d="M16.8 7.2h.01" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg {...common}>
        <path d="M14 8h2V4h-3c-3 0-5 2-5 5v3H6v4h2v4h4v-4h3l1-4h-4V9c0-.6.4-1 1-1h1Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M14 4v9.2a4.8 4.8 0 1 1-4-4.7" />
      <path d="M14 4c1 3 2.9 4.8 6 5" />
    </svg>
  );
}
