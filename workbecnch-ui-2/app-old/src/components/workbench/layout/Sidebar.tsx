"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenTool,
  Clapperboard,
  CalendarDays,
  BarChart3,
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
import Image from "next/image";
import { useLanguage } from "@/components/workbench/LanguageProvider";

const navItems = [
  { path: "/workbench", label: "Dashboard", icon: LayoutDashboard },
  { path: "/workbench/content", label: "Content Studio", icon: PenTool },
  { path: "/workbench/video-generator", label: "Video Generator", icon: Clapperboard },
  { path: "/workbench/calendar", label: "Calendar", icon: CalendarDays },
  { path: "/workbench/attribution", label: "Attribution", icon: BarChart3 },
  { path: "/workbench/leads", label: "Leads", icon: Users },
  { path: "/workbench/review-tasks", label: "Review Tasks", icon: ClipboardCheck },
  { path: "/workbench/notifications", label: "Notifications", icon: Bell },
  { path: "/workbench/resources", label: "Partners & Assets", icon: BookOpen },
  { path: "/workbench/skills", label: "Skills & Templates", icon: BookOpen },
  { path: "/workbench/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/workbench") {
      return pathname === "/workbench" || pathname === "/workbench/";
    }
    return pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-eastaura-gold text-eastaura-forest-dark shrink-0">
          <Leaf className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-eastaura-cream tracking-tight">Eastaura</span>
          <span className="text-[11px] text-eastaura-sage-light/75 leading-none">{t("Workbench")}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-[15px] transition-colors",
                active
                  ? "bg-eastaura-forest-light text-eastaura-cream font-medium"
                  : "text-eastaura-sage-light/80 hover:text-eastaura-cream hover:bg-eastaura-forest-light/50"
              )}
            >
              <item.icon className={cn("w-[17px] h-[17px] shrink-0", active ? "text-eastaura-gold" : "text-eastaura-sage-light/65")} />
              <span className="truncate">{t(item.label)}</span>
              {item.path === "/workbench/review-tasks" && (
                <span className="ml-auto flex items-center justify-center w-5 h-5 text-[11px] font-semibold rounded-full bg-eastaura-gold text-eastaura-forest-dark shrink-0">
                  5
                </span>
              )}
              {item.path === "/workbench/notifications" && (
                <span className="ml-auto flex items-center justify-center w-5 h-5 text-[11px] font-semibold rounded-full bg-red-400/90 text-white shrink-0">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-eastaura-forest-light/50 mt-auto">
        <div className="flex items-center gap-2.5">
          <Image
            src="/workbench/avatars/founder.jpg"
            alt="Founder"
            width={28}
            height={28}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] text-eastaura-cream font-medium truncate">{t("Founder Operator")}</span>
            <span className="text-[11px] text-eastaura-sage-light/65">{t("Pilot Mode")}</span>
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
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-eastaura-forest flex flex-col transition-transform duration-200",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-30 h-full w-64 bg-eastaura-forest flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
