# JITT Athletics — website

A one-page site for the JITT Athletics brand: gear, training programs, and the team.
Plain HTML, CSS and JavaScript — no build step, no dependencies, no framework.

```
index.html              the whole page
assets/css/styles.css   all styling (brand colours live at the top)
assets/js/main.js       menu, scroll effects, contact form
assets/img/             favicon + social share image
```

## See it locally

Open `index.html` in a browser. That's it.

If you'd rather serve it properly (needed if you later add anything that
fetches files):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Put it online (free)

GitHub Pages serves this repo as-is:

1. Go to the repo on GitHub → **Settings** → **Pages**
2. Under *Build and deployment*, set **Source** to `Deploy from a branch`
3. Pick the branch (`main` once this is merged) and folder `/ (root)` → **Save**
4. A minute later the site is live at
   `https://<your-username>.github.io/<repo-name>/`

To use your own domain (e.g. `jittathletics.com`): buy the domain, add it under
Settings → Pages → Custom domain, and point the domain's DNS at GitHub Pages as
the instructions there describe.

Netlify and Vercel also work — drag the folder in, or connect the repo. No
build command, publish directory is the repo root.

## Make it yours

Everything below is placeholder content written to be replaced.

**Brand colours and fonts** — `assets/css/styles.css`, the `:root` block at the
very top. Change `--accent` and the whole site follows. Fonts are loaded from
Google Fonts in the `<head>` of `index.html`.

**Words** — `index.html`, top to bottom. Each section is labelled with an HTML
comment (`<!-- ===== GEAR ===== -->` and so on).

**Real numbers** — the hero stats use `data-count` attributes; set both the
attribute and the visible text.

**Photos** — the grey boxes are CSS placeholders. Drop real images into
`assets/img/` and replace, e.g.:

```html
<!-- before -->
<div class="product-media ph-1" aria-hidden="true"><span>Photo</span></div>
<!-- after -->
<img class="product-media" src="assets/img/training-tee.jpg" alt="JITT training tee, front view">
```

**Contact details** — search `index.html` for `hello@jittathletics.com` and the
`EDIT ME` comment in the footer for social links.

## Wiring up the contact form

Right now, submitting the form opens the visitor's email app addressed to the
address in `data-mailto`. That works, but it loses people who use webmail.

To receive messages properly, create a free form at
[formspree.io](https://formspree.io) (or Basin, Netlify Forms — anything that
gives you a POST endpoint) and add its URL as the form's `action`:

```html
<form class="form" id="contactForm" action="https://formspree.io/f/YOUR_ID" novalidate>
```

The JavaScript detects the `action` and submits in the background — no page
reload, no extra setup.

## What's deliberately not here

- **Checkout.** Selling online needs a payment processor and either a store
  platform (Shopify, Squarespace) or a backend. The gear section is a showcase
  with a "message us to order" line.
- **A CMS.** Content is edited in the HTML.

Both are worth adding once the brand basics are settled.
