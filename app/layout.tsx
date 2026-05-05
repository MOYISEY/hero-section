import type { Metadata, Viewport } from "next"
import { Manrope, Lora, JetBrains_Mono } from "next/font/google"
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

const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif-editorial",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NeuralBrief — ТЗ за пять минут вместо двух часов",
  description:
    "AI-ассистент веб-студии. Задаёт нужные вопросы, понимает цели и формирует техническое задание автоматически.",
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
    title: "NeuralBrief — ТЗ за пять минут вместо двух часов",
    description:
      "AI-ассистент веб-студии. Задаёт нужные вопросы и формирует ТЗ автоматически.",
    locale: "ru_RU",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#16131f",
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
      className={`dark bg-background ${manrope.variable} ${lora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
        <SiteNav />
        <main className="flex-1 nb-page-enter">{children}</main>
        <SiteFooter />
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.20 0.025 280)",
              border: "1px solid oklch(0.30 0.025 280)",
              color: "oklch(0.965 0.008 280)",
            },
          }}
        />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
