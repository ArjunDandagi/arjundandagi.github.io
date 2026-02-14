import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/experience",
    "/projects",
    "/blog",
    "/contact",
    "/resume"
  ];

  const pages = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}${route.endsWith("/") ? "" : "/"}`,
    lastModified: new Date()
  }));

  const blogPages = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}/`,
    lastModified: new Date(post.date)
  }));

  return [...pages, ...blogPages];
}
