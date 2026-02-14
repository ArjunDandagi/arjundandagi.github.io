import type { Metadata } from "next";
import { profile, skillGroups } from "@/data/profile";

export const metadata: Metadata = {
  title: "About",
  description: "About Arjun Dandagi and core engineering focus areas."
};

export default function AboutPage() {
  return (
    <div className="stack">
      <section className="card">
        <h1>About</h1>
        <p>
          {profile.name} is based in {profile.location}. {profile.headline}
        </p>
        <p>{profile.summary}</p>
      </section>

      <section>
        <h2>Focus Areas</h2>
        <div className="grid">
          {skillGroups.map((group) => (
            <article key={group.title} className="card">
              <h3>{group.title}</h3>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
