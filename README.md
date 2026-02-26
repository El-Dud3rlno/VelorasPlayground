# Velora Proving Ground Demo

Static multi-page demo that contrasts enterprise operations before and after Velora structured intelligence outputs.

## Run locally

### Option 1: open directly
Open `index.html` in your browser.

### Option 2: static server (recommended for fetch-based artifact loading)
From the repo root:

```bash
python3 -m http.server 8080
```

Then visit:
- `http://localhost:8080/index.html`
- `http://localhost:8080/public/index.html`
- `http://localhost:8080/portal/login.html`
- `http://localhost:8080/velora/index.html`

## Demo behavior
- Theme is persisted in `localStorage` key `velora_theme`.
- Demo mode (Before or After) is persisted in `localStorage` key `velora_demo_mode`.
- Mock portal session is persisted in `localStorage` key `velora_session`.

## Self-tests
A lightweight self-test script is included at `/assets/selftest.js`.

Run in browser devtools console on any page served by the static server:

```js
await import('/assets/selftest.js')
```

Expected checks:
- localStorage keys exist after toggles
- `/velora/artifacts/howtos.json` loads and is an array
- rag chunk search finds results for `segment`
