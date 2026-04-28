import { cn } from "@/lib/utils";
import { Sparkles, Bot, ArrowRight } from "lucide-react";

interface AgentAction {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

interface AgentPanelProps {
  title: string;
  subtitle?: string;
  actions: AgentAction[];
  className?: string;
  note?: string;
  noteTitle?: string;
}

export function AgentPanel({ title, subtitle, actions, className, note, noteTitle }: AgentPanelProps) {
  return (
    <div className={cn("space-y-3 min-w-0", className)}>
      <div className="flex items-center gap-2.5 mb-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-eastaura-sage-muted">
          <Sparkles className="h-5 w-5 text-eastaura-forest" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-eastaura-ink">{title}</div>
          {subtitle && <div className="break-words text-xs text-eastaura-ink-muted">{subtitle}</div>}
        </div>
      </div>
      <div className="space-y-2">
        {actions.map((action, i) => {
          const enabled = Boolean(action.onClick);
          return (
          <button
            key={i}
            onClick={action.onClick}
            disabled={!enabled}
            className={cn(
              "w-full flex items-center gap-3 rounded-md border border-eastaura-warmgray bg-white p-3 text-left transition-colors group",
              enabled
                ? "hover:border-eastaura-sage/40 hover:bg-eastaura-cream-dark"
                : "cursor-not-allowed opacity-65"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-eastaura-sage-muted">
              <action.icon className="h-4 w-4 text-eastaura-forest" />
            </div>
            <span className="flex-1 break-words text-sm text-eastaura-ink">{action.label}</span>
            {enabled ? (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-eastaura-ink-muted transition-colors group-hover:text-eastaura-forest" />
            ) : (
              <span className="shrink-0 text-xs text-eastaura-ink-muted">Soon</span>
            )}
          </button>
        );
        })}
      </div>
      {note && (
        <div className="mt-3 rounded-md border border-eastaura-warmgray bg-eastaura-cream-dark p-4">
          {noteTitle && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Bot className="w-3.5 h-3.5 text-eastaura-gold" />
              <span className="text-xs font-medium uppercase text-eastaura-gold">{noteTitle}</span>
            </div>
          )}
          <p className="break-words text-sm leading-relaxed text-eastaura-ink-muted">{note}</p>
        </div>
      )}
    </div>
  );
}
