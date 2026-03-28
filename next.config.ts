import type { NextConfig } from 'next'

const config: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent page being embedded in iframes (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop browsers guessing content type (MIME sniffing)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Only send origin in referrer header, never full URL
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable camera, mic, location access
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default config
