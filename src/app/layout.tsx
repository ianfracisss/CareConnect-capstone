import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AlertProvider } from "@/components/AlertProvider"
import { Providers } from "./providers"
import ThemeToggle from "@/components/ThemeToggle"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Care Connect",
  description: "CSU Peer Support Group Referral System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AlertProvider>
            {/* Header */}
            <header className="flex justify-end p-4">
              <ThemeToggle />
            </header>

            {children}
          </AlertProvider>
        </Providers>
      </body>
    </html>
  )
}
