import Link from "next/link";

export default function NotFound() {
  return (
    <section className="stack">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <p>
        <Link href="/">Return to home</Link>
      </p>
    </section>
  );
}
