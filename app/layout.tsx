import type { Metadata } from 'next'
import { Lora, Poppins } from 'next/font/google'
import './globals.css'

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: "Contact Us — Abhijit's Consulting",
  description: 'Submit your details and our AI voice agent will call you back instantly.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} ${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0C1928]">{children}</body>
    </html>
  )
}
