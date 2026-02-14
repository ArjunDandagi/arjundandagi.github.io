# Blog Authoring Workflow

## Add a new post

1. Create a file in `content/blog/` (example: `my-post.md`).
2. Add frontmatter:

```md
---
title: "Post title"
date: "2026-02-14"
summary: "One-line summary"
tags:
  - Kubernetes
  - DevOps
draft: false
---
```

3. Write the article body in Markdown.
4. Commit and push to `master`.
5. GitHub Actions publishes automatically to `arjundandagi.github.io`.

## Drafts

Set `draft: true` to keep a post out of production.
