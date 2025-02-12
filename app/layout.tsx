import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Bluesky Jetstream Playground',
  description: 'Explore and experiment with the Bluesky Jetstream Firehose and HTTP APIs',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center max-w-7xl px-6">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="https://bsky.guide"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-500/90"
                >
                  <span className="text-blue-500 font-semibold drop-shadow-[0_0_0.3rem_#0000ff70]">bsky.guide</span>
                </Link>
                <span className="text-muted-foreground/60">/</span>
                <span className="font-medium text-muted-foreground">Bluesky Jetstream Playground</span>
              </div>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
