import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// E.164: + then non-zero country digit then 6–14 more digits
const PHONE_RE = /^\+[1-9]\d{6,14}$/

// Rate limiter: max 3 call requests per IP per hour (sliding window)
// Gracefully skipped if Upstash env vars are not configured
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'retell:contact',
  })
}

export async function POST(req: NextRequest) {
  // ── 1. Rate limiting ──────────────────────────────────────────────────────
  if (ratelimit) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous'
    const { success, limit, reset } = await ratelimit.limit(ip)

    if (!success) {
      const waitMinutes = Math.ceil((reset - Date.now()) / 60_000)
      return NextResponse.json(
        {
          error: `You've used all ${limit} call requests for this hour. Please try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`,
          code: 'RATE_LIMITED',
          retryAfterMinutes: waitMinutes,
        },
        { status: 429 }
      )
    }
  }

  // ── 2. Parse body safely ──────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, email, phone, reason, website } = body as Record<string, string>

  // ── 3. Honeypot — bots fill this, humans don't ────────────────────────────
  if (website) {
    return NextResponse.json({ call_id: 'ok' })
  }

  // ── 4. Presence check ─────────────────────────────────────────────────────
  if (!name || !email || !phone || !reason) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  // ── 5. Type check ─────────────────────────────────────────────────────────
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string' ||
    typeof reason !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // ── 6. Length limits ──────────────────────────────────────────────────────
  if (name.length > 100 || email.length > 200 || phone.length > 30 || reason.length > 1000) {
    return NextResponse.json({ error: 'One or more inputs are too long.' }, { status: 400 })
  }

  // ── 7. Format validation ──────────────────────────────────────────────────
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: 'That doesn\'t look like a valid email address.' },
      { status: 400 }
    )
  }

  const cleanPhone = phone.replace(/[\s\-()\u00A0]/g, '')
  if (!PHONE_RE.test(cleanPhone)) {
    return NextResponse.json(
      {
        error:
          'Phone number must include your country code — e.g. +919876543210 (India) or +14155552671 (US).',
      },
      { status: 400 }
    )
  }

  // ── 8. Read secrets — server-side only, never sent to browser ─────────────
  const apiKey = process.env.RETELL_API_KEY
  const fromNumber = process.env.RETELL_FROM_NUMBER
  const agentId = process.env.RETELL_AGENT_ID

  if (!apiKey || !fromNumber || !agentId) {
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    )
  }

  // ── 9. Call RetellAI ──────────────────────────────────────────────────────
  let retellRes: Response
  try {
    retellRes = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from_number: fromNumber,
        to_number: cleanPhone,
        override_agent_id: agentId,
        retell_llm_dynamic_variables: {
          name: name.trim(),
          phone_number: cleanPhone,
          email: email.trim().toLowerCase(),
          reason: reason.trim(),
        },
      }),
    })
  } catch {
    // Network error reaching RetellAI (DNS, timeout, etc.)
    return NextResponse.json(
      { error: 'Unable to connect to the calling service. Please try again in a moment.' },
      { status: 502 }
    )
  }

  if (!retellRes.ok) {
    // RetellAI returned an error — don't leak their internal messages
    return NextResponse.json(
      {
        error:
          'We couldn\'t place the call. Please double-check your phone number includes the country code and try again.',
      },
      { status: 400 }
    )
  }

  const data = await retellRes.json()
  return NextResponse.json({ call_id: data.call_id })
}
