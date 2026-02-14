import type { Metadata } from "next";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected platform and DevOps case studies."
};

export default function ProjectsPage() {
  return (
    <section className="stack">
      <h1>Projects</h1>
      <div className="grid">
        {projects.map((project) => (
          <article id={project.slug} key={project.slug} className="card">
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <div className="chips">
              {project.tags.map((tag) => (
                <span key={`${project.slug}-${tag}`}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
