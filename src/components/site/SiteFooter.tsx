import Link from "next/link";
import { navItems } from "@/lib/site/content";
import { EastauraLogo } from "./EastauraLogo";
import { Icon } from "./Icons";

const socials = [
  { label: "TikTok", icon: "tiktok" as const },
  { label: "Instagram", icon: "instagram" as const },
  { label: "Facebook", icon: "facebook" as const },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" href="/">
          <EastauraLogo />
        </Link>
        <p>
          A China-based TCM wellness retreat for stress recovery, sleep reset,
          and whole-person balance.
        </p>
      </div>

      <div className="footer-links" aria-label="Footer navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/intake">Start Intake</Link>
      </div>

      <div className="social-links">
        {socials.map((social) => (
          <a key={social.label} href="#" aria-label={social.label}>
            <Icon name={social.icon} />
          </a>
        ))}
      </div>
    </footer>
  );
}
