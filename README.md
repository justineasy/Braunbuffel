# Braun Büffel Singapore — In Quiet Company

An editorial, scroll-driven concept site for Braun Büffel Singapore. The page opens on a
framed campaign photograph, hands over to a scroll-scrubbed 3D stage, and closes on the
REISE collection before the shop sections begin.

> **Concept / demo.** Product names, prices and photography belong to
> [Braun Büffel Singapore](https://braunbuffel.com.sg). This is an independent design
> concept, not the official storefront.

## Stack

- React 19 + TypeScript
- Vite 8
- React Three Fiber / drei / three for the 3D stage
- GSAP + ScrollTrigger for scroll choreography
- Lenis for smooth scrolling
- Oxlint for linting

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm 10+

## Local development

```bash
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`).

## Production build

```bash
npm run build     # type-checks, then builds to dist/
npm run preview   # serves the built site locally
npm run lint
```

## Deploy to Vercel

1. Push this project to a GitHub repository (commands below).
2. In Vercel, choose **Add New → Project** and import the repository.
3. Use these settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
   - **Node.js version:** 22.x (20.19+ also works)
4. No environment variables are required. Deploy.

Vercel serves `dist/` as static files; there is no server-side runtime.

### First push to GitHub

```bash
git init
git add .
git commit -m "Braun Büffel Singapore concept site"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

`dist/`, `node_modules/`, environment files and local capture/tooling folders are already
ignored by `.gitignore`.

## Notes

- The preloader's critical CSS is inlined at build time by the Vite plugin in
  `vite.config.ts`, so the loading plate paints before the JavaScript bundle arrives.
- All imagery lives in `public/images` and is referenced with root-absolute URLs. That is
  correct for Vercel; GitHub Pages under a sub-path would need a `base` in `vite.config.ts`.
