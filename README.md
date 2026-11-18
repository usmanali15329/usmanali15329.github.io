# usmanali15329.github.io

Personal portfolio of Muhammad Usman Ali — Jekyll site hosted on GitHub Pages.

## Publish
1. Upload everything in this folder to the root of the repo **usmanali15329.github.io** (branch `main`).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)`.
3. After 1–2 minutes the site is live at https://usmanali15329.github.io

## Hero portrait
Your photo (background removed) is at `assets/img/profile.webp` and is set in `_config.yml` as `profile_photo`.
On load it assembles from red particles, then the real photo appears; the head turns toward the cursor,
a speech bubble reacts to what the visitor points at, and clicking the photo makes it jump.
To change the photo, replace that file with another background-removed image (transparent PNG/WebP, head and shoulders).
Set `profile_photo: ""` to show the animated "UA" monogram instead.

## Edit content
- Personal details, contact info: `_config.yml`
- Home page "Case files": `_data/projects.yml`
- Home page "Back in time" strip: `_data/timeline.yml`
- Experience / education / certifications / skills: `_data/*.yml`
- Posts, guides, lab writeups: `_posts/` (or use `/admin.html`)
- Videos: `_videos/`

## Notes
- Fonts (Anton, Inter, JetBrains Mono) are self-hosted in `assets/fonts/` under the SIL Open Font License.
- Animations respect the visitor's "reduce motion" setting; the boot screen shows once per browser session.
