import type { Metadata } from "next";
import { BlogList } from "@/components/blog-list";
import { getAllPosts, getAllTags } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering write-ups on Kubernetes, GitOps, AWS, and DevOps."
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <section className="stack">
      <h1>Blog</h1>
      <p>Write-ups from platform engineering and cloud-native work.</p>
      <BlogList posts={posts} tags={tags} />
    </section>
  );
}
