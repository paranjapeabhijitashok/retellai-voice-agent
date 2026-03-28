'use client'

import { useState } from 'react'

type Step = 'form' | 'calling' | 'success' | 'error'

function PhoneWaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 .82h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      <path d="M14.5 1a9 9 0 0 1 8.5 8.5" />
      <path d="M14.5 5a5 5 0 0 1 4.5 4.5" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" className={className}>
      <polygon points="12,2.5 14.8,9.3 22,10.2 16.8,15.1 18.3,22 12,18.5 5.7,22 7.2,15.1 2,10.2 9.2,9.3" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function Home() {
  const [step, setStep] = useState<Step>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [callId, setCallId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('calling')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, reason }),
      })
      const data = await res.json()

      if (res.ok && data.call_id) {
        setCallId(data.call_id)
        setStep('success')
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setStep('error')
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setStep('error')
    }
  }

  const handleReset = () => {
    setStep('form')
    setName('')
    setEmail('')
    setPhone('')
    setReason('')
    setErrorMsg('')
    setCallId('')
  }

  return (
    <main className="min-h-screen bg-[#0C1928] flex flex-col font-[family-name:var(--font-poppins)]">

      {/* Header */}
      <header className="border-b border-[#1A2E45] px-6 py-4 flex-shrink-0">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <StarIcon className="w-6 h-6 text-[#C46B3A] flex-shrink-0" />
          <div className="w-px h-6 bg-[#C46B3A]/30 flex-shrink-0" />
          <div className="leading-none">
            <span className="text-white font-[family-name:var(--font-lora)] text-[15px] font-medium">Abhijit&apos;s</span>
            <span className="block text-[#3D4F63] text-[8px] tracking-[0.22em] uppercase mt-0.5">Consulting</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-10">

        {step === 'form' && (
          <>
            <div className="mb-8">
              <p className="text-[#C46B3A] text-[10px] tracking-[0.25em] uppercase font-medium mb-3">
                AI Voice Agent
              </p>
              <h1 className="font-[family-name:var(--font-lora)] text-[28px] font-semibold text-white leading-snug mb-3">
                We&apos;ll call you back<br />in seconds.
              </h1>
              <p className="text-[#3D4F63] text-sm leading-relaxed">
                Fill in your details below and our AI voice agent will call you instantly — no hold music, no waiting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#3D4F63] text-[10px] tracking-[0.18em] uppercase mb-2">Your Name</label>
                <input type="text" placeholder="e.g. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-[#1A2E45]/30 border border-[#1A2E45] rounded-lg px-4 py-3 text-white placeholder-[#3D4F63]/60 text-sm focus:outline-none focus:border-[#C46B3A]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[#3D4F63] text-[10px] tracking-[0.18em] uppercase mb-2">Email Address</label>
                <input type="email" placeholder="e.g. priya@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#1A2E45]/30 border border-[#1A2E45] rounded-lg px-4 py-3 text-white placeholder-[#3D4F63]/60 text-sm focus:outline-none focus:border-[#C46B3A]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[#3D4F63] text-[10px] tracking-[0.18em] uppercase mb-2">Phone Number</label>
                <input type="tel" placeholder="e.g. +91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full bg-[#1A2E45]/30 border border-[#1A2E45] rounded-lg px-4 py-3 text-white placeholder-[#3D4F63]/60 text-sm focus:outline-none focus:border-[#C46B3A]/50 transition-colors" />
                <p className="text-[#3D4F63] text-[10px] mt-1.5 ml-1">Include country code — e.g. +1 for US, +44 for UK, +91 for India</p>
              </div>
              <div>
                <label className="block text-[#3D4F63] text-[10px] tracking-[0.18em] uppercase mb-2">Reason for Contacting</label>
                <textarea placeholder="e.g. I'd like to discuss building an AI agent for my business" value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} className="w-full bg-[#1A2E45]/30 border border-[#1A2E45] rounded-lg px-4 py-3 text-white placeholder-[#3D4F63]/60 text-sm focus:outline-none focus:border-[#C46B3A]/50 transition-colors resize-none" />
              </div>
              <button type="submit" disabled={!name.trim() || !email.trim() || !phone.trim() || !reason.trim()} className="w-full bg-[#C46B3A] hover:bg-[#D4794A] disabled:bg-[#1A2E45] disabled:cursor-not-allowed text-white disabled:text-[#3D4F63] font-semibold rounded-lg py-3.5 text-sm tracking-wide transition-colors flex items-center justify-center gap-2">
                <PhoneWaveIcon className="w-4 h-4" />
                Request a Call
              </button>
              <p className="text-center text-[#3D4F63] text-xs">Our AI agent will call you within seconds of submitting</p>
            </form>
          </>
        )}

        {step === 'calling' && (
          <div className="py-20 text-center">
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="w-16 h-16 border-[1.5px] border-[#C46B3A] border-t-transparent rounded-full animate-spin" />
              <PhoneWaveIcon className="absolute w-6 h-6 text-[#C46B3A]" />
            </div>
            <h2 className="font-[family-name:var(--font-lora)] text-2xl text-white mb-3">Connecting your call…</h2>
            <p className="text-[#3D4F63] text-sm leading-relaxed max-w-xs mx-auto">Our AI agent is dialling your number now. This usually takes less than 10 seconds.</p>
            <div className="flex justify-center gap-2 mt-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C46B3A] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 border border-[#C46B3A]/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="w-7 h-7 text-[#C46B3A]" />
            </div>
            <h2 className="font-[family-name:var(--font-lora)] text-2xl text-white mb-3">Your phone is ringing!</h2>
            <p className="text-[#3D4F63] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Our AI voice agent is calling <span className="text-white font-medium">{phone}</span> right now. Pick up — it&apos;s ready to help.
            </p>
            {callId && (
              <div className="inline-block border border-[#1A2E45] rounded-lg px-4 py-2 mb-8">
                <p className="text-[#3D4F63] text-[10px] tracking-[0.15em] uppercase mb-1">Call Reference</p>
                <p className="text-white font-mono text-xs">{callId}</p>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-[#3D4F63] text-xs max-w-xs mx-auto leading-relaxed">
                Missed the call? A summary will be sent to <span className="text-white">{email}</span>.
              </p>
              <button onClick={handleReset} className="text-[#3D4F63] hover:text-white text-xs py-2 transition-colors underline underline-offset-2">Submit another request</button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 border border-red-800/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-400 text-2xl font-light">!</span>
            </div>
            <h2 className="font-[family-name:var(--font-lora)] text-2xl text-white mb-3">Call failed</h2>
            <p className="text-[#3D4F63] text-sm leading-relaxed mb-2 max-w-xs mx-auto">{errorMsg}</p>
            <p className="text-[#3D4F63] text-xs mb-8 max-w-xs mx-auto">Please make sure your phone number includes the country code (e.g. +1, +44, +91).</p>
            <button onClick={handleReset} className="bg-[#C46B3A] hover:bg-[#D4794A] text-white font-semibold rounded-lg px-8 py-3.5 text-sm tracking-wide transition-colors">Try Again</button>
          </div>
        )}

      </div>

      <footer className="border-t border-[#1A2E45] px-6 py-4 flex-shrink-0">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <p className="text-[#3D4F63] text-xs">Smart systems. Real results. 24/7.</p>
          <p className="text-[#3D4F63] text-xs">abhijitparanjape.in</p>
        </div>
      </footer>

    </main>
  )
}
