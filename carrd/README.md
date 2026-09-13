# JITT Athletics — Carrd embed

Carrd can't import a multi-file site, so the whole page has been converted into
a **single block of HTML + CSS + JS** you paste into one Embed element.

Requires a **paid Carrd Pro plan** — the Embed element and custom code aren't
available on free sites.

## Which file to use

| File | Use it when |
|---|---|
| **`embed-selfcontained.html`** (250 KB) | **Start here.** Images are baked in as data URIs. One paste, nothing to host, works immediately. |
| `embed.html` (37 KB) | Once you have real photography hosted somewhere. Replace every `PASTE_IMAGE_URL_HERE/` with your image URL. |

`img/` holds the compressed images used in the self-contained build, if you'd
rather upload them to Carrd and use `embed.html`.

## Steps

1. In the Carrd editor: **+ (Add Element) ▸ Embed**
2. Set **Type: Code** and **Style: Inline**
3. Open `embed-selfcontained.html`, select all, paste into the code box
4. Select the **section** containing the embed and set:
   - **Width: Full**
   - **Padding: 0** (top and bottom)
5. Publish

The fonts (Oswald, Inter, Caveat) load automatically from Google Fonts via an
`@import` at the top of the embed's `<style>` — nothing to upload.

## How it was made safe for Carrd

Carrd applies its own styling to bare elements (`h1`, `p`, `a`, `img`). A direct
element rule beats an inherited value regardless of specificity, so two things
were done:

- **Every CSS selector is scoped to `#jitt`** — nothing in this embed can
  affect the rest of your Carrd page.
- **A reset shield** re-declares `color`, `font`, `margin`, `list-style` and
  friends inside `#jitt`, so Carrd's styling can't reach in either.

All JavaScript is likewise scoped to the embed and never touches Carrd's DOM.
Verified both directions against a mock host page with deliberately clashing
styles: Carrd elements above and below the embed were pixel-identical, and the
embed rendered correctly.

## Troubleshooting

**A horizontal scrollbar appears.** The embed breaks out of Carrd's centred
container with `width: 100vw`, which on some setups counts the scrollbar. Find
this near the bottom of the `<style>` block and change `100vw` to `100%`:

```css
#jitt { width: 100vw; max-width: 100vw; margin-left: calc(50% - 50vw); }
```

Then make sure the Carrd section's width is set to **Full**.

**The header doesn't stick when scrolling.** `position: sticky` breaks if any
ancestor has `overflow: hidden` or a `transform`. If Carrd's container does
that, find `#jitt .site-header` and change `position: sticky` to
`position: relative`.

**Nothing renders.** Check Style is **Inline**, not Hidden — Hidden injects into
`<head>`/`<body>` instead of placing it on the page.

## Wiring up the join form

The "Join JITT" buttons open a signup dialog. Right now it falls back to opening
the visitor's email app, which loses anyone on webmail.

Carrd Pro includes its own form handling, but it won't see a form inside an
embed. Use an external endpoint instead — create a free form at
[formspree.io](https://formspree.io), then find this line in the embed and add
the `action`:

```html
<form class="join-form" id="jitt-joinForm" action="https://formspree.io/f/YOUR_ID" novalidate>
```

The JavaScript detects `action` and submits in the background.

## Editing it later

- **Colours** — the `:root`-equivalent block at the top of `<style>`, on
  `#jitt`. `--accent` is the olive used on every button.
- **Copy** — in the HTML at the top of the file, each section commented.
- **Contact** — search for `hello@jittathletics.com`.
- **Social links** — footer, marked `EDIT ME`, currently `#`.

Regenerate both files after changing the source site with:

```bash
python3 tools/build_carrd_embed.py
```

## Still placeholders

- **Images** are crops from the design mockup — low resolution, replace with
  real photography.
- **The logo** is recovered from the mockup as a PNG; ask your designer for the
  vector SVG.
- **Shop now / cart** have no store behind them.
- **Watch now / See events** point at `#`.
