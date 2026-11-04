# VANTA Motorwerke — Model 03 Nocturne

A static bilingual landing page (English and Persian RTL) prepared for GitHub Pages.

## Preview on Windows

Do not open `index.html` by double-clicking it. That uses the `file://` protocol, where browsers block the `fetch()` requests required for the scroll-scrub frame atlases and the GLB model.

Double-click `Open Local Preview.cmd` instead. It starts a local Python 3 web server and opens `http://127.0.0.1:4179/index.html`. Keep the command window open while using the preview; press Ctrl+C in that window to stop it. Persian is available at `http://127.0.0.1:4179/fa.html`.

## Publish to GitHub Pages

1. Extract the ZIP and copy the **contents** of this folder (including `index.html`, `fa.html`, `assets/`, and `.nojekyll`) into the root of your GitHub repository.
2. Commit and push the files.
3. In GitHub, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Open the published repository URL. English is at `/`; Persian is at `/fa.html`.

All application code, GSAP, ScrollTrigger, the vehicle GLB, Persian font, video frame atlases, and image/video assets are included locally. The hero and drive sections display the included WebP atlases as reversible scroll-scrubbed sequences. Google Fonts is an optional external typography enhancement; system fallbacks are used when it is unreachable. No npm install or build step is required.

This is a fictional brand and reservation demo. The configurator and reservation interaction do not create a real order or send personal information to a service.

© 2026 VANTA Motorwerke. Fictional concept.
