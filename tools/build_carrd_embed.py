import re, os, base64

SRC = "/home/user/JITT-athletics-"
OUT = os.path.join(SRC, "carrd")
R   = "jitt"
FONT_IMPORT = ("@import url('https://fonts.googleapis.com/css2?"
               "family=Oswald:wght@700&family=Caveat:wght@700&"
               "family=Inter:wght@300;400;500;600;700&display=swap');")

# Carrd styles bare elements (h1, p, a, img...). A direct element rule beats an
# inherited value no matter the specificity, so every one has to be overridden
# explicitly inside the embed.
RESET = f"""
/* ---- shield: stop Carrd's element styles reaching inside the embed ---- */
#{R}, #{R} *, #{R} *::before, #{R} *::after {{ box-sizing: border-box; }}
#{R} h1, #{R} h2, #{R} h3, #{R} h4, #{R} p, #{R} ul, #{R} ol, #{R} li,
#{R} dl, #{R} dt, #{R} dd, #{R} figure, #{R} blockquote, #{R} form, #{R} label {{
  margin: 0; padding: 0; color: inherit; font: inherit;
  letter-spacing: inherit; text-transform: none; text-align: inherit;
  list-style: none; background: none; border: 0;
}}
#{R} a {{ color: inherit; text-decoration: none; background: none; border: 0; }}
#{R} img, #{R} svg {{ display: block; max-width: 100%; border: 0; }}
#{R} button, #{R} input, #{R} select, #{R} textarea {{
  font: inherit; color: inherit; margin: 0; text-transform: none;
}}
"""

# Placed last so it can't be undone by the body-derived `margin: 0`.
BREAKOUT = f"""
/* ---- full-bleed: break out of Carrd's centred container ----
   Resolves to 0 when the section is already full width, so it is safe either
   way. If a horizontal scrollbar appears, set the Carrd section width to
   "Full" and change width:100vw to width:100%. */
#{R} {{
  width: 100vw; max-width: 100vw;
  margin-left: calc(50% - 50vw); margin-right: 0;
  text-align: left;
}}
"""

# ------------------------------------------------------------------ CSS
def split_blocks(css):
    out, i, n = [], 0, len(css)
    while i < n:
        m = re.match(r'\s*(/\*.*?\*/\s*)*', css[i:], re.S)
        if m and m.group(0):
            out.append(('RAW', m.group(0))); i += len(m.group(0))
            if i >= n: break
        j = css.find('{', i)
        if j == -1: break
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        out.append(('RULE', prelude, css[j+1:k-1])); i = k
    return out

def scope_selector(sel):
    parts = []
    for s in (x.strip() for x in sel.split(',')):
        if not s: continue
        if s in (':root', 'body'):   parts.append(f'#{R}')
        elif s == 'html':            return None
        elif s.startswith('*'):      parts.append(f'#{R} {s}')
        elif s.startswith(f'#{R}'): parts.append(s)
        else:                        parts.append(f'#{R} {s}')
    return ', '.join(parts) if parts else None

def scope_css(css):
    res = []
    for blk in split_blocks(css):
        if blk[0] == 'RAW': res.append(blk[1]); continue
        _, prelude, body = blk
        low = prelude.lower()
        if low.startswith('@font-face'): continue
        if low.startswith('@keyframes'): res.append(f'{prelude} {{{body}}}\n'); continue
        if low.startswith(('@media', '@supports')):
            res.append(f'{prelude} {{\n{scope_css(body)}\n}}\n'); continue
        if low.startswith('@'): res.append(f'{prelude} {{{body}}}\n'); continue
        sel = scope_selector(prelude)
        if sel is None: continue
        res.append(f'{sel} {{{body}}}\n')
    return ''.join(res)

css = open(os.path.join(SRC, 'assets/css/styles.css'), encoding='utf-8').read()
scoped = FONT_IMPORT + "\n" + RESET + "\n" + scope_css(css) + "\n" + BREAKOUT

# ------------------------------------------------------------------ HTML
html = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
body = re.search(r'<a class="skip-link".*?(?=<script)', html, re.S).group(0)
IDS = ['siteHeader','nav','navToggle','cartBtn','main','top','movement','community',
       'shop','joinModal','joinForm','joinEmail','joinNote','joinTitle','year']
for i in IDS:
    body = re.sub(rf'\bid="{i}"', f'id="{R}-{i}"', body)
    body = re.sub(rf'href="#{i}"', f'href="#{R}-{i}"', body)
    body = re.sub(rf'aria-controls="{i}"', f'aria-controls="{R}-{i}"', body)
    body = re.sub(rf'aria-labelledby="{i}"', f'aria-labelledby="{R}-{i}"', body)
body = body.replace('src="assets/img/', 'src="IMGBASE/')
body = re.sub(r'\n\s*\n', '\n', body).strip()

# ------------------------------------------------------------------ JS
js = open(os.path.join(SRC, 'assets/js/main.js'), encoding='utf-8').read()
# rewrite lookups FIRST, then prepend helpers, so the bootstrap line survives
js = re.sub(r"document\.getElementById\('([^']+)'\)", r"byId('\1')", js)
js = re.sub(r"document\.querySelectorAll\(", "$$(", js)
js = re.sub(r"document\.querySelector\(", "$(", js)
HELPERS = (f"  var ROOT = window.document.getElementById('{R}');\n"
           "  if (!ROOT) return;\n"
           "  var $  = function (s) { return ROOT.querySelector(s); };\n"
           "  var $$ = function (s) { return ROOT.querySelectorAll(s); };\n"
           f"  var byId = function (s) {{ return ROOT.querySelector('#{R}-' + s); }};\n\n")
js = js.replace("  'use strict';\n", "  'use strict';\n\n" + HELPERS, 1)
js = js.replace("})();", """
  /* Carrd owns the page scroll, so drive in-page links from here. */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = ROOT.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(id) : id));
      if (!target) return;
      e.preventDefault();
      closeNav();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();""")

TPL = """<!-- =============================================================
     JITT ATHLETICS — Carrd embed
     Add Element ▸ Embed ▸ Type: Code ▸ Style: Inline, then paste all of this.
     ============================================================= -->
<div id="{r}">
{body}
</div>

<style>
{css}
</style>

<script>
{js}
</script>
"""

os.makedirs(OUT, exist_ok=True)
def write(path, imgbase=None, inline=False):
    b = body
    if inline:
        for name in ['jitt-logo.png','hero.jpg','podcast.jpg','runclub.jpg','products.jpg']:
            p = os.path.join(SRC, 'carrd/img', name)
            if not os.path.exists(p): p = os.path.join(SRC, 'assets/img', name)
            mime = 'image/png' if name.endswith('.png') else 'image/jpeg'
            d = base64.b64encode(open(p, 'rb').read()).decode()
            b = b.replace(f'src="IMGBASE/{name}"', f'src="data:{mime};base64,{d}"')
    else:
        b = b.replace('IMGBASE/', imgbase)
    out = TPL.format(r=R, body=b, css=scoped, js=js)
    open(path, 'w', encoding='utf-8').write(out)
    return len(out)

n1 = write(os.path.join(OUT, 'embed.html'), 'PASTE_IMAGE_URL_HERE/')
n2 = write(os.path.join(OUT, 'embed-selfcontained.html'), inline=True)
print(f"carrd/embed.html               {n1/1024:6.0f} KB  (needs image URLs)")
print(f"carrd/embed-selfcontained.html {n2/1024:6.0f} KB  (images baked in, one paste)")
