import Link from "next/link";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import { socialLinks } from "@/data/site";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          Arjun Dandagi
        </Link>
        <div className="header-actions">
          <ThemeToggle />
          <div className="header-social">
            <a
              href={socialLinks[0].href}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              title="Twitter"
            >
              <SiX />
            </a>
            <a
              href={socialLinks[2].href}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <SiLinkedin />
            </a>
            <a
              href={socialLinks[1].href}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <SiGithub />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
