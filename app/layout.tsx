import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { PostHogProvider } from './providers/posthog'

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
        <PostHogProvider>
          <header className="sticky top-0 z-50 w-full border-b  bg-white">
            <div className="container flex h-14 max-w-7xl items-center px-6 mx-auto">
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link
                    href="https://bsky.guide"
                    className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-500/90"
                  >
                    <span className="text-blue-500 font-semibold drop-shadow-[0_0_0.3rem_#0000ff70]">bsky.guide</span>
                  </Link>
                  <span className="text-muted-foreground/60">/</span>
                  <span className="font-medium tracking-tight">Bluesky Jetstream Playground</span>
                </div>
              </div>
            </div>
          </header>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
