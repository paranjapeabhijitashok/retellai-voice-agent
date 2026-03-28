import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, phone, reason } = await req.json()

  if (!name || !email || !phone || !reason) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

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
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from_number: fromNumber,
      to_number: phone,
      override_agent_id: agentId,
      retell_llm_dynamic_variables: {
        name,
        phone_number: phone,
        email,
        reason,
      },
    }),
  })

  const data = await retellRes.json()

  if (!retellRes.ok) {
    const message = data?.message || data?.error || 'Failed to initiate call.'
    return NextResponse.json({ error: message }, { status: retellRes.status })
  }

  return NextResponse.json({ call_id: data.call_id })
}
