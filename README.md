# OneNexsys Website

Static multi-page website for OneNexsys, prepared for GitHub and Vercel deployment.

## Deploy Folder

The production-ready site is in:

```text
site-vercel/
```

It contains the HTML pages, shared CSS/JS, optimized WebP images, favicon, manifest, sitemap, and robots file.

## Vercel Setup

When importing the GitHub repository into Vercel:

- Framework preset: `Other`
- Build command: leave blank
- Output directory: leave blank if using `site-vercel` as the Vercel root directory
- Recommended Vercel project root directory: `site-vercel`

## Notes

- The contact form currently uses `mailto:` behavior.
- Design source and backups are intentionally kept outside the deploy folder.
- Do not cancel existing hosting until the Vercel deployment and domain DNS are confirmed working.
