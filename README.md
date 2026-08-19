# Earthbound Inc. — Quote Request Form

A rebuild of Earthbound's Typeform (`oDOWHJbD`) as an OBG quote form, so their leads
land in our stack instead of Typeform's.

It is a **reproduction, not a redesign**. That Typeform has 921 completed responses
behind it and is the shop's main lead intake, so the copy, question order, branching,
images, fonts, colours and spacing are all taken from the Typeform API and from
`getComputedStyle` on the live form. Anything in here that looks like an improvement
is a regression.

- Theme `KITfG4JN`: Quantico, question `#2E3035`, answer `#037EB4`, button `#008AC8`,
  ground `#F3F3F0`
- 50/50 split with the photo on the right, full viewport height
- All 13 questions, and the single Q1 branch for **Live on Site Printing**

## Wiring

| Concern | Where it goes |
|---|---|
| Lead email | `obg-mail-api` `/api/send_lead`, `shop_id: earthbound` |
| Artwork | Firebase Storage, `crypto.randomUUID()` path, 25MB cap, type allowlist |
| Conversion | `postMessage` to the parent page, capped tiered value ladder |

No secrets live in this repo or on its Netlify site. The Firebase web config is
designed to ship client-side; OBG's Gmail credential stays on our own Vercel.

## Local

```bash
npm install
npm run dev      # or: npm run build && npx vite preview
```

`.env.local` carries the `VITE_FIREBASE_*` values and is gitignored. The same values
must be set on the Netlify site or artwork uploads silently fail.
