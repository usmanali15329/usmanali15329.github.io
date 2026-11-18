# usmanali15329.github.io

Personal portfolio of Muhammad Usman Ali — Jekyll site hosted on GitHub Pages.

## Publish
1. Upload everything in this folder to the root of the repo **usmanali15329.github.io** (branch `main`).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)`.
3. After 1–2 minutes the site is live at https://usmanali15329.github.io

## Add your photo to the hero (optional)
The hero shows an animated red particle "UA" monogram that reacts to the cursor.
To turn it into a particle portrait of you that reveals your real photo on hover:
1. Remove the background from a head-and-shoulders photo (e.g. remove.bg or Canva) and export it as a **transparent PNG**, roughly square.
2. Save it as `assets/img/profile.png`.
3. In `_config.yml` set `profile_photo: "/assets/img/profile.png"`.

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
