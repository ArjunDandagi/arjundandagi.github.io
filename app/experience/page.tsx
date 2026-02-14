import type { Metadata } from "next";
import { experience } from "@/data/profile";

export const metadata: Metadata = {
  title: "Experience",
  description: "Career timeline and engineering impact."
};

export default function ExperiencePage() {
  return (
    <section className="stack">
      <h1>Experience</h1>
      {experience.map((item) => (
        <article key={`${item.company}-${item.role}`} className="card">
          <p className="meta">{item.period}</p>
          <h2>{item.role}</h2>
          <p>{item.company}</p>
          <ul>
            {item.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
