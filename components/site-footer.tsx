import { siteConfig } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          {new Date().getFullYear()} {siteConfig.name}. Built with Next.js and
          deployed on GitHub Pages.
        </p>
        <a href="/rss.xml">RSS</a>
      </div>
    </footer>
  );
}
