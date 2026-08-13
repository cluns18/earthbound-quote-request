# Rogue Lab Quote Request

Multi-step lead form for Rogue Lab (roguelabmfg.com), embedded via iframe on the Google Ads
landing pages. Cloned from the proven AZ Hot Tees / Blink Threads converter.

- 5 steps: name, project, quantity, artwork (optional), contact.
- Leads route to the central OBG mail service (`obg-mail-api`, `POST /api/send_lead`,
  `shop_id: roguelab`). No secrets in this repo.
- Conversions fire on the parent Shopify page via postMessage (see THEME-EMBED-SNIPPET.html):
  form submit -> Submit Quote Form, success-screen call button -> Call Button Click.
- Imagery + logo served from Rogue's Shopify CDN. Brand: charcoal #121212 + gold #bd9a5f.

## Dev
    npm install
    npm run dev        # form at localhost:5173
    # open preview.html alongside to see it embedded like a page

## Deploy
Netlify (Chris's account, GitHub CI). Build `npm run build`, publish `dist`.
