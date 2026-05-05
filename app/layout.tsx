import type { Metadata, Viewport } from "next"
import { Manrope, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans-display",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-tech",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NeuralBrief — техническое задание из диалога",
  description:
    "AI-ассистент веб-студии. Превращает разговор с клиентом в подробное техническое задание за пять минут.",
  generator: "v0.app",
  applicationName: "NeuralBrief",
  keywords: [
    "ТЗ для сайта",
    "AI бриф",
    "техническое задание",
    "веб-студия",
    "NeuralBrief",
  ],
  openGraph: {
    title: "NeuralBrief — техническое задание из диалога",
    description:
      "AI-ассистент веб-студии. Задаёт нужные вопросы и формирует ТЗ автоматически.",
    locale: "ru_RU",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0c1220",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`bg-background ${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background text-foreground">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.22 0.022 248)",
              border: "1px solid oklch(0.32 0.020 248)",
              color: "oklch(0.96 0.008 230)",
            },
          }}
        />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
