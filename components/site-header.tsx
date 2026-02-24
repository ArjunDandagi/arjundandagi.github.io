import Link from "next/link";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import { siteConfig } from "@/data/site";
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
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              title="Twitter"
            >
              <SiX />
            </a>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <SiLinkedin />
            </a>
            <a
              href={siteConfig.links.github}
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
