# usmanali15329.github.io

Personal portfolio of Muhammad Usman Ali — Jekyll site hosted on GitHub Pages.

## Publish
1. Upload everything in this folder to the root of the repo **usmanali15329.github.io** (branch `main`).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)`.
3. After 1–2 minutes the site is live at https://usmanali15329.github.io

## Hero portrait
`assets/img/profile.webp` is your photo, AI-enhanced (Real-ESRGAN upscale + GFPGAN face restoration) with the background removed.
`assets/img/profile-depth.webp` (a depth map) and `assets/img/profile.json` (eye positions) drive the animation:
- after the boot screen the photo assembles from red particles, then the real photo appears;
- the head turns in 3D toward the cursor, the eyes follow the cursor and blink every few seconds;
- a speech bubble reacts to what the visitor points at; clicking the photo makes it jump. Phones get a slow look-around.

The depth map and eye positions only match this photo. If you replace the photo, set `profile_depth` and
`profile_meta` to "" in `_config.yml` (the photo then just tilts toward the cursor), or ask for them to be regenerated.
Set `profile_photo: ""` to show the animated "UA" monogram instead.

## Light / dark mode
The sun/moon switch in the top bar flips between light and dark mode with a liquid wipe that spreads from the switch
(View Transitions API — Chrome, Edge, Safari 18+; other browsers get a smooth colour fade).
The choice is remembered; first-time visitors get their system setting. Colours for each mode are the CSS variables
at the top of `assets/css/style.css` (`:root` = dark, `[data-theme="light"]` = light).

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
