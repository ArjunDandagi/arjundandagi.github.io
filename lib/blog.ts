import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "content", "blog");

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  draft?: boolean;
  coverImage?: string;
  readingTime: string;
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
};

type FrontMatter = {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  draft?: boolean;
  coverImage?: string;
};

function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
}

function parsePostFile(fileName: string) {
  const slug = fileName.replace(/\.mdx?$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const fm = data as FrontMatter;

  return {
    slug,
    title: fm.title,
    date: fm.date,
    summary: fm.summary,
    tags: fm.tags ?? [],
    draft: fm.draft ?? false,
    coverImage: fm.coverImage,
    content,
    readingTime: readingTime(content).text
  };
}

export function getAllPosts(includeDrafts = false): BlogPostMeta[] {
  const posts = getPostSlugs().map(parsePostFile);
  const filtered = includeDrafts ? posts : posts.filter((post) => !post.draft);

  return filtered
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      summary: post.summary,
      tags: post.tags,
      draft: post.draft,
      coverImage: post.coverImage,
      readingTime: post.readingTime
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const files = getPostSlugs();
  const fileName = files.find((file) => file.replace(/\.mdx?$/, "") === slug);

  if (!fileName) {
    return null;
  }

  const parsed = parsePostFile(fileName);
  if (parsed.draft) {
    return null;
  }

  const processed = await remark().use(gfm).use(html).process(parsed.content);

  return {
    slug: parsed.slug,
    title: parsed.title,
    date: parsed.date,
    summary: parsed.summary,
    tags: parsed.tags,
    draft: parsed.draft,
    coverImage: parsed.coverImage,
    readingTime: parsed.readingTime,
    contentHtml: processed.toString()
  };
}

export function getAllTags() {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}
