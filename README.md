# JITT Athletics — website

One-page site for JITT Athletics (Tampa, FL), built to match the brand design:
**People. Movement. Opportunity.**

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework —
the repo can be served exactly as it sits.

```
index.html                whole page
assets/css/styles.css     all styling; brand tokens in :root at the top
assets/js/main.js         nav, scroll reveals, join dialog
assets/fonts/             Oswald, Inter, Caveat (self-hosted, latin subset)
assets/img/               logo, photography, favicon, social card
```

## Run it locally

Open `index.html` in a browser, or serve it properly:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Put it online (free)

GitHub Pages serves this repo as-is:

1. Repo → **Settings** → **Pages**
2. *Build and deployment* → **Source**: `Deploy from a branch`
3. Branch `main`, folder `/ (root)` → **Save**

Live a minute later at `https://<username>.github.io/<repo>/`. For
`jittathletics.com`, add it under Settings → Pages → Custom domain and point
your DNS as instructed there. Netlify and Vercel also work — no build command,
publish directory is the repo root.

---

## Read this first: the images are placeholders

Every photo in `assets/img/` was **cut out of the design mockup**. They are
low-resolution and will look soft on large screens. They exist so the layout
reads correctly today — replace them with real photography before launch.

| File | Used for | Replace with |
|---|---|---|
| `hero.jpg` | Hero background | Wide landscape shot, 2400px+ across |
| `podcast.jpg` | "Under the Palms" card | Portrait/square, subject on the right |
| `runclub.jpg` | "Tampa Run Club" card | Portrait/square |
| `products.jpg` | Shop banner | Wide product shot on a light background |
| `jitt-logo.png` | Header logo | **A real SVG from your designer** |

`jitt-logo.png` was recovered from the mockup by keying the white artwork off
its dark background. It is clean and transparent, but it is a raster at a fixed
size. Ask whoever made the logo for the vector file and drop it in — an `.svg`
will be sharp at every size and much smaller.

Keep the same filenames and everything keeps working. If a new image has
different proportions, adjust its `object-position` in `styles.css` to keep the
subject clear of the text.

## Make it yours

**Colours** — `assets/css/styles.css`, the `:root` block. Values were sampled
from the mockup:

```css
--bg:        #060d0b;   /* near-black green */
--accent:    #5b5b29;   /* olive, used on every button */
--accent-hi: #8f8f46;   /* brighter olive for small text */
--cream:     #ded9d5;   /* shop banner panel */
```

**Words** — `index.html`, each section marked with a comment
(`<!-- ===== HERO ===== -->` and so on).

**Contact** — search for `hello@jittathletics.com` and replace it (it appears in
the join form and the header/hero CTAs' no-JavaScript fallback).

**Social links** — footer, marked `EDIT ME`. They point at `#` right now.

## Still to wire up

These are placeholders on purpose — each needs an account or a service:

- **Join JITT / Join the movement** — opens a signup dialog. It currently falls
  back to the visitor's email app, which loses anyone on webmail. Create a free
  form at [formspree.io](https://formspree.io) (or Mailchimp, Beehiiv,
  ConvertKit) and add the endpoint as the form's `action`:

  ```html
  <form class="join-form" id="joinForm" action="https://formspree.io/f/YOUR_ID" novalidate>
  ```

  The JavaScript detects `action` and submits in the background — nothing else
  to change.

- **Shop now / cart** — no store behind them. Selling needs a payment
  processor; the usual route is Shopify (use its Buy Button to keep this page
  and hand checkout to Shopify).

- **Watch now / See events** — point `href="#"` at the podcast and events pages
  when they exist.

## Notes

- Fonts are self-hosted, so the site loads nothing from Google and works
  offline. Oswald Bold is the display face (measured against the comp's headline:
  its width-to-cap-height ratio matches within 3%, where Anton was 21% too
  narrow), Inter the body, Caveat the handwritten "Built Different" line.
- Respects `prefers-reduced-motion` — all animation is disabled for visitors
  who ask for that.
- Tested from 320px to 1600px wide: no horizontal scroll, menu reachable at
  every size, tap targets at least 44px.
- Laid out to match the brand comp: every section is within 2% of the design's
  measured heights, and the headline's cap height and line widths match exactly.
