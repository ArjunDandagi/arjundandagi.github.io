"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";

type BlogListProps = {
  posts: BlogPostMeta[];
  tags: string[];
};

export function BlogList({ posts, tags }: BlogListProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase().trim();
    return posts.filter((post) => {
      const matchesTag = activeTag === "all" || post.tags.includes(activeTag);
      const matchesQuery =
        q.length === 0 ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [posts, query, activeTag]);

  return (
    <div className="blog-list">
      <div className="blog-controls">
        <label htmlFor="search-posts" className="sr-only">
          Search posts
        </label>
        <input
          id="search-posts"
          type="search"
          placeholder="Search blog posts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="tags-row">
          <button
            type="button"
            className={activeTag === "all" ? "active" : ""}
            onClick={() => setActiveTag("all")}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={activeTag === tag ? "active" : ""}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="post-grid">
        {filteredPosts.map((post) => (
          <article key={post.slug} className="card">
            <p className="meta">
              {post.date} · {post.readingTime}
            </p>
            <h3>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p>{post.summary}</p>
            <div className="chips">
              {post.tags.map((tag) => (
                <span key={`${post.slug}-${tag}`}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
