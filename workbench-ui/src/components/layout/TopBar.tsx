import { Search, Calendar, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 bg-eastaura-cream/80 backdrop-blur-md border-b border-eastaura-warmgray">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-eastaura-ink-muted" />
            <input
              type="text"
              placeholder="Search leads, content, tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-eastaura-warmgray bg-white focus:outline-none focus:ring-1 focus:ring-eastaura-forest/30 focus:border-eastaura-forest/30 placeholder:text-eastaura-ink-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-sm text-eastaura-ink-muted">
            <Calendar className="w-4 h-4" />
            <span>{today}</span>
          </div>
          <Button
            size="sm"
            className="hidden sm:flex items-center gap-1.5 bg-eastaura-forest hover:bg-eastaura-forest-light text-eastaura-cream"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Action</span>
          </Button>
          <button className="relative p-1.5 rounded-md hover:bg-eastaura-warmgray-light text-eastaura-ink-muted">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
