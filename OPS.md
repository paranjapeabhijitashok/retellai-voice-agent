# app3 — Operations Guide

## What this app does

A "Contact Us" form that triggers an outbound AI voice call via RetellAI the moment someone submits their details. No hold music. No waiting. The AI agent calls the user back in seconds.

**Flow:**
```
User fills form → POST /api/contact → RetellAI API → AI calls user's phone
```

Fields collected: Name · Email · Phone (with country code) · Reason for contacting

---

## Testing Locally

### One-time setup

```bash
cd n8n-to-app/app3
npm install
```

Make sure `.env.local` exists with the three variables (it was created for you — see below).

### Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Test the form

1. Fill in all four fields
2. For phone, use a real number that can receive calls (yours, or a test number)
3. Include the country code — e.g. `+91 98765 43210` for India
4. Click **Request a Call**
5. Your phone should ring within ~10 seconds
6. Check the RetellAI dashboard at **https://app.retellai.com** → Calls to see the call log

### What counts as a successful test

- Form submits without a network error
- The loading spinner ("Connecting your call…") appears
- Success screen shows with a **Call Reference ID** (e.g. `call_abc123...`)
- Your phone actually rings

### Common local issues

| Problem | Fix |
|---|---|
| "Server configuration error" | `.env.local` is missing or has wrong variable names |
| "Failed to initiate call" | Phone number format wrong — must include `+` and country code |
| Call never comes | RetellAI agent or from-number may be misconfigured in the RetellAI dashboard |
| Port 3000 in use | Run `npm run dev -- -p 3001` and open localhost:3001 |

---

## Changing Config Values

All three RetellAI values live in **`.env.local`** for local dev and in the **Vercel dashboard** for production.

### `RETELL_FROM_NUMBER` — the number that calls the user

This is your RetellAI-provisioned outbound number.

**To change locally:**
Open `n8n-to-app/app3/.env.local` and update:
```
RETELL_FROM_NUMBER=+1XXXXXXXXXX
```
Restart `npm run dev` — Next.js picks up env changes on restart.

**To change on Vercel:**
1. Go to vercel.com → your project → **Settings** → **Environment Variables**
2. Find `RETELL_FROM_NUMBER` → click the three-dot menu → **Edit**
3. Update the value → **Save**
4. **Redeploy** — env var changes only take effect on the next deployment
   - Either push a small commit, or go to **Deployments** → latest → **Redeploy**

---

### `RETELL_AGENT_ID` — which AI agent script handles the call

This controls the AI's personality, script, and dynamic variables.

**To change locally:**
```
RETELL_AGENT_ID=agent_XXXXXXXXXXXXXXXXXX
```
Find your agent IDs at: **https://app.retellai.com** → Agents

**To change on Vercel:** Same steps as above (Settings → Environment Variables → Edit → Redeploy).

---

### `RETELL_API_KEY` — your RetellAI API key

Only change this if you rotate your API key in RetellAI.

Find it at: **https://app.retellai.com** → API Keys

---

## Dynamic Variables

The app passes four variables to the RetellAI agent at call time. Your agent script can reference them:

| Variable | Value passed |
|---|---|
| `name` | What the user typed in "Your Name" |
| `email` | What the user typed in "Email Address" |
| `phone_number` | What the user typed in "Phone Number" |
| `reason` | What the user typed in "Reason for Contacting" |

In your RetellAI agent script, reference these as `{{name}}`, `{{email}}`, etc.

---

## Web and Mobile

This app is a **responsive web app** — it works on both desktop browsers and mobile browsers out of the box. No separate mobile app is needed.

### How it's mobile-ready

| Feature | How |
|---|---|
| Full-width on small screens | `max-w-xl mx-auto w-full px-6` — fills the screen on mobile, centres on desktop |
| Large touch targets | All buttons use `py-3.5` (56px height) — Apple/Google minimum is 44px |
| Native inputs | Standard `<input type="tel">` — mobile browsers show the phone keypad automatically |
| Viewport-safe | No horizontal scroll, no fixed pixel widths |
| Fast load | No JavaScript frameworks beyond React — minimal bundle |

### Testing on mobile

**Option A — your phone on the same Wi-Fi:**
1. Run `npm run dev`
2. Find your computer's local IP: `ipconfig getifaddr en0` (Mac)
3. Open `http://192.168.x.x:3000` on your phone

**Option B — ngrok tunnel (works over any network):**
```bash
npx ngrok http 3000
```
Opens a public HTTPS URL — share it with anyone to test.

**Option C — deploy to Vercel** (production URL, works everywhere):
Once deployed, open the Vercel URL on your phone.

### Making it installable as a home-screen app (PWA)

The app currently works in mobile browsers but isn't installable. To make it installable (shows "Add to Home Screen" prompt), add a `manifest.json` and a service worker. Ask me to do this when needed — it takes about 10 minutes.

---

## File Map

```
app3/
  app/
    layout.tsx          ← fonts, metadata, body tag
    page.tsx            ← all UI: form, loading, success, error states
    globals.css         ← Tailwind CSS import
    api/
      contact/
        route.ts        ← server-side: receives form data, calls RetellAI API
  .env.local            ← secrets (NOT committed to git)
  .gitignore            ← ensures .env.local stays out of git
  package.json          ← Next.js 16 + React 19 + Tailwind v4
  README.md             ← webhook contract and deploy instructions
  OPS.md                ← this file
```

---

## Deployment Checklist

- [ ] `npm run dev` — form loads at localhost:3000
- [ ] Submit form with real phone → call received
- [ ] Success screen shows Call Reference ID
- [ ] Error state works (try submitting with phone = `abc`)
- [ ] GitHub: `paranjapeabhijitashok/retellai-voice-agent`
- [ ] Vercel: import repo → set 3 env vars → deploy
- [ ] Test on mobile browser after deploy
