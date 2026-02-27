# Velora's Playground

A pure static demo website designed for storytelling walkthroughs.

## Run

Open directly:
- `index.html`

Or use a static server:

```bash
python3 -m http.server 8080
```

Then visit:
- `http://localhost:8080/index.html`
- `http://localhost:8080/pipeline.html`
- `http://localhost:8080/activity.html`
- `http://localhost:8080/insights.html`

## Demo notes
- Contacts are shown as cinematic cards on the home page.
- Clicking a contact opens FOE activity records in a side drawer.
- Data is seeded into `localStorage` and no backend is used.
- Theme preference is stored in `localStorage` key `crm_theme`.
