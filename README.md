# systemlover.xyz

A guns.lol-style bio page. Static HTML/CSS/JS, no build step, no framework.

## Files

- `index.html` — page structure (you shouldn't need to touch this)
- `style.css` — visuals (colors are driven by `config.js`, so rarely needed either)
- `config.js` — **everything you'll actually edit**: your name, bio, avatar, socials, and feature toggles
- `script.js` — the logic that reads `config.js` and renders the page
- `assets/` — put your avatar image, background image/video, and music file here

## Editing your page

Open `config.js` in any text editor. Every social link and every feature
(music player, custom cursor, particle background, view counter,
typewriter bio) has an `enabled: true/false` flag — flip it and reload the
page. No other file needs to change for normal edits.

Things worth knowing:

- **Avatar**: replace `assets/avatar-placeholder.svg` with your own image
  (e.g. `assets/avatar.jpg`), then update `profile.avatar` in `config.js`.
- **Music player**: drop an mp3 in `assets/`, point `features.musicPlayer.track`
  at it. Browsers block true autoplay, so it's click-to-play, same as guns.lol.
- **View counter** uses the free `countapi.xyz` service and silently falls
  back to a local per-browser count if that service is ever unreachable, so
  it never breaks the page.

## Preview locally

From this folder:

```
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Deploying to systemlover.xyz

Since this is a static site, the easiest free option is **GitHub Pages**:

1. Create a new GitHub repo (public or private) and push these files to it.
2. In the repo, go to **Settings → Pages**, set the source to your main
   branch, root folder.
3. In the same **Settings → Pages** section, set **Custom domain** to
   `systemlover.xyz`, and add a file named `CNAME` to the repo root
   containing exactly:
   ```
   systemlover.xyz
   ```
4. At your domain registrar's DNS settings, add these records (this makes
   the bare domain point at GitHub Pages):
   - `A` record, host `@`, values: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME` record, host `www`, value: `<your-github-username>.github.io`
5. Wait for DNS to propagate (minutes to a few hours), then check "Enforce
   HTTPS" in the Pages settings once it's available.

**Alternatives** if you'd rather not use GitHub: **Cloudflare Pages** or
**Netlify** both offer free static hosting with drag-and-drop deploys and
straightforward custom-domain support — useful if you want Cloudflare's
DNS/CDN in front of the domain anyway. Tell me which registrar/DNS
provider you're using and I can give exact record values for that route
too.
