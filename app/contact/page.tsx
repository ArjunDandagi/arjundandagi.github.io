import type { Metadata } from "next";
import { socialLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Arjun Dandagi."
};

export default function ContactPage() {
  return (
    <section className="stack">
      <h1>Contact</h1>
      <article className="card">
        <p>
          For opportunities and collaboration, connect through the channels
          below.
        </p>
        <ul>
          {socialLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
