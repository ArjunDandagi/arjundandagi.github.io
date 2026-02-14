import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download Arjun Dandagi's resume."
};

export default function ResumePage() {
  return (
    <section className="stack">
      <h1>Resume</h1>
      <article className="card">
        <p>Download the latest resume using the link below.</p>
        <p>
          <a href={siteConfig.links.resume} target="_blank" rel="noreferrer">
            Download Resume PDF
          </a>
        </p>
      </article>
    </section>
  );
}
