import { NextRequest, NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// E.164: + then country digit then 6-14 more digits
const PHONE_RE = /^\+[1-9]\d{6,14}$/

export async function POST(req: NextRequest) {
  // 1. Parse body safely — malformed JSON must not crash the server
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, email, phone, reason, website } = body as Record<string, string>

  // 2. Honeypot — visible only to bots, humans never fill it
  //    Silently "succeed" so bots don't know they were blocked
  if (website) {
    return NextResponse.json({ call_id: 'ok' })
  }

  // 3. Presence check
  if (!name || !email || !phone || !reason) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  // 4. Type check — reject non-string values
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string' ||
    typeof reason !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // 5. Length limits — prevent oversized payloads reaching RetellAI
  if (name.length > 100 || email.length > 200 || phone.length > 30 || reason.length > 1000) {
    return NextResponse.json({ error: 'Input is too long.' }, { status: 400 })
  }

  // 6. Format validation
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // Strip spaces, dashes, parentheses before validating E.164
  const cleanPhone = phone.replace(/[\s\-() ]/g, '')
  if (!PHONE_RE.test(cleanPhone)) {
    return NextResponse.json(
      { error: 'Phone must be in international format — e.g. +919876543210 or +14155552671' },
      { status: 400 }
    )
  }

  // 7. Read secrets server-side — never exposed to client
  const apiKey = process.env.RETELL_API_KEY
  const fromNumber = process.env.RETELL_FROM_NUMBER
  const agentId = process.env.RETELL_AGENT_ID

  if (!apiKey || !fromNumber || !agentId) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const retellRes = await fetch('https://api.retellai.com/v2/create-phone-call', {
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

  if (!retellRes.ok) {
    // 8. Never leak raw RetellAI error messages to the client
    return NextResponse.json(
      { error: 'Failed to initiate call. Please check your phone number and try again.' },
      { status: 400 }
    )
  }

  const data = await retellRes.json()
  return NextResponse.json({ call_id: data.call_id })
}
