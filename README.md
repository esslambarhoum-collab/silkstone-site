# Silkstone Fashion — website

Knitwear manufacturing in Egypt, for European and American retail. A Boldbridge Capital and Aletex Group partnership.

Static site: plain HTML, one stylesheet, a few small scripts. No build step.

## Preview

```
node serve.js
```

Then open http://localhost:4173. Any static server works; the site is just files.

## Pages

| File | Page |
|---|---|
| `index.html` | Landing |
| `about.html` | The two partners and the owner |
| `capabilities.html` | The seven stages, drawn; the floor plan; CM / CMT / FOB |
| `products.html` | The wardrobe: garments on a rail, spec, photo, 3D where a model exists |
| `quality.html` | Three inspections on the garment; the certificate wall |
| `traced-order.html` | One order followed from roll to carton |
| `egypt.html` | Routes, buyer's clocks, duty-free access, cotton |
| `techpack.html` | Tech pack generator, seven steps, print to A4 or send by email |
| `contact.html` | Three-step brief with a live sheet |
| `legal.html`, `404.html` | Legal and not-found |

## Assets

- `assets/styles.css` — all tokens and components. Palette: white, bone, ash, graphite, black; sand only as a background tint. Type: Archivo Black, Bodoni Moda italic, Archivo 300.
- `assets/site.js` — navigation, reveal on scroll, buttons, figures.
- `assets/process.js` — the drawings that draw themselves, the thread, the floor plan.
- `assets/draw/` — traced line drawings (SVG), fetched by `process.js`.
- `assets/img/` — photographs in WebP at 800 / 1400 / 2000 widths.
- `assets/models/` — GLB models for the 3D tab (T-shirt, hoodie so far).
- `assets/rail.js` — the WebGL rail, kept for when garment-on-hanger models exist. Not loaded.

## Still to come

Real factory photographs and film, the owner's portrait, certificate numbers, a WhatsApp number, legal entity details, 3D models for the long sleeve, polo, sweatshirt and joggers.
