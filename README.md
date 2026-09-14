# Silkstone Fashion website

Static site, no build step. Plain HTML, one stylesheet, one script.

## Run locally

```bash
node serve.js
```

Then open http://localhost:4173. The server also returns 404.html for missing pages. Opening the HTML files directly from disk works for everything except the 3D models, which need a server.

## Structure

- `index.html`, `about.html`, `capabilities.html`, `products.html`, `quality.html`, `traced-order.html`, `egypt.html`, `techpack.html`, `contact.html`, `404.html`
- `assets/styles.css` design tokens, components, print styles for the tech pack
- `assets/site.js` loader, nav, reveal, stitched process line, wardrobe, department tabs, contact conversation
- `assets/img/` photographs. Garment and location images are generated placeholders until the shoot. `world.svg` is a public-domain low-resolution map from Wikimedia Commons.
- `assets/logos/` Silkstone (`silkstone.svg` traced from the JPEG, transparent), partner, client and certification logos
- `assets/models/` compressed GLB models for the 3D viewer
- `robots.txt`, `sitemap.xml`, `llms.txt` for search and AI crawlers

## Design

Greys only: white, bone `#F3F1EC` as the ground, ash `#9B978F`, graphite `#4A4844`, black `#151513`. Sand `#E9E3D8` appears only as an occasional background. Type is Zen Kaku Gothic New 300, 400 and 500 from Google Fonts. Depth comes from one soft shadow on objects that hang, and from photographs. No cards, no pills, no accent colour.

## Content rules

- Only confirmed facts. Unconfirmed values read "to confirm" or "on request".
- No generated factory or people images. Placeholders stay until real photographs exist.
- Client logos appear only with the brand's permission. Certificate numbers are shown on request until the PDFs are collected.

## Open items

- Contact and tech pack forms send by `mailto:`. A form backend (Formspree, Web3Forms or similar) should replace this before launch.
- WhatsApp number, certificate numbers, Ziad's portrait, team section, factory photography and film.
- Sweatshirt 3D model.
- Company profile and product catalogue PDFs, rebuilt to this design.
- The ISO badges in `assets/logos` are generic and should be replaced by the certification body's mark.
