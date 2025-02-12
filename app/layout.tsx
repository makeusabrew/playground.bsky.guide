import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <header className="sticky top-0 z-50 w-full border-b  bg-white">
          <div className="container flex h-14 max-w-7xl items-center px-6">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-500/90"
                >
                  <span className="text-blue-500 font-semibold drop-shadow-[0_0_0.3rem_#0000ff70]">bsky.guide</span>
                </Link>
                <span className="text-muted-foreground/60">/</span>
                <span className="font-medium">Bluesky Jetstream Playground</span>
              </div>
              <a
                href="https://bsky.app/profile/makeusabrew.bsky.social"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                @makeusabrew
              </a>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
