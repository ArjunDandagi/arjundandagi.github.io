import Image from "next/image";
import type { IconType } from "react-icons";
import {
  SiAmazon,
  SiArgo,
  SiDocker,
  SiGithubactions,
  SiGrafana,
  SiKubernetes,
  SiOpentelemetry,
  SiPrometheus,
  SiTerraform
} from "react-icons/si";
import { siteConfig } from "@/data/site";
import { certifications, profile } from "@/data/profile";

type StackItem = {
  label: string;
  icon?: IconType;
  accent?: string;
  imageSrc?: string;
};

const stackIcons: StackItem[] = [
  { label: "Kubernetes", icon: SiKubernetes, accent: "#326ce5" },
  { label: "Argo", icon: SiArgo, accent: "#ef7b4d" },
  { label: "AWS", icon: SiAmazon, accent: "#c96a00" },
  { label: "Terraform", icon: SiTerraform, accent: "#844fba" },
  { label: "Docker", icon: SiDocker, accent: "#2496ed" },
  { label: "Python", imageSrc: "https://www.python.org/static/favicon.ico" },
  { label: "GitHub Actions", icon: SiGithubactions, accent: "#2088ff" },
  { label: "Grafana", icon: SiGrafana, accent: "#f46800" },
  { label: "Prometheus", icon: SiPrometheus, accent: "#e6522c" },
  { label: "OpenTelemetry", icon: SiOpentelemetry, accent: "#9d6a00" }
];

const quickStats = [
  { emoji: "🏅", label: "Kubernetes Certified", value: "Platform Operations" },
  { emoji: "🚀", label: "Argo Ecosystem", value: "GitOps Specialist" },
  { emoji: "☁️", label: "AWS", value: "Platform Engineering" },
  { emoji: "🧱", label: "Terraform", value: "Modular IaC" },
  { emoji: "📈", label: "Observability", value: "Logs + Metrics + Traces" }
];

export default function HomePage() {
  return (
    <>
      <div className="home">
        <section className="hero-visual">
        <div className="hero-content">
          <h1>
            Senior DevOps Engineer
            <br />
            building cloud platforms that scale ⚡
          </h1>
          <p className="hero-subtitle">
            Berlin · Argo GitOps · AWS · Terraform · Observability
          </p>
          <div className="cta-row">
            <a
              className="btn btn-secondary"
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              💼 LinkedIn
            </a>
            <a
              className="btn btn-secondary"
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              🧑‍💻 GitHub
            </a>
            <a
              className="btn btn-secondary"
              href="https://arjundandagi.medium.com"
              target="_blank"
              rel="noreferrer"
            >
              ✍️ Blog
            </a>
            <a
              className="btn btn-secondary btn-with-logo"
              href="https://topmate.io/arjundandagi"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src="https://topmate.io/favicon.ico"
                alt="Topmate logo"
                width={16}
                height={16}
              />
              Topmate
            </a>
          </div>
          <p className="hero-mini">
            Certified: <strong>CKA</strong> · <strong>CSA</strong> ·{" "}
            <strong>CDA</strong>
          </p>
        </div>

          <div className="hero-right">
            <div className="hero-photo-wrap">
              <Image
                src="/images/arjun-cartoon.png"
                alt="Arjun cartoon portrait"
                width={360}
                height={360}
                className="hero-photo"
                priority
              />
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>About Me</h2>
          <div className="about-content-box">
            <p>{profile.summary}</p>
          </div>
        </section>

        <section className="stats-row">
        {quickStats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span className="stat-emoji" role="img" aria-label={stat.label}>
              {stat.emoji}
            </span>
            <div>
              <p className="meta">{stat.label}</p>
              <h3>{stat.value}</h3>
            </div>
          </article>
        ))}
        </section>

        <section>
        <div className="section-header">
          <h2>Skills & Tooling</h2>
          <span>Core stack</span>
        </div>
        <div className="skills-grid">
            {stackIcons.map((item) => (
              <article key={item.label} className="stack-chip">
                {item.icon &&
                  (() => {
                    const Icon = item.icon;
                    return (
                      <Icon
                        className="tool-icon"
                        style={{ color: item.accent }}
                        aria-hidden
                      />
                    );
                  })()}
                {item.imageSrc && (
                  <Image
                    src={item.imageSrc}
                    alt={`${item.label} logo`}
                    width={20}
                    height={20}
                    className="tool-logo-img"
                  />
                )}
                <span>{item.label}</span>
            </article>
          ))}
        </div>
        </section>

        <section>
        <div className="section-header">
          <h2>Certifications</h2>
          <span>Core credentials</span>
        </div>
        <div className="grid cert-grid">
          {certifications.map((cert) => (
            <article key={cert.title} className="card cert-card">
              <h3>
                {cert.title.includes("Kubernetes") ? (
                  <SiKubernetes aria-hidden className="cert-logo cert-logo-k8s" />
                ) : (
                  <SiAmazon aria-hidden className="cert-logo cert-logo-aws" />
                )}{" "}
                {cert.title}
              </h3>
              <p>{cert.issuer}</p>
              <p className="meta">{cert.emphasis}</p>
            </article>
          ))}
        </div>
        </section>
      </div>
    </>
  );
}
