import Link from "next/link";
import { navItems } from "@/lib/site/content";
import { EastauraLogo } from "./EastauraLogo";
import { Icon } from "./Icons";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="Eastaura home">
        <EastauraLogo />
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="nav-cta" href="/intake">
        Start Intake <Icon name="arrow" />
      </Link>

      <details className="mobile-menu">
        <summary aria-label="Open menu">
          <Icon name="menu" />
        </summary>
        <div className="mobile-menu-panel">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="mobile-menu-cta" href="/intake">
            Start Intake
          </Link>
        </div>
      </details>
    </header>
  );
}
