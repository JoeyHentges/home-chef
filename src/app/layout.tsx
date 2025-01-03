import type { Metadata } from "next"
import { Inter, Nova_Slim } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import "@/styles/globals.css"

import { Providers } from "@/providers"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { TailwindIndicator } from "@/components/tailwind-indicator"

const fontBase = Inter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-base",
})

const fontHeader = Nova_Slim({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-header",
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background font-base antialiased",
          fontBase.variable,
          fontHeader.variable
        )}
      >
        <Providers>
          <NuqsAdapter>{children}</NuqsAdapter>
          <TailwindIndicator />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
