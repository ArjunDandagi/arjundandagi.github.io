import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [""];

  const pages = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}${route.endsWith("/") ? "" : "/"}`,
    lastModified: new Date()
  }));

  return pages;
}
