import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenTool,
  Users,
  ClipboardCheck,
  Bell,
  BookOpen,
  Settings,
  Leaf,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/workbench", label: "Dashboard", icon: LayoutDashboard },
  { path: "/workbench/content", label: "Content Studio", icon: PenTool },
  { path: "/workbench/leads", label: "Leads", icon: Users },
  { path: "/workbench/review-tasks", label: "Review Tasks", icon: ClipboardCheck },
  { path: "/workbench/notifications", label: "Notifications", icon: Bell },
  { path: "/workbench/skills", label: "Skills & Templates", icon: BookOpen },
  { path: "/workbench/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/workbench") {
      return location.pathname === "/workbench" || location.pathname === "/workbench/";
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-eastaura-gold text-eastaura-forest-dark">
          <Leaf className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-eastaura-cream tracking-tight">Eastaura</span>
          <span className="text-[10px] text-eastaura-sage-light/70 leading-none">Workbench</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-eastaura-forest-light text-eastaura-cream font-medium"
                  : "text-eastaura-sage-light/80 hover:text-eastaura-cream hover:bg-eastaura-forest-light/50"
              )}
            >
              <item.icon className={cn("w-4 h-4", active ? "text-eastaura-gold" : "text-eastaura-sage-light/60")} />
              <span>{item.label}</span>
              {item.path === "/workbench/review-tasks" && (
                <span className="ml-auto flex items-center justify-center w-5 h-5 text-[10px] font-semibold rounded-full bg-eastaura-gold text-eastaura-forest-dark">
                  5
                </span>
              )}
              {item.path === "/workbench/notifications" && (
                <span className="ml-auto flex items-center justify-center w-5 h-5 text-[10px] font-semibold rounded-full bg-red-400/90 text-white">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-eastaura-forest-light/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-eastaura-forest-light flex items-center justify-center text-eastaura-cream text-xs font-medium">
            F
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-eastaura-cream font-medium">Founder</span>
            <span className="text-[10px] text-eastaura-sage-light/60">Solo Mode</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-eastaura-forest text-eastaura-cream shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-40 h-full w-60 bg-eastaura-forest flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-30 h-full w-60 bg-eastaura-forest flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
