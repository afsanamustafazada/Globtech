# GlobTech Website Refresh

Static multilingual rebuild for GlobTech Consulting & Engineering.

## Files

- `index.html` - one-page site structure
- `projects.html` - project listing page
- `project-araz-supermarket.html` - Araz Supermarket project detail page with photo catalog
- `erp-demo.html` - separate ERP demo information page
- `assets/css/styles.css` - responsive visual system
- `assets/js/app.js` - AZ/RU/EN translations and navigation behavior
- `assets/images/globtech-hero.png` - generated hero visual used by the first screen
- `assets/images/slider/erp-demo-slide.png` - homepage slider image supplied for the demo slide
- `assets/images/projects/araz-supermarket/` - project gallery visuals

## Preview

For the static pages only, open `index.html` in a browser. Language can be switched with the AZ/RU/EN control, or by using:

- `index.html?lang=az`
- `index.html?lang=ru`
- `index.html?lang=en`

For the AI assistant panel, run the site through the Node server:

1. Copy `.env.example` to `.env`
2. Set `GEMINI_API_KEY`
3. Run `npm start`, or on this Windows workspace run `.\run-server.ps1`
4. Open `http://localhost:3000`

The Gemini key is used only by `server.js`; it is not exposed to frontend JavaScript.

## Admin Panel

Open `http://localhost:3000/admin.html` to edit common site content without touching code. The panel saves changes into `data/site-settings.json`; the website reads that file on load.

- For local use, the admin token can stay empty.
- For a public Node deployment, set `ADMIN_TOKEN` in `.env` and enter that token in the admin panel before saving.

## Source Notes

Content direction was based on the current public site at `https://gtcoen.com/`: IT systems,
access control, design, cloud and DevOps, fire alarm systems, standards, contacts, and company
positioning.
