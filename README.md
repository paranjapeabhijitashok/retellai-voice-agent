# RetellAI Voice Agent — Contact Form

Converts the **RetellAI_28Mar2026** n8n workflow into a standalone Next.js web app.

Users fill in a "Contact Us" form and the app instantly triggers an outbound AI voice call via the RetellAI API.

---

## Workflow Contract

**Original n8n workflow:** `RetellAI_28Mar2026` (ID: `1R9GwfJHL6zgMppf`)

The workflow used an n8n FormTrigger → RetellAI HTTP Request → Google Sheets log.
This app replaces the FormTrigger with a custom Next.js UI and calls RetellAI directly.

### Request — App → RetellAI (`POST /api/contact`)

```json
{
  "name": "Abhijit Paranjape",
  "email": "abhijit@example.com",
  "phone": "+919923384420",
  "reason": "I'd like to discuss building an AI agent for my business"
}
```

### RetellAI Call Payload (`POST https://api.retellai.com/v2/create-phone-call`)

```json
{
  "from_number": "+18254609024",
  "to_number": "<phone>",
  "override_agent_id": "agent_7202870cf0ecf50eb032f8a7eb",
  "retell_llm_dynamic_variables": {
    "name": "<name>",
    "phone_number": "<phone>",
    "email": "<email>",
    "reason": "<reason>"
  }
}
```

### Response — `/api/contact` → App

```json
{ "call_id": "call_xxx..." }
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `RETELL_API_KEY` | RetellAI Bearer token |
| `RETELL_FROM_NUMBER` | Caller number (e.g. `+18254609024`) |
| `RETELL_AGENT_ID` | RetellAI agent ID |

Copy `.env.local.example` to `.env.local` and fill in values (or use `vercel env pull`).

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy on Vercel

1. Push to GitHub
2. Import repo at vercel.com → New Project
3. Add environment variables in the Vercel dashboard
4. Deploy

Any `git push` to `main` auto-deploys.

---

## Stack

- Next.js 16 + React 19
- Tailwind CSS v4
- RetellAI v2 API
