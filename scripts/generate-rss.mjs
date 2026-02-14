import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const siteUrl = "https://arjundandagi.github.io";
const postsDir = path.join(process.cwd(), "content", "blog");
const outDir = path.join(process.cwd(), "out");

if (!fs.existsSync(postsDir) || !fs.existsSync(outDir)) {
  process.exit(0);
}

const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

const items = files
  .map((file) => {
    const slug = file.replace(/\.mdx?$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data } = matter(raw);
    if (data.draft) {
      return null;
    }
    return {
      title: data.title,
      summary: data.summary,
      date: data.date,
      link: `${siteUrl}/blog/${slug}/`
    };
  })
  .filter(Boolean)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Arjun Dandagi Blog</title>
    <link>${siteUrl}</link>
    <description>Engineering posts on DevOps, Kubernetes, AWS, and platform design.</description>
    ${items
      .map(
        (item) => `<item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.summary}]]></description>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    </item>`
      )
      .join("\n")}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(outDir, "rss.xml"), rss, "utf8");
